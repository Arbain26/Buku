const categoryService = require('../services/category.service');
const { successResponse } = require('../utils/responseHelper');

const getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    return successResponse(res, 'Daftar kategori berhasil diambil.', categories);
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    return successResponse(res, 'Detail kategori berhasil diambil.', category);
  } catch (error) {
    next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);
    return successResponse(res, 'Kategori berhasil ditambahkan.', category, 201);
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const updated = await categoryService.updateCategory(req.params.id, req.body);
    return successResponse(res, 'Kategori berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return successResponse(res, 'Kategori berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
