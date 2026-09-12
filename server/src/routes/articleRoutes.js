const express = require('express');
const { body } = require('express-validator');
const articleController = require('../controllers/articleController');
const favoriteController = require('../controllers/favoriteController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { requireApprovedMitra } = require('../middleware/roleMiddleware');
const { checkArticleOwnership } = require('../middleware/ownershipMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const router = express.Router();

const articleValidation = [
  body('title').trim().notEmpty().withMessage('Judul artikel wajib diisi.'),
  body('excerpt').trim().notEmpty().withMessage('Ringkasan artikel wajib diisi.'),
  body('content').trim().notEmpty().withMessage('Isi konten artikel wajib diisi.'),
];

router.get('/', articleController.getArticles);
router.get('/categories', articleController.getCategories);
router.get('/:slug', optionalAuth, articleController.getArticleBySlug);

router.post(
  '/',
  authenticate,
  requireApprovedMitra,
  uploadSingle('thumbnail'),
  articleValidation,
  validate,
  articleController.createArticle
);
router.put(
  '/:id',
  authenticate,
  checkArticleOwnership,
  uploadSingle('thumbnail'),
  articleController.updateArticle
);
router.delete('/:id', authenticate, checkArticleOwnership, articleController.deleteArticle);
router.post('/:id/publish', authenticate, checkArticleOwnership, articleController.publishArticle);

// Favorite
router.post('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleArticleFavorite(req, res, next);
});
router.delete('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleArticleFavorite(req, res, next);
});

module.exports = router;
