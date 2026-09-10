const { errorResponse } = require('../utils/responseHelper');

const errorHandler = (err, req, res, _next) => {
  console.error('Server Error:', err);

  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 422, err.errors);
  }

  if (err.code === 'P2002') {
    // Prisma unique constraint violation
    const target = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return errorResponse(res, `Data dengan ${target} tersebut sudah terdaftar dalam sistem.`, 409);
  }

  if (err.code === 'P2025') {
    // Prisma record not found
    return errorResponse(res, 'Data yang diminta tidak ditemukan.', 404);
  }

  return errorResponse(
    res,
    process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan internal pada server.' : err.message,
    500
  );
};

const notFound = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} tidak ditemukan di server MABBACA.`, 404);
};

module.exports = {
  errorHandler,
  notFound,
};
