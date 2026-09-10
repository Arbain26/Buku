const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Get overall platform dashboard stats
const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalMitra,
      totalBooks,
      totalLibraries,
      totalStores,
      totalCommunities,
      totalEvents,
      totalArticles,
      pendingMitraCount,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.mitraProfile.count(),
      prisma.book.count(),
      prisma.mitraProfile.count({ where: { mitraType: 'PERPUSTAKAAN' } }),
      prisma.mitraProfile.count({ where: { mitraType: 'TOKO_BUKU' } }),
      prisma.mitraProfile.count({ where: { mitraType: 'KOMUNITAS' } }),
      prisma.event.count(),
      prisma.article.count(),
      prisma.mitraProfile.count({ where: { status: 'PENDING' } }),
    ]);

    // Growth charts data
    const growthData = [
      { month: 'Mei', pengguna: 120, event: 4, peminjaman: 25, pemesanan: 18 },
      { month: 'Jun', pengguna: 190, event: 7, peminjaman: 45, pemesanan: 30 },
      { month: 'Jul', pengguna: 280, event: 11, peminjaman: 70, pemesanan: 55 },
      { month: 'Agt', pengguna: 390, event: 14, peminjaman: 95, pemesanan: 78 },
      { month: 'Sep', pengguna: 510, event: 18, peminjaman: 130, pemesanan: 110 },
    ];

    return successResponse(res, 'Statistik admin dashboard berhasil dimuat.', {
      counts: {
        totalUsers,
        totalMitra,
        totalBooks,
        totalLibraries,
        totalStores,
        totalCommunities,
        totalEvents,
        totalArticles,
        pendingMitraCount,
      },
      growthData,
    });
  } catch (error) {
    next(error);
  }
};

// Get pending mitra verification requests
const getPendingMitra = async (req, res, next) => {
  try {
    const pendingMitra = await prisma.mitraProfile.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, 'Daftar mitra pending berhasil dimuat.', pendingMitra);
  } catch (error) {
    next(error);
  }
};

// Verify mitra: Set to APPROVED or REJECTED
const verifyMitra = async (req, res, next) => {
  try {
    const mitraId = parseInt(req.params.id);
    const { status } = req.body; // APPROVED or REJECTED

    if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return errorResponse(res, 'Status verifikasi harus APPROVED, REJECTED, atau SUSPENDED.', 400);
    }

    const updated = await prisma.mitraProfile.update({
      where: { id: mitraId },
      data: {
        status,
        verifiedAt: status === 'APPROVED' ? new Date() : null,
      },
      include: { user: true },
    });

    // Send notification to mitra user
    await prisma.notification.create({
      data: {
        userId: updated.userId,
        title: status === 'APPROVED' ? 'Pendaftaran Mitra Disetujui!' : 'Status Pendaftaran Mitra',
        message:
          status === 'APPROVED'
            ? `Selamat! Organisasi ${updated.organizationName} telah resmi disetujui sebagai Mitra MABBACA. Anda kini dapat mengakses dashboard mitra secara penuh.`
            : `Pendaftaran organisasi ${updated.organizationName} telah ${status.toLowerCase()} oleh pengelola MABBACA.`,
        type: status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
        linkUrl: '/mitra/dashboard',
      },
    });

    return successResponse(
      res,
      `Mitra "${updated.organizationName}" berhasil diubah statusnya menjadi ${status}.`,
      updated
    );
  } catch (error) {
    next(error);
  }
};

// Literacy data statistics by Sidrap subdistricts
const getLiteracyStatsByDistrict = async (req, res, next) => {
  try {
    const districts = [
      'Pangkajene',
      'Maritengngae',
      'Baranti',
      'Watang Pulu',
      'Tellu Limpoe',
      'Dua Pitue',
      'Panca Rijang',
      'Kulo',
    ];

    const stats = await Promise.all(
      districts.map(async (district) => {
        const [libraries, stores, communities, events] = await Promise.all([
          prisma.mitraProfile.count({ where: { district, mitraType: 'PERPUSTAKAAN', status: 'APPROVED' } }),
          prisma.mitraProfile.count({ where: { district, mitraType: 'TOKO_BUKU', status: 'APPROVED' } }),
          prisma.mitraProfile.count({ where: { district, mitraType: 'KOMUNITAS', status: 'APPROVED' } }),
          prisma.event.count({ where: { district } }),
        ]);

        return {
          district,
          perpustakaan: libraries,
          tokoBuku: stores,
          komunitas: communities,
          event: events,
          totalLiterasi: libraries + stores + communities + events,
        };
      })
    );

    return successResponse(res, 'Statistik ekosistem literasi per wilayah Sidrap berhasil dimuat.', stats);
  } catch (error) {
    next(error);
  }
};

// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const { role, search } = req.query;
    const where = {};

    if (role && role !== 'ALL') {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        points: true,
        level: true,
        district: true,
        createdAt: true,
        mitraProfile: {
          select: {
            id: true,
            organizationName: true,
            mitraType: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, 'Daftar pengguna berhasil dimuat.', users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getPendingMitra,
  verifyMitra,
  getLiteracyStatsByDistrict,
  getAllUsers,
};
