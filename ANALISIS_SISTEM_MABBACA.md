# 📑 LAPORAN ANALISIS DAN DOKUMENTASI SISTEM TERPADU MABBACA
### *Analisis Arsitektur, Alur Bisnis, Peran Pengguna, Keamanan Hak Akses, dan Evaluasi Sistem Ekosistem Literasi Digital Terpadu Kabupaten Sidenreng Rappang (Sidrap)*

---

## 1. Gambaran Umum Sistem

Platform **MABBACA** (yang berakar dari kosa kata bahasa Bugis yang bermakna *"Membaca"*) merupakan sistem informasi ekosistem literasi digital terpadu berbasis web yang dirancang dan diimplementasikan secara khusus untuk memetakan, mengintegrasikan, dan memfasilitasi seluruh aktivitas literasi di wilayah **Kabupaten Sidenreng Rappang (Sidrap), Sulawesi Selatan**.

Tujuan utama pengembangan sistem ini adalah mengatasi fragmentasi informasi literasi antarsektor di daerah. Sebelum adanya sistem ini, toko buku komersial, perpustakaan instansi/desa, kelompok komunitas taman baca masyarakat (TBM), dan penyelenggara kegiatan literasi beroperasi secara terpisah tanpa adanya pangkalan data terintegrasi. Hal ini menyulitkan masyarakat dalam memperoleh akses bahan bacaan serta menyulitkan pemerintah daerah dalam memantau pemerataan fasilitas membaca di setiap kecamatan.

Secara fungsional, MABBACA beroperasi dengan menggabungkan lima pilar utama ke dalam satu arsitektur aplikasi:
1. **Marketplace Buku Lokal:** Menghubungkan pembaca langsung dengan toko buku fisik di Sidrap melalui pemesanan terstruktur via WhatsApp (*Direct WhatsApp Checkout*).
2. **Otomasi Sirkulasi Perpustakaan (OPAC):** Digitalisasi katalog koleksi fisik perpustakaan daerah, perpustakaan desa, dan Pojok Baca Digital (POCADI) dengan sistem permohonan pinjam daring serta penguncian stok otomatis (*stock-lock concurrency*).
3. **Direktori & Manajemen Komunitas:** Wadah pergerakan literasi akar rumput, sanggar baca, dan inisiatif lapak baca jalanan di ruang publik Sidrap.
4. **Kalender Event Literasi:** Pusat publikasi agenda seminar, bedah buku, pelatihan menulis, dan festival literasi daerah.
5. **Kanal Edukasi Kilat & Gamifikasi Membaca:** Rubrik *Baca 5 Menit* dan mesin penghargaan (*gamification engine*) berbasis poin pengalaman (XP), level pembaca, misi harian, serta papan peringkat (*leaderboard*) se-Kabupaten Sidrap.

Sistem dibangun menggunakan arsitektur *Fullstack JavaScript* modern: Frontend berbasis **React 18** bersama **Vite**, **Tailwind CSS**, **Lucide Icons**, dan visualisasi grafik **Recharts**; Backend berbasis **Node.js** dan **Express.js** dengan pendekatan *Model-View-Controller* (MVC) dan *Service Layer Pattern*; Basis data relasional **MySQL / MariaDB** yang dikelola melalui **Prisma ORM**; serta mekanisme keamanan berbasis **JSON Web Token (JWT)**, enkripsi sandi **bcryptjs**, dan kalkulasi geospasial presisi menggunakan formula **Haversine**.

---

## 2. Identifikasi User (Aktor Sistem)

Berdasarkan analisis struktur basis data pada skema Prisma (`prisma/schema.prisma`), definisi enum `Role`, serta implementasi *middleware* otorisasi (`roleMiddleware.js`), sistem MABBACA memiliki **3 jenis user utama (aktor sistem)**:

