const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken } = require('../config/jwt');

class AuthService {
  // Register User Umum
  async register({ name, email, password, phone, district }) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('Email sudah terdaftar. Silakan gunakan email lain atau login.');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          district: district || 'Pangkajene',
          role: 'USER',
          points: 10, // Bonus pendaftaran
          level: 'Pembaca Pemula',
        },
      });

      // Inisialisasi record Point
      await tx.point.create({
        data: {
          userId: newUser.id,
          totalPoints: 10,
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
      },
    };
  }

  // Register Akun MITRA
  async registerMitra({
    name,
    email,
    password,
    phone,
    mitraType,
    organizationName,
    address,
    district,
    village,
    latitude,
    longitude,
    description,
  }) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('Email sudah terdaftar. Silakan gunakan email lain.');
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const slugBase = organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
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
          organizationName,
          slug: uniqueSlug,
          description: description || `Mitra literasi ${organizationName}`,
          address: address || `Kecamatan ${district || 'Pangkajene'}, Sidrap`,
          district: district || 'Pangkajene',
          village: village || null,
          latitude: latitude ? parseFloat(latitude) : -3.9274,
          longitude: longitude ? parseFloat(longitude) : 119.7997,
          phoneWa: phone,
          status: 'PENDING',
        },
      });

      // Buat entitas model turunan jika tipe mitra adalah Toko, Perpustakaan, atau Komunitas
      if (mitraType === 'TOKO_BUKU') {
        await tx.store.create({
          data: {
            mitraId: profile.id,
            name: organizationName,
            slug: uniqueSlug,
            description: description || `Toko buku ${organizationName}`,
            address: address || `Kecamatan ${district || 'Pangkajene'}, Sidrap`,
            district: district || 'Pangkajene',
            village: village || null,
            phone,
            whatsappNumber: phone,
            latitude: latitude ? parseFloat(latitude) : -3.9274,
            longitude: longitude ? parseFloat(longitude) : 119.7997,
          },
        });
      } else if (mitraType === 'PERPUSTAKAAN') {
        await tx.library.create({
          data: {
            mitraId: profile.id,
            name: organizationName,
            slug: uniqueSlug,
            description: description || `Perpustakaan ${organizationName}`,
            address: address || `Kecamatan ${district || 'Pangkajene'}, Sidrap`,
            district: district || 'Pangkajene',
            village: village || null,
            phone,
            latitude: latitude ? parseFloat(latitude) : -3.9274,
            longitude: longitude ? parseFloat(longitude) : 119.7997,
          },
        });
      } else if (mitraType === 'KOMUNITAS') {
        await tx.community.create({
          data: {
            mitraId: profile.id,
            name: organizationName,
            slug: uniqueSlug,
            description: description || `Komunitas literasi ${organizationName}`,
            address: address || `Kecamatan ${district || 'Pangkajene'}, Sidrap`,
            district: district || 'Pangkajene',
            village: village || null,
            contact: phone,
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
    const user = await prisma.user.findUnique({
      where: { email },
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

    const isMatch = await bcrypt.compare(password, user.password);
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
