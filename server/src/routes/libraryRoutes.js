const express = require('express');
const { body } = require('express-validator');
const libraryController = require('../controllers/libraryController');
const favoriteController = require('../controllers/favoriteController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { requireApprovedMitra } = require('../middleware/roleMiddleware');
const { checkLibraryOwnership } = require('../middleware/ownershipMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', optionalAuth, libraryController.getLibraries);
router.get('/:id', optionalAuth, libraryController.getLibraryById);
router.post('/', authenticate, requireApprovedMitra, libraryController.createLibrary);
router.put('/:id', authenticate, requireApprovedMitra, checkLibraryOwnership, libraryController.updateLibrary);
router.delete('/:id', authenticate, requireApprovedMitra, checkLibraryOwnership, libraryController.deleteLibrary);

// Library Collections
router.get('/:id/collections', libraryController.getLibraryCollections);
router.post(
  '/:id/collections',
  authenticate,
  requireApprovedMitra,
  checkLibraryOwnership,
  [body('bookId').isInt().withMessage('ID Buku wajib ditentukan.')],
  validate,
  libraryController.addLibraryCollection
);
router.put(
  '/:id/collections/:collectionId',
  authenticate,
  requireApprovedMitra,
  checkLibraryOwnership,
  libraryController.updateLibraryCollection
);
router.delete(
  '/:id/collections/:collectionId',
  authenticate,
  requireApprovedMitra,
  checkLibraryOwnership,
  libraryController.deleteLibraryCollection
);

// Borrow request endpoint
router.post(
  '/borrow',
  authenticate,
  [
    body('libraryId').optional().isInt().withMessage('ID Perpustakaan harus berupa angka.'),
    body('bookId').optional().isInt().withMessage('ID Buku harus berupa angka.'),
    body('collectionId').optional().isInt().withMessage('ID Koleksi harus berupa angka.'),
    body().custom((val) => {
      if (!val.collectionId && (!val.libraryId || !val.bookId)) {
        throw new Error('ID Perpustakaan dan ID Buku, atau ID Koleksi wajib ditentukan.');
      }
      return true;
    }),
  ],
  validate,
  libraryController.requestBorrow
);

// Favorite
router.post('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleLibraryFavorite(req, res, next);
});
router.delete('/:id/favorite', authenticate, (req, res, next) => {
  favoriteController.toggleLibraryFavorite(req, res, next);
});

module.exports = router;
