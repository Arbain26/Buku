const prisma = require('../config/db');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { calculateDistance, formatDistance, SIDRAP_DEFAULT_LAT, SIDRAP_DEFAULT_LNG } = require('../utils/haversine');

// Get all bookstores with calculated distance
const getStores = async (req, res, next) => {
  try {
    const {
      search,
      district,
      userLat = SIDRAP_DEFAULT_LAT,
      userLng = SIDRAP_DEFAULT_LNG,
    } = req.query;

    const lat = parseFloat(userLat);
    const lng = parseFloat(userLng);

    const where = {
      mitraType: 'TOKO_BUKU',
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

    const stores = await prisma.mitraProfile.findMany({
      where,
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { organizationName: 'asc' },
    });

    const formattedStores = stores.map((store) => {
      const distanceKm = calculateDistance(lat, lng, store.latitude, store.longitude);
      return {
        id: store.id,
        name: store.organizationName,
        slug: store.slug,
        address: store.address,
        district: store.district,
        village: store.village,
        phoneWa: store.phoneWa,
        description: store.description,
        logo: store.logo,
        banner: store.banner,
        openHours: store.openHours,
        totalProducts: store._count.products,
        latitude: store.latitude,
        longitude: store.longitude,
        distanceKm,
        formattedDistance: formatDistance(distanceKm),
        isOpen: true, // Default open indicator
      };
    });

    // Sort by nearest
    formattedStores.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));

    return successResponse(res, 'Daftar toko buku berhasil dimuat.', formattedStores);
  } catch (error) {
    next(error);
  }
};

// Get single bookstore with products
const getStoreById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const storeId = isNaN(id) ? undefined : parseInt(id);
    const slug = isNaN(id) ? id : undefined;

    const where = storeId ? { id: storeId } : { slug };

    const store = await prisma.mitraProfile.findFirst({
      where: {
        ...where,
        mitraType: 'TOKO_BUKU',
        status: 'APPROVED',
      },
      include: {
        products: {
          where: { isAvailable: true },
          include: {
            book: {
              include: { category: true },
            },
          },
        },
        user: {
          select: { name: true, email: true },
        },
      },
    });

    if (!store) {
      return errorResponse(res, 'Toko buku tidak ditemukan.', 404);
    }

    const userLat = parseFloat(req.query.userLat || SIDRAP_DEFAULT_LAT);
    const userLng = parseFloat(req.query.userLng || SIDRAP_DEFAULT_LNG);
    const distanceKm = calculateDistance(userLat, userLng, store.latitude, store.longitude);

    const formattedProducts = store.products.map((p) => ({
      productId: p.id,
      bookId: p.book.id,
      title: p.book.title,
      author: p.book.author,
      coverImage: p.book.coverImage,
      category: p.book.category.name,
      rating: p.book.rating,
      price: Number(p.price),
      stock: p.stock,
      isAvailable: p.isAvailable && p.stock > 0,
      waLink: `https://wa.me/${store.phoneWa.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Halo ${store.organizationName}, saya tertarik memesan buku berikut melalui MABBACA:\n\n- Judul Buku: ${p.book.title}\n- Penulis: ${p.book.author}\n- Harga: Rp ${Number(p.price).toLocaleString('id-ID')}\n- Jumlah: 1 pcs\n\nNama Pemesan: \nAlamat Lengkap di Sidrap: \n\nMohon konfirmasi ketersediaan dan ongkos kirim. Terima kasih!`
      )}`,
    }));

    const responseData = {
      id: store.id,
      name: store.organizationName,
      slug: store.slug,
      address: store.address,
      district: store.district,
      village: store.village,
      phoneWa: store.phoneWa,
      description: store.description,
      logo: store.logo,
      banner: store.banner,
      openHours: store.openHours,
      latitude: store.latitude,
      longitude: store.longitude,
      distanceKm,
      formattedDistance: formatDistance(distanceKm),
      products: formattedProducts,
    };

    return successResponse(res, 'Detail toko buku berhasil dimuat.', responseData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStores,
  getStoreById,
};
