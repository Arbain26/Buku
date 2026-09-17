const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { authLimiter, adminAuthLimiter, registerLimiter } = require('../middleware/rateLimitMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Validasi Login
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Format email tidak valid.'),
  body('password').notEmpty().withMessage('Kata sandi wajib diisi.'),
];

// Validasi Register
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Nama lengkap wajib diisi.'),
  body('email').isEmail().normalizeEmail().withMessage('Format email tidak valid.'),
  body('password').isLength({ min: 6 }).withMessage('Kata sandi minimal 6 karakter.'),
  body('phone')
    .optional({ values: 'falsy' })
    .custom((val) => {
      if (!val || val.trim() === '') return true;
      const cleaned = val.replace(/[\s\-\+]/g, '');
      if (/^(62|08)[0-9]{8,13}$/.test(cleaned)) {
        return true;
      }
      throw new Error('Format nomor HP tidak valid (contoh: 08123456789 atau 628123456789).');
    }),
];

// Validasi Register Mitra
const registerMitraValidation = [
  ...registerValidation,
  body('phoneWa')
    .optional({ values: 'falsy' })
    .custom((val) => {
      if (!val || val.trim() === '') return true;
      const cleaned = val.replace(/[\s\-\+]/g, '');
      if (/^(62|08)[0-9]{8,13}$/.test(cleaned)) {
        return true;
      }
      throw new Error('Format nomor WhatsApp tidak valid (contoh: 08123456789 atau 628123456789).');
    }),
  body('mitraType')
    .isIn(['TOKO_BUKU', 'PERPUSTAKAAN', 'KOMUNITAS'])
    .withMessage('Jenis mitra tidak valid.'),
  body('organizationName').trim().notEmpty().withMessage('Nama organisasi / institusi wajib diisi.'),
];

router.post('/register', registerLimiter, registerValidation, validate, authController.register);
router.post('/register-mitra', registerLimiter, registerMitraValidation, validate, authController.registerMitra);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/admin-login', adminAuthLimiter, loginValidation, validate, authController.adminLogin);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, uploadSingle('avatar'), authController.updateProfile);
router.put(
  '/change-password',
  authenticate,
  [body('newPassword').isLength({ min: 6 }).withMessage('Kata sandi baru minimal 6 karakter.')],
  validate,
  authController.changePassword
);

module.exports = router;
