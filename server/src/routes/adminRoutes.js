const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require authentication and ADMIN role
router.use(authenticate, authorize('ADMIN'));

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/pending-mitra', adminController.getPendingMitra);
router.put('/mitra/:id/verify', adminController.verifyMitra);
router.get('/literacy-stats', adminController.getLiteracyStatsByDistrict);
router.get('/users', adminController.getAllUsers);

module.exports = router;
