import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store,
  Landmark,
  Users,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Share2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const MitraLandingPage = () => {
  const navigate = useNavigate();

  const partnerTypes = [
    {
      title: 'Toko Buku',
      icon: Store,
      desc: 'Perkenalkan inventaris buku fisik Anda kepada pembeli di seluruh Sidrap dengan pemesanan langsung via WhatsApp tanpa potongan biaya platform.',
    },
    {
      title: 'Perpustakaan Daerah & Desa',
      icon: Landmark,
      desc: 'Publikasikan katalog koleksi, permudah layanan peminjaman masyarakat secara online, dan tingkatkan indeks literasi desa.',
    },
    {
      title: 'Komunitas & Lapak Baca',
      icon: Users,
      desc: 'Ajak pemuda Sidrap berkumpul, publikasikan agenda bedah buku, dan rekrut relawan baru dengan jangkauan publik yang lebih luas.',
    },
    {
      title: 'Sekolah & Pengajar',
      icon: GraduationCap,
      desc: 'Bagikan informasi kelas menulis, lomba literasi, dan kegiatan gemar membaca bagi para pelajar.',
    },
  ];

  const benefits = [
    {
      title: 'Meningkatkan Jangkauan',
      desc: 'Menghubungkan Anda langsung dengan ribuan pembaca dan pelajar yang aktif mencari buku di Sidrap.',
      icon: Share2,
    },
    {
      title: 'Memperkenalkan Koleksi & Produk',
      desc: 'Setiap judul buku memiliki halaman tersendiri yang menampilkan toko atau perpustakaan Anda sebagai penyedia.',
      icon: CheckCircle2,
    },
    {
      title: 'Promosikan Event Lebih Cepat',
      desc: 'Kelola kuota peserta, bagikan pengumuman acara, dan lacak siapa saja yang telah mendaftar.',
      icon: TrendingUp,
    },
    {
      title: 'Dashboard Statistik & Laporan',
      desc: 'Pantau grafik minat baca, jumlah buku yang dilihat, dan statistik pesanan/peminjaman harian Anda.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-emerald-900 via-[#075E54] to-[#0F766E] text-white py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-emerald-100 border border-white/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Program Kemitraan MABBACA Sidrap
          </span>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
            Jadilah Bagian dari Ekosistem Literasi Sidrap
          </h1>

          <p className="text-sm sm:text-base text-emerald-100 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah bersama toko buku, perpustakaan daerah/desa, dan komunitas membaca untuk memperluas akses literasi bagi seluruh masyarakat Kabupaten Sidrap.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => navigate('/register-mitra')}
              className="bg-white text-[#075E54] hover:bg-emerald-50 font-bold shadow-lg"
            >
              Daftar Sebagai Mitra <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl border border-white/40 text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Sudah Menjadi Mitra? Masuk Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Siapa saja yang bisa bergabung? */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#17211D]">
            Siapa Saja yang Bisa Bergabung?
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            MABBACA merangkul seluruh pilar literasi di Kabupaten Sidenreng Rappang
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {partnerTypes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-3xl p-6 border border-[#E5E7EB] shadow-xs hover:shadow-card-hover transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#075E54] flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-base text-[#17211D] mb-2">{item.title}</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Manfaat Mitra */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-emerald-50/50 rounded-3xl p-8 sm:p-12 border border-emerald-100">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#17211D]">
            Keuntungan Menjadi Mitra MABBACA
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Kemudahan teknologi untuk mendukung operasional dan dakwah literasi Anda
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((b) => {
            const BIcon = b.icon;
            return (
              <div key={b.title} className="flex gap-4 items-start bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#075E54] flex items-center justify-center shrink-0">
                  <BIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-[#17211D] mb-1">{b.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Process flow */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#17211D]">
          Cara Bergabung yang Mudah
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <span className="text-xl font-black text-[#075E54]">01</span>
            <h4 className="font-bold text-sm text-[#17211D] mt-2 mb-1">Daftar Akun Mitra</h4>
            <p className="text-xs text-gray-500">
              Isi data organisasi, jenis mitra, alamat, dan nomor kontak WhatsApp aktif Anda.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <span className="text-xl font-black text-[#075E54]">02</span>
            <h4 className="font-bold text-sm text-[#17211D] mt-2 mb-1">Verifikasi Admin</h4>
            <p className="text-xs text-gray-500">
              Tim pengelola MABBACA memverifikasi keabsahan lokasi dan kontak organisasi.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200">
            <span className="text-xl font-black text-[#075E54]">03</span>
            <h4 className="font-bold text-sm text-[#17211D] mt-2 mb-1">Kelola & Terhubung</h4>
            <p className="text-xs text-gray-500">
              Akses dashboard mitra, unggah buku atau agenda event, dan layani masyarakat.
            </p>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => navigate('/register-mitra')}
          className="bg-[#075E54] text-white hover:bg-[#05473F] px-8"
        >
          Mulai Mendaftar Sekarang
        </Button>
      </section>
    </div>
  );
};
