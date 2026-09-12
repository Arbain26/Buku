const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authenticate, requireAdmin, userController.getUsers);
router.get('/dashboard', authenticate, userController.getUserDashboard);
router.post('/missions/:missionId/complete', authenticate, userController.completeMission);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, requireAdmin, userController.deleteUser);

module.exports = router;
