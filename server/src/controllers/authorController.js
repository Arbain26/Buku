const authorService = require('../services/author.service');
const { successResponse, paginateResponse } = require('../utils/responseHelper');

const getAuthors = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const result = await authorService.getAuthors({ page, limit, search });
    return paginateResponse(res, 'Daftar penulis berhasil diambil.', result.authors, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getAuthorById = async (req, res, next) => {
  try {
    const author = await authorService.getAuthorById(req.params.id);
    return successResponse(res, 'Detail penulis berhasil diambil.', author);
  } catch (error) {
    next(error);
  }
};

const createAuthor = async (req, res, next) => {
  try {
    const author = await authorService.createAuthor(req.body, req.file);
    return successResponse(res, 'Penulis berhasil ditambahkan.', author, 201);
  } catch (error) {
    next(error);
  }
};

const updateAuthor = async (req, res, next) => {
  try {
    const updated = await authorService.updateAuthor(req.params.id, req.body, req.file);
    return successResponse(res, 'Penulis berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteAuthor = async (req, res, next) => {
  try {
    await authorService.deleteAuthor(req.params.id);
    return successResponse(res, 'Penulis berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
