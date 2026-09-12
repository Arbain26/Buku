const prisma = require('../config/db');

class NotificationService {
  async getUserNotifications(userId, { page = 1, limit = 15 }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const [total, unreadCount, notifications] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
    ]);

    return {
      notifications,
      unreadCount,
      total,
      page: p,
      limit: l,
    };
  }

  async markAsRead(id, userId) {
    return prisma.notification.updateMany({
      where: { id: parseInt(id), userId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async createNotification({ userId, title, message, type = 'INFO', linkUrl, data }) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        linkUrl,
        data: typeof data === 'object' ? JSON.stringify(data) : data,
      },
    });
  }
}

module.exports = new NotificationService();
