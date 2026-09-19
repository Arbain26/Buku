const prisma = require('../config/db');
const { calculateDistance, formatDistance, SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

class LibraryService {
  async getLibraries({ page = 1, limit = 12, search, district, userLat = SIDRAP_DEFAULT_LAT, userLng = SIDRAP_DEFAULT_LNG }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    const where = {
      isActive: true,
      deletedAt: null,
      mitra: {
        status: 'APPROVED',
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (district && district !== 'Semua') {
      where.district = district;
    }

    const [total, libraries] = await Promise.all([
      prisma.library.count({ where }),
      prisma.library.findMany({
        where,
        include: {
          mitra: true,
          _count: {
            select: { collections: true, reviews: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: l,
      }),
    ]);

    const formattedLibraries = libraries.map((lib) => {
      const distanceKm = calculateDistance(lat, lng, lib.latitude, lib.longitude);
      return {
        id: lib.id,
        mitraId: lib.mitraId,
        name: lib.name,
        slug: lib.slug,
        address: lib.address,
        district: lib.district || lib.mitra.district,
        village: lib.village || lib.mitra.village,
        phone: lib.phone || lib.mitra.phoneWa,
        phoneWa: lib.phone || lib.mitra.phoneWa,
        description: lib.description,
        image: lib.image || lib.mitra.logo,
        logo: lib.image || lib.mitra.logo,
        banner: lib.banner || lib.mitra.banner,
        openHours: lib.openingHours || lib.mitra.openHours,
        openingHours: lib.openingHours || lib.mitra.openHours,
        totalCollections: lib._count.collections,
        totalReviews: lib._count.reviews,
        latitude: lib.latitude,
        longitude: lib.longitude,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
      };
    });

    formattedLibraries.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));

    return { libraries: formattedLibraries, total, page: p, limit: l };
  }

  async getLibraryById(idOrSlug, userLat = SIDRAP_DEFAULT_LAT, userLng = SIDRAP_DEFAULT_LNG) {
    const isId = !isNaN(parseInt(idOrSlug)) && String(parseInt(idOrSlug)) === String(idOrSlug);
    const where = isId ? { id: parseInt(idOrSlug) } : { slug: idOrSlug };

    const library = await prisma.library.findUnique({
      where,
      include: {
        mitra: true,
        collections: {
          where: { isAvailable: true },
          include: {
            book: {
              include: { category: true },
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

    if (!library || library.deletedAt) {
      const error = new Error('Perpustakaan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);
    const distanceKm = calculateDistance(lat, lng, library.latitude, library.longitude);

    const formattedCollections = library.collections.map((c) => ({
      collectionId: c.id,
      bookId: c.book.id,
      title: c.book.title,
      author: c.book.author,
      category: c.book.category ? c.book.category.name : null,
      coverImage: c.book.coverImage,
      description: c.book.description,
      isbn: c.book.isbn,
      pages: c.book.pages,
      callNumber: c.callNumber,
      totalStock: c.quantity,
      availableStock: c.availableQuantity,
      locationShelf: c.shelfLocation,
      isAvailable: c.availableQuantity > 0,
    }));

    return {
      id: library.id,
      mitraId: library.mitraId,
      name: library.name,
      slug: library.slug,
      address: library.address,
      district: library.district || library.mitra.district,
      village: library.village || library.mitra.village,
      phone: library.phone || library.mitra.phoneWa,
      phoneWa: library.phone || library.mitra.phoneWa,
      description: library.description,
      image: library.image || library.mitra.logo,
      logo: library.image || library.mitra.logo,
      banner: library.banner || library.mitra.banner,
      openHours: library.openingHours || library.mitra.openHours,
      openingHours: library.openingHours || library.mitra.openHours,
      latitude: library.latitude,
      longitude: library.longitude,
      distanceKm,
      formattedDistance: formatDistance(distanceKm),
      collections: formattedCollections,
      reviews: library.reviews,
    };
  }

  async createLibrary(mitraId, data, files = {}) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;

    const image = files.image ? `/uploads/${files.image[0].filename}` : data.image || null;
    const banner = files.banner ? `/uploads/${files.banner[0].filename}` : data.banner || null;

    return prisma.library.create({
      data: {
        mitraId,
        name: data.name,
        slug: uniqueSlug,
        description: data.description || null,
        address: data.address,
        district: data.district || null,
        village: data.village || null,
        phone: data.phone || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        image,
        banner,
        openingHours: data.openingHours || data.openHours || null,
      },
    });
  }

  async updateLibrary(id, data, files = {}) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address) updateData.address = data.address;
    if (data.district) updateData.district = data.district;
    if (data.village) updateData.village = data.village;
    if (data.phone) updateData.phone = data.phone;
    if (data.openingHours || data.openHours) updateData.openingHours = data.openingHours || data.openHours;
    if (data.latitude) updateData.latitude = parseFloat(data.latitude);
    if (data.longitude) updateData.longitude = parseFloat(data.longitude);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (files.image) updateData.image = `/uploads/${files.image[0].filename}`;
    if (files.banner) updateData.banner = `/uploads/${files.banner[0].filename}`;

    return prisma.library.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  async deleteLibrary(id) {
    return prisma.library.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // Collections CRUD
  async getLibraryCollections(libraryId) {
    return prisma.libraryCollection.findMany({
      where: { libraryId: parseInt(libraryId) },
      include: {
        book: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addLibraryCollection(libraryId, { bookId, callNumber, quantity = 1, shelfLocation, category }) {
    const qty = parseInt(quantity);
    return prisma.libraryCollection.upsert({
      where: {
        libraryId_bookId: {
          libraryId: parseInt(libraryId),
          bookId: parseInt(bookId),
        },
      },
      update: {
        callNumber,
        quantity: qty,
        availableQuantity: qty,
        shelfLocation,
        category,
        isAvailable: qty > 0,
      },
      create: {
        libraryId: parseInt(libraryId),
        bookId: parseInt(bookId),
        callNumber,
        quantity: qty,
        availableQuantity: qty,
        shelfLocation,
        category,
        isAvailable: qty > 0,
      },
      include: { book: true },
    });
  }

  async updateLibraryCollection(collectionId, { callNumber, quantity, availableQuantity, shelfLocation, category, isAvailable }) {
    const updateData = {};
    if (callNumber !== undefined) updateData.callNumber = callNumber;
    if (quantity !== undefined) updateData.quantity = parseInt(quantity);
    if (availableQuantity !== undefined) {
      updateData.availableQuantity = parseInt(availableQuantity);
      updateData.isAvailable = parseInt(availableQuantity) > 0;
    }
    if (shelfLocation !== undefined) updateData.shelfLocation = shelfLocation;
    if (category !== undefined) updateData.category = category;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    return prisma.libraryCollection.update({
      where: { id: parseInt(collectionId) },
      data: updateData,
      include: { book: true },
    });
  }

  async deleteLibraryCollection(collectionId) {
    return prisma.libraryCollection.delete({
      where: { id: parseInt(collectionId) },
    });
  }
}

module.exports = new LibraryService();
