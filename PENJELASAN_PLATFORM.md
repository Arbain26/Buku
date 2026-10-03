# 📚 Dokumen Penjelasan Sistem Platform MABBACA
### *Ekosistem Literasi Digital Terpadu Kabupaten Sidenreng Rappang (Sidrap), Sulawesi Selatan*

---

## 1. Gambaran Umum Platform MABBACA

**MABBACA** (yang berakar dari kosa kata bahasa Bugis yang bermakna *"Membaca"*) merupakan platform ekosistem literasi digital berbasis web yang dikembangkan khusus untuk mengintegrasikan seluruh pilar literasi di wilayah **Kabupaten Sidenreng Rappang (Sidrap), Sulawesi Selatan**. Platform ini hadir sebagai solusi konkret dan komprehensif atas permasalahan fragmentasi informasi literasi di daerah, di mana selama ini katalog penjualan buku fisik, sistem peminjaman perpustakaan daerah maupun desa, agenda komunitas baca jalanan, dan kegiatan literasi berjalan secara terpisah tanpa adanya satu gerbang terpadu.

MABBACA memadukan konsep **Marketplace Buku Lokal**, **Direktori Perpustakaan Daerah, Desa, dan POCADI**, **Wadah Komunitas & Lapak Baca Jalanan**, **Kalender Agenda Kegiatan Literasi**, serta **Konten Edukasi Kilat (Baca 5 Menit)** ke dalam satu pintu akses terintegrasi. Melalui platform ini, masyarakat Kabupaten Sidrap dapat dengan mudah mencari judul buku fisik yang dibutuhkan, mengetahui toko buku terdekat yang menyediakannya untuk dibeli, meminjam buku fisik di perpustakaan secara daring, bergabung dengan gerakan lapak baca, mengikuti seminar atau bedah buku, hingga menumbuhkan kebiasaan membaca harian guna mendorong peningkatan Indeks Pembangunan Literasi Masyarakat (IPLM) di Bumi Nene Mallomo.

---

## 2. Arsitektur dan Penjelasan Peran Pengguna (User Roles)

Platform MABBACA mengimplementasikan kontrol akses berbasis peran (*Role-Based Access Control / RBAC*) yang membagi pengguna ke dalam 3 tingkatan utama, yaitu **Warga Pembaca (`USER`)**, **Mitra Penyedia Literasi (`MITRA`)**, dan **Pengelola Pusat Sistem (`ADMIN`)**. Masing-masing peran dirancang dengan hak akses, antarmuka, dan alur kerja (*workflow*) yang saling bersinergi.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PLATFORM MABBACA                              │
└───────┬─────────────────────────────────┬───────────────────────────────┘
        │                                 │                               │
        ▼                                 ▼                               ▼
┌──────────────┐                  ┌──────────────┐                 ┌──────────────┐
│     USER     │                  │    MITRA     │                 │    ADMIN     │
│(Warga/Reader)│                  │(Toko/Perpus/ │                 │ (Pengelola   │
└───────┬──────┘                  │  Komunitas)  │                 │   Pusat)     │
        │                         └───────┬──────┘                 └───────┬──────┘
        ├─ Beli Buku via WA               │                                │
        ├─ Pinjam Buku Online             ├─ Toko: Kelola Stok & Order WA  ├─ Verifikasi Mitra
        ├─ Ikut Event & Komunitas         ├─ Perpus: Sirkulasi Pinjaman    ├─ Pantau Kecamatan
        └─ Misi XP & Gamifikasi           └─ Komunitas: Publikasi Event    └─ Kelola Pengguna
```

---

### A. Pengguna Warga / Pembaca Umum (`USER`)

Peran **Warga Pembaca** diperuntukkan bagi seluruh lapisan masyarakat umum, pelajar, mahasiswa, pengajar, dan pegiat baca di Kabupaten Sidrap. Pengguna pada peran ini memiliki akses penuh terhadap fitur pencarian, transaksi pembelian, sirkulasi peminjaman, partisipasi kegiatan komunitas, serta sistem gamifikasi membaca.

* **Mesin Ketersediaan Ganda (*Dual Availability Engine*) & Deteksi Jarak Terdekat:**  
  Setiap kali warga mencari buku fisik di katalog, sistem secara cerdas menampilkan dua pilihan pemenuhan: membeli dari toko buku lokal atau meminjam secara gratis dari perpustakaan daerah/desa. Terintegrasi dengan kalkulasi formula geospasial *Haversine*, warga dapat melihat jarak presisi dalam satuan kilometer antara lokasi tempat tinggal mereka dengan toko buku atau perpustakaan penyedia.

* **Transaksi Instan Tanpa Hambatan (*Direct WhatsApp Checkout*):**  
  Untuk memudahkan masyarakat daerah bertransaksi tanpa kerumitan administrasi digital yang berbelit, sistem menyediakan pemesanan buku ke toko fisik via WhatsApp. Sistem secara otomatis menyusun draf pesan pemesanan yang mencantumkan nomor pesanan unik (`#ORD-YYYYMMDD-XXXX`), judul buku, harga, dan identitas pembeli, lalu membuka obrolan WhatsApp resmi toko buku dalam satu klik.

