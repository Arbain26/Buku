const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../config/multer');

router.get('/', eventController.getEvents);
router.get('/:id', optionalAuth, eventController.getEventById);
router.post('/:id/register', authenticate, eventController.registerEvent);
router.post('/', authenticate, authorize('ADMIN', 'MITRA'), upload.single('banner'), eventController.createEvent);

module.exports = router;
