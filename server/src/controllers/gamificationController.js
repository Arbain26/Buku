const gamificationService = require('../services/gamification.service');
const { successResponse, paginateResponse } = require('../utils/responseHelper');

const getMissions = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const missions = await gamificationService.getMissions(userId);
    return successResponse(res, 'Daftar misi literasi berhasil dimuat.', missions);
  } catch (error) {
    next(error);
  }
};

const getLeaderboard = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;
    const leaderboard = await gamificationService.getLeaderboard(limit);
    return successResponse(res, 'Papan peringkat literasi berhasil dimuat.', leaderboard);
  } catch (error) {
    next(error);
  }
};

const getUserActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const result = await gamificationService.getUserActivities(req.user.id, { page, limit });
    return paginateResponse(res, 'Riwayat aktivitas literasi berhasil dimuat.', result.activities, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMissions,
  getLeaderboard,
  getUserActivities,
};
