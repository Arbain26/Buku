const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, 'Pendaftaran berhasil. Selamat datang di MABBACA!', result, 201);
  } catch (error) {
    next(error);
  }
};

const registerMitra = async (req, res, next) => {
  try {
    const result = await authService.registerMitra(req.body);
    return successResponse(
      res,
      'Pendaftaran mitra berhasil! Akun Anda sedang menunggu verifikasi oleh Admin.',
      result,
      201
    );
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email dan kata sandi wajib diisi.', 400);
    }
    const result = await authService.login({ email, password });
    return successResponse(res, 'Login berhasil. Selamat datang kembali!', result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  // JWT bersifat stateless; logout di-handle di sisi client dengan menghapus token
  return successResponse(res, 'Logout berhasil. Sesi telah diakhiri.');
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, 'Profil pengguna berhasil diambil.', user);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await authService.updateProfile(req.user.id, req.body, req.file);
    return successResponse(res, 'Profil berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return errorResponse(res, 'Kata sandi saat ini dan kata sandi baru wajib diisi.', 400);
    }
    await authService.changePassword(req.user.id, { currentPassword, newPassword });
    return successResponse(res, 'Kata sandi berhasil diubah.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerMitra,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
};
