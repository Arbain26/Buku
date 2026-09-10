import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      showToast(res.message, 'success');

      if (res.data?.user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (res.data?.user?.role === 'MITRA') {
        navigate('/mitra/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa kembali email dan password.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-3xl border border-[#E5E7EB] shadow-card">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#075E54] flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#075E54]">
              MABBACA
            </span>
          </Link>
          <h2 className="text-xl font-bold text-[#17211D]">
            Masuk ke Akun Anda
          </h2>
          <p className="text-xs text-gray-500">
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
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Alamat Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            isLoading={isLoading}
            className="w-full bg-[#075E54] text-white hover:bg-[#05473F] font-semibold"
          >
            <LogIn className="w-4 h-4" /> Masuk
          </Button>
        </form>

        {/* Demo Accounts Quick-Fill Card */}
        <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-gray-200/80 space-y-2">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Akun Demo Development
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@mabbaca.local', 'Admin123!')}
              className="px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-semibold text-[#075E54] hover:bg-emerald-50 transition-colors shadow-2xs text-center"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('mitra@mabbaca.local', 'Mitra123!')}
              className="px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-semibold text-teal-800 hover:bg-teal-50 transition-colors shadow-2xs text-center"
            >
              Mitra (Toko)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('user@mabbaca.local', 'User123!')}
              className="px-2 py-1.5 rounded-lg bg-white border border-gray-200 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs text-center"
            >
              User Warga
            </button>
          </div>
        </div>

        {/* Register navigation links & Admin portal link */}
        <div className="pt-2 text-center text-xs text-gray-500 space-y-1.5">
          <p>
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-[#075E54] hover:underline">
              Daftar sebagai Pembaca
            </Link>
          </p>
          <p>
            Memiliki toko atau perpustakaan?{' '}
            <Link to="/register-mitra" className="font-bold text-[#0F766E] hover:underline">
              Daftar sebagai Mitra
            </Link>
          </p>
          <div className="pt-2 border-t border-gray-100">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              🔒 Pengelola / Admin MABBACA? Masuk di sini
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
