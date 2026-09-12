const prisma = require('../config/db');
const { calculateDistance, formatDistance, SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

class SearchService {
  async universalSearch({
    q = '',
    type = 'all',
    filter,
    category,
    district,
    latitude,
    longitude,
    userLat,
    userLng,
    page = 1,
    limit = 12,
  }) {
    const query = q.trim();
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const lat = parseFloat(latitude || userLat || SIDRAP_DEFAULT_LAT);
    const lng = parseFloat(longitude || userLng || SIDRAP_DEFAULT_LNG);

    // Normalisasi parameter filter (kompatibilitas frontend Prompt 1)
    let activeType = type.toLowerCase();
    if (filter) {
      const f = filter.toLowerCase();
      if (f === 'buku') activeType = 'book';
      else if (f === 'toko' || f === 'toko buku') activeType = 'store';
      else if (f === 'perpustakaan') activeType = 'library';
      else if (f === 'komunitas') activeType = 'community';
      else if (f === 'event') activeType = 'event';
      else if (f === 'artikel') activeType = 'article';
      else if (f === 'semua') activeType = 'all';
    }

    if (!query && activeType === 'all') {
      return {
        query: '',
        counts: { all: 0, books: 0, libraries: 0, stores: 0, communities: 0, events: 0, articles: 0 },
        results: { books: [], libraries: [], stores: [], communities: [], events: [], articles: [] },
        total: 0,
        page: p,
        limit: l,
      };
    }

    const results = {
      books: [],
      libraries: [],
      stores: [],
      communities: [],
      events: [],
      articles: [],
    };

    const counts = {
      all: 0,
      books: 0,
      libraries: 0,
      stores: 0,
      communities: 0,
      events: 0,
      articles: 0,
    };

    // 1. Search Books
    if (activeType === 'all' || activeType === 'book' || activeType === 'books') {
      const bookWhere = {
        deletedAt: null,
        OR: query
          ? [
              { title: { contains: query } },
              { author: { contains: query } },
              { description: { contains: query } },
              { isbn: { contains: query } },
            ]
          : undefined,
      };

      if (category) {
        bookWhere.category = { name: { contains: category } };
      }

      const [bCount, books] = await Promise.all([
        prisma.book.count({ where: bookWhere }),
        prisma.book.findMany({
          where: bookWhere,
          include: {
            category: true,
            storeProducts: { select: { price: true, isAvailable: true } },
            libraryCollections: { select: { isAvailable: true } },
          },
          skip: activeType !== 'all' ? skip : 0,
          take: activeType !== 'all' ? l : 8,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      counts.books = bCount;
      results.books = books.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        author: b.author,
        category: b.category ? b.category.name : null,
        coverImage: b.coverImage,
        rating: b.rating,
        reviewCount: b.reviewCount,
        hasStore: b.storeProducts.some((sp) => sp.isAvailable),
        hasLibrary: b.libraryCollections.some((lc) => lc.isAvailable),
      }));
    }

    // 2. Search Stores
    if (activeType === 'all' || activeType === 'store' || activeType === 'stores') {
      const storeWhere = {
        isActive: true,
        deletedAt: null,
        mitra: { status: 'APPROVED' },
        OR: query
          ? [
              { name: { contains: query } },
              { description: { contains: query } },
              { address: { contains: query } },
              { district: { contains: query } },
              { products: { some: { book: { title: { contains: query } } } } },
            ]
          : undefined,
      };

      if (district) {
        storeWhere.district = district;
      }

      const [sCount, stores] = await Promise.all([
        prisma.store.count({ where: storeWhere }),
        prisma.store.findMany({
          where: storeWhere,
          include: {
            _count: { select: { products: true } },
          },
          skip: activeType !== 'all' ? skip : 0,
          take: activeType !== 'all' ? l : 6,
        }),
      ]);

      counts.stores = sCount;
      results.stores = stores.map((s) => {
        const distanceKm = calculateDistance(lat, lng, s.latitude, s.longitude);
        return {
          id: s.id,
          name: s.name,
          slug: s.slug,
          address: s.address,
          district: s.district,
          whatsappNumber: s.whatsappNumber,
          phoneWa: s.whatsappNumber,
          image: s.image,
          logo: s.image,
          totalProducts: s._count.products,
          distanceKm,
          formattedDistance: formatDistance(distanceKm),
        };
      });
    }

    // 3. Search Libraries
    if (activeType === 'all' || activeType === 'library' || activeType === 'libraries') {
      const libWhere = {
        isActive: true,
        deletedAt: null,
        mitra: { status: 'APPROVED' },
        OR: query
          ? [
              { name: { contains: query } },
              { description: { contains: query } },
              { address: { contains: query } },
              { district: { contains: query } },
              { collections: { some: { book: { title: { contains: query } } } } },
            ]
          : undefined,
      };

      if (district) {
        libWhere.district = district;
      }

      const [lCount, libraries] = await Promise.all([
        prisma.library.count({ where: libWhere }),
        prisma.library.findMany({
          where: libWhere,
          include: {
            _count: { select: { collections: true } },
          },
          skip: activeType !== 'all' ? skip : 0,
          take: activeType !== 'all' ? l : 6,
        }),
      ]);

      counts.libraries = lCount;
      results.libraries = libraries.map((lib) => {
        const distanceKm = calculateDistance(lat, lng, lib.latitude, lib.longitude);
        return {
          id: lib.id,
          name: lib.name,
          slug: lib.slug,
          address: lib.address,
          district: lib.district,
          phone: lib.phone,
          image: lib.image,
          logo: lib.image,
          totalCollections: lib._count.collections,
          distanceKm,
          formattedDistance: formatDistance(distanceKm),
        };
      });
    }

    // 4. Search Communities
    if (activeType === 'all' || activeType === 'community' || activeType === 'communities') {
      const commWhere = {
        isActive: true,
        deletedAt: null,
        OR: query
          ? [
              { name: { contains: query } },
              { description: { contains: query } },
              { address: { contains: query } },
              { district: { contains: query } },
            ]
          : undefined,
      };

      const [cCount, communities] = await Promise.all([
        prisma.community.count({ where: commWhere }),
        prisma.community.findMany({
          where: commWhere,
          include: {
            _count: { select: { members: true } },
          },
          skip: activeType !== 'all' ? skip : 0,
          take: activeType !== 'all' ? l : 6,
        }),
      ]);

      counts.communities = cCount;
      results.communities = communities.map((c) => {
        const distanceKm = calculateDistance(lat, lng, c.latitude, c.longitude);
        return {
          id: c.id,
          name: c.name,
          slug: c.slug,
          address: c.address,
          district: c.district,
          logo: c.logo,
          image: c.logo,
          totalMembers: c._count.members,
          distanceKm,
          formattedDistance: formatDistance(distanceKm),
        };
      });
    }

    // 5. Search Events
    if (activeType === 'all' || activeType === 'event' || activeType === 'events') {
      const eventWhere = {
        status: { not: 'CANCELLED' },
        OR: query
          ? [
              { title: { contains: query } },
              { description: { contains: query } },
              { location: { contains: query } },
            ]
          : undefined,
      };

      const [eCount, events] = await Promise.all([
        prisma.event.count({ where: eventWhere }),
        prisma.event.findMany({
          where: eventWhere,
          include: {
            organizer: true,
            _count: { select: { participants: true } },
          },
          skip: activeType !== 'all' ? skip : 0,
          take: activeType !== 'all' ? l : 6,
          orderBy: { eventDate: 'asc' },
        }),
      ]);

      counts.events = eCount;
      results.events = events.map((ev) => ({
        id: ev.id,
        title: ev.title,
        slug: ev.slug,
        category: ev.category,
        location: ev.location,
        eventDate: ev.eventDate,
        startTime: ev.startTime,
        endTime: ev.endTime,
        image: ev.image,
        organizerName: ev.organizer.organizationName,
        currentParticipants: ev._count.participants,
        capacity: ev.capacity,
      }));
    }

    // 6. Search Articles
    if (activeType === 'all' || activeType === 'article' || activeType === 'articles') {
      const artWhere = {
        status: 'PUBLISHED',
        deletedAt: null,
        OR: query
          ? [
              { title: { contains: query } },
              { excerpt: { contains: query } },
              { content: { contains: query } },
            ]
          : undefined,
      };

      const [aCount, articles] = await Promise.all([
        prisma.article.count({ where: artWhere }),
        prisma.article.findMany({
          where: artWhere,
          include: {
            author: { select: { name: true } },
            categories: { include: { category: true } },
          },
          skip: activeType !== 'all' ? skip : 0,
          take: activeType !== 'all' ? l : 6,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      counts.articles = aCount;
      results.articles = articles.map((art) => ({
        id: art.id,
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        thumbnail: art.thumbnail,
        author: art.author ? art.author.name : null,
        readingTime: art.readingTime,
        category: art.categories.length > 0 ? art.categories[0].category.name : 'Umum',
      }));
    }

    counts.all =
      counts.books +
      counts.stores +
      counts.libraries +
      counts.communities +
      counts.events +
      counts.articles;

    const total = activeType === 'all' ? counts.all : counts[activeType + 's'] || counts[activeType] || 0;

    return {
      query,
      activeType,
      counts,
      results,
      total,
      page: p,
      limit: l,
    };
  }
}

module.exports = new SearchService();
