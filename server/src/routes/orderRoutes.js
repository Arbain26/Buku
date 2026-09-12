const express = require('express');
const { body } = require('express-validator');
const orderController = require('../controllers/orderController');
const { authenticate, optionalAuth } = require('../middleware/authMiddleware');
const { requireApprovedMitra } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');

const router = express.Router();

const orderValidation = [
  body('storeId').isInt().withMessage('ID Toko wajib ditentukan.'),
  body('items').isArray({ min: 1 }).withMessage('Item buku pesanan minimal 1.'),
  body('customerName').trim().notEmpty().withMessage('Nama pemesan wajib diisi.'),
  body('customerPhone').trim().notEmpty().withMessage('Nomor WhatsApp pemesan wajib diisi.'),
];

router.post('/', optionalAuth, orderValidation, validate, orderController.createOrder);
router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.put('/:id/status', authenticate, requireApprovedMitra, orderController.updateOrderStatus);
router.post('/:id/contact-whatsapp', optionalAuth, orderController.contactWhatsapp);

module.exports = router;
