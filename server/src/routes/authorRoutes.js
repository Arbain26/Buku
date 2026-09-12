const express = require('express');
const { body } = require('express-validator');
const authorController = require('../controllers/authorController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', authorController.getAuthors);
router.get('/:id', authorController.getAuthorById);
router.post(
  '/',
  authenticate,
  requireAdmin,
  uploadSingle('avatar'),
  [body('name').trim().notEmpty().withMessage('Nama penulis wajib diisi.')],
  validate,
  authorController.createAuthor
);
router.put('/:id', authenticate, requireAdmin, uploadSingle('avatar'), authorController.updateAuthor);
router.delete('/:id', authenticate, requireAdmin, authorController.deleteAuthor);

module.exports = router;
