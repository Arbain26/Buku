const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding data realistis untuk MABBACA...');

  // 1. Bersihkan database dalam urutan relasi terbalik
  console.log('🧹 Membersihkan database lama...');
  await prisma.userActivity.deleteMany();
  await prisma.userMission.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.point.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.borrowing.deleteMany();
  await prisma.userArticleFavorite.deleteMany();
  await prisma.userEventFavorite.deleteMany();
  await prisma.userCommunityFavorite.deleteMany();
  await prisma.userLibraryFavorite.deleteMany();
  await prisma.userStoreFavorite.deleteMany();
  await prisma.userBookFavorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.articleCategoryRelation.deleteMany();
  await prisma.article.deleteMany();
  await prisma.articleCategory.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.community.deleteMany();
  await prisma.libraryCollection.deleteMany();
  await prisma.library.deleteMany();
  await prisma.storeProduct.deleteMany();
  await prisma.store.deleteMany();
  await prisma.bookAuthor.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.category.deleteMany();
  await prisma.mitraProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();

  // Password hashes
  const adminPassword = await bcrypt.hash('admin123', 10);
  const mitraPassword = await bcrypt.hash('mitra123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  // 2. Data Lokasi 11 Kecamatan di Kabupaten Sidrap
  console.log('📍 Menambahkan data lokasi 11 kecamatan di Sidrap...');
  const locationsData = [
    { district: 'Pangkajene', village: 'Pangkajene', address: 'Jl. Jenderal Sudirman No. 12', latitude: -3.92740000, longitude: 119.79970000 },
    { district: 'Maritengngae', village: 'Sereang', address: 'Jl. Poros Sidrap-Parepare Km 4', latitude: -3.93120000, longitude: 119.82450000 },
    { district: 'Baranti', village: 'Baranti', address: 'Jl. Poros Baranti-Pinrang', latitude: -3.88500000, longitude: 119.77120000 },
    { district: 'Watang Pulu', village: 'Uluale', address: 'Jl. Trans Sulawesi Watang Pulu', latitude: -3.98450000, longitude: 119.75230000 },
    { district: 'Dua Pitue', village: 'Dongi', address: 'Jl. Tanrutedong Raya', latitude: -3.82140000, longitude: 119.98210000 },
    { district: 'Panca Rijang', village: 'Rappang', address: 'Jl. Ahmad Yani, Rappang', latitude: -3.83410000, longitude: 119.83210000 },
    { district: 'Kulo', village: 'Kulo', address: 'Jl. Kemakmuran No. 5', latitude: -3.80120000, longitude: 119.81050000 },
    { district: 'Tellu Limpoe', village: 'Amparita', address: 'Jl. Poros Amparita', latitude: -4.02150000, longitude: 119.86540000 },
    { district: 'Pitu Riase', village: 'Buntao', address: 'Jl. Poros Pitu Riase', latitude: -3.75410000, longitude: 120.05210000 },
    { district: 'Pitu Riawa', village: 'Bulu Cenrana', address: 'Jl. Pertanian Cenrana', latitude: -3.78450000, longitude: 119.94520000 },
    { district: 'Watang Sidenreng', village: 'Damai', address: 'Jl. Sidenreng Indah No. 8', latitude: -3.96540000, longitude: 119.88210000 },
  ];

  for (const loc of locationsData) {
    await prisma.location.create({ data: loc });
  }

  // 3. User ADMIN
  console.log('👑 Menambahkan user ADMIN...');
  const adminUser = await prisma.user.create({
    data: {
      name: 'Administrator MABBACA',
      email: 'admin@mabbaca.id',
      password: adminPassword,
      phone: '08124233001',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      bio: 'Pengelola Ekosistem Literasi Kabupaten Sidenreng Rappang.',
      district: 'Pangkajene',
      latitude: -3.9274,
      longitude: 119.7997,
      points: 1500,
      level: 'Duta Literasi',
    },
  });

  // 4. Kategori Buku (10 Kategori)
  console.log('📚 Menambahkan 10 kategori buku...');
  const categoriesList = [
    { name: 'Literasi Digital', slug: 'literasi-digital', icon: 'Laptop', description: 'Buku seputar teknologi, internet sehat, dan transformasi digital.' },
    { name: 'Pendidikan', slug: 'pendidikan', icon: 'GraduationCap', description: 'Buku rujukan akademik, metode pembelajaran, dan pedagogi.' },
    { name: 'Teknologi', slug: 'teknologi', icon: 'Cpu', description: 'Pemrograman, rekayasa perangkat lunak, dan kecerdasan buatan.' },
    { name: 'Agama', slug: 'agama', icon: 'BookOpen', description: 'Kajian keislaman, akhlak, spiritualitas, dan sejarah nabi.' },
    { name: 'Novel & Fiksi', slug: 'novel', icon: 'Feather', description: 'Karya sastra prosa naratif, fiksi ilmiah, dan roman nusantara.' },
    { name: 'Sejarah & Budaya', slug: 'sejarah', icon: 'Landmark', description: 'Catatan sejarah lokal Sulawesi, nusantara, dan warisan budaya Bugis.' },
    { name: 'Ekonomi & Bisnis', slug: 'ekonomi', icon: 'TrendingUp', description: 'Kewirausahaan, UMKM, pertanian modern, dan literasi finansial.' },
    { name: 'Anak & Cerita Bergambar', slug: 'anak', icon: 'Sparkles', description: 'Buku dongeng, fabel, dan cerita bergambar sarat pesan moral.' },
    { name: 'Sosial & Humaniora', slug: 'sosial', icon: 'Users', description: 'Sosiologi, kemasyarakatan, dan pergerakan literasi pedesaan.' },
    { name: 'Pengembangan Diri', slug: 'pengembangan-diri', icon: 'Compass', description: 'Motivasi, produktivitas, ketahanan mental, dan kebiasaan baik.' },
  ];

  const createdCategories = {};
  for (const cat of categoriesList) {
    createdCategories[cat.slug] = await prisma.category.create({ data: cat });
  }

  // 5. Penulis (Authors)
  console.log('✍️ Menambahkan data penulis (Authors)...');
  const authorsData = [
    { name: 'Pramoedya Ananta Toer', slug: 'pramoedya-ananta-toer', bio: 'Sastrawan terkemuka Indonesia pelopor Tetralogi Buru.' },
    { name: 'Andrea Hirata', slug: 'andrea-hirata', bio: 'Novelis inspiratif penulis Laskar Pelangi dari Belitung.' },
    { name: 'Tere Liye', slug: 'tere-liye', bio: 'Penulis prolifik puluhan novel best seller lintas genre.' },
    { name: 'Dewi Lestari', slug: 'dewi-lestari', bio: 'Penulis seri Supernova dan novel mendalam Aroma Karsa.' },
    { name: 'Henry Manampiring', slug: 'henry-manampiring', bio: 'Penulis Filosofi Teras dan praktisi stoikisme modern Indonesia.' },
    { name: 'Prof. Dr. M. Quraish Shihab', slug: 'quraish-shihab', bio: 'Cendekiawan muslim ahli tafsir Al-Mishbah kelahiran Sulawesi Selatan.' },
    { name: 'Najwa Shihab', slug: 'najwa-shihab', bio: 'Jurnalis kritis dan Duta Baca Indonesia penggerak minat baca.' },
    { name: 'Ahmad Fuadi', slug: 'ahmad-fuadi', bio: 'Penulis trilogi Negeri 5 Menara tentang mimpi dan keteguhan.' },
    { name: 'Leila S. Chudori', slug: 'leila-s-chudori', bio: 'Wartawan dan penulis novel sejarah Laut Bercerita.' },
    { name: 'Dr. H. Rusdi Masse Mappasessu', slug: 'rusdi-masse', bio: 'Tokoh pembangunan dan pegiat kemasyarakatan Sidrap.' },
  ];

  const createdAuthors = {};
  for (const auth of authorsData) {
    createdAuthors[auth.slug] = await prisma.author.create({ data: auth });
  }

  // 6. Buku (Books - 15 Judul)
  console.log('📖 Menambahkan 15 judul buku...');
  const booksData = [
    {
      title: 'Filosofi Teras',
      slug: 'filosofi-teras',
      author: 'Henry Manampiring',
      authorSlug: 'henry-manampiring',
      categorySlug: 'pengembangan-diri',
      isbn: '978-602-412-518-9',
      publisher: 'Penerbit Buku Kompas',
      publishYear: 2018,
      pages: 346,
      language: 'Bahasa Indonesia',
      description: 'Filosofi Yunani-Romawi Kuno Stoikisme untuk mental yang tangguh dalam menghadapi kehidupan modern yang penuh ketidakpastian.',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewCount: 24,
    },
    {
      title: 'Bumi Manusia',
      slug: 'bumi-manusia',
      author: 'Pramoedya Ananta Toer',
      authorSlug: 'pramoedya-ananta-toer',
      categorySlug: 'novel',
      isbn: '978-979-97312-3-4',
      publisher: 'Lentera Dipantara',
      publishYear: 1980,
      pages: 535,
      language: 'Bahasa Indonesia',
      description: 'Kisah Minke di masa kolonial Hindia Belanda tentang pergulatan martabat manusia dan cinta pada Annelies Mellema.',
      coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 38,
    },
    {
      title: 'Laskar Pelangi',
      slug: 'laskar-pelangi',
      author: 'Andrea Hirata',
      authorSlug: 'andrea-hirata',
      categorySlug: 'novel',
      isbn: '978-979-3062-79-2',
      publisher: 'Bentang Pustaka',
      publishYear: 2005,
      pages: 529,
      language: 'Bahasa Indonesia',
      description: 'Kisah sepuluh anak laskar pelangi di Belitung yang berjuang menggapai cita-cita dengan penuh kehangatan dan semangat pantang menyerah.',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
      rating: 4.7,
      reviewCount: 19,
    },
    {
      title: 'Laut Bercerita',
      slug: 'laut-bercerita',
      author: 'Leila S. Chudori',
      authorSlug: 'leila-s-chudori',
      categorySlug: 'novel',
      isbn: '978-602-424-694-5',
      publisher: 'Kepustakaan Populer Gramedia',
      publishYear: 2017,
      pages: 379,
      language: 'Bahasa Indonesia',
      description: 'Sebuah novel tentang persahabatan, kekeluargaan, cinta, dan kehilangan orang-orang yang dihilangkan secara paksa.',
      coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 42,
    },
    {
      title: 'Negeri 5 Menara',
      slug: 'negeri-5-menara',
      author: 'Ahmad Fuadi',
      authorSlug: 'ahmad-fuadi',
      categorySlug: 'pendidikan',
      isbn: '978-979-22-4861-6',
      publisher: 'Gramedia Pustaka Utama',
      publishYear: 2009,
      pages: 423,
      language: 'Bahasa Indonesia',
      description: 'Man Jadda Wajada: Siapa yang bersungguh-sungguh akan berhasil. Perjalanan santri pondok menaklukkan dunia.',
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80',
      rating: 4.6,
      reviewCount: 15,
    },
    {
      title: 'Tafsir Al-Mishbah Jilid 1',
      slug: 'tafsir-al-mishbah-jilid-1',
      author: 'Prof. Dr. M. Quraish Shihab',
      authorSlug: 'quraish-shihab',
      categorySlug: 'agama',
      isbn: '978-979-9153-06-7',
      publisher: 'Lentera Hati',
      publishYear: 2002,
      pages: 680,
      language: 'Bahasa Indonesia',
      description: 'Pesan, kesan dan keserasian Al-Qur’an dalam penjelasan yang kontekstual dan mudah dipahami oleh masyarakat nusantara.',
      coverImage: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=400&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 22,
    },
    {
      title: 'Literasi Digital di Era Disrupsi',
      slug: 'literasi-digital-era-disrupsi',
      author: 'Najwa Shihab',
      authorSlug: 'najwa-shihab',
      categorySlug: 'literasi-digital',
      isbn: '978-602-06-3321-4',
      publisher: 'Mizan Media Utama',
      publishYear: 2021,
      pages: 215,
      language: 'Bahasa Indonesia',
      description: 'Panduan navigasi informasi di media sosial, memilah fakta dari hoaks, dan mengoptimalkan literasi untuk kemajuan daerah.',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewCount: 30,
    },
    {
      title: 'Atomic Habits: Perubahan Kecil yang Memberikan Hasil Luar Biasa',
      slug: 'atomic-habits-indonesia',
      author: 'James Clear',
      authorSlug: 'henry-manampiring',
      categorySlug: 'pengembangan-diri',
      isbn: '978-602-06-3317-7',
      publisher: 'Gramedia Pustaka Utama',
      publishYear: 2019,
      pages: 352,
      language: 'Bahasa Indonesia',
      description: 'Cara mudah dan terbukti untuk membentuk kebiasaan baik dan menghilangkan kebiasaan buruk dengan sistem 1% lebih baik setiap hari.',
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 55,
    },
    {
      title: 'Sejarah dan Kebudayaan Sidenreng Rappang',
      slug: 'sejarah-sidenreng-rappang',
      author: 'Dr. H. Rusdi Masse Mappasessu',
      authorSlug: 'rusdi-masse',
      categorySlug: 'sejarah',
      isbn: '978-602-74912-1-2',
      publisher: 'Pustaka Sidrap Mandiri',
      publishYear: 2016,
      pages: 284,
      language: 'Bahasa Indonesia',
      description: 'Dokumentasi komprehensif mengenai jejak sejarah Kerajaan Sidenreng dan Rappang, kearifan lokal Toana, dan budaya agraris Sidrap.',
      coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewCount: 16,
    },
    {
      title: 'Panduan Modern Pertanian Padi & Jagung Sidrap',
      slug: 'panduan-pertanian-sidrap',
      author: 'Ahmad Fuadi',
      authorSlug: 'ahmad-fuadi',
      categorySlug: 'ekonomi',
      isbn: '978-602-1144-89-0',
      publisher: 'Agro Media Pustaka',
      publishYear: 2020,
      pages: 198,
      language: 'Bahasa Indonesia',
      description: 'Inovasi bertani pintar berbasis teknologi ramah lingkungan dan manajemen pasca panen di lumbung beras Sulawesi Selatan.',
      coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
      rating: 4.6,
      reviewCount: 11,
    },
    {
      title: 'Hujan',
      slug: 'hujan',
      author: 'Tere Liye',
      authorSlug: 'tere-liye',
      categorySlug: 'novel',
      isbn: '978-602-03-2478-4',
      publisher: 'Gramedia Pustaka Utama',
      publishYear: 2016,
      pages: 320,
      language: 'Bahasa Indonesia',
      description: 'Kisah tentang persahabatan, cinta, perpisahan, melupakan, dan hujan di masa depan pasca bencana alam dahsyat.',
      coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
      rating: 4.8,
      reviewCount: 47,
    },
    {
      title: 'Aroma Karsa',
      slug: 'aroma-karsa',
      author: 'Dewi Lestari',
      authorSlug: 'dewi-lestari',
      categorySlug: 'novel',
      isbn: '978-602-424-693-8',
      publisher: 'Bentang Pustaka',
      publishYear: 2018,
      pages: 710,
      language: 'Bahasa Indonesia',
      description: 'Pencarian tanaman mitologi Puspa Karsa yang aromanya dapat mengendalikan kehendak, berlatar dari TPA Bantar Gebang hingga Gunung Lawu.',
      coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&auto=format&fit=crop&q=80',
      rating: 4.7,
      reviewCount: 29,
    },
    {
      title: 'Kancil dan Buaya Cerdik',
      slug: 'kancil-dan-buaya-cerdik',
      author: 'Andrea Hirata',
      authorSlug: 'andrea-hirata',
      categorySlug: 'anak',
      isbn: '978-602-291-102-1',
      publisher: 'Mizan Cilik',
      publishYear: 2019,
      pages: 48,
      language: 'Bahasa Indonesia',
      description: 'Cerita rakyat fabel bergambar yang mengajarkan kejujuran, kepedulian sesama kawan, dan pemecahan masalah secara bijak.',
      coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&auto=format&fit=crop&q=80',
      rating: 4.5,
      reviewCount: 14,
    },
    {
      title: 'Dasar Pemrograman Web Modern dengan JavaScript',
      slug: 'dasar-pemrograman-javascript',
      author: 'Henry Manampiring',
      authorSlug: 'henry-manampiring',
      categorySlug: 'teknologi',
      isbn: '978-623-00-1234-5',
      publisher: 'Informatika Bandung',
      publishYear: 2023,
      pages: 412,
      language: 'Bahasa Indonesia',
      description: 'Panduan komprehensif Node.js, Express, React, dan integrasi REST API modern untuk developer pemula hingga menengah.',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
      rating: 4.9,
      reviewCount: 33,
    },
    {
      title: 'Gerakan Literasi Desa Membangun Negeri',
      slug: 'gerakan-literasi-desa',
      author: 'Najwa Shihab',
      authorSlug: 'najwa-shihab',
      categorySlug: 'sosial',
      isbn: '978-602-05-9988-1',
      publisher: 'Yayasan Pustaka Obor',
      publishYear: 2022,
      pages: 256,
      language: 'Bahasa Indonesia',
      description: 'Strategi menghidupkan ruang baca komunitas desa, lapak baca jalanan, dan kolaborasi masyarakat lokal untuk pemberdayaan wawasan.',
      coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&auto=format&fit=crop&q=80',
      rating: 4.7,
      reviewCount: 21,
    },
  ];

  const createdBooks = [];
  for (const b of booksData) {
    const book = await prisma.book.create({
      data: {
        title: b.title,
        slug: b.slug,
        author: b.author,
        publisher: b.publisher,
        isbn: b.isbn,
        publishYear: b.publishYear,
        pages: b.pages,
        language: b.language,
        description: b.description,
        coverImage: b.coverImage,
        rating: b.rating,
        reviewCount: b.reviewCount,
        categoryId: createdCategories[b.categorySlug].id,
      },
    });

    // Relasikan Many-to-Many BookAuthor
    if (createdAuthors[b.authorSlug]) {
      await prisma.bookAuthor.create({
        data: {
          bookId: book.id,
          authorId: createdAuthors[b.authorSlug].id,
        },
      });
    }

    createdBooks.push(book);
  }

  // 7. MITRA: Users, Profiles, and Specific Models (Store, Library, Community)
  console.log('🏢 Menambahkan 7 Mitra (Toko Buku, Perpustakaan, Komunitas, Sekolah, Pengajar)...');

  // 7a. Mitra Toko Buku 1: Toko Buku Al-Falah (Pangkajene)
  const userToko1 = await prisma.user.create({
    data: {
      name: 'H. Muhammad Yusuf',
      email: 'toko@mabbaca.id',
      password: mitraPassword,
      phone: '081245678901',
      role: 'MITRA',
      district: 'Pangkajene',
      latitude: -3.9274,
      longitude: 119.7997,
    },
  });

  const profileToko1 = await prisma.mitraProfile.create({
    data: {
      userId: userToko1.id,
      mitraType: 'TOKO_BUKU',
      organizationName: 'Toko Buku Al-Falah Pangkajene',
      slug: 'toko-buku-al-falah',
      description: 'Toko buku dan alat tulis terlengkap di pusat kota Pangkajene Sidrap. Menyediakan buku agama, pelajaran sekolah, sastra, dan motivasi.',
      address: 'Jl. Jenderal Sudirman No. 45, Pangkajene',
      district: 'Pangkajene',
      village: 'Pangkajene',
      latitude: -3.9274,
      longitude: 119.7997,
      phoneWa: '6281245678901',
      logo: 'https://images.unsplash.com/photo-1526243741027-444d633d7080?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1507842229451-7f01e677c423?w=1200&auto=format&fit=crop&q=80',
      openHours: '08:00 - 21:00 WITA',
      status: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  const store1 = await prisma.store.create({
    data: {
      mitraId: profileToko1.id,
      name: profileToko1.organizationName,
      slug: profileToko1.slug,
      description: profileToko1.description,
      address: profileToko1.address,
      district: profileToko1.district,
      village: profileToko1.village,
      phone: profileToko1.phoneWa,
      whatsappNumber: profileToko1.phoneWa,
      latitude: profileToko1.latitude,
      longitude: profileToko1.longitude,
      image: profileToko1.logo,
      banner: profileToko1.banner,
      openHours: profileToko1.openHours,
    },
  });

  // Tambahkan produk ke Toko 1
  const store1Products = [
    { bookId: createdBooks[0].id, price: 95000, stock: 15, condition: 'BARU' },
    { bookId: createdBooks[1].id, price: 120000, stock: 8, condition: 'BARU' },
    { bookId: createdBooks[2].id, price: 85000, stock: 12, condition: 'BARU' },
    { bookId: createdBooks[3].id, price: 110000, stock: 6, condition: 'BARU' },
    { bookId: createdBooks[5].id, price: 180000, stock: 5, condition: 'BARU' },
    { bookId: createdBooks[6].id, price: 75000, stock: 20, condition: 'BARU' },
    { bookId: createdBooks[7].id, price: 105000, stock: 18, condition: 'BARU' },
    { bookId: createdBooks[8].id, price: 65000, stock: 10, condition: 'BARU' },
    { bookId: createdBooks[13].id, price: 135000, stock: 7, condition: 'BARU' },
  ];
  for (const sp of store1Products) {
    await prisma.storeProduct.create({
      data: {
        storeId: store1.id,
        bookId: sp.bookId,
        price: sp.price,
        stock: sp.stock,
        condition: sp.condition,
        isAvailable: sp.stock > 0,
      },
    });
  }

  // 7b. Mitra Toko Buku 2: Rumah Buku Maritengngae
  const userToko2 = await prisma.user.create({
    data: {
      name: 'Faisal Akbar, S.Kom',
      email: 'toko2@mabbaca.id',
      password: mitraPassword,
      phone: '081356789012',
      role: 'MITRA',
      district: 'Maritengngae',
      latitude: -3.9312,
      longitude: 119.8245,
    },
  });

  const profileToko2 = await prisma.mitraProfile.create({
    data: {
      userId: userToko2.id,
      mitraType: 'TOKO_BUKU',
      organizationName: 'Rumah Buku Maritengngae',
      slug: 'rumah-buku-maritengngae',
      description: 'Toko buku komunitas mandiri penyedia buku-buku sastra, novel grafis, komik edukatif, dan referensi pertanian modern.',
      address: 'Jl. Poros Sidrap No. 88, Maritengngae',
      district: 'Maritengngae',
      village: 'Sereang',
      latitude: -3.9312,
      longitude: 119.8245,
      phoneWa: '6281356789012',
      logo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80',
      openHours: '09:00 - 22:00 WITA',
      status: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  const store2 = await prisma.store.create({
    data: {
      mitraId: profileToko2.id,
      name: profileToko2.organizationName,
      slug: profileToko2.slug,
      description: profileToko2.description,
      address: profileToko2.address,
      district: profileToko2.district,
      village: profileToko2.village,
      phone: profileToko2.phoneWa,
      whatsappNumber: profileToko2.phoneWa,
      latitude: profileToko2.latitude,
      longitude: profileToko2.longitude,
      image: profileToko2.logo,
      banner: profileToko2.banner,
      openHours: profileToko2.openHours,
    },
  });

  // Produk Toko 2
  const store2Products = [
    { bookId: createdBooks[4].id, price: 88000, stock: 10, condition: 'BARU' },
    { bookId: createdBooks[7].id, price: 100000, stock: 14, condition: 'BARU' },
    { bookId: createdBooks[9].id, price: 55000, stock: 12, condition: 'BARU' },
    { bookId: createdBooks[10].id, price: 89000, stock: 9, condition: 'BARU' },
    { bookId: createdBooks[11].id, price: 130000, stock: 4, condition: 'BARU' },
    { bookId: createdBooks[12].id, price: 35000, stock: 25, condition: 'BARU' },
  ];
  for (const sp of store2Products) {
    await prisma.storeProduct.create({
      data: {
        storeId: store2.id,
        bookId: sp.bookId,
        price: sp.price,
        stock: sp.stock,
        condition: sp.condition,
        isAvailable: sp.stock > 0,
      },
    });
  }

  // 7c. Mitra Perpustakaan 1: Perpustakaan Daerah Kabupaten Sidrap (Pangkajene)
  const userPerpus1 = await prisma.user.create({
    data: {
      name: 'Dinas Perpustakaan & Kearsipan Sidrap',
      email: 'perpus@mabbaca.id',
      password: mitraPassword,
      phone: '08114234567',
      role: 'MITRA',
      district: 'Pangkajene',
      latitude: -3.9265,
      longitude: 119.8005,
    },
  });

  const profilePerpus1 = await prisma.mitraProfile.create({
    data: {
      userId: userPerpus1.id,
      mitraType: 'PERPUSTAKAAN',
      organizationName: 'Perpustakaan Daerah Kabupaten Sidenreng Rappang',
      slug: 'perpusda-sidrap',
      description: 'Layanan perpustakaan umum daerah Kabupaten Sidrap. Menyediakan puluhan ribu koleksi buku fisik, ruang baca ber-AC, dan pojok baca ramah anak.',
      address: 'Jl. Lanto Daeng Pasewang No. 10, Pangkajene',
      district: 'Pangkajene',
      village: 'Pangkajene',
      latitude: -3.9265,
      longitude: 119.8005,
      phoneWa: '628114234567',
      logo: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80',
      openHours: 'Senin - Jumat: 08:00 - 16:00 WITA',
      status: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  const library1 = await prisma.library.create({
    data: {
      mitraId: profilePerpus1.id,
      name: profilePerpus1.organizationName,
      slug: profilePerpus1.slug,
      description: profilePerpus1.description,
      address: profilePerpus1.address,
      district: profilePerpus1.district,
      village: profilePerpus1.village,
      phone: profilePerpus1.phoneWa,
      latitude: profilePerpus1.latitude,
      longitude: profilePerpus1.longitude,
      image: profilePerpus1.logo,
      banner: profilePerpus1.banner,
      openingHours: profilePerpus1.openHours,
    },
  });

  // Koleksi Buku Perpustakaan 1
  const lib1Collections = [
    { bookId: createdBooks[0].id, callNumber: '150.1 MAN f', quantity: 5, availableQuantity: 4, shelfLocation: 'Rak Fiksi & Motivasi A1' },
    { bookId: createdBooks[1].id, callNumber: '899.221 TOE b', quantity: 4, availableQuantity: 3, shelfLocation: 'Rak Sastra Nusantara B2' },
    { bookId: createdBooks[3].id, callNumber: '899.221 CHU l', quantity: 3, availableQuantity: 2, shelfLocation: 'Rak Sastra Kontemporer B3' },
    { bookId: createdBooks[5].id, callNumber: '297.122 SHI t', quantity: 6, availableQuantity: 5, shelfLocation: 'Rak Agama & Tafsir C1' },
    { bookId: createdBooks[6].id, callNumber: '302.23 SHI l', quantity: 4, availableQuantity: 4, shelfLocation: 'Rak Literasi Digital D1' },
    { bookId: createdBooks[8].id, callNumber: '959.8 MAP s', quantity: 8, availableQuantity: 7, shelfLocation: 'Rak Khusus Sejarah Sidrap S1' },
    { bookId: createdBooks[9].id, callNumber: '633.1 FUA p', quantity: 5, availableQuantity: 5, shelfLocation: 'Rak Pertanian Terapan P1' },
    { bookId: createdBooks[13].id, callNumber: '005.13 MAN d', quantity: 3, availableQuantity: 2, shelfLocation: 'Rak Teknologi & Komputer T1' },
  ];

  for (const c of lib1Collections) {
    await prisma.libraryCollection.create({
      data: {
        libraryId: library1.id,
        bookId: c.bookId,
        callNumber: c.callNumber,
        quantity: c.quantity,
        availableQuantity: c.availableQuantity,
        shelfLocation: c.shelfLocation,
        isAvailable: c.availableQuantity > 0,
      },
    });
  }

  // 7d. Mitra Perpustakaan 2: Pojok Baca Baranti
  const userPerpus2 = await prisma.user.create({
    data: {
      name: 'Pengelola Pojok Baca Baranti',
      email: 'perpus2@mabbaca.id',
      password: mitraPassword,
      phone: '085299887766',
      role: 'MITRA',
      district: 'Baranti',
      latitude: -3.8850,
      longitude: 119.7712,
    },
  });

  const profilePerpus2 = await prisma.mitraProfile.create({
    data: {
      userId: userPerpus2.id,
      mitraType: 'PERPUSTAKAAN',
      organizationName: 'Pojok Baca Baranti Mandiri',
      slug: 'pojok-baca-baranti',
      description: 'Perpustakaan desa swadaya yang berfokus pada bahan bacaan anak-anak, pelajar, serta buku bercocok tanam praktis.',
      address: 'Jl. Andi Cammi No. 15, Baranti',
      district: 'Baranti',
      village: 'Baranti',
      latitude: -3.8850,
      longitude: 119.7712,
      phoneWa: '6285299887766',
      logo: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&auto=format&fit=crop&q=80',
      openHours: 'Setiap Hari: 14:00 - 18:00 WITA',
      status: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  const library2 = await prisma.library.create({
    data: {
      mitraId: profilePerpus2.id,
      name: profilePerpus2.organizationName,
      slug: profilePerpus2.slug,
      description: profilePerpus2.description,
      address: profilePerpus2.address,
      district: profilePerpus2.district,
      village: profilePerpus2.village,
      phone: profilePerpus2.phoneWa,
      latitude: profilePerpus2.latitude,
      longitude: profilePerpus2.longitude,
      image: profilePerpus2.logo,
      banner: profilePerpus2.banner,
      openingHours: profilePerpus2.openHours,
    },
  });

  // Koleksi Perpustakaan 2
  const lib2Collections = [
    { bookId: createdBooks[2].id, callNumber: '899.221 HIR l', quantity: 3, availableQuantity: 3, shelfLocation: 'Rak Remaja' },
    { bookId: createdBooks[4].id, callNumber: '899.221 FUA n', quantity: 2, availableQuantity: 2, shelfLocation: 'Rak Remaja' },
    { bookId: createdBooks[9].id, callNumber: '633.1 FUA p', quantity: 4, availableQuantity: 3, shelfLocation: 'Rak Desa & Tani' },
    { bookId: createdBooks[12].id, callNumber: '398.2 HIR k', quantity: 6, availableQuantity: 5, shelfLocation: 'Pojok Baca Anak' },
    { bookId: createdBooks[14].id, callNumber: '028 SHI g', quantity: 2, availableQuantity: 2, shelfLocation: 'Rak Komunitas' },
  ];
  for (const c of lib2Collections) {
    await prisma.libraryCollection.create({
      data: {
        libraryId: library2.id,
        bookId: c.bookId,
        callNumber: c.callNumber,
        quantity: c.quantity,
        availableQuantity: c.availableQuantity,
        shelfLocation: c.shelfLocation,
        isAvailable: c.availableQuantity > 0,
      },
    });
  }

  // 7e. Mitra Komunitas 1: Komunitas Pegiat Literasi Sidrap (Pangkajene)
  const userKomunitas1 = await prisma.user.create({
    data: {
      name: 'Rahmat Hidayat, S.Hum',
      email: 'komunitas@mabbaca.id',
      password: mitraPassword,
      phone: '085341234567',
      role: 'MITRA',
      district: 'Pangkajene',
      latitude: -3.9280,
      longitude: 119.8010,
    },
  });

  const profileKomunitas1 = await prisma.mitraProfile.create({
    data: {
      userId: userKomunitas1.id,
      mitraType: 'KOMUNITAS',
      organizationName: 'Komunitas Pegiat Literasi Sidrap (KPLS)',
      slug: 'kpls-sidrap',
      description: 'Gerakan sukarelawan muda Sidrap yang aktif menggelar lapak baca gratis setiap akhir pekan di taman kota, bedah buku, dan kelas menulis kreatif.',
      address: 'Taman Usman Isa, Jl. Jenderal Sudirman, Pangkajene',
      district: 'Pangkajene',
      village: 'Pangkajene',
      latitude: -3.9280,
      longitude: 119.8010,
      phoneWa: '6285341234567',
      logo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&auto=format&fit=crop&q=80',
      openHours: 'Sabtu & Minggu: 07:00 - 11:00 WITA',
      status: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  const community1 = await prisma.community.create({
    data: {
      mitraId: profileKomunitas1.id,
      name: profileKomunitas1.organizationName,
      slug: profileKomunitas1.slug,
      description: profileKomunitas1.description,
      logo: profileKomunitas1.logo,
      coverImage: profileKomunitas1.banner,
      address: profileKomunitas1.address,
      district: profileKomunitas1.district,
      village: profileKomunitas1.village,
      latitude: profileKomunitas1.latitude,
      longitude: profileKomunitas1.longitude,
      contact: profileKomunitas1.phoneWa,
    },
  });

  // 7f. Mitra Komunitas 2: Relawan Membaca Watang Pulu
  const userKomunitas2 = await prisma.user.create({
    data: {
      name: 'Muh. Yusuf Mansyur',
      email: 'komunitas2@mabbaca.id',
      password: mitraPassword,
      phone: '081399881122',
      role: 'MITRA',
      district: 'Watang Pulu',
      latitude: -3.9845,
      longitude: 119.7523,
    },
  });

  const profileKomunitas2 = await prisma.mitraProfile.create({
    data: {
      userId: userKomunitas2.id,
      mitraType: 'KOMUNITAS',
      organizationName: 'Relawan Membaca Watang Pulu',
      slug: 'relawan-membaca-watang-pulu',
      description: 'Inisiatif pemuda desa Watang Pulu membawa buku dongeng dan pengetahuan keliling ke dusun-dusun terpencil.',
      address: 'Balla Baca Uluale, Kec. Watang Pulu',
      district: 'Watang Pulu',
      village: 'Uluale',
      latitude: -3.9845,
      longitude: 119.7523,
      phoneWa: '6281399881122',
      logo: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200&auto=format&fit=crop&q=80',
      openHours: 'Minggu Pagi: 08:00 - 12:00 WITA',
      status: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  const community2 = await prisma.community.create({
    data: {
      mitraId: profileKomunitas2.id,
      name: profileKomunitas2.organizationName,
      slug: profileKomunitas2.slug,
      description: profileKomunitas2.description,
      logo: profileKomunitas2.logo,
      coverImage: profileKomunitas2.banner,
      address: profileKomunitas2.address,
      district: profileKomunitas2.district,
      village: profileKomunitas2.village,
      latitude: profileKomunitas2.latitude,
      longitude: profileKomunitas2.longitude,
      contact: profileKomunitas2.phoneWa,
    },
  });

  // 7g. Mitra Sekolah: SMA Negeri 1 Sidrap
  const userSekolah = await prisma.user.create({
    data: {
      name: 'Kepala Perpustakaan SMAN 1 Sidrap',
      email: 'sekolah@mabbaca.id',
      password: mitraPassword,
      phone: '081244556677',
      role: 'MITRA',
      district: 'Pangkajene',
      latitude: -3.9290,
      longitude: 119.8020,
    },
  });

  await prisma.mitraProfile.create({
    data: {
      userId: userSekolah.id,
      mitraType: 'SEKOLAH',
      organizationName: 'SMA Negeri 1 Sidrap',
      slug: 'sman-1-sidrap',
      description: 'Penyelenggara Gerakan Literasi Sekolah (GLS) 15 Menit Membaca sebelum pembelajaran.',
      address: 'Jl. Pendidikan No. 1, Pangkajene',
      district: 'Pangkajene',
      latitude: -3.9290,
      longitude: 119.8020,
      phoneWa: '6281244556677',
      logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&auto=format&fit=crop&q=80',
      openHours: '07:30 - 15:30 WITA',
      status: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  // 7h. Mitra Pengajar: Guru Literasi Sidrap
  const userPengajar = await prisma.user.create({
    data: {
      name: 'Ibu Fatmawati, S.Pd., M.Pd.',
      email: 'pengajar@mabbaca.id',
      password: mitraPassword,
      phone: '085233445566',
      role: 'MITRA',
      district: 'Maritengngae',
      latitude: -3.9315,
      longitude: 119.8250,
    },
  });

  await prisma.mitraProfile.create({
    data: {
      userId: userPengajar.id,
      mitraType: 'PENGAJAR',
      organizationName: 'Fatmawati Literasi Edukasi',
      slug: 'fatmawati-edukasi',
      description: 'Praktisi pendidikan bahasa dan pegiat penulisan artikel ilmiah populer bagi pelajar Sidrap.',
      address: 'Jl. Sereang Indah No. 22, Maritengngae',
      district: 'Maritengngae',
      latitude: -3.9315,
      longitude: 119.8250,
      phoneWa: '6285233445566',
      logo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      verifiedAt: new Date(),
    },
  });

  // 7i. Mitra PENDING (untuk pengujian fitur verifikasi Admin)
  const userPending = await prisma.user.create({
    data: {
      name: 'H. Ruslan Abdullah',
      email: 'mitrapending@mabbaca.id',
      password: mitraPassword,
      phone: '081299887711',
      role: 'MITRA',
      district: 'Baranti',
      latitude: -3.8860,
      longitude: 119.7720,
    },
  });

  await prisma.mitraProfile.create({
    data: {
      userId: userPending.id,
      mitraType: 'TOKO_BUKU',
      organizationName: 'Toko Buku Cahaya Ilmu Baranti',
      slug: 'toko-buku-cahaya-ilmu',
      description: 'Pengajuan kemitraan toko buku baru di pasar Baranti untuk penyediaan buku tulis dan literatur islami.',
      address: 'Kompleks Pasar Sentral Baranti Kios No. 12',
      district: 'Baranti',
      village: 'Baranti',
      latitude: -3.8860,
      longitude: 119.7720,
      phoneWa: '6281299887711',
      status: 'PENDING',
    },
  });

  // 8. 10 User Regular (Masyarakat Sidrap)
  console.log('👥 Menambahkan 10 user masyarakat Sidrap...');
  const regularUsersData = [
    { name: 'Andi Muhammad Nur', email: 'user@mabbaca.id', phone: '08124233002', district: 'Pangkajene', points: 420, level: 'Pembaca Setia' },
    { name: 'Siti Rahmawati', email: 'siti@mabbaca.id', phone: '08124233003', district: 'Maritengngae', points: 280, level: 'Pembaca Aktif' },
    { name: 'Budi Santoso', email: 'budi@mabbaca.id', phone: '08124233004', district: 'Baranti', points: 150, level: 'Pembaca Pemula' },
    { name: 'Nurul Hidayah', email: 'nurul@mabbaca.id', phone: '08124233005', district: 'Watang Pulu', points: 310, level: 'Pembaca Aktif' },
    { name: 'Reza Pratama', email: 'reza@mabbaca.id', phone: '08124233006', district: 'Dua Pitue', points: 90, level: 'Pembaca Pemula' },
    { name: 'Dewi Sartika', email: 'dewi@mabbaca.id', phone: '08124233007', district: 'Panca Rijang', points: 540, level: 'Kutu Buku' },
    { name: 'Fajar Ramadan', email: 'fajar@mabbaca.id', phone: '08124233008', district: 'Kulo', points: 120, level: 'Pembaca Pemula' },
    { name: 'Hasan Basri', email: 'hasan@mabbaca.id', phone: '08124233009', district: 'Tellu Limpoe', points: 210, level: 'Pembaca Aktif' },
    { name: 'Ainun Habibah', email: 'ainun@mabbaca.id', phone: '08124233010', district: 'Pitu Riase', points: 65, level: 'Pembaca Pemula' },
    { name: 'Irfan Hakim', email: 'irfan@mabbaca.id', phone: '08124233011', district: 'Watang Sidenreng', points: 380, level: 'Pembaca Setia' },
  ];

  const createdUsers = [];
  for (const u of regularUsersData) {
    const usr = await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: userPassword,
        phone: u.phone,
        role: 'USER',
        district: u.district,
        points: u.points,
        level: u.level,
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80`,
      },
    });

    // Inisialisasi record Point
    await prisma.point.create({
      data: {
        userId: usr.id,
        totalPoints: u.points,
        level: u.level,
      },
    });

    createdUsers.push(usr);
  }

  // Masukkan beberapa anggota ke komunitas
  await prisma.communityMember.create({
    data: { communityId: community1.id, userId: createdUsers[0].id, role: 'PENGURUS' },
  });
  await prisma.communityMember.create({
    data: { communityId: community1.id, userId: createdUsers[1].id, role: 'ANGGOTA' },
  });
  await prisma.communityMember.create({
    data: { communityId: community1.id, userId: createdUsers[5].id, role: 'ANGGOTA' },
  });
  await prisma.communityMember.create({
    data: { communityId: community2.id, userId: createdUsers[3].id, role: 'ANGGOTA' },
  });

  // 9. Events Literasi (10 Events)
  console.log('🗓️ Menambahkan 10 Event Literasi...');
  const eventsData = [
    {
      organizerMitraId: profileKomunitas1.id,
      title: 'Lapak Baca Minggu Pagi Taman Usman Isa',
      slug: 'lapak-baca-minggu-pagi-usman-isa',
      description: 'Lapak baca buku gratis di ruang publik terbuka, diskusi santai bedah buku motivasi, serta pojok mewarnai bagi anak-anak di Pangkajene.',
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
      category: 'LAPAK_BACA',
      audience: 'UMUM',
      location: 'Taman Usman Isa, Pangkajene, Sidrap',
      district: 'Pangkajene',
      latitude: -3.9280,
      longitude: 119.8010,
      eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startTime: '07:30',
      endTime: '11:00',
      capacity: 50,
      currentParticipants: 12,
      isFree: true,
      status: 'PUBLISHED',
    },
    {
      organizerMitraId: profilePerpus1.id,
      title: 'Bedah Buku: Sejarah & Kebudayaan Sidenreng Rappang',
      slug: 'bedah-buku-sejarah-sidrap-2026',
      description: 'Kajian mendalam bersama sejarawan lokal dan penulis seputar asal-usul, pusaka, serta kearifan falsafah Toana di Sidrap tempo dulu.',
      image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80',
      category: 'BEDAH_BUKU',
      audience: 'DEWASA',
      location: 'Aula Lt. 2 Perpustakaan Daerah Sidrap',
      district: 'Pangkajene',
      latitude: -3.9265,
      longitude: 119.8005,
      eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '12:30',
      capacity: 80,
      currentParticipants: 35,
      isFree: true,
      status: 'PUBLISHED',
    },
    {
      organizerMitraId: profileToko1.id,
      title: 'Workshop Menulis Esai & Resensi Buku untuk Remaja',
      slug: 'workshop-menulis-esai-remaja',
      description: 'Pelatihan menulis ulasan buku dan opini kritis untuk siswa SMA/sederajat dan mahasiswa se-Kabupaten Sidrap berhadiah paket buku.',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
      category: 'KELAS_MENULIS',
      audience: 'REMAJA',
      location: 'Ruang Kolaborasi Toko Buku Al-Falah',
      district: 'Pangkajene',
      latitude: -3.9274,
      longitude: 119.7997,
      eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startTime: '13:30',
      endTime: '16:30',
      capacity: 30,
      currentParticipants: 18,
      isFree: true,
      status: 'PUBLISHED',
    },
    {
      organizerMitraId: profileKomunitas2.id,
      title: 'Piknik Membaca & Mendongeng Ceria Anak Dusun',
      slug: 'piknik-membaca-anak-watang-pulu',
      description: 'Kegiatan seru membaca cerita rakyat bersama anak-anak di pedesaan Watang Pulu, diselingi permainan interaktif dan pembagian buku gratis.',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&auto=format&fit=crop&q=80',
      category: 'LAPAK_BACA',
      audience: 'ANAK',
      location: 'Balai Warga Uluale, Watang Pulu',
      district: 'Watang Pulu',
      latitude: -3.9845,
      longitude: 119.7523,
      eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      startTime: '08:30',
      endTime: '11:30',
      capacity: 40,
      currentParticipants: 22,
      isFree: true,
      status: 'PUBLISHED',
    },
    {
      organizerMitraId: profilePerpus2.id,
      title: 'Pelatihan Literasi Keuangan & Digital UMKM Baranti',
      slug: 'pelatihan-literasi-keuangan-baranti',
      description: 'Edukasi pencatatan pembukuan digital dan pemanfaatan marketplace bagi pelaku usaha pangan dan pertanian di Baranti.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=80',
      category: 'PELATIHAN',
      audience: 'DEWASA',
      location: 'Aula Kantor Camat Baranti',
      district: 'Baranti',
      latitude: -3.8850,
      longitude: 119.7712,
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '13:00',
      capacity: 50,
      currentParticipants: 15,
      isFree: true,
      status: 'PUBLISHED',
    },
    {
      organizerMitraId: profileToko2.id,
      title: 'Diskusi Sastra: Mengupas Roman Bumi Manusia',
      slug: 'diskusi-sastra-bumi-manusia-maritengngae',
      description: 'Diskusi santai sore hari membedah pemikiran Pramoedya Ananta Toer dan relevansinya bagi generasi muda masa kini.',
      image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=800&auto=format&fit=crop&q=80',
      category: 'DISKUSI',
      audience: 'UMUM',
      location: 'Kafe Literasi Rumah Buku Maritengngae',
      district: 'Maritengngae',
      latitude: -3.9312,
      longitude: 119.8245,
      eventDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
      startTime: '16:00',
      endTime: '18:30',
      capacity: 25,
      currentParticipants: 10,
      isFree: true,
      status: 'PUBLISHED',
    },
    {
      organizerMitraId: profilePerpus1.id,
      title: 'Festival Literasi Sidrap 2026: Lumbung Padi, Lumbung Ilmu',
      slug: 'festival-literasi-sidrap-2026',
      description: 'Pameran buku terbesar di Sidrap, parade dongeng anak, perlombaan bertutur bahasa Bugis, dan penganugerahan Duta Baca Kabupaten.',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
      category: 'FESTIVAL_LITERASI',
      audience: 'UMUM',
      location: 'Gedung Kesenian Kabupaten Sidenreng Rappang',
      district: 'Pangkajene',
      latitude: -3.9270,
      longitude: 119.8000,
      eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      startTime: '08:00',
      endTime: '17:00',
      capacity: 300,
      currentParticipants: 84,
      isFree: true,
      status: 'PUBLISHED',
    },
    {
      organizerMitraId: profileKomunitas1.id,
      title: 'Kelas Penulisan Berita Warga (Citizen Journalism)',
      slug: 'kelas-penulisan-berita-warga',
      description: 'Belajar teknik reportase dasar, wawancara etis, dan penulisan feature seputar keunikan desa di media digital.',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
      category: 'KELAS_MENULIS',
      audience: 'REMAJA',
      location: 'Pusat Kegiatan Pemuda Pangkajene',
      district: 'Pangkajene',
      latitude: -3.9274,
      longitude: 119.7997,
      eventDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      startTime: '10:00',
      endTime: '13:00',
      capacity: 35,
      currentParticipants: 14,
      isFree: true,
      status: 'PUBLISHED',
    },
    {
      organizerMitraId: profileToko1.id,
      title: 'Pameran Buku Pertanian & Inovasi Pangan Desa',
      slug: 'pameran-buku-pertanian-sidrap',
      description: 'Bazar buku agribisnis dan teknologi pertanian modern dengan diskon spesial hingga 30% didukung Dinas Pertanian Sidrap.',
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
      category: 'PAMERAN',
      audience: 'UMUM',
      location: 'Plaza Sentral Toko Al-Falah',
      district: 'Pangkajene',
      latitude: -3.9274,
      longitude: 119.7997,
      eventDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      startTime: '09:00',
      endTime: '20:00',
      capacity: 150,
      currentParticipants: 45,
      isFree: true,
      status: 'PUBLISHED',
    },
    {
      organizerMitraId: profilePerpus2.id,
      title: 'Lomba Menulis Puisi Kearifan Budaya Bugis Sidrap',
      slug: 'lomba-puisi-kearifan-bugis-sidrap',
      description: 'Lomba cipta puisi bertema kearifan lokal Bugis bagi pelajar SMP dan SMA sederajat se-Kecamatan Baranti dan sekitarnya.',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
      category: 'KELAS_MENULIS',
      audience: 'REMAJA',
      location: 'Pojok Baca Baranti',
      district: 'Baranti',
      latitude: -3.8850,
      longitude: 119.7712,
      eventDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      startTime: '08:30',
      endTime: '12:00',
      capacity: 40,
      currentParticipants: 20,
      isFree: true,
      status: 'PUBLISHED',
    },
  ];

  const createdEvents = [];
  for (const ev of eventsData) {
    const event = await prisma.event.create({ data: ev });
    createdEvents.push(event);

    // Daftarkan user regular sebagai peserta
    await prisma.eventParticipant.create({
      data: {
        eventId: event.id,
        userId: createdUsers[0].id,
        status: 'REGISTERED',
      },
    });
  }

  // 10. Kategori Artikel & Artikel "Baca 5 Menit" (10 Artikel)
  console.log('📰 Menambahkan 10 Artikel Edukatif (Baca 5 Menit)...');
  const articleCats = [
    { name: 'Tips Membaca', slug: 'tips-membaca' },
    { name: 'Kearifan Lokal', slug: 'kearifan-lokal' },
    { name: 'Teknologi & Literasi', slug: 'teknologi-literasi' },
    { name: 'Edukasi Anak', slug: 'edukasi-anak' },
    { name: 'Ketahanan Pangan', slug: 'ketahanan-pangan' },
  ];

  const createdArtCats = {};
  for (const ac of articleCats) {
    createdArtCats[ac.slug] = await prisma.articleCategory.create({ data: ac });
  }

  const articlesData = [
    {
      authorId: adminUser.id,
      title: '5 Cara Menghidupkan Minat Baca di Tengah Gempuran Media Sosial',
      slug: '5-cara-menghidupkan-minat-baca-medsos',
      categorySlug: 'tips-membaca',
      excerpt: 'Membaca buku di era notifikasi tanpa henti memang penuh godaan. Simak cara sederhana melatih fokus kembali.',
      content: 'Di tengah arus informasi instan dari TikTok dan Instagram, kemampuan membaca mendalam (deep reading) kian tergerus. Para pakar menyarankan teknik membaca 15 menit setiap pagi sebelum membuka layar gawai, meletakkan buku fisik di samping tempat tidur, dan menetapkan target realistis seperti satu bab per hari.',
      thumbnail: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800&auto=format&fit=crop&q=80',
      readingTime: 4,
      isFeatured: true,
    },
    {
      authorId: adminUser.id,
      title: 'Mengenal Falsafah Toana: Kearifan Bertutur Masyarakat Bugis Sidrap',
      slug: 'mengenal-falsafah-toana-bugis-sidrap',
      categorySlug: 'kearifan-lokal',
      excerpt: 'Falsafah leluhur Bugis mengajarkan etika bertutur kata yang menyejukkan hati dan menjunjung tinggi kehormatan (siri’).',
      content: 'Masyarakat Sidenreng Rappang memiliki khazanah kearifan lokal bernama Toana, yaitu tata krama berbicara dengan santun, penuh empati, dan tidak menyinggung perasaan lawan bicara. Nilai ini sangat relevan diaplikasikan dalam interaksi digital masa kini demi mencegah ujaran kebencian di ruang maya.',
      thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800&auto=format&fit=crop&q=80',
      readingTime: 5,
      isFeatured: true,
    },
    {
      authorId: userPengajar.id,
      title: 'Mengapa Anak Usia Dini Butuh Dongeng Sebelum Tidur?',
      slug: 'mengapa-anak-butuh-dongeng-sebelum-tidur',
      categorySlug: 'edukasi-anak',
      excerpt: 'Membacakan buku bergambar sebelum tidur menstimulasi perkembangan kosa kata dan ikatan batin emosional orang tua.',
      content: 'Riset neurosains menunjukkan bahwa mendengarkan cerita secara rutin mengaktifkan area otak anak yang memproses imajinasi visual dan pemahaman bahasa. Dongeng juga menjadi wahana terbaik menanamkan nilai empati, keberanian, dan kejujuran sejak dini tanpa terkesan menggurui.',
      thumbnail: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&auto=format&fit=crop&q=80',
      readingTime: 3,
      isFeatured: false,
    },
    {
      authorId: adminUser.id,
      title: 'Sidrap Sebagai Lumbung Padi: Bagaimana Literasi Agribisnis Meningkatkan Hasil Panen',
      slug: 'sidrap-lumbung-padi-literasi-agribisnis',
      categorySlug: 'ketahanan-pangan',
      excerpt: 'Petani modern Sidrap kini menggabungkan kearifan lokal kalender tanam dengan data sains digital.',
      content: 'Kabupaten Sidrap tersohor sebagai penopang pangan utama Sulawesi Selatan. Namun, tantangan perubahan iklim menuntut petani untuk terus memperbarui ilmu melalui literasi pertanian modern, seperti efisiensi pupuk organik, sistem pengairan hemat air, dan pembukuan hasil panen berbasis aplikasi digital.',
      thumbnail: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
      readingTime: 5,
      isFeatured: true,
    },
    {
      authorId: adminUser.id,
      title: 'Mengenal Format Digital E-Book vs Buku Fisik: Mana yang Lebih Efektif?',
      slug: 'ebook-vs-buku-fisik-efektivitas',
      categorySlug: 'teknologi-literasi',
      excerpt: 'Sebuah perbandingan mendalam antara kenyamanan layar e-reader dan sensasi aroma lembaran kertas.',
      content: 'Baik buku fisik maupun e-book memiliki keunggulannya masing-masing. Buku fisik memberikan pengalaman sensori taktil yang meningkatkan retensi memori jangka panjang, sementara e-book menawarkan kemudahan membawa ribuan pustaka dalam satu genggaman saat bepergian.',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      readingTime: 4,
      isFeatured: false,
    },
    {
      authorId: userPengajar.id,
      title: 'Catatan dari Lapak Baca: Kebahagiaan Menemani Anak Desa Mengeja Kata',
      slug: 'catatan-dari-lapak-baca-anak-desa',
      categorySlug: 'edukasi-anak',
      excerpt: 'Kisah nyata para relawan yang membawa kardus berisi buku ke pelosok perkampungan di Sidrap.',
      content: 'Mata anak-anak itu berbinar saat kardus buku dibuka di bawah pohon rindang. Di tengah keterbatasan fasilitas perpustakaan desa, inisiatif jemput bola oleh relawan literasi membuktikan bahwa minat baca masyarakat sesungguhnya sangat tinggi asalkan akses buku berkualitas tersedia dekat dengan mereka.',
      thumbnail: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop&q=80',
      readingTime: 5,
      isFeatured: false,
    },
    {
      authorId: adminUser.id,
      title: 'Strategi Memilih Bacaan Pertama Bagi Kamu yang Ingin Memulai Hobi Membaca',
      slug: 'strategi-memilih-bacaan-pertama',
      categorySlug: 'tips-membaca',
      excerpt: 'Jangan langsung mulai dari buku tebal 500 halaman! Awali dengan topik yang benar-benar kamu senangi.',
      content: 'Banyak pemula yang menyerah karena salah memilih buku pertama. Kuncinya adalah memilih buku berhalaman tipis dengan gaya bahasa ringan, seperti kumpulan cerpen, novel grafis, atau buku pengembangan diri bertema ringan yang langsung relevan dengan kehidupan sehari-hari.',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      readingTime: 3,
      isFeatured: false,
    },
    {
      authorId: adminUser.id,
      title: 'Sejarah Danau Sidenreng: Warisan Ekologis dan Pusat Peradaban Masa Lampau',
      slug: 'sejarah-danau-sidenreng-ekologis',
      categorySlug: 'kearifan-lokal',
      excerpt: 'Danau Sidenreng bukan sekadar genangan air, melainkan jantung peradaban agraris dan mitologi Bugis.',
      content: 'Danau Sidenreng memiliki peran sentral dalam jalur perdagangan perahu dan mitologi masyarakat Bugis. Mengetahui sejarah danau ini menumbuhkan kesadaran kolektif untuk menjaga kelestarian ekosistem dan mencegah pendangkalan akibat sedimentasi.',
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
      readingTime: 6,
      isFeatured: false,
    },
    {
      authorId: userPengajar.id,
      title: 'Teknik Pomodoro untuk Menyelesaikan Satu Buku dalam Sepekan',
      slug: 'teknik-pomodoro-selesaikan-buku',
      categorySlug: 'tips-membaca',
      excerpt: 'Gunakan interval 25 menit membaca diselingi 5 menit istirahat untuk menghindari kelelahan mata dan otak.',
      content: 'Teknik Pomodoro sangat efektif melatih rentang perhatian. Dengan mendedikasikan dua sesi Pomodoro per hari (total 50 menit membaca terfokus tanpa distraksi HP), Anda dapat menyelesaikan rata-rata 30-40 halaman per hari atau setara satu buku berukuran sedang dalam satu minggu.',
      thumbnail: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
      readingTime: 4,
      isFeatured: false,
    },
    {
      authorId: adminUser.id,
      title: 'Literasi Kritis: Menangkal Hoaks Pilkada dan Isu Kemasyarakatan di Sidrap',
      slug: 'literasi-kritis-menangkal-hoaks-sidrap',
      categorySlug: 'teknologi-literasi',
      excerpt: 'Langkah taktis memverifikasi kebenaran pesan berantai di grup WhatsApp keluarga sebelum ikut menyebarkan.',
      content: 'Rumor dan informasi palsu mudah menyebar melalui grup perpesanan instan. Terapkan prinsip Saring Sebelum Sharing: periksa sumber resmi, perhatikan tanggal rilis berita, dan jangan mudah terpancing oleh judul-judul yang provokatif dan bombastis.',
      thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
      readingTime: 5,
      isFeatured: false,
    },
  ];

  for (const art of articlesData) {
    const article = await prisma.article.create({
      data: {
        authorId: art.authorId,
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: art.content,
        thumbnail: art.thumbnail,
        readingTime: art.readingTime,
        isFeatured: art.isFeatured,
        status: 'PUBLISHED',
        publishedAt: new Date(),
        views: Math.floor(Math.random() * 200) + 20,
      },
    });

    await prisma.articleCategoryRelation.create({
      data: {
        articleId: article.id,
        categoryId: createdArtCats[art.categorySlug].id,
      },
    });
  }

  // 11. Reviews (Ulasan) Relasional
  console.log('⭐ Menambahkan ulasan (Reviews) relasional...');
  const reviewsData = [
    {
      userId: createdUsers[0].id,
      bookId: createdBooks[0].id,
      rating: 5,
      comment: 'Buku Filosofi Teras luar biasa membuka perspektif baru dalam mengelola stres kerja dan ekspektasi sehari-hari. Wajib dibaca anak muda!',
    },
    {
      userId: createdUsers[1].id,
      bookId: createdBooks[1].id,
      rating: 5,
      comment: 'Mahakarya sastra Indonesia yang tak lekang oleh waktu. Penggambaran sejarah masa kolonialnya begitu hidup dan menyentuh nurani.',
    },
    {
      userId: createdUsers[2].id,
      storeId: store1.id,
      rating: 5,
      comment: 'Pelayanan Toko Buku Al-Falah sangat ramah dan responsif via WhatsApp. Buku dikirim dalam kondisi tersegel rapi di hari yang sama!',
    },
    {
      userId: createdUsers[3].id,
      libraryId: library1.id,
      rating: 5,
      comment: 'Perpustakaan Daerah Sidrap sekarang nyaman sekali, tempat duduk banyak dan koleksi buku sejarah daerahnya sangat lengkap.',
    },
    {
      userId: createdUsers[4].id,
      communityId: community1.id,
      rating: 5,
      comment: 'Senang sekali bisa bergabung dengan teman-teman pegiat literasi di Sidrap. Suasana diskusi selalu hangat dan memicu wawasan baru.',
    },
  ];

  for (const rev of reviewsData) {
    await prisma.review.create({ data: rev });
  }

  // 12. Peminjaman Buku (Borrowings) & Transaksi Stok
  console.log('📚 Menambahkan data peminjaman buku (Borrowings)...');
  await prisma.borrowing.create({
    data: {
      userId: createdUsers[0].id,
      libraryId: library1.id,
      bookId: createdBooks[0].id,
      quantity: 1,
      status: 'BORROWED',
      borrowedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      notes: 'Peminjaman untuk bahan referensi skripsi.',
    },
  });

  await prisma.borrowing.create({
    data: {
      userId: createdUsers[1].id,
      libraryId: library1.id,
      bookId: createdBooks[1].id,
      quantity: 1,
      status: 'APPROVED',
      approvedAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notes: 'Siap diambil di meja sirkulasi Perpustakaan Daerah.',
    },
  });

  await prisma.borrowing.create({
    data: {
      userId: createdUsers[2].id,
      libraryId: library2.id,
      bookId: createdBooks[9].id,
      quantity: 1,
      status: 'RETURNED',
      borrowedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      returnedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      notes: 'Buku dikembalikan dalam kondisi baik dan lengkap.',
    },
  });

  // 13. Pemesanan Buku (Orders) & WhatsApp Flow
  console.log('🛒 Menambahkan data pesanan (Orders) & WhatsApp order flow...');
  const order1 = await prisma.order.create({
    data: {
      userId: createdUsers[0].id,
      storeId: store1.id,
      orderNumber: 'ORD-20260911-0001',
      totalAmount: 180000,
      status: 'CONTACTED',
      customerName: 'Andi Muhammad Nur',
      customerPhone: '08124233002',
      customerAddress: 'Jl. Pemuda No. 14, Pangkajene, Sidrap',
      notes: 'Mohon buku disampul plastik bening jika memungkinkan.',
      waMessageSent: true,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      bookId: createdBooks[0].id,
      quantity: 1,
      price: 95000,
      subtotal: 95000,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      bookId: createdBooks[2].id,
      quantity: 1,
      price: 85000,
      subtotal: 85000,
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: createdUsers[1].id,
      storeId: store2.id,
      orderNumber: 'ORD-20260911-0002',
      totalAmount: 143000,
      status: 'CONFIRMED',
      customerName: 'Siti Rahmawati',
      customerPhone: '08124233003',
      customerAddress: 'Jl. Poros Maritengngae No. 5, Sidrap',
      notes: 'Pembayaran tunai saat pengantaran (COD).',
      waMessageSent: true,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      bookId: createdBooks[4].id,
      quantity: 1,
      price: 88000,
      subtotal: 88000,
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order2.id,
      bookId: createdBooks[9].id,
      quantity: 1,
      price: 55000,
      subtotal: 55000,
    },
  });

  // 14. Favorites
  console.log('❤️ Menambahkan favorit pengguna...');
  await prisma.userBookFavorite.create({
    data: { userId: createdUsers[0].id, bookId: createdBooks[0].id },
  });
  await prisma.userBookFavorite.create({
    data: { userId: createdUsers[0].id, bookId: createdBooks[1].id },
  });
  await prisma.userStoreFavorite.create({
    data: { userId: createdUsers[0].id, storeId: store1.id },
  });
  await prisma.userLibraryFavorite.create({
    data: { userId: createdUsers[0].id, libraryId: library1.id },
  });

  // 15. Gamifikasi: Misi, Aktivitas & Poin
  console.log('🎮 Menambahkan sistem gamifikasi (Misi & Aktivitas)...');
  const missionsList = [
    { title: 'Baca Artikel Harian', description: 'Baca 1 artikel literasi edukatif hari ini.', points: 10, target: 1, type: 'DAILY' },
    { title: 'Jelajah Toko Buku', description: 'Kunjungi dan lihat katalog salah satu toko buku lokal Sidrap.', points: 15, target: 1, type: 'DAILY' },
    { title: 'Review Pertama', description: 'Tulis ulasan bermanfaat pada buku atau perpustakaan favoritmu.', points: 25, target: 1, type: 'ONCE' },
    { title: 'Peminjam Aktif', description: 'Lakukan peminjaman 1 buku fisik di perpustakaan mitra.', points: 30, target: 1, type: 'ONCE' },
    { title: 'Partisipasi Event', description: 'Daftar dan ikuti 1 kegiatan literasi di Kabupaten Sidrap.', points: 40, target: 1, type: 'ONCE' },
  ];

  for (const m of missionsList) {
    const mission = await prisma.mission.create({ data: m });

    // Masukkan relasi misi untuk Andi Muhammad Nur
    await prisma.userMission.create({
      data: {
        userId: createdUsers[0].id,
        missionId: mission.id,
        progress: 1,
        isCompleted: true,
        completedAt: new Date(),
      },
    });
  }

  // Catat aktivitas Andi Muhammad Nur
  await prisma.userActivity.create({
    data: {
      userId: createdUsers[0].id,
      activityType: 'READ_ARTICLE',
      pointsEarned: 10,
      description: 'Membaca artikel: 5 Cara Menghidupkan Minat Baca di Tengah Gempuran Media Sosial',
    },
  });

  await prisma.userActivity.create({
    data: {
      userId: createdUsers[0].id,
      activityType: 'WRITE_REVIEW',
      pointsEarned: 25,
      description: 'Menulis ulasan bintang 5 untuk buku Filosofi Teras',
    },
  });

  await prisma.userActivity.create({
    data: {
      userId: createdUsers[0].id,
      activityType: 'JOIN_EVENT',
      pointsEarned: 40,
      description: 'Mendaftar event Lapak Baca Minggu Pagi Taman Usman Isa',
    },
  });

  // 16. Notifikasi
  console.log('🔔 Menambahkan notifikasi sistem...');
  await prisma.notification.create({
    data: {
      userId: createdUsers[0].id,
      type: 'SUCCESS',
      title: 'Selamat Datang di MABBACA!',
      message: 'Akun Anda berhasil aktif. Jelajahi buku, toko, dan perpustakaan terdekat di Sidrap sekarang.',
      isRead: true,
      readAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: createdUsers[0].id,
      type: 'INFO',
      title: 'Peminjaman Buku Disetujui',
      message: 'Permohonan peminjaman buku "Bumi Manusia" di Perpustakaan Daerah Sidrap telah disetujui.',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: userToko1.id,
      type: 'SUCCESS',
      title: 'Kemitraan Disetujui!',
      message: 'Selamat! Akun kemitraan Toko Buku Al-Falah telah diverifikasi dan disetujui oleh Admin MABBACA.',
      isRead: true,
      readAt: new Date(),
    },
  });

  console.log('✨ SEEDING BERHASIL DISELESAIKAN DENGAN SUKSES! ✨');
  console.log('---------------------------------------------------------');
  console.log('Akun Demo Tersedia:');
  console.log('1. ADMIN       : admin@mabbaca.id / admin123');
  console.log('2. MITRA TOKO  : toko@mabbaca.id / mitra123');
  console.log('3. MITRA PERPUS: perpus@mabbaca.id / mitra123');
  console.log('4. MITRA KOMUN : komunitas@mabbaca.id / mitra123');
  console.log('5. USER BIASA  : user@mabbaca.id / user123');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
