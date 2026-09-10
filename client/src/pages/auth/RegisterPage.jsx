import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, Phone, MapPin, Sparkles } from 'lucide-react';
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

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const districts = ['Pangkajene', 'Maritengngae', 'Baranti', 'Watang Pulu', 'Tellu Limpoe', 'Dua Pitue', 'Panca Rijang', 'Kulo'];

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
      showToast(res.message, 'success');
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Pendaftaran gagal. Mohon periksa kembali isian form.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-card">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#075E54] flex items-center justify-center text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#075E54]">
              MABBACA
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#17211D]">
            Daftar Sebagai Pembaca
          </h2>
          <p className="text-xs text-gray-500">
            Dapatkan poin membaca, pinjam buku, dan ikuti event literasi di Sidrap
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Andi Pratama"
                required
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                required
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Nomor WhatsApp / HP
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="081234567890"
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Wilayah Kecamatan di Sidrap
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    Kec. {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimal 6 karakter"
                required
                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-[#075E54] text-white hover:bg-[#05473F] font-semibold mt-2"
          >
            <Sparkles className="w-4 h-4" /> Daftar Sekarang (+50 Poin)
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-gray-500 space-y-1">
          <p>
            Sudah memiliki akun?{' '}
            <Link to="/login" className="font-bold text-[#075E54] hover:underline">
              Masuk di Sini
            </Link>
          </p>
          <p>
            Ingin mendaftarkan toko atau perpustakaan?{' '}
            <Link to="/register-mitra" className="font-bold text-[#0F766E] hover:underline">
              Daftar Sebagai Mitra
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
