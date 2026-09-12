const userService = require('../services/user.service');
const { successResponse, paginateResponse } = require('../utils/responseHelper');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, role, district } = req.query;
    const result = await userService.getUsers({ page, limit, search, role, district });
    return paginateResponse(res, 'Daftar pengguna berhasil diambil.', result.users, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    return successResponse(res, 'Detail pengguna berhasil diambil.', user);
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const updated = await userService.updateUser(req.params.id, req.body);
    return successResponse(res, 'Data pengguna berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    return successResponse(res, 'Pengguna berhasil dinonaktifkan.');
  } catch (error) {
    next(error);
  }
};

const getUserDashboard = async (req, res, next) => {
  try {
    const dashboard = await userService.getUserDashboard(req.user.id);
    return successResponse(res, 'Dashboard pengguna berhasil dimuat.', dashboard);
  } catch (error) {
    next(error);
  }
};

const completeMission = async (req, res, next) => {
  try {
    const result = await userService.completeMission(req.user.id, req.params.missionId);
    return successResponse(res, 'Misi berhasil diselesaikan! Poin telah ditambahkan.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserDashboard,
  completeMission,
};
