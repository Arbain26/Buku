const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');

router.get('/', communityController.getCommunities);
router.get('/:id', optionalAuth, communityController.getCommunityById);
router.post('/:id/join', authenticate, communityController.toggleJoinCommunity);

module.exports = router;
