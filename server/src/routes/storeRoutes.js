const express = require('express');
const { body } = require('express-validator');
const storeController = require('../controllers/storeController');
const favoriteController = require('../controllers/favoriteController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { requireApprovedMitra } = require('../middleware/roleMiddleware');
const { checkStoreOwnership } = require('../middleware/ownershipMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', optionalAuth, storeController.getStores);
router.get('/:id', optionalAuth, storeController.getStoreById);
router.post('/', authenticate, requireApprovedMitra, storeController.createStore);
router.put('/:id', authenticate, requireApprovedMitra, checkStoreOwnership, storeController.updateStore);
router.delete('/:id', authenticate, requireApprovedMitra, checkStoreOwnership, storeController.deleteStore);

// Store Products
router.get('/:id/products', storeController.getStoreProducts);
router.post(
  '/:id/products',
  authenticate,
  requireApprovedMitra,
  checkStoreOwnership,
  [
    body('bookId').isInt().withMessage('ID Buku wajib ditentukan.'),
    body('price').isNumeric().withMessage('Harga harus berupa angka.'),
  ],
  validate,
  storeController.addStoreProduct
);
router.put(
  '/:id/products/:productId',
  authenticate,
  requireApprovedMitra,
  checkStoreOwnership,
  storeController.updateStoreProduct
);
router.delete(
  '/:id/products/:productId',
  authenticate,
  requireApprovedMitra,
  checkStoreOwnership,
  storeController.deleteStoreProduct
);

// Favorite
router.post('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleStoreFavorite(req, res, next);
});
router.delete('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleStoreFavorite(req, res, next);
});

module.exports = router;
