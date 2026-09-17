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
    body('libraryId').isInt().withMessage('ID Perpustakaan wajib ditentukan.'),
    body('bookId').isInt().withMessage('ID Buku wajib ditentukan.'),
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
