const prisma = require('../config/db');

class ReviewService {
  async getReviews({ bookId, storeId, libraryId, communityId, eventId, page = 1, limit = 10 }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const where = {};
    if (bookId) where.bookId = parseInt(bookId);
    if (storeId) where.storeId = parseInt(storeId);
    if (libraryId) where.libraryId = parseInt(libraryId);
    if (communityId) where.communityId = parseInt(communityId);
    if (eventId) where.eventId = parseInt(eventId);

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
          book: { select: { id: true, title: true, coverImage: true } },
          store: { select: { id: true, name: true } },
          library: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
    ]);

    return { reviews, total, page: p, limit: l };
  }

  async createReview(userId, { bookId, storeId, libraryId, communityId, eventId, rating, comment }) {
    const r = parseInt(rating);
    if (r < 1 || r > 5) {
      const error = new Error('Rating harus bernilai antara 1 sampai 5 bintang.');
      error.statusCode = 400;
      throw error;
    }

    const bId = bookId ? parseInt(bookId) : null;
    const sId = storeId ? parseInt(storeId) : null;
    const lId = libraryId ? parseInt(libraryId) : null;
    const cId = communityId ? parseInt(communityId) : null;
    const eId = eventId ? parseInt(eventId) : null;

    if (!bId && !sId && !lId && !cId && !eId) {
      const error = new Error('Ulasan harus ditujukan ke salah satu resource (buku, toko, perpustakaan, komunitas, atau event).');
      error.statusCode = 400;
      throw error;
    }

    // Periksa duplikasi ulasan
    const existing = await prisma.review.findFirst({
      where: {
        userId,
        bookId: bId,
        storeId: sId,
        libraryId: lId,
        communityId: cId,
        eventId: eId,
      },
    });

    if (existing) {
      const error = new Error('Anda sudah pernah memberikan ulasan untuk resource ini. Silakan perbarui ulasan Anda sebelumnya.');
      error.statusCode = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          bookId: bId,
          storeId: sId,
          libraryId: lId,
          communityId: cId,
          eventId: eId,
          rating: r,
          comment,
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      // Jika mereview buku, hitung ulang rata-rata rating
      if (bId) {
        const aggregations = await tx.review.aggregate({
          where: { bookId: bId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.book.update({
          where: { id: bId },
          data: {
            rating: aggregations._avg.rating ? parseFloat(aggregations._avg.rating.toFixed(1)) : 0,
            reviewCount: aggregations._count.rating,
          },
        });
      }

      // Berikan reward poin
      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: 10 } },
      });

      await tx.userActivity.create({
        data: {
          userId,
          activityType: 'WRITE_REVIEW',
          referenceId: review.id,
          pointsEarned: 10,
          description: `Memberikan ulasan bintang ${r}`,
        },
      });

      return review;
    });
  }

  async updateReview(id, userId, { rating, comment }) {
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
    });

    if (!review) {
      const error = new Error('Ulasan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (review.userId !== userId) {
      const error = new Error('Anda tidak memiliki izin mengedit ulasan ini.');
      error.statusCode = 403;
      throw error;
    }

    const updateData = {};
    if (rating !== undefined) {
      const r = parseInt(rating);
      if (r < 1 || r > 5) {
        const error = new Error('Rating harus bernilai antara 1 sampai 5.');
        error.statusCode = 400;
        throw error;
      }
      updateData.rating = r;
    }
    if (comment !== undefined) updateData.comment = comment;

    return prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id: review.id },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, avatar: true } },
        },
      });

      if (review.bookId) {
        const aggregations = await tx.review.aggregate({
          where: { bookId: review.bookId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.book.update({
          where: { id: review.bookId },
          data: {
            rating: aggregations._avg.rating ? parseFloat(aggregations._avg.rating.toFixed(1)) : 0,
            reviewCount: aggregations._count.rating,
          },
        });
      }

      return updated;
    });
  }

  async deleteReview(id, user) {
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
    });

    if (!review) {
      const error = new Error('Ulasan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (review.userId !== user.id && user.role !== 'ADMIN') {
      const error = new Error('Anda tidak memiliki izin menghapus ulasan ini.');
      error.statusCode = 403;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id: review.id },
      });

      if (review.bookId) {
        const aggregations = await tx.review.aggregate({
          where: { bookId: review.bookId },
          _avg: { rating: true },
          _count: { rating: true },
        });

        await tx.book.update({
          where: { id: review.bookId },
          data: {
            rating: aggregations._avg.rating ? parseFloat(aggregations._avg.rating.toFixed(1)) : 0,
            reviewCount: aggregations._count.rating,
          },
        });
      }

      return true;
    });
  }
}

module.exports = new ReviewService();
