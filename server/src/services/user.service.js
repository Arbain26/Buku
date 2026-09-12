const prisma = require('../config/db');

class UserService {
  // Get all users (Admin view with pagination & search)
  async getUsers({ page = 1, limit = 10, search, role, district }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const where = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (district) {
      where.district = district;
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatar: true,
          district: true,
          points: true,
          level: true,
          isActive: true,
          createdAt: true,
          mitraProfile: {
            select: {
              id: true,
              mitraType: true,
              organizationName: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
    ]);

    return { users, total, page: p, limit: l };
  }

  // Get user by ID
  async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        bio: true,
        district: true,
        points: true,
        level: true,
        isActive: true,
        createdAt: true,
        mitraProfile: true,
      },
    });

    if (!user || user.deletedAt) {
      const error = new Error('Pengguna tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  // Update user
  async updateUser(id, data) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.phone) updateData.phone = data.phone;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.district) updateData.district = data.district;
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return user;
  }

  // Soft delete user
  async deleteUser(id) {
    return prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }

  // Get User Dashboard (Gamification, Activity, Borrowings, Events, Favorites)
  async getUserDashboard(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pointRecord: true,
        userMissions: {
          include: { mission: true },
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        borrowings: {
          where: { status: { in: ['PENDING', 'APPROVED', 'BORROWED'] } },
          include: {
            book: true,
            library: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          include: {
            store: true,
            items: { include: { book: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        eventJoins: {
          include: { event: true },
          orderBy: { registeredAt: 'desc' },
          take: 5,
        },
        communityJoins: {
          include: { community: true },
        },
      },
    });

    if (!user) {
      const error = new Error('Pengguna tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    // Ambil semua misi yang tersedia
    const allMissions = await prisma.mission.findMany({
      where: { isActive: true },
    });

    const missionsWithStatus = allMissions.map((m) => {
      const userMission = user.userMissions.find((um) => um.missionId === m.id);
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        points: m.points,
        target: m.target,
        type: m.type,
        progress: userMission ? userMission.progress : 0,
        isCompleted: userMission ? userMission.isCompleted : false,
      };
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        points: user.points,
        level: user.level,
        district: user.district,
      },
      missions: missionsWithStatus,
      recentActivities: user.activities,
      activeBorrowings: user.borrowings,
      recentOrders: user.orders,
      joinedEvents: user.eventJoins.map((ej) => ej.event),
      joinedCommunities: user.communityJoins.map((cj) => cj.community),
    };
  }

  // Selesaikan misi
  async completeMission(userId, missionId) {
    const mission = await prisma.mission.findUnique({
      where: { id: parseInt(missionId) },
    });

    if (!mission) {
      const error = new Error('Misi tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      let userMission = await tx.userMission.findUnique({
        where: {
          userId_missionId: {
            userId,
            missionId: mission.id,
          },
        },
      });

      if (userMission && userMission.isCompleted) {
        const error = new Error('Misi ini sudah diselesaikan sebelumnya.');
        error.statusCode = 400;
        throw error;
      }

      if (!userMission) {
        userMission = await tx.userMission.create({
          data: {
            userId,
            missionId: mission.id,
            progress: mission.target,
            isCompleted: true,
            completedAt: new Date(),
          },
        });
      } else {
        userMission = await tx.userMission.update({
          where: { id: userMission.id },
          data: {
            progress: mission.target,
            isCompleted: true,
            completedAt: new Date(),
          },
        });
      }

      // Tambahkan poin ke user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          points: { increment: mission.points },
        },
      });

      // Catat aktivitas
      await tx.userActivity.create({
        data: {
          userId,
          activityType: 'MISSION_COMPLETE',
          pointsEarned: mission.points,
          description: `Menyelesaikan misi: ${mission.title}`,
        },
      });

      // Catat notifikasi
      await tx.notification.create({
        data: {
          userId,
          type: 'SUCCESS',
          title: 'Misi Selesai!',
          message: `Selamat! Anda memperoleh +${mission.points} poin dari misi "${mission.title}".`,
        },
      });

      return {
        userMission,
        pointsEarned: mission.points,
        totalPoints: updatedUser.points,
      };
    });
  }
}

module.exports = new UserService();
