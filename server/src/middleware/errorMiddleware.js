const { errorResponse } = require('../utils/responseHelper');

const errorHandler = (err, req, res, _next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.error(`[ERROR ${req.method} ${req.originalUrl}]:`, err.message || err);
  }

  // Custom status code from Service/Controller
  if (err.statusCode) {
    return errorResponse(res, err.message, err.statusCode, err.errors || null);
  }

  // express-validator format
  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 422, err.errors);
  }

  // Prisma unique constraint violation (P2002)
  if (err.code === 'P2002') {
    const target = err.meta?.target ? (Array.isArray(err.meta.target) ? err.meta.target.join(', ') : err.meta.target) : 'field';
    return errorResponse(res, `Data dengan ${target} tersebut sudah terdaftar dalam sistem (duplikat).`, 409);
  }

  // Prisma record not found (P2025)
  if (err.code === 'P2025') {
    return errorResponse(res, 'Data yang diminta tidak ditemukan.', 404);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Token otentikasi tidak valid.', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Sesi telah berakhir. Silakan login kembali.', 401);
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return errorResponse(
    res,
    process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan internal pada server.' : (err.message || 'Terjadi kesalahan internal.'),
    statusCode
  );
};

const notFound = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} tidak ditemukan di server MABBACA.`, 404);
};

module.exports = {
  errorHandler,
  notFound,
};