* **Peminjaman Buku Perpustakaan Daring (*Online Borrowing System*):**  
  Warga dapat mengajukan permohonan pinjam buku fisik ke Dinas Perpustakaan Daerah Sidrap, perpustakaan desa, atau POCADI secara daring. Sistem menerapkan mekanisme *Stock-Lock Concurrency* berbasis transaksi basis data untuk mengunci ketersediaan eksemplar buku, sehingga mencegah benturan peminjaman ganda saat buku fisik terbatas.

* **Partisipasi Komunitas dan Tiket Event Literasi:**  
  Warga dapat menelusuri profil komunitas literasi di Sidrap (seperti kelompok Taman Baca Masyarakat atau Sanggar Baca), mendaftarkan diri menjadi anggota atau relawan, serta mengklaim tiket keikutsertaan acara seminar, bedah buku, atau pelatihan literasi.

* **Gamifikasi Pembaca, Misi Harian, dan Leaderboard Kabupaten:**  
  Untuk memotivasi kebiasaan membaca yang berkelanjutan (*reading habit*), dasbor warga dilengkapi tingkatan level (*Pembaca Pemula*, *Sahabat Buku*, *Penggerak Literasi*, hingga *Inspirator Literasi*). Warga dapat menyelesaikan tantangan misi literasi harian, membaca artikel kilat 5 menit, menulis ulasan buku, dan mengumpulkan poin pengalaman (*XP*) untuk bersaing secara suportif di papan peringkat (*Leaderboard*) se-Kabupaten Sidrap.

---

### B. Mitra Penyedia Literasi Lokal (`MITRA`)

Peran **Mitra** ditujukan bagi pelaku usaha toko buku fisik, pengelola perpustakaan instansi/desa, dan pengurus komunitas literasi di Kabupaten Sidrap. Calon mitra mendaftarkan organisasinya secara mandiri melalui formulir registrasi kemitraan dan melewati proses kurasi admin. Dasbor mitra bersifat **adaptif**, di mana fitur yang disajikan akan menyesuaikan tipe unit usahanya:

#### 1. Mitra Toko Buku Fisik (`TOKO_BUKU`)
* **Tujuan & Kegunaan:** Berfungsi sebagai etalase digital bagi toko-toko buku komersial lokal di Sidrap untuk memperluas jangkauan pasar pembaca di seluruh kecamatan.
* **Fitur Utama:** Pengelola toko dapat menambahkan katalog buku baru, mengatur harga resmi, memperbarui sisa stok fisik buku di rak toko, memantau grafik tren pengunjung dan estimasi omset penjualan, serta melacak daftar pesanan masuk dari pembeli untuk diproses pengirimannya.

#### 2. Mitra Perpustakaan Daerah & Desa (`PERPUSTAKAAN`)
* **Tujuan & Kegunaan:** Berfungsi sebagai platform otomasi OPAC (*Online Public Access Catalog*) dan sirkulasi peminjaman buku fisik bagi Dinas Perpustakaan Daerah, Perpustakaan Desa, maupun Pojok Baca Digital (POCADI).
* **Fitur Utama:** Pustakawan dapat mengelola data koleksi buku fisik lengkap dengan atribut **Nomor Panggil (*Call Number*)**, **Lokasi Rak Penyimpanan**, dan jumlah eksemplar fisik. Pustakawan juga dapat memverifikasi permohonan pinjam warga dengan tombol persetujuan (*Approve*), penolakan (*Reject*), dan konfirmasi pengembalian buku (*Return*) yang secara otomatis memulihkan stok sistem.

#### 3. Mitra Komunitas Literasi & Lapak Baca (`KOMUNITAS`)
* **Tujuan & Kegunaan:** Berfungsi sebagai pusat publikasi pergerakan literasi masyarakat, inisiatif Taman Baca Masyarakat (TBM), dan penyelenggara lapak baca buku gratis di ruang publik (misal: Monumen Ganggawa Sidrap).
* **Fitur Utama:** Pengurus komunitas dapat mempublikasikan jadwal agenda kegiatan literasi mendatang, memantau daftar peserta yang mendaftar, mengelola database anggota dan relawan baru yang terdaftar via aplikasi, serta memamerkan galeri dokumentasi kegiatan.

