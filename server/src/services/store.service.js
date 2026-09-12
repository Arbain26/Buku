const prisma = require('../config/db');
const { calculateDistance, formatDistance, SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

class StoreService {
  async getStores({ page = 1, limit = 12, search, district, userLat = SIDRAP_DEFAULT_LAT, userLng = SIDRAP_DEFAULT_LNG }) {
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

    const [total, stores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        include: {
          mitra: true,
          _count: {
            select: { products: true, reviews: true },
          },
        },
        orderBy: { name: 'asc' },
        skip,
        take: l,
      }),
    ]);

    const formattedStores = stores.map((s) => {
      const distanceKm = calculateDistance(lat, lng, s.latitude, s.longitude);
      return {
        id: s.id,
        mitraId: s.mitraId,
        name: s.name,
        slug: s.slug,
        address: s.address,
        district: s.district || s.mitra.district,
        village: s.village || s.mitra.village,
        phone: s.phone,
        phoneWa: s.whatsappNumber,
        whatsappNumber: s.whatsappNumber,
        description: s.description,
        image: s.image || s.mitra.logo,
        logo: s.image || s.mitra.logo,
        banner: s.banner || s.mitra.banner,
        openHours: s.openHours || s.mitra.openHours,
        totalProducts: s._count.products,
        totalReviews: s._count.reviews,
        latitude: s.latitude,
        longitude: s.longitude,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
      };
    });

    // Urutkan berdasarkan jarak jika lokasi tersedia
    formattedStores.sort((a, b) => (a.distanceKm || 999) - (b.distanceKm || 999));

    return { stores: formattedStores, total, page: p, limit: l };
  }

  async getStoreById(idOrSlug, userLat = SIDRAP_DEFAULT_LAT, userLng = SIDRAP_DEFAULT_LNG) {
    const isId = !isNaN(parseInt(idOrSlug)) && String(parseInt(idOrSlug)) === String(idOrSlug);
    const where = isId ? { id: parseInt(idOrSlug) } : { slug: idOrSlug };

    const store = await prisma.store.findUnique({
      where,
      include: {
        mitra: true,
        products: {
          where: { isAvailable: true },
          include: {
            book: {
              include: { category: true },
            },
          },
        },
        reviews: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!store || store.deletedAt) {
      const error = new Error('Toko buku tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);
    const distanceKm = calculateDistance(lat, lng, store.latitude, store.longitude);

    const formattedProducts = store.products.map((p) => {
      const waNumber = store.whatsappNumber.replace(/[^0-9]/g, '');
      const waText = encodeURIComponent(
        `Halo ${store.name}, saya ingin membeli buku "${p.book.title}" (Rp ${Number(
          p.price
        ).toLocaleString('id-ID')}) yang saya lihat di MABBACA.`
      );

      return {
        productId: p.id,
        bookId: p.book.id,
        title: p.book.title,
        author: p.book.author,
        category: p.book.category ? p.book.category.name : null,
        coverImage: p.book.coverImage,
        description: p.book.description,
        isbn: p.book.isbn,
        price: Number(p.price),
        stock: p.stock,
        condition: p.condition,
        isAvailable: p.isAvailable,
        waLink: `https://wa.me/${waNumber}?text=${waText}`,
      };
    });

    return {
      id: store.id,
      mitraId: store.mitraId,
      name: store.name,
      slug: store.slug,
      address: store.address,
      district: store.district || store.mitra.district,
      village: store.village || store.mitra.village,
      phone: store.phone,
      phoneWa: store.whatsappNumber,
      whatsappNumber: store.whatsappNumber,
      description: store.description,
      image: store.image || store.mitra.logo,
      logo: store.image || store.mitra.logo,
      banner: store.banner || store.mitra.banner,
      openHours: store.openHours || store.mitra.openHours,
      latitude: store.latitude,
      longitude: store.longitude,
      distanceKm,
      formattedDistance: formatDistance(distanceKm),
      products: formattedProducts,
      reviews: store.reviews,
    };
  }

  async createStore(mitraId, data, files = {}) {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;

    const image = files.image ? `/uploads/${files.image[0].filename}` : data.image || null;
    const banner = files.banner ? `/uploads/${files.banner[0].filename}` : data.banner || null;

    return prisma.store.create({
      data: {
        mitraId,
        name: data.name,
        slug: uniqueSlug,
        description: data.description || null,
        address: data.address,
        district: data.district || null,
        village: data.village || null,
        phone: data.phone || null,
        whatsappNumber: data.whatsappNumber || data.phone,
        latitude: data.latitude ? parseFloat(data.latitude) : null,
        longitude: data.longitude ? parseFloat(data.longitude) : null,
        image,
        banner,
        openHours: data.openHours || null,
      },
    });
  }

  async updateStore(id, data, files = {}) {
    const updateData = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address) updateData.address = data.address;
    if (data.district) updateData.district = data.district;
    if (data.village) updateData.village = data.village;
    if (data.phone) updateData.phone = data.phone;
    if (data.whatsappNumber) updateData.whatsappNumber = data.whatsappNumber;
    if (data.openHours) updateData.openHours = data.openHours;
    if (data.latitude) updateData.latitude = parseFloat(data.latitude);
    if (data.longitude) updateData.longitude = parseFloat(data.longitude);
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    if (files.image) {
      updateData.image = `/uploads/${files.image[0].filename}`;
    }
    if (files.banner) {
      updateData.banner = `/uploads/${files.banner[0].filename}`;
    }

    return prisma.store.update({
      where: { id: parseInt(id) },
      data: updateData,
    });
  }

  async deleteStore(id) {
    return prisma.store.update({
      where: { id: parseInt(id) },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  // Store Products CRUD
  async getStoreProducts(storeId) {
    return prisma.storeProduct.findMany({
      where: { storeId: parseInt(storeId) },
      include: {
        book: {
          include: { category: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addStoreProduct(storeId, { bookId, price, stock = 1, condition = 'BARU' }) {
    return prisma.storeProduct.upsert({
      where: {
        storeId_bookId: {
          storeId: parseInt(storeId),
          bookId: parseInt(bookId),
        },
      },
      update: {
        price: parseFloat(price),
        stock: parseInt(stock),
        condition,
        isAvailable: parseInt(stock) > 0,
      },
      create: {
        storeId: parseInt(storeId),
        bookId: parseInt(bookId),
        price: parseFloat(price),
        stock: parseInt(stock),
        condition,
        isAvailable: parseInt(stock) > 0,
      },
      include: { book: true },
    });
  }

  async updateStoreProduct(productId, { price, stock, condition, isAvailable }) {
    const updateData = {};
    if (price !== undefined) updateData.price = parseFloat(price);
    if (stock !== undefined) {
      updateData.stock = parseInt(stock);
      updateData.isAvailable = parseInt(stock) > 0;
    }
    if (condition) updateData.condition = condition;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

    return prisma.storeProduct.update({
      where: { id: parseInt(productId) },
      data: updateData,
      include: { book: true },
    });
  }

  async deleteStoreProduct(productId) {
    return prisma.storeProduct.delete({
      where: { id: parseInt(productId) },
    });
  }
}

module.exports = new StoreService();
