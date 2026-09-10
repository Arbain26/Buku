const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { calculateDistance, formatDistance, SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

// Get all events with filters
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      audience,
      district,
      status = 'UPCOMING',
    } = req.query;

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (category && category !== 'Semua') {
      where.category = category;
    }

    if (audience && audience !== 'Semua') {
      where.audience = audience;
    }

    if (district && district !== 'Semua') {
      where.district = district;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { locationName: { contains: search } },
      ];
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        mitra: {
          select: {
            id: true,
            organizationName: true,
            slug: true,
            logo: true,
            mitraType: true,
            phoneWa: true,
          },
        },
      },
      orderBy: { eventDate: 'asc' },
    });

    const userLat = parseFloat(req.query.userLat || SIDRAP_DEFAULT_LAT);
    const userLng = parseFloat(req.query.userLng || SIDRAP_DEFAULT_LNG);

    const formattedEvents = events.map((ev) => {
      const distanceKm = calculateDistance(userLat, userLng, ev.latitude || SIDRAP_DEFAULT_LAT, ev.longitude || SIDRAP_DEFAULT_LNG);
      return {
        id: ev.id,
        title: ev.title,
        slug: ev.slug,
        description: ev.description,
        banner: ev.banner,
        eventDate: ev.eventDate,
        startTime: ev.startTime,
        endTime: ev.endTime,
        locationName: ev.locationName,
        address: ev.address,
        district: ev.district,
        category: ev.category,
        audience: ev.audience,
        quota: ev.quota,
        currentParticipants: ev.currentParticipants,
        isFree: ev.isFree,
        price: ev.price ? Number(ev.price) : 0,
        status: ev.status,
        organizer: ev.mitra.organizationName,
        organizerSlug: ev.mitra.slug,
        organizerLogo: ev.mitra.logo,
        organizerType: ev.mitra.mitraType,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
        isFull: ev.currentParticipants >= ev.quota,
      };
    });

    return successResponse(res, 'Daftar event literasi berhasil dimuat.', formattedEvents);
  } catch (error) {
    next(error);
  }
};

// Get single event details
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const eventId = isNaN(id) ? undefined : parseInt(id);
    const slug = isNaN(id) ? id : undefined;

    const where = eventId ? { id: eventId } : { slug };

    const event = await prisma.event.findFirst({
      where,
      include: {
        mitra: {
          select: {
            id: true,
            organizationName: true,
            slug: true,
            logo: true,
            description: true,
            phoneWa: true,
            address: true,
            district: true,
          },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, level: true },
            },
          },
        },
      },
    });

    if (!event) {
      return errorResponse(res, 'Event literasi tidak ditemukan.', 404);
    }

    let isRegistered = false;
    if (req.user) {
      isRegistered = event.participants.some((p) => p.userId === req.user.id);
    }

    const responseData = {
      ...event,
      organizer: event.mitra,
      isRegistered,
      isFull: event.currentParticipants >= event.quota,
    };

    return successResponse(res, 'Detail event berhasil dimuat.', responseData);
  } catch (error) {
    next(error);
  }
};

// Register for an event
const registerEvent = async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = req.user.id;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { mitra: true },
    });

    if (!event) {
      return errorResponse(res, 'Event tidak ditemukan.', 404);
    }

    if (event.currentParticipants >= event.quota) {
      return errorResponse(res, 'Mohon maaf, kuota peserta untuk event ini sudah penuh.', 400);
    }

    const existing = await prisma.eventParticipant.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (existing) {
      return errorResponse(res, 'Anda sudah terdaftar dalam event ini.', 400);
    }

    // Create participant and increment participant count
    await prisma.$transaction([
      prisma.eventParticipant.create({
        data: {
          eventId,
          userId,
          status: 'REGISTERED',
        },
      }),
      prisma.event.update({
        where: { id: eventId },
        data: {
          currentParticipants: { increment: 1 },
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          points: { increment: 20 },
        },
      }),
      prisma.userActivity.create({
        data: {
          userId,
          actionType: 'JOIN_EVENT',
          referenceId: eventId,
          pointsEarned: 20,
          description: `Mendaftar event: "${event.title}" diselenggarakan oleh ${event.mitra.organizationName}.`,
        },
      }),
      prisma.notification.create({
        data: {
          userId,
          title: 'Pendaftaran Event Berhasil!',
          message: `Anda berhasil terdaftar di event "${event.title}". Sampai jumpa di lokasi!`,
          type: 'SUCCESS',
          linkUrl: `/event/${event.id}`,
        },
      }),
    ]);

    return successResponse(res, 'Pendaftaran event berhasil! Anda mendapatkan +20 Poin Literasi.', { isRegistered: true }, 201);
  } catch (error) {
    next(error);
  }
};

// Create event (Mitra / Admin)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      eventDate,
      startTime,
      endTime,
      locationName,
      address,
      district,
      category,
      audience,
      quota,
      isFree,
      price,
      banner,
    } = req.body;

    let mitraId;
    if (req.user.role === 'ADMIN') {
      mitraId = req.body.mitraId || (await prisma.mitraProfile.findFirst())?.id;
    } else if (req.user.role === 'MITRA') {
      mitraId = req.user.mitraProfile?.id;
    }

    if (!mitraId) {
      return errorResponse(res, 'Mitra penyelenggara wajib ditentukan.', 400);
    }

    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    let finalBanner = banner;
    if (req.file) {
      finalBanner = `/uploads/${req.file.filename}`;
    }

    const newEvent = await prisma.event.create({
      data: {
        mitraId,
        title,
        slug,
        description,
        banner: finalBanner || 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&auto=format&fit=crop&q=80',
        eventDate: new Date(eventDate),
        startTime: startTime || '15.30',
        endTime: endTime || '17.30 WITA',
        locationName,
        address,
        district: district || 'Pangkajene',
        category: category || 'DISKUSI',
        audience: audience || 'UMUM',
        quota: quota ? parseInt(quota) : 50,
        isFree: isFree !== 'false' && isFree !== false,
        price: price ? parseFloat(price) : null,
      },
    });

    return successResponse(res, 'Event literasi baru berhasil dibuat.', newEvent, 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  registerEvent,
  createEvent,
};
