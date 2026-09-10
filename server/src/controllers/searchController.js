const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { calculateDistance, formatDistance, SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

const universalSearch = async (req, res, next) => {
  try {
    const { q = '', filter = 'Semua' } = req.query;
    const query = q.trim();

    if (!query) {
      return successResponse(res, 'Silakan masukkan kata kunci pencarian.', {
        query: '',
        counts: {
          all: 0,
          books: 0,
          libraries: 0,
          stores: 0,
          communities: 0,
          events: 0,
          articles: 0,
        },
        results: {
          books: [],
          libraries: [],
          stores: [],
          communities: [],
          events: [],
          articles: [],
        },
      });
    }

    const userLat = parseFloat(req.query.userLat || SIDRAP_DEFAULT_LAT);
    const userLng = parseFloat(req.query.userLng || SIDRAP_DEFAULT_LNG);

    // Parallel search across all entities
    const [books, libraries, stores, communities, events, articles] = await Promise.all([
      // Books
      prisma.book.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { author: { contains: query } },
            { description: { contains: query } },
            { isbn: { contains: query } },
            { category: { name: { contains: query } } },
          ],
        },
        include: {
          category: true,
          storeProducts: { select: { price: true, isAvailable: true } },
          libraryCollections: { select: { isAvailable: true } },
        },
        take: 12,
      }),

      // Libraries
      prisma.mitraProfile.findMany({
        where: {
          mitraType: 'PERPUSTAKAAN',
          status: 'APPROVED',
          OR: [
            { organizationName: { contains: query } },
            { description: { contains: query } },
            { address: { contains: query } },
            { district: { contains: query } },
            { collections: { some: { book: { title: { contains: query } } } } },
          ],
        },
        include: {
          _count: { select: { collections: true } },
        },
        take: 8,
      }),

      // Stores
      prisma.mitraProfile.findMany({
        where: {
          mitraType: 'TOKO_BUKU',
          status: 'APPROVED',
          OR: [
            { organizationName: { contains: query } },
            { description: { contains: query } },
            { address: { contains: query } },
            { district: { contains: query } },
            { products: { some: { book: { title: { contains: query } } } } },
          ],
        },
        include: {
          _count: { select: { products: true } },
        },
        take: 8,
      }),

      // Communities
      prisma.mitraProfile.findMany({
        where: {
          mitraType: 'KOMUNITAS',
          status: 'APPROVED',
          OR: [
            { organizationName: { contains: query } },
            { description: { contains: query } },
            { address: { contains: query } },
            { district: { contains: query } },
          ],
        },
        include: {
          _count: { select: { communityMembers: true, events: true } },
        },
        take: 8,
      }),

      // Events
      prisma.event.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
            { locationName: { contains: query } },
            { address: { contains: query } },
            { district: { contains: query } },
          ],
        },
        include: {
          mitra: { select: { organizationName: true, logo: true } },
        },
        take: 8,
      }),

      // Articles
      prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: query } },
            { excerpt: { contains: query } },
            { content: { contains: query } },
            { category: { name: { contains: query } } },
          ],
        },
        include: {
          category: true,
          author: { select: { name: true, avatar: true } },
        },
        take: 8,
      }),
    ]);

    // Format results
    const formattedBooks = books.map((b) => ({
      type: 'buku',
      id: b.id,
      title: b.title,
      slug: b.slug,
      author: b.author,
      coverImage: b.coverImage,
      rating: b.rating,
      category: b.category.name,
      statusTersedia: b.storeProducts.length > 0 || b.libraryCollections.length > 0,
      link: `/buku/${b.id}`,
    }));

    const formattedLibraries = libraries.map((lib) => {
      const distanceKm = calculateDistance(userLat, userLng, lib.latitude, lib.longitude);
      return {
        type: 'perpustakaan',
        id: lib.id,
        name: lib.organizationName,
        slug: lib.slug,
        address: lib.address,
        district: lib.district,
        openHours: lib.openHours,
        logo: lib.logo,
        totalCollections: lib._count.collections,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
        link: `/literasi/perpustakaan/${lib.id}`,
      };
    });

    const formattedStores = stores.map((s) => {
      const distanceKm = calculateDistance(userLat, userLng, s.latitude, s.longitude);
      return {
        type: 'toko_buku',
        id: s.id,
        name: s.organizationName,
        slug: s.slug,
        address: s.address,
        district: s.district,
        openHours: s.openHours,
        logo: s.logo,
        totalProducts: s._count.products,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
        link: `/literasi/toko/${s.id}`,
      };
    });

    const formattedCommunities = communities.map((c) => ({
      type: 'komunitas',
      id: c.id,
      name: c.organizationName,
      slug: c.slug,
      address: c.address,
      district: c.district,
      logo: c.logo,
      totalMembers: c._count.communityMembers + 15,
      totalEvents: c._count.events,
      link: `/komunitas/${c.id}`,
    }));

    const formattedEvents = events.map((ev) => ({
      type: 'event',
      id: ev.id,
      title: ev.title,
      slug: ev.slug,
      date: ev.eventDate,
      startTime: ev.startTime,
      locationName: ev.locationName,
      district: ev.district,
      banner: ev.banner,
      organizer: ev.mitra.organizationName,
      quota: ev.quota,
      currentParticipants: ev.currentParticipants,
      link: `/event/${ev.id}`,
    }));

    const formattedArticles = articles.map((a) => ({
      type: 'artikel',
      id: a.id,
      title: a.title,
      slug: a.slug,
      thumbnail: a.thumbnail,
      readTimeMinutes: a.readTimeMinutes,
      category: a.category.name,
      author: a.author.name,
      link: `/baca-5-menit/${a.id}`,
    }));

    const counts = {
      all:
        formattedBooks.length +
        formattedLibraries.length +
        formattedStores.length +
        formattedCommunities.length +
        formattedEvents.length +
        formattedArticles.length,
      books: formattedBooks.length,
      libraries: formattedLibraries.length,
      stores: formattedStores.length,
      communities: formattedCommunities.length,
      events: formattedEvents.length,
      articles: formattedArticles.length,
    };

    return successResponse(res, `Hasil pencarian untuk "${query}"`, {
      query,
      counts,
      results: {
        books: formattedBooks,
        libraries: formattedLibraries,
        stores: formattedStores,
        communities: formattedCommunities,
        events: formattedEvents,
        articles: formattedArticles,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  universalSearch,
};