```
                          ┌──────────────────────┐
                          │   SISTEM MABBACA     │
                          └──────────┬───────────┘
                                     │
          ┌──────────────────────────┼──────────────────────────┐
          │                          │                          │
          ▼                          ▼                          ▼
┌───────────────────┐      ┌───────────────────┐      ┌───────────────────┐
│     USER 1:       │      │     USER 2:       │      │     USER 3:       │
│  Warga Pembaca    │      │  Mitra Literasi   │      │   Administrator   │
│   (Role: USER)    │      │   (Role: MITRA)   │      │   (Role: ADMIN)   │
└───────────────────┘      └─────────┬─────────┘      └───────────────────┘
                                     │
             ┌───────────────────────┼───────────────────────┐
             ▼                       ▼                       ▼
    ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
    │ Sub-tipe:       │     │ Sub-tipe:       │     │ Sub-tipe:       │
    │ TOKO_BUKU       │     │ PERPUSTAKAAN    │     │ KOMUNITAS       │
    └─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **User 1 — Warga Pembaca (`USER`):** Pengguna masyarakat umum, pelajar, mahasiswa, dan penikmat literasi yang memanfaatkan sistem untuk mencari bahan bacaan, memesan buku ke toko fisik, meminjam buku fisik di perpustakaan, mengikuti event literasi, bergabung ke komunitas, serta berpartisipasi dalam gamifikasi membaca.
2. **User 2 — Mitra Penyedia Literasi Lokal (`MITRA`):** Pengguna institusi atau entitas penyedia literasi lokal di Kabupaten Sidrap yang terikat dengan model profil kemitraan (`MitraProfile`). Aktor ini memiliki status peninjauan akun (`PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`) dan terbagi ke dalam 3 sub-jenis entitas operasional di lapangan:
   - **Mitra Toko Buku (`TOKO_BUKU`):** Pengelola toko buku fisik komersial.
   - **Mitra Perpustakaan (`PERPUSTAKAAN`):** Petugas Dinas Perpustakaan Daerah, Perpustakaan Desa, atau POCADI.
   - **Mitra Komunitas Literasi (`KOMUNITAS`):** Pengurus komunitas baca, relawan, dan inisiator lapak baca jalanan.
3. **User 3 — Pengelola Pusat Sistem / Administrator (`ADMIN`):** Staf pengelola atau dinas berwenang yang memegang kendali eksekutif untuk memantau data literasi seluruh kecamatan di Kabupaten Sidrap, memvalidasi pendaftaran mitra baru, mengelola akun pengguna, dan mengawasi sirkulasi buku serta kegiatan literasi daerah.

---

## 3. User 1: Warga Pembaca (`USER`)

### A. Identitas dan Tujuan Keberadaan
Aktor Warga Pembaca adalah entitas masyarakat umum di Kabupaten Sidrap. Tujuan keberadaannya adalah sebagai konsumen dan partisipan utama dalam ekosistem literasi. Warga menggunakan sistem untuk memperoleh informasi ketersediaan buku fisik terdekat dari tempat tinggalnya, melakukan transaksi pembelian atau peminjaman, memperluas wawasan melalui artikel edukatif, serta termotivasi membangun kebiasaan membaca melalui penghargaan gamifikasi.

### B. Hak Akses dan Halaman yang Dapat Diakses
Warga Pembaca memiliki hak akses terhadap seluruh halaman publik dan area terproteksi khusus *user*:
* **Halaman Publik:** Beranda (`/`), Pencarian Universal (`/search`), Direktori & Detail Buku (`/buku`, `/buku/:id`), Direktori & Detail Toko Buku (`/literasi/toko`, `/literasi/toko/:id`), Direktori & Detail Perpustakaan (`/literasi/perpustakaan`, `/literasi/perpustakaan/:id`), Direktori & Detail Komunitas (`/komunitas`, `/komunitas/:id`), Kalender & Detail Event (`/event`, `/event/:id`), Indeks & Pembaca Artikel Literasi (`/baca-5-menit`, `/baca-5-menit/:id`), serta Halaman Tentang Kami (`/about`).
* **Halaman Terproteksi User:** Dasbor Warga Pembaca (`/dashboard`) dan Pengaturan Profil Pribadi (`/profile`).
* **Batasan Akses:** Warga dilarang mengakses Dasbor Mitra (`/mitra/dashboard`), Dasbor Administrator (`/admin/dashboard`), maupun endpoint manipulasi inventaris/verifikasi data.

### C. Fitur dan Alur Penggunaan Sistem
1. **Registrasi & Login:** Warga mendaftar melalui `/register` dengan menginput nama, email, kata sandi, nomor kontak, dan kecamatan domisili di Sidrap, kemudian masuk melalui formulir `/login`.
2. **Pencarian Buku & Deteksi Ketersediaan Ganda (*Dual Availability*):** Warga mencari buku melalui kolom pencarian. Di halaman detail buku (`/buku/:id`), sistem menampilkan informasi bibliografi lengkap, jarak fisik dalam kilometer (menggunakan formula *Haversine*), serta dua opsi aksi:
   - **Tab Beli di Toko Buku:** Warga mengklik tombol *"Pesan via WhatsApp"*. Sistem secara otomatis mencatat data pesanan ke database (`Order` dan `OrderItem`), menghasilkan kode unik (`#ORD-YYYYMMDD-XXXX`), lalu membuka aplikasi WhatsApp dengan pesan terformat rapi yang ditujukan ke nomor pengelola toko.
   - **Tab Pinjam di Perpustakaan:** Warga melihat nomor panggil (*call number*), letak rak, dan sisa kuota eksemplar, lalu mengklik tombol *"Pinjam Sekarang"*. Sistem memvalidasi ketersediaan stok fisik dan mencatat permohonan pinjam berstatus `PENDING` di database.
3. **Interaksi Sosial & Komunitas:** Warga dapat mendaftar kegiatan literasi (`/event/:id`), bergabung menjadi anggota komunitas (`/komunitas/:id`), memberi rating (1–5 bintang) dan komentar ulasan buku, serta menandai item favorit (buku, toko, perpustakaan, komunitas, event, artikel).
4. **Gamifikasi & Dasbor Aktivitas:** Di halaman `/dashboard`, warga dapat memantau perolehan poin pengalaman (XP), level membaca (*Pembaca Pemula*, *Sahabat Buku*, *Penggerak Literasi*, *Inspirator Literasi*), menyelesaikan misi literasi harian, memantau riwayat peminjaman buku dan pesanan toko, serta melihat posisinya di papan peringkat (*Leaderboard*) se-Kabupaten Sidrap.

### D. Pengelolaan Data
* **Melihat Data:** Seluruh katalog publik, profil toko/perpus/komunitas, riwayat pesanan pribadi, log peminjaman buku pribadi, misi harian, poin/level pribadi, notifikasi sistem, dan data profil sendiri.
* **Menambah Data:** Permohonan pinjam buku perpustakaan (`Borrowing`), pesanan buku toko (`Order`), ulasan & rating (`Review`), pendaftaran event (`EventParticipant`), pendaftaran komunitas (`CommunityMember`), bookmark favorit (`UserFavorite`), klaim penyelesaian misi (`UserMission`), dan log aktivitas membaca.
* **Mengubah Data:** Data profil pribadi (nama, foto profil/avatar, bio, nomor telepon, kecamatan asal, kata sandi), serta ulasan/rating milik sendiri.
* **Menghapus Data:** Menghapus item dari daftar favorit, membatalkan permohonan pinjam/pendaftaran event sebelum diproses, keluar dari keanggotaan komunitas, dan menghapus ulasan milik sendiri.

---

## 4. User 2: Mitra Penyedia Literasi Lokal (`MITRA`)

### A. Identitas dan Tujuan Keberadaan
Aktor Mitra adalah institusi, pelaku usaha, instansi perpustakaan, atau kelompok komunitas literasi di Kabupaten Sidrap. Tujuan keberadaannya adalah menyediakan, mengelola, dan mendistribusikan koleksi bahan bacaan fisik, layanan pinjam buku, serta kegiatan literasi masyarakat.

