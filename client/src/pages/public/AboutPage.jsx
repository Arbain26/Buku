import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Heart,
  Landmark,
  Store,
  Users,
  GraduationCap,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const AboutPage = () => {
  const ecosystemPillars = [
    {
      title: 'Toko Buku Lokal',
      desc: 'Membantu pembaca menemukan buku fisik yang tersedia di toko-toko buku lokal di Sidrap serta memesannya secara langsung.',
      icon: Store,
      color: 'bg-emerald-50 text-[#075E54] border-emerald-200',
    },
    {
      title: 'Perpustakaan Daerah',
      desc: 'Mempermudah masyarakat mengakses katalog perpustakaan daerah, POCADI, dan mengajukan peminjaman buku secara terstruktur.',
      icon: Landmark,
      color: 'bg-teal-50 text-[#0F766E] border-teal-200',
    },
    {
      title: 'Komunitas & Lapak Baca',
      desc: 'Mewadahi paguyuban pemuda dan pegiat literasi untuk mengadakan diskusi, lapak baca gratis, dan gerakan sosial edukatif.',
      icon: Users,
      color: 'bg-sky-50 text-sky-800 border-sky-200',
    },
    {
      title: 'Sekolah & Institusi',
      desc: 'Menghubungkan program gerakan literasi sekolah dengan perpustakaan dan agenda kegiatan edukasi di tingkat kabupaten.',
      icon: GraduationCap,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  ];

  const benefits = [
    'Mengetahui ketersediaan buku di sekitarmu sebelum berangkat ke lokasi.',
    'Menjangkau perpustakaan terdekat dengan informasi jarak dan jam buka akurat.',
    'Mendukung UMKM toko buku lokal di seluruh kecamatan Kabupaten Sidrap.',
    'Meningkatkan budaya membaca anak muda dan keluarga melalui tantangan literasi.',
    'Menemukan agenda workshop, lokakarya, dan bedah buku inspiratif.',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 sm:space-y-16">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Tentang MABBACA' }]} />

      {/* Hero Storytelling */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E8F3EF] text-[#075E54] border border-[#cbe1d7]">
          <Sparkles className="w-3.5 h-3.5" /> Gerakan Literasi Kabupaten Sidrap
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#17211D] tracking-tight leading-tight">
          Menghubungkan Masyarakat dengan Sumber Bacaan
        </h1>

        <p className="text-sm sm:text-base text-[#66736D] leading-relaxed">
          <strong>MABBACA</strong> (berasal dari bahasa Bugis yang berarti <em>membaca</em>) adalah platform digital ekosistem literasi terpadu untuk masyarakat Kabupaten Sidenreng Rappang (Sidrap).
        </p>
      </section>

      {/* Vision & Mission Card */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8E5] shadow-xs space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#075E54]">
            Tujuan Utama
          </span>
          <h2 className="text-xl font-bold text-[#17211D]">
            Membuka Akses Literasi yang Merata
          </h2>
          <p className="text-xs sm:text-sm text-[#66736D] leading-relaxed">
            MABBACA hadir untuk menjembatani kesenjangan informasi literasi di Kabupaten Sidrap. Kami percaya bahwa setiap warga memiliki hak untuk menemukan bahan bacaan berkualitas, perpustakaan yang nyaman, dan komunitas belajar yang saling mendukung.
          </p>
        </div>

        <div className="bg-gradient-to-br from-[#075E54] to-[#0F766E] text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
            Nilai Budaya
          </span>
          <h2 className="text-xl font-bold">
            Semangat “Sipakatau, Sipakalebbi, Sipakainge”
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Menumbuhkan kearifan lokal masyarakat Sidrap dalam dunia pendidikan dan literasi: saling menghormati, saling memuliakan, dan saling mengingatkan dalam kebaikan melalui kegiatan membaca dan berbagi pengetahuan.
          </p>
        </div>
      </section>

      {/* Ekosistem 4 Pilar */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17211D]">
            Ekosistem yang Saling Menguatkan
          </h2>
          <p className="text-xs sm:text-sm text-[#66736D]">
            MABBACA bukan sekadar katalog, melainkan wadah kolaborasi berbagai elemen masyarakat.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ecosystemPillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="bg-white rounded-2xl p-5 border border-[#E2E8E5] shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${p.color} mb-3`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-sm text-[#17211D]">{p.title}</h3>
                  <p className="text-xs text-[#66736D] mt-1.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Manfaat Bagi Masyarakat */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E2E8E5] shadow-xs space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-[#17211D]">
            Manfaat Nyata Bagi Masyarakat Sidrap
          </h2>
          <p className="text-xs sm:text-sm text-[#66736D] mt-1">
            Kemudahan yang didapatkan oleh warga pembaca di seluruh wilayah kabupaten:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#F8FAF8] border border-[#E2E8E5]/70">
              <CheckCircle2 className="w-5 h-5 text-[#075E54] shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm font-medium text-[#17211D]">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="rounded-3xl bg-[#075E54] p-8 sm:p-10 text-white text-center space-y-4">
        <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          Ingin Mendaftarkan Toko atau Komunitas Anda?
        </h3>
        <p className="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto">
          Jadilah bagian dari ekosistem literasi resmi Kabupaten Sidrap dan bantu masyarakat menemukan ruang belajar bersama Anda.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <Link
            to="/register-mitra"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#075E54] hover:bg-emerald-50 font-bold text-xs sm:text-sm shadow-md transition-all"
          >
            Daftar Sebagai Mitra <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/buku"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-all"
          >
            Jelajahi Buku
          </Link>
        </div>
      </section>
    </div>
  );
};
