const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../config/jwt');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

// Register Regular User
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, district, locationAddress } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Nama, email, dan password wajib diisi.', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email sudah terdaftar. Gunakan email lain atau silakan login.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || null,
        role: 'USER',
        district: district || 'Pangkajene',
        locationAddress: locationAddress || null,
        latitude: SIDRAP_DEFAULT_LAT,
        longitude: SIDRAP_DEFAULT_LNG,
        points: 50, // Welcome points
        level: 'Pembaca Pemula',
      },
    });

    // Award welcome activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        actionType: 'REGISTER',
        pointsEarned: 50,
        description: 'Mendaftar sebagai pembaca baru di platform MABBACA.',
      },
    });

    // Send welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Selamat Datang di MABBACA!',
        message: 'Temukan buku, perpustakaan, toko buku, dan komunitas literasi di Kabupaten Sidrap.',
        type: 'INFO',
        linkUrl: '/buku',
      },
    });

    const token = generateToken({ id: user.id, role: user.role });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      district: user.district,
      points: user.points,
      level: user.level,
    };

    return successResponse(res, 'Pendaftaran berhasil! Selamat datang di MABBACA.', { user: safeUser, token }, 201);
  } catch (error) {
    next(error);
  }
};

// Register Mitra (Status is set to PENDING awaiting Admin approval)
const registerMitra = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      organizationName,
      mitraType,
      address,
      district,
      village,
      description,
      phoneWa,
      latitude,
      longitude,
      openHours,
    } = req.body;

    if (!name || !email || !password || !organizationName || !mitraType || !address || !district) {
      return errorResponse(res, 'Data pendaftaran mitra belum lengkap. Mohon periksa kembali kolom wajib.', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse(res, 'Email sudah terdaftar.', 400);
    }

    // Generate unique slug for organization
    let slug = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const existingSlug = await prisma.mitraProfile.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone: phone || phoneWa || null,
        role: 'MITRA',
        district: district,
        locationAddress: address,
        latitude: latitude ? parseFloat(latitude) : SIDRAP_DEFAULT_LAT,
        longitude: longitude ? parseFloat(longitude) : SIDRAP_DEFAULT_LNG,
        mitraProfile: {
          create: {
            organizationName,
            slug,
            mitraType,
            address,
            district,
            village: village || null,
            latitude: latitude ? parseFloat(latitude) : SIDRAP_DEFAULT_LAT,
            longitude: longitude ? parseFloat(longitude) : SIDRAP_DEFAULT_LNG,
            phoneWa: phoneWa || phone,
            description: description || `Mitra literasi ${organizationName} di Kabupaten Sidrap.`,
            openHours: openHours || '08.00 - 17.00 WITA',
            status: 'PENDING',
          },
        },
      },
      include: {
        mitraProfile: true,
      },
    });

    const token = generateToken({ id: user.id, role: user.role });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      mitraProfile: user.mitraProfile,
    };

    return successResponse(
      res,
      'Pendaftaran mitra berhasil diajukan! Akun Anda sedang dalam proses verifikasi oleh Admin MABBACA.',
      { user: safeUser, token },
      201
    );
  } catch (error) {
    next(error);
  }
};

// Login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email dan password wajib diisi.', 400);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        mitraProfile: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'Email atau password salah.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Email atau password salah.', 401);
    }

    const token = generateToken({ id: user.id, role: user.role });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      district: user.district,
      points: user.points,
      level: user.level,
      mitraProfile: user.mitraProfile,
    };

    let loginMessage = 'Login berhasil. Selamat datang!';
    if (user.role === 'MITRA' && user.mitraProfile?.status === 'PENDING') {
      loginMessage = 'Login berhasil. Akun mitra Anda saat ini berstatus PENDING menunggu verifikasi Admin.';
    }

    return successResponse(res, loginMessage, { user: safeUser, token });
  } catch (error) {
    next(error);
  }
};

// Get current user profile
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
        locationAddress: true,
        district: true,
        latitude: true,
        longitude: true,
        points: true,
        level: true,
        createdAt: true,
        mitraProfile: true,
      },
    });

    return successResponse(res, 'Data pengguna berhasil diambil.', user);
  } catch (error) {
    next(error);
  }
};

// Update profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, bio, district, locationAddress, latitude, longitude } = req.body;

    const dataToUpdate = {};
    if (name) dataToUpdate.name = name;
    if (phone !== undefined) dataToUpdate.phone = phone;
    if (bio !== undefined) dataToUpdate.bio = bio;
    if (district) dataToUpdate.district = district;
    if (locationAddress !== undefined) dataToUpdate.locationAddress = locationAddress;
    if (latitude) dataToUpdate.latitude = parseFloat(latitude);
    if (longitude) dataToUpdate.longitude = parseFloat(longitude);

    if (req.file) {
      dataToUpdate.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: dataToUpdate,
      include: {
        mitraProfile: true,
      },
    });

    return successResponse(res, 'Profil berhasil diperbarui.', updatedUser);
  } catch (error) {
    next(error);
  }
};

// Change password
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Password saat ini dan password baru wajib diisi.', 400);
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 'Password baru minimal 6 karakter.', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Password saat ini tidak sesuai.', 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword },
    });

    return successResponse(res, 'Password berhasil diubah.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerMitra,
  login,
  getMe,
  updateProfile,
  changePassword,
};
