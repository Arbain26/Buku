const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { calculateDistance, formatDistance, SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

// Get all libraries with distance
const getLibraries = async (req, res, next) => {
  try {
    const {
      search,
      district,
      userLat = SIDRAP_DEFAULT_LAT,
      userLng = SIDRAP_DEFAULT_LNG,
    } = req.query;

    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    const where = {
      mitraType: 'PERPUSTAKAAN',
      status: 'APPROVED',
    };

    if (search) {
      where.OR = [
        { organizationName: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (district) {
      where.district = district;
    }

    const libraries = await prisma.mitraProfile.findMany({
      where,
      include: {
        _count: {
          select: { collections: true },
        },
      },
      orderBy: { organizationName: 'asc' },
    });

    const formattedLibraries = libraries.map((lib) => {
      const distanceKm = calculateDistance(lat, lng, lib.latitude, lib.longitude);
      return {
        id: lib.id,
        name: lib.organizationName,
        slug: lib.slug,
        address: lib.address,
        district: lib.district,
        village: lib.village,
        phoneWa: lib.phoneWa,
        description: lib.description,
        logo: lib.logo,
        banner: lib.banner,
        openHours: lib.openHours,
        totalCollections: lib._count.collections,
        latitude: lib.latitude,
        longitude: lib.longitude,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
      };
    });

    // Sort by nearest
    formattedLibraries.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

    return successResponse(res, 'Daftar perpustakaan berhasil dimuat.', formattedLibraries);
  } catch (error) {
    next(error);
  }
};

// Get single library details and collections
const getLibraryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const libraryId = isNaN(id) ? undefined : parseInt(id);
    const slug = isNaN(id) ? id : undefined;

    const where = libraryId ? { id: libraryId } : { slug };

    const library = await prisma.mitraProfile.findFirst({
      where: {
        ...where,
        mitraType: 'PERPUSTAKAAN',
        status: 'APPROVED',
      },
      include: {
        collections: {
          include: {
            book: {
              include: { category: true },
            },
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!library) {
      return errorResponse(res, 'Perpustakaan tidak ditemukan.', 404);
    }

    const userLat = parseFloat(req.query.userLat || SIDRAP_DEFAULT_LAT);
    const userLng = parseFloat(req.query.userLng || SIDRAP_DEFAULT_LNG);
    const distanceKm = calculateDistance(userLat, userLng, library.latitude, library.longitude);

    const { collectionCategory, searchCollection } = req.query;

    let filteredCollections = library.collections;

    if (collectionCategory && collectionCategory !== 'Semua') {
      filteredCollections = filteredCollections.filter((c) =>
        c.category?.toLowerCase() === collectionCategory.toLowerCase()
      );
    }

    if (searchCollection) {
      const q = searchCollection.toLowerCase();
      filteredCollections = filteredCollections.filter(
        (c) =>
          c.book.title.toLowerCase().includes(q) ||
          c.book.author.toLowerCase().includes(q) ||
          (c.callNumber && c.callNumber.toLowerCase().includes(q))
      );
    }

    const formattedCollections = filteredCollections.map((c) => ({
      collectionId: c.id,
      bookId: c.book.id,
      title: c.book.title,
      author: c.book.author,
      coverImage: c.book.coverImage,
      category: c.category || c.book.category.name,
      callNumber: c.callNumber,
      totalStock: c.totalStock,
      availableStock: c.availableStock,
      locationShelf: c.locationShelf,
      isAvailable: c.isAvailable && c.availableStock > 0,
    }));

    const responseData = {
      id: library.id,
      name: library.organizationName,
      slug: library.slug,
      address: library.address,
      district: library.district,
      village: library.village,
      phoneWa: library.phoneWa,
      description: library.description,
      logo: library.logo,
      banner: library.banner,
      openHours: library.openHours,
      latitude: library.latitude,
      longitude: library.longitude,
      distanceKm,
      formattedDistance: formatDistance(distanceKm),
      totalCollections: library.collections.length,
      collections: formattedCollections,
    };

    return successResponse(res, 'Detail perpustakaan berhasil dimuat.', responseData);
  } catch (error) {
    next(error);
  }
};

// Request borrow book from a library collection
const requestBorrow = async (req, res, next) => {
  try {
    const { collectionId, notes, durationDays = 7 } = req.body;
    const userId = req.user.id;

    if (!collectionId) {
      return errorResponse(res, 'Koleksi perpustakaan wajib dipilih.', 400);
    }

    const collection = await prisma.libraryCollection.findUnique({
      where: { id: parseInt(collectionId) },
      include: {
        book: true,
        library: true,
      },
    });

    if (!collection) {
      return errorResponse(res, 'Koleksi buku tidak ditemukan di perpustakaan ini.', 404);
    }

    if (collection.availableStock <= 0 || !collection.isAvailable) {
      return errorResponse(res, 'Mohon maaf, saat ini stok buku sedang tidak tersedia / dipinjam.', 400);
    }

    // Check if user already has an active pending or borrowed request for this book
    const activeBorrow = await prisma.borrowing.findFirst({
      where: {
        userId,
        collectionId: collection.id,
        status: { in: ['PENDING', 'APPROVED', 'BORROWED'] },
      },
    });

    if (activeBorrow) {
      return errorResponse(res, 'Anda masih memiliki peminjaman aktif untuk buku ini.', 400);
    }

    const borrowDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(durationDays));

    const borrowing = await prisma.borrowing.create({
      data: {
        userId,
        collectionId: collection.id,
        borrowDate,
        dueDate,
        status: 'PENDING',
        notes: notes || 'Peminjaman melalui platform MABBACA',
      },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId,
        title: 'Permohonan Peminjaman Dikirim',
        message: `Pengajuan peminjaman buku "${collection.book.title}" di ${collection.library.organizationName} sedang menunggu konfirmasi petugas.`,
        type: 'INFO',
        linkUrl: '/dashboard',
      },
    });

    // Reward points for initiating borrow
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: 15 } },
    });

    await prisma.userActivity.create({
      data: {
        userId,
        actionType: 'BORROW_BOOK',
        referenceId: collection.bookId,
        pointsEarned: 15,
        description: `Mengajukan peminjaman buku "${collection.book.title}" di ${collection.library.organizationName}.`,
      },
    });

    return successResponse(
      res,
      'Permohonan peminjaman berhasil dikirim! Silakan tunggu konfirmasi atau datang langsung ke perpustakaan.',
      borrowing,
      201
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLibraries,
  getLibraryById,
  requestBorrow,
};
