const prisma = require('../config/db');
const { errorResponse } = require('../utils/responseHelper');

// Validasi kepemilikan Toko Buku
const checkStoreOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') return next();

    const storeId = parseInt(req.params.id || req.params.storeId);
    if (isNaN(storeId)) {
      return errorResponse(res, 'ID Toko tidak valid.', 400);
    }

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { mitra: true },
    });

    if (!store) {
      return errorResponse(res, 'Toko buku tidak ditemukan.', 404);
    }

    if (!req.user.mitraProfile || store.mitraId !== req.user.mitraProfile.id) {
      return errorResponse(res, 'Anda tidak memiliki hak untuk mengelola toko buku ini.', 403);
    }

    req.targetStore = store;
    next();
  } catch (error) {
    next(error);
  }
};

// Validasi kepemilikan Perpustakaan
const checkLibraryOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') return next();

    const libraryId = parseInt(req.params.id || req.params.libraryId);
    if (isNaN(libraryId)) {
      return errorResponse(res, 'ID Perpustakaan tidak valid.', 400);
    }

    const library = await prisma.library.findUnique({
      where: { id: libraryId },
      include: { mitra: true },
    });

    if (!library) {
      return errorResponse(res, 'Perpustakaan tidak ditemukan.', 404);
    }

    if (!req.user.mitraProfile || library.mitraId !== req.user.mitraProfile.id) {
      return errorResponse(res, 'Anda tidak memiliki hak untuk mengelola perpustakaan ini.', 403);
    }

    req.targetLibrary = library;
    next();
  } catch (error) {
    next(error);
  }
};

// Validasi kepemilikan Komunitas
const checkCommunityOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') return next();

    const communityId = parseInt(req.params.id || req.params.communityId);
    if (isNaN(communityId)) {
      return errorResponse(res, 'ID Komunitas tidak valid.', 400);
    }

    const community = await prisma.community.findUnique({
      where: { id: communityId },
      include: { mitra: true },
    });

    if (!community) {
      return errorResponse(res, 'Komunitas tidak ditemukan.', 404);
    }

    if (!req.user.mitraProfile || community.mitraId !== req.user.mitraProfile.id) {
      return errorResponse(res, 'Anda tidak memiliki hak untuk mengelola komunitas ini.', 403);
    }

    req.targetCommunity = community;
    next();
  } catch (error) {
    next(error);
  }
};

// Validasi kepemilikan Event
const checkEventOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') return next();

    const eventId = parseInt(req.params.id || req.params.eventId);
    if (isNaN(eventId)) {
      return errorResponse(res, 'ID Event tidak valid.', 400);
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return errorResponse(res, 'Event tidak ditemukan.', 404);
    }

    if (!req.user.mitraProfile || event.organizerMitraId !== req.user.mitraProfile.id) {
      return errorResponse(res, 'Anda tidak memiliki hak untuk mengelola event ini.', 403);
    }

    req.targetEvent = event;
    next();
  } catch (error) {
    next(error);
  }
};

// Validasi kepemilikan Artikel
const checkArticleOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') return next();

    const articleId = parseInt(req.params.id);
    if (isNaN(articleId)) {
      return errorResponse(res, 'ID Artikel tidak valid.', 400);
    }

    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return errorResponse(res, 'Artikel tidak ditemukan.', 404);
    }

    if (article.authorId !== req.user.id) {
      return errorResponse(res, 'Anda tidak memiliki hak untuk mengelola artikel ini.', 403);
    }

    req.targetArticle = article;
    next();
  } catch (error) {
    next(error);
  }
};

// Validasi kepemilikan Review
const checkReviewOwnership = async (req, res, next) => {
  try {
    if (req.user.role === 'ADMIN') return next();

    const reviewId = parseInt(req.params.id);
    if (isNaN(reviewId)) {
      return errorResponse(res, 'ID Ulasan tidak valid.', 400);
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return errorResponse(res, 'Ulasan tidak ditemukan.', 404);
    }

    if (review.userId !== req.user.id) {
      return errorResponse(res, 'Anda hanya dapat mengedit atau menghapus ulasan milik sendiri.', 403);
    }

    req.targetReview = review;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkStoreOwnership,
  checkLibraryOwnership,
  checkCommunityOwnership,
  checkEventOwnership,
  checkArticleOwnership,
  checkReviewOwnership,
};
