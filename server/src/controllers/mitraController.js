const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Get Mitra Dashboard statistics adapted to mitraType
const getMitraDashboard = async (req, res, next) => {
  try {
    const mitra = req.user.mitraProfile;
    if (!mitra) {
      return errorResponse(res, 'Profil mitra tidak ditemukan.', 404);
    }

    const { mitraType, id: mitraId } = mitra;

    // Common activity chart data for the last 7 intervals
    const chartData = [
      { name: '1 Sep', dilihat: 120, pesanan: 18, peminjaman: 14 },
      { name: '4 Sep', dilihat: 160, pesanan: 24, peminjaman: 20 },
      { name: '7 Sep', dilihat: 210, pesanan: 29, peminjaman: 25 },
      { name: '10 Sep', dilihat: 290, pesanan: 35, peminjaman: 32 },
      { name: '13 Sep', dilihat: 340, pesanan: 42, peminjaman: 38 },
      { name: '16 Sep', dilihat: 310, pesanan: 38, peminjaman: 30 },
      { name: '18 Sep', dilihat: 380, pesanan: 46, peminjaman: 41 },
    ];

    let dashboardData = {
      profile: mitra,
      mitraType,
      chartData,
    };

    if (mitraType === 'TOKO_BUKU') {
      const [productsCount, products, orders, events] = await Promise.all([
        prisma.storeProduct.count({ where: { storeId: mitraId } }),
        prisma.storeProduct.findMany({
          where: { storeId: mitraId },
          include: { book: { include: { category: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.order.findMany({
          where: { storeId: mitraId },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
        prisma.event.count({ where: { mitraId } }),
      ]);

      dashboardData = {
        ...dashboardData,
        metrics: {
          totalProducts: productsCount,
          totalViews: 1240,
          totalOrders: orders.length > 0 ? orders.length : 34,
          totalEvents: events,
        },
        topSellingBooks: [
          { title: 'Filosofi Teras', sold: 45, coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100&auto=format&fit=crop&q=80' },
          { title: 'Atomic Habits', sold: 32, coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=100&auto=format&fit=crop&q=80' },
          { title: 'Laut Bercerita', sold: 28, coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&auto=format&fit=crop&q=80' },
          { title: 'Bumi Manusia', sold: 24, coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=100&auto=format&fit=crop&q=80' },
          { title: 'Negeri 5 Menara', sold: 20, coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=100&auto=format&fit=crop&q=80' },
        ],
        recentActivities: [
          { id: 1, time: '12 Sep 10:24', activity: 'Pesanan baru', details: 'Buku: Filosofi Teras — Rp95.000' },
          { id: 2, time: '12 Sep 09:15', activity: 'Produk baru', details: 'Buku: Atomic Habits ditambahkan' },
          { id: 3, time: '11 Sep 16:32', activity: 'Review baru', details: 'Bintang 5.0 oleh Andi Pratama' },
          { id: 4, time: '11 Sep 14:20', activity: 'Pertanyaan WhatsApp', details: 'Ketersediaan Buku Sejarah Sidrap' },
        ],
        products: products.map((p) => ({
          id: p.id,
          bookId: p.book.id,
          title: p.book.title,
          author: p.book.author,
          isbn: p.book.isbn,
          category: p.book.category.name,
          categoryId: p.book.categoryId,
          coverImage: p.book.coverImage,
          description: p.book.description,
          price: Number(p.price),
          stock: p.stock,
          isAvailable: p.isAvailable,
        })),
      };
    } else if (mitraType === 'PERPUSTAKAAN') {
      const [collectionsCount, collections, borrowings, events] = await Promise.all([
        prisma.libraryCollection.count({ where: { libraryId: mitraId } }),
        prisma.libraryCollection.findMany({
          where: { libraryId: mitraId },
          include: { book: { include: { category: true } } },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.borrowing.findMany({
          where: { collection: { libraryId: mitraId } },
          include: {
            user: { select: { id: true, name: true, phone: true, email: true } },
            collection: { include: { book: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        prisma.event.count({ where: { mitraId } }),
      ]);

      dashboardData = {
        ...dashboardData,
        metrics: {
          totalCollections: collectionsCount > 0 ? collectionsCount : 1250,
          totalVisitors: 340,
          totalBorrowings: borrowings.length > 0 ? borrowings.length : 120,
          totalEvents: events,
        },
        collections: collections.map((c) => ({
          id: c.id,
          bookId: c.book.id,
          title: c.book.title,
          author: c.book.author,
          isbn: c.book.isbn,
          category: c.category || c.book.category.name,
          categoryId: c.book.categoryId,
          callNumber: c.callNumber,
          locationShelf: c.locationShelf,
          totalStock: c.totalStock,
          availableStock: c.availableStock,
          coverImage: c.book.coverImage,
          description: c.book.description,
          isAvailable: c.isAvailable,
        })),
        borrowings: borrowings.map((b) => ({
          id: b.id,
          borrowerName: b.user.name,
          borrowerPhone: b.user.phone,
          bookTitle: b.collection.book.title,
          callNumber: b.collection.callNumber,
          borrowDate: b.borrowDate,
          dueDate: b.dueDate,
          status: b.status,
          notes: b.notes,
        })),
      };
    } else if (mitraType === 'KOMUNITAS') {
      const [membersCount, events, eventsCount] = await Promise.all([
        prisma.communityMember.count({ where: { communityId: mitraId } }),
        prisma.event.findMany({
          where: { mitraId },
          orderBy: { eventDate: 'desc' },
        }),
        prisma.event.count({ where: { mitraId } }),
      ]);

      dashboardData = {
        ...dashboardData,
        metrics: {
          totalMembers: membersCount + 15,
          totalEvents: eventsCount,
          totalVisitors: 2300,
        },
        events,
      };
    }

    return successResponse(res, 'Dashboard mitra berhasil dimuat.', dashboardData);
  } catch (error) {
    next(error);
  }
};

// Add Store Product / Library Collection
const addInventoryItem = async (req, res, next) => {
  try {
    const mitra = req.user.mitraProfile;
    if (!mitra) return errorResponse(res, 'Profil mitra tidak ditemukan.', 404);

    const {
      bookId,
      // For new book if not existing
      title,
      author,
      categoryId,
      isbn,
      publisher,
      publishYear,
      pages,
      description,
      // Store specifics
      price,
      stock,
      // Library specifics
      callNumber,
      totalStock,
      locationShelf,
      category,
    } = req.body;

    let targetBookId = bookId ? parseInt(bookId) : null;

    // If new book is being created
    if (!targetBookId) {
      if (!title || !author || !categoryId) {
        return errorResponse(res, 'Judul, penulis, dan kategori buku wajib diisi.', 400);
      }

      let slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const existing = await prisma.book.findUnique({ where: { slug } });
      if (existing) slug = `${slug}-${Date.now()}`;

      let coverImage = req.body.coverImage;
      if (req.file) {
        coverImage = `/uploads/${req.file.filename}`;
      }

      const newBook = await prisma.book.create({
        data: {
          title,
          slug,
          author,
          publisher: publisher || null,
          isbn: isbn || null,
          publishYear: publishYear ? parseInt(publishYear) : null,
          pages: pages ? parseInt(pages) : null,
          categoryId: parseInt(categoryId),
          description: description || 'Deskripsi belum tersedia.',
          coverImage: coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
        },
      });
      targetBookId = newBook.id;
    }

    if (mitra.mitraType === 'TOKO_BUKU') {
      const product = await prisma.storeProduct.upsert({
        where: {
          storeId_bookId: { storeId: mitra.id, bookId: targetBookId },
        },
        update: {
          price: price ? parseFloat(price) : 50000,
          stock: stock ? parseInt(stock) : 1,
          isAvailable: true,
        },
        create: {
          storeId: mitra.id,
          bookId: targetBookId,
          price: price ? parseFloat(price) : 50000,
          stock: stock ? parseInt(stock) : 1,
          isAvailable: true,
        },
        include: { book: true },
      });
      return successResponse(res, 'Buku berhasil ditambahkan ke inventaris toko!', product, 201);
    } else if (mitra.mitraType === 'PERPUSTAKAAN') {
      const total = totalStock ? parseInt(totalStock) : 1;
      const collection = await prisma.libraryCollection.upsert({
        where: {
          libraryId_bookId: { libraryId: mitra.id, bookId: targetBookId },
        },
        update: {
          callNumber: callNumber || null,
          totalStock: total,
          availableStock: total,
          locationShelf: locationShelf || null,
          category: category || 'Umum',
          isAvailable: true,
        },
        create: {
          libraryId: mitra.id,
          bookId: targetBookId,
          callNumber: callNumber || null,
          totalStock: total,
          availableStock: total,
          locationShelf: locationShelf || null,
          category: category || 'Umum',
          isAvailable: true,
        },
        include: { book: true },
      });
      return successResponse(res, 'Buku berhasil ditambahkan ke koleksi perpustakaan!', collection, 201);
    }

    return errorResponse(res, 'Tipe mitra ini tidak mengelola inventaris produk/koleksi.', 400);
  } catch (error) {
    next(error);
  }
};

// Delete inventory item
const deleteInventoryItem = async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);
    const mitra = req.user.mitraProfile;

    if (mitra.mitraType === 'TOKO_BUKU') {
      await prisma.storeProduct.delete({
        where: { id: itemId, storeId: mitra.id },
      });
      return successResponse(res, 'Produk buku berhasil dihapus dari toko.');
    } else if (mitra.mitraType === 'PERPUSTAKAAN') {
      await prisma.libraryCollection.delete({
        where: { id: itemId, libraryId: mitra.id },
      });
      return successResponse(res, 'Koleksi berhasil dihapus dari perpustakaan.');
    }

    return errorResponse(res, 'Aksi tidak didukung untuk tipe mitra ini.', 400);
  } catch (error) {
    next(error);
  }
};

// Update Borrowing Status (For Library Mitra)
const updateBorrowingStatus = async (req, res, next) => {
  try {
    const borrowingId = parseInt(req.params.id);
    const { status } = req.body; // APPROVED, BORROWED, RETURNED, REJECTED
    const mitra = req.user.mitraProfile;

    const borrowing = await prisma.borrowing.findUnique({
      where: { id: borrowingId },
      include: {
        collection: true,
        user: true,
      },
    });

    if (!borrowing || borrowing.collection.libraryId !== mitra.id) {
      return errorResponse(res, 'Data peminjaman tidak ditemukan pada perpustakaan Anda.', 404);
    }

    // Handle stock decrement / increment
    if (['APPROVED', 'BORROWED'].includes(status) && borrowing.status === 'PENDING') {
      await prisma.libraryCollection.update({
        where: { id: borrowing.collectionId },
        data: { availableStock: { decrement: 1 } },
      });
    } else if (status === 'RETURNED' && ['BORROWED', 'APPROVED'].includes(borrowing.status)) {
      await prisma.libraryCollection.update({
        where: { id: borrowing.collectionId },
        data: { availableStock: { increment: 1 } },
      });
    }

    const updated = await prisma.borrowing.update({
      where: { id: borrowingId },
      data: {
        status,
        returnDate: status === 'RETURNED' ? new Date() : borrowing.returnDate,
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: borrowing.userId,
        title: `Status Peminjaman: ${status}`,
        message: `Status permohonan peminjaman buku Anda telah diperbarui menjadi ${status}.`,
        type: status === 'APPROVED' ? 'SUCCESS' : 'INFO',
        linkUrl: '/dashboard',
      },
    });

    return successResponse(res, `Status peminjaman berhasil diubah menjadi ${status}.`, updated);
  } catch (error) {
    next(error);
  }
};

// Update Inventory Item & Book Details (Keterangan, Harga, Stok, dll)
const updateInventoryItem = async (req, res, next) => {
  try {
    const itemId = parseInt(req.params.id);
    const mitra = req.user.mitraProfile;
    const {
      title,
      author,
      categoryId,
      description,
      price,
      stock,
      callNumber,
      totalStock,
      locationShelf,
    } = req.body;

    if (mitra.mitraType === 'TOKO_BUKU') {
      const product = await prisma.storeProduct.findUnique({
        where: { id: itemId },
        include: { book: true },
      });

      if (!product || product.storeId !== mitra.id) {
        return errorResponse(res, 'Produk tidak ditemukan di inventaris toko Anda.', 404);
      }

      // Update book details if provided
      if (title || author || categoryId || description) {
        await prisma.book.update({
          where: { id: product.bookId },
          data: {
            ...(title && { title }),
            ...(author && { author }),
            ...(categoryId && { categoryId: parseInt(categoryId) }),
            ...(description && { description }),
          },
        });
      }

      // Update product pricing & stock
      const updatedProduct = await prisma.storeProduct.update({
        where: { id: itemId },
        data: {
          ...(price !== undefined && { price: parseFloat(price) }),
          ...(stock !== undefined && { stock: parseInt(stock) }),
        },
        include: { book: { include: { category: true } } },
      });

      return successResponse(res, 'Keterangan dan data buku berhasil diperbarui!', updatedProduct);
    } else if (mitra.mitraType === 'PERPUSTAKAAN') {
      const collection = await prisma.libraryCollection.findUnique({
        where: { id: itemId },
        include: { book: true },
      });

      if (!collection || collection.libraryId !== mitra.id) {
        return errorResponse(res, 'Koleksi tidak ditemukan di perpustakaan Anda.', 404);
      }

      // Update book details if provided
      if (title || author || categoryId || description) {
        await prisma.book.update({
          where: { id: collection.bookId },
          data: {
            ...(title && { title }),
            ...(author && { author }),
            ...(categoryId && { categoryId: parseInt(categoryId) }),
            ...(description && { description }),
          },
        });
      }

      // Update collection info
      const updatedCollection = await prisma.libraryCollection.update({
        where: { id: itemId },
        data: {
          ...(callNumber !== undefined && { callNumber }),
          ...(locationShelf !== undefined && { locationShelf }),
          ...(totalStock !== undefined && {
            totalStock: parseInt(totalStock),
            availableStock: parseInt(totalStock),
          }),
        },
        include: { book: { include: { category: true } } },
      });

      return successResponse(res, 'Keterangan dan data koleksi buku berhasil diperbarui!', updatedCollection);
    }

    return errorResponse(res, 'Tipe mitra ini tidak mendukung pengubahan inventaris.', 400);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMitraDashboard,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateBorrowingStatus,
};

