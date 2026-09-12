const prisma = require('../config/db');

class AuthorService {
  async getAuthors({ page = 1, limit = 20, search }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const where = {};
    if (search) {
      where.name = { contains: search };
    }

    const [total, authors] = await Promise.all([
      prisma.author.count({ where }),
      prisma.author.findMany({
        where,
        include: {
          _count: { select: { bookAuthors: true } },
        },
        orderBy: { name: 'asc' },
        skip,
        take: l,
      }),
    ]);

    return { authors, total, page: p, limit: l };
  }

  async getAuthorById(id) {
    const author = await prisma.author.findUnique({
      where: { id: parseInt(id) },
      include: {
        bookAuthors: {
          include: {
            book: {
              include: { category: true },
            },
          },
        },
      },
    });

    if (!author) {
      const error = new Error('Penulis tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    return author;
  }

  async createAuthor(data, file) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;

    const avatar = file ? `/uploads/${file.filename}` : data.avatar || null;

    return prisma.author.create({
      data: {
        name: data.name,
        slug: uniqueSlug,
        bio: data.bio || null,
        avatar,
      },
    });
  }

  async updateAuthor(id, data, file) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (file) {
      updateData.avatar = `/uploads/${file.filename}`;
    }

    return prisma.author.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  async deleteAuthor(id) {
    return prisma.author.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new AuthorService();