### B. Hak Akses dan Halaman yang Dapat Diakses
* **Halaman Publik:** Sama seperti warga umum.
* **Halaman Terproteksi Mitra:** Dasbor Operasional Mitra (`/mitra/dashboard`) dan Pengaturan Profil Organisasi (`/mitra/profile` atau `/profile`).
* **Siklus Status Kemitraan (`MitraStatus`):**
  - **`PENDING`:** Saat baru mendaftar mandiri via `/register-mitra`. Dasbor menampilkan layar *timeline* verifikasi 3 tahap oleh Admin MABBACA dan tombol bantuan WhatsApp. Seluruh menu inventaris dan sirkulasi terkunci.
  - **`APPROVED`:** Akun telah divalidasi admin. Seluruh menu operasional terbuka penuh dan profil unit tampil di direktori publik.
  - **`REJECTED`:** Pendaftaran ditolak. Dasbor menampilkan alasan resmi penolakan dari admin dan opsi pendaftaran ulang.
  - **`SUSPENDED`:** Akun ditangguhkan sementara waktu karena evaluasi administratif.

### C. Pembagian Sub-Jenis Mitra dan Alur Kerjanya

#### 1. Mitra Toko Buku Fisik (`TOKO_BUKU`)
* **Alur & Fitur Operasional:** 
  1. Pengelola toko masuk ke `/mitra/dashboard` pada tab *Inventaris Produk*.
  2. Pengelola dapat mencari buku yang sudah ada di katalog master MABBACA atau membuat entri buku baru lengkap dengan harga jual (Rp) dan jumlah stok fisik di toko (`StoreProduct`).
  3. Saat ada pembaca yang memesan via WhatsApp, transaksi tercatat di tab *Pesanan Masuk* (`Order`). Pengelola toko dapat memantau rincian buku, mengubah status pesanan (`PENDING` ➔ `CONTACTED` ➔ `CONFIRMED` ➔ `COMPLETED` / `CANCELLED`), serta menghubungi nomor WhatsApp pembeli secara langsung.
  4. Pengelola dapat memantau 4 kartu metrik KPI (Total Produk, Pesanan Masuk, Estimasi Omset, Total Dilihat) dan grafik tren penjualan (Recharts).

#### 2. Mitra Perpustakaan Daerah & Desa (`PERPUSTAKAAN`)
* **Alur & Fitur Operasional:**
  1. Pustakawan mengelola koleksi buku fisik perpustakaan (`LibraryCollection`) dengan menginput nomor panggil (*call number*), letak rak buku (misal: *Rak Fiksi A-02*), jumlah total eksemplar (`quantity`), kuota eksemplar tersedia (`availableQuantity`), serta tautan baca digital jika tersedia.
  2. Pada tab *Sirkulasi Peminjaman*, pustakawan menerima pengajuan pinjam dari warga. Pustakawan dapat:
     - Mengklik **Setujui Peminjaman (`Approve`)**: Status berubah menjadi `APPROVED`/`BORROWED` dan sistem memotong `availableQuantity`.
     - Mengklik **Tolak Peminjaman (`Reject`)**: Memberikan alasan penolakan dan memulihkan antrean.
     - Mengklik **Konfirmasi Pengembalian (`Return`)**: Saat warga mengembalikan buku fisik, status berubah menjadi `RETURNED` dan sistem secara atomik memulihkan kuantitas `availableQuantity`.
  3. Pustakawan memantau metrik total koleksi, sirkulasi peminjaman aktif, dan antrean permohonan.

#### 3. Mitra Komunitas Literasi & Lapak Baca (`KOMUNITAS`)
* **Alur & Fitur Operasional:**
  1. Pengurus komunitas mengelola publikasi kegiatan lapak baca dan agenda bedah buku (`Event`).
  2. Pengurus menginput judul acara, tanggal, jam pelaksanaan, lokasi temu (misal: Monumen Ganggawa), target peserta, kapasitas, dan poster acara.
  3. Pada tab *Anggota & Relawan*, pengurus memantau warga yang bergabung ke komunitas (`CommunityMember`) serta daftar peserta yang mendaftar pada setiap event (`EventParticipant`).

### D. Pengelolaan Data
* **Melihat Data:** Data profil kemitraan sendiri, katalog inventaris/koleksi milik sendiri, daftar pesanan toko masuk, sirkulasi peminjaman buku perpus, data pendaftar event/relawan, dan analitik performa organisasi.
* **Menambah Data:** Produk toko (`StoreProduct`), koleksi perpustakaan (`LibraryCollection`), agenda kegiatan (`Event`), artikel edukasi literasi (`Article`), serta data master buku baru jika belum ada di sistem.
* **Mengubah Data:** Profil organisasi mitra (nama, alamat, kecamatan, deskripsi, jam buka, foto banner/logo, kontak WhatsApp), harga & stok produk toko, data nomor panggil/rak koleksi perpus, status permohonan pinjam warga, status pesanan toko, serta status/jadwal event.
* **Menghapus Data:** Menghapus produk dari etalase toko, menghapus koleksi perpustakaan, membatalkan/menghapus event milik sendiri, dan menghapus artikel yang ditulis sendiri.

---

## 5. User 3: Pengelola Pusat Sistem / Administrator (`ADMIN`)

### A. Identitas dan Tujuan Keberadaan
Aktor Administrator adalah pengelola pusat sistem atau perwakilan dinas/instansi terkait yang bertanggung jawab penuh atas tata kelola, validitas data, keamanan, dan pengawasan ekosistem literasi di tingkat Kabupaten Sidenreng Rappang.

