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
    mitraType: 'TOKO_BUKU', // TOKO_BUKU, PERPUSTAKAAN, KOMUNITAS, SEKOLAH, PENGAJAR
    district: 'Pangkajene',
    village: '',
    address: '',
    description: '',
    openHours: '08.00 - 17.00 WITA',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const districts = ['Pangkajene', 'Maritengngae', 'Baranti', 'Watang Pulu', 'Tellu Limpoe', 'Dua Pitue', 'Panca Rijang', 'Kulo'];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.organizationName || !formData.address) {
      setErrorMessage('Semua kolom bertanda wajib harus diisi.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await registerMitra(formData);
      showToast(res.message, 'success');
      navigate('/mitra/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Pendaftaran mitra gagal.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#E5E7EB] shadow-card">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#075E54] flex items-center justify-center text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#075E54]">
              MABBACA
            </span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold text-[#17211D]">
            Pendaftaran Mitra Literasi Sidrap
          </h2>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Daftarkan toko buku, perpustakaan, komunitas, sekolah, atau program pengajar Anda
          </p>
        </div>

        {/* Verification warning alert */}
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Catatan Verifikasi:</strong> Setelah pendaftaran dikirim, akun mitra akan berstatus <strong>PENDING</strong> dan perlu diverifikasi terlebih dahulu oleh Admin MABBACA sebelum aktif penuh.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PIC Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nama Penanggung Jawab *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="H. Ruslan"
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alamat Email Login *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="mitra@sidrap.com"
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kata Sandi *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            {/* Phone WhatsApp */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nomor WhatsApp Organisasi / Pemesanan *
              </label>
              <input
                type="tel"
                name="phoneWa"
                value={formData.phoneWa}
                onChange={handleChange}
                placeholder="6281234567890"
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            {/* Organization Name */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Nama Usaha / Perpustakaan / Komunitas *
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleChange}
                placeholder="Toko Buku Sidrap Mandiri"
                required
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            {/* Mitra Type */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Jenis Mitra *
              </label>
              <select
                name="mitraType"
                value={formData.mitraType}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              >
                <option value="TOKO_BUKU">Toko Buku</option>
                <option value="PERPUSTAKAAN">Perpustakaan Daerah / Desa</option>
                <option value="KOMUNITAS">Komunitas / Lapak Baca</option>
                <option value="SEKOLAH">Sekolah</option>
                <option value="PENGAJAR">Pengajar / Fasilitator Literasi</option>
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kecamatan di Sidrap *
              </label>
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    Kec. {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Operating Hours */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Jam Operasional
              </label>
              <input
                type="text"
                name="openHours"
                value={formData.openHours}
                onChange={handleChange}
                placeholder="08.00 - 21.00 WITA"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Alamat Lengkap *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Jl. Jenderal Sudirman No. 45, Pangkajene"
              required
              className="w-full px-3.5 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Deskripsi Singkat Organisasi / Toko
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Ceritakan tentang koleksi buku, layanan, atau kegiatan komunitas Anda..."
              className="w-full p-3 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-[#075E54] text-white hover:bg-[#05473F] font-semibold mt-2"
          >
            Ajukan Pendaftaran Mitra
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-500">
          Sudah terdaftar?{' '}
          <Link to="/login" className="font-bold text-[#075E54] hover:underline">
            Masuk ke Akun
          </Link>
        </div>
      </div>
    </div>
  );
};
