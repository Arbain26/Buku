# 🚀 PANDUAN DEPLOYMENT PRODUKSI — MABBACA
## Platform Ekosistem Literasi Masyarakat Sidrap (“Temukan Literasi di Sekitarmu.”)

Panduan ini berisi instruksi teknis langkah demi langkah (*step-by-step*) untuk melakukan deployment platform **MABBACA** ke server produksi (*Linux Ubuntu 22.04 LTS* atau *Debian 12* / *Windows Server*) secara aman, stabil, dan berkinerja tinggi.

---

## 📑 Daftar Isi
1. [Arsitektur Deployment](#1-arsitektur-deployment)
2. [Spesifikasi Server & Prasyarat](#2-spesifikasi-server--prasyarat)
3. [Instalasi Dependensi Server](#3-instalasi-dependensi-server)
4. [Konfigurasi Basis Data MySQL](#4-konfigurasi-basis-data-mysql)
5. [Konfigurasi & Deployment Backend](#5-konfigurasi--deployment-backend)
6. [Build & Deployment Frontend (Vite)](#6-build--deployment-frontend-vite)
7. [Konfigurasi Web Server Nginx & Reverse Proxy](#7-konfigurasi-web-server-nginx--reverse-proxy)
8. [Penerapan SSL / HTTPS (Let's Encrypt Certbot)](#8-penerapan-ssl--https-lets-encrypt-certbot)
9. [Hardening Keamanan Server (Firewall & Permissions)](#9-hardening-keamanan-server-firewall--permissions)
10. [Otomasi Cadangan (Backup Automation)](#10-otomasi-cadangan-backup-automation)
11. [Monitoring & Runbook Pemecahan Masalah](#11-monitoring--runbook-pemecahan-masalah)

---

## 1. Arsitektur Deployment

```mermaid
graph TD
    Client[Browser / Pengguna Mobile & Desktop] -->|HTTPS :443| Nginx[Nginx Reverse Proxy & Web Server]
    
    subgraph Server Lingkungan Produksi
        Nginx -->|Static SPA Files / HTML / CSS / JS| FrontendDist[client/dist]
        Nginx -->|Proxy Pass /api & /uploads| NodeBackend[Node.js Express Backend :5000 PM2 Cluster]
        NodeBackend -->|Koneksi Prisma ORM| MySQL[(MySQL 8.0 Database :3306)]
        NodeBackend -->|Penyimpanan Berkas Fisik| UploadsDir[server/uploads]
    end
```

---

## 2. Spesifikasi Server & Prasyarat

### Rekomendasi Hardware (VPS / Cloud Server):
- **CPU**: Minimal 2 vCPU (Rekomendasi: 4 vCPU untuk beban tinggi).
- **RAM**: Minimal 2 GB (Rekomendasi: 4 GB agar kompilasi build dan basis data berjalan lancar).
- **Penyimpanan**: Minimal 25 GB SSD / NVMe.
- **Sistem Operasi**: Ubuntu 22.04 LTS / Debian 12 / Windows Server 2022.

---

## 3. Instalasi Dependensi Server

Jalankan perintah berikut pada terminal server:

```bash
# Perbarui paket sistem
sudo apt update && sudo apt upgrade -y

# Instal Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx mysql-server ufw

# Verifikasi versi
node -v   # v20.x.x
npm -v    # 10.x.x

# Instal PM2 (Process Manager) secara global
sudo npm install -g pm2
```

---

## 4. Konfigurasi Basis Data MySQL

Masuk ke MySQL shell sebagai root:

```bash
sudo mysql
```

Eksekusi kueri berikut untuk membuat basis data dan pengguna terisolasi:

```sql
-- Buat database produksi
CREATE DATABASE mabbaca_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user khusus aplikasi
CREATE USER 'mabbaca_user'@'localhost' IDENTIFIED BY 'PasswordSangatKuatDanAman123!';

-- Berikan hak akses penuh ke database aplikasi
GRANT ALL PRIVILEGES ON mabbaca_prod.* TO 'mabbaca_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 5. Konfigurasi & Deployment Backend

### 5.1 Clone & Instalasi Dependensi
```bash
# Clone repositori ke direktori aplikasi
sudo mkdir -p /var/www/mabbaca
sudo chown -R $USER:$USER /var/www/mabbaca
cd /var/www/mabbaca
git clone <URL_REPOSITORY_ANDA> .

# Instal dependensi backend
cd /var/www/mabbaca/server
npm install --production=false
```

### 5.2 Siapkan Berkas Environment Backend (`server/.env`)
Salin atau buat berkas `.env` pada direktori `/var/www/mabbaca/server/.env`:

```env
PORT=5000
NODE_ENV=production

# Konfigurasi Koneksi Database MySQL
DATABASE_URL="mysql://mabbaca_user:PasswordSangatKuatDanAman123!@localhost:3306/mabbaca_prod"

# Keamanan JWT (Gunakan token acak minimal 64 karakter)
JWT_SECRET="kunci_rahasia_produksi_sangat_panjang_dan_acak_minimal_64_karakter_mabbaca_sidrap_2026"
JWT_EXPIRES_IN="7d"

# Domain Frontend yang Diizinkan (CORS)
CLIENT_URL="https://mabbaca.id"

# Konfigurasi Geospasial Sidrap Default
DEFAULT_LATITUDE=-3.9272
DEFAULT_LONGITUDE=119.8000
```

### 5.3 Jalankan Migrasi Prisma & Seeding Awal
```bash
cd /var/www/mabbaca/server

# Terapkan schema database ke MySQL produksi
npx prisma migrate deploy

# Isi data master awal (Kategori, Buku, Toko, Komunitas, Akun Administrator)
npx prisma db seed
```

### 5.4 Jalankan Backend Menggunakan PM2
```bash
cd /var/www/mabbaca/server

# Jalankan server dengan mode cluster otomatis
pm2 start src/index.js --name "mabbaca-backend" -i max

# Simpan status PM2 agar berjalan otomatis saat server reboot
pm2 save
pm2 startup
```

---

## 6. Build & Deployment Frontend (Vite)

### 6.1 Instal Dependensi & Konfigurasi Lingkungan
```bash
cd /var/www/mabbaca/client
npm install

# Buat berkas .env.production untuk client
cat << 'EOF' > .env.production
VITE_API_URL=https://mabbaca.id/api
EOF
```

### 6.2 Kompilasi Build Produksi
```bash
# Build aplikasi React (Output tersimpan di client/dist)
npm run build
```

Hasil build akan menghasilkan bundle statis yang teroptimasi di `/var/www/mabbaca/client/dist`.

---

## 7. Konfigurasi Web Server Nginx & Reverse Proxy

Buat berkas konfigurasi Nginx untuk domain aplikasi:

```bash
sudo nano /etc/nginx/sites-available/mabbaca.conf
```

Isikan konfigurasi berikut:

```nginx
server {
    listen 80;
    server_name mabbaca.id www.mabbaca.id;

    # Pengaturan Ukuran Upload Maksimal
    client_max_body_size 10M;

    # Root direktori hasil build frontend
    root /var/www/mabbaca/client/dist;
    index index.html;

    # Gzip Compression untuk Kinerja Cepat
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml application/atom+xml image/svg+xml;

    # Cache Control untuk Berkas Aset Statis
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform, immutable";
    }

    # Penanganan Berkas Media / Uploads
    location /uploads/ {
        alias /var/www/mabbaca/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri =404;
    }

    # Reverse Proxy ke Backend REST API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }

    # Routing Single Page Application (SPA Fallback)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Blokir akses ke berkas tersembunyi (.env, .git)
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
```

Aktifkan konfigurasi dan muat ulang Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/mabbaca.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. Penerapan SSL / HTTPS (Let's Encrypt Certbot)

Amankan domain dengan sertifikat SSL gratis dan terotomasi dari Let's Encrypt:

```bash
# Instal Certbot dan Plugin Nginx
sudo apt install -y certbot python3-certbot-nginx

# Dapatkan dan pasang sertifikat SSL secara otomatis
sudo certbot --nginx -d mabbaca.id -d www.mabbaca.id

# Uji pembaharuan sertifikat otomatis
sudo certbot renew --dry-run
```

Certbot akan memperbarui konfigurasi Nginx menjadi HTTPS (Port 443) dengan *HTTP to HTTPS redirect* otomatis.

---

## 9. Hardening Keamanan Server (Firewall & Permissions)

### 9.1 Konfigurasi Firewall UFW
```bash
# Izinkan hanya koneksi SSH, HTTP, dan HTTPS
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'

# Aktifkan firewall
sudo ufw enable
sudo ufw status
```

### 9.2 Hak Akses Berkas & Direktori
```bash
# Berikan hak kepemilikan direktori uploads ke user proses Node.js
sudo chown -R $USER:www-data /var/www/mabbaca/server/uploads
sudo chmod -R 775 /var/www/mabbaca/server/uploads

# Pastikan file .env terlindungi dari pembacaan publik
chmod 600 /var/www/mabbaca/server/.env
```

---

## 10. Otomasi Cadangan (Backup Automation)

Buat script backup basis data harian otomatis:

```bash
mkdir -p /var/backups/mabbaca
sudo nano /usr/local/bin/backup-mabbaca.sh
```

Isi dengan perintah:
```bash
#!/bin/bash
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/var/backups/mabbaca"
DB_USER="mabbaca_user"
DB_PASS="PasswordSangatKuatDanAman123!"
DB_NAME="mabbaca_prod"

# Dump database MySQL dan kompresi gzip
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DB_NAME_$DATE.sql.gz

# Hapus backup yang lebih lama dari 30 hari
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -exec rm {} \;
```

Berikan izin eksekusi dan jadwalkan cron job:
```bash
sudo chmod +x /usr/local/bin/backup-mabbaca.sh

# Tambahkan ke crontab (berjalan setiap pukul 02:00 dini hari)
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-mabbaca.sh") | crontab -
```

---

## 11. Monitoring & Runbook Pemecahan Masalah

### Perintah Pemeriksaan Cepat:
```bash
# Cek status proses backend
pm2 status
pm2 logs mabbaca-backend --lines 50

# Cek log akses dan error Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Cek status layanan MySQL
sudo systemctl status mysql
```

### Prosedur Pembaharuan Aplikasi (*Zero-Downtime Deployment*):
```bash
cd /var/www/mabbaca
git pull origin main

# Update & migrasi backend jika ada schema baru
cd /var/www/mabbaca/server
npm install --production=false
npx prisma migrate deploy
pm2 reload mabbaca-backend

# Update frontend build
cd /var/www/mabbaca/client
npm install
npm run build
sudo systemctl reload nginx
```