### B. Hak Akses dan Halaman yang Dapat Diakses
* **Halaman Masuk Khusus:** Portal Login Administrator (`/admin/login`) dengan otentikasi ketat dan pembatasan laju kueri (*rate limiter* khusus).
* **Dasbor Pengelola:** Panel Administrator Terpadu (`/admin/dashboard`) yang dilindungi pengawal rute berlapis (`AdminRoute` di frontend dan `requireAdmin` di backend). Jika diakses oleh non-admin, sistem menampilkan layar *Error 403: Akses Ditolak*.
* **Area Kewenangan:** Memiliki hak akses *Super-User* untuk membaca, menyetujui, mengubah, menangguhkan, atau menghapus data di seluruh modul sistem.

### C. Fitur dan Alur Penggunaan Sistem
1. **Pusat Verifikasi Kemitraan (*Mitra Verification Center*):**  
   Admin menerima notifikasi dan indikator *badge* menyala jika ada mitra baru yang mendaftar. Admin memeriksa keabsahan pendaftar (nama usaha, kategori mitra, alamat kecamatan di Sidrap, nomor WhatsApp penanggung jawab), lalu mengambil tindakan:
   - **Setujui (*Approve*):** Mengubah status menjadi `APPROVED`, menerbitkan profil ke publik, dan membuka dasbor operasional mitra.
   - **Tolak (*Reject*):** Membuka modal input untuk memasukkan **Alasan Penolakan Resmi** (misal: *Alamat lokasi berada di luar Kabupaten Sidrap*). Alasan ini tersimpan di database dan ditampilkan pada layar dasbor pendaftar.
   - **Tangguhkan (*Suspend*):** Membekukan operasional mitra yang bermasalah.
2. **Monitoring Literasi Antar-Kecamatan (Analisis Geospasial Daerah):**  
   Admin memantau sebaran fasilitas literasi di seluruh kecamatan se-Kabupaten Sidrap (*Pangkajene, Maritengngae, Baranti, Watang Pulu, Tellu Limpoe, Dua Pitue, Panca Rijang, Kulo, Panca Lautang, Watang Sidenreng, Pitu Riase*) melalui grafik batang interaktif (Recharts) untuk mendeteksi wilayah yang kekurangan fasilitas buku.
3. **Manajemen Pengguna (*User Management*):**  
   Admin dapat melihat seluruh akun terdaftar, memfilter berdasarkan peran (`USER`, `MITRA`, `ADMIN`), menonaktifkan akun yang melanggar aturan (`isActive: false`), atau melakukan penghapusan akun.
4. **Tata Kelola Master Data & Ekosistem:**  
   Admin dapat mengawasi dan memoderasi seluruh katalog buku daerah, kategori buku, agenda event, artikel literasi kilat, data ulasan/komentar masyarakat, serta laporan rekapitulasi transaksi daerah.

### D. Pengelolaan Data
* **Melihat Data:** Seluruh data master sistem (User, Mitra, Buku, Koleksi, Toko, Perpustakaan, Komunitas, Event, Artikel, Order, Borrowing, Review, Notifikasi, Statistik Wilayah).
* **Menambah Data:** Menambahkan master kategori buku, data buku baru, artikel edukasi resmi, dan akun administratif baru.
* **Mengubah Data:** Mengubah status verifikasi mitra, mengubah status keaktifan user, memperbarui data katalog master, mengedit artikel, serta memperbarui profil admin.
* **Menghapus Data:** Menghapus akun pengguna/mitra, menghapus buku, membatalkan event yang melanggar ketentuan, dan menghapus komentar ulasan yang tidak pantas (*moderasi konten*).

---

## 6. Hubungan Antar-User (Interaksi, Aliran Data, dan Ketergantungan)

Ekosistem MABBACA beroperasi melalui relasi dan aliran data sirkular yang menghubungkan ketiga aktor secara dinamis:

```
                      ┌────────────────────────────────────────┐
                      │          ADMINISTRATOR                 │
                      │  - Verifikasi Mitra (Approve/Reject)   │
                      │  - Pantau Sebaran 8+ Kecamatan         │
                      │  - Manajemen User & Master Data        │
                      └───────┬────────────────────────▲───────┘
                              │ Validasi Akun          │ Laporan Metrik
                              ▼ & Pengawasan           │ & Verifikasi
                      ┌────────────────────────┐       │
         ┌────────────┤    MITRA LITERASI      ├───────┘
         │            │ (Toko, Perpus, Komun.) │
         │            └───────▲────────┬───────┘
         │ Data Buku,         │        │ Sedia Buku, Pinjaman,
         │ Koleksi & Event    │        │ Event & Respon Pesanan
         ▼                    │        ▼
┌─────────────────────────────┴────────────────────────┐
│                   WARGA PEMBACA                      │
│ - Pesan Buku Toko via WA (Direct Checkout)           │
│ - Ajukan Pinjam Buku Perpus (Stock-Lock System)      │
│ - Daftar Event & Komunitas, Tulis Review, Misi XP    │
└──────────────────────────────────────────────────────┘
```

### A. Interaksi Antara User 1 (Warga) dan User 2 (Mitra)
* **Alur Toko Buku:** Warga memilih buku di katalog toko mitra ➔ Sistem mencatat `Order` ➔ Warga mengirim draf WhatsApp ➔ Mitra Toko menerima pesan, memverifikasi ketersediaan stok fisik di dasbornya, mengubah status `Order`, dan memproses pengiriman/pengambilan buku.
* **Alur Perpustakaan:** Warga mengajukan `Borrowing` daring ➔ Sistem memeriksa `availableQuantity` pada `LibraryCollection` ➔ Permohonan masuk ke antrean dasbor Mitra Perpustakaan ➔ Pustakawan menyetujui (`Approve`) sehingga stok terkunci ➔ Warga mengambil buku fisik di perpustakaan ➔ Saat buku kembali, pustakawan mengonfirmasi `Return` yang memulihkan stok dan memicu reward poin gamifikasi ke akun Warga.
* **Alur Komunitas & Event:** Mitra Komunitas mempublikasikan `Event` ➔ Warga mendaftar sebagai `EventParticipant` ➔ Mitra memantau daftar hadir dan melakukan konfirmasi kehadiran (*check-in*) peserta di lokasi acara.

