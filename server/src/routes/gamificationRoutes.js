const express = require('express');
const gamificationController = require('../controllers/gamificationController');
const userController = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/missions', optionalAuth, gamificationController.getMissions);
router.get('/leaderboard', gamificationController.getLeaderboard);
router.get('/activities', authenticate, gamificationController.getUserActivities);
router.post('/missions/:missionId/complete', authenticate, userController.completeMission);

module.exports = router;
