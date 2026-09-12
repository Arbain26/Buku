const { errorResponse } = require('../utils/responseHelper');

// Memastikan role user termasuk dalam allowed roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Akses ditolak. Silakan login terlebih dahulu.', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 'Anda tidak memiliki hak akses (role) untuk resource ini.', 403);
    }

    next();
  };
};

// Shortcut middleware untuk ADMIN
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return errorResponse(res, 'Akses khusus Administrator MABBACA.', 403);
  }
  next();
};

// Middleware untuk role MITRA (bisa pending atau approved)
const requireMitra = (req, res, next) => {
  if (!req.user || req.user.role !== 'MITRA') {
    return errorResponse(res, 'Akses khusus pengguna dengan peran MITRA.', 403);
  }
  next();
};

// Middleware untuk MITRA yang sudah APPROVED oleh Admin
const requireApprovedMitra = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Silakan login terlebih dahulu.', 401);
  }

  // Admin selalu boleh mengakses
  if (req.user.role === 'ADMIN') {
    return next();
  }

  if (req.user.role !== 'MITRA') {
    return errorResponse(res, 'Akses khusus mitra terdaftar.', 403);
  }

  const profile = req.user.mitraProfile;
  if (!profile) {
    return errorResponse(res, 'Profil mitra tidak ditemukan. Silakan lengkapi pendaftaran.', 403);
  }

  if (profile.status === 'PENDING') {
    return errorResponse(res, 'Akun mitra Anda masih dalam proses peninjauan (PENDING) oleh Admin MABBACA.', 403);
  }

  if (profile.status === 'REJECTED') {
    return errorResponse(
      res,
      `Pendaftaran mitra Anda ditolak.${profile.rejectionReason ? ` Alasan: ${profile.rejectionReason}` : ''}`,
      403
    );
  }

  if (profile.status === 'SUSPENDED') {
    return errorResponse(res, 'Akun mitra Anda sedang ditangguhkan (SUSPENDED) sementara waktu.', 403);
  }

  next();
};

// Filter spesifik mitra_type (contoh: TOKO_BUKU, PERPUSTAKAAN, KOMUNITAS)
const requireMitraType = (...mitraTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Silakan login terlebih dahulu.', 401);
    }

    if (req.user.role === 'ADMIN') {
      return next();
    }

    if (req.user.role !== 'MITRA' || !req.user.mitraProfile) {
      return errorResponse(res, 'Akses khusus mitra terverifikasi.', 403);
    }

    if (mitraTypes.length > 0 && !mitraTypes.includes(req.user.mitraProfile.mitraType)) {
      return errorResponse(res, `Fitur ini khusus untuk mitra bertipe: ${mitraTypes.join(', ')}.`, 403);
    }

    next();
  };
};

module.exports = {
  authorize,
  requireAdmin,
  requireMitra,
  requireApprovedMitra,
  requireMitraType,
};