### B. Interaksi Antara User 2 (Mitra) dan User 3 (Admin)
* Mitra mendaftar secara mandiri melalui form `/register-mitra` dengan status awal `PENDING` ➔ Berkas pendaftaran masuk ke antrean dasbor Admin ➔ Admin meninjau data lapangan dan memutuskan `Approve` atau `Reject` ➔ Jika disetujui, sistem membuka akses dasbor mitra dan menerbitkan toko/perpustakaan/komunitas ke direktori publik Sidrap; jika ditolak, mitra menerima catatan alasan penolakan pada layarnya.

### C. Interaksi Antara User 1 (Warga) dan User 3 (Admin)
* Warga mendaftar akun dan beraktivitas (membaca artikel, meminjam buku, menyelesaikan misi) ➔ Data aktivitas diagregasikan oleh sistem ke dalam metrik literasi kecamatan ➔ Admin memantau grafik partisipasi membaca warga di dasbor pengelola untuk mengevaluasi Indeks Pembangunan Literasi Masyarakat (IPLM) per kecamatan. Jika terdapat ulasan warga yang tidak etis, Admin dapat memoderasi atau menghapusnya.

---

## 7. Perbandingan Hak Akses Antar-User

Tabel komparasi berikut menyajikan perbandingan objektif seluruh hak akses, fitur, dan tanggung jawab masing-masing user dalam sistem MABBACA:

| Parameter Evaluasi | Warga Pembaca (`USER`) | Mitra Literasi (`MITRA`) | Administrator (`ADMIN`) |
| :--- | :--- | :--- | :--- |
| **Fungsi Utama** | Konsumen & partisipan literasi (membaca, meminjam, membeli, berpartisipasi). | Penyedia fasilitas, pengelola koleksi buku fisik, dan penyelenggara event. | Pengawas ekosistem, kurator mitra, analis data daerah, dan administrator sistem. |
| **Akses Dashboard** | Dasbor Pembaca (`/dashboard`) berorientasi gamifikasi & aktivitas pribadi. | Dasbor Operasional (`/mitra/dashboard`) adaptif sesuai tipe unit (Toko/Perpus/Komunitas). | Dasbor Pengelola (`/admin/dashboard`) berorientasi analitik daerah & verifikasi. |
| **Fitur Utama** | Dual Availability search, Direct WA Checkout, Pinjam Perpus, Misi XP, Leaderboard. | Kelola inventaris buku/koleksi, sirkulasi pinjaman, order masuk, publikasi event. | Verifikasi mitra pending, monitoring 11 kecamatan, kelola user, master kategori. |
| **Hak Melihat Data** | Seluruh data publik, riwayat transaksi/pinjam pribadi, misi, dan leaderboard. | Data publik, inventaris sendiri, pesanan toko sendiri, dan sirkulasi perpus sendiri. | Seluruh data sistem (User, Mitra, Transaksi, Pinjaman, Analitik Wilayah). |
| **Hak Menambah Data** | Pesanan toko, pengajuan pinjam, pendaftaran event/komunitas, ulasan/rating, bookmark. | Produk buku toko, koleksi perpus (rak/call number), event, artikel edukasi. | Kategori buku, master buku baru, artikel resmi, pengumuman, akun admin baru. |
| **Hak Mengubah Data** | Profil pribadi, kata sandi, ulasan milik sendiri. | Profil organisasi, stok/harga produk, status pinjam buku, status pesanan, event. | Status verifikasi mitra (Approve/Reject/Suspend), status user, seluruh master data. |
| **Hak Menghapus Data** | Item favorit, ulasan sendiri, pembatalan pendaftaran sebelum disetujui. | Menghapus produk toko, koleksi perpus, membatalkan event, artikel sendiri. | Menghapus akun user/mitra, memoderasi ulasan, menghapus katalog/event bermasalah. |
| **Hak Transaksi** | Mengajukan beli via WA & mengajukan pinjam perpustakaan daring. | Memproses & mengubah status pesanan masuk dari pembeli. | Mengawasi rekapitulasi seluruh log transaksi daerah. |
| **Hak Verifikasi** | Tidak memiliki hak verifikasi. | Memverifikasi (Approve/Reject/Return) permohonan pinjam buku perpustakaan. | Memverifikasi (Approve/Reject/Suspend) legalitas pendaftaran akun mitra baru. |
| **Batasan Akses** | Dilarang masuk ke panel mitra, panel admin, dan manipulasi inventaris pihak lain. | Dilarang mengubah status akun sendiri ke approved, dilarang mengakses panel admin. | Dilarang menyalahgunakan wewenang manipulasi data transaksi riil milik mitra. |
| **Tanggung Jawab** | Menjaga etika ulasan, mematuhi tenggat pinjam buku fisik ke perpustakaan. | Memastikan akurasi stok fisik, merespons pesanan WA, melayani peminjam buku. | Memastikan validitas data mitra daerah dan menjaga ketersediaan layanan sistem. |

---

## 8. Kelebihan dan Kekurangan Setiap User

### A. Warga Pembaca (`USER`)

