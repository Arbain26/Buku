# MABBACA — Platform Ekosistem Literasi Masyarakat Sidrap

> **Tagline**: *"Temukan Literasi di Sekitarmu."*  
> **Pilar**: *"Cari. Baca. Belajar. Berbagi."*

**MABBACA** adalah platform ekosistem literasi digital terpadu untuk Kabupaten Sidenreng Rappang (Sidrap), Sulawesi Selatan. Platform ini memadukan konsep **Marketplace + Direktori + Komunitas + Event + Konten Literasi** yang mempertemukan masyarakat dengan buku fisik, toko buku lokal, perpustakaan daerah & desa, komunitas literasi, agenda kegiatan, serta artikel ringkas 5 menit.

Aplikasi ini dibangun menggunakan arsitektur **Full JavaScript murni** (tanpa TypeScript/Python/PHP) dengan standar enterprise:
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Framer Motion, Recharts, Axios, React Router v6.
- **Backend**: Node.js, Express.js, JWT Authentication, bcryptjs, Multer, REST API.
- **Database**: MySQL / MariaDB dengan Prisma ORM relasional, schema migration, dan seed data realistis Kabupaten Sidrap.

---

## Arsitektur Tiga Role Utama

Sistem MABBACA memiliki **3 role utama**:
1. **`USER`**: Masyarakat umum / pembaca. Menemukan buku, toko buku, perpustakaan, membaca artikel 5 menit, memesan buku via WhatsApp, meminjam buku perpustakaan, mengikuti event, memberikan rating & review, serta mendapatkan poin/level gamifikasi.
2. **`MITRA`**: Penyedia literasi lokal dengan status (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`). Ditentukan oleh `mitra_type`:
   - `TOKO_BUKU`: Toko buku fisik dengan inventaris produk, harga, stok, dan pemesanan WhatsApp otomatis.
   - `PERPUSTAKAAN`: Perpustakaan daerah / desa / POCADI dengan katalog koleksi, nomor panggil, rak, dan persetujuan peminjaman buku.
   - `KOMUNITAS`: Komunitas penggerak literasi, lapak baca jalanan, bedah buku, dan pengelolaan anggota.
   - `SEKOLAH` & `PENGAJAR`: Lembaga pendidikan dan fasilitator literasi.
3. **`ADMIN`**: Pengelola pusat platform. Memantau metrik ekosistem, memverifikasi pendaftaran mitra pending, mengelola seluruh pengguna, dan memantau persebaran data literasi di seluruh kecamatan Sidrap.

---

## Struktur Direktori

```
mabbaca/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── components/         # Reusable UI component system
│   │   │   ├── cards/          # BookCard, StoreCard, LibraryCard, CommunityCard, EventCard, ArticleCard
│   │   │   ├── common/         # Button, Input, Modal, Badge, Skeleton, EmptyState
│   │   │   └── layout/         # Navbar, Footer, Sidebar
│   │   ├── contexts/           # AuthContext, LocationContext, ToastContext
│   │   ├── layouts/            # MainLayout, DashboardLayout
│   │   ├── pages/
│   │   │   ├── admin/          # AdminDashboardPage (Verifikasi Mitra & Statistik Wilayah)
│   │   │   ├── auth/           # LoginPage, RegisterPage, RegisterMitraPage
│   │   │   ├── mitra/          # MitraDashboardPage (Chart, Produk/Koleksi, Pesanan/Peminjaman)
│   │   │   ├── public/         # HomePage, BooksPage, BookDetailPage, StoresPage, StoreDetailPage,
│   │   │   │                   # LibrariesPage, LibraryDetailPage, CommunitiesPage,
│   │   │   │                   # CommunityDetailPage, EventsPage, EventDetailPage,
│   │   │   │                   # ArticlesPage, ArticleDetailPage, UniversalSearchPage, MitraLandingPage
│   │   │   └── user/           # UserDashboardPage (Gamifikasi, Misi Harian, Poin, Favorit)
│   │   ├── routes/             # AppRoutes (Protected routes & Role-based routes)
│   │   ├── services/           # Axios instance & modular API services
│   │   ├── App.jsx             # Root React App
│   │   ├── index.css           # Tailwind base styles & custom palette
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js      # Palette: #075E54 (Primary), #0F766E (Secondary), #F8FAF8 (Bg)
│   └── package.json
│
├── server/                     # Backend API (Express.js + Prisma)
│   ├── prisma/
│   │   ├── schema.prisma       # Relational Database Schema (20 entitas)
│   │   └── seed.js             # Data seed realistis Kabupaten Sidrap
│   ├── src/
│   │   ├── config/             # Prisma client, JWT, Multer upload
│   │   ├── controllers/        # auth, book, store, library, community, event, article, search, user, mitra, admin
│   │   ├── middleware/         # authMiddleware, roleMiddleware, errorMiddleware
│   │   ├── routes/             # Express API route modules
│   │   ├── utils/              # Haversine distance, responseHelper
│   │   └── app.js              # Express app entry point
│   ├── uploads/                # Storage uploaded files
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## Akun Demo Pengujian

Aplikasi telah dilengkapi dengan seed data dan tombol pengisian cepat (*quick-fill*) pada halaman `/login`:

| Role | Email | Password | Keterangan & Portal |
|------|-------|----------|---------------------|
| **ADMIN** | `admin@mabbaca.id` | `admin123` | Portal Khusus: `/admin/login` atau `/login`. Akses verifikasi mitra pending & data literasi per kecamatan |
| **MITRA (TOKO)** | `toko@mabbaca.id` | `mitra123` | Portal `/login`. Pengelola Toko Buku Sidrap Mandiri (Dashboard metrik, chart, inventaris) |
| **MITRA (PERPUS)** | `perpus@mabbaca.id` | `mitra123` | Portal `/login`. Dinas Perpustakaan Daerah Sidrap (Koleksi & Peminjaman) |
| **MITRA (KOMUNITAS)** | `komunitas@mabbaca.id` | `mitra123` | Portal `/login`. Ketua Komunitas Gerakan Sidrap Membaca |
| **USER (WARGA)** | `user@mabbaca.id` | `user123` | Portal `/login`. Andi Muhammad Nur (Level: Pembaca Setia, 420 Poin, Misi harian) |

> **Keamanan Akses Dashboard Admin**:  
> Dashboard admin (`/admin/dashboard`) dilindungi secara ketat di sisi **Frontend (Guard `AdminRoute`)** dan **Backend (`authorize('ADMIN')`)**.  
> - Jika pengunjung belum login mencoba membuka `/admin` atau `/admin/dashboard`, sistem langsung mengarahkannya ke **Portal Masuk Admin (`/admin/login`)**.  
> - Jika pengunjung sudah login sebagai **User Warga** atau **Mitra** dan mencoba membuka `/admin/dashboard`, sistem akan menampilkan layar **Error 403: Akses Ditolak** dengan peringatan bahwa halaman tersebut terbatas hanya untuk pengelola sistem.

---

## Prasyarat & Instalasi

### 1. Prasyarat
- **Node.js**: v18+ (Rekomendasi v20+)
- **MySQL / MariaDB**: Berjalan pada port `3306`

### 2. Setup Backend Server

Masuk ke folder `server/`:
```bash
cd server
npm install
```

Buat file `.env` di dalam folder `server/` (atau salin dari `.env.example`):
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="mysql://root:password@localhost:3306/mabbaca"
JWT_SECRET="mabbaca_super_secret_jwt_sidrap_literasi_key_2026"
JWT_EXPIRES_IN="7d"
CLIENT_URL="http://localhost:5173"
UPLOAD_DIR="./uploads"
```
*(Sesuaikan password database MySQL Anda jika menggunakan password)*.

Jalankan sinkronisasi skema database dan seed data Sidrap:
```bash
# Generate client Prisma & sinkronkan tabel ke MySQL
npx prisma generate
npx prisma db push

# Isi data awal realistis Sidrap
node prisma/seed.js
```

Jalankan backend server:
```bash
# Mode development
npm run dev

# Atau mode produksi
npm start
```
Server akan aktif di `http://localhost:5000/api`.

---

### 3. Setup Frontend Client

Masuk ke folder `client/`:
```bash
cd ../client
npm install
```

Buat file `.env` di dalam folder `client/`:
```env
VITE_API_URL=http://localhost:5000/api
```

Jalankan server development:
```bash
npm run dev
```
Buka browser pada alamat: **`http://localhost:5173`**.

---

## Fitur Unggulan Platform

1. **Pencarian Universal Multi-Entitas (`/search`)**:
   Mencari secara serentak ke dalam buku, toko buku, perpustakaan, komunitas, agenda event, dan artikel 5 menit dengan filter tab instan.
2. **Koneksi Buku ke Toko & Perpustakaan**:
   Setiap buku menampilkan bagian *"Tersedia di"*:
   - Tombol **Pesan via WhatsApp** yang otomatis merangkum detail buku, harga, dan nama toko ke format chat WhatsApp.
   - Tombol **Pinjam Sekarang** yang langsung mengajukan permohonan peminjaman ke perpustakaan terkait.
3. **Kalkulasi Jarak Haversine Realistis**:
   Menghitung jarak akurat berdasarkan geolokasi pengguna atau titik pusat Kabupaten Sidrap (`Pangkajene`) ke setiap perpustakaan, toko, dan komunitas.
4. **Gamifikasi Pembaca**:
   Poin literasi, misi harian (membaca 5 menit, mengunjungi perpus, memberikan ulasan), dan kenaikan level (*Pembaca Pemula*, *Sahabat Buku*, *Penggerak Literasi*, *Inspirator Literasi*).
5. **Dashboard Dinamis Mitra Berdasarkan Tipe**:
   - Toko Buku: Grafik penjualan, produk terlaris, manajemen buku & harga.
   - Perpustakaan: Manajemen nomor panggil, nomor rak, stok, dan persetujuan peminjaman.
   - Komunitas: Pengelolaan event dan relawan literasi.
6. **Verifikasi Mitra & Pemetaan Literasi Sidrap**:
   Admin dapat menyetujui/menolak pendaftaran mitra baru dan memantau sebaran titik literasi di 8 kecamatan utama (Pangkajene, Maritengngae, Baranti, Watang Pulu, Tellu Limpoe, Dua Pitue, Panca Rijang, Kulo).

---

## Ringkasan API Endpoints

- `POST /api/auth/register` : Registrasi akun pengguna (User)
- `POST /api/auth/register-mitra` : Pendaftaran mitra baru (status: PENDING)
- `POST /api/auth/login` : Autentikasi dan penerbitan token JWT
- `GET /api/auth/me` : Informasi profil pengguna login
- `GET /api/books` : Katalog buku dengan pencarian, filter kategori, dan sorting
- `GET /api/books/:id` : Detail buku beserta toko & perpustakaan penyedia
- `POST /api/books/:id/favorite` : Simpan buku favorit
- `POST /api/books/:id/reviews` : Kirim ulasan dan rating buku
- `GET /api/stores` : Direktori toko buku beserta estimasi jarak
- `GET /api/libraries` : Direktori perpustakaan beserta estimasi jarak
- `POST /api/libraries/borrow` : Pengajuan peminjaman koleksi buku
- `GET /api/events` : Agenda event literasi dengan filter audiens & kategori
- `POST /api/events/:id/register` : Pendaftaran peserta event
- `GET /api/communities` : Direktori komunitas dan lapak baca
- `POST /api/communities/:id/join` : Gabung keanggotaan komunitas
- `GET /api/articles` : Daftar artikel ringkas "Baca 5 Menit"
- `GET /api/search` : Universal search lintas seluruh ekosistem
- `GET /api/user/dashboard` : Ringkasan dashboard pembaca & misi harian
- `GET /api/mitra/dashboard` : Statistik dan inventaris mitra
- `GET /api/admin/dashboard` : Metrik ekosistem dan grafik pertumbuhan
- `PUT /api/admin/mitra/:id/verify` : Verifikasi mitra pending (APPROVED/REJECTED)
- `GET /api/admin/literacy-stats` : Data statistik literasi per kecamatan Sidrap
