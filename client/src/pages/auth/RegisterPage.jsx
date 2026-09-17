import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, Phone, MapPin, Sparkles, Eye, EyeOff, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    district: 'Pangkajene',
    locationAddress: '',
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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage('Nama, email, dan kata sandi wajib diisi.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await register(formData);
      showToast(res.message || 'Pendaftaran akun berhasil!', 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (!err.response
          ? 'Gagal terhubung ke server backend (port 5000). Pastikan server backend sedang aktif.'
          : 'Pendaftaran gagal. Mohon periksa kembali isian form.');
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-[#E2E8E5] shadow-sm">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#075E54] flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-[#075E54]">
              MABBACA
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#17211D]">
            Daftar Akun Baru
          </h2>
          <p className="text-xs text-[#66736D]">
            Pilih jenis akun yang sesuai dengan kebutuhan Anda di Sidrap
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#E8F3EF]/70 rounded-2xl border border-[#cbe1d7]">
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-xs bg-[#075E54] text-white"
          >
            <User className="w-3.5 h-3.5" />
            Warga Pembaca
          </button>
          <Link
            to="/register-mitra"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all text-[#17211D] hover:text-[#075E54] hover:bg-white/80"
          >
            <Building2 className="w-3.5 h-3.5 text-[#0F766E]" />
            Mitra Literasi
          </Link>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Nama Lengkap *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] text-[#17211D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Alamat Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] text-[#17211D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] text-[#17211D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Kecamatan Domisili di Sidrap
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] text-[#17211D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    Kecamatan {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Kata Sandi (Minimal 6 karakter) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full pl-10 pr-10 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] text-[#17211D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-[#075E54] text-white hover:bg-[#05473F] font-bold shadow-xs mt-2"
          >
            Buat Akun Pembaca (+25 XP)
          </Button>
        </form>

        {/* Callout to Mitra Registration */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-[#17211D] flex items-start gap-3">
          <Building2 className="w-5 h-5 text-[#075E54] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-[#075E54]">Mewakili Toko, Perpustakaan, atau Komunitas?</span>
            <p className="text-[11px] text-[#66736D] leading-relaxed">
              Daftarkan organisasi Anda untuk membuka dashboard pengelola dan katalog publik.{' '}
              <Link to="/register-mitra" className="font-extrabold text-[#075E54] underline hover:text-[#05473F]">
                Daftar Sebagai Mitra Sidrap &rarr;
              </Link>
            </p>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-[#66736D] border-t border-gray-100">
          Sudah memiliki akun?{' '}
          <Link to="/login" className="font-bold text-[#075E54] hover:underline">
            Masuk Sekarang
          </Link>
        </div>
      </div>
    </div>
  );
};