#### 1. Kelebihan (Berdasarkan Implementasi Aktual):
* **Kemudahan Akses Informasi Terpadu:** Warga dapat mengetahui ketersediaan buku fisik secara komprehensif melalui *Dual Availability Engine* tanpa perlu mengunjungi toko buku atau perpustakaan secara fisik terlebih dahulu.
* **Presisi Jarak Geospasial:** Terintegrasi formula *Haversine* yang memberikan indikator jarak nyata dalam kilometer dari lokasi warga ke penyedia buku, mempermudah penentuan titik literasi terdekat.
* **Transaksi Tanpa Hambatan (*Zero Friction*):** Integrasi *Direct WhatsApp Checkout* memungkinkan pemesanan buku ke toko lokal secara langsung dengan format pesan terstruktur otomatis, sesuai kebiasaan komunikasi masyarakat daerah.
* **Kepastian Peminjaman Buku:** Adanya penguncian kuantitas stok otomatis (`availableQuantity`) saat permohonan disetujui memberikan jaminan bahwa eksemplar buku fisik tersedia saat diambil di perpustakaan.
* **Motivasi Membaca Berkelanjutan:** Fitur gamifikasi (XP, kenaikan level, misi harian, papan peringkat) memberikan dorongan psikologis positif untuk meningkatkan intensitas membaca harian.

#### 2. Kekurangan dan Keterbatasan (Berdasarkan Implementasi Aktual):
* **Ketergantungan Pembayaran & Logistik Manual:** Sistem belum mengintegrasikan *payment gateway* daring otomatis (seperti Midtrans/Xendit) atau kalkulasi ongkos kirim otomatis; penyelesaian pembayaran buku dan pengiriman fisik masih bergantung pada kesepakatan manual via WhatsApp.
* **Ketergantungan Verifikasi Fisik Perpustakaan:** Pengambilan dan pengembalian buku fisik tetap mengharuskan warga datang langsung ke gedung perpustakaan penyedia.
* **Ketiadaan Fitur Perpanjangan Pinjam Mandiri:** Warga belum dapat mengajukan perpanjangan durasi pinjam (*extend duration*) secara mandiri dari antarmuka dasbor jika masa peminjaman hampir habis.

---

### B. Mitra Penyedia Literasi (`MITRA`)

#### 1. Kelebihan (Berdasarkan Implementasi Aktual):
* **Digitalisasi Katalog Gratis & Siap Pakai:** Mitra toko buku, perpustakaan, dan komunitas memperoleh etalase digital profesional tanpa perlu membangun infrastruktur web mandiri.
* **Dasbor Adaptif Berbasis Peran:** Antarmuka `/mitra/dashboard` bertransformasi secara dinamis menyesuaikan tipe unit mitra (`TOKO_BUKU`, `PERPUSTAKAAN`, `KOMUNITAS`), menyajikan fitur yang relevan tanpa menu yang membingungkan.
* **Otomasi Manajemen Sirkulasi Perpustakaan:** Pustakawan dapat mengontrol sirkulasi pinjaman, nomor panggil, letak rak, serta persetujuan dan pengembalian stok dengan tombol instan yang mengeksekusi transaksi basis data atomik.
* **Transparansi Status Kemitraan:** Layanan *timeline* pada status `PENDING` dan transparansi alasan penolakan pada status `REJECTED` memberikan kejelasan proses verifikasi bagi pelaku usaha.

#### 2. Kekurangan dan Keterbatasan (Berdasarkan Implementasi Aktual):
* **Ketergantungan Penuh pada Persetujuan Admin:** Mitra yang baru mendaftar tidak dapat menginput produk atau koleksi sebelum disetujui oleh Administrator MABBACA.
* **Tipe Kemitraan Tunggal per Akun:** Satu akun mitra saat ini hanya dapat memilih satu jenis profil (`TOKO_BUKU`, `PERPUSTAKAAN`, atau `KOMUNITAS`), belum mendukung entitas gabungan (misal: komunitas yang juga memiliki toko buku fisik).
* **Pencatatan Stok Toko Bersifat Manual:** Pengurangan stok buku toko saat terjadi transaksi via WhatsApp masih harus disesuaikan secara manual oleh pemilik toko setelah barang laku.

---

### C. Administrator (`ADMIN`)

#### 1. Kelebihan (Berdasarkan Implementasi Aktual):
* **Pusat Kendali Pengawasan Wilayah Riil:** Mampu memetakan dan membandingkan fasilitas literasi di 11 kecamatan se-Kabupaten Sidrap secara visual melalui grafik batang interaktif (Recharts), mendukung pengambilan keputusan berbasis data (*data-driven policy*).
* **Kendali Mutu Ekosistem yang Ketat:** Adanya mekanisme verifikasi mitra bertingkat (*Approve/Reject dengan catatan alasan*) mencegah masuknya data fiktif atau toko buku bodong.
* **Keamanan Akses Tingkat Tinggi:** Dilindungi portal masuk khusus (`/admin/login`), pembatasan laju kueri ketat, serta proteksi layar ganda (*Route Guards* dan verifikasi token backend).

#### 2. Kekurangan dan Keterbatasan (Berdasarkan Implementasi Aktual):
* **Beban Kurasi Manual:** Administrator harus memvalidasi setiap pendaftar mitra dan memeriksa kebenaran nomor WhatsApp/alamat satu per satu secara manual.
* **Belum Ada Fitur Audit Trail Khusus:** Sistem belum menyediakan tabel log audit khusus yang mencatat aktivitas administratif staf admin secara rinci (misalnya rekam jejak siapa yang menghapus user atau memodifikasi buku master).

---

## 9. Analisis Keamanan Hak Akses (Security & Architecture Audit)

Pemeriksaan mendalam terhadap *source code* autentikasi, otorisasi, dan perlindungan data menghasilkan analisis teknis sebagai berikut:

### A. Autentikasi dan Manajemen Sesi
* **Mekanisme Token:** Menggunakan JSON Web Token (JWT) dengan algoritma standar HMAC-SHA256 (`server/src/config/jwt.js`). Token disematkan pada *header* HTTP `Authorization: Bearer <token>`.
* **Masa Berlaku Token:** Ditetapkan selama 7 hari (`JWT_EXPIRES_IN="7d"`). Token diverifikasi oleh `authMiddleware.js` dengan melakukan kueri pencocokan ke database (`prisma.user.findUnique`) guna memastikan akun pengguna masih aktif (`isActive: true`) dan belum dihapus (`deletedAt: null`).
* **Penyimpanan Kredensial:** Kata sandi dienkripsi menggunakan *salt rounds* 10 melalui pustaka `bcryptjs`. Kata sandi mentah (*plain text*) tidak pernah disimpan atau dikembalikan ke respons API (`select: { password: false }`).

