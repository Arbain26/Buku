import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Building2,
  Mail,
  Lock,
  Phone,
  MapPin,
  FileText,
  Clock,
  ShieldAlert,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';

export const RegisterMitraPage = () => {
  const navigate = useNavigate();
  const { registerMitra } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    phoneWa: '',
    organizationName: '',
    mitraType: 'TOKO_BUKU',
    district: 'Pangkajene',
    village: '',
    address: '',
    description: '',
    openHours: '08.00 - 17.00 WITA',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const districts = [
    'Pangkajene',
    'Maritengngae',
    'Baranti',
    'Watang Pulu',
    'Tellu Limpoe',
    'Dua Pitue',
    'Panca Rijang',
    'Kulo',
    'Panca Lautang',
    'Watang Sidenreng',
    'Pitu Riase',
  ];

  const mitraTypes = [
    { value: 'TOKO_BUKU', label: 'Toko Buku', desc: 'Toko buku fisik atau toko baca komersial lokal' },
    { value: 'PERPUSTAKAAN', label: 'Perpustakaan', desc: 'Perpustakaan daerah, perpustakaan desa, atau TBM' },
    { value: 'KOMUNITAS', label: 'Komunitas Literasi', desc: 'Paguyuban pemuda, relawan lapak baca Sidrap' },
    { value: 'SEKOLAH', label: 'Sekolah / Madrasah', desc: 'Institusi pendidikan formal tingkat dasar/menengah' },
    { value: 'PENGAJAR', label: 'Pengajar / Pegiat', desc: 'Guru, dosen, atau pengajar independen literasi' },
  ];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.organizationName || !formData.address) {
      setErrorMessage('Semua kolom bertanda wajib (*) harus diisi.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await registerMitra(formData);
      showToast(res.message || 'Pendaftaran mitra berhasil!', 'success');
      navigate('/mitra/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (!err.response
          ? 'Gagal terhubung ke server backend (port 5000). Pastikan server backend sedang aktif.'
          : 'Pendaftaran mitra gagal. Periksa kembali form.');
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#E2E8E5] shadow-sm">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#075E54] flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#075E54]">
              MABBACA
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#17211D]">
            Pendaftaran Mitra Literasi Sidrap
          </h2>
          <p className="text-xs text-[#66736D] max-w-md mx-auto">
            Daftarkan toko buku, perpustakaan, komunitas, sekolah, atau program pengajar Anda ke dalam ekosistem resmi
          </p>
        </div>

        {/* Verification Alert */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Catatan Verifikasi:</strong> Setelah pendaftaran dikirim, akun mitra akan berstatus <strong>PENDING</strong> dan akan diverifikasi oleh Admin MABBACA dalam 1x24 jam kerja sebelum aktif penuh.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Mitra Type Selection */}
          <div>
            <label className="block text-xs font-bold text-[#17211D] mb-2">
              Pilih Jenis Mitra *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {mitraTypes.map((t) => (
                <label
                  key={t.value}
                  className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col justify-between ${
                    formData.mitraType === t.value
                      ? 'border-[#075E54] bg-[#E8F3EF] text-[#075E54] font-bold shadow-xs'
                      : 'border-[#E2E8E5] hover:bg-gray-50 text-[#17211D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span>{t.label}</span>
                    <input
                      type="radio"
                      name="mitraType"
                      value={t.value}
                      checked={formData.mitraType === t.value}
                      onChange={handleChange}
                      className="accent-[#075E54]"
                    />
                  </div>
                  <span className="text-[11px] text-[#66736D] font-normal leading-tight">
                    {t.desc}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Org Name & PIC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">
                Nama Organisasi / Toko / Komunitas *
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Contoh: Toko Buku Sidrap Mandiri"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">
                Nama Penanggung Jawab (PIC) *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Contoh: H. Rusli Pratama"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          {/* Email & Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">
                Alamat Email Login *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="mitra@domain.com"
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">
                Kata Sandi *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Phone Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">
                Nomor HP / Telepon Kontak
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">
                Nomor WhatsApp untuk Transaksi/Order
              </label>
              <input
                type="tel"
                name="phoneWa"
                value={formData.phoneWa}
                onChange={handleChange}
                placeholder="6281234567890 (Gunakan format 62)"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          {/* District & Open Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">
                Kecamatan Lokasi di Sidrap *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    Kecamatan {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">
                Jam Operasional
              </label>
              <input
                type="text"
                name="openHours"
                value={formData.openHours}
                onChange={handleChange}
                placeholder="08.00 - 17.00 WITA"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Alamat Lengkap / Patokan Lokasi *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Contoh: Jl. Jend. Sudirman No. 45, Depan Alun-Alun Pangkajene"
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Profil Singkat Organisasi / Toko
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Jelaskan jenis buku, koleksi, atau kegiatan literasi yang Anda tawarkan kepada masyarakat Sidrap..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-[#075E54] text-white hover:bg-[#05473F] font-bold shadow-xs mt-2"
          >
            Kirim Pendaftaran Mitra
          </Button>
        </form>

        <div className="pt-3 text-center text-xs text-[#66736D] border-t border-gray-100">
          Sudah memiliki akun mitra?{' '}
          <Link to="/login" className="font-bold text-[#075E54] hover:underline">
            Masuk di Sini
          </Link>
        </div>
      </div>
    </div>
  );
};
