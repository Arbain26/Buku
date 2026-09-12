const express = require('express');
const { body } = require('express-validator');
const eventController = require('../controllers/eventController');
const favoriteController = require('../controllers/favoriteController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { requireApprovedMitra } = require('../middleware/roleMiddleware');
const { checkEventOwnership } = require('../middleware/ownershipMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const router = express.Router();

const eventValidation = [
  body('title').trim().notEmpty().withMessage('Judul kegiatan wajib diisi.'),
  body('description').trim().notEmpty().withMessage('Deskripsi kegiatan wajib diisi.'),
  body('eventDate').notEmpty().withMessage('Tanggal kegiatan wajib ditentukan.'),
  body('startTime').notEmpty().withMessage('Waktu mulai wajib ditentukan.'),
  body('endTime').notEmpty().withMessage('Waktu selesai wajib ditentukan.'),
  body('location').notEmpty().withMessage('Lokasi kegiatan wajib ditentukan.'),
];

router.get('/', optionalAuth, eventController.getEvents);
router.get('/:id', optionalAuth, eventController.getEventById);
router.post(
  '/',
  authenticate,
  requireApprovedMitra,
  uploadSingle('image'),
  eventValidation,
  validate,
  eventController.createEvent
);
router.put(
  '/:id',
  authenticate,
  requireApprovedMitra,
  checkEventOwnership,
  uploadSingle('image'),
  eventController.updateEvent
);
router.delete('/:id', authenticate, requireApprovedMitra, checkEventOwnership, eventController.deleteEvent);

// Event registration
router.post('/:id/register', authenticate, eventController.registerEvent);
router.delete('/:id/register', authenticate, eventController.cancelRegistration);
router.get('/:id/participants', authenticate, requireApprovedMitra, checkEventOwnership, eventController.getParticipants);
router.post(
  '/:id/check-in',
  authenticate,
  requireApprovedMitra,
  checkEventOwnership,
  [body('userId').isInt().withMessage('ID Peserta wajib ditentukan.')],
  validate,
  eventController.checkInParticipant
);

// Favorite
router.post('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleEventFavorite(req, res, next);
});
router.delete('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleEventFavorite(req, res, next);
});

module.exports = router;