### B. Otorisasi dan Pembatasan Peran (Authorization & RBAC)
* **Backend Role Enforcement:** Diimplementasikan melalui `roleMiddleware.js` dengan fungsi `authorize(...roles)`, `requireAdmin`, `requireMitra`, `requireApprovedMitra`, dan `requireMitraType`. Middleware ini memverifikasi bahwa akun yang meminta akses memiliki *role* dan status kemitraan `APPROVED` yang valid.
* **Frontend Route Guards:** Diimplementasikan di `client/src/routes/AppRoutes.jsx` melalui tiga komponen pembungkus:
  - `<ProtectedRoute>`: Mengalihkan pengunjung belum login ke `/login`.
  - `<MitraRoute>`: Memastikan pengguna memiliki peran `MITRA`.
  - `<AdminRoute>`: Memastikan pengguna memiliki peran `ADMIN`. Jika pengguna bertipe `USER` atau `MITRA` mencoba membuka rute `/admin/*`, komponen secara eksplisit menampilkan layar **Error 403: Akses Ditolak** lengkap dengan identitas akun yang sedang aktif dan tombol keluar yang aman.

### C. Perlindungan Kepemilikan Data (IDOR Prevention)
* Pada berkas `ownershipMiddleware.js`, sistem telah menerapkan validasi kepemilikan objek (*Object-Level Access Control*) untuk entitas toko (`checkStoreOwnership`), perpustakaan (`checkLibraryOwnership`), komunitas (`checkCommunityOwnership`), event (`checkEventOwnership`), artikel (`checkArticleOwnership`), dan ulasan (`checkReviewOwnership`). Administrator diberikan hak *bypass* yang sah, sedangkan mitra lain ditolak dengan kode HTTP 403 jika mencoba memanipulasi data milik mitra lain.

### D. Integritas Transaksi Basis Data (Concurrency & Race Condition)
* Pada `borrowing.service.js` dan `order.service.js`, operasi penting dibungkus dalam transaksi atomik Prisma (`prisma.$transaction`). Sistem memvalidasi ketersediaan stok fisik (`availableQuantity >= quantity`) sebelum menyetujui peminjaman, mencegah kondisi balapan (*race condition*) saat beberapa pengguna meminjam eksemplar yang sama secara bersamaan.

---

## 10. Permasalahan yang Ditemukan (Temuan Analisis Sistem)

Berdasarkan audit langsung terhadap kode sumber backend, frontend, dan skema database, ditemukan beberapa catatan teknis dan potensi celah yang perlu diperhatikan:

### 1. Temuan Keamanan: Celah Otorisasi dan Eskalasi Peran pada Endpoint `PUT /api/users/:id`
* **Lokasi Kode:** `server/src/routes/userRoutes.js` (Baris 12) dan `server/src/services/user.service.js` (Baris 101-116).
* **Deskripsi Masalah:** Rute `router.put('/:id', authenticate, userController.updateUser)` hanya menggunakan middleware `authenticate` tanpa memeriksa apakah `req.user.id === parseInt(req.params.id)` atau `req.user.role === 'ADMIN'`. Selain itu, pada `user.service.js`, fungsi menerima parameter `data.role` dan `data.isActive` tanpa filter.
* **Dampak:** Pengguna biasa (`USER`) yang terotentikasi dapat mengirim *request* `PUT /api/users/<id_sendiri>` dengan payload `{"role": "ADMIN"}` untuk menaikkan hak aksesnya menjadi Administrator (*Privilege Escalation*), atau mengubah data profil milik pengguna lain (*IDOR*).
* **Rekomendasi Perbaikan:** Batasi endpoint `PUT /api/users/:id` khusus untuk peran `ADMIN` (`authenticate, requireAdmin`), dan arahkan pembaruan profil user biasa hanya melalui endpoint aman `PUT /api/auth/profile` yang selalu mengekstrak ID dari token JWT (`req.user.id`) tanpa mengizinkan perubahan field `role`.

### 2. Temuan Arsitektur: Sinkronisasi Stok Toko Bersifat Manual
* **Lokasi Kode:** `server/src/services/order.service.js`.
* **Deskripsi Masalah:** Saat pesanan dibuat (`createOrder`), sistem memvalidasi bahwa stok tersedia (`storeProduct.stock >= qty`), namun tidak mengurangi nilai `storeProduct.stock` secara otomatis saat pesanan disetujui (`COMPLETED`). Pengurangan stok masih harus dilakukan secara manual oleh pengelola toko.
* **Dampak:** Berpotensi terjadi ketidakcocokan data stok fisik jika pemilik toko lupa mengedit kuantitas stok di dasbor setelah melayani pesanan via WhatsApp.

### 3. Temuan Integrasi Frontend vs Backend: Ketiadaan Fitur Pembatalan Pinjam oleh User
* **Lokasi Kode:** `server/src/routes/borrowingRoutes.js` dan `client/src/pages/user/UserDashboardPage.jsx`.
* **Deskripsi Masalah:** Backend menyediakan endpoint `DELETE /api/borrowings/:id` untuk membatalkan pengajuan pinjam yang masih `PENDING`, namun antarmuka tab peminjaman pada dasbor user di frontend belum menampilkan tombol aksi untuk membatalkan pengajuan tersebut.

---

## 11. Rekomendasi Pengembangan Sistem