#### Alur Status Akun Mitra:
* **`PENDING` (Menunggu Verifikasi):** Akun baru terdaftar dan menampilkan timeline proses peninjauan oleh tim admin MABBACA, dilengkapi tombol bantuan WhatsApp admin.
* **`APPROVED` (Disetujui & Aktif):** Mitra memperoleh akses penuh ke seluruh alat manajemen inventaris dan profilnya tampil di direktori publik.
* **`REJECTED` (Ditolak):** Menampilkan catatan alasan penolakan resmi dari administrator (misal: data kontak tidak valid) beserta opsi perbaikan atau pendaftaran ulang.
* **`SUSPENDED` (Ditangguhkan):** Penonaktifan sementara hak akses jika terdapat pelanggaran ketentuan ekosistem.

---

### C. Pengelola Pusat Sistem (`ADMIN`)

Peran **Administrator** merupakan pemegang wewenang tertinggi yang bertindak sebagai kurator data, penjamin mutu ekosistem, dan analis perkembangan literasi Kabupaten Sidrap secara menyeluruh.

* **Pusat Verifikasi & Seleksi Mitra (*Mitra Verification Center*):**  
  Administrator bertanggung jawab meninjau setiap pendaftaran mitra baru. Admin dapat memeriksa kelengkapan nama organisasi, kesesuaian alamat di kecamatan Sidrap, dan nomor kontak penanggung jawab sebelum memutuskan untuk menyetujui (*Approve*) atau menolak (*Reject*) dengan memberikan alasan resmi.

* **Pusat Pemantauan & Analitik Kewilayahan Antar-Kecamatan:**  
  Dasbor admin menyajikan grafik statistik interaktif yang memetakan sebaran titik fasilitas literasi di seluruh wilayah Kabupaten Sidrap (*Pangkajene, Maritengngae, Baranti, Watang Pulu, Tellu Limpoe, Dua Pitue, Panca Rijang, Kulo, Panca Lautang, Watang Sidenreng, dan Pitu Riase*). Fasilitas ini memberikan data faktual bagi pemerintah daerah untuk melihat wilayah yang masih mengalami kesenjangan akses buku.

* **Manajemen Pengguna, Katalog, dan Konten Edukasi:**  
  Administrator memiliki kendali untuk mengelola data seluruh pengguna terdaftar, mengawasi peredaran buku fisik di katalog daerah, mengelola kalender event literasi se-kabupaten, serta menyusun dan menerbitkan artikel literasi pada kanal *Baca 5 Menit*.

---

## 3. Matriks Hak Akses dan Distribusi Fitur Pengguna

Tabel berikut merangkum distribusi kewenangan dan akses fitur antar-peran pada platform MABBACA:

| Fitur / Modul Sistem | Publik (Tamu) | Warga Pembaca (`USER`) | Mitra Toko Buku (`MITRA`) | Mitra Perpus (`MITRA`) | Mitra Komunitas (`MITRA`) | Administrator (`ADMIN`) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Jelajah Katalog & Direktori** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pencarian Universal & Jarak** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Baca Artikel 5 Menit** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pesan Buku via WhatsApp** | ❌ (Wajib Login) | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Pinjam Buku Perpustakaan** | ❌ (Wajib Login) | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Misi Gamifikasi, XP & Leaderboard** | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Kelola Stok & Pesanan Masuk** | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **Kelola No. Rak & Sirkulasi Pinjam** | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Publikasi Event & Kelola Relawan** | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Verifikasi Pendaftaran Mitra** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Monitoring Statistik 8+ Kecamatan**| ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Manajemen Pengguna & Ekosistem** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## 4. Keunggulan Teknologi dan Nilai Tambah

1. **Arsitektur Fullstack Modern & Cepat:** Dibangun menggunakan React 18, Vite, dan Tailwind CSS di sisi frontend dengan pemisahan bundle modular (*code-splitting*), dipadukan dengan Node.js Express dan Prisma ORM di sisi backend untuk menjamin performa responsif pada jaringan seluler daerah.
2. **Keamanan Berlapis Standar Industri:** Dilengkapi enkripsi kata sandi *bcryptjs*, autentikasi berbasis JSON Web Token (JWT), proteksi SQL Injection menyeluruh via Prisma, proteksi serangan melalui Helmet, CORS, dan Express Rate Limiting, serta proteksi rute ganda (*Frontend Route Guards & Backend Authorize Middleware*).
3. **Pemberdayaan Ekonomi & Sosial Daerah:** Menghubungkan pembaca dengan pelaku UMKM toko buku lokal Sidrap sekaligus memperkuat sirkulasi perpustakaan daerah dan geliat komunitas literasi akar rumput.

---

## 5. Kesimpulan

Platform **MABBACA** dirancang sebagai ekosistem sosial-edukatif yang menyatukan masyarakat, penyedia koleksi, dan pemerintah daerah ke dalam satu siklus literasi yang harmonis. Melalui diferensiasi peran pengguna yang jelas dan fitur-fitur yang tepat guna, MABBACA tidak hanya mempermudah akses fisik terhadap bahan bacaan, tetapi juga mentransformasikan budaya literasi di Kabupaten Sidenreng Rappang menjadi lebih interaktif, inklusif, dan berkelanjutan.
