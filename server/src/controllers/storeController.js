const storeService = require('../services/store.service');
const prisma = require('../config/db');
const { successResponse, paginateResponse, errorResponse } = require('../utils/responseHelper');

const getStores = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, district, userLat, userLng } = req.query;
    const result = await storeService.getStores({ page, limit, search, district, userLat, userLng });
    return paginateResponse(res, 'Daftar toko buku berhasil dimuat.', result.stores, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getStoreById = async (req, res, next) => {
  try {
    const { userLat, userLng } = req.query;
    const store = await storeService.getStoreById(req.params.id, userLat, userLng);
    return successResponse(res, 'Detail toko buku berhasil dimuat.', store);
  } catch (error) {
    next(error);
  }
};

const createStore = async (req, res, next) => {
  try {
    const mitraId = req.user.mitraProfile.id;
    const store = await storeService.createStore(mitraId, req.body, req.files);
    return successResponse(res, 'Toko buku berhasil didaftarkan.', store, 201);
  } catch (error) {
    next(error);
  }
};

const updateStore = async (req, res, next) => {
  try {
    const updated = await storeService.updateStore(req.params.id, req.body, req.files);
    return successResponse(res, 'Data toko buku berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteStore = async (req, res, next) => {
  try {
    await storeService.deleteStore(req.params.id);
    return successResponse(res, 'Toko buku berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

// Store Products
const getStoreProducts = async (req, res, next) => {
  try {
    const products = await storeService.getStoreProducts(req.params.id);
    return successResponse(res, 'Daftar produk toko berhasil dimuat.', products);
  } catch (error) {
    next(error);
  }
};

const addStoreProduct = async (req, res, next) => {
  try {
    const { bookId, price, stock, condition } = req.body;
    if (!bookId || price === undefined) {
      return errorResponse(res, 'Buku dan harga wajib ditentukan.', 400);
    }
    const product = await storeService.addStoreProduct(req.params.id, { bookId, price, stock, condition });
    return successResponse(res, 'Buku berhasil ditambahkan ke inventaris toko.', product, 201);
  } catch (error) {
    next(error);
  }
};

const updateStoreProduct = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id);
    const productId = parseInt(req.params.productId);
    const product = await prisma.storeProduct.findUnique({ where: { id: productId } });
    if (!product || product.storeId !== storeId) {
      return errorResponse(res, 'Produk tidak ditemukan di toko ini.', 404);
    }
    const updated = await storeService.updateStoreProduct(productId, req.body);
    return successResponse(res, 'Produk berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteStoreProduct = async (req, res, next) => {
  try {
    const storeId = parseInt(req.params.id);
    const productId = parseInt(req.params.productId);
    const product = await prisma.storeProduct.findUnique({ where: { id: productId } });
    if (!product || product.storeId !== storeId) {
      return errorResponse(res, 'Produk tidak ditemukan di toko ini.', 404);
    }
    await storeService.deleteStoreProduct(productId);
    return successResponse(res, 'Produk berhasil dihapus dari inventaris.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
  getStoreProducts,
  addStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
};
