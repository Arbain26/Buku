const notificationService = require('../services/notification.service');
const { successResponse, paginateResponse } = require('../utils/responseHelper');

const getNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const result = await notificationService.getUserNotifications(req.user.id, { page, limit });
    return paginateResponse(res, 'Notifikasi berhasil dimuat.', result.notifications, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    return successResponse(res, 'Notifikasi ditandai telah dibaca.');
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    return successResponse(res, 'Semua notifikasi ditandai telah dibaca.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
