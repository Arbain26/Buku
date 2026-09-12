# 🔒 CHECKLIST KEAMANAN SISTEM (SECURITY AUDIT) — MABBACA
## Pemetaan Standar OWASP Top 10 & Hardening Produksi

> **Aplikasi**: MABBACA — Platform Ekosistem Literasi Masyarakat Sidrap  
> **Status Audit**: ✅ **LULUS 100% (ZERO CRITICAL VULNERABILITY)**  
> **Tanggal Audit**: 12 September 2026  

---

## 1. Ringkasan Kepatuhan OWASP Top 10

| Kode OWASP | Kategori Kerentanan | Status | Mekanisme Proteksi MABBACA | Berkas Sumber Implementasi |
| :---: | :--- | :---: | :--- | :--- |
| **A01:2021** | **Broken Access Control & IDOR** | ✅ AMAN | • RBAC (`ADMIN`, `MITRA`, `USER`)<br>• Validasi status aktif akun (`!isActive` / `deletedAt`)<br>• Ownership check pada Order & Borrowing Mitra<br>• Nested resource ownership validation (`storeId` vs `productId`, `libraryId` vs `collectionId`) | • `authMiddleware.js`<br>• `order.service.js`<br>• `borrowing.service.js`<br>• `mitraController.js`<br>• `storeController.js`<br>• `libraryController.js` |
| **A02:2021** | **Cryptographic Failures** | ✅ AMAN | • Hashing password dengan `bcryptjs` (Salt factor 10)<br>• JWT ditandatangani HMAC-SHA256 dengan secret acak berentropi tinggi<br>• Password tidak pernah disertakan dalam payload respons (`select: { password: false }`) | • `auth.service.js`<br>• `user.service.js`<br>• `server/.env` |
| **A03:2021** | **Injection (SQLi & XSS)** | ✅ AMAN | • 100% kueri database menggunakan Prisma ORM Parameterized Query<br>• Input dibersihkan dan divalidasi via Express body parser<br>• React JSX secara otomatis melakukan HTML entity escaping untuk mencegah XSS | • Seluruh file `service.js`<br>• `prisma/schema.prisma`<br>• `client/src/` |
| **A04:2021** | **Insecure Design** | ✅ AMAN | • Transaksi basis data atomik (`prisma.$transaction`) pada alur peminjaman buku perpustakaan untuk mencegah *race condition* dan *over-borrowing*<br>• Poin gamifikasi terkontrol melalui event terisolasi | • `borrowing.service.js`<br>• `user.service.js` |
| **A05:2021** | **Security Misconfiguration** | ✅ AMAN | • HTTP Security Headers diaktifkan via `helmet`<br>• CORS dikonfigurasi eksplisit (`CLIENT_URL`)<br>• Stack trace error disembunyikan di mode produksi (`process.env.NODE_ENV === 'production'`) | • `server/src/index.js`<br>• `errorMiddleware.js` |
| **A06:2021** | **Vulnerable & Outdated Components** | ✅ AMAN | • Seluruh dependensi npm diperiksa dan bebas kerentanan kritis (`npm audit`)<br>• Framework modern: React 19, Express 4.19, Prisma 5.10 | • `package.json`<br>• `package-lock.json` |
| **A07:2021** | **Identification & Auth Failures** | ✅ AMAN | • Rate Limiting pada endpoint `/api/auth/login` (Maksimal 5 percobaan per 15 menit)<br>• Token JWT memiliki masa kedaluwarsa terbatas (`7d`)<br>• Peringatan kegagalan login umum tanpa enumerasi akun yang berlebihan | • `rateLimiter.js`<br>• `authController.js` |
| **A08:2021** | **Software & Data Integrity Failures** | ✅ AMAN | • Verifikasi berkas upload via MIME-type (`image/jpeg`, `image/png`, `image/webp`)<br>• Nama berkas di-hash acak (`crypto.randomBytes`) untuk mencegah path traversal dan eksekusi skrip berbahaya | • `uploadMiddleware.js` |
| **A09:2021** | **Security Logging & Monitoring** | ✅ AMAN | • Logging permohonan HTTP via `morgan`<br>• Log error terpusat mencatat pesan kesalahan sistem tanpa mengekspos data sensitif ke pengguna | • `server/src/index.js`<br>• `errorMiddleware.js` |
| **A10:2021** | **Server-Side Request Forgery (SSRF)** | ✅ AMAN | • Server backend tidak melakukan permohonan HTTP keluar ke URL sembarang berdasarkan masukan pengguna yang tidak terverifikasi | • Arsitektur API terisolasi |

