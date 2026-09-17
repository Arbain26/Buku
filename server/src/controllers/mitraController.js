const mitraService = require('../services/mitra.service');
const storeService = require('../services/store.service');
const libraryService = require('../services/library.service');
const borrowingService = require('../services/borrowing.service');
const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const getMitraProfile = async (req, res, next) => {
  try {
    const profile = await mitraService.getMitraProfile(req.user.id);
    return successResponse(res, 'Profil mitra berhasil dimuat.', profile);
  } catch (error) {
    next(error);
  }
};

const updateMitraProfile = async (req, res, next) => {
  try {
    const updated = await mitraService.updateMitraProfile(req.user.id, req.body, req.files);
    return successResponse(res, 'Profil mitra berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const getMitraDashboard = async (req, res, next) => {
  try {
    const dashboard = await mitraService.getMitraDashboard(req.user.id);
    return successResponse(res, 'Statistik dashboard mitra berhasil dimuat.', dashboard);
  } catch (error) {
    next(error);
  }
};

const getMitraStatistics = async (req, res, next) => {
  try {
    const stats = await mitraService.getMitraStatistics(req.user.id);
    return successResponse(res, 'Data statistik mitra berhasil dimuat.', stats);
  } catch (error) {
    next(error);
  }
};

// Kompatibilitas endpoint frontend Mitra: addInventory
const addInventory = async (req, res, next) => {
  try {
    const mitra = req.user.mitraProfile;
    if (!mitra) return errorResponse(res, 'Profil mitra tidak ditemukan.', 404);

    const {
      title,
      author,
      categoryId,
      isbn,
      description,
      price,
      stock,
      quantity,
      callNumber,
      shelfLocation,
      itemCategory,
    } = req.body;

    const coverImage = req.file ? `/uploads/${req.file.filename}` : (req.body.coverImage || null);
    const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    // Buat Buku Utama jika belum ada
    let book = await prisma.book.findFirst({
      where: {
        OR: [{ isbn: isbn || 'NON_EXISTENT_ISBN' }, { title: { equals: title } }],
      },
    });

    if (!book) {
      book = await prisma.book.create({
        data: {
          title,
          slug: uniqueSlug,
          author,
          isbn: isbn || null,
          description: description || 'Deskripsi buku belum ditambahkan.',
          coverImage,
          categoryId: parseInt(categoryId) || 1,
        },
      });
    } else if (coverImage && (!book.coverImage || book.coverImage !== coverImage)) {
      await prisma.book.update({
        where: { id: book.id },
        data: { coverImage },
      });
    }

    if (mitra.mitraType === 'TOKO_BUKU') {
      const store = await prisma.store.findUnique({ where: { mitraId: mitra.id } });
      if (!store) return errorResponse(res, 'Data toko buku tidak ditemukan.', 404);

      const product = await storeService.addStoreProduct(store.id, {
        bookId: book.id,
        price: parseFloat(price) || 0,
        stock: parseInt(stock) || 1,
      });

      return successResponse(res, 'Produk buku berhasil ditambahkan ke inventaris toko.', product, 201);
    } else if (mitra.mitraType === 'PERPUSTAKAAN') {
      const library = await prisma.library.findUnique({ where: { mitraId: mitra.id } });
      if (!library) return errorResponse(res, 'Data perpustakaan tidak ditemukan.', 404);

      const collection = await libraryService.addLibraryCollection(library.id, {
        bookId: book.id,
        callNumber,
        quantity: parseInt(quantity) || 1,
        shelfLocation,
        category: itemCategory,
      });

      return successResponse(res, 'Koleksi buku berhasil ditambahkan ke perpustakaan.', collection, 201);
    }

    return errorResponse(res, 'Tipe mitra tidak mendukung inventaris buku.', 400);
  } catch (error) {
    next(error);
  }
};

// Kompatibilitas endpoint frontend Mitra: updateInventory
const updateInventory = async (req, res, next) => {
  try {
    const mitra = req.user.mitraProfile;
    const inventoryId = parseInt(req.params.id);

    const {
      title,
      author,
      categoryId,
      isbn,
      description,
      price,
      stock,
      quantity,
      availableQuantity,
      callNumber,
      shelfLocation,
      locationShelf,
      category,
      itemCategory,
      condition,
    } = req.body;

    const coverImage = req.file ? `/uploads/${req.file.filename}` : (req.body.coverImage !== undefined ? req.body.coverImage : undefined);

    let bookId = null;

    if (mitra.mitraType === 'TOKO_BUKU') {
      const store = await prisma.store.findUnique({ where: { mitraId: mitra.id } });
      const storeProduct = await prisma.storeProduct.findUnique({ where: { id: inventoryId } });
      if (!storeProduct || !store || storeProduct.storeId !== store.id) {
        return errorResponse(res, 'Anda tidak memiliki hak akses atas produk toko ini.', 403);
      }
      bookId = storeProduct.bookId;

      await storeService.updateStoreProduct(inventoryId, {
        price,
        stock,
        condition,
      });
    } else if (mitra.mitraType === 'PERPUSTAKAAN') {
      const library = await prisma.library.findUnique({ where: { mitraId: mitra.id } });
      const collection = await prisma.libraryCollection.findUnique({ where: { id: inventoryId } });
      if (!collection || !library || collection.libraryId !== library.id) {
        return errorResponse(res, 'Anda tidak memiliki hak akses atas koleksi perpustakaan ini.', 403);
      }
      bookId = collection.bookId;

      await libraryService.updateLibraryCollection(inventoryId, {
        callNumber,
        quantity: quantity !== undefined ? quantity : req.body.totalStock,
        availableQuantity,
        shelfLocation: shelfLocation || locationShelf,
        category: category || itemCategory,
      });
    } else {
      return errorResponse(res, 'Tipe mitra tidak valid.', 400);
    }

    // Perbarui data Buku induk (Judul, Penulis, Sinopsis, Kategori, Cover Image) jika ada
    if (bookId) {
      const bookUpdateData = {};
      if (title) bookUpdateData.title = title;
      if (author) bookUpdateData.author = author;
      if (description) bookUpdateData.description = description;
      if (categoryId) bookUpdateData.categoryId = parseInt(categoryId);
      if (isbn !== undefined) bookUpdateData.isbn = isbn || null;
      if (coverImage !== undefined) bookUpdateData.coverImage = coverImage;

      if (Object.keys(bookUpdateData).length > 0) {
        await prisma.book.update({
          where: { id: bookId },
          data: bookUpdateData,
        });
      }
    }

    return successResponse(res, 'Data dan keterangan buku berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
};

// Kompatibilitas endpoint frontend Mitra: deleteInventory
const deleteInventory = async (req, res, next) => {
  try {
    const mitra = req.user.mitraProfile;
    const inventoryId = parseInt(req.params.id);

    if (mitra.mitraType === 'TOKO_BUKU') {
      const store = await prisma.store.findUnique({ where: { mitraId: mitra.id } });
      const storeProduct = await prisma.storeProduct.findUnique({ where: { id: inventoryId } });
      if (!storeProduct || !store || storeProduct.storeId !== store.id) {
        return errorResponse(res, 'Anda tidak memiliki hak akses atas produk toko ini.', 403);
      }
      await storeService.deleteStoreProduct(inventoryId);
      return successResponse(res, 'Produk berhasil dihapus dari inventaris toko.');
    } else if (mitra.mitraType === 'PERPUSTAKAAN') {
      const library = await prisma.library.findUnique({ where: { mitraId: mitra.id } });
      const collection = await prisma.libraryCollection.findUnique({ where: { id: inventoryId } });
      if (!collection || !library || collection.libraryId !== library.id) {
        return errorResponse(res, 'Anda tidak memiliki hak akses atas koleksi perpustakaan ini.', 403);
      }
      await libraryService.deleteLibraryCollection(inventoryId);
      return successResponse(res, 'Koleksi berhasil dihapus dari perpustakaan.');
    }

    return errorResponse(res, 'Tipe mitra tidak valid.', 400);
  } catch (error) {
    next(error);
  }
};

// Kompatibilitas endpoint frontend Mitra: updateBorrowingStatus
const updateBorrowingStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const borrowingId = parseInt(req.params.id);

    if (status === 'APPROVED') {
      const result = await borrowingService.approveBorrowing(borrowingId, req.user);
      return successResponse(res, 'Peminjaman berhasil disetujui.', result);
    } else if (status === 'REJECTED') {
      const result = await borrowingService.rejectBorrowing(borrowingId, req.user, reason);
      return successResponse(res, 'Peminjaman berhasil ditolak.', result);
    } else if (status === 'RETURNED') {
      const result = await borrowingService.returnBorrowing(borrowingId, req.user);
      return successResponse(res, 'Buku berhasil dikembalikan.', result);
    }

    return errorResponse(res, 'Status tidak valid.', 400);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMitraProfile,
  updateMitraProfile,
  getMitraDashboard,
  getMitraStatistics,
  addInventory,
  updateInventory,
  deleteInventory,
  updateBorrowingStatus,
};
