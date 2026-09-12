const articleService = require('../services/article.service');
const { successResponse, paginateResponse } = require('../utils/responseHelper');

const getArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, category, status } = req.query;
    const result = await articleService.getArticles({ page, limit, search, category, status });
    return paginateResponse(res, 'Daftar artikel berhasil dimuat.', result.articles, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getArticleBySlug = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const article = await articleService.getArticleBySlugOrId(req.params.slug || req.params.id, userId);
    return successResponse(res, 'Detail artikel berhasil dimuat.', article);
  } catch (error) {
    next(error);
  }
};

const createArticle = async (req, res, next) => {
  try {
    const article = await articleService.createArticle(req.user.id, req.body, req.file);
    return successResponse(res, 'Artikel berhasil dibuat.', article, 201);
  } catch (error) {
    next(error);
  }
};

const updateArticle = async (req, res, next) => {
  try {
    const updated = await articleService.updateArticle(req.params.id, req.body, req.file);
    return successResponse(res, 'Artikel berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteArticle = async (req, res, next) => {
  try {
    await articleService.deleteArticle(req.params.id);
    return successResponse(res, 'Artikel berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

const publishArticle = async (req, res, next) => {
  try {
    const published = await articleService.publishArticle(req.params.id);
    return successResponse(res, 'Artikel berhasil dipublikasikan.', published);
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await articleService.getArticleCategories();
    return successResponse(res, 'Kategori artikel berhasil dimuat.', categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArticles,
  getArticleBySlug,
  createArticle,
  updateArticle,
  deleteArticle,
  publishArticle,
  getCategories,
};
