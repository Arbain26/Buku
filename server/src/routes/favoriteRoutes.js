const express = require('express');
const favoriteController = require('../controllers/favoriteController');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticate, favoriteController.getUserFavorites);

// Resource-specific favorite endpoints
router.post('/books/:id', authenticate, favoriteController.toggleBookFavorite);
router.delete('/books/:id', authenticate, favoriteController.toggleBookFavorite);

router.post('/stores/:id', authenticate, favoriteController.toggleStoreFavorite);
router.delete('/stores/:id', authenticate, favoriteController.toggleStoreFavorite);

router.post('/libraries/:id', authenticate, favoriteController.toggleLibraryFavorite);
router.delete('/libraries/:id', authenticate, favoriteController.toggleLibraryFavorite);

router.post('/communities/:id', authenticate, favoriteController.toggleCommunityFavorite);
router.delete('/communities/:id', authenticate, favoriteController.toggleCommunityFavorite);

router.post('/events/:id', authenticate, favoriteController.toggleEventFavorite);
router.delete('/events/:id', authenticate, favoriteController.toggleEventFavorite);

router.post('/articles/:id', authenticate, favoriteController.toggleArticleFavorite);
router.delete('/articles/:id', authenticate, favoriteController.toggleArticleFavorite);

module.exports = router;
