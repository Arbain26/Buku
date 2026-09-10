// Seed script for MABBACA - Platform Ekosistem Literasi Masyarakat Sidrap
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MABBACA database...');

  // 1. Clean existing records in correct relation order
  await prisma.userMission.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.userActivity.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.borrowing.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.article.deleteMany();
  await prisma.articleCategory.deleteMany();
  await prisma.eventParticipant.deleteMany();
  await prisma.event.deleteMany();
  await prisma.communityMember.deleteMany();
  await prisma.libraryCollection.deleteMany();
  await prisma.storeProduct.deleteMany();
  await prisma.book.deleteMany();
  await prisma.bookCategory.deleteMany();
  await prisma.mitraProfile.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data.');

  // Common password
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const mitraPasswordHash = await bcrypt.hash('Mitra123!', 10);
  const userPasswordHash = await bcrypt.hash('User123!', 10);

  // 2. Seed Users
  // Sidrap Coordinates center: -3.9274, 119.7997 (Pangkajene)
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Utama MABBACA',
      email: 'admin@mabbaca.local',
      password: passwordHash,
      phone: '081142000001',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Pengelola Platform Ekosistem Literasi Kabupaten Sidrap.',
      district: 'Pangkajene',
      latitude: -3.9274,
      longitude: 119.7997,
      points: 950,
      level: 'Inspirator Literasi'
    }
  });

  const mitraStoreUser = await prisma.user.create({
    data: {
      name: 'H. Ruslan (Toko Buku Sidrap)',
      email: 'mitra@mabbaca.local',
      password: mitraPasswordHash,
      phone: '081234567890',
      role: 'MITRA',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Pemilik Toko Buku Sidrap Mandiri. Menyediakan buku bacaan dan pelajaran terlengkap di Sidrap.',
      district: 'Pangkajene',
      latitude: -3.9248,
      longitude: 119.8012,
      points: 520,
      level: 'Penggerak Literasi'
    }
  });

  const mitraLibUser = await prisma.user.create({
    data: {
      name: 'Dinas Perpustakaan Sidrap',
      email: 'perpus@mabbaca.local',
      password: mitraPasswordHash,
      phone: '082198765432',
      role: 'MITRA',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      bio: 'Perpustakaan Umum Daerah Kabupaten Sidenreng Rappang.',
      district: 'Pangkajene',
      latitude: -3.9295,
      longitude: 119.7981,
      points: 780,
      level: 'Inspirator Literasi'
    }
  });

  const mitraKomunitasUser = await prisma.user.create({
    data: {
      name: 'Fauzan Literasi',
      email: 'komunitas@mabbaca.local',
      password: mitraPasswordHash,
      phone: '085255123456',
      role: 'MITRA',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Ketua Komunitas Gerakan Sidrap Membaca.',
      district: 'Maritengngae',
      latitude: -3.9310,
      longitude: 119.8055,
      points: 610,
      level: 'Penggerak Literasi'
    }
  });

  const mitraDesaUser = await prisma.user.create({
    data: {
      name: 'Pengelola Perpus Desa Teteaji',
      email: 'teteaji@mabbaca.local',
      password: mitraPasswordHash,
      phone: '081344556677',
      role: 'MITRA',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      bio: 'Perpustakaan Komunitas Desa Teteaji, Tellu Limpoe, Sidrap.',
      district: 'Tellu Limpoe',
      latitude: -3.9680,
      longitude: 119.7420,
      points: 430,
      level: 'Sahabat Buku'
    }
  });

  const mitraBarantiUser = await prisma.user.create({
    data: {
      name: 'Pemuda Baranti Membaca',
      email: 'baranti@mabbaca.local',
      password: mitraPasswordHash,
      phone: '085311223344',
      role: 'MITRA',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      bio: 'Inisiatif ruang baca terbuka pemuda Baranti, Sidrap.',
      district: 'Baranti',
      latitude: -3.8920,
      longitude: 119.7530,
      points: 390,
      level: 'Sahabat Buku'
    }
  });

  // Mitra Pending untuk testing verifikasi oleh admin
  const mitraPendingUser = await prisma.user.create({
    data: {
      name: 'Toko Buku Baranti Berkah',
      email: 'toko.baranti@mabbaca.local',
      password: mitraPasswordHash,
      phone: '081999888777',
      role: 'MITRA',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
      bio: 'Penyedia buku dan alat tulis di Baranti, Sidrap.',
      district: 'Baranti',
      latitude: -3.8950,
      longitude: 119.7510,
      points: 100,
      level: 'Pembaca Pemula'
    }
  });

  // Regular Users
  const regularUser1 = await prisma.user.create({
    data: {
      name: 'Andi Pratama',
      email: 'user@mabbaca.local',
      password: userPasswordHash,
      phone: '082155667788',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      bio: 'Peminat filsafat dan literasi sosial di Pangkajene Sidrap.',
      district: 'Pangkajene',
      latitude: -3.9260,
      longitude: 119.8005,
      points: 420,
      level: 'Pembaca Pemula'
    }
  });

  const regularUser2 = await prisma.user.create({
    data: {
      name: 'Siti Rahma',
      email: 'siti@mabbaca.local',
      password: userPasswordHash,
      phone: '085299881122',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      bio: 'Mahasiswi asal Watang Pulu, gemar membaca novel dan sejarah.',
      district: 'Watang Pulu',
      latitude: -3.9450,
      longitude: 119.7800,
      points: 310,
      level: 'Pembaca Pemula'
    }
  });

  const regularUser3 = await prisma.user.create({
    data: {
      name: 'Muhammad Fadil',
      email: 'fadil@mabbaca.local',
      password: userPasswordHash,
      phone: '081277665544',
      role: 'USER',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      bio: 'Guru muda di Maritengngae yang aktif menggerakkan pojok baca kelas.',
      district: 'Maritengngae',
      latitude: -3.9330,
      longitude: 119.8080,
      points: 580,
      level: 'Penggerak Literasi'
    }
  });

  // 3. Seed Mitra Profiles
  const storeSidrap = await prisma.mitraProfile.create({
    data: {
      userId: mitraStoreUser.id,
      mitraType: 'TOKO_BUKU',
      organizationName: 'Toko Buku Sidrap Mandiri',
      slug: 'toko-buku-sidrap-mandiri',
      address: 'Jl. Jenderal Sudirman No. 45, Pangkajene, Kab. Sidrap',
      district: 'Pangkajene',
      village: 'Rappang',
      latitude: -3.9248,
      longitude: 119.8012,
      phoneWa: '6281234567890',
      description: 'Toko buku terlengkap di pusat kota Pangkajene Sidrap. Menyediakan buku teks pelajaran, fiksi, non-fiksi, agama, dan pengembangan diri. Melayani pengantaran se-Kabupaten Sidrap.',
      logo: 'https://images.unsplash.com/photo-1526243741027-444d633d7080?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1507842229451-7f01e677c423?w=1200&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      openHours: '08.00 - 21.00 WITA',
      verifiedAt: new Date()
    }
  });

  const perpusDaerah = await prisma.mitraProfile.create({
    data: {
      userId: mitraLibUser.id,
      mitraType: 'PERPUSTAKAAN',
      organizationName: 'Perpustakaan Daerah Kabupaten Sidrap',
      slug: 'perpustakaan-daerah-kabupaten-sidrap',
      address: 'Kompleks Gabungan SKPD Pemkab Sidrap, Blok A, Pangkajene',
      district: 'Pangkajene',
      village: 'Pangkajene',
      latitude: -3.9295,
      longitude: 119.7981,
      phoneWa: '6282198765432',
      description: 'Pusat layanan perpustakaan dan kearsipan daerah Sidrap dengan lebih dari 15.000 judul koleksi buku fisik dan ruang baca ber-AC yang nyaman untuk pelajar, mahasiswa, dan masyarakat umum.',
      logo: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      openHours: '08.00 - 16.00 WITA (Senin - Jumat)',
      verifiedAt: new Date()
    }
  });

  const komunitasSidrap = await prisma.mitraProfile.create({
    data: {
      userId: mitraKomunitasUser.id,
      mitraType: 'KOMUNITAS',
      organizationName: 'Komunitas Gerakan Sidrap Membaca',
      slug: 'komunitas-gerakan-sidrap-membaca',
      address: 'Jl. Wolter Monginsidi No. 12, Maritengngae, Sidrap',
      district: 'Maritengngae',
      village: 'Lautang Benteng',
      latitude: -3.9310,
      longitude: 119.8055,
      phoneWa: '6285255123456',
      description: 'Komunitas pemuda dan penggerak literasi Sidrap yang rutin mengadakan lapak baca gratis, bedah buku, dan kelas penulisan esai setiap akhir pekan.',
      logo: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      openHours: 'Sabtu - Minggu 15.30 - 18.00 WITA',
      verifiedAt: new Date()
    }
  });

  const perpusTeteaji = await prisma.mitraProfile.create({
    data: {
      userId: mitraDesaUser.id,
      mitraType: 'PERPUSTAKAAN',
      organizationName: 'Perpustakaan Desa Teteaji',
      slug: 'perpustakaan-desa-teteaji',
      address: 'Jl. Poros Sidrap-Parepare, Kantor Desa Teteaji, Kec. Tellu Limpoe',
      district: 'Tellu Limpoe',
      village: 'Teteaji',
      latitude: -3.9680,
      longitude: 119.7420,
      phoneWa: '6281344556677',
      description: 'Perpustakaan desa rujukan inovatif di Kecamatan Tellu Limpoe. Fokus pada koleksi pertanian modern, buku cerita bergambar anak, dan kewirausahaan pedesaan.',
      logo: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      openHours: '08.30 - 15.00 WITA',
      verifiedAt: new Date()
    }
  });

  const lapakBaranti = await prisma.mitraProfile.create({
    data: {
      userId: mitraBarantiUser.id,
      mitraType: 'KOMUNITAS',
      organizationName: 'Lapak Baca Pemuda Baranti',
      slug: 'lapak-baca-pemuda-baranti',
      address: 'Taman Segitiga Baranti, Jl. Poros Pinrang, Baranti',
      district: 'Baranti',
      village: 'Baranti',
      latitude: -3.8920,
      longitude: 119.7530,
      phoneWa: '6285311223344',
      description: 'Ruang interaksi literasi jalanan yang diinisiasi pemuda Baranti untuk mempermudah akses anak-anak dan warga sekitar membaca buku bermutu tanpa biaya.',
      logo: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      openHours: 'Jumat - Minggu 16.00 - 18.00 WITA',
      verifiedAt: new Date()
    }
  });

  // Mitra Pending
  await prisma.mitraProfile.create({
    data: {
      userId: mitraPendingUser.id,
      mitraType: 'TOKO_BUKU',
      organizationName: 'Toko Buku & ATK Baranti Sejahtera',
      slug: 'toko-buku-atk-baranti-sejahtera',
      address: 'Jl. Poros Baranti No. 88, Kec. Baranti, Sidrap',
      district: 'Baranti',
      village: 'Manisa',
      latitude: -3.8950,
      longitude: 119.7510,
      phoneWa: '6281999888777',
      description: 'Menyediakan buku sekolah, alat tulis kantor, dan perlengkapan literasi anak.',
      logo: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200&auto=format&fit=crop&q=80',
      banner: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1200&auto=format&fit=crop&q=80',
      status: 'PENDING',
      openHours: '08.00 - 20.00 WITA'
    }
  });

  // 4. Seed Book Categories
  const catFilsafat = await prisma.bookCategory.create({
    data: { name: 'Filsafat & Self Improvement', slug: 'filsafat-self-improvement', icon: 'Sparkles', description: 'Buku pengembangan diri, ketenangan pikiran, dan cara berpikir bijak.' }
  });
  const catSastra = await prisma.bookCategory.create({
    data: { name: 'Sastra & Fiksi', slug: 'sastra-fiksi', icon: 'BookOpen', description: 'Novel, cerpen, puisi, dan karya sastra monumental Nusantara.' }
  });
  const catSejarah = await prisma.bookCategory.create({
    data: { name: 'Sejarah & Budaya Lokal', slug: 'sejarah-budaya-lokal', icon: 'Landmark', description: 'Sejarah peradaban Nusantara, Bugis, dan warisan kearifan Nenek Mallomo Sidrap.' }
  });
  const catPertanian = await prisma.bookCategory.create({
    data: { name: 'Pertanian & Lingkungan', slug: 'pertanian-lingkungan', icon: 'Wheat', description: 'Kearifan lumbung beras Sidrap, agribisnis, dan teknologi pertanian modern.' }
  });
  const catPendidikan = await prisma.bookCategory.create({
    data: { name: 'Pendidikan & Keterampilan', slug: 'pendidikan-keterampilan', icon: 'GraduationCap', description: 'Metode belajar, penulisan kreatif, jurnalistik, dan literasi digital.' }
  });

  // 5. Seed Books
  const booksData = [
    {
      title: 'Filosofi Teras',
      slug: 'filosofi-teras',
      author: 'Henry Manampiring',
      publisher: 'Penerbit Buku Kompas',
      isbn: '978-602-412-518-9',
      publishYear: 2019,
      pages: 320,
      categoryId: catFilsafat.id,
      rating: 4.8,
      reviewCount: 124,
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      description: 'Buku ini membahas tentang bagaimana filsafat Yunani-Romawi Kuno (Stoisisme) dapat membantu kita membangun mental yang lebih tangguh, menjalani hidup dengan lebih tenang, dan menghadapi berbagai tantangan di era modern tanpa overthinking.'
    },
    {
      title: 'Laut Bercerita',
      slug: 'laut-bercerita',
      author: 'Leila S. Chudori',
      publisher: 'Kepustakaan Populer Gramedia',
      isbn: '978-602-424-694-5',
      publishYear: 2017,
      pages: 379,
      categoryId: catSastra.id,
      rating: 4.9,
      reviewCount: 215,
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&auto=format&fit=crop&q=80',
      description: 'Mengisahkan persahabatan, cinta, dan kehilangan sekelompok aktivis mahasiswa di era reformasi 1998, serta keluarga yang terus mencari kabar tentang orang-orang terkasih yang tak kunjung pulang.'
    },
    {
      title: 'Atomic Habits',
      slug: 'atomic-habits',
      author: 'James Clear',
      publisher: 'Gramedia Pustaka Utama',
      isbn: '978-602-063-317-6',
      publishYear: 2019,
      pages: 352,
      categoryId: catFilsafat.id,
      rating: 4.9,
      reviewCount: 180,
      coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&auto=format&fit=crop&q=80',
      description: 'Perubahan-perubahan kecil yang memberikan hasil luar biasa. Panduan praktis untuk membangun kebiasaan baik dan memutus kebiasaan buruk secara konsisten setiap hari.'
    },
    {
      title: 'Bumi Manusia',
      slug: 'bumi-manusia',
      author: 'Pramoedya Ananta Toer',
      publisher: 'Lentera Dipantara',
      isbn: '978-979-973-123-4',
      publishYear: 2005,
      pages: 535,
      categoryId: catSastra.id,
      rating: 4.9,
      reviewCount: 310,
      coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&auto=format&fit=crop&q=80',
      description: 'Karya agung sastra Indonesia yang memotret pergulatan intelektual Minke, seorang pribumi cerdas di awal abad ke-20, dalam melawan ketidakadilan feodalisme dan kolonialisme.'
    },
    {
      title: 'Negeri 5 Menara',
      slug: 'negeri-5-menara',
      author: 'Ahmad Fuadi',
      publisher: 'Gramedia Pustaka Utama',
      isbn: '978-979-224-861-6',
      publishYear: 2009,
      pages: 423,
      categoryId: catSastra.id,
      rating: 4.7,
      reviewCount: 95,
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&auto=format&fit=crop&q=80',
      description: 'Kisah inspiratif tentang enam pemuda perantau di pondok pesantren yang berpegang teguh pada mantra "Man Jadda Wajada" (Siapa yang bersungguh-sungguh, akan berhasil).'
    },
    {
      title: 'Sejarah & Petuah Nenek Mallomo Sidrap',
      slug: 'sejarah-petuah-nenek-mallomo-sidrap',
      author: 'Drs. H. M. Rusdi, M.Hum',
      publisher: 'Pustaka Sidrap Mandiri',
      isbn: '978-602-731-901-2',
      publishYear: 2021,
      pages: 210,
      categoryId: catSejarah.id,
      rating: 5.0,
      reviewCount: 42,
      coverImage: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400&auto=format&fit=crop&q=80',
      description: 'Kajian komprehensif ketokohan Nenek Mallomo, cendekiawan dan hakim agung legendaris Kerajaan Sidenreng abad ke-16 yang terkenal dengan prinsip hukum yang adil: "Naiya ade’e, matanre mappanganro, mareppa mappadua".'
    },
    {
      title: 'Pertanian Modern Lahan Sawah Sidrap',
      slug: 'pertanian-modern-lahan-sawah-sidrap',
      author: 'Ir. M. Arifin, M.Si',
      publisher: 'Celebes Agromedia',
      isbn: '978-602-884-120-7',
      publishYear: 2022,
      pages: 188,
      categoryId: catPertanian.id,
      rating: 4.6,
      reviewCount: 28,
      coverImage: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&auto=format&fit=crop&q=80',
      description: 'Panduan teknis bagi petani dan generasi muda Sidrap mengenai sistem irigasi hemat air, pemupukan presisi, dan mekanisasi pertanian di lumbung padi Sulawesi Selatan.'
    },
    {
      title: 'Menulis Kreatif Untuk Generasi Muda',
      slug: 'menulis-kreatif-untuk-generasi-muda',
      author: 'A. Tenri Angka',
      publisher: 'Pena Literasi Celebes',
      isbn: '978-602-991-304-5',
      publishYear: 2023,
      pages: 160,
      categoryId: catPendidikan.id,
      rating: 4.8,
      reviewCount: 39,
      coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&auto=format&fit=crop&q=80',
      description: 'Langkah praktis mengasah imajinasi, menyusun alur cerita, dan menuangkan gagasan menjadi tulisan fiksi maupun nonfiksi yang menggugah.'
    },
    {
      title: 'Teknik Dasar Jurnalistik & Reportase Warga',
      slug: 'teknik-dasar-jurnalistik-dan-reportase-warga',
      author: 'Bambang Sukmono',
      publisher: 'Media Aksara Nusantara',
      isbn: '978-602-112-998-1',
      publishYear: 2022,
      pages: 204,
      categoryId: catPendidikan.id,
      rating: 4.7,
      reviewCount: 31,
      coverImage: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&auto=format&fit=crop&q=80',
      description: 'Buku panduan riset, verifikasi fakta, teknik wawancara, dan etika peliputan bagi pegiat literasi, siswa, dan komunitas jurnalisme warga di era digital.'
    },
    {
      title: 'Pulang - Pergi',
      slug: 'pulang-pergi',
      author: 'Tere Liye',
      publisher: 'Sabak Grip Nusantara',
      isbn: '978-623-960-030-3',
      publishYear: 2021,
      pages: 412,
      categoryId: catSastra.id,
      rating: 4.8,
      reviewCount: 160,
      coverImage: 'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=400&auto=format&fit=crop&q=80',
      description: 'Kisah petualangan seru Bujang dalam mencari arti sejati pulang dan berdamai dengan masa lalu yang penuh pertarungan kehormatan.'
    }
  ];

  const createdBooks = [];
  for (const b of booksData) {
    const book = await prisma.book.create({ data: b });
    createdBooks.push(book);
  }

  // 6. Connect Books to Store Products (Toko Buku Sidrap Mandiri)
  await prisma.storeProduct.createMany({
    data: [
      { storeId: storeSidrap.id, bookId: createdBooks[0].id, price: 95000, stock: 12, isAvailable: true },
      { storeId: storeSidrap.id, bookId: createdBooks[1].id, price: 110000, stock: 8, isAvailable: true },
      { storeId: storeSidrap.id, bookId: createdBooks[2].id, price: 108000, stock: 15, isAvailable: true },
      { storeId: storeSidrap.id, bookId: createdBooks[3].id, price: 135000, stock: 6, isAvailable: true },
      { storeId: storeSidrap.id, bookId: createdBooks[4].id, price: 88000, stock: 9, isAvailable: true },
      { storeId: storeSidrap.id, bookId: createdBooks[5].id, price: 75000, stock: 20, isAvailable: true },
      { storeId: storeSidrap.id, bookId: createdBooks[6].id, price: 82000, stock: 14, isAvailable: true },
      { storeId: storeSidrap.id, bookId: createdBooks[8].id, price: 70000, stock: 10, isAvailable: true }
    ]
  });

  // 7. Connect Books to Library Collections
  // Perpustakaan Daerah Sidrap
  await prisma.libraryCollection.createMany({
    data: [
      { libraryId: perpusDaerah.id, bookId: createdBooks[0].id, callNumber: '100.1 MAN f', totalStock: 4, availableStock: 3, locationShelf: 'Rak F-02 (Filsafat)', category: 'Umum', isAvailable: true },
      { libraryId: perpusDaerah.id, bookId: createdBooks[1].id, callNumber: '813 CHU l', totalStock: 5, availableStock: 4, locationShelf: 'Rak N-05 (Novel)', category: 'Novel', isAvailable: true },
      { libraryId: perpusDaerah.id, bookId: createdBooks[2].id, callNumber: '158.1 CLE a', totalStock: 3, availableStock: 2, locationShelf: 'Rak P-01 (Pengembangan Diri)', category: 'Umum', isAvailable: true },
      { libraryId: perpusDaerah.id, bookId: createdBooks[3].id, callNumber: '813 TOE b', totalStock: 4, availableStock: 2, locationShelf: 'Rak N-01 (Sastra Klasik)', category: 'Novel', isAvailable: true },
      { libraryId: perpusDaerah.id, bookId: createdBooks[5].id, callNumber: '959.8 RUS s', totalStock: 6, availableStock: 5, locationShelf: 'Rak K-01 (Koleksi Khusus Sidrap)', category: 'Pendidikan', isAvailable: true },
      { libraryId: perpusDaerah.id, bookId: createdBooks[6].id, callNumber: '630.1 ARI p', totalStock: 4, availableStock: 4, locationShelf: 'Rak T-03 (Pertanian)', category: 'Pertanian', isAvailable: true },
      { libraryId: perpusDaerah.id, bookId: createdBooks[8].id, callNumber: '070.4 SUK t', totalStock: 3, availableStock: 3, locationShelf: 'Rak J-02 (Jurnalistik)', category: 'Pendidikan', isAvailable: true }
    ]
  });

  // Perpustakaan Desa Teteaji
  await prisma.libraryCollection.createMany({
    data: [
      { libraryId: perpusTeteaji.id, bookId: createdBooks[0].id, callNumber: 'DS-01 MAN f', totalStock: 2, availableStock: 2, locationShelf: 'Rak Baca Desa 1', category: 'Umum', isAvailable: true },
      { libraryId: perpusTeteaji.id, bookId: createdBooks[4].id, callNumber: 'DS-04 FUA n', totalStock: 3, availableStock: 3, locationShelf: 'Rak Inspirasi Remaja', category: 'Novel', isAvailable: true },
      { libraryId: perpusTeteaji.id, bookId: createdBooks[6].id, callNumber: 'DS-06 ARI p', totalStock: 5, availableStock: 4, locationShelf: 'Pojok Tani Mandiri', category: 'Pertanian', isAvailable: true }
    ]
  });

  // 8. Seed Reviews
  await prisma.review.createMany({
    data: [
      {
        userId: regularUser1.id,
        bookId: createdBooks[0].id,
        rating: 5,
        comment: 'Buku yang sangat membuka pikiran. Bahasanya mudah dipahami dan banyak contoh yang relevan dengan kehidupan sehari-hari di zaman sekarang. Sangat direkomendasikan!'
      },
      {
        userId: regularUser2.id,
        bookId: createdBooks[0].id,
        rating: 5,
        comment: 'Sangat recommended untuk yang ingin memahami filsafat dengan cara yang sederhana. Buku ini benar-benar mengubah cara pandang saya menghadapi masalah.'
      },
      {
        userId: regularUser3.id,
        bookId: createdBooks[1].id,
        rating: 5,
        comment: 'Karya sastra luar biasa yang menguras emosi. Detail karakter Biru Laut dan narasi Leila Chudori begitu hidup.'
      },
      {
        userId: regularUser1.id,
        bookId: createdBooks[5].id,
        rating: 5,
        comment: 'Wajib dibaca oleh generasi muda Sidrap. Kita harus bangga memiliki tokoh sejarah dengan kearifan hukum seperti Nenek Mallomo.'
      }
    ]
  });

  // 9. Seed Favorites
  await prisma.favorite.createMany({
    data: [
      { userId: regularUser1.id, bookId: createdBooks[0].id },
      { userId: regularUser1.id, bookId: createdBooks[2].id },
      { userId: regularUser2.id, bookId: createdBooks[1].id },
      { userId: regularUser2.id, bookId: createdBooks[5].id }
    ]
  });

  // 10. Seed Events
  const eventsData = [
    {
      mitraId: lapakBaranti.id,
      title: 'Lapak Baca Anak & Dongeng Akhir Pekan',
      slug: 'lapak-baca-anak-dan-dongeng-akhir-pekan',
      description: 'Kegiatan membaca buku terbuka di alam taman untuk anak-anak TK dan SD se-Kecamatan Baranti. Dilengkapi sesi mendongeng kisah kearifan lokal dan permainan edukatif.',
      banner: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80',
      eventDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days ahead
      startTime: '16.00',
      endTime: '17.45 WITA',
      locationName: 'Taman Segitiga Baranti',
      address: 'Jl. Poros Pinrang, Kec. Baranti, Sidrap',
      district: 'Baranti',
      latitude: -3.8920,
      longitude: 119.7530,
      category: 'LAPAK_BACA',
      audience: 'ANAK',
      quota: 30,
      currentParticipants: 18,
      isFree: true,
      status: 'UPCOMING'
    },
    {
      mitraId: komunitasSidrap.id,
      title: 'Bedah Buku: Filosofi Teras & Seni Hidup Tenang',
      slug: 'bedah-buku-filosofi-teras-dan-seni-hidup-tenang',
      description: 'Diskusi interaktif mengupas intisari Stoisisme dalam buku Filosofi Teras karya Henry Manampiring bersama narasumber pegiat literasi dan psikolog muda Sidrap.',
      banner: 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&auto=format&fit=crop&q=80',
      eventDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      startTime: '15.30',
      endTime: '17.30 WITA',
      locationName: 'Kedai Kopi Sudirman, Pangkajene',
      address: 'Jl. Sudirman No. 18, Pangkajene, Sidrap',
      district: 'Pangkajene',
      latitude: -3.9248,
      longitude: 119.8012,
      category: 'BEDAH_BUKU',
      audience: 'UMUM',
      quota: 50,
      currentParticipants: 34,
      isFree: true,
      status: 'UPCOMING'
    },
    {
      mitraId: perpusDaerah.id,
      title: 'Diskusi Anak Muda & Literasi Digital Sidrap',
      slug: 'diskusi-anak-muda-dan-literasi-digital-sidrap',
      description: 'Workshop interaktif mengulas kemampuan memilah informasi, menangkal hoaks di media sosial, dan memanfaatkan platform digital untuk belajar mandiri.',
      banner: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
      eventDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      startTime: '09.00',
      endTime: '12.00 WITA',
      locationName: 'Aula Perpustakaan Daerah Sidrap',
      address: 'Kompleks Gabungan SKPD Sidrap, Blok A',
      district: 'Pangkajene',
      latitude: -3.9295,
      longitude: 119.7981,
      category: 'DISKUSI',
      audience: 'REMAJA',
      quota: 100,
      currentParticipants: 62,
      isFree: true,
      status: 'UPCOMING'
    },
    {
      mitraId: komunitasSidrap.id,
      title: 'Pelatihan Jurnalistik Dasar & Menulis Berita',
      slug: 'pelatihan-jurnalistik-dasar-dan-menulis-berita',
      description: 'Pelatihan teknik penulisan 5W+1H, reportase lapangan, dan penulisan feature bagi pelajar SMA/SMK se-Kabupaten Sidrap.',
      banner: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
      eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      startTime: '08.30',
      endTime: '15.00 WITA',
      locationName: 'Pojok Baca Digital (POCADI) Monumen Ganggawa',
      address: 'Taman Kota Usman Isa, Pangkajene',
      district: 'Pangkajene',
      latitude: -3.9265,
      longitude: 119.8000,
      category: 'PELATIHAN',
      audience: 'REMAJA',
      quota: 40,
      currentParticipants: 29,
      isFree: true,
      status: 'UPCOMING'
    },
    {
      mitraId: perpusTeteaji.id,
      title: 'Festival Literasi Tani Desa Teteaji',
      slug: 'festival-literasi-tani-desa-teteaji',
      description: 'Pameran buku bertema teknologi pertanian, sharing session budidaya padi organik, serta pameran hasil inovasi pangan warga desa.',
      banner: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&auto=format&fit=crop&q=80',
      eventDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      startTime: '08.00',
      endTime: '16.00 WITA',
      locationName: 'Balai Pertemuan Desa Teteaji',
      address: 'Kec. Tellu Limpoe, Sidrap',
      district: 'Tellu Limpoe',
      latitude: -3.9680,
      longitude: 119.7420,
      category: 'FESTIVAL_LITERASI',
      audience: 'UMUM',
      quota: 150,
      currentParticipants: 85,
      isFree: true,
      status: 'UPCOMING'
    }
  ];

  const createdEvents = [];
  for (const ed of eventsData) {
    const ev = await prisma.event.create({ data: ed });
    createdEvents.push(ev);
  }

  // Register some user to events
  await prisma.eventParticipant.createMany({
    data: [
      { eventId: createdEvents[0].id, userId: regularUser1.id, status: 'REGISTERED' },
      { eventId: createdEvents[1].id, userId: regularUser1.id, status: 'REGISTERED' },
      { eventId: createdEvents[1].id, userId: regularUser2.id, status: 'REGISTERED' }
    ]
  });

  // 11. Seed Community Members
  await prisma.communityMember.createMany({
    data: [
      { communityId: komunitasSidrap.id, userId: regularUser1.id, role: 'ANGGOTA' },
      { communityId: komunitasSidrap.id, userId: regularUser3.id, role: 'PENGURUS' },
      { communityId: lapakBaranti.id, userId: regularUser2.id, role: 'ANGGOTA' }
    ]
  });

  // 12. Seed Article Categories
  const artCatWawasan = await prisma.articleCategory.create({
    data: { name: 'Wawasan Umum', slug: 'wawasan-umum' }
  });
  const artCatFinansial = await prisma.articleCategory.create({
    data: { name: 'Literasi Finansial', slug: 'literasi-finansial' }
  });
  const artCatDigital = await prisma.articleCategory.create({
    data: { name: 'Literasi Digital', slug: 'literasi-digital' }
  });
  const artCatSejarah = await prisma.articleCategory.create({
    data: { name: 'Sejarah & Budaya', slug: 'sejarah-dan-budaya' }
  });

  // 13. Seed "Baca 5 Menit" Articles
  const articlesData = [
    {
      authorId: adminUser.id,
      categoryId: artCatFinansial.id,
      title: 'Apa itu Literasi Finansial?',
      slug: 'apa-itu-literasi-finansial',
      thumbnail: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=600&auto=format&fit=crop&q=80',
      excerpt: 'Memahami dasar pengelolaan keuangan pribadi, membedakan kebutuhan dan keinginan, serta pentingnya dana darurat.',
      content: `Literasi finansial bukan sekadar kemampuan menghitung uang, melainkan kecakapan hidup dalam memahami cara menghasilkan, mengelola, menginvestasikan, serta melindungi aset finansial kita untuk masa depan yang lebih aman.\n\nBanyak orang terjebak masalah keuangan bukan karena penghasilannya sedikit, melainkan karena ketiadaan perencanaan dasar. Salah satu konsep paling sederhana yang dapat diterapkan adalah rumus alokasi 50-30-20:\n- 50% untuk kebutuhan pokok (makanan, tempat tinggal, transportasi).\n- 30% untuk keinginan dan rekreasi terukur.\n- 20% wajib dialokasikan untuk tabungan, investasi, dan dana darurat.\n\nDengan membiasakan diri mencatat arus kas harian dan menahan impuls belanja, kita perlahan membangun fondasi kemandirian finansial. Mulailah dari langkah kecil hari ini!`,
      readTimeMinutes: 4,
      views: 1240,
      isFeatured: true
    },
    {
      authorId: adminUser.id,
      categoryId: artCatDigital.id,
      title: 'Mengapa Kita Mudah Tertipu Berita Hoaks?',
      slug: 'mengapa-kita-mudah-tertipu-berita-hoaks',
      thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&auto=format&fit=crop&q=80',
      excerpt: 'Tinjauan psikologis bias konfirmasi di era media sosial dan cara melatih nalar kritis sebelum membagikan informasi.',
      content: `Di era banjir informasi saat ini, otak manusia cenderung mencari jalan pintas untuk memproses data. Fenomena ini disebut *confirmation bias* — kecenderungan mempercayai informasi yang sesuai dengan keyakinan kita sebelumnya, meski informasi tersebut tidak memiliki bukti valid.\n\nSelain itu, para pembuat konten manipulatif seringkali menggunakan judul bombastis (clickbait) dan memicu emosi kemarahan atau ketakutan. Saat emosi terpicu, bagian rasional otak kita menurun kinerjanya.\n\nUntuk melindung diri dari hoaks, terapkan prinsip 'Saring Sebelum Sharing':\n1. Periksa nama domain dan reputasi media penerbit.\n2. Cek apakah ada media kredibel lain yang mengabarkan berita serupa.\n3. Jangan menyebarkan informasi hanya berdasarkan judul.`,
      readTimeMinutes: 5,
      views: 890,
      isFeatured: true
    },
    {
      authorId: regularUser3.id,
      categoryId: artCatSejarah.id,
      title: 'Mengenal Sejarah Sidrap & Kearifan Nenek Mallomo',
      slug: 'mengenal-sejarah-sidrap-dan-kearifan-nenek-mallomo',
      thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=600&auto=format&fit=crop&q=80',
      excerpt: 'Menelusuri jejak peradaban lumbung pangan Sidenreng Rappang dan keteladanan penegakan hukum adat yang luhur.',
      content: `Kabupaten Sidenreng Rappang (Sidrap) memiliki jejak sejarah yang panjang sebagai salah satu kerajaan konfederasi Bugis paling terkemuka. Terkenal dengan tanahnya yang subur dan hamparan danau Sidenreng, daerah ini sejak abad lampau telah menjadi lumbung beras yang makmur.\n\nNamun, kekayaan Sidrap bukan hanya terletak pada hasil panennya, melainkan juga warisan pemikiran luhur tokoh negarawan abad ke-16, Nenek Mallomo. Petuah bijaknya dalam menolak nepotisme dan menegakkan hukum secara adil tanpa pandang bulu menjadi teladan integritas yang abadi di Tanah Bugis.\n\nNilai-nilai kejujuran (lempu), ketegasan (getteng), kepatutan (ada tongeng), dan kebijaksanaan (acca) adalah pilar peradaban Sidrap yang patut terus dihidupkan oleh generasi muda saat ini.`,
      readTimeMinutes: 5,
      views: 640,
      isFeatured: true
    },
    {
      authorId: adminUser.id,
      categoryId: artCatDigital.id,
      title: '3 Cara Mengenali Berita Palsu dalam Hitungan Detik',
      slug: '3-cara-mengenali-berita-palsu-dalam-hitungan-detik',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      excerpt: 'Trik praktis memeriksa keaslian foto, tanggal kejadian, dan sumber berita saat menerima pesan broadcast di WhatsApp.',
      content: `Pesan berantai WhatsApp sering kali disebarkan dengan kalimat desakan seperti "Sebarkan sebelum dihapus!" atau "Waspada modus baru!". Sebelum meneruskannya ke grup keluarga, lakukan 3 langkah verifikasi kilat ini:\n\n1. **Gunakan Google Reverse Image Search**: Simpan foto yang terlampir di berita, lalu telusuri di Google Images untuk melihat apakah foto tersebut sebenarnya kejadian bertahun-tahun lalu di lokasi yang berbeda.\n2. **Periksa Tanggal dan Redaksional**: Berita palsu kerap tidak mencantumkan tanggal yang jelas ("kemarin siang", "tadi malam") dan menggunakan tanda seru berulang-ulang.\n3. **Cari di Website CekFakta**: Kunjungi situs turnbackhoax.id atau cekfakta.com untuk melihat arsip klarifikasi kabar bohong yang telah dibongkar oleh komunitas pemeriksa fakta.`,
      readTimeMinutes: 3,
      views: 750,
      isFeatured: false
    }
  ];

  for (const art of articlesData) {
    await prisma.article.create({ data: art });
  }

  // 14. Seed Gamification Missions
  const mission1 = await prisma.mission.create({
    data: {
      title: 'Baca 5 Menit',
      description: 'Selesaikan membaca minimal 1 artikel pendek hari ini.',
      pointsReward: 10,
      type: 'DAILY',
      requirementCount: 1
    }
  });

  const mission2 = await prisma.mission.create({
    data: {
      title: 'Jelajahi Perpustakaan Terdekat',
      description: 'Kunjungi profil salah satu perpustakaan di Sidrap.',
      pointsReward: 20,
      type: 'DAILY',
      requirementCount: 1
    }
  });

  const mission3 = await prisma.mission.create({
    data: {
      title: 'Berikan Ulasan Buku',
      description: 'Tulis ulasan pengalaman membacamu untuk salah satu buku favorit.',
      pointsReward: 10,
      type: 'DAILY',
      requirementCount: 1
    }
  });

  const mission4 = await prisma.mission.create({
    data: {
      title: 'Ikuti Event Literasi',
      description: 'Daftarkan diri pada salah satu kegiatan atau diskusi komunitas.',
      pointsReward: 25,
      type: 'ONCE',
      requirementCount: 1
    }
  });

  // Assign missions to regularUser1
  await prisma.userMission.createMany({
    data: [
      { userId: regularUser1.id, missionId: mission1.id, currentCount: 1, isCompleted: true, completedAt: new Date() },
      { userId: regularUser1.id, missionId: mission2.id, currentCount: 1, isCompleted: true, completedAt: new Date() },
      { userId: regularUser1.id, missionId: mission3.id, currentCount: 1, isCompleted: true, completedAt: new Date() },
      { userId: regularUser1.id, missionId: mission4.id, currentCount: 0, isCompleted: false }
    ]
  });

  // 15. Seed Borrowing record
  const collection1 = await prisma.libraryCollection.findFirst({
    where: { libraryId: perpusDaerah.id, bookId: createdBooks[1].id }
  });
  if (collection1) {
    await prisma.borrowing.create({
      data: {
        userId: regularUser1.id,
        collectionId: collection1.id,
        borrowDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        status: 'BORROWED',
        notes: 'Peminjaman untuk bahan referensi tugas akhir.'
      }
    });
  }

  // 16. Seed User Activity
  await prisma.userActivity.createMany({
    data: [
      { userId: regularUser1.id, actionType: 'READ_ARTICLE', pointsEarned: 10, description: 'Membaca artikel: Apa itu Literasi Finansial?' },
      { userId: regularUser1.id, actionType: 'WRITE_REVIEW', pointsEarned: 10, description: 'Memberikan rating & ulasan buku Filosofi Teras' },
      { userId: regularUser1.id, actionType: 'BORROW_BOOK', pointsEarned: 20, description: 'Meminjam buku Laut Bercerita di Perpustakaan Daerah Sidrap' },
      { userId: regularUser1.id, actionType: 'JOIN_EVENT', pointsEarned: 15, description: 'Mendaftar event Lapak Baca Anak & Dongeng Akhir Pekan' }
    ]
  });

  // 17. Seed Notification
  await prisma.notification.createMany({
    data: [
      {
        userId: regularUser1.id,
        title: 'Selamat Datang di MABBACA!',
        message: 'Temukan buku, perpustakaan, toko buku, dan komunitas literasi di sekitarmu.',
        type: 'INFO',
        isRead: false,
        linkUrl: '/buku'
      },
      {
        userId: regularUser1.id,
        title: 'Peminjaman Disetujui',
        message: 'Peminjaman buku Laut Bercerita di Perpustakaan Daerah Sidrap telah aktif.',
        type: 'SUCCESS',
        isRead: true,
        linkUrl: '/dashboard'
      }
    ]
  });

  console.log('Seed completed successfully!');
  console.log('Demo Credentials:');
  console.log('- Admin: admin@mabbaca.local / Admin123!');
  console.log('- Mitra: mitra@mabbaca.local / Mitra123!');
  console.log('- User:  user@mabbaca.local  / User123!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
