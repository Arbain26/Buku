import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, LogIn, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await login(email, password);
      showToast(res.message || 'Berhasil masuk ke akun Anda!', 'success');

      if (res.data?.user?.role === 'ADMIN') {
        logout();
        setErrorMessage('Akses Ditolak: Halaman ini hanya untuk Warga Pembaca dan Mitra Literasi. Akun Administrator dilarang masuk dari halaman ini demi keamanan.');
        showToast('Akses ditolak. Silakan gunakan portal khusus administrator.', 'error');
        return;
      }

      // Selalu arahkan ke Halaman Website Utama (Beranda) setelah berhasil masuk
      navigate('/');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (!err.response
          ? 'Gagal terhubung ke server backend (port 5000). Pastikan server backend sedang aktif.'
          : 'Login gagal. Periksa kembali email dan password.');
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-[#E2E8E5] shadow-sm">
        {/* Brand Header */}
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
            Masuk ke Akun Anda
          </h2>
          <p className="text-xs text-[#66736D]">
            Akses ekosistem literasi masyarakat Sidrap
          </p>
        </div>

        {/* Error alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Alamat Email *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] text-[#17211D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-[#17211D]">
                Kata Sandi (Password) *
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] text-[#17211D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
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
            className="w-full bg-[#075E54] text-white hover:bg-[#05473F] font-bold shadow-xs gap-2"
          >
            <LogIn className="w-4 h-4" /> Masuk ke Akun
          </Button>
        </form>

        {/* Demo Accounts Quick-Fill Card (Matches Database Seed) */}
        <div className="p-4 rounded-2xl bg-[#E8F3EF]/50 border border-[#cbe1d7] space-y-2">
          <p className="text-[11px] font-bold text-[#075E54] uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Akun Uji Coba Cepat (Demo Seed)
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill('toko@mabbaca.id', 'mitra123')}
              className="py-1.5 px-2 bg-white rounded-lg border border-[#cbe1d7] text-[11px] font-bold text-gray-700 hover:bg-[#075E54] hover:text-white transition-colors"
            >
              🏪 Mitra Toko
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('user@mabbaca.id', 'user123')}
              className="py-1.5 px-2 bg-white rounded-lg border border-[#cbe1d7] text-[11px] font-bold text-gray-700 hover:bg-[#075E54] hover:text-white transition-colors"
            >
              📖 Pembaca
            </button>
          </div>
        </div>

        {/* Register Links */}
        <div className="pt-2 text-center text-xs text-[#66736D] space-y-2 border-t border-gray-100">
          <p>
            Belum memiliki akun?{' '}
            <Link to="/register" className="font-bold text-[#075E54] hover:underline">
              Daftar Sebagai Warga Pembaca
            </Link>
          </p>
          <p>
            Pemilik toko buku atau pengelola perpustakaan?{' '}
            <Link to="/register-mitra" className="font-bold text-[#0F766E] hover:underline">
              Daftar Sebagai Mitra Sidrap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
