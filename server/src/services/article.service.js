const prisma = require('../config/db');

class ArticleService {
  async getArticles({ page = 1, limit = 10, search, category, status = 'PUBLISHED' }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const where = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            OR: [
              { name: { equals: category } },
              { slug: { equals: category } },
            ],
          },
        },
      };
    }

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, avatar: true } },
          categories: { include: { category: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
    ]);

    const formattedArticles = articles.map((art) => ({
      id: art.id,
      title: art.title,
      slug: art.slug,
      excerpt: art.excerpt,
      content: art.content,
      thumbnail: art.thumbnail,
      readingTime: art.readingTime,
      readTimeMinutes: art.readingTime,
      views: art.views,
      isFeatured: art.isFeatured,
      status: art.status,
      publishedAt: art.publishedAt,
      createdAt: art.createdAt,
      author: art.author,
      categories: art.categories.map((c) => c.category),
      category: art.categories.length > 0 ? art.categories[0].category.name : 'Umum',
    }));

    return { articles: formattedArticles, total, page: p, limit: l };
  }

  async getArticleBySlugOrId(idOrSlug, userId = null) {
    const isId = !isNaN(parseInt(idOrSlug)) && String(parseInt(idOrSlug)) === String(idOrSlug);
    const where = isId ? { id: parseInt(idOrSlug) } : { slug: idOrSlug };

    const article = await prisma.article.findUnique({
      where,
      include: {
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        categories: { include: { category: true } },
      },
    });

    if (!article || article.deletedAt) {
      const error = new Error('Artikel tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    // Increment views asynchronously
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    });

    // Poin membaca bagi user login (maks 1x per artikel)
    if (userId) {
      const alreadyRead = await prisma.userActivity.findFirst({
        where: {
          userId,
          activityType: 'READ_ARTICLE',
          referenceId: article.id,
        },
      });

      if (!alreadyRead) {
        await prisma.user.update({
          where: { id: userId },
          data: { points: { increment: 5 } },
        });

        await prisma.userActivity.create({
          data: {
            userId,
            activityType: 'READ_ARTICLE',
            referenceId: article.id,
            pointsEarned: 5,
            description: `Membaca artikel: ${article.title}`,
          },
        });
      }
    }

    return {
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      thumbnail: article.thumbnail,
      readingTime: article.readingTime,
      readTimeMinutes: article.readingTime,
      views: article.views + 1,
      isFeatured: article.isFeatured,
      status: article.status,
      publishedAt: article.publishedAt,
      createdAt: article.createdAt,
      author: article.author,
      categories: article.categories.map((c) => c.category),
      category: article.categories.length > 0 ? article.categories[0].category.name : 'Umum',
    };
  }

  async createArticle(authorId, data, file) {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;

    const thumbnail = file ? `/uploads/${file.filename}` : data.thumbnail || null;

    const article = await prisma.article.create({
      data: {
        authorId,
        title: data.title,
        slug: uniqueSlug,
        excerpt: data.excerpt,
        content: data.content,
        thumbnail,
        readingTime: data.readingTime ? parseInt(data.readingTime) : 5,
        status: data.status || 'PUBLISHED',
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    });

    if (data.categoryId) {
      await prisma.articleCategoryRelation.create({
        data: {
          articleId: article.id,
          categoryId: parseInt(data.categoryId),
        },
      });
    }

    return article;
  }

  async updateArticle(id, data, file) {
    const updateData = {};
    if (data.title) updateData.title = data.title;
    if (data.excerpt) updateData.excerpt = data.excerpt;
    if (data.content) updateData.content = data.content;
    if (data.readingTime) updateData.readingTime = parseInt(data.readingTime);
    if (data.status) {
      updateData.status = data.status;
      if (data.status === 'PUBLISHED') updateData.publishedAt = new Date();
    }

    if (file) {
      updateData.thumbnail = `/uploads/${file.filename}`;
    }

    return prisma.article.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  async deleteArticle(id) {
    return prisma.article.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
  }

  async publishArticle(id) {
    return prisma.article.update({
      where: { id: parseInt(id) },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  async getArticleCategories() {
    return prisma.articleCategory.findMany({
      include: {
        _count: { select: { articles: true } },
      },
      orderBy: { name: 'asc' },
    });
  }
}

module.exports = new ArticleService();
