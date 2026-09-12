const prisma = require('../config/db');

class CategoryService {
  async getCategories() {
    return prisma.category.findMany({
      include: {
        _count: { select: { books: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async getCategoryById(id) {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: {
        books: {
          where: { deletedAt: null },
          take: 20,
        },
      },
    });

    if (!category) {
      const error = new Error('Kategori tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    return category;
  }

  async createCategory(data) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    return prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        icon: data.icon || null,
      },
    });
  }

  async updateCategory(id, data) {
    const updateData = {};
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = data.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.icon !== undefined) updateData.icon = data.icon;

    return prisma.category.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  async deleteCategory(id) {
    return prisma.category.delete({
      where: { id: parseInt(id) },
    });
  }
}

module.exports = new CategoryService();
