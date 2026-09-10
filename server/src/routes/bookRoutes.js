const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../config/multer');

router.get('/', bookController.getBooks);
router.get('/categories', bookController.getCategories);
router.get('/:id', optionalAuth, bookController.getBookById);
router.post('/:id/favorite', authenticate, bookController.toggleFavorite);
router.post('/:id/reviews', authenticate, bookController.addReview);
router.post('/', authenticate, authorize('ADMIN', 'MITRA'), upload.single('coverImage'), bookController.createBook);
router.put('/:id', authenticate, authorize('ADMIN', 'MITRA'), upload.single('coverImage'), bookController.updateBook);
router.delete('/:id', authenticate, authorize('ADMIN'), bookController.deleteBook);

module.exports = router;
