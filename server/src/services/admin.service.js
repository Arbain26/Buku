const prisma = require('../config/db');

class AdminService {
  // Method umum untuk mengambil ringkasan angka ekosistem literasi Sidrap
  async getEcosystemCounts() {
    try {
      const [
        totalUsers,
        mitraProfileCount,
        userMitraCount,
        pendingMitraCount,
        totalBooks,
        storeCount,
        libCount,
        commCount,
        mitraStores,
        mitraLibs,
        mitraComms,
        totalEvents,
        totalArticles,
        totalOrders,
        totalBorrowings,
        totalEventParticipants,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'USER', deletedAt: null } }).catch(() => 0),
        prisma.mitraProfile.count({ where: { deletedAt: null } }).catch(() => 0),
        prisma.user.count({ where: { role: 'MITRA', deletedAt: null } }).catch(() => 0),
        prisma.mitraProfile.count({ where: { status: 'PENDING' } }).catch(() => 0),
        prisma.book.count({ where: { deletedAt: null } }).catch(() => 0),
        prisma.store.count({ where: { deletedAt: null } }).catch(() => 0),
        prisma.library.count({ where: { deletedAt: null } }).catch(() => 0),
        prisma.community.count({ where: { deletedAt: null } }).catch(() => 0),
        prisma.mitraProfile.count({ where: { mitraType: 'TOKO_BUKU', deletedAt: null } }).catch(() => 0),
        prisma.mitraProfile.count({ where: { mitraType: 'PERPUSTAKAAN', deletedAt: null } }).catch(() => 0),
        prisma.mitraProfile.count({ where: { mitraType: 'KOMUNITAS', deletedAt: null } }).catch(() => 0),
        prisma.event.count({ where: { status: { not: 'CANCELLED' } } }).catch(() => 0),
        prisma.article.count({ where: { status: 'PUBLISHED', deletedAt: null } }).catch(() => 0),
        prisma.order.count().catch(() => 0),
        prisma.borrowing.count().catch(() => 0),
        prisma.eventParticipant.count().catch(() => 0),
      ]);

      const totalMitra = Math.max(mitraProfileCount, userMitraCount);
      const totalStores = Math.max(storeCount, mitraStores);
      const totalLibraries = Math.max(libCount, mitraLibs);
      const totalCommunities = Math.max(commCount, mitraComms);

      return {
        totalUsers,
        totalMitra,
        pendingMitraCount,
        totalBooks,
        totalStores,
        totalLibraries,
        totalCommunities,
        totalEvents,
        totalArticles,
        totalOrders,
        totalBorrowings,
        totalEventParticipants,
      };
    } catch (err) {
      console.error('Error in getEcosystemCounts:', err);
      return {
        totalUsers: 0,
        totalMitra: 0,
        pendingMitraCount: 0,
        totalBooks: 0,
        totalStores: 0,
        totalLibraries: 0,
        totalCommunities: 0,
        totalEvents: 0,
        totalArticles: 0,
        totalOrders: 0,
        totalBorrowings: 0,
        totalEventParticipants: 0,
      };
    }
  }

  // Admin Dashboard Metrics & Real Growth Analytics
  async getAdminDashboard() {
    try {
      const counts = await this.getEcosystemCounts();

      // === 1. Dynamic District Stats (Real Data) ===
      const sidrapDistricts = [
        'Pangkajene', 'Maritengngae', 'Baranti', 'Watang Pulu', 
        'Dua Pitue', 'Panca Rijang', 'Kulo', 'Tellu Limpoe', 
        'Pitu Riase', 'Watang Sidenreng', 'Pitu Riawa'
      ];
      
      // Fetch raw data with district info
      const [libData, storeData, comData, evtData] = await Promise.all([
        prisma.library.findMany({ where: { isActive: true, deletedAt: null }, select: { district: true } }).catch(() => []),
        prisma.store.findMany({ where: { isActive: true, deletedAt: null }, select: { district: true } }).catch(() => []),
        prisma.community.findMany({ where: { isActive: true, deletedAt: null }, select: { district: true } }).catch(() => []),
        prisma.event.findMany({ where: { status: { not: 'CANCELLED' } }, select: { location: true } }).catch(() => []),
      ]);

      const formattedDistrictStats = sidrapDistricts.map(districtName => {
        const p = libData.filter(l => l.district?.includes(districtName)).length;
        const t = storeData.filter(s => s.district?.includes(districtName)).length;
        const c = comData.filter(com => com.district?.includes(districtName)).length;
        const e = evtData.filter(ev => ev.location?.includes(districtName)).length;
        return {
          district: districtName,
          perpustakaan: p,
          tokoBuku: t,
          komunitas: c,
          event: e,
          totalLiterasi: p + t + c + e
        };
      }).filter(d => d.totalLiterasi > 0 || sidrapDistricts.slice(0,8).includes(d.district));

      // === 2. Dynamic Growth Data (Last 5 Months) ===
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
      const now = new Date();
      const growthData = [];
      
      // Fetch records for the last 5 months
      const fiveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 4, 1);
      
      const [userGrowth, eventGrowth, borrowGrowth, orderGrowth] = await Promise.all([
        prisma.user.findMany({ where: { createdAt: { gte: fiveMonthsAgo } }, select: { createdAt: true } }).catch(() => []),
        prisma.eventParticipant.findMany({ where: { registeredAt: { gte: fiveMonthsAgo } }, select: { registeredAt: true } }).catch(() => []),
        prisma.borrowing.findMany({ where: { createdAt: { gte: fiveMonthsAgo } }, select: { createdAt: true } }).catch(() => []),
        prisma.order.findMany({ where: { createdAt: { gte: fiveMonthsAgo } }, select: { createdAt: true } }).catch(() => []),
      ]);

      for (let i = 4; i >= 0; i--) {
        const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const targetMonth = targetDate.getMonth();
        const targetYear = targetDate.getFullYear();
        
        const filterByMonth = (items, dateField = 'createdAt') => items.filter(item => {
          const d = item[dateField] ? new Date(item[dateField]) : null;
          return d && d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        }).length;

        growthData.push({
          month: monthNames[targetMonth],
          pengguna: filterByMonth(userGrowth, 'createdAt'),
          event: filterByMonth(eventGrowth, 'registeredAt'),
          peminjaman: filterByMonth(borrowGrowth, 'createdAt'),
          pemesanan: filterByMonth(orderGrowth, 'createdAt'),
        });
      }

      return {
        counts,
        growthData,
        districtStats: formattedDistrictStats,
      };
    } catch (error) {
      console.error('Error in getAdminDashboard:', error);
      return {
        counts: {
          totalUsers: 0,
          totalMitra: 0,
          pendingMitraCount: 0,
          totalBooks: 0,
          totalStores: 0,
          totalLibraries: 0,
          totalCommunities: 0,
          totalEvents: 0,
          totalArticles: 0,
          totalOrders: 0,
          totalBorrowings: 0,
          totalEventParticipants: 0,
        },
        growthData: [],
        districtStats: [],
      };
    }
  }

  // Get Mitra list with status filter and pagination
  async getMitraList({ status, page = 1, limit = 10, search }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { organizationName: { contains: search } },
        { address: { contains: search } },
        { district: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const [total, mitra] = await Promise.all([
      prisma.mitraProfile.count({ where }),
      prisma.mitraProfile.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          store: true,
          library: true,
          community: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
    ]);

    return { mitra, total, page: p, limit: l };
  }

  // Approve Mitra
  async approveMitra(id) {
    const mitraId = parseInt(id);

    return prisma.$transaction(async (tx) => {
      const mitra = await tx.mitraProfile.findUnique({
        where: { id: mitraId },
        include: { user: true },
      });

      if (!mitra) {
        const error = new Error('Data mitra tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }

      const updated = await tx.mitraProfile.update({
        where: { id: mitraId },
        data: {
          status: 'APPROVED',
          verifiedAt: new Date(),
          rejectionReason: null,
        },
      });

      // Pastikan store/library/community aktif
      if (mitra.mitraType === 'TOKO_BUKU') {
        await tx.store.updateMany({
          where: { mitraId },
          data: { isActive: true },
        });
      } else if (mitra.mitraType === 'PERPUSTAKAAN') {
        await tx.library.updateMany({
          where: { mitraId },
          data: { isActive: true },
        });
      } else if (mitra.mitraType === 'KOMUNITAS') {
        await tx.community.updateMany({
          where: { mitraId },
          data: { isActive: true },
        });
      }

      // Kirim notifikasi
      await tx.notification.create({
        data: {
          userId: mitra.userId,
          type: 'SUCCESS',
          title: 'Kemitraan Disetujui!',
          message: `Selamat! Pengajuan kemitraan "${mitra.organizationName}" telah disetujui oleh Admin MABBACA. Anda sekarang dapat mengelola layanan literasi Anda.`,
        },
      });

      return updated;
    });
  }

  // Reject Mitra
  async rejectMitra(id, reason) {
    const mitraId = parseInt(id);

    return prisma.$transaction(async (tx) => {
      const mitra = await tx.mitraProfile.findUnique({
        where: { id: mitraId },
        include: { user: true },
      });

      if (!mitra) {
        const error = new Error('Data mitra tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }

      const updated = await tx.mitraProfile.update({
        where: { id: mitraId },
        data: {
          status: 'REJECTED',
          rejectionReason: reason || 'Dokumen atau informasi profil belum memenuhi ketentuan.',
        },
      });

      await tx.notification.create({
        data: {
          userId: mitra.userId,
          type: 'WARNING',
          title: 'Status Pengajuan Kemitraan',
          message: `Pengajuan kemitraan "${mitra.organizationName}" ditolak.${reason ? ` Alasan: ${reason}` : ''}`,
        },
      });

      return updated;
    });
  }

  // Suspend Mitra
  async suspendMitra(id, reason) {
    const mitraId = parseInt(id);

    return prisma.$transaction(async (tx) => {
      const mitra = await tx.mitraProfile.findUnique({
        where: { id: mitraId },
      });

      if (!mitra) {
        const error = new Error('Data mitra tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }

      const updated = await tx.mitraProfile.update({
        where: { id: mitraId },
        data: {
          status: 'SUSPENDED',
          rejectionReason: reason || 'Pelanggaran ketentuan operasional platform.',
        },
      });

      // Nonaktifkan toko/perpus/komunitas
      await tx.store.updateMany({ where: { mitraId }, data: { isActive: false } });
      await tx.library.updateMany({ where: { mitraId }, data: { isActive: false } });
      await tx.community.updateMany({ where: { mitraId }, data: { isActive: false } });

      await tx.notification.create({
        data: {
          userId: mitra.userId,
          type: 'WARNING',
          title: 'Akun Mitra Ditangguhkan',
          message: `Akun mitra "${mitra.organizationName}" telah ditangguhkan sementara waktu.`,
        },
      });

      return updated;
    });
  }

  // Get Admin Reports / System Summary
  async getAdminReports() {
    const [recentOrders, recentBorrowings, recentUsers, recentEvents] = await Promise.all([
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { store: true },
      }),
      prisma.borrowing.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: true, book: true, library: true },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      }),
      prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { organizer: true },
      }),
    ]);

    return {
      recentOrders,
      recentBorrowings,
      recentUsers,
      recentEvents,
    };
  }

  // Update User & its associated Mitra profile
  async updateUser(id, data) {
    const userId = parseInt(id);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { mitraProfile: true },
      });

      if (!user) {
        const error = new Error('Pengguna tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }

      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name.trim();
      if (data.email !== undefined) updateData.email = data.email.trim().toLowerCase();
      if (data.phone !== undefined) updateData.phone = data.phone ? data.phone.trim() : null;
      if (data.district !== undefined) updateData.district = data.district;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.level !== undefined) updateData.level = data.level;
      if (data.points !== undefined) updateData.points = parseInt(data.points) || 0;
      if (data.isActive !== undefined) updateData.isActive = Boolean(data.isActive);

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          district: true,
          points: true,
          level: true,
          isActive: true,
          createdAt: true,
        },
      });

      // Update associated mitraProfile if data is provided
      if (user.mitraProfile && (data.organizationName || data.mitraType || data.mitraStatus || data.address || data.phoneWa || data.district || data.description !== undefined || data.openHours !== undefined)) {
        const orgName = data.organizationName || user.mitraProfile.organizationName;
        const mitraType = data.mitraType || user.mitraProfile.mitraType;
        const status = data.mitraStatus || user.mitraProfile.status;
        const address = data.address !== undefined ? data.address : user.mitraProfile.address;
        const phoneWa = data.phoneWa !== undefined ? data.phoneWa : user.mitraProfile.phoneWa;
        const district = data.district !== undefined ? data.district : user.mitraProfile.district;
        const description = data.description !== undefined ? data.description : user.mitraProfile.description;
        const openHours = data.openHours !== undefined ? data.openHours : user.mitraProfile.openHours;

        const profileUpdate = {};
        if (orgName) profileUpdate.organizationName = orgName.trim();
        if (mitraType) profileUpdate.mitraType = mitraType;
        if (status) profileUpdate.status = status;
        if (address !== undefined) profileUpdate.address = address;
        if (phoneWa !== undefined) profileUpdate.phoneWa = phoneWa;
        if (district !== undefined) profileUpdate.district = district;
        if (description !== undefined) profileUpdate.description = description;
        if (openHours !== undefined) profileUpdate.openHours = openHours;

        await tx.mitraProfile.update({
          where: { id: user.mitraProfile.id },
          data: profileUpdate,
        });

        // Sync Store / Library / Community
        if (orgName || address || phoneWa) {
          if (mitraType === 'TOKO_BUKU') {
            await tx.store.updateMany({
              where: { mitraId: user.mitraProfile.id },
              data: { name: orgName, address, whatsappNumber: phoneWa },
            });
          } else if (mitraType === 'PERPUSTAKAAN') {
            await tx.library.updateMany({
              where: { mitraId: user.mitraProfile.id },
              data: { name: orgName, address },
            });
          } else if (mitraType === 'KOMUNITAS') {
            await tx.community.updateMany({
              where: { mitraId: user.mitraProfile.id },
              data: { name: orgName, address, contact: phoneWa },
            });
          }
        }
      }

      return updatedUser;
    });
  }

  // Delete User & its associated Mitra profile safely
  async deleteUser(id, currentAdminId) {
    const userId = parseInt(id);

    if (currentAdminId && userId === currentAdminId) {
      const error = new Error('Anda tidak dapat menghapus akun Anda sendiri.');
      error.statusCode = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { mitraProfile: true },
      });

      if (!user) {
        const error = new Error('Pengguna tidak ditemukan atau sudah dihapus.');
        error.statusCode = 404;
        throw error;
      }

      // Nullify userId on orders to prevent constraint errors since onDelete is not configured on schema for this relation
      await tx.order.updateMany({
        where: { userId: user.id },
        data: { userId: null },
      });

      // Hard delete user (this will cascade to MitraProfile, Store, etc. based on schema)
      await tx.user.delete({
        where: { id: userId },
      });

      return { id: userId, message: 'Pengguna dan data mitra berhasil dihapus secara permanen.' };
    });
  }

  // Update Mitra directly by mitraProfile id
  async updateMitra(id, data) {
    const mitraId = parseInt(id);

    return prisma.$transaction(async (tx) => {
      const mitra = await tx.mitraProfile.findUnique({
        where: { id: mitraId },
        include: { user: true },
      });

      if (!mitra) {
        const error = new Error('Data mitra tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }

      const updateData = {};
      if (data.organizationName) updateData.organizationName = data.organizationName.trim();
      if (data.mitraType) updateData.mitraType = data.mitraType;
      if (data.status) updateData.status = data.status;
      if (data.district) updateData.district = data.district;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.phoneWa !== undefined) updateData.phoneWa = data.phoneWa;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.openHours !== undefined) updateData.openHours = data.openHours;

      const updatedMitra = await tx.mitraProfile.update({
        where: { id: mitraId },
        data: updateData,
        include: { user: true },
      });

      // Update PIC User if name/phone provided
      if (data.name || data.phone) {
        const userUpdate = {};
        if (data.name) userUpdate.name = data.name.trim();
        if (data.phone) userUpdate.phone = data.phone.trim();
        await tx.user.update({
          where: { id: mitra.userId },
          data: userUpdate,
        });
      }

      // Sync Store/Library/Community
      const orgName = data.organizationName || mitra.organizationName;
      const addr = data.address !== undefined ? data.address : mitra.address;
      const pWa = data.phoneWa !== undefined ? data.phoneWa : mitra.phoneWa;

      if (mitra.mitraType === 'TOKO_BUKU') {
        await tx.store.updateMany({
          where: { mitraId },
          data: { name: orgName, address: addr, whatsappNumber: pWa },
        });
      } else if (mitra.mitraType === 'PERPUSTAKAAN') {
        await tx.library.updateMany({
          where: { mitraId },
          data: { name: orgName, address: addr },
        });
      } else if (mitra.mitraType === 'KOMUNITAS') {
        await tx.community.updateMany({
          where: { mitraId },
          data: { name: orgName, address: addr, contact: pWa },
        });
      }

      return updatedMitra;
    });
  }

  // Delete Mitra directly by mitraProfile id
  async deleteMitra(id) {
    const mitraId = parseInt(id);

    return prisma.$transaction(async (tx) => {
      const mitra = await tx.mitraProfile.findUnique({
        where: { id: mitraId },
      });

      if (!mitra) {
        const error = new Error('Data mitra tidak ditemukan atau sudah dihapus.');
        error.statusCode = 404;
        throw error;
      }

      // Hard delete mitra profile (cascades to stores, library, etc.)
      await tx.mitraProfile.delete({
        where: { id: mitraId },
      });

      return { id: mitraId, message: 'Data mitra berhasil dihapus secara permanen.' };
    });
  }
}

module.exports = new AdminService();
