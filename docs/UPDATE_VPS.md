# Panduan Update Kode Mabbaca di VPS

Dokumen ini berisi panduan langkah demi langkah untuk memperbarui aplikasi (Backend dan Frontend) di VPS setelah Anda melakukan perubahan kode (commit & push) ke repository Git.

## 1. Masuk ke VPS
Akses VPS Anda menggunakan SSH:
```bash
ssh user@<IP_VPS_ANDA>
```

## 2. Navigasi ke Direktori Proyek
Masuk ke folder tempat aplikasi Mabbaca di-deploy (misalnya `/var/www/mabbaca`):
```bash
cd /var/www/mabbaca
```

## 3. Tarik Pembaruan Kode Terbaru (Git Pull)
Pastikan Anda berada di branch yang benar (misalnya `main`) lalu tarik kode terbaru:
```bash
git pull origin main
```
*(Ganti `main` dengan nama branch yang Anda gunakan di server).*

---

## 4. Update Backend (Server)

Jika ada perubahan pada kode backend, routing, atau database (Prisma), ikuti langkah berikut:

### 4.1 Masuk ke Folder Backend & Instal Dependensi Baru (Jika Ada)
```bash
cd /var/www/mabbaca/server
npm install
```

### 4.2 Update Prisma (Hanya jika ada perubahan pada `schema.prisma`)
Jika Anda menambahkan, mengubah, atau menghapus tabel di database, jalankan perintah ini:
```bash
npx prisma generate
npx prisma migrate deploy
```

### 4.3 Restart Service Backend (PM2)
Restart proses backend yang berjalan di PM2 agar kode baru diterapkan:
```bash
pm2 restart mabbaca-backend
```
*(Catatan: Pastikan nama aplikasi PM2 Anda adalah `mabbaca-backend`. Anda bisa mengecek daftarnya dengan perintah `pm2 status`).*

---

## 5. Update Frontend (Client / Vite)

Jika ada perubahan pada kode antarmuka (React/Tailwind/CSS), ikuti langkah ini:

### 5.1 Masuk ke Folder Client & Instal Dependensi Baru (Jika Ada)
```bash
cd /var/www/mabbaca/client
npm install
```

### 5.2 Build / Kompilasi Ulang Frontend
Jalankan proses build agar Vite menghasilkan aset/file statis terbaru di folder `dist`:
```bash
npm run build
```
*(Setelah build selesai, Nginx akan secara otomatis mendeteksi file statis terbaru dari folder `dist` karena letaknya sudah disetel di konfigurasi Nginx).*

---

## 6. Selesai
Pembaruan telah berhasil diterapkan! Anda bisa langsung me-refresh dan mengecek aplikasi di browser Anda (contoh: `https://mabbaca.id`).

**Tips Tambahan:**
- **Melihat Log Error Backend**: Jika setelah update backend terjadi masalah (seperti API Error 500), cek log dengan perintah:
  ```bash
  pm2 logs mabbaca-backend --lines 50
  ```
- **Mereset Cache Nginx (Opsional)**: Jika tampilan frontend di browser belum berubah meskipun sudah di-build dan *hard-refresh* (Ctrl + F5), Anda bisa mencoba me-restart nginx (meskipun jarang dibutuhkan):
  ```bash
  sudo systemctl restart nginx
  ```
