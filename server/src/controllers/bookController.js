const prisma = require('../config/db');
const { successResponse, errorResponse, paginateResponse } = require('../utils/responseHelper');

// Get all books with search, filter, and pagination
const getBooks = async (req, res, next) => {
  try {
    const {
      search,
      category,
      sortBy = 'newest',
      page = 1,
      limit = 12,
      featured,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = {};

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
        slug: category,
      };
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'popular') {
      orderBy = { reviewCount: 'desc' };
    } else if (sortBy === 'title') {
      orderBy = { title: 'asc' };
    } else if (sortBy === 'oldest') {
      orderBy = { createdAt: 'asc' };
    }

    const [total, books] = await Promise.all([
      prisma.book.count({ where }),
      prisma.book.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          storeProducts: {
            select: {
              id: true,
              price: true,
              stock: true,
              isAvailable: true,
            },
          },
          libraryCollections: {
            select: {
              id: true,
              availableStock: true,
              isAvailable: true,
            },
          },
        },
      }),
    ]);

    // Format availability flags and min price
    const formattedBooks = books.map((book) => {
      const prices = book.storeProducts
        .filter((sp) => sp.isAvailable && sp.stock > 0)
        .map((sp) => Number(sp.price));
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;

      const isAvailableInStore = book.storeProducts.some((sp) => sp.isAvailable && sp.stock > 0);
      const isAvailableInLibrary = book.libraryCollections.some((lc) => lc.isAvailable && lc.availableStock > 0);

      return {
        id: book.id,
        title: book.title,
        slug: book.slug,
        author: book.author,
        publisher: book.publisher,
        isbn: book.isbn,
        publishYear: book.publishYear,
        pages: book.pages,
        description: book.description,
        coverImage: book.coverImage,
        rating: book.rating,
        reviewCount: book.reviewCount,
        category: book.category,
        minPrice,
        isAvailableInStore,
        isAvailableInLibrary,
        statusTersedia: isAvailableInStore || isAvailableInLibrary,
      };
    });

    return paginateResponse(res, 'Daftar buku berhasil dimuat.', formattedBooks, page, limit, total);
  } catch (error) {
    next(error);
  }
};

