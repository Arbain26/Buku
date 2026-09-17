const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.getAdminDashboard);
router.get('/statistics', adminController.getAdminStatistics);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/mitra', adminController.getMitraList);
router.put('/mitra/:id', adminController.updateMitra);
router.delete('/mitra/:id', adminController.deleteMitra);
router.get('/pending-mitra', adminController.getPendingMitra);
router.put('/mitra/:id/approve', adminController.approveMitra);
router.put('/mitra/:id/reject', adminController.rejectMitra);
router.put('/mitra/:id/suspend', adminController.suspendMitra);
router.put('/mitra/:id/verify', adminController.verifyMitra);
router.get('/events', adminController.getEvents);
router.get('/books', adminController.getBooks);
router.get('/articles', adminController.getArticles);
router.get('/reports', adminController.getReports);
router.get('/literacy-stats', adminController.getLiteracyStats);

module.exports = router;
