const express = require('express');
const router = express.Router();
const articleController = require('../controllers/articleController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/', articleController.getArticles);
router.get('/categories', articleController.getArticleCategories);
router.get('/:id', optionalAuth, articleController.getArticleById);

module.exports = router;
