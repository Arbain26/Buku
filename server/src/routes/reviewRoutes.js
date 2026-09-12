const express = require('express');
const { body } = require('express-validator');
const reviewController = require('../controllers/reviewController');
const { authenticate } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', reviewController.getReviews);
router.post(
  '/',
  authenticate,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus 1 sampai 5.'),
    body('comment').trim().notEmpty().withMessage('Komentar ulasan wajib diisi.'),
  ],
  validate,
  reviewController.createReview
);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

module.exports = router;
