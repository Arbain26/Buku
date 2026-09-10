const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../config/multer');

router.post('/register', authController.register);
router.post('/register-mitra', authController.registerMitra);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, upload.single('avatar'), authController.updateProfile);
router.put('/change-password', authenticate, authController.changePassword);

module.exports = router;
