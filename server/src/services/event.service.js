const prisma = require('../config/db');

class EventService {
  async getEvents({ page = 1, limit = 12, search, category, status, upcoming, district }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const where = {};

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'CANCELLED' };
    }

    if (upcoming === 'true' || upcoming === true) {
      where.eventDate = { gte: new Date() };
    }

    if (district) {
      where.district = district;
    }

    const [total, events] = await Promise.all([
      prisma.event.count({ where }),
      prisma.event.findMany({
        where,
        include: {
          organizer: true,
          _count: {
            select: { participants: true, reviews: true },
          },
        },
        orderBy: { eventDate: 'asc' },
        skip,
        take: l,
      }),
    ]);

    const formattedEvents = events.map((ev) => ({
      id: ev.id,
      title: ev.title,
      slug: ev.slug,
      description: ev.description,
      image: ev.image,
      category: ev.category,
      audience: ev.audience,
      location: ev.location,
      locationName: ev.location,
      address: ev.address,
      district: ev.district,
      eventDate: ev.eventDate,
      startTime: ev.startTime,
      endTime: ev.endTime,
      time: `${ev.startTime} - ${ev.endTime} WITA`,
      capacity: ev.capacity,
      quota: ev.capacity,
      currentParticipants: ev._count.participants,
      isFree: ev.isFree,
      price: ev.price ? Number(ev.price) : 0,
      status: ev.status,
      organizer: {
        id: ev.organizer.id,
        name: ev.organizer.organizationName,
        type: ev.organizer.mitraType,
        logo: ev.organizer.logo,
        phoneWa: ev.organizer.phoneWa,
      },
    }));

    return { events: formattedEvents, total, page: p, limit: l };
  }

  async getEventById(idOrSlug, userId = null) {
    const isId = !isNaN(parseInt(idOrSlug)) && String(parseInt(idOrSlug)) === String(idOrSlug);
    const where = isId ? { id: parseInt(idOrSlug) } : { slug: idOrSlug };

    const event = await prisma.event.findUnique({
      where,
      include: {
        organizer: true,
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          take: 30,
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!event) {
      const error = new Error('Event literasi tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    let isRegistered = false;
    let participantStatus = null;
    if (userId) {
      const part = await prisma.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: event.id,
            userId,
          },
        },
      });
      if (part) {
        isRegistered = true;
        participantStatus = part.status;
      }
    }

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      image: event.image,
      category: event.category,
      audience: event.audience,
      location: event.location,
      locationName: event.location,
      address: event.address,
      district: event.district,
      latitude: event.latitude,
      longitude: event.longitude,
      eventDate: event.eventDate,
      startTime: event.startTime,
      endTime: event.endTime,
      time: `${event.startTime} - ${event.endTime} WITA`,
      capacity: event.capacity,
      quota: event.capacity,
      currentParticipants: event.participants.length,
      registrationDeadline: event.registrationDeadline,
      isFree: event.isFree,
      price: event.price ? Number(event.price) : 0,
      status: event.status,
      isRegistered,
      participantStatus,
      organizer: {
        id: event.organizer.id,
        name: event.organizer.organizationName,
        type: event.organizer.mitraType,
        logo: event.organizer.logo,
        banner: event.organizer.banner,
        phoneWa: event.organizer.phoneWa,
        address: event.organizer.address,
      },
      participants: event.participants,
      reviews: event.reviews,
    };
  }

  async createEvent(mitraId, data, file) {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;

    const image = file ? `/uploads/${file.filename}` : data.image || null;

    return prisma.event.create({
      data: {
        organizerMitraId: mitraId,
        title: data.title,
        slug: uniqueSlug,
        description: data.description,
        image,
        category: data.category || 'DISKUSI',
        audience: data.audience || 'UMUM',
        location: data.location || data.locationName,
        address: data.address || null,
        district: data.district || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        eventDate: new Date(data.eventDate),
        startTime: data.startTime,
        endTime: data.endTime,
        capacity: data.capacity ? parseInt(data.capacity) : 50,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
        isFree: data.isFree === 'false' || data.isFree === false ? false : true,
        price: data.price ? parseFloat(data.price) : null,
        status: data.status || 'PUBLISHED',
      },
    });
  }

  async updateEvent(id, data, file) {
    const updateData = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    if (data.audience) updateData.audience = data.audience;
    if (data.location || data.locationName) updateData.location = data.location || data.locationName;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.latitude) updateData.latitude = parseFloat(data.latitude);
    if (data.longitude) updateData.longitude = parseFloat(data.longitude);
    if (data.eventDate) updateData.eventDate = new Date(data.eventDate);
    if (data.startTime) updateData.startTime = data.startTime;
    if (data.endTime) updateData.endTime = data.endTime;
    if (data.capacity) updateData.capacity = parseInt(data.capacity);
    if (data.registrationDeadline) updateData.registrationDeadline = new Date(data.registrationDeadline);
    if (data.isFree !== undefined) updateData.isFree = data.isFree === 'true' || data.isFree === true;
    if (data.price !== undefined) updateData.price = data.price ? parseFloat(data.price) : null;
    if (data.status) updateData.status = data.status;

    if (file) {
      updateData.image = `/uploads/${file.filename}`;
    }

    return prisma.event.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  async deleteEvent(id) {
    return prisma.event.delete({
      where: { id: parseInt(id) },
    });
  }

  // Register event with transaction, capacity, deadline check, points
  async registerEvent(eventId, userId) {
    const evId = parseInt(eventId);

    return prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: evId },
        include: {
          _count: { select: { participants: true } },
        },
      });

      if (!event) {
        const error = new Error('Event tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }

      if (event.status === 'CANCELLED') {
        const error = new Error('Pendaftaran ditutup karena event telah dibatalkan.');
        error.statusCode = 400;
        throw error;
      }

      if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
        const error = new Error('Batas waktu pendaftaran event ini telah berakhir.');
        error.statusCode = 400;
        throw error;
      }

      if (event._count.participants >= event.capacity) {
        const error = new Error('Kapasitas peserta event telah penuh.');
        error.statusCode = 400;
        throw error;
      }

      const existing = await tx.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: evId,
            userId,
          },
        },
      });

      if (existing) {
        const error = new Error('Anda sudah terdaftar pada event ini.');
        error.statusCode = 400;
        throw error;
      }

      const participant = await tx.eventParticipant.create({
        data: {
          eventId: evId,
          userId,
          status: 'REGISTERED',
        },
      });

      // Update currentParticipants
      await tx.event.update({
        where: { id: evId },
        data: {
          currentParticipants: { increment: 1 },
        },
      });

      // Beri poin partisipasi
      await tx.user.update({
        where: { id: userId },
        data: { points: { increment: 10 } },
      });

      await tx.userActivity.create({
        data: {
          userId,
          activityType: 'JOIN_EVENT',
          referenceId: evId,
          pointsEarned: 10,
          description: `Mendaftar event: ${event.title}`,
        },
      });

      await tx.notification.create({
        data: {
          userId,
          type: 'SUCCESS',
          title: 'Pendaftaran Event Berhasil!',
          message: `Anda berhasil mendaftar pada event "${event.title}". Catat tanggal dan jam pelaksanaannya!`,
        },
      });

      return participant;
    });
  }

  // Cancel registration
  async cancelRegistration(eventId, userId) {
    const evId = parseInt(eventId);

    return prisma.$transaction(async (tx) => {
      const existing = await tx.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: evId,
            userId,
          },
        },
      });

      if (!existing) {
        const error = new Error('Anda tidak terdaftar pada event ini.');
        error.statusCode = 400;
        throw error;
      }

      await tx.eventParticipant.delete({
        where: { id: existing.id },
      });

      await tx.event.update({
        where: { id: evId },
        data: {
          currentParticipants: { decrement: 1 },
        },
      });

      return true;
    });
  }

  // Get event participants (for organizer)
  async getParticipants(eventId) {
    return prisma.eventParticipant.findMany({
      where: { eventId: parseInt(eventId) },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, avatar: true } },
      },
      orderBy: { registeredAt: 'desc' },
    });
  }

  // Check-in participant
  async checkInParticipant(eventId, userId) {
    const evId = parseInt(eventId);
    const uId = parseInt(userId);

    return prisma.$transaction(async (tx) => {
      const participant = await tx.eventParticipant.findUnique({
        where: {
          eventId_userId: {
            eventId: evId,
            userId: uId,
          },
        },
      });

      if (!participant) {
        const error = new Error('Peserta tidak ditemukan pada event ini.');
        error.statusCode = 404;
        throw error;
      }

      const updated = await tx.eventParticipant.update({
        where: { id: participant.id },
        data: {
          status: 'ATTENDED',
          attendedAt: new Date(),
        },
      });

      // Bonus poin kehadiran
      await tx.user.update({
        where: { id: uId },
        data: { points: { increment: 20 } },
      });

      await tx.userActivity.create({
        data: {
          userId: uId,
          activityType: 'ATTEND_EVENT',
          referenceId: evId,
          pointsEarned: 20,
          description: 'Hadir pada event literasi MABBACA',
        },
      });

      return updated;
    });
  }
}

module.exports = new EventService();
