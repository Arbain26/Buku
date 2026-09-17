const borrowingService = require('../services/borrowing.service');
const { successResponse, paginateResponse, errorResponse } = require('../utils/responseHelper');

const getBorrowings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await borrowingService.getBorrowings(req.user, { page, limit, status });
    return paginateResponse(res, 'Daftar peminjaman berhasil dimuat.', result.borrowings, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getBorrowingById = async (req, res, next) => {
  try {
    const borrowing = await borrowingService.getBorrowingById(req.params.id, req.user);
    return successResponse(res, 'Detail peminjaman berhasil dimuat.', borrowing);
  } catch (error) {
    next(error);
  }
};

const createBorrowing = async (req, res, next) => {
  try {
    const { libraryId, bookId, collectionId, quantity, notes, durationDays } = req.body;
    const borrowing = await borrowingService.requestBorrow(req.user.id, {
      libraryId,
      bookId,
      collectionId,
      quantity,
      notes,
      durationDays,
    });
    return successResponse(res, 'Permohonan peminjaman buku berhasil diajukan.', borrowing, 201);
  } catch (error) {
    next(error);
  }
};

const approveBorrowing = async (req, res, next) => {
  try {
    const updated = await borrowingService.approveBorrowing(req.params.id, req.user);
    return successResponse(res, 'Peminjaman berhasil disetujui. Stok perpustakaan telah disesuaikan.', updated);
  } catch (error) {
    next(error);
  }
};

const rejectBorrowing = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const updated = await borrowingService.rejectBorrowing(req.params.id, req.user, reason);
    return successResponse(res, 'Peminjaman berhasil ditolak.', updated);
  } catch (error) {
    next(error);
  }
};

const returnBorrowing = async (req, res, next) => {
  try {
    const updated = await borrowingService.returnBorrowing(req.params.id, req.user);
    return successResponse(res, 'Buku berhasil tercatat dikembalikan. Stok perpustakaan dipulihkan.', updated);
  } catch (error) {
    next(error);
  }
};

const updateBorrowingStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const updated = await borrowingService.updateBorrowingStatus(req.params.id, status, notes, req.user);
    return successResponse(res, `Status peminjaman berhasil diperbarui menjadi ${status}.`, updated);
  } catch (error) {
    next(error);
  }
};

const deleteBorrowing = async (req, res, next) => {
  try {
    const result = await borrowingService.deleteBorrowing(req.params.id, req.user);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBorrowings,
  getBorrowingById,
  createBorrowing,
  approveBorrowing,
  rejectBorrowing,
  returnBorrowing,
  updateBorrowingStatus,
  deleteBorrowing,
};
