const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { calculateDistance, formatDistance, SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

// Get all literacy communities
const getCommunities = async (req, res, next) => {
  try {
    const { search, district } = req.query;

    const where = {
      mitraType: 'KOMUNITAS',
      status: 'APPROVED',
    };

    if (search) {
      where.OR = [
        { organizationName: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (district) {
      where.district = district;
    }

    const communities = await prisma.mitraProfile.findMany({
      where,
      include: {
        _count: {
          select: {
            communityMembers: true,
            events: true,
          },
        },
      },
      orderBy: { organizationName: 'asc' },
    });

    const userLat = parseFloat(req.query.userLat || SIDRAP_DEFAULT_LAT);
    const userLng = parseFloat(req.query.userLng || SIDRAP_DEFAULT_LNG);

    const formatted = communities.map((comm) => {
      const distanceKm = calculateDistance(userLat, userLng, comm.latitude, comm.longitude);
      return {
        id: comm.id,
        name: comm.organizationName,
        slug: comm.slug,
        address: comm.address,
        district: comm.district,
        village: comm.village,
        phoneWa: comm.phoneWa,
        description: comm.description,
        logo: comm.logo,
        banner: comm.banner,
        openHours: comm.openHours,
        totalMembers: comm._count.communityMembers + 15, // realistic initial community pool
        totalEvents: comm._count.events,
        latitude: comm.latitude,
        longitude: comm.longitude,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
      };
    });

    return successResponse(res, 'Daftar komunitas literasi berhasil dimuat.', formatted);
  } catch (error) {
    next(error);
  }
};

// Get single community details
const getCommunityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const commId = isNaN(id) ? undefined : parseInt(id);
    const slug = isNaN(id) ? id : undefined;

    const where = commId ? { id: commId } : { slug };

    const community = await prisma.mitraProfile.findFirst({
      where: {
        ...where,
        mitraType: 'KOMUNITAS',
        status: 'APPROVED',
      },
      include: {
        events: {
          orderBy: { eventDate: 'asc' },
        },
        communityMembers: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, level: true },
            },
          },
        },
      },
    });

    if (!community) {
      return errorResponse(res, 'Komunitas literasi tidak ditemukan.', 404);
    }

    let isMember = false;
    if (req.user) {
      isMember = community.communityMembers.some((m) => m.userId === req.user.id);
    }

    const responseData = {
      id: community.id,
      name: community.organizationName,
      slug: community.slug,
      address: community.address,
      district: community.district,
      village: community.village,
      phoneWa: community.phoneWa,
      description: community.description,
      logo: community.logo,
      banner: community.banner,
      openHours: community.openHours,
      totalMembers: community.communityMembers.length + 15,
      totalEvents: community.events.length,
      isMember,
      activities: [
        'Lapak Baca Buku Terbuka Akhir Pekan',
        'Bedah Buku & Diskusi Gagasan Pemuda',
        'Kelas Menulis Esai & Cerpen',
        'Kampanye Donasi Buku ke Pelosok Sidrap',
      ],
      upcomingEvents: community.events,
      members: community.communityMembers.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        avatar: m.user.avatar,
        level: m.user.level,
        role: m.role,
        joinedAt: m.joinedAt,
      })),
    };

    return successResponse(res, 'Detail komunitas berhasil dimuat.', responseData);
  } catch (error) {
    next(error);
  }
};

// Join or leave community
const toggleJoinCommunity = async (req, res, next) => {
  try {
    const communityId = parseInt(req.params.id);
    const userId = req.user.id;

    const existing = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: { communityId, userId },
      },
    });

    if (existing) {
      await prisma.communityMember.delete({
        where: { id: existing.id },
      });
      return successResponse(res, 'Anda telah keluar dari komunitas ini.', { isMember: false });
    } else {
      await prisma.communityMember.create({
        data: {
          communityId,
          userId,
          role: 'ANGGOTA',
        },
      });

      // Reward points
      await prisma.user.update({
        where: { id: userId },
        data: { points: { increment: 15 } },
      });

      await prisma.userActivity.create({
        data: {
          userId,
          actionType: 'JOIN_COMMUNITY',
          referenceId: communityId,
          pointsEarned: 15,
          description: 'Bergabung dengan komunitas literasi di Sidrap.',
        },
      });

      return successResponse(res, 'Selamat! Anda resmi bergabung dengan komunitas ini (+15 Poin).', { isMember: true });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommunities,
  getCommunityById,
  toggleJoinCommunity,
};