---

## 2. Checklist Detail Keamanan Pra-Produksi

### A. Autentikasi & Otorisasi
- [x] Password disimpan dalam format hash kriptografis `bcrypt` dengan cost factor 10.
- [x] Token JWT ditandatangani dengan kunci rahasia berkekuatan tinggi.
- [x] Masa berlaku token kedaluwarsa secara terjadwal (`7d`).
- [x] Middleware memverifikasi keberadaan user di basis data pada setiap request terotentikasi.
- [x] Akun yang dinonaktifkan (`isActive === false`) otomatis ditolak seketika (HTTP 401).
- [x] Akun yang dihapus (*soft-deleted*, `deletedAt !== null`) otomatis ditolak seketika (HTTP 401).
- [x] Role-Based Access Control (RBAC) diterapkan konsisten untuk `ADMIN`, `MITRA`, dan `USER`.
- [x] Mitra berstatus `PENDING` atau `REJECTED` dibatasi hanya bisa melihat profil dan dilarang mengelola inventaris.

### B. Proteksi Objek & Data (IDOR Prevention)
- [x] Endpoint `GET /api/orders/:id` memverifikasi bahwa pemohon adalah pemilik order (User pemesan) atau Mitra pemilik toko yang bersangkutan.
- [x] Endpoint `GET /api/borrowings/:id` memverifikasi bahwa pemohon adalah peminjam atau Mitra pengelola perpustakaan.
- [x] Endpoint pembaruan/penghapusan produk toko memvalidasi relasi kepemilikan `:productId` terhadap `:storeId`.
- [x] Endpoint pembaruan/penghapusan koleksi buku perpustakaan memvalidasi relasi kepemilikan `:collectionId` terhadap `:libraryId`.
- [x] Mutasi inventaris pada `mitraController` memastikan entitas toko/perpustakaan adalah milik profil mitra yang sedang aktif.

### C. Proteksi Jaringan & Header HTTP
- [x] Middleware `helmet` aktif dan menyuntikkan header proteksi browser.
- [x] `X-Content-Type-Options: nosniff` aktif untuk mencegah MIME sniffing.
- [x] `X-Frame-Options: SAMEORIGIN` aktif untuk mencegah serangan clickjacking.
- [x] CORS dikonfigurasi dengan origin spesifik pada lingkungan produksi.
- [x] Rate Limiting global aktif (`100 req / 15 menit`).
- [x] Rate Limiting autentikasi login aktif (`5 req / 15 menit`).

### D. Penanganan Berkas & Unggahan
- [x] Ukuran berkas dibatasi maksimal 5 MB per berkas.
- [x] Filter ekstensi dan MIME type ketat hanya mengizinkan citra (`jpeg`, `png`, `webp`).
- [x] Penamaan berkas menggunakan generator string acak berbasis waktu dan hash kriptografi, menghilangkan nama berkas asli dari pengguna.
- [x] Direktori `uploads` tidak mengizinkan eksekusi skrip (disajikan statis via Express / Nginx).

### E. Penanganan Error & Kebocoran Informasi
- [x] Stack trace error disembunyikan ketika `NODE_ENV === 'production'`.
- [x] Pesan error ke klien bersifat informatif tanpa membocorkan struktur tabel basis data atau query internal.
- [x] Field kata sandi dikeluarkan dari seluruh respons JSON menggunakan klausa Prisma `select` / restructuring data.

---

## 3. Kesimpulan Verifikasi

Seluruh poin dalam daftar periksa keamanan telah diverifikasi secara fungsional melalui rangkaian uji terotomasi dan audit kode statis. Tidak ditemukan kerentanan kritis (*zero critical vulnerability*), dan arsitektur platform **MABBACA** dinyatakan **AMAN DAN MEMENUHI STANDAR PRODUKSI**.
