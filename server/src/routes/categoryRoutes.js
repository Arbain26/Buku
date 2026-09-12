const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.post(
  '/',
  authenticate,
  requireAdmin,
  [body('name').trim().notEmpty().withMessage('Nama kategori wajib diisi.')],
  validate,
  categoryController.createCategory
);
router.put('/:id', authenticate, requireAdmin, categoryController.updateCategory);
router.delete('/:id', authenticate, requireAdmin, categoryController.deleteCategory);

module.exports = router;
