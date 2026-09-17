const express = require('express');
const { body } = require('express-validator');
const borrowingController = require('../controllers/borrowingController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireApprovedMitra } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', authenticate, borrowingController.getBorrowings);
router.post(
  '/',
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
  borrowingController.createBorrowing
);
router.get('/:id', authenticate, borrowingController.getBorrowingById);

// Approve, reject, return actions
router.put('/:id/approve', authenticate, requireApprovedMitra, borrowingController.approveBorrowing);
router.put('/:id/reject', authenticate, requireApprovedMitra, borrowingController.rejectBorrowing);
router.put('/:id/return', authenticate, requireApprovedMitra, borrowingController.returnBorrowing);
router.put('/:id/status', authenticate, requireApprovedMitra, borrowingController.updateBorrowingStatus);
router.delete('/:id', authenticate, borrowingController.deleteBorrowing);

module.exports = router;
