const express = require('express');
const { body } = require('express-validator');
const bookController = require('../controllers/bookController');
const reviewController = require('../controllers/reviewController');
const favoriteController = require('../controllers/favoriteController');
const categoryController = require('../controllers/categoryController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const router = express.Router();

const bookValidation = [
  body('title').trim().notEmpty().withMessage('Judul buku wajib diisi.'),
  body('author').trim().notEmpty().withMessage('Nama penulis wajib diisi.'),
  body('description').trim().notEmpty().withMessage('Deskripsi buku wajib diisi.'),
  body('categoryId').isInt().withMessage('Kategori buku wajib ditentukan.'),
];

router.get('/categories', categoryController.getCategories);
router.get('/', optionalAuth, bookController.getBooks);
router.get('/:id', optionalAuth, bookController.getBookById);
router.post('/', authenticate, requireAdmin, uploadSingle('coverImage'), bookValidation, validate, bookController.createBook);
router.put('/:id', authenticate, requireAdmin, uploadSingle('coverImage'), bookController.updateBook);
router.delete('/:id', authenticate, requireAdmin, bookController.deleteBook);

router.get('/:id/stores', bookController.getBookStores);
router.get('/:id/libraries', bookController.getBookLibraries);
router.get('/:id/reviews', bookController.getBookReviews);

// Add review to book
router.post(
  '/:id/reviews',
  authenticate,
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating harus 1 sampai 5.'),
    body('comment').trim().notEmpty().withMessage('Ulasan wajib diisi.'),
  ],
  validate,
  (req, res, next) => {
    req.body.bookId = req.params.id;
    reviewController.createReview(req, res, next);
  }
);

// Toggle favorite
router.post('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleBookFavorite(req, res, next);
});

router.delete('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleBookFavorite(req, res, next);
});

module.exports = router;
