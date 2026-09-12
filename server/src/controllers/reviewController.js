const reviewService = require('../services/review.service');
const { successResponse, paginateResponse } = require('../utils/responseHelper');

const getReviews = async (req, res, next) => {
  try {
    const { bookId, storeId, libraryId, communityId, eventId, page = 1, limit = 10 } = req.query;
    const result = await reviewService.getReviews({
      bookId,
      storeId,
      libraryId,
      communityId,
      eventId,
      page,
      limit,
    });
    return paginateResponse(res, 'Ulasan berhasil dimuat.', result.reviews, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user.id, req.body);
    return successResponse(res, 'Ulasan Anda berhasil dikirimkan (+10 poin).', review, 201);
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const updated = await reviewService.updateReview(req.params.id, req.user.id, req.body);
    return successResponse(res, 'Ulasan berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user);
    return successResponse(res, 'Ulasan berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
};
