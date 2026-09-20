# Alur Lengkap Update (Deployment) Kode Mabbaca di VPS

Dokumen ini berisi standar alur kerja (SOP) lengkap dari awal hingga akhir untuk memperbarui sistem, baik pada bagian antarmuka pengguna (*Frontend*) maupun sistem data (*Backend*) di VPS Anda.

---

## TAHAP 1: Akses Server & Ambil Kode Terbaru

### 1. Masuk ke Server (VPS)
Gunakan terminal / CMD (Command Prompt) di komputer lokal Anda untuk masuk ke VPS.
```bash
ssh arbain@<IP_VPS_ANDA>
# Contoh: ssh arbain@194.233.74.xxx
```

### 2. Pindah ke Folder Utama Proyek
Semua kode tersimpan di dalam folder `Buku`. Anda harus berada di folder ini sebelum melakukan *pull*.
```bash
cd /var/www/Buku
```

### 3. Tarik Pembaruan Kode dari GitHub
Tarik versi kode terbaru dari branch `main` GitHub Anda ke server:
```bash
git pull origin main
```
*(Catatan: Anda akan melihat pesan 'Fast-forward' jika pembaruan berhasil).*

---

## TAHAP 2: Update Server / API (Backend)
Lakukan tahap ini **HANYA JIKA** Anda melakukan perubahan pada file di dalam folder `server/` (seperti perubahan API, rute, atau skema database).

### 1. Masuk ke Folder Backend & Install Modul Baru
Jika ada *library* baru yang ditambahkan, wajib menginstalnya.
```bash
cd /var/www/Buku/server
npm install
```

### 2. Update Database Prisma (Opsional)
Jalankan langkah ini **HANYA JIKA** Anda mengubah file `server/prisma/schema.prisma` (misal menambah tabel baru):
```bash
npx prisma generate
npx prisma migrate deploy
```

### 3. Restart Aplikasi Backend
Restart server backend yang berjalan menggunakan *Process Manager* (PM2) agar kode yang baru diterapkan:
```bash
pm2 restart mabbaca-backend
```
*(Cek nama proses yang berjalan dengan mengetik `pm2 status`. Jika namanya berbeda, sesuaikan dengan nama yang muncul).*

---

## TAHAP 3: Update Tampilan (Frontend / Client)
Lakukan tahap ini jika Anda melakukan perubahan pada tata letak, komponen React, warna, atau halaman web di dalam folder `client/`.

### 1. Masuk ke Folder Frontend & Install Modul Baru
Masuk ke folder tampilan.
```bash
cd /var/www/Buku/client
npm install
```

### 2. Proses Build (Kompilasi)
Sistem web React (Vite) tidak bisa langsung dibaca browser dalam bentuk *source code*, melainkan harus di-*build* terlebih dahulu menjadi file statis (`dist`).
```bash
npm run build
```
*(Tunggu beberapa detik. Setelah sukses, Nginx di server akan langsung menyajikan tampilan dari file hasil build ini).*

---

## TAHAP 4: Verifikasi & Penanganan Masalah (Troubleshooting)

### 1. Cek Hasilnya di Web
Buka web Anda di browser (contoh: `https://mabbaca.id`).
Lakukan **Hard Refresh** untuk membersihkan *cache* browser lama:
- **Windows / Linux:** `Ctrl + F5` atau `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

### 2. Jika Terjadi Error API (Backend Mati / Error 500)
Cek penyebab error pada log server PM2:
```bash
pm2 logs mabbaca-backend --lines 50
```

### 3. Jika Tampilan Masih Belum Berubah di Perangkat Lain
Sesekali Nginx menyimpan *cache*. Anda bisa merestart layanan Nginx:
```bash
sudo systemctl restart nginx
```

---
**Ringkasan Alur Cepat (Cheat Sheet):**
1. `cd /var/www/Buku`
2. `git pull origin main`
3. Frontend: `cd client` -> `npm run build`
4. Backend: `cd server` -> `pm2 restart mabbaca-backend`
