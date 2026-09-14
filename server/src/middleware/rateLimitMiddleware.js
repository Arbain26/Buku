const rateLimit = require('express-rate-limit');

// Rate limiter umum untuk semua API
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // Maksimal 1000 request per IP per 15 menit
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini. Silakan coba kembali beberapa saat lagi.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// Rate limiter ketat untuk rute otentikasi (mencegah brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: process.env.NODE_ENV === 'development' ? 500 : 30, // Toleransi tinggi untuk mode pengembangan
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan otentikasi. Silakan coba kembali setelah beberapa saat.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = {
  generalLimiter,
  authLimiter,
};
