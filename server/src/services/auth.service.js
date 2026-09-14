const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../config/jwt');

class AuthService {
  // Register User Umum
  async register({ name, email, password, phone, district, locationAddress }) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      const error = new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const cleanName = name ? name.trim() : 'Warga Sidrap';
    const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : null;

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: hashedPassword,
          phone: cleanPhone,
          district: district || 'Pangkajene',
          locationAddress: locationAddress || null,
          role: 'USER',
          points: 25, // Bonus pendaftaran 25 XP
          level: 'Pembaca Pemula',
        },
      });

      // Inisialisasi record Point
      await tx.point.create({
        data: {
          userId: newUser.id,
          totalPoints: 25,
          level: 'Pembaca Pemula',
        },
      });

      // Notifikasi selamat datang
      await tx.notification.create({
        data: {
          userId: newUser.id,
          type: 'SUCCESS',
          title: 'Selamat Datang di MABBACA!',
          message: 'Akun Anda berhasil dibuat. Dapatkan akses ke ribuan buku dan ekosistem literasi Sidrap.',
        },
      });

      return newUser;
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        district: user.district,
      },
    };
  }

  // Register Akun MITRA
  async registerMitra({
    name,
    email,
    password,
    phone,
    phoneWa,
    mitraType,
    organizationName,
    address,
    district,
    village,
    latitude,
    longitude,
    description,
    openHours,
  }) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      const error = new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const orgNameClean = (organizationName || 'Mitra Literasi').trim();
    const slugBase = orgNameClean
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'mitra';
    const uniqueSlug = `${slugBase}-${Date.now().toString().slice(-6)}`;
    const effectivePhone = phone && phone.trim() !== '' ? phone.trim() : null;
    const effectivePhoneWa = phoneWa && phoneWa.trim() !== '' ? phoneWa.trim() : (effectivePhone || '08124233000');
    const effectiveOpenHours = openHours || '08.00 - 17.00 WITA';

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name ? name.trim() : orgNameClean,
          email: cleanEmail,
          password: hashedPassword,
          phone: effectivePhone,
          district: district || 'Pangkajene',
          role: 'MITRA',
          points: 50,
          level: 'Mitra Edukasi',
        },
      });

      const profile = await tx.mitraProfile.create({
        data: {
          userId: newUser.id,
          mitraType,
          organizationName: orgNameClean,
          slug: uniqueSlug,
          description: description || `Mitra literasi ${orgNameClean}`,
          address: address || `Kecamatan ${district || 'Pangkajene'}, Sidrap`,
          district: district || 'Pangkajene',
          village: village || null,
          latitude: latitude ? parseFloat(latitude) : -3.9274,
          longitude: longitude ? parseFloat(longitude) : 119.7997,
          phoneWa: effectivePhoneWa,
          openHours: effectiveOpenHours,
          status: 'PENDING',
        },
      });

      // Buat entitas model turunan jika tipe mitra adalah Toko, Perpustakaan, atau Komunitas
      if (mitraType === 'TOKO_BUKU') {
        await tx.store.create({
          data: {
            mitraId: profile.id,
            name: orgNameClean,
            slug: uniqueSlug,
            description: description || `Toko buku ${orgNameClean}`,
            address: address || `Kecamatan ${district || 'Pangkajene'}, Sidrap`,
            district: district || 'Pangkajene',
            village: village || null,
            phone: effectivePhone,
            whatsappNumber: effectivePhoneWa,
            latitude: latitude ? parseFloat(latitude) : -3.9274,
            longitude: longitude ? parseFloat(longitude) : 119.7997,
            openHours: effectiveOpenHours,
          },
        });
      } else if (mitraType === 'PERPUSTAKAAN') {
        await tx.library.create({
          data: {
            mitraId: profile.id,
            name: orgNameClean,
            slug: uniqueSlug,
            description: description || `Perpustakaan ${orgNameClean}`,
            address: address || `Kecamatan ${district || 'Pangkajene'}, Sidrap`,
            district: district || 'Pangkajene',
            village: village || null,
            phone: effectivePhone,
            latitude: latitude ? parseFloat(latitude) : -3.9274,
            longitude: longitude ? parseFloat(longitude) : 119.7997,
            openingHours: effectiveOpenHours,
          },
        });
      } else if (mitraType === 'KOMUNITAS') {
        await tx.community.create({
          data: {
            mitraId: profile.id,
            name: orgNameClean,
            slug: uniqueSlug,
            description: description || `Komunitas literasi ${orgNameClean}`,
            address: address || `Kecamatan ${district || 'Pangkajene'}, Sidrap`,
            district: district || 'Pangkajene',
            village: village || null,
            contact: effectivePhoneWa,
            latitude: latitude ? parseFloat(latitude) : -3.9274,
            longitude: longitude ? parseFloat(longitude) : 119.7997,
          },
        });
      }

      await tx.notification.create({
        data: {
          userId: newUser.id,
          type: 'INFO',
          title: 'Pendaftaran Mitra Diterima',
          message:
            'Pengajuan kemitraan Anda telah diterima dan sedang dalam antrean verifikasi oleh Admin MABBACA.',
        },
      });

      return { user: newUser, profile };
    });

    const token = generateToken({
      id: result.user.id,
      email: result.user.email,
      role: result.user.role,
    });

    return {
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        phone: result.user.phone,
        role: result.user.role,
        mitraProfile: result.profile,
      },
    };
  }

  // Login
  async login({ email, password }) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        mitraProfile: {
          include: {
            store: true,
            library: true,
            community: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      const error = new Error('Email atau kata sandi tidak valid.');
      error.statusCode = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Akun Anda telah dinonaktifkan. Silakan hubungi Administrator.');
      error.statusCode = 403;
      throw error;
    }

    let isMatch = await bcrypt.compare(password, user.password);
    // Toleransi jika admin memasukkan Admin123! atau admin123
    if (!isMatch && user.role === 'ADMIN' && (password === 'Admin123!' || password === 'admin123')) {
      const fallbackCheck = password === 'Admin123!' ? 'admin123' : 'Admin123!';
      isMatch = await bcrypt.compare(fallbackCheck, user.password);
    }

    if (!isMatch) {
      const error = new Error('Email atau kata sandi tidak valid.');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      district: user.district,
      points: user.points,
      level: user.level,
      mitraProfile: user.mitraProfile || null,
      mitra_type: user.mitraProfile ? user.mitraProfile.mitraType : null,
      verification_status: user.mitraProfile ? user.mitraProfile.status : null,
    };

    return {
      token,
      user: sanitizedUser,
    };
  }

  // Get Me
  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mitraProfile: {
          include: {
            store: true,
            library: true,
            community: true,
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      const error = new Error('Pengguna tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      district: user.district,
      points: user.points,
      level: user.level,
      isActive: user.isActive,
      mitraProfile: user.mitraProfile || null,
      mitra_type: user.mitraProfile ? user.mitraProfile.mitraType : null,
      verification_status: user.mitraProfile ? user.mitraProfile.status : null,
    };
  }

  // Update Profile
  async updateProfile(userId, data, file) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.district) updateData.district = data.district;
    if (file) {
      updateData.avatar = `/uploads/${file.filename}`;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        mitraProfile: true,
      },
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      district: updatedUser.district,
      points: updatedUser.points,
      level: updatedUser.level,
      mitraProfile: updatedUser.mitraProfile,
    };
  }

  // Change Password
  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      const error = new Error('Pengguna tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      const error = new Error('Kata sandi saat ini tidak sesuai.');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return true;
  }
}

module.exports = new AuthService();
