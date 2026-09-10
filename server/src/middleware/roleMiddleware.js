const { errorResponse } = require('../utils/responseHelper');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Akses ditolak. Silakan login terlebih dahulu.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Anda tidak memiliki hak akses untuk resource ini.', 403);
    }

    // Special check for MITRA role: must be APPROVED by ADMIN
    if (req.user.role === 'MITRA') {
      const mitraProfile = req.user.mitraProfile;
      if (!mitraProfile) {
        return errorResponse(res, 'Profil mitra tidak ditemukan. Silakan lengkapi pendaftaran.', 403);
      }

      if (mitraProfile.status === 'PENDING') {
        return errorResponse(res, 'Akun mitra Anda masih dalam proses verifikasi oleh Admin MABBACA.', 403);
      }

      if (mitraProfile.status === 'REJECTED') {
        return errorResponse(res, 'Pendaftaran mitra Anda ditolak oleh Admin. Silakan hubungi pengelola.', 403);
      }

      if (mitraProfile.status === 'SUSPENDED') {
        return errorResponse(res, 'Akun mitra Anda sedang ditangguhkan sementara waktu.', 403);
      }
    }

    next();
  };
};

const requireMitraType = (...mitraTypes) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== 'MITRA' || !req.user.mitraProfile) {
      return errorResponse(res, 'Akses khusus mitra berwenang.', 403);
    }

    if (mitraTypes.length > 0 && !mitraTypes.includes(req.user.mitraProfile.mitraType)) {
      return errorResponse(res, `Fitur ini khusus untuk mitra bertipe: ${mitraTypes.join(', ')}.`, 403);
    }

    next();
  };
};

module.exports = {
  authorize,
  requireMitraType,
};
