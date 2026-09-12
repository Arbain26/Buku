const bookService = require('../services/book.service');
const { successResponse, paginateResponse } = require('../utils/responseHelper');

const getBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, category, author, sort } = req.query;
    const result = await bookService.getBooks({ page, limit, search, category, author, sort });
    return paginateResponse(res, 'Daftar buku berhasil dimuat.', result.books, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const book = await bookService.getBookById(req.params.id, userId);
    return successResponse(res, 'Detail buku berhasil dimuat.', book);
  } catch (error) {
    next(error);
  }
};

const createBook = async (req, res, next) => {
  try {
    const book = await bookService.createBook(req.body, req.file);
    return successResponse(res, 'Buku berhasil ditambahkan.', book, 201);
  } catch (error) {
    next(error);
  }
};

const updateBook = async (req, res, next) => {
  try {
    const updated = await bookService.updateBook(req.params.id, req.body, req.file);
    return successResponse(res, 'Buku berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteBook = async (req, res, next) => {
  try {
    await bookService.deleteBook(req.params.id);
    return successResponse(res, 'Buku berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

const getBookStores = async (req, res, next) => {
  try {
    const stores = await bookService.getBookStores(req.params.id);
    return successResponse(res, 'Daftar toko penyedia buku berhasil dimuat.', stores);
  } catch (error) {
    next(error);
  }
};

const getBookLibraries = async (req, res, next) => {
  try {
    const libraries = await bookService.getBookLibraries(req.params.id);
    return successResponse(res, 'Daftar perpustakaan dengan koleksi buku ini berhasil dimuat.', libraries);
  } catch (error) {
    next(error);
  }
};

const getBookReviews = async (req, res, next) => {
  try {
    const reviews = await bookService.getBookReviews(req.params.id);
    return successResponse(res, 'Ulasan buku berhasil dimuat.', reviews);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBookStores,
  getBookLibraries,
  getBookReviews,
};
