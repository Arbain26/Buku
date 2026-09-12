require('dotenv').config();
process.env.NODE_ENV = 'test';

const app = require('../src/app');
const prisma = require('../src/config/db');

const TEST_PORT = 5003;
const BASE_URL = `http://localhost:${TEST_PORT}/api`;

let server;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

async function runTests() {
  console.log('🚀 Memulai pengujian end-to-end backend API MABBACA...\n');

  server = app.listen(TEST_PORT);
  console.log(`Server uji aktif di port ${TEST_PORT}\n`);

  let adminToken, mitraTokoToken, userToken, newUserToken, newUserId, newMitraId, testOrderId, testBorrowId, testEventId;

  try {
    // 1. Health Check
    console.log('1. Menguji Health Check...');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthJson = await healthRes.json();
    assert(healthRes.status === 200, 'Health check harus status 200');
    assert(healthJson.database === 'connected (MySQL)', 'Database MySQL harus connected');
    console.log('   ✅ Health Check: OK, Database MySQL terhubung.');

    // 2. Login ADMIN
    console.log('2. Menguji Login ADMIN...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@mabbaca.id', password: 'admin123' }),
    });
    const adminLoginJson = await adminLoginRes.json();
    assert(adminLoginRes.status === 200, 'Admin login harus berhasil (200)');
    assert(adminLoginJson.data.token, 'Token JWT admin harus ada');
    assert(adminLoginJson.data.user.role === 'ADMIN', 'Role harus ADMIN');
    adminToken = adminLoginJson.data.token;
    console.log('   ✅ Login ADMIN: Berhasil');

    // 3. Login MITRA
    console.log('3. Menguji Login MITRA...');
    const mitraLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'toko@mabbaca.id', password: 'mitra123' }),
    });
    const mitraLoginJson = await mitraLoginRes.json();
    assert(mitraLoginRes.status === 200, 'Mitra login harus 200');
    assert(mitraLoginJson.data.user.role === 'MITRA', 'Role harus MITRA');
    mitraTokoToken = mitraLoginJson.data.token;
    console.log('   ✅ Login MITRA: Berhasil');

    // 4. Login USER
    console.log('4. Menguji Login USER...');
    const userLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@mabbaca.id', password: 'user123' }),
    });
    const userLoginJson = await userLoginRes.json();
    assert(userLoginRes.status === 200, 'User login harus 200');
    assert(userLoginJson.data.user.role === 'USER', 'Role harus USER');
    userToken = userLoginJson.data.token;
    console.log('   ✅ Login USER: Berhasil');

    // 5. Invalid Login
    console.log('5. Menguji Penanganan Login Tidak Valid...');
    const invalidLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@mabbaca.id', password: 'wrongpassword' }),
    });
    assert(invalidLoginRes.status === 401, 'Password salah harus mengembalikan status 401');
    console.log('   ✅ Penanganan Invalid Login: Berhasil (401)');

    // 6. Unauthorized Request
    console.log('6. Menguji Unauthorized Request...');
    const unauthRes = await fetch(`${BASE_URL}/admin/dashboard`);
    assert(unauthRes.status === 401, 'Request tanpa token harus mengembalikan 401');
    console.log('   ✅ Unauthorized Request: Berhasil ditolak (401)');

    // 7. Forbidden Role
    console.log('7. Menguji Forbidden Role...');
    const forbiddenRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert(forbiddenRes.status === 403, 'User biasa membuka admin harus mengembalikan 403');
    console.log('   ✅ Forbidden Role: Berhasil ditolak (403)');

    // 8. Register New USER
    console.log('8. Menguji Register USER baru...');
    const testEmail = `tester_${Date.now()}@mabbaca.id`;
    const regUserRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tester Otomatis',
        email: testEmail,
        password: 'password123',
        phone: '081234567899',
        district: 'Pangkajene',
      }),
    });
    const regUserJson = await regUserRes.json();
    assert(regUserRes.status === 201, 'Register user baru harus status 201');
    assert(regUserJson.data.token, 'Token harus dibuat saat register');
    newUserToken = regUserJson.data.token;
    newUserId = regUserJson.data.user.id;
    console.log('   ✅ Register USER Baru: Berhasil');

    // 9. Register New MITRA
    console.log('9. Menguji Register MITRA baru (status PENDING)...');
    const testMitraEmail = `mitra_${Date.now()}@mabbaca.id`;
    const regMitraRes = await fetch(`${BASE_URL}/auth/register-mitra`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Pengelola Toko Baru',
        email: testMitraEmail,
        password: 'password123',
        phone: '081298765432',
        mitraType: 'TOKO_BUKU',
        organizationName: 'Toko Buku Uji Coba',
        address: 'Jl. Poros Sidrap No. 100',
        district: 'Maritengngae',
      }),
    });
    const regMitraJson = await regMitraRes.json();
    assert(regMitraRes.status === 201, 'Register mitra harus 201');
    assert(regMitraJson.data.user.mitraProfile.status === 'PENDING', 'Status mitra baru harus PENDING');
    newMitraId = regMitraJson.data.user.mitraProfile.id;
    console.log('   ✅ Register MITRA Baru: Berhasil (Status PENDING)');

    // 10. Admin Approve Mitra
    console.log('10. Menguji Verifikasi Mitra oleh Admin (Approve)...');
    const approveRes = await fetch(`${BASE_URL}/admin/mitra/${newMitraId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const approveJson = await approveRes.json();
    assert(approveRes.status === 200, 'Approve mitra harus status 200');
    assert(approveJson.data.status === 'APPROVED', 'Status harus berubah jadi APPROVED');
    console.log('   ✅ Verifikasi Mitra (Approve): Berhasil');

    // 11. Books List & Pagination
    console.log('11. Menguji Books API (Paginasi & Pencarian)...');
    const booksRes = await fetch(`${BASE_URL}/books?page=1&limit=5&search=Bumi`);
    const booksJson = await booksRes.json();
    assert(booksRes.status === 200, 'Get books harus 200');
    assert(booksJson.data.length > 0, 'Harus ada buku yang ditemukan');
    assert(booksJson.meta.page === 1, 'Paginasi meta.page harus 1');
    assert(booksJson.meta.limit === 5, 'Paginasi meta.limit harus 5');
    console.log(`   ✅ Books API: Berhasil (${booksJson.data.length} buku dimuat)`);

    // 12. Book Detail
    console.log('12. Menguji Detail Buku...');
    const bookDetailRes = await fetch(`${BASE_URL}/books/1`);
    const bookDetailJson = await bookDetailRes.json();
    assert(bookDetailRes.status === 200, 'Get book by id harus 200');
    assert(bookDetailJson.data.title, 'Buku harus memiliki judul');
    console.log(`   ✅ Detail Buku: "${bookDetailJson.data.title}" berhasil dimuat`);

    // 13. Stores List & Haversine Distance
    console.log('13. Menguji Stores API & Haversine Distance...');
    const storesRes = await fetch(`${BASE_URL}/stores?userLat=-3.9274&userLng=119.7997`);
    const storesJson = await storesRes.json();
    assert(storesRes.status === 200, 'Get stores harus 200');
    assert(storesJson.data.length > 0, 'Daftar toko harus terisi');
    assert(storesJson.data[0].distanceKm !== undefined, 'Harus ada perhitungan jarak distanceKm');
    console.log(`   ✅ Stores API: Jarak toko terdekat: ${storesJson.data[0].formattedDistance}`);

    // 14. Libraries API
    console.log('14. Menguji Libraries API...');
    const libsRes = await fetch(`${BASE_URL}/libraries`);
    const libsJson = await libsRes.json();
    assert(libsRes.status === 200, 'Get libraries harus 200');
    assert(libsJson.data.length > 0, 'Perpustakaan harus terisi');
    console.log(`   ✅ Libraries API: ${libsJson.data.length} perpustakaan ditemukan`);

    // 15. Communities API
    console.log('15. Menguji Communities API...');
    const commRes = await fetch(`${BASE_URL}/communities`);
    const commJson = await commRes.json();
    assert(commRes.status === 200, 'Get communities harus 200');
    assert(commJson.data.length > 0, 'Komunitas harus terisi');
    console.log(`   ✅ Communities API: ${commJson.data.length} komunitas ditemukan`);

    // 16. Community Toggle Join
    console.log('16. Menguji Toggle Join Komunitas...');
    const joinRes = await fetch(`${BASE_URL}/communities/1/join`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` },
    });
    const joinJson = await joinRes.json();
    assert(joinRes.status === 200, 'Toggle join harus 200');
    console.log(`   ✅ Toggle Join Komunitas: ${joinJson.message}`);

    // 17. Events API & Event Registration
    console.log('17. Menguji Events API & Pendaftaran Event...');
    const eventsRes = await fetch(`${BASE_URL}/events`);
    const eventsJson = await eventsRes.json();
    assert(eventsRes.status === 200, 'Get events harus 200');
    testEventId = eventsJson.data[0].id;

    // Register newUser to event
    const regEventRes = await fetch(`${BASE_URL}/events/${testEventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` },
    });
    assert(regEventRes.status === 201, 'Pendaftaran event harus 201');
    console.log(`   ✅ Pendaftaran Event: Berhasil`);

    // Uji proteksi duplikasi pendaftaran event
    const dupEventRes = await fetch(`${BASE_URL}/events/${testEventId}/register`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` },
    });
    assert(dupEventRes.status === 400, 'Pendaftaran kedua harus ditolak (400)');
    console.log(`   ✅ Proteksi Duplikasi Event: Berhasil ditolak`);

    // 18. Peminjaman Buku (Borrowings)
    console.log('18. Menguji Alur Peminjaman Buku Perpustakaan...');
    const borrowRes = await fetch(`${BASE_URL}/borrowings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newUserToken}`,
      },
      body: JSON.stringify({
        libraryId: 1,
        bookId: 1,
        quantity: 1,
        notes: 'Uji peminjaman otomatis.',
        durationDays: 7,
      }),
    });
    const borrowJson = await borrowRes.json();
    assert(borrowRes.status === 201, 'Pengajuan pinjam harus status 201');
    testBorrowId = borrowJson.data.id;

    // Approve borrowing oleh Admin
    const approveBorrowRes = await fetch(`${BASE_URL}/borrowings/${testBorrowId}/approve`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(approveBorrowRes.status === 200, 'Approve peminjaman harus 200');

    // Return peminjaman (mengembalikan stok fisik agar uji coba bersifat idempoten)
    const returnBorrowRes = await fetch(`${BASE_URL}/borrowings/${testBorrowId}/return`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(returnBorrowRes.status === 200, 'Return peminjaman harus 200');
    console.log('   ✅ Transaksi Peminjaman Buku: Berhasil (Approved & stok aman dikembalikan)');

    // 19. Pemesanan Buku (Orders) & WhatsApp Flow
    console.log('19. Menguji Transaksi Pemesanan Buku (WhatsApp Flow)...');
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newUserToken}`,
      },
      body: JSON.stringify({
        storeId: 1,
        items: [{ bookId: 1, quantity: 1 }],
        customerName: 'Tester Pembeli',
        customerPhone: '08124233002',
        customerAddress: 'Jl. Poros Sidrap No. 5',
        notes: 'Mohon dibungkus rapi.',
      }),
    });
    const orderJson = await orderRes.json();
    assert(orderRes.status === 201, 'Order buku harus 201');
    assert(orderJson.data.order.orderNumber, 'Harus ada orderNumber');
    assert(orderJson.data.whatsappUrl.includes('https://wa.me/'), 'Harus menghasilkan link WhatsApp');
    assert(orderJson.data.totalAmount > 0, 'Total harus dihitung dari database');
    testOrderId = orderJson.data.order.id;
    console.log(`   ✅ Pemesanan Buku: Nomor Order #${orderJson.data.order.orderNumber}, Total: Rp ${orderJson.data.totalAmount}`);

    // WhatsApp contact follow-up
    const waRes = await fetch(`${BASE_URL}/orders/${testOrderId}/contact-whatsapp`, {
      method: 'POST',
    });
    const waJson = await waRes.json();
    assert(waRes.status === 200, 'Contact WhatsApp harus 200');
    assert(waJson.data.status === 'CONTACTED', 'Status order harus CONTACTED');
    console.log('   ✅ WhatsApp Follow-up: Status berubah jadi CONTACTED');

    // 20. Reviews API
    console.log('20. Menguji Reviews API...');
    const reviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${newUserToken}`,
      },
      body: JSON.stringify({
        bookId: 4,
        rating: 5,
        comment: 'Buku Laut Bercerita sangat menggetarkan hati.',
      }),
    });
    const reviewJson = await reviewRes.json();
    assert(reviewRes.status === 201, 'Tambah review harus 201');
    console.log('   ✅ Reviews API: Berhasil (+10 poin)');

    // 21. Favorites API
    console.log('21. Menguji Favorites API...');
    const favRes = await fetch(`${BASE_URL}/favorites/books/4`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${newUserToken}` },
    });
    const favJson = await favRes.json();
    assert(favRes.status === 200, 'Toggle favorite harus 200');
    console.log(`   ✅ Favorites API: ${favJson.message}`);

    // 22. User Dashboard & Gamification
    console.log('22. Menguji User Dashboard & Gamifikasi...');
    const userDashRes = await fetch(`${BASE_URL}/user/dashboard`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const userDashJson = await userDashRes.json();
    assert(userDashRes.status === 200, 'User dashboard harus 200');
    assert(userDashJson.data.user.points >= 0, 'Poin user harus ada');
    assert(userDashJson.data.missions.length > 0, 'Misi harus ada');
    console.log(`   ✅ User Dashboard: Poin = ${userDashJson.data.user.points}, Level = "${userDashJson.data.user.level}"`);

    // 23. Mitra Dashboard (Data Asli Database)
    console.log('23. Menguji Mitra Dashboard (Real Data)...');
    const mitraDashRes = await fetch(`${BASE_URL}/mitra/dashboard`, {
      headers: { Authorization: `Bearer ${mitraTokoToken}` },
    });
    const mitraDashJson = await mitraDashRes.json();
    assert(mitraDashRes.status === 200, 'Mitra dashboard harus 200');
    assert(mitraDashJson.data.metrics.totalProducts > 0, 'Total produk harus dari database');
    console.log(`   ✅ Mitra Dashboard: Total Produk = ${mitraDashJson.data.metrics.totalProducts}, Total Stok = ${mitraDashJson.data.metrics.totalStock}`);

    // 24. Admin Dashboard (Data Asli Database)
    console.log('24. Menguji Admin Dashboard (Real Data)...');
    const adminDashRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminDashJson = await adminDashRes.json();
    assert(adminDashRes.status === 200, 'Admin dashboard harus 200');
    assert(adminDashJson.data.counts.totalBooks >= 15, 'Total buku harus minimal 15');
    assert(adminDashJson.data.counts.totalUsers >= 10, 'Total user harus minimal 10');
    console.log(`   ✅ Admin Dashboard: Total Buku = ${adminDashJson.data.counts.totalBooks}, Total User = ${adminDashJson.data.counts.totalUsers}`);

    // 25. Universal Search API
    console.log('25. Menguji Universal Search API...');
    const searchRes = await fetch(`${BASE_URL}/search?q=sidrap`);
    const searchJson = await searchRes.json();
    assert(searchRes.status === 200, 'Universal search harus 200');
    assert(searchJson.data.counts.all > 0, 'Pencarian harus menemukan hasil');
    console.log(`   ✅ Universal Search: Ditemukan ${searchJson.data.counts.all} hasil untuk kata kunci "sidrap"`);

    // 26. Location & Nearby API
    console.log('26. Menguji Location & Nearby API...');
    const nearbyRes = await fetch(`${BASE_URL}/locations/nearby?radius=25`);
    const nearbyJson = await nearbyRes.json();
    assert(nearbyRes.status === 200, 'Nearby API harus 200');
    assert(nearbyJson.data.results.stores.length > 0, 'Toko terdekat harus ditemukan');
    console.log(`   ✅ Nearby API: Ditemukan ${nearbyJson.data.results.stores.length} toko dalam radius 25 km`);

    console.log('\n=========================================================');
    console.log('🎉 SEMUA 26 PENGUJIAN END-TO-END BERHASIL DILALUI DENGAN SUKSES!');
    console.log('=========================================================\n');
  } catch (error) {
    console.error('\n❌ PENGUJIAN GAGAL:', error.message);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
      console.log('Server uji dimatikan.');
    }
    await prisma.$disconnect();
  }
}

runTests();
