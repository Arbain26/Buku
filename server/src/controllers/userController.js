const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// Get user dashboard summary data
const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Fetch user with level, points, favorites, borrowings, events, activities
    const [user, favorites, borrowings, eventJoins, activities, userMissions, missions] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          bio: true,
          district: true,
          points: true,
          level: true,
          createdAt: true,
        },
      }),

      // Favorites
      prisma.favorite.findMany({
        where: { userId },
        include: {
          book: {
            include: {
              category: true,
              storeProducts: { select: { price: true, isAvailable: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Active borrowings
      prisma.borrowing.findMany({
        where: { userId },
        include: {
          collection: {
            include: {
              book: true,
              library: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Registered events
      prisma.eventParticipant.findMany({
        where: { userId },
        include: {
          event: {
            include: {
              mitra: { select: { organizationName: true, logo: true } },
            },
          },
        },
        orderBy: { registeredAt: 'desc' },
        take: 5,
      }),

      // Recent activities
      prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // User missions
      prisma.userMission.findMany({
        where: { userId },
      }),

      // All active missions
      prisma.mission.findMany({
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Count articles read
    const articlesReadCount = activities.filter((a) => a.actionType === 'READ_ARTICLE').length;

    // Calculate level progress
    // Levels: Pembaca Pemula (0-200), Sahabat Buku (201-500), Penggerak Literasi (501-1000), Inspirator Literasi (>1000)
    let currentLevel = 'Pembaca Pemula';
    let nextLevel = 'Sahabat Buku';
    let levelProgress = Math.min(100, Math.round((user.points / 500) * 100));

    if (user.points > 1000) {
      currentLevel = 'Inspirator Literasi';
      nextLevel = 'Level Tertinggi';
      levelProgress = 100;
    } else if (user.points > 500) {
      currentLevel = 'Penggerak Literasi';
      nextLevel = 'Inspirator Literasi';
      levelProgress = Math.min(100, Math.round(((user.points - 500) / 500) * 100));
    } else if (user.points > 200) {
      currentLevel = 'Sahabat Buku';
      nextLevel = 'Penggerak Literasi';
      levelProgress = Math.min(100, Math.round(((user.points - 200) / 300) * 100));
    }

    // Format missions status
    const formattedMissions = missions.map((m) => {
      const um = userMissions.find((x) => x.missionId === m.id);
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        pointsReward: m.pointsReward,
        type: m.type,
        isCompleted: um ? um.isCompleted : false,
        currentCount: um ? um.currentCount : 0,
        requirementCount: m.requirementCount,
      };
    });

    const responseData = {
      user: {
        ...user,
        level: currentLevel,
        nextLevel,
        levelProgress,
      },
      summary: {
        points: user.points,
        articlesRead: articlesReadCount,
        booksSaved: favorites.length,
        eventsJoined: eventJoins.length,
        activeBorrowings: borrowings.filter((b) => ['PENDING', 'APPROVED', 'BORROWED'].includes(b.status)).length,
      },
      favorites: favorites.map((f) => ({
        id: f.book.id,
        title: f.book.title,
        author: f.book.author,
        coverImage: f.book.coverImage,
        rating: f.book.rating,
        category: f.book.category.name,
      })),
      borrowings: borrowings.map((b) => ({
        id: b.id,
        bookTitle: b.collection.book.title,
        bookAuthor: b.collection.book.author,
        coverImage: b.collection.book.coverImage,
        libraryName: b.collection.library.organizationName,
        libraryAddress: b.collection.library.address,
        borrowDate: b.borrowDate,
        dueDate: b.dueDate,
        status: b.status,
      })),
      events: eventJoins.map((ej) => ({
        id: ej.event.id,
        title: ej.event.title,
        eventDate: ej.event.eventDate,
        startTime: ej.event.startTime,
        locationName: ej.event.locationName,
        district: ej.event.district,
        banner: ej.event.banner,
        organizer: ej.event.mitra.organizationName,
        status: ej.status,
      })),
      activities,
      missions: formattedMissions,
    };

    return successResponse(res, 'Dashboard pengguna berhasil dimuat.', responseData);
  } catch (error) {
    next(error);
  }
};

// Complete a daily mission
const completeMission = async (req, res, next) => {
  try {
    const missionId = parseInt(req.params.id);
    const userId = req.user.id;

    const mission = await prisma.mission.findUnique({ where: { id: missionId } });
    if (!mission) {
      return errorResponse(res, 'Misi tidak ditemukan.', 404);
    }

    const userMission = await prisma.userMission.upsert({
      where: {
        userId_missionId: { userId, missionId },
      },
      update: {
        isCompleted: true,
        completedAt: new Date(),
      },
      create: {
        userId,
        missionId,
        currentCount: mission.requirementCount,
        isCompleted: true,
        completedAt: new Date(),
      },
    });

    // Reward points
    await prisma.user.update({
      where: { id: userId },
      data: { points: { increment: mission.pointsReward } },
    });

    await prisma.userActivity.create({
      data: {
        userId,
        actionType: 'COMPLETE_MISSION',
        referenceId: missionId,
        pointsEarned: mission.pointsReward,
        description: `Menyelesaikan misi: "${mission.title}"`,
      },
    });

    return successResponse(
      res,
      `Selamat! Misi "${mission.title}" selesai. +${mission.pointsReward} Poin didapatkan!`,
      userMission
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserDashboard,
  completeMission,
};
