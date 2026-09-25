const prisma = require('../config/db');

class BookService {
  // Get books with pagination, search, category, author filter, and sorting
  async getBooks({ page = 1, limit = 12, search, category, author, sort = 'newest' }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const where = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { author: { contains: search } },
        { description: { contains: search } },
        { isbn: { contains: search } },
      ];
    }

    if (category) {
      where.category = {
        name: { equals: category },
      };
    }

    if (author) {
      where.author = { contains: author };
    }

    // Ordering
    let orderBy = { createdAt: 'desc' };
    if (sort === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sort === 'reviews') {
      orderBy = { reviewCount: 'desc' };
    } else if (sort === 'title_asc') {
      orderBy = { title: 'asc' };
    } else if (sort === 'title_desc') {
      orderBy = { title: 'desc' };
    }

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        include: {
          category: true,
          bookAuthors: {
            include: { author: true },
          },
          storeProducts: {
            where: { isAvailable: true },
            select: { price: true, stock: true },
          },
          libraryCollections: {
            where: { isAvailable: true },
            select: { availableQuantity: true, readUrl: true },
          },
          _count: {
            select: { reviews: true },
          },
        },
        orderBy,
        skip,
        take: l,
      }),
    ]);

    const formattedBooks = books.map((b) => {
      const minPrice =
        b.storeProducts.length > 0
          ? Math.min(...b.storeProducts.map((sp) => Number(sp.price)))
          : null;
      const isAvailableInStore = b.storeProducts.some((sp) => sp.stock > 0);
      const isAvailableInLibrary = b.libraryCollections.some((lc) => lc.availableQuantity > 0 || !!lc.readUrl);
      const hasDigitalRead = !!(b.readUrl || b.libraryCollections.some((lc) => !!lc.readUrl));
      const readUrl = b.readUrl || (b.libraryCollections.find((lc) => lc.readUrl)?.readUrl) || null;

      return {
        id: b.id,
        title: b.title,
        slug: b.slug,
        author: b.author,
        authors: b.bookAuthors.map((ba) => ba.author),
        publisher: b.publisher,
        isbn: b.isbn,
        pages: b.pages,
        category: b.category ? b.category.name : null,
        categoryId: b.categoryId,
        coverImage: b.coverImage,
        rating: b.rating,
        reviewCount: b.reviewCount || b._count.reviews,
        description: b.description,
        minPrice,
        isAvailableInStore,
        isAvailableInLibrary,
        hasDigitalRead,
        readUrl,
      };
    });

    return { books: formattedBooks, total, page: p, limit: l };
  }

  // Get book by ID or Slug
  async getBookById(idOrSlug, userId = null) {
    const isId = !isNaN(parseInt(idOrSlug)) && String(parseInt(idOrSlug)) === String(idOrSlug);
    const where = isId ? { id: parseInt(idOrSlug) } : { slug: idOrSlug };

    const book = await prisma.book.findUnique({
      where,
      include: {
        category: true,
        bookAuthors: {
          include: { author: true },
        },
        storeProducts: {
          where: { isAvailable: true },
          include: {
            store: {
              include: { mitra: true },
            },
          },
        },
        libraryCollections: {
          where: { isAvailable: true },
          include: {
            library: {
              include: { mitra: true },
            },
          },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!book || book.deletedAt) {
      const error = new Error('Buku tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    let isFavorite = false;
    if (userId) {
      const fav = await prisma.userBookFavorite.findUnique({
        where: {
          userId_bookId: {
            userId,
            bookId: book.id,
          },
        },
      });
      isFavorite = !!fav;
    }

    const stores = book.storeProducts.map((sp) => ({
      productId: sp.id,
      storeId: sp.store.id,
      storeName: sp.store.name,
      address: sp.store.address,
      district: sp.store.district,
      phoneWa: sp.store.whatsappNumber,
      price: Number(sp.price),
      stock: sp.stock,
      condition: sp.condition,
      waLink: `https://wa.me/${sp.store.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Halo ${sp.store.name}, saya ingin memesan buku "${book.title}" (Rp ${Number(
          sp.price
        ).toLocaleString('id-ID')}) yang saya temukan melalui MABBACA.`
      )}`,
    }));

    const libraries = book.libraryCollections.map((lc) => ({
      collectionId: lc.id,
      libraryId: lc.library.id,
      libraryName: lc.library.name,
      address: lc.library.address,
      district: lc.library.district,
      phoneWa: lc.library.phone,
      callNumber: lc.callNumber,
      shelfLocation: lc.shelfLocation,
      totalQuantity: lc.quantity,
      availableQuantity: lc.availableQuantity,
      readUrl: lc.readUrl || book.readUrl || null,
    }));

    const digitalReadUrl = book.readUrl || (book.libraryCollections.find((lc) => lc.readUrl)?.readUrl) || null;
    const hasDigitalRead = !!digitalReadUrl;

    return {
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      authors: book.bookAuthors.map((ba) => ba.author),
      publisher: book.publisher,
      isbn: book.isbn,
      publishYear: book.publishYear,
      pages: book.pages,
      language: book.language,
      description: book.description,
      coverImage: book.coverImage,
      rating: book.rating,
      reviewCount: book.reviews.length,
      category: book.category ? book.category.name : null,
      categoryId: book.categoryId,
      isFavorite,
      stores,
      libraries,
      reviews: book.reviews,
      readUrl: digitalReadUrl,
      digitalReadUrl,
      hasDigitalRead,
    };
  }

  // Create book
  async createBook(data, file) {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;

    const coverImage = file ? `/uploads/${file.filename}` : data.coverImage || null;

    const book = await prisma.book.create({
      data: {
        title: data.title,
        slug: uniqueSlug,
        author: data.author,
        publisher: data.publisher || null,
        isbn: data.isbn || null,
        publishYear: data.publishYear ? parseInt(data.publishYear) : null,
        pages: data.pages ? parseInt(data.pages) : null,
        language: data.language || 'Bahasa Indonesia',
        description: data.description,
        coverImage,
        categoryId: parseInt(data.categoryId),
      },
    });

    if (data.authorId) {
      await prisma.bookAuthor.create({
        data: {
          bookId: book.id,
          authorId: parseInt(data.authorId),
        },
      });
    }

    return book;
  }

  // Update book
  async updateBook(id, data, file) {
    const updateData = {};
    if (data.title) updateData.title = data.title;
    if (data.author) updateData.author = data.author;
    if (data.publisher !== undefined) updateData.publisher = data.publisher;
    if (data.isbn !== undefined) updateData.isbn = data.isbn;
    if (data.publishYear) updateData.publishYear = parseInt(data.publishYear);
    if (data.pages) updateData.pages = parseInt(data.pages);
    if (data.language) updateData.language = data.language;
    if (data.description) updateData.description = data.description;
    if (data.categoryId) updateData.categoryId = parseInt(data.categoryId);
    if (file) {
      updateData.coverImage = `/uploads/${file.filename}`;
    }

    const updated = await prisma.book.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return updated;
  }

  // Soft delete book
  async deleteBook(id) {
    return prisma.book.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date() },
    });
  }

  // Get Stores having this book
  async getBookStores(bookId) {
    return prisma.storeProduct.findMany({
      where: {
        bookId: parseInt(bookId),
        isAvailable: true,
      },
      include: {
        store: true,
      },
    });
  }

  // Get Libraries having this book
  async getBookLibraries(bookId) {
    return prisma.libraryCollection.findMany({
      where: {
        bookId: parseInt(bookId),
        isAvailable: true,
      },
      include: {
        library: true,
      },
    });
  }

  // Get Reviews for book
  async getBookReviews(bookId) {
    return prisma.review.findMany({
      where: { bookId: parseInt(bookId) },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

module.exports = new BookService();
