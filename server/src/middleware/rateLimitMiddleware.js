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
  max: process.env.NODE_ENV === 'development' ? 500 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan otentikasi. Silakan coba kembali setelah 15 menit.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// Rate limiter ekstra ketat khusus untuk portal masuk Administrator
const adminAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: process.env.NODE_ENV === 'development' ? 100 : 5, // Maksimal 5 percobaan pada mode produksi
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Akses dibatasi: Terlalu banyak percobaan login Administrator. Akun Anda ditangguhkan sementara selama 15 menit demi keamanan.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

// Rate limiter pendaftaran untuk mencegah bot spamming pendaftaran akun
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: process.env.NODE_ENV === 'development' ? 200 : 10, // Maksimal 10 pendaftaran per jam per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Batas pendaftaran tercapai dari alamat IP ini. Silakan coba kembali dalam 1 jam.',
  },
  skip: () => process.env.NODE_ENV === 'test',
});

module.exports = {
  generalLimiter,
  authLimiter,
  adminAuthLimiter,
  registerLimiter,
};
