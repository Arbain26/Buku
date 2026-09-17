# 📖 MABBACA — Platform Ekosistem Literasi Masyarakat Sidrap
## Dokumentasi Arsitektur RESTful API & Database

> **Versi API**: 1.0.0  
> **Base URL**: `http://localhost:5000/api`  
> **Format Data**: JSON (`application/json`) / Multipart Form (`multipart/form-data`)  
> **Protokol Keamanan**: JSON Web Token (Bearer Auth), Helmet, CORS, Rate Limiting, RBAC, IDOR Protection.

---

## 📑 Daftar Isi
1. [Prinsip Arsitektur & Keamanan](#1-prinsip-arsitektur--keamanan)
2. [Format Respons Standar](#2-format-respons-standar)
3. [Format Penanganan Error](#3-format-penanganan-error)
4. [Role & Hak Akses (RBAC)](#4-role--hak-akses-rbac)
5. [Akun Demo Pengujian](#5-akun-demo-pengujian)
6. [Katalog Endpoint Lengkap](#6-katalog-endpoint-lengkap)
   - [Health & Diagnostik](#61-health--diagnostik)
   - [Authentication & User Profile](#62-authentication--user-profile)
   - [Buku & Katalog Literasi](#63-buku--katalog-literasi)
   - [Penulis & Kategori](#64-penulis--kategori)
   - [Toko Buku & Lokasi](#65-toko-buku--lokasi)
   - [Alur Transaksi Pemesanan (WhatsApp Flow)](#66-alur-transaksi-pemesanan-whatsapp-flow)
   - [Perpustakaan & Peminjaman (Stock Lock Transaction)](#67-perpustakaan--peminjaman-stock-lock-transaction)
   - [Komunitas Literasi & Keanggotaan](#68-komunitas-literasi--keanggotaan)
   - [Agenda Kegiatan & Pendaftaran Event](#69-agenda-kegiatan--pendaftaran-event)
   - [Artikel, Berita & Resensi](#610-artikel-berita--resensi)
   - [Ulasan & Rating (Reviews)](#611-ulasan--rating-reviews)
   - [Koleksi Favorit (Multi-Entity Bookmark)](#612-koleksi-favorit-multi-entity-bookmark)
   - [Pencarian Universal & Haversine Geolocation](#613-pencarian-universal--haversine-geolocation)
   - [Gamifikasi & Dasbor Pengguna](#614-gamifikasi--dasbor-pengguna)
   - [Dasbor Mitra (Real Data Agregasi)](#615-dasbor-mitra-real-data-agregasi)
   - [Dasbor Admin & Manajemen Sistem](#616-dasbor-admin--manajemen-sistem)
   - [Sistem Notifikasi](#617-sistem-notifikasi)
7. [Daftar Kode Status HTTP](#7-daftar-kode-status-http)

---

## 1. Prinsip Arsitektur & Keamanan

Backend MABBACA dibangun di atas prinsip arsitektur modular **Express + Service Layer + Prisma ORM + MySQL 8.0**:
- **Tidak Bergantung pada State Frontend**: Perhitungan total harga, validasi ketersediaan kuota, dan sisa stok fisik wajib dihitung dan dikunci oleh transaksi database backend (`prisma.$transaction`).
- **Pencegahan IDOR (Insecure Direct Object References)**: Setiap aksi pembaruan atau penghapusan data partner diperiksa kepemilikannya (`ownershipMiddleware.js`). User atau mitra lain dilarang memanipulasi entitas milik mitra berbeda.
- **Validasi Input Ketat**: Menggunakan `express-validator` di setiap endpoint masukan. Masukan yang melanggar validasi menghasilkan status HTTP `422 Unprocessable Entity`.
- **Proteksi Brute-Force & DDoS**: Rate limiting diterapkan secara global (100 req / 15 menit) dan khusus auth (10 req / 15 menit).
- **Integritas Relasional MySQL**: 28 model data berelasi dengan foreign key constraints, unique compound indices, dan cascading rules yang tepat.

---

## 2. Format Respons Standar

### Respons Sukses Single Data / Aksi:
```json
{
  "success": true,
  "message": "Data berhasil dimuat.",
  "data": {
    "id": 1,
    "title": "Filosofi Teras"
  }
}
```

### Respons Sukses Koleksi dengan Paginasi:
```json
{
  "success": true,
  "message": "Daftar buku berhasil dimuat.",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

## 3. Format Penanganan Error

### Error Validasi Input (`422 Unprocessable Entity`):
```json
{
  "success": false,
  "message": "Validasi gagal. Mohon periksa kembali input Anda.",
  "errors": [
    {
      "field": "email",
      "message": "Format email tidak valid."
    }
  ]
}
```

### Error Autentikasi / Otorisasi (`401 Unauthorized` / `403 Forbidden`):
```json
{
  "success": false,
  "message": "Akses ditolak. Token autentikasi tidak valid atau telah kedaluwarsa."
}
```

### Error Konflik Duplikasi (`409 Conflict`):
```json
{
  "success": false,
  "message": "Anda sudah terdaftar sebagai peserta dalam kegiatan ini."
}
```

---

## 4. Role & Hak Akses (RBAC)

| Role | Mitra Type | Hak Akses Utama |
|---|---|---|
| **`USER`** | - | Melihat katalog buku, mencari lokasi toko/perpus terdekat, memesan buku via WhatsApp, meminjam buku fisik, mendaftar event, bergabung komunitas, menulis review, klaim misi literasi, mengumpulkan poin. |
| **`MITRA`** | `TOKO_BUKU` | Mengelola etalase toko, menginput stok dan harga buku, menerima dan mengupdate status pesanan. |
| **`MITRA`** | `PERPUSTAKAAN` | Mengelola katalog koleksi fisik, verifikasi peminjaman (approve/reject/return) dengan auto update stok fisik. |
| **`MITRA`** | `KOMUNITAS` | Mengelola profil komunitas, mempublikasikan agenda kegiatan literasi (event), mengelola anggota. |
| **`ADMIN`** | - | Akses penuh dashboard sistem, verifikasi mitra pendaftar (`PENDING` -> `APPROVED`/`REJECTED`), manajemen user, statistik literasi per kecamatan Sidrap. |

> **Catatan Persetujuan Mitra**: Mitra yang baru mendaftar memiliki status `PENDING`. Mitra `PENDING` tidak dapat mempublikasikan barang/koleksi hingga diverifikasi oleh Admin.

---

## 5. Akun Demo Pengujian

| Role | Tipe Mitra / Peran | Email | Password |
|---|---|---|---|
| **Admin** | Administrator Sistem | `admin@mabbaca.id` | `admin123` |
| **Mitra** | Toko Buku (Toko Buku Sidrap Mandiri) | `toko@mabbaca.id` | `mitra123` |
| **Mitra** | Perpustakaan (Perpusda Sidrap) | `perpus@mabbaca.id` | `mitra123` |
| **Mitra** | Komunitas (Komunitas Sidrap Membaca) | `komunitas@mabbaca.id` | `mitra123` |
| **User** | Pembaca / Warga Sidrap | `user@mabbaca.id` | `user123` |

---

## 6. Katalog Endpoint Lengkap

### 6.1. Health & Diagnostik
- **`GET /api/health`**
  - **Deskripsi**: Memeriksa ketersediaan server dan konektivitas live ke database MySQL.
  - **Auth**: Bebas (Publik).
  - **Respons**: `{ success: true, message: "MABBACA API berjalan normal.", database: "Connected (MySQL)" }`

---

### 6.2. Authentication & User Profile
- **`POST /api/auth/register`**
  - **Deskripsi**: Registrasi akun warga/pembaca baru (`role: USER`).
  - **Body**: `{ name, email, password, phone?, address?, districtId? }`
- **`POST /api/auth/register-mitra`**
  - **Deskripsi**: Pendaftaran akun mitra ekosistem (`role: MITRA`, status awal: `PENDING`).
  - **Body**: `{ name, email, password, phone, organizationName, mitraType, address, districtId, latitude?, longitude?, description? }`
- **`POST /api/auth/login`**
  - **Deskripsi**: Autentikasi akun, mengembalikan JWT Bearer token & profil.
  - **Body**: `{ email, password }`
- **`GET /api/auth/me`**
  - **Deskripsi**: Mengambil data profil akun yang sedang login beserta role dan profil mitra (jika ada).
  - **Headers**: `Authorization: Bearer <token>`
- **`PUT /api/auth/profile`**
  - **Deskripsi**: Memperbarui nama, telepon, bio, alamat, dan foto avatar profil.
  - **Content-Type**: `multipart/form-data`
  - **Body**: `name, phone, address, bio, avatar (file)`
- **`PUT /api/auth/change-password`**
  - **Deskripsi**: Mengganti password akun dengan verifikasi password lama.
  - **Body**: `{ currentPassword, newPassword }`

---

### 6.3. Buku & Katalog Literasi
- **`GET /api/books`**
  - **Query Params**: `page, limit, search, categoryId, authorId, sortBy, order`
  - **Deskripsi**: Daftar katalog buku teragregasi dengan rating rata-rata, jumlah resensi, dan ketersediaan di toko/perpustakaan Sidrap.
- **`GET /api/books/:id`**
  - **Deskripsi**: Detail lengkap buku beserta riwayat resensi pengguna, daftar toko penjual beserta stok dan harga, serta perpustakaan penyedia peminjaman.
- **`POST /api/books`**
  - **Auth**: `ADMIN` atau `MITRA` (Approved).
  - **Body**: `title, isbn, synopsis, publisher, publicationYear, pageCount, coverImage, authorIds, categoryIds`
- **`PUT /api/books/:id`**
  - **Auth**: `ADMIN` atau Mitra pemilik.
- **`DELETE /api/books/:id`**
  - **Auth**: `ADMIN`.

---

### 6.4. Penulis & Kategori
- **`GET /api/authors`**: Daftar penulis literasi.
- **`GET /api/authors/:id`**: Profil penulis beserta karya buku yang terdaftar.
- **`GET /api/categories`**: Daftar kategori literasi (Fiksi, Sains, Sejarah Bugis-Makassar, Pertanian Modern, dll).

---

### 6.5. Toko Buku & Lokasi
- **`GET /api/stores`**
  - **Query Params**: `districtId, search, userLat, userLng`
  - **Deskripsi**: Daftar toko buku mitra di Kabupaten Sidrap. Jika koordinat `userLat` & `userLng` diberikan, jarak toko dihitung otomatis secara akurat via Haversine Formula dalam satuan kilometer.
- **`GET /api/stores/:id`**
  - **Deskripsi**: Detail toko buku mitra beserta daftar produk buku, harga, dan stok yang tersedia.
- **`POST /api/stores/:id/products`**
  - **Auth**: Mitra Toko Pemilik.
  - **Body**: `{ bookId, price, stock, condition }`

---

### 6.6. Alur Transaksi Pemesanan (WhatsApp Flow)
- **`POST /api/orders`**
  - **Deskripsi**: Membuat draft pesanan buku. Harga tidak diambil dari frontend melainkan dikalkulasikan secara aman di server dari tabel `StoreProduct`. Menghasilkan tautan langsung WhatsApp (`wa.me`) dengan template pesan otomatis yang memuat nomor pesanan dan rincian buku.
  - **Body**: `{ storeId, items: [{ storeProductId, quantity }], customerName, customerPhone, deliveryAddress?, notes? }`
  - **Respons**:
    ```json
    {
      "success": true,
      "message": "Pesanan berhasil dibuat. Silakan konfirmasi via WhatsApp.",
      "data": {
        "order": {
          "id": 1,
          "orderNumber": "ORD-20260911-5836",
          "totalAmount": 95000,
          "status": "PENDING"
        },
        "whatsappUrl": "https://wa.me/6281234567890?text=Halo%20Toko%20Buku..."
      }
    }
    ```
- **`POST /api/orders/:id/contact-whatsapp`**
  - **Deskripsi**: Menandai pesanan telah di-follow up oleh pembeli ke nomor WhatsApp toko (`status: CONTACTED`).
- **`GET /api/orders`**
  - **Auth**: User (pesanan milik sendiri) atau Mitra (pesanan yang masuk ke tokonya).
- **`PUT /api/orders/:id/status`**
  - **Auth**: Mitra Toko Pemilik.
  - **Body**: `{ status: "PROCESSING" | "COMPLETED" | "CANCELLED" }`

---

### 6.7. Perpustakaan & Peminjaman (Stock Lock Transaction)
- **`GET /api/libraries`**
  - **Deskripsi**: Daftar perpustakaan daerah, perpustakaan desa, dan taman baca di 11 kecamatan Sidrap.
- **`GET /api/libraries/:id`**
  - **Deskripsi**: Detail perpustakaan beserta inventaris koleksi buku yang tersedia untuk dipinjam.
- **`POST /api/borrowings`** (atau `POST /api/libraries/borrow`)
  - **Deskripsi**: Transaksi permohonan pinjam buku fisik. Dieksekusi dalam `prisma.$transaction`. Memeriksa ketersediaan `availableCopies > 0` dan mengunci/mengurangi stok fisik secara atomik untuk mencegah *race condition*.
  - **Auth**: `USER` terdaftar.
  - **Body**: `{ libraryId, bookId, notes? }`
- **`GET /api/borrowings`**
  - **Deskripsi**: Riwayat peminjaman buku oleh pengguna atau pemantauan peminjaman aktif oleh mitra perpus.
- **`PUT /api/borrowings/:id/approve`**
  - **Auth**: Mitra Pengelola Perpustakaan.
- **`PUT /api/borrowings/:id/reject`**
  - **Auth**: Mitra Pengelola Perpustakaan. Mengembalikan stok buku yang sempat dipesan.
- **`PUT /api/borrowings/:id/return`**
  - **Deskripsi**: Pengembalian buku fisik. Menambah kembali `availableCopies` secara atomik dan mencatat tanggal pengembalian aktual.
  - **Auth**: Mitra Pengelola Perpustakaan.

---

### 6.8. Komunitas Literasi & Keanggotaan
- **`GET /api/communities`**: Daftar komunitas baca dan pegiat literasi Sidrap.
- **`GET /api/communities/:id`**: Detail komunitas, visi misi, daftar agenda event, dan daftar anggota.
- **`POST /api/communities/:id/join`**
  - **Deskripsi**: Bergabung atau keluar (toggle) dari komunitas literasi. Pengguna yang pertama kali bergabung mendapatkan reward +10 Poin Literasi MABBACA.
  - **Auth**: `USER`.

---

### 6.9. Agenda Kegiatan & Pendaftaran Event
- **`GET /api/events`**: Daftar kegiatan workshop, bedah buku, festival literasi, dan lapak baca.
- **`GET /api/events/:id`**: Detail agenda event beserta kuota tersisa dan status pendaftaran user saat ini.
- **`POST /api/events/:id/register`**
  - **Deskripsi**: Pendaftaran peserta kegiatan. Dilindungi oleh validasi batas kuota dan constraint unik ganda (mencegah pendaftaran ganda). Memberikan reward +25 Poin Literasi.
  - **Auth**: `USER`.
- **`DELETE /api/events/:id/register`**: Pembatalan partisipasi kegiatan.

---

### 6.10. Artikel, Berita & Resensi
- **`GET /api/articles`**: Daftar artikel edukasi, liputan kegiatan, dan esai literasi lokal.
- **`GET /api/articles/:id`**: Detail artikel lengkap beserta nama penulis dan kategori artikel.
- **`POST /api/articles`**: Publikasi artikel baru oleh Admin, Komunitas, atau Sekolah mitra.

---

### 6.11. Ulasan & Rating (Reviews)
- **`GET /api/reviews/books/:bookId`**: Mengambil daftar resensi dan rating untuk sebuah buku.
- **`POST /api/reviews/books/:bookId`**
  - **Deskripsi**: Mengirimkan ulasan dan skor rating (1-5). Satu akun dibatasi maksimal 1 resensi per buku (unique constraint). Memberikan reward +10 Poin Literasi.
  - **Body**: `{ rating, comment }`

---

### 6.12. Koleksi Favorit (Multi-Entity Bookmark)
- **`GET /api/favorites`**: Mengambil seluruh bookmark favorit pengguna yang dikelompokkan berdasarkan kategori (Buku, Toko, Perpustakaan, Komunitas, Event, Artikel).
- **`POST /api/favorites/books/:id`**: Toggle bookmark buku favorit.
- **`POST /api/favorites/stores/:id`**: Toggle bookmark toko buku favorit.
- **`POST /api/favorites/libraries/:id`**: Toggle bookmark perpustakaan favorit.
- **`POST /api/favorites/communities/:id`**: Toggle bookmark komunitas favorit.
- **`POST /api/favorites/events/:id`**: Toggle bookmark agenda kegiatan favorit.
- **`POST /api/favorites/articles/:id`**: Toggle bookmark artikel favorit.

---

### 6.13. Pencarian Universal & Haversine Geolocation
- **`GET /api/search`**
  - **Query Params**: `q` (kata kunci), `type` (`all`, `book`, `store`, `library`, `community`, `event`, `article`), `limit`
  - **Deskripsi**: Pencarian universal terpadu yang memindai lintas 6 entitas ekosistem MABBACA sekaligus.
- **`GET /api/locations`**: Daftar 11 kecamatan di Kabupaten Sidenreng Rappang.
- **`GET /api/locations/nearby`**
  - **Query Params**: `lat, lng, radius` (default: 25 km)
  - **Deskripsi**: Mengembalikan daftar toko buku dan perpustakaan terdekat dari titik lokasi pengguna berdasarkan kalkulasi matematika koordinat bumi (Haversine).

---

### 6.14. Gamifikasi & Dasbor Pengguna
- **`GET /api/user/dashboard`**
  - **Deskripsi**: Menampilkan profil gamifikasi pembaca: akumulasi poin literasi, level pembaca (Pemula, Pembaca Aktif, Pembaca Setia, Penjelajah Literasi, Pendekar Buku Sidrap), lencana penghargaan (badges), riwayat aktivitas, daftar peminjaman aktif, dan status misi literasi harian.
- **`GET /api/gamification/leaderboard`**: Peringkat 10 besar pegiat literasi Sidrap dengan poin tertinggi.
- **`GET /api/gamification/missions`**: Daftar misi literasi aktif yang dapat diselesaikan.
- **`POST /api/user/missions/:id/complete`**: Klaim hadiah poin dari misi literasi yang telah diselesaikan.

---

### 6.15. Dasbor Mitra (Real Data Agregasi)
- **`GET /api/mitra/dashboard`**
  - **Deskripsi**: Ringkasan performa mitra yang dihitung langsung dari data riil database MySQL:
    - Jika `mitraType == TOKO_BUKU`: Total produk, total stok buku, jumlah pesanan masuk, omset/nilai penjualan.
    - Jika `mitraType == PERPUSTAKAAN`: Total judul koleksi, total eksemplar fisik, peminjaman aktif, peminjaman selesai.
    - Jika `mitraType == KOMUNITAS`: Jumlah anggota aktif, total event yang diselenggarakan, total peserta terdaftar.
- **`GET /api/mitra/inventory`**: Mengambil daftar inventaris buku toko/perpustakaan mitra.
- **`POST /api/mitra/inventory`**: Menambahkan koleksi atau produk buku baru.
- **`PUT /api/mitra/inventory/:id`**: Memperbarui harga atau stok buku.
- **`DELETE /api/mitra/inventory/:id`**: Menghapus buku dari etalase mitra.

---

### 6.16. Dasbor Admin & Manajemen Sistem
- **`GET /api/admin/dashboard`**
  - **Deskripsi**: Metrik agregat seluruh ekosistem: total user, pembagian role, total mitra terverifikasi vs pending, total buku, total transaksi pesanan, total peminjaman aktif, dan distribusi aktivitas per kecamatan.
- **`GET /api/admin/pending-mitra`**: Daftar pengajuan pendaftaran mitra yang menunggu verifikasi.
- **`PUT /api/admin/mitra/:id/verify`**
  - **Deskripsi**: Menyetujui atau menolak pendaftaran mitra.
  - **Body**: `{ status: "APPROVED" | "REJECTED", notes? }`
- **`GET /api/admin/literacy-stats`**: Data persebaran fasilitas literasi per 11 kecamatan di Kabupaten Sidrap.
- **`GET /api/admin/users`**: Manajemen daftar seluruh akun pengguna dengan filter role dan status.

---

### 6.17. Sistem Notifikasi
- **`GET /api/notifications`**: Daftar notifikasi aktivitas pengguna (pemberitahuan status pesanan, pengingat pengembalian buku, event baru, persetujuan mitra).
- **`PUT /api/notifications/:id/read`**: Menandai satu notifikasi telah dibaca.
- **`PUT /api/notifications/read-all`**: Menandai seluruh notifikasi telah dibaca.

---

## 7. Daftar Kode Status HTTP

| Kode HTTP | Makna | Kondisi Penggunaan |
|---|---|---|
| **`200 OK`** | Berhasil | Operasi baca (`GET`), pembaruan (`PUT`), atau aksi toggle berhasil. |
| **`201 Created`** | Dibuat | Entitas baru berhasil dibuat di database (`POST`). |
| **`400 Bad Request`** | Permintaan Salah | Parameter query atau format data tidak valid. |
| **`401 Unauthorized`** | Tidak Terautentikasi | Header token JWT tidak ada, salah format, atau telah kedaluwarsa. |
| **`403 Forbidden`** | Akses Ditolang | Role pengguna tidak memiliki izin (misal: `USER` mengakses endpoint `ADMIN`). |
| **`404 Not Found`** | Tidak Ditemukan | Data buku, toko, perpus, atau user dengan ID tersebut tidak ditemukan. |
| **`409 Conflict`** | Konflik Data | Pelanggaran constraint unik (misal: email sudah dipakai, user sudah daftar event, buku sudah direview). |
| **`422 Unprocessable`** | Validasi Gagal | Data masukan tidak memenuhi aturan validasi (misal: format email salah, rating di luar 1-5). |
| **`429 Too Many Requests`**| Batas Akses Terlampaui | Melebihi ambang batas rate limiting (proteksi brute force). |
| **`500 Server Error`** | Kesalahan Internal | Terjadi kegagalan server yang tidak tertangani. |

---

*Dokumen ini dirancang sebagai standar integrasi kontrak API untuk frontend MABBACA.*
