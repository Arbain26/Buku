const favoriteService = require('../services/favorite.service');
const { successResponse } = require('../utils/responseHelper');

const getUserFavorites = async (req, res, next) => {
  try {
    const favorites = await favoriteService.getUserFavorites(req.user.id);
    return successResponse(res, 'Daftar favorit berhasil dimuat.', favorites);
  } catch (error) {
    next(error);
  }
};

const toggleBookFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.toggleBookFavorite(req.user.id, req.params.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

const toggleStoreFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.toggleStoreFavorite(req.user.id, req.params.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

const toggleLibraryFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.toggleLibraryFavorite(req.user.id, req.params.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

const toggleCommunityFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.toggleCommunityFavorite(req.user.id, req.params.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

const toggleEventFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.toggleEventFavorite(req.user.id, req.params.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

const toggleArticleFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.toggleArticleFavorite(req.user.id, req.params.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserFavorites,
  toggleBookFavorite,
  toggleStoreFavorite,
  toggleLibraryFavorite,
  toggleCommunityFavorite,
  toggleEventFavorite,
  toggleArticleFavorite,
};
