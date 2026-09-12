const prisma = require('../config/db');

class FavoriteService {
  // Get all favorites for current user
  async getUserFavorites(userId) {
    const [books, stores, libraries, communities, events, articles] = await Promise.all([
      prisma.userBookFavorite.findMany({
        where: { userId },
        include: {
          book: {
            include: { category: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userStoreFavorite.findMany({
        where: { userId },
        include: { store: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userLibraryFavorite.findMany({
        where: { userId },
        include: { library: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userCommunityFavorite.findMany({
        where: { userId },
        include: { community: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userEventFavorite.findMany({
        where: { userId },
        include: { event: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userArticleFavorite.findMany({
        where: { userId },
        include: { article: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      books: books.map((f) => f.book),
      stores: stores.map((f) => f.store),
      libraries: libraries.map((f) => f.library),
      communities: communities.map((f) => f.community),
      events: events.map((f) => f.event),
      articles: articles.map((f) => f.article),
    };
  }

  // Toggle Book Favorite
  async toggleBookFavorite(userId, bookId) {
    const bId = parseInt(bookId);
    const existing = await prisma.userBookFavorite.findUnique({
      where: { userId_bookId: { userId, bookId: bId } },
    });

    if (existing) {
      await prisma.userBookFavorite.delete({ where: { id: existing.id } });
      return { favorited: false, message: 'Buku dihapus dari daftar favorit.' };
    }

    await prisma.userBookFavorite.create({
      data: { userId, bookId: bId },
    });
    return { favorited: true, message: 'Buku berhasil ditambahkan ke daftar favorit.' };
  }

  // Toggle Store Favorite
  async toggleStoreFavorite(userId, storeId) {
    const sId = parseInt(storeId);
    const existing = await prisma.userStoreFavorite.findUnique({
      where: { userId_storeId: { userId, storeId: sId } },
    });

    if (existing) {
      await prisma.userStoreFavorite.delete({ where: { id: existing.id } });
      return { favorited: false, message: 'Toko buku dihapus dari favorit.' };
    }

    await prisma.userStoreFavorite.create({
      data: { userId, storeId: sId },
    });
    return { favorited: true, message: 'Toko buku berhasil difavoritkan.' };
  }

  // Toggle Library Favorite
  async toggleLibraryFavorite(userId, libraryId) {
    const lId = parseInt(libraryId);
    const existing = await prisma.userLibraryFavorite.findUnique({
      where: { userId_libraryId: { userId, libraryId: lId } },
    });

    if (existing) {
      await prisma.userLibraryFavorite.delete({ where: { id: existing.id } });
      return { favorited: false, message: 'Perpustakaan dihapus dari favorit.' };
    }

    await prisma.userLibraryFavorite.create({
      data: { userId, libraryId: lId },
    });
    return { favorited: true, message: 'Perpustakaan berhasil difavoritkan.' };
  }

  // Toggle Community Favorite
  async toggleCommunityFavorite(userId, communityId) {
    const cId = parseInt(communityId);
    const existing = await prisma.userCommunityFavorite.findUnique({
      where: { userId_communityId: { userId, communityId: cId } },
    });

    if (existing) {
      await prisma.userCommunityFavorite.delete({ where: { id: existing.id } });
      return { favorited: false, message: 'Komunitas dihapus dari favorit.' };
    }

    await prisma.userCommunityFavorite.create({
      data: { userId, communityId: cId },
    });
    return { favorited: true, message: 'Komunitas berhasil difavoritkan.' };
  }

  // Toggle Event Favorite
  async toggleEventFavorite(userId, eventId) {
    const eId = parseInt(eventId);
    const existing = await prisma.userEventFavorite.findUnique({
      where: { userId_eventId: { userId, eventId: eId } },
    });

    if (existing) {
      await prisma.userEventFavorite.delete({ where: { id: existing.id } });
      return { favorited: false, message: 'Event dihapus dari favorit.' };
    }

    await prisma.userEventFavorite.create({
      data: { userId, eventId: eId },
    });
    return { favorited: true, message: 'Event berhasil disimpan ke favorit.' };
  }

  // Toggle Article Favorite
  async toggleArticleFavorite(userId, articleId) {
    const aId = parseInt(articleId);
    const existing = await prisma.userArticleFavorite.findUnique({
      where: { userId_articleId: { userId, articleId: aId } },
    });

    if (existing) {
      await prisma.userArticleFavorite.delete({ where: { id: existing.id } });
      return { favorited: false, message: 'Artikel dihapus dari favorit.' };
    }

    await prisma.userArticleFavorite.create({
      data: { userId, articleId: aId },
    });
    return { favorited: true, message: 'Artikel berhasil disimpan ke favorit.' };
  }
}

module.exports = new FavoriteService();