// Get single book details with available stores and libraries
const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bookId = parseInt(id);

    const book = await prisma.book.findUnique({
      where: { id: bookId },
      include: {
        category: true,
        storeProducts: {
          include: {
            store: {
              select: {
                id: true,
                organizationName: true,
                slug: true,
                address: true,
                district: true,
                phoneWa: true,
                openHours: true,
                logo: true,
              },
            },
          },
        },
        libraryCollections: {
          include: {
            library: {
              select: {
                id: true,
                organizationName: true,
                slug: true,
                address: true,
                district: true,
                phoneWa: true,
                openHours: true,
                logo: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                level: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!book) {
      return errorResponse(res, 'Buku tidak ditemukan.', 404);
    }

    // Check if user has favorited
    let isFavorited = false;
    if (req.user) {
      const fav = await prisma.favorite.findUnique({
        where: {
          userId_bookId: {
            userId: req.user.id,
            bookId: book.id,
          },
        },
      });
      isFavorited = !!fav;
    }

    // Format Available in Stores
    const availableStores = book.storeProducts.map((sp) => ({
      storeProductId: sp.id,
      storeId: sp.store.id,
      storeName: sp.store.organizationName,
      slug: sp.store.slug,
      address: sp.store.address,
      district: sp.store.district,
      phoneWa: sp.store.phoneWa,
      openHours: sp.store.openHours,
      logo: sp.store.logo,
      price: Number(sp.price),
      stock: sp.stock,
      isAvailable: sp.isAvailable && sp.stock > 0,
      waLink: `https://wa.me/${sp.store.phoneWa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Halo ${sp.store.organizationName}, saya melihat buku "${book.title}" di MABBACA dan ingin memesannya.\n\nDetail:\n- Judul: ${book.title}\n- Penulis: ${book.author}\n- Harga: Rp ${Number(sp.price).toLocaleString('id-ID')}\n- Jumlah: 1\n\nNama Pemesan:\nAlamat Pengantaran:`
      )}`,
    }));

    // Format Available in Libraries
    const availableLibraries = book.libraryCollections.map((lc) => ({
      libraryCollectionId: lc.id,
      libraryId: lc.library.id,
      libraryName: lc.library.organizationName,
      slug: lc.library.slug,
      address: lc.library.address,
      district: lc.library.district,
      openHours: lc.library.openHours,
      callNumber: lc.callNumber,
      totalStock: lc.totalStock,
      availableStock: lc.availableStock,
      locationShelf: lc.locationShelf,
      isAvailable: lc.isAvailable && lc.availableStock > 0,
    }));

    const responseData = {
      ...book,
      isFavorited,
      availableStores,
      availableLibraries,
    };

    return successResponse(res, 'Detail buku berhasil dimuat.', responseData);
  } catch (error) {
    next(error);
  }
};

// Toggle favorite book
const toggleFavorite = async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);
    const userId = req.user.id;

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return successResponse(res, 'Buku berhasil dihapus dari daftar favorit.', { isFavorited: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId,
          bookId,
        },
      });

      // Record activity
      await prisma.userActivity.create({
        data: {
          userId,
          actionType: 'FAVORITE_BOOK',
          referenceId: bookId,
          pointsEarned: 5,
          description: 'Menambahkan buku ke daftar favorit.',
        },
      });

      return successResponse(res, 'Buku berhasil disimpan ke favorit.', { isFavorited: true });
    }
  } catch (error) {
    next(error);
  }
};

// Add review to book
const addReview = async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);
    const userId = req.user.id;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return errorResponse(res, 'Rating (1-5) dan ulasan wajib diisi.', 400);
    }

    const numericRating = parseInt(rating);
    if (numericRating < 1 || numericRating > 5) {
      return errorResponse(res, 'Rating harus antara 1 dan 5.', 400);
    }

    const review = await prisma.review.upsert({
      where: {
        userId_bookId: { userId, bookId },
      },
      update: {
        rating: numericRating,
        comment,
      },
      create: {
        userId,
        bookId,
        rating: numericRating,
        comment,
      },
    });

    // Recalculate book average rating & review count
    const allReviews = await prisma.review.findMany({
      where: { bookId },
      select: { rating: true },
    });

    const totalRatings = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = parseFloat((totalRatings / allReviews.length).toFixed(1));

    await prisma.book.update({
      where: { id: bookId },
      data: {
        rating: avgRating,
        reviewCount: allReviews.length,
      },
    });

    // Reward points for writing a review
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: 10 } },
    });

    await prisma.userActivity.create({
      data: {
        userId,
        actionType: 'WRITE_REVIEW',
        referenceId: bookId,
        pointsEarned: 10,
        description: `Memberikan ulasan bintang ${numericRating} pada buku.`,
      },
    });

    return successResponse(res, 'Ulasan berhasil disimpan. Anda mendapatkan +10 Poin Literasi!', review, 201);
  } catch (error) {
    next(error);
  }
};

// Get categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.bookCategory.findMany({
      include: {
        _count: {
          select: { books: true },
        },
      },
    });

    return successResponse(res, 'Kategori buku berhasil dimuat.', categories);
  } catch (error) {
    next(error);
  }
};

// Create book (Admin / Authorized Mitra)
const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      publisher,
      isbn,
      publishYear,
      pages,
      categoryId,
      description,
      coverImage,
    } = req.body;

    if (!title || !author || !categoryId) {
      return errorResponse(res, 'Judul, penulis, dan kategori wajib diisi.', 400);
    }

    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const existingSlug = await prisma.book.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    let finalCover = coverImage;
    if (req.file) {
      finalCover = `/uploads/${req.file.filename}`;
    }

    const newBook = await prisma.book.create({
      data: {
        title,
        slug,
        author,
        publisher: publisher || null,
        isbn: isbn || null,
        publishYear: publishYear ? parseInt(publishYear) : null,
        pages: pages ? parseInt(pages) : null,
        categoryId: parseInt(categoryId),
        description: description || 'Deskripsi belum tersedia.',
        coverImage: finalCover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      },
      include: {
        category: true,
      },
    });

    return successResponse(res, 'Buku berhasil ditambahkan.', newBook, 201);
  } catch (error) {
    next(error);
  }
};

// Update book
const updateBook = async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);
    const {
      title,
      author,
      publisher,
      isbn,
      publishYear,
      pages,
      categoryId,
      description,
      coverImage,
    } = req.body;

    const dataToUpdate = {};
    if (title) dataToUpdate.title = title;
    if (author) dataToUpdate.author = author;
    if (publisher !== undefined) dataToUpdate.publisher = publisher;
    if (isbn !== undefined) dataToUpdate.isbn = isbn;
    if (publishYear) dataToUpdate.publishYear = parseInt(publishYear);
    if (pages) dataToUpdate.pages = parseInt(pages);
    if (categoryId) dataToUpdate.categoryId = parseInt(categoryId);
    if (description !== undefined) dataToUpdate.description = description;
    if (coverImage) dataToUpdate.coverImage = coverImage;
    if (req.file) {
      dataToUpdate.coverImage = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.book.update({
      where: { id: bookId },
      data: dataToUpdate,
      include: { category: true },
    });

    return successResponse(res, 'Data buku berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

// Delete book (Admin only)
const deleteBook = async (req, res, next) => {
  try {
    const bookId = parseInt(req.params.id);
    await prisma.book.delete({ where: { id: bookId } });
    return successResponse(res, 'Buku berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  toggleFavorite,
  addReview,
  getCategories,
  createBook,
  updateBook,
  deleteBook,
};
