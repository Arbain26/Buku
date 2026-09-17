const adminService = require('../services/admin.service');
const userService = require('../services/user.service');
const bookService = require('../services/book.service');
const eventService = require('../services/event.service');
const articleService = require('../services/article.service');
const { successResponse, paginateResponse, errorResponse } = require('../utils/responseHelper');

const getAdminDashboard = async (req, res, next) => {
  try {
    const dashboard = await adminService.getAdminDashboard();
    return successResponse(res, 'Statistik admin dashboard berhasil dimuat.', dashboard);
  } catch (error) {
    next(error);
  }
};

const getAdminStatistics = async (req, res, next) => {
  try {
    const dashboard = await adminService.getAdminDashboard();
    return successResponse(res, 'Statistik platform MABBACA berhasil dimuat.', dashboard);
  } catch (error) {
    next(error);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, district } = req.query;
    const result = await userService.getUsers({ page, limit, search, role, district });
    return paginateResponse(res, 'Daftar pengguna berhasil dimuat.', result.users, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getMitraList = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const result = await adminService.getMitraList({ status, page, limit, search });
    return paginateResponse(res, 'Daftar mitra berhasil dimuat.', result.mitra, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

// Kompatibilitas frontend Prompt 1: getPendingMitra
const getPendingMitra = async (req, res, next) => {
  try {
    const result = await adminService.getMitraList({ status: 'PENDING', page: 1, limit: 100 });
    return successResponse(res, 'Daftar mitra pending verifikasi berhasil dimuat.', result.mitra);
  } catch (error) {
    next(error);
  }
};

const approveMitra = async (req, res, next) => {
  try {
    const updated = await adminService.approveMitra(req.params.id);
    return successResponse(res, 'Mitra berhasil disetujui.', updated);
  } catch (error) {
    next(error);
  }
};

const rejectMitra = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const updated = await adminService.rejectMitra(req.params.id, reason);
    return successResponse(res, 'Mitra berhasil ditolak.', updated);
  } catch (error) {
    next(error);
  }
};

const suspendMitra = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const updated = await adminService.suspendMitra(req.params.id, reason);
    return successResponse(res, 'Mitra berhasil ditangguhkan.', updated);
  } catch (error) {
    next(error);
  }
};

// Kompatibilitas frontend Prompt 1: verifyMitra
const verifyMitra = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (status === 'APPROVED') {
      const updated = await adminService.approveMitra(req.params.id);
      return successResponse(res, 'Mitra berhasil diverifikasi dan disetujui.', updated);
    } else if (status === 'REJECTED') {
      const updated = await adminService.rejectMitra(req.params.id, reason);
      return successResponse(res, 'Pendaftaran mitra berhasil ditolak.', updated);
    } else if (status === 'SUSPENDED') {
      const updated = await adminService.suspendMitra(req.params.id, reason);
      return successResponse(res, 'Mitra berhasil ditangguhkan.', updated);
    }
    return errorResponse(res, 'Status tidak valid. Gunakan APPROVED, REJECTED, atau SUSPENDED.', 400);
  } catch (error) {
    next(error);
  }
};

const getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await eventService.getEvents({ page, limit });
    return paginateResponse(res, 'Daftar kegiatan literasi berhasil dimuat.', result.events, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await bookService.getBooks({ page, limit });
    return paginateResponse(res, 'Daftar buku berhasil dimuat.', result.books, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getArticles = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await articleService.getArticles({ page, limit, status: null });
    return paginateResponse(res, 'Daftar artikel berhasil dimuat.', result.articles, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const reports = await adminService.getAdminReports();
    return successResponse(res, 'Laporan ekosistem platform berhasil dimuat.', reports);
  } catch (error) {
    next(error);
  }
};

// Kompatibilitas frontend Prompt 1: getLiteracyStats
const getLiteracyStats = async (req, res, next) => {
  try {
    const dashboard = await adminService.getAdminDashboard();
    return successResponse(res, 'Statistik literasi daerah berhasil dimuat.', {
      growthData: dashboard.growthData,
      districtStats: dashboard.districtStats,
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const updated = await adminService.updateUser(req.params.id, req.body);
    return successResponse(res, 'Data pengguna berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const result = await adminService.deleteUser(req.params.id, req.user?.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

const updateMitra = async (req, res, next) => {
  try {
    const updated = await adminService.updateMitra(req.params.id, req.body);
    return successResponse(res, 'Data mitra berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteMitra = async (req, res, next) => {
  try {
    const result = await adminService.deleteMitra(req.params.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getAdminStatistics,
  getAllUsers,
  updateUser,
  deleteUser,
  getMitraList,
  getPendingMitra,
  approveMitra,
  rejectMitra,
  suspendMitra,
  verifyMitra,
  updateMitra,
  deleteMitra,
  getEvents,
  getBooks,
  getArticles,
  getReports,
  getLiteracyStats,
};
