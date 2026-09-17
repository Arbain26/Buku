const prisma = require('../config/db');

class MitraService {
  // Ambil profil Mitra lengkap
  async getMitraProfile(userId) {
    const profile = await prisma.mitraProfile.findUnique({
      where: { userId },
      include: {
        store: true,
        library: true,
        community: true,
      },
    });

    if (!profile) {
      const error = new Error('Profil mitra tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    return profile;
  }

  // Update profil mitra
  async updateMitraProfile(userId, data, files = {}) {
    const profile = await prisma.mitraProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const error = new Error('Profil mitra tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const updateData = {};
    if (data.organizationName) updateData.organizationName = data.organizationName;
    if (data.description) updateData.description = data.description;
    if (data.address) updateData.address = data.address;
    if (data.district) updateData.district = data.district;
    if (data.village) updateData.village = data.village;
    if (data.phoneWa) updateData.phoneWa = data.phoneWa;
    if (data.openHours) updateData.openHours = data.openHours;
    if (data.latitude) updateData.latitude = parseFloat(data.latitude);
    if (data.longitude) updateData.longitude = parseFloat(data.longitude);

    if (files.logo) updateData.logo = `/uploads/${files.logo[0].filename}`;
    if (files.banner) updateData.banner = `/uploads/${files.banner[0].filename}`;

    const updatedProfile = await prisma.$transaction(async (tx) => {
      const res = await tx.mitraProfile.update({
        where: { id: profile.id },
        data: updateData,
      });

      // Sinkronkan ke Store/Library/Community terkait jika ada
      if (profile.mitraType === 'TOKO_BUKU') {
        await tx.store.updateMany({
          where: { mitraId: profile.id },
          data: {
            name: updateData.organizationName || profile.organizationName,
            description: updateData.description || profile.description,
            address: updateData.address || profile.address,
            district: updateData.district || profile.district,
            whatsappNumber: updateData.phoneWa || profile.phoneWa,
            image: updateData.logo || profile.logo,
            banner: updateData.banner || profile.banner,
            openHours: updateData.openHours || profile.openHours,
          },
        });
      } else if (profile.mitraType === 'PERPUSTAKAAN') {
        await tx.library.updateMany({
          where: { mitraId: profile.id },
          data: {
            name: updateData.organizationName || profile.organizationName,
            description: updateData.description || profile.description,
            address: updateData.address || profile.address,
            district: updateData.district || profile.district,
            phone: updateData.phoneWa || profile.phoneWa,
            image: updateData.logo || profile.logo,
            banner: updateData.banner || profile.banner,
            openingHours: updateData.openHours || profile.openHours,
          },
        });
      } else if (profile.mitraType === 'KOMUNITAS') {
        await tx.community.updateMany({
          where: { mitraId: profile.id },
          data: {
            name: updateData.organizationName || profile.organizationName,
            description: updateData.description || profile.description,
            address: updateData.address || profile.address,
            district: updateData.district || profile.district,
            contact: updateData.phoneWa || profile.phoneWa,
            logo: updateData.logo || profile.logo,
            coverImage: updateData.banner || profile.banner,
          },
        });
      }

      return res;
    });

    return updatedProfile;
  }

  // Dashboard spesifik mitra_type (100% data riil dari database)
  async getMitraDashboard(userId) {
    const mitra = await prisma.mitraProfile.findUnique({
      where: { userId },
      include: {
        store: true,
        library: true,
        community: true,
      },
    });

    if (!mitra) {
      const error = new Error('Profil mitra tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const { mitraType, id: mitraId } = mitra;

    let dashboardData = {
      profile: mitra,
      mitraType,
    };

    // A. TOKO_BUKU
    if (mitraType === 'TOKO_BUKU') {
      const store = mitra.store || (await prisma.store.findUnique({ where: { mitraId } }));
      const storeId = store ? store.id : 0;

      const [productsCount, products, orders, eventsCount, eventsList] = await Promise.all([
        prisma.storeProduct.count({ where: { storeId } }),
        prisma.storeProduct.findMany({
          where: { storeId },
          include: { book: { include: { category: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.findMany({
          where: { storeId },
          include: { items: { include: { book: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.event.count({ where: { organizerMitraId: mitraId } }),
        prisma.event.findMany({
          where: { organizerMitraId: mitraId },
          include: { _count: { select: { participants: true } } },
          orderBy: { eventDate: 'desc' },
        }),
      ]);

      const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
      const totalRevenue = orders
        .filter((o) => o.status === 'COMPLETED')
        .reduce((acc, o) => acc + Number(o.totalAmount), 0);

      // Top selling books dari database
      const orderItems = await prisma.orderItem.findMany({
        where: { order: { storeId, status: { in: ['CONFIRMED', 'COMPLETED'] } } },
        include: { book: true },
      });

      const bookSales = {};
      for (const item of orderItems) {
        if (!bookSales[item.bookId]) {
          bookSales[item.bookId] = {
            title: item.book.title,
            coverImage: item.book.coverImage,
            sold: 0,
          };
        }
        bookSales[item.bookId].sold += item.quantity;
      }
      const topSellingBooks = Object.values(bookSales)
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);

      dashboardData = {
        ...dashboardData,
        metrics: {
          totalProducts: productsCount,
          totalStock,
          totalOrders: orders.length,
          totalRevenue,
          totalEvents: eventsCount,
        },
        topSellingBooks,
        orders,
        events: eventsList,
        products: products.map((p) => ({
          id: p.id,
          bookId: p.book.id,
          title: p.book.title,
          author: p.book.author,
          publisher: p.book.publisher || '',
          publishYear: p.book.publishYear || null,
          pages: p.book.pages || null,
          language: p.book.language || 'Bahasa Indonesia',
          description: p.book.description || '',
          isbn: p.book.isbn,
          category: p.book.category ? p.book.category.name : null,
          categoryId: p.book.categoryId,
          coverImage: p.book.coverImage,
          price: Number(p.price),
          stock: p.stock,
          condition: p.condition,
          isAvailable: p.isAvailable,
        })),
      };
    }

    // B. PERPUSTAKAAN
    else if (mitraType === 'PERPUSTAKAAN') {
      const library = mitra.library || (await prisma.library.findUnique({ where: { mitraId } }));
      const libraryId = library ? library.id : 0;

      const [collectionsCount, collections, borrowings, eventsCount, eventsList] = await Promise.all([
        prisma.libraryCollection.count({ where: { libraryId } }),
        prisma.libraryCollection.findMany({
          where: { libraryId },
          include: { book: { include: { category: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.borrowing.findMany({
          where: { libraryId },
          include: {
            user: { select: { id: true, name: true, phone: true, email: true } },
            book: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.event.count({ where: { organizerMitraId: mitraId } }),
        prisma.event.findMany({
          where: { organizerMitraId: mitraId },
          include: { _count: { select: { participants: true } } },
          orderBy: { eventDate: 'desc' },
        }),
      ]);

      const totalBooks = collections.reduce((acc, c) => acc + c.quantity, 0);
      const totalAvailable = collections.reduce((acc, c) => acc + c.availableQuantity, 0);
      const activeBorrowings = borrowings.filter((b) => ['PENDING', 'APPROVED', 'BORROWED'].includes(b.status)).length;

      dashboardData = {
        ...dashboardData,
        metrics: {
          totalTitles: collectionsCount,
          totalBooks,
          totalAvailable,
          totalBorrowings: borrowings.length,
          activeBorrowings,
          totalEvents: eventsCount,
        },
        collections: collections.map((c) => ({
          id: c.id,
          bookId: c.book.id,
          title: c.book.title,
          author: c.book.author,
          publisher: c.book.publisher || '',
          publishYear: c.book.publishYear || null,
          pages: c.book.pages || null,
          language: c.book.language || 'Bahasa Indonesia',
          description: c.book.description || '',
          isbn: c.book.isbn,
          category: c.book.category ? c.book.category.name : null,
          categoryId: c.book.categoryId,
          coverImage: c.book.coverImage,
          callNumber: c.callNumber,
          totalStock: c.quantity,
          availableStock: c.availableQuantity,
          locationShelf: c.shelfLocation,
          isAvailable: c.isAvailable,
        })),
        borrowings,
        events: eventsList,
      };
    }

    // C. KOMUNITAS
    else if (mitraType === 'KOMUNITAS') {
      const community = mitra.community || (await prisma.community.findUnique({ where: { mitraId } }));
      const communityId = community ? community.id : 0;

      const [membersCount, members, events, reviews] = await Promise.all([
        prisma.communityMember.count({ where: { communityId } }),
        prisma.communityMember.findMany({
          where: { communityId },
          include: {
            user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
          },
          orderBy: { joinedAt: 'desc' },
          take: 20,
        }),
        prisma.event.findMany({
          where: { organizerMitraId: mitraId },
          include: { _count: { select: { participants: true } } },
          orderBy: { eventDate: 'desc' },
        }),
        prisma.review.findMany({
          where: { communityId },
          include: { user: { select: { name: true } } },
          take: 5,
        }),
      ]);

      const totalParticipants = events.reduce((acc, ev) => acc + ev._count.participants, 0);

      dashboardData = {
        ...dashboardData,
        metrics: {
          totalMembers: membersCount,
          totalEvents: events.length,
          totalParticipants,
          totalReviews: reviews.length,
        },
        members,
        events,
        reviews,
      };
    }

    // D. SEKOLAH
    else if (mitraType === 'SEKOLAH') {
      const events = await prisma.event.findMany({
        where: { organizerMitraId: mitraId },
        include: { _count: { select: { participants: true } } },
        orderBy: { eventDate: 'desc' },
      });

      const totalParticipants = events.reduce((acc, ev) => acc + ev._count.participants, 0);

      dashboardData = {
        ...dashboardData,
        metrics: {
          totalEvents: events.length,
          totalParticipants,
          activePrograms: events.filter((e) => e.status === 'PUBLISHED').length,
        },
        events,
      };
    }

    // E. PENGAJAR
    else if (mitraType === 'PENGAJAR') {
      const [articles, events] = await Promise.all([
        prisma.article.findMany({
          where: { authorId: userId, deletedAt: null },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.event.findMany({
          where: { organizerMitraId: mitraId },
          include: { _count: { select: { participants: true } } },
          orderBy: { eventDate: 'desc' },
        }),
      ]);

      const totalViews = articles.reduce((acc, a) => acc + a.views, 0);

      dashboardData = {
        ...dashboardData,
        metrics: {
          totalArticles: articles.length,
          totalViews,
          totalEvents: events.length,
        },
        articles,
        events,
      };
    }

    return dashboardData;
  }

  // Statistik performa Mitra
  async getMitraStatistics(userId) {
    const mitra = await prisma.mitraProfile.findUnique({
      where: { userId },
    });

    if (!mitra) {
      const error = new Error('Profil mitra tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const { mitraType, id: mitraId } = mitra;

    if (mitraType === 'TOKO_BUKU') {
      const store = await prisma.store.findUnique({ where: { mitraId } });
      const orders = await prisma.order.findMany({
        where: { storeId: store ? store.id : 0 },
        orderBy: { createdAt: 'asc' },
      });

      return { type: 'TOKO_BUKU', totalOrders: orders.length, orders };
    } else if (mitraType === 'PERPUSTAKAAN') {
      const lib = await prisma.library.findUnique({ where: { mitraId } });
      const borrowings = await prisma.borrowing.findMany({
        where: { libraryId: lib ? lib.id : 0 },
        orderBy: { createdAt: 'asc' },
      });

      return { type: 'PERPUSTAKAAN', totalBorrowings: borrowings.length, borrowings };
    }

    return { type: mitraType, message: 'Statistik terintegrasi.' };
  }
}

module.exports = new MitraService();
