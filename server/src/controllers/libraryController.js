const libraryService = require('../services/library.service');
const borrowingService = require('../services/borrowing.service');
const prisma = require('../config/db');
const { successResponse, paginateResponse, errorResponse } = require('../utils/responseHelper');

const getLibraries = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, district, userLat, userLng } = req.query;
    const result = await libraryService.getLibraries({ page, limit, search, district, userLat, userLng });
    return paginateResponse(res, 'Daftar perpustakaan berhasil dimuat.', result.libraries, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getLibraryById = async (req, res, next) => {
  try {
    const { userLat, userLng } = req.query;
    const library = await libraryService.getLibraryById(req.params.id, userLat, userLng);
    return successResponse(res, 'Detail perpustakaan berhasil dimuat.', library);
  } catch (error) {
    next(error);
  }
};

const createLibrary = async (req, res, next) => {
  try {
    const mitraId = req.user.mitraProfile.id;
    const library = await libraryService.createLibrary(mitraId, req.body, req.files);
    return successResponse(res, 'Perpustakaan berhasil didaftarkan.', library, 201);
  } catch (error) {
    next(error);
  }
};

const updateLibrary = async (req, res, next) => {
  try {
    const updated = await libraryService.updateLibrary(req.params.id, req.body, req.files);
    return successResponse(res, 'Data perpustakaan berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteLibrary = async (req, res, next) => {
  try {
    await libraryService.deleteLibrary(req.params.id);
    return successResponse(res, 'Perpustakaan berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

// Collections
const getLibraryCollections = async (req, res, next) => {
  try {
    const collections = await libraryService.getLibraryCollections(req.params.id);
    return successResponse(res, 'Daftar koleksi perpustakaan berhasil dimuat.', collections);
  } catch (error) {
    next(error);
  }
};

const addLibraryCollection = async (req, res, next) => {
  try {
    const { bookId, callNumber, quantity, shelfLocation, category } = req.body;
    if (!bookId) {
      return errorResponse(res, 'Buku wajib dipilih.', 400);
    }
    const collection = await libraryService.addLibraryCollection(req.params.id, {
      bookId,
      callNumber,
      quantity,
      shelfLocation,
      category,
    });
    return successResponse(res, 'Buku berhasil ditambahkan ke koleksi perpustakaan.', collection, 201);
  } catch (error) {
    next(error);
  }
};

const updateLibraryCollection = async (req, res, next) => {
  try {
    const libraryId = parseInt(req.params.id);
    const collectionId = parseInt(req.params.collectionId);
    const collection = await prisma.libraryCollection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.libraryId !== libraryId) {
      return errorResponse(res, 'Koleksi tidak ditemukan di perpustakaan ini.', 404);
    }
    const updated = await libraryService.updateLibraryCollection(collectionId, req.body);
    return successResponse(res, 'Koleksi berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteLibraryCollection = async (req, res, next) => {
  try {
    const libraryId = parseInt(req.params.id);
    const collectionId = parseInt(req.params.collectionId);
    const collection = await prisma.libraryCollection.findUnique({ where: { id: collectionId } });
    if (!collection || collection.libraryId !== libraryId) {
      return errorResponse(res, 'Koleksi tidak ditemukan di perpustakaan ini.', 404);
    }
    await libraryService.deleteLibraryCollection(collectionId);
    return successResponse(res, 'Koleksi berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

// Request borrow dari detail perpustakaan
const requestBorrow = async (req, res, next) => {
  try {
    const { libraryId, bookId, quantity, notes, durationDays } = req.body;
    if (!libraryId || !bookId) {
      return errorResponse(res, 'ID Perpustakaan dan ID Buku wajib diisi.', 400);
    }
    const borrowing = await borrowingService.requestBorrow(req.user.id, {
      libraryId,
      bookId,
      quantity,
      notes,
      durationDays,
    });
    return successResponse(res, 'Permohonan peminjaman buku berhasil diajukan.', borrowing, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLibraries,
  getLibraryById,
  createLibrary,
  updateLibrary,
  deleteLibrary,
  getLibraryCollections,
  addLibraryCollection,
  updateLibraryCollection,
  deleteLibraryCollection,
  requestBorrow,
};
