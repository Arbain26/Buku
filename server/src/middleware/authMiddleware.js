const { verifyToken } = require('../config/jwt');
const prisma = require('../config/db');
const { errorResponse } = require('../utils/responseHelper');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Token otentikasi tidak ditemukan. Silakan login terlebih dahulu.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        mitraProfile: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'Pengguna tidak ditemukan atau token tidak valid.', 401);
    }

    if (!user.isActive || user.deletedAt) {
      return errorResponse(res, 'Akun Anda telah dinonaktifkan atau ditangguhkan.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Sesi telah berakhir. Silakan login kembali.', 401);
    }
    return errorResponse(res, 'Token tidak valid atau telah dimodifikasi.', 401);
  }
};

// Optional auth: attaches user if token is present, but doesn't block if not
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          mitraProfile: true,
        },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch {
    // Ignore invalid tokens for optional endpoints
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
};
