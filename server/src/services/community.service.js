const prisma = require('../config/db');
const { calculateDistance, formatDistance, SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

class CommunityService {
  async getCommunities({ page = 1, limit = 12, search, district, userLat = SIDRAP_DEFAULT_LAT, userLng = SIDRAP_DEFAULT_LNG }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    const where = {
      isActive: true,
      deletedAt: null,
      mitra: {
        status: 'APPROVED',
      },
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { address: { contains: search } },
      ];
    }

    if (district) {
      where.district = district;
    }

    const [total, communities] = await Promise.all([
      prisma.community.count({ where }),
      prisma.community.findMany({
        where,
        include: {
          mitra: true,
          _count: {
            select: { members: true, reviews: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: l,
      }),
    ]);

    const formattedCommunities = communities.map((comm) => {
      const distanceKm = calculateDistance(lat, lng, comm.latitude, comm.longitude);
      return {
        id: comm.id,
        mitraId: comm.mitraId,
        name: comm.name,
        slug: comm.slug,
        address: comm.address,
        district: comm.district || comm.mitra.district,
        village: comm.village || comm.mitra.village,
        phone: comm.contact || comm.mitra.phoneWa,
        phoneWa: comm.contact || comm.mitra.phoneWa,
        description: comm.description,
        image: comm.logo || comm.mitra.logo,
        logo: comm.logo || comm.mitra.logo,
        banner: comm.coverImage || comm.mitra.banner,
        openHours: comm.mitra.openHours || 'Sesuai Jadwal Kegiatan',
        totalMembers: comm._count.members,
        totalReviews: comm._count.reviews,
        latitude: comm.latitude,
        longitude: comm.longitude,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
      };
    });

    formattedCommunities.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));

    return { communities: formattedCommunities, total, page: p, limit: l };
  }

  async getCommunityById(idOrSlug, userId = null) {
    const isId = !isNaN(parseInt(idOrSlug)) && String(parseInt(idOrSlug)) === String(idOrSlug);
    const where = isId ? { id: parseInt(idOrSlug) } : { slug: idOrSlug };

    const community = await prisma.community.findUnique({
      where,
      include: {
        mitra: true,
        members: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          take: 20,
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!community || community.deletedAt) {
      const error = new Error('Komunitas tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    let isJoined = false;
    if (userId) {
      const member = await prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId: community.id,
            userId,
          },
        },
      });
      isJoined = !!member;
    }

    return {
      id: community.id,
      mitraId: community.mitraId,
      name: community.name,
      slug: community.slug,
      address: community.address,
      district: community.district || community.mitra.district,
      village: community.village || community.mitra.village,
      phone: community.contact || community.mitra.phoneWa,
      phoneWa: community.contact || community.mitra.phoneWa,
      description: community.description,
      image: community.logo || community.mitra.logo,
      logo: community.logo || community.mitra.logo,
      banner: community.coverImage || community.mitra.banner,
      openHours: community.mitra.openHours || 'Sesuai Jadwal Kegiatan',
      totalMembers: community.members.length,
      isJoined,
      members: community.members,
      reviews: community.reviews,
    };
  }

  async createCommunity(mitraId, data, files = {}) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;

    const logo = files.logo ? `/uploads/${files.logo[0].filename}` : data.logo || null;
    const coverImage = files.coverImage ? `/uploads/${files.coverImage[0].filename}` : data.coverImage || null;

    return prisma.community.create({
      data: {
        mitraId,
        name: data.name,
        slug: uniqueSlug,
        description: data.description || null,
        address: data.address || null,
        district: data.district || null,
        village: data.village || null,
        contact: data.contact || null,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        logo,
        coverImage,
      },
    });
  }

  async updateCommunity(id, data, files = {}) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address) updateData.address = data.address;
    if (data.district) updateData.district = data.district;
    if (data.village) updateData.village = data.village;
    if (data.contact) updateData.contact = data.contact;
    if (data.latitude) updateData.latitude = parseFloat(data.latitude);
    if (data.longitude) updateData.longitude = parseFloat(data.longitude);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (files.logo) updateData.logo = `/uploads/${files.logo[0].filename}`;
    if (files.coverImage) updateData.coverImage = `/uploads/${files.coverImage[0].filename}`;

    return prisma.community.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  async deleteCommunity(id) {
    return prisma.community.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // Join community
  async joinCommunity(communityId, userId) {
    const commId = parseInt(communityId);
    const existing = await prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId: commId,
          userId,
        },
      },
    });

    if (existing) {
      // Toggle join / leave jika dipanggil toggle
      await prisma.communityMember.delete({
        where: { id: existing.id },
      });
      return { joined: false, message: 'Anda telah keluar dari komunitas ini.' };
    }

    await prisma.$transaction(async (tx) => {
      await tx.communityMember.create({
        data: {
          communityId: commId,
          userId,
          role: 'ANGGOTA',
          status: 'ACTIVE',
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
          activityType: 'JOIN_COMMUNITY',
          pointsEarned: 10,
          description: `Bergabung dengan komunitas`,
        },
      });
    });

    return { joined: true, message: 'Selamat! Anda berhasil bergabung dengan komunitas ini (+10 poin).' };
  }

  async leaveCommunity(communityId, userId) {
    const commId = parseInt(communityId);
    await prisma.communityMember.deleteMany({
      where: {
        communityId: commId,
        userId,
      },
    });
    return { joined: false, message: 'Anda telah keluar dari komunitas.' };
  }

  async getMembers(communityId) {
    return prisma.communityMember.findMany({
      where: { communityId: parseInt(communityId) },
      include: {
        user: { select: { id: true, name: true, avatar: true, district: true } },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }
}

module.exports = new CommunityService();
