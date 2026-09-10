const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/dashboard', authenticate, userController.getUserDashboard);
router.post('/missions/:id/complete', authenticate, userController.completeMission);

module.exports = router;