Untuk meningkatkan keandalan, skalabilitas, dan pengalaman pengguna platform MABBACA, disusun rekomendasi tindak lanjut yang dikelompokkan ke dalam 3 kategori:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PANDUAN REKOMENDASI PENGEMBANGAN                     │
├─────────────────────────────────────────────────────────────────────────┤
│ 1. FITUR YANG SUDAH TERSEDIA & STABIL                                   │
│    - Autentikasi JWT & Role Guards (USER, MITRA, ADMIN).                │
│    - Dual Availability Engine & Haversine Distance Calculation.         │
│    - Direct WhatsApp Checkout & Stock-Lock Borrowing Concurrency.       │
│    - Gamifikasi Membaca (XP, Level, Misi Harian, Leaderboard).          │
│    - Visualisasi Grafik Dasbor Admin & Mitra (Recharts).                │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. FITUR YANG PERLU DIPERBAIKI (PRIORITAS CEPAT)                        │
│    - Perbaikan otorisasi rute PUT /api/users/:id untuk cegah eskalasi.  │
│    - Penambahan opsi pembatalan pinjam pending di dasbor user frontend. │
│    - Otomasi pemotongan stok toko saat order berstatus COMPLETED.       │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. FITUR PENGEMBANGAN MASA DEPAN (ROADMAP JANGKA PANJANG)               │
│    - Integrasi Payment Gateway resmi untuk pembayaran buku daring.      │
│    - Modul Baca E-Book Interaktif terenkripsi dalam aplikasi.           │
│    - Integrasi Peta Interaktif (Leaflet / Mapbox) titik baca Sidrap.    │
│    - Notifikasi Push / WhatsApp Gateway Otomatis (Fonnte / Twilio).     │
└─────────────────────────────────────────────────────────────────────────┘
```

1. **Fitur yang Sudah Tersedia dan Terimplementasi Baik:**
   - Sistem Autentikasi dan Guarding Rute Frontend & Backend yang modular.
   - Mesin Ketersediaan Ganda (*Dual Availability*) terintegrasi formula geospasial *Haversine*.
   - Integrasi pesan WhatsApp otomatis untuk transaksi pembelian toko lokal.
   - Peminjaman buku daring perpustakaan dengan pencegahan *race condition* berbasis transaksi atomik.
   - Gamifikasi literasi lengkap dengan misi harian dinamis dan papan peringkat kabupaten.
   - Dasbor analitik dengan grafik persebaran fasilitas literasi di seluruh kecamatan Sidrap.

2. **Fitur yang Perlu Diperbaiki / Disempurnakan (Perbaikan Segera):**
   - **Patching Keamanan `PUT /api/users/:id`:** Mengunci rute tersebut dengan middleware `requireAdmin` dan memastikan field sensitif seperti `role` tidak dapat dimanipulasi oleh sembarang user terotentikasi.
   - **Sinkronisasi Stok Toko Otomatis:** Mengurangi `storeProduct.stock` secara otomatis saat status pesanan diubah menjadi `COMPLETED` oleh mitra toko.
   - **Tombol Batalkan Peminjaman di Frontend:** Menyematkan tombol pembatalan pada kartu peminjaman berstatus `PENDING` di dasbor pembaca.

3. **Fitur Pengembangan Masa Depan (*Future Roadmap*):**
   - **Payment Gateway & Kurir Otomatis:** Menambahkan opsi pembayaran non-tunai (QRIS/Transfer Bank) dan penghitungan tarif kurir lokal Sidrap.
   - **Peta Interaktif Geospasial (*Interactive Map View*):** Menampilkan peta visual interaktif (menggunakan Leaflet atau Mapbox) yang memplot seluruh titik perpustakaan, toko buku, dan lapak baca di Kabupaten Sidrap.
   - **WhatsApp Gateway Otomatis:** Menghubungkan sistem dengan layanan *WhatsApp Business API* pihak ketiga untuk mengirimkan notifikasi persetujuan pinjam atau pengingat jatuh tempo secara otomatis ke nomor ponsel warga.

---

## 12. Kesimpulan

Platform **MABBACA** telah berhasil dibangun sebagai sebuah ekosistem literasi digital yang kokoh, terstruktur, dan kontekstual bagi kebutuhan masyarakat **Kabupaten Sidenreng Rappang (Sidrap)**. 

Berdasarkan analisis menyeluruh terhadap kode sumber dan basis data, pembagian peran pengguna ke dalam **Warga Pembaca (`USER`)**, **Mitra Penyedia Literasi (`MITRA`)**, dan **Administrator (`ADMIN`)** telah mencerminkan rantai nilai literasi daerah secara akurat:
1. **Warga Pembaca** memperoleh kemudahan akses satu pintu (*single-window access*) untuk menemukan bahan bacaan fisik, memesan buku ke toko terdekat via WhatsApp, meminjam buku perpustakaan secara daring, serta termotivasi membaca melalui sistem gamifikasi XP dan leaderboard.
2. **Mitra Penyedia** (Toko Buku, Perpustakaan Daerah/Desa, dan Komunitas) memperoleh sarana digitalisasi operasional dan katalogisasi gratis melalui dasbor adaptif yang mempermudah pengelolaan stok, sirkulasi peminjaman, serta publikasi agenda kegiatan.
3. **Administrator** memegang kendali strategis dalam menjaga keabsahan ekosistem melalui kurasi mitra baru serta memanfaatkan data persebaran fasilitas di 11 kecamatan Sidrap untuk mendukung perumusan kebijakan pemerataan literasi daerah.

Kondisi hak akses sistem secara umum telah terimplementasi dengan baik menggunakan arsitektur *Role-Based Access Control* (RBAC), *Route Guards* berbasis komponen React, dan middleware perlindungan kepemilikan objek (*Ownership Middleware*). Dengan menindaklanjuti beberapa catatan perbaikan minor pada endpoint pembaruan pengguna dan integrasi pembatalan pinjam di antarmuka, platform MABBACA memiliki kesiapan teknologi yang matang untuk diimplementasikan secara nyata guna meningkatkan Indeks Pembangunan Literasi Masyarakat (IPLM) di Kabupaten Sidenreng Rappang.
