const express = require('express');
const router = express.Router();
const mitraController = require('../controllers/mitraController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../config/multer');

// All mitra routes require authentication and MITRA role with status APPROVED
router.use(authenticate, authorize('MITRA'));

router.get('/dashboard', mitraController.getMitraDashboard);
router.post('/inventory', upload.single('coverImage'), mitraController.addInventoryItem);
router.put('/inventory/:id', mitraController.updateInventoryItem);
router.delete('/inventory/:id', mitraController.deleteInventoryItem);
router.put('/borrowings/:id/status', mitraController.updateBorrowingStatus);

module.exports = router;
