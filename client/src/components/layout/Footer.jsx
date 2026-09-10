import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Mail, Phone, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#17211D] text-gray-300 pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#075E54] flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                MABBACA
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Platform Ekosistem Literasi Masyarakat Kabupaten Sidrap.
              Mempertemukan masyarakat dengan buku, toko buku, perpustakaan, komunitas, dan aktivitas literasi di sekitarnya.
            </p>
            <p className="text-xs font-semibold text-emerald-400">
              Tagline: &quot;Temukan Literasi di Sekitarmu.&quot;
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Jelajahi Ekosistem
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/buku" className="hover:text-emerald-400 transition-colors">
                  Katalog Buku Pilihan
                </Link>
              </li>
              <li>
                <Link to="/literasi/toko" className="hover:text-emerald-400 transition-colors">
                  Toko Buku Sidrap
                </Link>
              </li>
              <li>
                <Link to="/literasi/perpustakaan" className="hover:text-emerald-400 transition-colors">
                  Direktori Perpustakaan
                </Link>
              </li>
              <li>
                <Link to="/event" className="hover:text-emerald-400 transition-colors">
                  Agenda Event Literasi
                </Link>
              </li>
              <li>
                <Link to="/komunitas" className="hover:text-emerald-400 transition-colors">
                  Komunitas & Lapak Baca
                </Link>
              </li>
              <li>
                <Link to="/baca-5-menit" className="hover:text-emerald-400 transition-colors">
                  Baca 5 Menit (Artikel Ringkas)
                </Link>
              </li>
            </ul>
          </div>

          {/* Kemitraan */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Kemitraan
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/mitra" className="hover:text-emerald-400 transition-colors">
                  Jadilah Bagian Ekosistem
                </Link>
              </li>
              <li>
                <Link to="/register-mitra" className="hover:text-emerald-400 transition-colors">
                  Daftarkan Toko / Perpustakaan
                </Link>
              </li>
              <li>
                <Link to="/mitra/dashboard" className="hover:text-emerald-400 transition-colors">
                  Portal Dashboard Mitra
                </Link>
              </li>
              <li>
                <Link to="/admin/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                  🔒 Portal Masuk Admin
                </Link>
              </li>
              <li>
                <span className="text-gray-500">Toko Buku • Perpustakaan • Komunitas • Sekolah • Pengajar</span>
              </li>
            </ul>
          </div>

          {/* Kontak & Lokasi */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-3">
              Hubungi Kami
            </h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Kabupaten Sidenreng Rappang (Sidrap), Sulawesi Selatan, Indonesia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>kontak@mabbaca.local</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+62 812-3456-7890 (Layanan Mabbaca)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <p>© 2026 MABBACA. Inisiatif Gerakan Literasi Masyarakat Sidrap.</p>
          <p className="flex items-center gap-1">
            Dibangun dengan rasa cinta literasi untuk Kabupaten Sidrap <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
