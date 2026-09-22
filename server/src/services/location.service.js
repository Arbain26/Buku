const prisma = require('../config/db');
const adminService = require('./admin.service');
const { calculateDistance, formatDistance, SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

class LocationService {
  // Ambil semua ringkasan statistik ekosistem literasi
  async getEcosystemStats() {
    return adminService.getEcosystemCounts();
  }

  // Ambil semua lokasi kecamatan di Sidrap
  async getLocations() {
    return prisma.location.findMany({
      orderBy: { district: 'asc' },
    });
  }

  // Cari resource terdekat (toko, perpustakaan, komunitas, event) menggunakan Haversine
  async getNearbyResources({ latitude, longitude, radius = 25, type = 'all' }) {
    const userLat = latitude ? parseFloat(latitude) : SIDRAP_DEFAULT_LAT;
    const userLng = longitude ? parseFloat(longitude) : SIDRAP_DEFAULT_LNG;
    const maxRadius = parseFloat(radius);

    const results = {
      stores: [],
      libraries: [],
      communities: [],
      events: [],
    };

    // Ambil Stores
    if (type === 'all' || type === 'store') {
      const stores = await prisma.store.findMany({
        where: { isActive: true, deletedAt: null },
        include: { mitra: true },
      });

      results.stores = stores
        .map((s) => {
          const distanceKm = calculateDistance(userLat, userLng, s.latitude, s.longitude);
          return {
            id: s.id,
            name: s.name,
            address: s.address,
            district: s.district,
            whatsappNumber: s.whatsappNumber,
            image: s.image,
            distanceKm,
            formattedDistance: formatDistance(distanceKm),
          };
        })
        .filter((s) => s.distanceKm !== null && s.distanceKm <= maxRadius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    // Ambil Libraries
    if (type === 'all' || type === 'library') {
      const libraries = await prisma.library.findMany({
        where: { isActive: true, deletedAt: null },
        include: { mitra: true },
      });

      results.libraries = libraries
        .map((l) => {
          const distanceKm = calculateDistance(userLat, userLng, l.latitude, l.longitude);
          return {
            id: l.id,
            name: l.name,
            address: l.address,
            district: l.district,
            phone: l.phone,
            image: l.image,
            distanceKm,
            formattedDistance: formatDistance(distanceKm),
          };
        })
        .filter((l) => l.distanceKm !== null && l.distanceKm <= maxRadius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    // Ambil Communities
    if (type === 'all' || type === 'community') {
      const communities = await prisma.community.findMany({
        where: { isActive: true, deletedAt: null },
      });

      results.communities = communities
        .map((c) => {
          const distanceKm = calculateDistance(userLat, userLng, c.latitude, c.longitude);
          return {
            id: c.id,
            name: c.name,
            address: c.address,
            district: c.district,
            contact: c.contact,
            logo: c.logo,
            distanceKm,
            formattedDistance: formatDistance(distanceKm),
          };
        })
        .filter((c) => c.distanceKm !== null && c.distanceKm <= maxRadius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    // Ambil Events terdekat
    if (type === 'all' || type === 'event') {
      const events = await prisma.event.findMany({
        where: { status: 'PUBLISHED', eventDate: { gte: new Date() } },
      });

      results.events = events
        .map((ev) => {
          const distanceKm = calculateDistance(userLat, userLng, ev.latitude, ev.longitude);
          return {
            id: ev.id,
            title: ev.title,
            location: ev.location,
            district: ev.district,
            eventDate: ev.eventDate,
            image: ev.image,
            distanceKm,
            formattedDistance: formatDistance(distanceKm),
          };
        })
        .filter((ev) => ev.distanceKm !== null && ev.distanceKm <= maxRadius)
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return {
      coordinates: { latitude: userLat, longitude: userLng },
      radiusKm: maxRadius,
      results,
    };
  }
}

module.exports = new LocationService();
