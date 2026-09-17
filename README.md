# 📚 MABBACA — Platform Ekosistem Literasi Digital Terpadu Kabupaten Sidrap

<div align="center">

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](#-arsitektur-teknologi--stack)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](#-arsitektur-teknologi--stack)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express.js-339933?logo=node.js&logoColor=white)](#-arsitektur-teknologi--stack)
[![Prisma](https://img.shields.io/badge/ORM-Prisma%20Relational-2D3748?logo=prisma&logoColor=white)](#-arsitektur-teknologi--stack)
[![MySQL](https://img.shields.io/badge/Database-MySQL%20%2F%20MariaDB-4479A1?logo=mysql&logoColor=white)](#-arsitektur-teknologi--stack)
[![JWT](https://img.shields.io/badge/Security-JWT%20%26%20RBAC-FF6C37?logo=jsonwebtokens&logoColor=white)](#-keunggulan-utama-platform)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready%20%E2%9C%85-075E54)](#-kesiapan-produksi--audit)

**"Temukan Literasi di Sekitarmu."**  
*Pilar: Cari. Baca. Belajar. Berbagi.*

</div>

---

## 📖 Tentang MABBACA

**MABBACA** (berakar dari kata bahasa Bugis yang berarti *"Membaca"*) adalah platform ekosistem literasi digital terpadu berbasis web yang dirancang khusus untuk masyarakat **Kabupaten Sidenreng Rappang (Sidrap), Sulawesi Selatan**. 

Platform ini hadir sebagai solusi konkret atas fragmentasi informasi literasi di daerah. MABBACA memadukan konsep **Marketplace Lokal + Direktori Perpustakaan + Wadah Komunitas + Kalender Event + Konten Literasi Kilat (Baca 5 Menit)** dalam satu pintu terintegrasi. 

Dengan MABBACA, masyarakat Sidrap dapat dengan mudah menemukan buku fisik yang dicari, mengetahui toko buku terdekat yang menyediakannya, meminjam buku fisik di perpustakaan daerah maupun desa/POCADI, bergabung dengan lapak baca jalanan, mengikuti seminar/bedah buku, hingga membaca artikel edukatif harian guna meningkatkan Indeks Pembangunan Literasi Masyarakat (IPLM).

---

## 📑 Daftar Isi

1. [Keunggulan Utama Platform](#-keunggulan-utama-platform)
2. [Arsitektur Tiga Role Pengguna](#-arsitektur-tiga-role-pengguna)
3. [Penjelasan Seluruh Tampilan Halaman Pengguna (Public & User Views)](#-penjelasan-seluruh-tampilan-halaman-pengguna)
   - [1. Halaman Beranda (Homepage)](#1-halaman-beranda-homepage)
   - [2. Halaman Katalog Buku & Detail Buku](#2-halaman-katalog-buku--detail-buku)
   - [3. Halaman Direktori Toko Buku & Detail Toko](#3-halaman-direktori-toko-buku--detail-toko)
   - [4. Halaman Direktori Perpustakaan & Detail Perpustakaan](#4-halaman-direktori-perpustakaan--detail-perpustakaan)
   - [5. Halaman Komunitas Literasi & Detail Komunitas](#5-halaman-komunitas-literasi--detail-komunitas)
   - [6. Halaman Agenda Kegiatan / Event & Detail Event](#6-halaman-agenda-kegiatan--event--detail-event)
   - [7. Halaman Baca 5 Menit (Artikel Literasi) & Detail Artikel](#7-halaman-baca-5-menit-artikel-literasi--detail-artikel)
   - [8. Halaman Pencarian Universal Satu Pintu (/search)](#8-halaman-pencarian-universal-satu-pintu-search)
   - [9. Halaman Kemitraan (/mitra) & Tentang Kami (/about)](#9-halaman-kemitraan-mitra--tentang-kami-about)
   - [10. Halaman Autentikasi & Profil Akun](#10-halaman-autentikasi--profil-akun)
4. [Penjelasan Mendalam Tampilan Seluruh Dashboard](#-penjelasan-mendalam-tampilan-seluruh-dashboard)
   - [A. Dashboard Warga Pembaca (/dashboard)](#a-dashboard-warga-pembaca-dashboard)
   - [B. Dashboard Mitra Literasi (/mitra/dashboard)](#b-dashboard-mitra-literasi-mitradashboard)
   - [C. Dashboard Administrator Platform (/admin/dashboard)](#c-dashboard-administrator-platform-admindashboard)
5. [Arsitektur Teknologi & Stack](#-arsitektur-teknologi--stack)
6. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
7. [Akun Demo Pengujian](#-akun-demo-pengujian)
8. [Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)
9. [Daftar Endpoint REST API](#-daftar-endpoint-rest-api)

---

## 🌟 Keunggulan Utama Platform

MABBACA dikembangkan bukan sekadar sebagai katalog buku statis, melainkan sebuah platform ekosistem sosial-ekonomi yang memiliki serangkaian keunggulan kompetitif dan nilai guna tinggi:

### 1. Ekosistem Literasi Terpadu Multi-Entitas (All-in-One)
Umumnya platform literasi terpisah antara toko buku komersial, OPAC perpustakaan pemerintah, dan media sosial komunitas. MABBACA menyatukan kelimanya dalam satu ekosistem:
- Katalog Buku Terpusat.
- Toko Buku Lokal (Penyedia Komersial).
- Perpustakaan Daerah, Perpustakaan Desa, dan POCADI (Penyedia Koleksi Gratis).
- Komunitas Literasi & Lapak Baca Jalanan.
- Agenda Event & Konten Artikel Edukatif.

### 2. Fitur Transaksi Cerdas: Direct WhatsApp Checkout
Masyarakat lokal di daerah lebih nyaman bertransaksi langsung secara personal tanpa hambatan administrasi (*zero friction*):
- Sistem secara otomatis merangkum judul buku, pengarang, harga resmi, nama toko penyedia, dan nomor pesanan unik (`#ORD-YYYYMMDD-XXXX`).
- Tombol **"Pesan via WhatsApp"** langsung membuka aplikasi WhatsApp dan menyusun draf pesan pemesanan yang siap dikirimkan ke nomor pengelola toko buku terkait dalam satu klik.
- Transaksi tercatat rapi pada log pesanan dashboard user dan dashboard mitra toko buku.

### 3. Mesin Ketersediaan Ganda (*Dual Availability Engine*)
Setiap buku fisik yang dicari menampilkan status ketersediaan di dua pilar:
- **Pilihan Beli**: Menampilkan toko-toko buku lokal yang menjual stok fisik buku tersebut beserta harga dan jarak.
- **Pilihan Pinjam**: Menampilkan perpustakaan daerah atau desa yang memiliki eksemplar buku tersebut, lengkap dengan nomor panggil (*call number*), letak rak, dan tombol **"Pinjam Sekarang"** secara daring.

### 4. Peminjaman Buku Daring dengan Penguncian Stok (*Stock-Lock Concurrency*)
- Warga pembaca dapat mengajukan permohonan pinjam buku perpustakaan langsung dari aplikasi.
- Sistem database menerapkan transaksi atomik (`prisma.$transaction`) untuk mengunci dan mengurangi kuantitas stok buku yang tersedia (`availableQuantity`), mencegah *race condition* atau peminjaman ganda saat buku fisik terbatas.
- Petugas perpustakaan cukup melakukan verifikasi *approval* atau *reject* di dashboard mitra perpustakaan.

### 5. Kalkulasi Geospasial Presisi (Formula Haversine)
- Menghitung jarak lengkung bumi akurat (dalam satuan kilometer) antara lokasi pembaca (atau titik pusat Pangkajene Sidrap) ke lokasi toko buku, perpustakaan, atau titik kumpul komunitas terdekat.
- Membantu warga menemukan titik literasi fisik terdekat dari tempat tinggalnya dengan *badge* jarak visual (misal: `1.2 km dari Anda`).

### 6. Gamifikasi Pembaca & Misi Harian (*Reader Gamification Engine*)
Untuk menumbuhkan kebiasaan membaca yang konsisten (*reading habit*), MABBACA menerapkan sistem penghargaan interaktif:
- **Tingkatan Level Pembaca**: *Pembaca Pemula* ➔ *Sahabat Buku* ➔ *Penggerak Literasi* ➔ *Inspirator Literasi*.
- **Poin Literasi (XP)**: Didapatkan dari menyelesaikan misi harian, membaca artikel 5 menit, menulis ulasan buku, menghadiri event, dan meminjam buku.
- **Misi Harian**: Daftar tantangan literasi yang diperbarui secara dinamis dengan reward poin instan.
- **Leaderboard Kabupaten**: Papan peringkat pembaca paling aktif se-Kabupaten Sidrap untuk memacu kompetisi positif.

### 7. Dashboard Adaptif Berdasarkan Peran Mitra (*Adaptive Multi-Role Dashboard*)
Satu portal dashboard mitra (`/mitra/dashboard`) mampu bertransformasi secara dinamis menyesuaikan tipe mitra yang masuk:
- **Toko Buku**: Menampilkan grafik omset/penjualan, produk terlaris, inventaris buku & harga, serta pesanan masuk WhatsApp.
- **Perpustakaan**: Menampilkan sirkulasi peminjaman, permohonan pinjam aktif, manajemen nomor panggil (*call number*), rak buku, dan stok eksemplar.
- **Komunitas**: Menampilkan manajemen relawan, anggota aktif, dan publikasi agenda kegiatan/lapak baca.

### 8. Pusat Kendali Wilayah untuk Administrator (*Government & Literacy Monitoring*)
- Dashboard Admin memetakan data literasi riil di seluruh kecamatan Kabupaten Sidrap (Pangkajene, Maritengngae, Baranti, Watang Pulu, Tellu Limpoe, Dua Pitue, Panca Rijang, Kulo, dll.).
- Memvisualisasikan rasio fasilitas literasi per kecamatan dalam bentuk grafik batang interaktif (Recharts).
- Sistem verifikasi bertingkat untuk menyetujui (*approve*) atau menolak (*reject*) pendaftaran mitra baru guna menjaga validitas data di lapangan.

### 9. Performa Tinggi, Responsif, & Keamanan Berlapis
- **Code Splitting Dinamis**: Entry bundle JavaScript dioptimalkan hingga berkurang 63% (dari 1.118 kB menjadi 415 kB) untuk pemuatan super cepat di jaringan mobile daerah.
- **100% Responsif**: Diuji pada Desktop (1366x768), Tablet iPad (768x1024), dan Layar Ponsel (390x844) dengan *zero horizontal overflow*.
- **Keamanan Enterprise**: Autentikasi JWT dengan HMAC-SHA256, proteksi IDOR pada resource bersarang, pencegahan injeksi SQL 100% via Prisma ORM, Helmet HTTP security headers, dan Express Rate Limiting.

---

## 👥 Arsitektur Tiga Role Pengguna

MABBACA mengimplementasikan kontrol akses berbasis peran (*Role-Based Access Control / RBAC*) dengan 3 tingkatan pengguna:

```mermaid
graph TD
    A[MABBACA Platform] --> B[USER / Warga Pembaca]
    A --> C[MITRA / Penyedia Literasi]
    A --> D[ADMIN / Pengelola Sistem]
    
    C --> C1[Toko Buku Fisik]
    C --> C2[Perpustakaan Daerah & Desa]
    C --> C3[Komunitas & Lapak Baca]
    
    B --> B1[Cari & Beli Buku via WA]
    B --> B2[Pinjam Buku Perpustakaan]
    B --> B3[Ikuti Event & Komunitas]
    B --> B4[Baca 5 Menit & Gamifikasi XP]
    
    D --> D1[Monitoring Statistik 8+ Kecamatan]
    D --> D2[Verifikasi Mitra Baru: Approve / Reject]
    D --> D3[Manajemen Pengguna & Ekosistem]
```

1. **`USER` (Masyarakat Umum / Pembaca)**:
   Masyarakat yang dapat menjelajahi ekosistem, memesan buku ke toko via WhatsApp, mengajukan pinjam ke perpustakaan, mendaftar event, bergabung ke komunitas, menulis ulasan dan rating, membaca artikel edukatif, serta menaikkan level pembaca melalui misi harian.
2. **`MITRA` (Penyedia Literasi Lokal)**:
   Entitas penyedia literasi berstatus seleksi (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`) dengan 3 jenis spesifik:
   - `TOKO_BUKU`: Menjual buku fisik, mengatur stok, harga, dan memproses pesanan WhatsApp.
   - `PERPUSTAKAAN`: Menyediakan koleksi pinjaman, nomor panggil, nomor rak, dan memverifikasi peminjaman.
   - `KOMUNITAS`: Mengelola agenda lapak baca, kegiatan bedah buku, dan merangkul relawan.
3. **`ADMIN` (Pengelola Pusat Ekosistem)**:
   Petugas yang memiliki hak akses penuh untuk memantau metrik ekosistem Sidrap, memvalidasi pendaftaran mitra baru, mengelola pengguna, dan memantau pemerataan titik literasi di seluruh kecamatan.

---

## 🖥️ Penjelasan Seluruh Tampilan Halaman Pengguna

Berikut adalah rincian tampilan seluruh antarmuka yang dapat diakses oleh publik dan pengguna terdaftar pada platform MABBACA:

### 1. Halaman Beranda (Homepage)
*Rute: `/`*

Halaman utama yang menyambut pengunjung dengan visual modern bernuansa *Emerald & Teal Sidrap* (`#075E54` dan `#0F766E`):
- **Hero Section**: Slogan utama, pengantar singkat tentang literasi Sidrap, dan bilah pencarian cerdas terintegrasi (*Universal Search Bar*) yang dapat langsung mencari buku, toko, atau perpustakaan.
- **Statistik Ekosistem Cepat (*Quick Stats Banner*)**: Menampilkan angka nyata ekosistem, seperti jumlah buku terdaftar (1.200+), kecamatan terjangkau (8+ Kecamatan), dan titik fasilitas literasi aktif.
- **Navigasi Kategori Cepat**: Tombol pintas dengan ikon tematik untuk melompat langsung ke direktori Buku, Toko Buku, Perpustakaan, Komunitas, Event, dan Baca 5 Menit.
- **Rekomendasi Buku Pilihan**: Grid kartu buku unggulan dengan cover berkualitas tinggi, nama pengarang, rating bintang, dan label ketersediaan.
- **Direktori Unggulan Toko & Perpustakaan**: Cuplikan kartu toko buku dan perpustakaan terdekat dilengkapi jarak kilometer dan tombol navigasi langsung.
- **Agenda Event Terkini**: Kalender kegiatan literasi mendatang di Sidrap dengan tanggal, lokasi, dan tag audiens.
- **Kutipan Literasi & Konten Edukatif**: Kutipan inspiratif dari tokoh literasi dan bagian ajakan membaca artikel ringkas 5 menit.
- **Call-to-Action (CTA) Mitra**: Banner ajakan bagi pemilik toko buku, pengelola perpustakaan, dan komunitas di Sidrap untuk mendaftarkan organisasinya sebagai mitra resmi.
- **Footer Terpadu**: Navigasi lengkap, tautan media sosial, kontak sekretariat literasi MABBACA, dan deklarasi hak cipta.

---

### 2. Halaman Katalog Buku & Detail Buku
*Rute: `/buku` (atau `/books`) dan `/buku/:id`*

#### A. Katalog Buku (`/buku`)
- **Pencarian & Filter Multidimensi**:
  - Filter kategori/genre (Fiksi, Agama, Pelajaran, Sejarah, Sains, Budaya Bugis/Sulawesi, dll.).
  - Filter ketersediaan: "Semua", "Tersedia di Toko Buku", atau "Tersedia di Perpustakaan".
  - Pengurutan (*Sorting*): Terbaru, Terpopuler, Harga Terendah, Harga Tertinggi, Rating Tertinggi.
- **Tampilan Grid Kartu Buku**:
  - Cover buku rasio proporsional dengan efek *hover zoom*.
  - Judul, nama pengarang, dan kategori buku.
  - Penanda harga beli (dari toko) dan badge **"Bisa Dipinjam"** (jika ada di perpustakaan).
  - Tombol ikon hati untuk menambahkan buku ke daftar **Favorit** (tersimpan langsung ke akun pembaca).

#### B. Halaman Detail Buku (`/buku/:id`)
- **Header Informasi Bibliografi**:
  - Cover buku HD dengan efek bayangan elegan.
  - Judul lengkap, nama pengarang, penerbit, ISBN, tahun terbit, tebal halaman, dan bahasa.
  - Ringkasan rating bintang dan total ulasan masyarakat.
- **Sinopsis Buku**: Teks deskripsi dan sinopsis buku yang mudah dibaca dengan tipografi yang nyaman di mata.
- **Mesin Ketersediaan Ganda (*Dual Availability Section*)**:
  1. **Tab Beli di Toko Buku Fisik**:
     - Daftar toko buku lokal Sidrap yang menyediakan stok fisik buku tersebut.
     - Harga resmi, stok yang tersedia, dan estimasi jarak toko dari lokasi pengguna.
     - Tombol **"Pesan via WhatsApp"**: Seketika menghasilkan format pesan pemesanan otomatis dan membuka WhatsApp pengelola toko.
  2. **Tab Pinjam di Perpustakaan**:
     - Daftar perpustakaan (Dinas Perpustakaan Daerah Sidrap, Perpus Desa, POCADI) yang memiliki koleksi buku tersebut.
     - Informasi teknis perpustakaan: **Nomor Panggil (*Call Number*)**, **Lokasi Rak Buku**, dan sisa kuota eksemplar fisik.
     - Tombol **"Pinjam Sekarang"**: Membuka modal konfirmasi peminjaman online untuk diverifikasi oleh petugas perpus.
- **Sistem Ulasan & Rating Komunitas**:
  - Ringkasan distribusi rating bintang pembaca.
  - Formulir pengiriman ulasan interaktif (pemberian bintang 1–5 dan kolom komentar pengalaman membaca).
  - Daftar ulasan warga Sidrap beserta nama pembaca, avatar, tanggal ulasan, dan isi komentar.

---

### 3. Halaman Direktori Toko Buku & Detail Toko
*Rute: `/literasi/toko` dan `/literasi/toko/:id`*

#### A. Direktori Toko Buku (`/literasi/toko`)
- Menampilkan seluruh toko buku fisik mitra MABBACA di Kabupaten Sidrap.
- Kartu toko buku menampilkan foto tempat, nama toko, kecamatan, jam buka-tutup, dan badge jarak tempuh (*Haversine distance*).
- Filter pencarian nama toko atau filter berdasarkan kecamatan di Sidrap.

#### B. Detail Toko Buku (`/literasi/toko/:id`)
- **Banner Profil Toko**: Foto etalase, alamat fisik lengkap, jam operasional, dan nomor kontak WhatsApp resmi.
- **Aksi Cepat**: Tombol langsung untuk memulai obrolan WhatsApp dengan admin toko atau membuka petunjuk arah peta.
- **Katalog Buku Toko Tersebut**: Menampilkan seluruh koleksi buku yang saat ini dijual dan tersedia di toko buku tersebut lengkap dengan harga masing-masing.

---

### 4. Halaman Direktori Perpustakaan & Detail Perpustakaan
*Rute: `/literasi/perpustakaan` dan `/literasi/perpustakaan/:id`*

#### A. Direktori Perpustakaan (`/literasi/perpustakaan`)
- Menampilkan Dinas Perpustakaan dan Kearsipan Daerah Sidrap, perpustakaan kecamatan, perpustakaan desa, serta Pojok Baca Digital (POCADI).
- Indikator ketersediaan fasilitas (Wi-Fi, ruang baca ber-AC, ruang anak, pojok digital).
- Jarak terdekat dari posisi pembaca.

#### B. Detail Perpustakaan (`/literasi/perpustakaan/:id`)
- **Profil & Fasilitas Perpustakaan**: Foto fasilitas gedung, alamat presisi di Sidrap, kontak pustakawan, jadwal jam operasional layanan (Senin–Jumat / Akhir Pekan).
- **Peraturan Peminjaman**: Penjelasan syarat peminjaman buku fisik (maksimal hari pinjam, kewajiban pengembalian).
- **Katalog Koleksi Buku Fisik Perpustakaan**:
  - Pencarian khusus koleksi yang ada di perpustakaan tersebut.
  - Informasi nomor panggil katalog dan nomor rak penyimpanan buku.
  - Tombol langsung untuk mengajukan peminjaman buku ke perpustakaan tersebut.

---

### 5. Halaman Komunitas Literasi & Detail Komunitas
*Rute: `/komunitas` dan `/komunitas/:id`*

#### A. Direktori Komunitas (`/komunitas`)
- Wadah bagi komunitas penggerak literasi, taman baca masyarakat (TBM), sanggar baca, dan inisiatif lapak baca jalanan di Sidrap.
- Menampilkan jumlah anggota/relawan aktif, fokus kegiatan, dan kecamatan domisili.

#### B. Detail Komunitas (`/komunitas/:id`)
- Visi, profil pengurus/ketua komunitas, sejarah singkat berdirinya gerakan.
- Jadwal lapak baca rutin (misalnya: Lapak Baca Minggu Pagi di Monumen Ganggawa).
- Galeri dokumentasi kegiatan komunitas.
- Tombol **"Gabung Komunitas"**: Membuka kesempatan bagi warga untuk mendaftar sebagai anggota atau relawan literasi baru.

---

### 6. Halaman Agenda Kegiatan / Event & Detail Event
*Rute: `/event` dan `/event/:id`*

#### A. Kalender Event Literasi (`/event`)
- Daftar agenda kegiatan literasi: Festival Literasi Sidrap, Bedah Buku Penulis Lokal, Pelatihan Menulis Kreatif, Lomba Mendongeng Anak, dan Diskusi Publik.
- Filter berdasarkan kategori event dan target peserta (Umum, Pelajar, Mahasiswa, Anak-Anak).

#### B. Detail Event (`/event/:id`)
- Tanggal, jam pelaksanaan (WITA), format acara (Luring/Tatap Muka di Sidrap atau Daring via Zoom).
- Lokasi acara lengkap atau tautan meeting.
- Profil narasumber / pembicara dan penyelenggara acara.
- Kuota peserta dan sisa tiket yang tersedia.
- Tombol **"Daftar Sekarang"**: Pendaftaran instan satu klik bagi pengguna terdaftar, yang akan menerbitkan tiket kegiatan di dashboard pembaca.

---

### 7. Halaman Baca 5 Menit (Artikel Literasi) & Detail Artikel
*Rute: `/baca-5-menit` dan `/baca-5-menit/:id`*

#### A. Indeks Artikel (`/baca-5-menit`)
- Kumpulan artikel ringkas, tip literasi, ulasan buku singkat, dan wawasan edukatif yang dirancang untuk dapat dibaca tuntas dalam waktu 3 hingga 5 menit.
- Ditujukan untuk merangsang minat baca harian masyarakat di sela-sela rutinitas.

#### B. Halaman Baca Bersih (*Clean Reader Mode*) (`/baca-5-menit/:id`)
- Tampilan artikel bebas distraksi dengan tipografi serif/sans yang nyaman.
- Informasi estimasi waktu baca (misal: `4 Menit Baca`), tanggal rilis, dan nama penulis/pegiat literasi.
- Penghitungan otomatis penyelesaian membaca yang terhubung ke misi harian gamifikasi pengguna.
- Tombol berbagi ke media sosial (WhatsApp, Facebook, Twitter/X, Salin Tautan).

---

### 8. Halaman Pencarian Universal Satu Pintu (/search)
*Rute: `/search`*

Mesin pencari terpusat yang memindai seluruh data ekosistem MABBACA secara simultan:
- Pengguna cukup mengetikkan kata kunci (misalnya: `"Sejarah"`, `"Pangkajene"`, atau nama penulis).
- Hasil ditampilkan dengan **Tab Berpenghitung (*Tab Counters*)**:
  - **Semua Hasil** (Gabungan seluruh kecocokan).
  - **Buku** (Menampilkan buku yang sesuai).
  - **Toko Buku** (Menampilkan toko buku yang relevan).
  - **Perpustakaan** (Menampilkan perpustakaan terkait).
  - **Komunitas** (Menampilkan komunitas yang cocok).
  - **Event** (Menampilkan kegiatan yang relevan).
  - **Artikel** (Menampilkan artikel baca 5 menit).
- Tampilan *Empty State* ramah pengguna jika kata kunci tidak membuahkan hasil, disertai saran pencarian alternatif.

---

### 9. Halaman Kemitraan (/mitra) & Tentang Kami (/about)
*Rute: `/mitra` dan `/about`*

- **Landing Kemitraan (`/mitra`)**:
  - Memaparkan manfaat bergabung sebagai mitra MABBACA: digitalisasi katalog fisik tanpa biaya, akses langsung ke ribuan pembaca Sidrap, dan kemudahan promosi acara.
  - Alur 3 langkah kemitraan: Pendaftaran Formulir ➔ Verifikasi oleh Admin MABBACA ➔ Akun Aktif & Katalog Tayang ke Publik.
  - Tombol mengarah ke formulir pendaftaran mitra mandiri.
- **Tentang Kami (`/about` atau `/tentang`)**:
  - Visi dan misi MABBACA dalam memajukan literasi di Bumi Nene Mallomo (Sidrap).
  - Latar belakang geografis dan sosiokultural Kabupaten Sidenreng Rappang.
  - Informasi kontak resmi, alamat sekretariat pengelola, dan kanal media sosial.

---

### 10. Halaman Autentikasi & Profil Akun
*Rute: `/login`, `/register`, `/register-mitra`, `/admin/login`, dan `/profile`*

- **Login Terpadu (`/login`)**: Formulir masuk dengan proteksi kata sandi, dilengkapi **tombol *Quick-Fill Demo*** untuk kemudahan pengujian akun instan (Admin, Mitra Toko, Mitra Perpus, Mitra Komunitas, dan Warga).
- **Registrasi Warga Pembaca (`/register`)**: Pendaftaran akun masyarakat dengan pemilihan nama lengkap, email, kata sandi, dan kecamatan asal di Sidrap.
- **Registrasi Mitra Mandiri (`/register-mitra`)**: Formulir pendaftaran calon mitra penyedia literasi dengan pemilihan jenis mitra (`TOKO_BUKU`, `PERPUSTAKAAN`, `KOMUNITAS`), nama organisasi, alamat lengkap, kecamatan, dan nomor kontak WhatsApp. Pendaftaran otomatis masuk ke status `PENDING` menunggu persetujuan admin.
- **Portal Khusus Login Admin (`/admin/login`)**: Antarmuka masuk eksklusif dengan tema gelap (*dark theme*) untuk staf dan pengelola platform MABBACA.
- **Profil Pengguna (`/profile`)**: Halaman untuk memperbarui data diri, mengubah nama, mengganti foto profil (avatar), mengubah kecamatan tempat tinggal, dan memperbarui kata sandi akun secara aman.

---

## 📊 Penjelasan Mendalam Tampilan Seluruh Dashboard

MABBACA memiliki **3 jenis dashboard terpisah** yang dirancang dengan sistem proteksi ketat (*Guarded Routes*):

---

### A. Dashboard Warga Pembaca (`/dashboard`)
*Akses: Role `USER` (Dilindungi `ProtectedRoute`)*

Dashboard interaktif yang berfokus pada personalisasi membaca, gamifikasi, dan pelacakan seluruh aktivitas literasi warga:

```
+-----------------------------------------------------------------------------------+
|  [Avatar] Halo, Andi Muhammad Nur 👋                       Level: Pembaca Setia   |
|  Kecamatan Pangkajene, Kab. Sidrap                         420 / 500 XP [========]|
+-----------------------------------------------------------------------------------+
| [Misi Literasi] [Aktivitas] [Favorit] [Event] [Peminjaman] [Pesanan] [Leaderboard]|
+-----------------------------------------------------------------------------------+
```

#### 1. Header Sambutan & Kartu Gamifikasi
- **Informasi Personal**: Menampilkan foto profil avatar pengguna, sapaan dinamis waktu, dan kecamatan domisili.
- **Level Literasi**: Menampilkan status pencapaian membaca pengguna saat ini (*Pembaca Pemula*, *Sahabat Buku*, *Penggerak Literasi*, atau *Inspirator Literasi*).
- **Progress Bar XP**: Bar kemajuan visual yang menunjukkan akumulasi poin literasi saat ini dan sisa poin yang dibutuhkan untuk naik ke level berikutnya.

#### 2. Delapan Tab Manajemen Aktivitas Pembaca
1. **Tab Misi Literasi**:
   - Menampilkan daftar tantangan harian aktif (misalnya: *"Baca 1 artikel 5 menit"*, *"Beri rating buku"*, *"Kunjungi profil perpustakaan"*).
   - Menampilkan hadiah poin untuk setiap misi (misal: `+50 Poin`).
   - Tombol **"Selesaikan Misi"** / **"Klaim Poin"** yang langsung memicu pertambahan XP dan mengupdate level akun secara *real-time*.
2. **Tab Aktivitas Terbaru**:
   - Log kronologis seluruh riwayat aksi pengguna: kapan terakhir membaca artikel, menulis ulasan, meminjam buku, atau mendaftar kegiatan.
3. **Tab Buku Favorit**:
   - Rak buku virtual pribadi yang menyimpan buku-buku yang telah di-bookmark oleh pengguna.
   - Dilengkapi tombol cepat untuk langsung memesan ke toko buku atau meminjam ke perpustakaan.
4. **Tab Event Saya**:
   - Daftar seluruh agenda kegiatan literasi di Sidrap yang telah didaftari oleh pengguna.
   - Dilengkapi tanggal pelaksanaan, lokasi tempat, dan status tiket keikutsertaan.
5. **Tab Peminjaman Buku Perpustakaan**:
   - Memantau status seluruh permohonan pinjam buku perpustakaan.
   - Status terperinci: `MENUNGGU_PERSETUJUAN` (kuning), `DISETUJUI` (hijau), `SEDANG_DIPINJAM` (biru), `SELESAI_DIKEMBALIKAN` (abu-abu), atau `DITOLAK` (merah).
   - Menampilkan tenggat waktu pengembalian buku fisik.
6. **Tab Pesanan Buku Toko**:
   - Rekam jejak pemesanan buku yang dilakukan pengguna melalui integrasi pesan WhatsApp ke toko buku mitra lokal.
7. **Tab Leaderboard Sidrap**:
   - Papan klasemen pembaca paling aktif se-Kabupaten Sidrap berdasarkan perolehan total poin literasi.
   - Menampilkan peringkat 1, 2, 3 dengan piala emas, perak, dan perunggu guna memotivasi keterlibatan komunitas membaca.
8. **Tab Notifikasi**:
   - Pusat pemberitahuan sistem (konfirmasi persetujuan peminjaman buku dari perpustakaan, verifikasi tiket event, dan reward poin misi).

---

### B. Dashboard Mitra Literasi (`/mitra/dashboard`)
*Akses: Role `MITRA` (Dilindungi `MitraRoute`)*

Dashboard operasional yang beradaptasi penuh terhadap status akun dan jenis organisasi mitra:

#### 1. Penanganan Status Akun Khusus (Pending / Rejected / Suspended)
Jika akun mitra belum berstatus `APPROVED`, sistem secara otomatis mengunci menu operasional dan menampilkan layar informasi khusus:
- **Layar Status PENDING (Menunggu Verifikasi)**:
  - Kartu status elegan dengan animasi jam berdetik.
  - Ringkasan data organisasi yang telah didaftarkan (nama usaha, kategori, alamat, nomor WhatsApp, tanggal registrasi).
  - **Timeline 3 Tahap Verifikasi**:
    1. *Pendaftaran Diterima*: Berkas tersimpan di server.
    2. *Validasi Data & Lokasi*: Sedang ditinjau oleh staf pengelola MABBACA (1x24 jam kerja).
    3. *Akun Aktif*: Akses input katalog buku dan tayang ke publik.
  - **Bantuan WhatsApp Instan**: Tombol terintegrasi untuk langsung menghubungi staf admin MABBACA via WhatsApp jika membutuhkan konfirmasi cepat.
- **Layar Status REJECTED (Ditolak)**:
  - Menjelaskan bahwa pendaftaran belum memenuhi kriteria ekosistem.
  - Menampilkan **Alasan Penolakan Resmi** yang diinput oleh Administrator (misalnya: *nomor kontak tidak aktif atau alamat di luar Sidrap*).
  - Tombol untuk menghubungi admin atau mengajukan pendaftaran ulang.

#### 2. Panel Operasional Mitra APPROVED (Adaptif Sesuai Tipe)
Saat akun disetujui, mitra mendapatkan akses penuh ke fitur yang disesuaikan dengan jenis mitranya:

##### 🏪 Jika Tipe: `TOKO_BUKU`
- **4 Kartu Metrik Utama (KPI)**:
  - *Total Produk*: Jumlah judul buku yang dijual.
  - *Pesanan Masuk*: Akumulasi pesanan buku via WhatsApp dari pembaca.
  - *Estimasi Omset*: Perkiraan perputaran transaksi toko.
  - *Total Dilihat*: Jumlah tayangan pengunjung pada etalase toko.
- **Grafik Tren Interaksi & Penjualan**: Visualisasi grafik area interaktif (Recharts) performa toko.
- **Tab Produk Toko (Inventaris Buku)**:
  - Tabel produk lengkap dengan pencarian *live*.
  - Tombol **"Tambah Produk Buku"**: Modal form untuk menambahkan judul buku baru, pengarang, penerbit, ISBN, kategori, harga jual (Rp), dan stok fisik.
  - Aksi Edit Produk & Hapus Produk dari etalase.
- **Tab Pesanan Masuk**:
  - Daftar pesanan dari pembaca beserta nama pembeli, judul buku yang dipesan, total harga, dan tanggal transaksi.
  - Tombol langsung untuk membalas/menghubungi nomor WhatsApp pembeli.
- **Tab Profil Toko**:
  - Pengaturan nama toko, deskripsi, alamat lengkap, pemilihan kecamatan di Sidrap, nomor WhatsApp resmi transaksi, dan jam buka-tutup toko.

##### 🏛️ Jika Tipe: `PERPUSTAKAAN`
- **4 Kartu Metrik Utama (KPI)**:
  - *Total Judul Koleksi*: Jumlah judul buku fisik yang dimiliki perpustakaan.
  - *Total Eksemplar*: Akumulasi seluruh buku fisik yang ada di rak.
  - *Peminjaman Aktif*: Jumlah buku yang saat ini sedang dibawa pulang oleh warga.
  - *Permohonan Menunggu*: Antrean permohonan pinjam baru yang butuh persetujuan.
- **Tab Sirkulasi Peminjaman Masuk**:
  - Daftar pengajuan pinjam dari masyarakat Sidrap.
  - Tombol **"Setujui Peminjaman"** (mengubah status menjadi `DISETUJUI` dan mengunci stok buku).
  - Tombol **"Tolak Peminjaman"** (mengembalikan stok buku dan memberi alasan pembatalan).
  - Tombol **"Konfirmasi Pengembalian"** saat warga mengembalikan buku fisik ke perpustakaan (memulihkan stok kembali).
- **Tab Koleksi Buku**:
  - Manajemen katalog fisik perpustakaan.
  - Tombol **"Tambah Koleksi"**: Input buku lengkap dengan **Nomor Panggil (*Call Number*)**, **Nomor Rak Buku**, dan jumlah stok eksemplar.
- **Tab Profil Perpustakaan**:
  - Pengaturan informasi instansi perpustakaan, fasilitas, jam pelayanan, dan kontak pustakawan.

##### 🤝 Jika Tipe: `KOMUNITAS`
- **4 Kartu Metrik Utama (KPI)**:
  - *Total Anggota*: Jumlah masyarakat yang bergabung ke komunitas.
  - *Agenda Kegiatan*: Total event yang telah diselenggarakan.
  - *Event Berjalan*: Kegiatan yang sedang aktif saat ini.
  - *Total Relawan*: Jumlah relawan yang siap menggerakkan lapak baca.
- **Tab Agenda Kegiatan / Event Komunitas**:
  - Pembuatan event baru (bedah buku, lapak baca jalanan di taman/lapangan Sidrap).
  - Pemantauan daftar peserta yang mendaftar pada setiap kegiatan.
- **Tab Anggota Komunitas**:
  - Manajemen database anggota dan relawan yang bergabung via aplikasi MABBACA.
- **Tab Profil Komunitas**:
  - Pengaturan profil pergerakan, visi misi, tautan media sosial, dan kontak sekretariat.

---

### C. Dashboard Administrator Platform (`/admin/dashboard`)
*Akses: Role `ADMIN` (Dilindungi `AdminRoute` & Backend `authorize('ADMIN')`)*

Pusat kendali eksekutif untuk memantau ekosistem literasi seluruh Kabupaten Sidrap:

```
+------------------------------------------------------------------------------------+
|  [PANEL PENGELOLA] Admin Dashboard MABBACA         [ 3 Mitra Menunggu Verifikasi ] |
+------------------------------------------------------------------------------------+
|  [Total User: 120]  [Total Mitra: 18]  [Katalog: 85]  [Perpustakaan: 8]            |
|  [Toko Buku: 6]     [Komunitas: 4]     [Event: 12]    [Baca 5 Menit: 24]           |
+------------------------------------------------------------------------------------+
|  [Grafik Pertumbuhan] [Verifikasi Mitra] [Data Kecamatan] [Kelola User] [Buku]... |
+------------------------------------------------------------------------------------+
```

#### 1. Header & Indikator Pending Real-time
- Tombol peringatan berkedip (*pulsing badge*) jika ada mitra baru yang mendaftar dan menunggu verifikasi admin (`X Mitra Menunggu Verifikasi`), yang jika diklik langsung mengarahkan ke antrean persetujuan.

#### 2. Delapan Kartu KPI Ekosistem Terpadu
1. **Total Pengguna**: Jumlah warga pembaca yang terdaftar.
2. **Total Mitra**: Jumlah seluruh toko buku, perpustakaan, dan komunitas aktif.
3. **Katalog Buku**: Total judul buku yang tercatat di seluruh Sidrap.
4. **Perpustakaan**: Jumlah perpustakaan daerah, desa, dan POCADI terhubung.
5. **Toko Buku**: Jumlah toko buku fisik mitra yang beroperasi.
6. **Komunitas**: Jumlah komunitas dan lapak baca masyarakat.
7. **Event Literasi**: Jumlah agenda literasi yang terdaftar di platform.
8. **Baca 5 Menit**: Total artikel edukasi ringkas yang telah dipublikasikan.

#### 3. Enam Tab Pengelolaan Administratif
1. **Tab Grafik Pertumbuhan (Overview)**:
   - Visualisasi grafik batang & area (Recharts) interaktif yang memperlihatkan tren pertumbuhan pengguna baru, peningkatan mitra, dan frekuensi peminjaman buku per bulan.
2. **Tab Verifikasi Mitra (Pusat Seleksi Mitra)**:
   - Daftar antrean calon mitra yang mendaftar melalui formulir publik.
   - Kartu calon mitra memuat: Nama Usaha/Organisasi, Jenis Kemitraan, Alamat Lengkap, Kecamatan di Sidrap, Nama Penanggung Jawab, Alamat Email, Nomor WhatsApp, dan Tanggal Pengajuan.
   - **Tombol "Setujui" (*Approve*)**: Mengubah status mitra menjadi `APPROVED` secara instan sehingga profil dan katalognya langsung tayang ke masyarakat.
   - **Tombol "Tolak" (*Reject*)**: Membuka modal resmi untuk memasukkan **Alasan Penolakan** yang akan dikirimkan dan ditampilkan pada dashboard pendaftar tersebut.
3. **Tab Data Literasi Kecamatan Sidrap**:
   - Memetakan sebaran titik baca di 8–11 kecamatan se-Kabupaten Sidrap: *Pangkajene, Maritengngae, Baranti, Watang Pulu, Tellu Limpoe, Dua Pitue, Panca Rijang, Kulo, Panca Lautang, Watang Sidenreng, dan Pitu Riase*.
   - **Bar Chart Persebaran Fasilitas**: Membandingkan jumlah perpustakaan, toko buku, dan komunitas di masing-masing kecamatan.
   - Tabel indikator literasi daerah guna membantu pemerintah dan penggerak literasi menentukan wilayah mana yang masih minim akses buku.
4. **Tab Kelola Pengguna (*User Management*)**:
   - Manajemen seluruh pengguna terdaftar di sistem.
   - Filter peran: `ALL`, `USER`, `MITRA`, `ADMIN`.
   - Pencarian pengguna berdasarkan nama, email, atau kecamatan domisili.
   - Pengawasan status keaktifan akun.
5. **Tab Monitoring Katalog Buku**:
   - Pengawasan seluruh buku fisik yang beredar di sistem, kategori, penulis, dan status ketersediaannya.
6. **Tab Monitoring Event Literasi**:
   - Pengawasan seluruh agenda dan festival literasi di Kabupaten Sidrap.

#### 4. Keamanan Berlapis Halaman Admin
- **Frontend Guard (`AdminRoute`)**:
  - Jika pengunjung belum login mencoba membuka `/admin` atau `/admin/dashboard`, sistem langsung mengarahkannya ke halaman **Portal Masuk Admin (`/admin/login`)**.
  - Jika pengunjung sudah login sebagai **User Warga** atau **Mitra** dan mencoba mengakses rute admin, sistem memblokir akses dan menampilkan layar **Error 403: Akses Ditolak** lengkap dengan identitas akun yang sedang aktif dan tombol keluar yang aman.
- **Backend Guard (`authorize('ADMIN')`)**:
  - Setiap endpoint API di `/api/admin/*` diverifikasi melalui token JWT; upaya manipulasi *client-side* akan ditolak dengan respons HTTP 403 Forbidden.

---

## 🛠️ Arsitektur Teknologi & Stack

MABBACA dibangun menggunakan arsitektur **Full JavaScript murni** (tanpa dependensi TypeScript/Python/PHP) yang teruji, modern, dan mudah dirawat:

| Lapisan / Komponen | Teknologi yang Digunakan | Penjelasan & Fungsi |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** + **Vite** | Single Page Application (SPA) dengan performa pemuatan super cepat, HMR instan, dan modularitas komponen tinggi. |
| **Routing & Navigation** | **React Router DOM v6** | Client-side routing dengan *Dynamic Code Splitting* (`React.lazy` & `Suspense`) untuk pemisahan bundle modular. |
| **Styling & Design System** | **Tailwind CSS v3** | Utilitas styling modern dengan palet warna khusus Sidrap: Emerald (`#075E54`), Teal (`#0F766E`), dan Light Sand (`#F8FAF8`). |
| **Iconography** | **Lucide React** | Koleksi ikon SVG modern, konsisten, dan ringan. |
| **Visualisasi & Grafik** | **Recharts** | Rendering grafik interaktif (*Responsive AreaChart & BarChart*) untuk metrik dashboard admin dan mitra. |
| **Backend Framework** | **Node.js** + **Express.js** | Arsitektur RESTful API berarsitektur MVC (*Model-View-Controller*), modular, efisien, dan non-blocking I/O. |
| **Database & ORM** | **MySQL 8.0** / **MariaDB** + **Prisma ORM** | Skema relasional yang aman, migrasi otomatis, relasi foreign-key konsisten, dan pencegahan SQL Injection menyeluruh. |
| **Autentikasi & Keamanan** | **JWT (HMAC-SHA256)** + **bcryptjs** | Token JWT bertanda tangan aman dengan masa kedaluwarsa 7 hari, hashing kata sandi satu arah *salt rounds* 10. |
| **Proteksi Serangan** | **Helmet** + **Express Rate Limit** + **CORS** | Header keamanan standar industri, pembatasan laju kueri DoS, dan kebijakan CORS ketat. |
| **File Handling** | **Multer** | Pengelolaan upload berkas gambar sampul buku dan foto profil dengan verifikasi MIME-type dan pembatasan kuota 5MB. |
| **Algoritma Geospasial** | **Haversine Formula** | Perhitungan jarak akurat berdasarkan koordinat *Latitude* dan *Longitude* Kabupaten Sidrap. |

---

## 📁 Struktur Direktori Proyek

```
mabbaca/
├── client/                             # Aplikasi Antarmuka Pengguna (Frontend React + Vite)
│   ├── public/                         # Aset publik statis (favicon, icons)
│   ├── src/
│   │   ├── components/                 # Sistem komponen antarmuka yang dapat digunakan ulang
│   │   │   ├── cards/                  # BookCard, StoreCard, LibraryCard, CommunityCard, EventCard, ArticleCard
│   │   │   ├── common/                 # Button, Input, Modal, Badge, Skeleton, EmptyState, Tabs, Avatar
│   │   │   └── layout/                 # Navbar, Footer, Sidebar, BottomNav
│   │   ├── contexts/                   # State Management Global (AuthContext, LocationContext, ToastContext)
│   │   ├── layouts/                    # MainLayout (Publik) & DashboardLayout (Admin & Mitra)
│   │   ├── pages/                      # Seluruh Halaman Antarmuka
│   │   │   ├── admin/                  # AdminDashboardPage & AdminLoginPage
│   │   │   ├── auth/                   # LoginPage, RegisterPage, RegisterMitraPage
│   │   │   ├── mitra/                  # MitraDashboardPage (Toko Buku, Perpus, Komunitas)
│   │   │   ├── public/                 # HomePage, BooksPage, BookDetailPage, StoresPage, StoreDetailPage,
│   │   │   │                           # LibrariesPage, LibraryDetailPage, CommunitiesPage, CommunityDetailPage,
│   │   │   │                           # EventsPage, EventDetailPage, ArticlesPage, ArticleDetailPage,
│   │   │   │                           # UniversalSearchPage, MitraLandingPage, AboutPage
│   │   │   └── user/                   # UserDashboardPage & ProfilePage
│   │   ├── routes/                     # AppRoutes (Perutean dengan Guards: ProtectedRoute, MitraRoute, AdminRoute)
│   │   ├── services/                   # Konfigurasi Axios & modular API services
│   │   ├── App.jsx                     # Komponen Root React
│   │   ├── index.css                   # Gaya dasar Tailwind & konfigurasi palet Sidrap
│   │   └── main.jsx                    # Entry point React DOM
│   ├── index.html                      # Berkas HTML utama dengan tag meta SEO
│   ├── tailwind.config.js              # Konfigurasi tema warna & breakpoint
│   ├── vite.config.js                  # Konfigurasi Vite & chunking manual
│   └── package.json                    # Dependensi Frontend
│
├── server/                             # Backend RESTful API (Express.js & Prisma ORM)
│   ├── prisma/
│   │   ├── schema.prisma               # Skema Relasional Basis Data (20 model terhubung)
│   │   └── seed.js                     # Skrip pembenihan data awal realistis Kabupaten Sidrap
│   ├── src/
│   │   ├── config/                     # Konfigurasi Prisma Client, JWT, dan Multer
│   │   ├── controllers/                # Kontroler logika bisnis (auth, book, store, library, community,
│   │   │                               # event, article, search, user, mitra, admin, order, borrowing)
│   │   ├── middleware/                 # authMiddleware, roleMiddleware, errorMiddleware
│   │   ├── routes/                     # Modul perutean Express API
│   │   ├── utils/                      # Kalkulator Haversine jarak, responseHelper
│   │   └── app.js                      # Entry point server Express
│   ├── uploads/                        # Direktori penyimpanan unggahan berkas
│   ├── .env.example                    # Contoh variabel lingkungan server
│   └── package.json                    # Dependensi Backend
│
├── docs/                               # Dokumentasi Teknis Tambahan
│   ├── API.md                          # Dokumentasi detail endpoint REST API
│   ├── DEPLOYMENT.md                   # Panduan panduan deployment produksi
│   ├── FINAL_AUDIT.md                  # Laporan audit performa, keamanan, dan a11y
│   └── SECURITY_CHECKLIST.md           # Lembar ceklis keamanan dan kepatuhan sistem
│
└── README.md                           # Dokumentasi Komprehensif Platform MABBACA
```

---

## 🔑 Akun Demo Pengujian

Aplikasi telah dilengkapi dengan data benih realistis (*seed data*) dan fitur tombol **Quick-Fill Demo** pada halaman login (`/login`):

| Peran (Role) | Email Masuk | Kata Sandi | Keterangan & Hak Akses |
| :--- | :--- | :--- | :--- |
| 🛡️ **ADMINISTRATOR** | `admin@mabbaca.id` | `admin123` | Portal `/admin/login` atau `/login`. Hak akses verifikasi mitra pending, statistik literasi seluruh kecamatan Sidrap, kelola pengguna. |
| 🏪 **MITRA (TOKO BUKU)** | `toko@mabbaca.id` | `mitra123` | Portal `/login`. Pengelola Toko Buku Sidrap Mandiri (Dashboard metrik penjualan, kelola produk buku, kelola stok & pesanan WA). |
| 🏛️ **MITRA (PERPUSTAKAAN)**| `perpus@mabbaca.id` | `mitra123` | Portal `/login`. Dinas Perpustakaan Daerah Sidrap (Katalog nomor panggil/rak, persetujuan pinjam buku warga). |
| 🤝 **MITRA (KOMUNITAS)** | `komunitas@mabbaca.id` | `mitra123` | Portal `/login`. Gerakan Sidrap Membaca (Kelola agenda event, lapak baca jalanan, dan database relawan). |
| 👤 **USER (WARGA PEMBACA)** | `user@mabbaca.id` | `user123` | Portal `/login`. Andi Muhammad Nur (Peringkat Pembaca Setia, 420 Poin XP, Misi harian, riwayat pinjam buku). |

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

Ikuti panduan langkah demi langkah di bawah ini untuk menjalankan MABBACA pada lingkungan lokal (*Local Development*):

### 1. Prasyarat Sistem
- **Node.js**: Versi `v18.x` atau lebih baru (Disarankan `v20.x`).
- **NPM**: Versi `v9.x` ke atas.
- **MySQL / MariaDB**: Server basis data aktif di port default `3306`.
- **Git**: Terinstal pada komputer Anda.

---

### 2. Setup Backend Server

1. Buka terminal dan arahkan ke folder `server/`:
   ```bash
   cd server
   ```

2. Instal seluruh dependensi backend:
   ```bash
   npm install
   ```

3. Buat berkas konfigurasi `.env` di dalam folder `server/`:
   ```bash
   cp .env.example .env
   ```
   *Konfigurasi isi `.env`:*
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="mysql://root:password_anda@localhost:3306/mabbaca"
   JWT_SECRET="mabbaca_super_secret_jwt_sidrap_literasi_key_2026"
   JWT_EXPIRES_IN="7d"
   CLIENT_URL="http://localhost:5173"
   UPLOAD_DIR="./uploads"
   ```
   *(Pastikan nama pengguna `root` dan `password_anda` sesuai dengan konfigurasi server MySQL lokal Anda).*

4. Sinkronisasikan skema Prisma ke database MySQL dan isi data realistis Kabupaten Sidrap:
   ```bash
   # Generate client Prisma & sinkronkan tabel ke MySQL
   npx prisma generate
   npx prisma db push

   # Eksekusi seed data ekosistem Sidrap
   node prisma/seed.js
   ```

5. Jalankan server backend:
   ```bash
   # Mode Development dengan auto-reload
   npm run dev

   # Atau mode Produksi
   npm start
   ```
   Backend API akan aktif dan siap menerima permintaan di: **`http://localhost:5000/api`**.

---

### 3. Setup Frontend Client

1. Buka jendela terminal baru dan arahkan ke folder `client/`:
   ```bash
   cd client
   ```

2. Instal seluruh dependensi frontend:
   ```bash
   npm install
   ```

3. Buat berkas konfigurasi `.env` di dalam folder `client/`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Jalankan development server:
   ```bash
   npm run dev
   ```

5. Buka peramban (*web browser*) Anda dan akses alamat:
   👉 **`http://localhost:5173`**

---

## 📡 Daftar Endpoint REST API

Berikut ringkasan endpoint utama yang disediakan oleh server MABBACA:

| Kategori | Metode | Rute Endpoint | Keterangan & Otorisasi |
| :--- | :---: | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Registrasi akun warga pembaca (`USER`) |
| **Auth** | `POST` | `/api/auth/register-mitra` | Pendaftaran mandiri calon mitra (`PENDING`) |
| **Auth** | `POST` | `/api/auth/login` | Masuk sistem dan penerbitan token JWT |
| **Auth** | `GET` | `/api/auth/me` | Mengambil profil user yang sedang login *(Login Required)* |
| **Buku** | `GET` | `/api/books` | Menampilkan katalog buku dengan filter kategori, urutan, & pencarian |
| **Buku** | `GET` | `/api/books/:id` | Detail buku lengkap dengan daftar toko penyedia & perpustakaan |
| **Buku** | `POST` | `/api/books/:id/favorite` | Simpan / hapus buku dari daftar favorit *(Login Required)* |
| **Buku** | `POST` | `/api/books/:id/reviews` | Mengirim ulasan bintang dan komentar *(Login Required)* |
| **Toko Buku** | `GET` | `/api/stores` | Direktori toko buku fisik terdekat (Kalkulasi Haversine) |
| **Toko Buku** | `GET` | `/api/stores/:id` | Profil toko buku dan katalog etalase yang dijual |
| **Perpustakaan**| `GET` | `/api/libraries` | Direktori perpustakaan daerah, desa, & POCADI |
| **Perpustakaan**| `GET` | `/api/libraries/:id` | Profil perpustakaan dan koleksi buku fisik beserta nomor rak |
| **Peminjaman** | `POST` | `/api/libraries/borrow` | Pengajuan pinjam buku perpustakaan secara daring *(Stock-Lock)* |
| **Komunitas** | `GET` | `/api/communities` | Direktori komunitas literasi dan lapak baca di Sidrap |
| **Komunitas** | `POST` | `/api/communities/:id/join` | Mendaftar menjadi relawan / anggota komunitas *(Login Required)* |
| **Event** | `GET` | `/api/events` | Kalender agenda kegiatan literasi dengan filter audiens |
| **Event** | `POST` | `/api/events/:id/register`| Pendaftaran peserta kegiatan literasi *(Login Required)* |
| **Artikel** | `GET` | `/api/articles` | Daftar artikel edukasi ringkas "Baca 5 Menit" |
| **Artikel** | `GET` | `/api/articles/:id` | Konten artikel lengkap dengan estimasi menit membaca |
| **Pencarian** | `GET` | `/api/search` | Universal search lintas 6 kategori ekosistem sekaligus |
| **Gamifikasi** | `GET` | `/api/gamification/leaderboard` | Daftar klasemen pembaca teraktif se-Kabupaten Sidrap |
| **User** | `GET` | `/api/user/dashboard` | Data ringkasan dashboard pembaca, misi harian, & aktivitas |
| **User** | `POST` | `/api/user/missions/:id/complete` | Klaim hadiah poin XP misi harian literasi |
| **Mitra** | `GET` | `/api/mitra/dashboard` | Metrik dan data operasional mitra *(Mitra Role Only)* |
| **Mitra** | `POST` | `/api/mitra/inventory` | Menambah produk buku toko atau koleksi perpustakaan *(Mitra Role Only)* |
| **Mitra** | `PUT` | `/api/mitra/inventory/:id` | Mengubah data inventaris, stok, atau harga *(Mitra Role Only)* |
| **Admin** | `GET` | `/api/admin/dashboard` | Ringkasan metrik ekosistem Sidrap *(Admin Role Only)* |
| **Admin** | `GET` | `/api/admin/pending-mitra` | Daftar permohonan mitra pending yang butuh verifikasi |
| **Admin** | `PUT` | `/api/admin/mitra/:id/verify` | Menyetujui (`APPROVED`) atau Menolak (`REJECTED`) mitra |
| **Admin** | `GET` | `/api/admin/literacy-stats` | Statistik persebaran titik literasi per kecamatan di Sidrap |

---

## 🤝 Kontribusi & Lisensi

Proyek ini dikembangkan dengan dedikasi tinggi untuk mendukung kemajuan literasi dan keterbukaan akses pengetahuan masyarakat di Kabupaten Sidenreng Rappang (Sidrap).

- **Lisensi**: [MIT License](LICENSE) — Bebas digunakan, dikembangkan, dan disesuaikan untuk kemaslahatan publik dan kemajuan pendidikan.
- **Dukungan & Pertanyaan**: Jika Anda menemukan kendala teknis atau ingin berkolaborasi memajukan ekosistem literasi ini, silakan buat *Issue* atau ajukan *Pull Request* di repositori ini.

<div align="center">

**MABBACA — Bersama Nyalakan Lentera Literasi di Bumi Nene Mallomo.**  
*Sidenreng Rappang, Sulawesi Selatan.*

</div>
