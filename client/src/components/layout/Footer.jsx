import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, MapPin, Mail, Phone, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#17211D] text-gray-300 pt-14 pb-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* 1. MABBACA Brand */}
          <div className="space-y-3.5">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#075E54] flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                MABBACA
              </span>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Platform Ekosistem Literasi Masyarakat Sidrap. Menghubungkan pembaca, toko buku, perpustakaan, komunitas literasi, dan kegiatan belajar di sekitar Anda.
            </p>
            <p className="text-xs font-semibold text-emerald-400 italic">
              “Temukan Literasi di Sekitarmu.”
            </p>
          </div>

          {/* 2. Eksplorasi */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-3 text-emerald-400">
              Eksplorasi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/buku" className="hover:text-emerald-300 transition-colors">
                  Buku Pilihan
                </Link>
              </li>
              <li>
                <Link to="/literasi/perpustakaan" className="hover:text-emerald-300 transition-colors">
                  Perpustakaan
                </Link>
              </li>
              <li>
                <Link to="/literasi/toko" className="hover:text-emerald-300 transition-colors">
                  Toko Buku
                </Link>
              </li>
              <li>
                <Link to="/komunitas" className="hover:text-emerald-300 transition-colors">
                  Komunitas Literasi
                </Link>
              </li>
              <li>
                <Link to="/event" className="hover:text-emerald-300 transition-colors">
                  Event & Kegiatan
                </Link>
              </li>
              <li>
                <Link to="/baca-5-menit" className="hover:text-emerald-300 transition-colors">
                  Baca 5 Menit (Artikel)
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Informasi & Kemitraan */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-3 text-emerald-400">
              Informasi
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-emerald-300 transition-colors">
                  Tentang MABBACA
                </Link>
              </li>
              <li>
                <Link to="/mitra" className="hover:text-emerald-300 transition-colors">
                  Gabung Jadi Mitra
                </Link>
              </li>
              <li>
                <Link to="/register-mitra" className="hover:text-emerald-300 transition-colors">
                  Daftar Akun Mitra
                </Link>
              </li>
              <li>
                <span className="text-gray-500">Bantuan & FAQ</span>
              </li>
              <li>
                <span className="text-gray-500">Kebijakan Privasi</span>
              </li>
              <li>
                <span className="text-gray-500">Syarat & Ketentuan</span>
              </li>
            </ul>
          </div>

          {/* 4. Kontak */}
          <div>
            <h4 className="text-xs font-bold text-white tracking-wider uppercase mb-3 text-emerald-400">
              Kontak & Lokasi
            </h4>
            <div className="space-y-2.5 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Kabupaten Sidenreng Rappang (Sidrap), Sulawesi Selatan</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>kontak@mabbaca.id</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+62 852-1234-5678 (WhatsApp Center)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-gray-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3 text-center sm:text-left">
          <p>© MABBACA — Platform Ekosistem Literasi Masyarakat Sidrap</p>
          <p className="flex items-center justify-center gap-1 text-gray-400">
            Dedikasi untuk literasi Kabupaten Sidrap <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
