const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const { authenticate } = require('../middleware/authMiddleware');

router.get('/', libraryController.getLibraries);
router.get('/:id', libraryController.getLibraryById);
router.post('/borrow', authenticate, libraryController.requestBorrow);

module.exports = router;
