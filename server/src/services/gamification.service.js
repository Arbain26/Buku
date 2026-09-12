const prisma = require('../config/db');

class GamificationService {
  // Ambil daftar misi aktif dan progress untuk user
  async getMissions(userId) {
    const missions = await prisma.mission.findMany({
      where: { isActive: true },
      orderBy: { points: 'asc' },
    });

    let userMissions = [];
    if (userId) {
      userMissions = await prisma.userMission.findMany({
        where: { userId },
      });
    }

    return missions.map((m) => {
      const um = userMissions.find((item) => item.missionId === m.id);
      return {
        id: m.id,
        title: m.title,
        description: m.description,
        points: m.points,
        target: m.target,
        type: m.type,
        progress: um ? um.progress : 0,
        isCompleted: um ? um.isCompleted : false,
        completedAt: um ? um.completedAt : null,
      };
    });
  }

  // Leaderboard pengguna teraktif
  async getLeaderboard(limit = 10) {
    const topUsers = await prisma.user.findMany({
      where: {
        role: 'USER',
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        points: true,
        level: true,
        district: true,
      },
      orderBy: { points: 'desc' },
      take: parseInt(limit),
    });

    return topUsers.map((u, idx) => ({
      rank: idx + 1,
      ...u,
    }));
  }

  // Riwayat perolehan poin user
  async getUserActivities(userId, { page = 1, limit = 15 }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const [total, activities] = await Promise.all([
      prisma.userActivity.count({ where: { userId } }),
      prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
    ]);

    return { activities, total, page: p, limit: l };
  }

  // Catat aktivitas poin
  async recordActivity(userId, activityType, pointsEarned, description, referenceId = null) {
    return prisma.$transaction(async (tx) => {
      // Buat log aktivitas
      const activity = await tx.userActivity.create({
        data: {
          userId,
          activityType,
          pointsEarned,
          description,
          referenceId,
        },
      });

      // Perbarui poin user
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          points: { increment: pointsEarned },
        },
      });

      // Update level berdasarkan poin
      let newLevel = user.level;
      if (user.points >= 1000) newLevel = 'Duta Literasi Sidrap';
      else if (user.points >= 500) newLevel = 'Kutu Buku';
      else if (user.points >= 250) newLevel = 'Pembaca Setia';
      else if (user.points >= 100) newLevel = 'Pembaca Aktif';

      if (newLevel !== user.level) {
        await tx.user.update({
          where: { id: userId },
          data: { level: newLevel },
        });

        await tx.notification.create({
          data: {
            userId,
            type: 'SUCCESS',
            title: 'Naik Level Literasi!',
            message: `Selamat! Poin Anda mencapai ${user.points}. Level Anda naik menjadi "${newLevel}".`,
          },
        });
      }

      // Update Point record jika ada
      await tx.point.upsert({
        where: { userId },
        update: { totalPoints: user.points, level: newLevel },
        create: { userId, totalPoints: user.points, level: newLevel },
      });

      return { activity, totalPoints: user.points, level: newLevel };
    });
  }
}

module.exports = new GamificationService();
