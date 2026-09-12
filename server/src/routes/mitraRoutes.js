const express = require('express');
const mitraController = require('../controllers/mitraController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireMitra, requireApprovedMitra } = require('../middleware/roleMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/profile', authenticate, requireMitra, mitraController.getMitraProfile);
router.put('/profile', authenticate, requireMitra, uploadSingle('logo'), mitraController.updateMitraProfile);
router.get('/dashboard', authenticate, requireMitra, mitraController.getMitraDashboard);
router.get('/statistics', authenticate, requireMitra, mitraController.getMitraStatistics);

// Kompatibilitas frontend Mitra: inventory & borrowing status
router.post('/inventory', authenticate, requireApprovedMitra, uploadSingle('coverImage'), mitraController.addInventory);
router.put('/inventory/:id', authenticate, requireApprovedMitra, mitraController.updateInventory);
router.delete('/inventory/:id', authenticate, requireApprovedMitra, mitraController.deleteInventory);
router.put('/borrowings/:id/status', authenticate, requireApprovedMitra, mitraController.updateBorrowingStatus);

module.exports = router;
