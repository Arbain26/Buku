const orderService = require('../services/order.service');
const { successResponse, paginateResponse, errorResponse } = require('../utils/responseHelper');

const createOrder = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { storeId, items, customerName, customerPhone, customerAddress, notes } = req.body;

    if (!storeId || !items || !customerName || !customerPhone) {
      return errorResponse(res, 'Toko, item pesanan, nama, dan nomor telepon pemesan wajib diisi.', 400);
    }

    const result = await orderService.createOrder(userId, {
      storeId,
      items,
      customerName,
      customerPhone,
      customerAddress,
      notes,
    });

    return successResponse(res, 'Pesanan berhasil dibuat. Silakan hubungi toko via WhatsApp.', result, 201);
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const result = await orderService.getOrders(req.user, { page, limit, status });
    return paginateResponse(res, 'Daftar pesanan berhasil dimuat.', result.orders, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id, req.user);
    return successResponse(res, 'Detail pesanan berhasil dimuat.', order);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return errorResponse(res, 'Status pesanan wajib ditentukan.', 400);
    }
    const updated = await orderService.updateOrderStatus(req.params.id, status, req.user);
    return successResponse(res, `Status pesanan berhasil diperbarui menjadi ${status}.`, updated);
  } catch (error) {
    next(error);
  }
};

const contactWhatsapp = async (req, res, next) => {
  try {
    const result = await orderService.contactWhatsapp(req.params.id);
    return successResponse(res, 'Link WhatsApp berhasil dibuat.', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  contactWhatsapp,
};
