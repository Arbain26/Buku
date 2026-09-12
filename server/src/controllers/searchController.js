const searchService = require('../services/search.service');
const { paginateResponse, successResponse } = require('../utils/responseHelper');

const universalSearch = async (req, res, next) => {
  try {
    const {
      q = '',
      type = 'all',
      filter,
      category,
      district,
      latitude,
      longitude,
      userLat,
      userLng,
      page = 1,
      limit = 12,
    } = req.query;

    const result = await searchService.universalSearch({
      q,
      type,
      filter,
      category,
      district,
      latitude,
      longitude,
      userLat,
      userLng,
      page,
      limit,
    });

    // Kompatibilitas respons format Prompt 1 & Prompt 2
    return res.status(200).json({
      success: true,
      message: 'Hasil pencarian universal berhasil dimuat.',
      data: {
        query: result.query,
        counts: result.counts,
        results: result.results,
      },
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit) || 1,
      },
      pagination: {
        currentPage: result.page,
        perPage: result.limit,
        totalItems: result.total,
        totalPages: Math.ceil(result.total / result.limit) || 1,
        hasNextPage: result.page < (Math.ceil(result.total / result.limit) || 1),
        hasPrevPage: result.page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  universalSearch,
};
