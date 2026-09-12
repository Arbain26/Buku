const express = require('express');
const communityController = require('../controllers/communityController');
const favoriteController = require('../controllers/favoriteController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { requireApprovedMitra } = require('../middleware/roleMiddleware');
const { checkCommunityOwnership } = require('../middleware/ownershipMiddleware');

const router = express.Router();

router.get('/', optionalAuth, communityController.getCommunities);
router.get('/:id', optionalAuth, communityController.getCommunityById);
router.post('/', authenticate, requireApprovedMitra, communityController.createCommunity);
router.put('/:id', authenticate, requireApprovedMitra, checkCommunityOwnership, communityController.updateCommunity);
router.delete('/:id', authenticate, requireApprovedMitra, checkCommunityOwnership, communityController.deleteCommunity);

router.post('/:id/join', authenticate, communityController.toggleJoin);
router.delete('/:id/leave', authenticate, communityController.leaveCommunity);
router.get('/:id/members', communityController.getMembers);

// Favorite
router.post('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleCommunityFavorite(req, res, next);
});
router.delete('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleCommunityFavorite(req, res, next);
});

module.exports = router;
