const express = require('express');
const searchController = require('../controllers/searchController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', optionalAuth, searchController.universalSearch);

module.exports = router;
