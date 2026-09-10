const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Get all "Baca 5 Menit" articles
const getArticles = async (req, res, next) => {
  try {
    const { category, search, featured } = req.query;

    const where = {};

    if (featured === 'true') {
      where.isFeatured = true;
    }

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: true,
        author: {
          select: { id: true, name: true, avatar: true, level: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(res, 'Daftar artikel Baca 5 Menit berhasil dimuat.', articles);
  } catch (error) {
    next(error);
  }
};

// Get single article with related articles
const getArticleById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const articleId = isNaN(id) ? undefined : parseInt(id);
    const slug = isNaN(id) ? id : undefined;

    const where = articleId ? { id: articleId } : { slug };

    const article = await prisma.article.findFirst({
      where,
      include: {
        category: true,
        author: {
          select: { id: true, name: true, avatar: true, bio: true, level: true },
        },
      },
    });

    if (!article) {
      return errorResponse(res, 'Artikel tidak ditemukan.', 404);
    }

    // Increment views
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    // Award points if logged in and reading for the first time today
    if (req.user) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { points: { increment: 10 } },
      });

      await prisma.userActivity.create({
        data: {
          userId: req.user.id,
          actionType: 'READ_ARTICLE',
          referenceId: article.id,
          pointsEarned: 10,
          description: `Membaca artikel: "${article.title}"`,
        },
      });
    }

    // Related articles in same category
    const relatedArticles = await prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        id: { not: article.id },
      },
      take: 3,
      include: { category: true },
    });

    return successResponse(res, 'Detail artikel berhasil dimuat.', {
      ...article,
      relatedArticles,
    });
  } catch (error) {
    next(error);
  }
};

// Get article categories
const getArticleCategories = async (req, res, next) => {
  try {
    const categories = await prisma.articleCategory.findMany({
      include: {
        _count: { select: { articles: true } },
      },
    });
    return successResponse(res, 'Kategori artikel berhasil dimuat.', categories);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getArticles,
  getArticleById,
  getArticleCategories,
};
