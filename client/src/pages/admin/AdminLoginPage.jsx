import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login, user, isAdmin, logout } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // If already logged in as Admin, redirect directly
  if (user && isAdmin) {
    navigate('/admin/dashboard', { replace: true });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Email dan kata sandi admin wajib diisi.');
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');
      const res = await login(email, password);

      if (res.data?.user?.role !== 'ADMIN') {
        // Not an admin!
        logout();
        setErrorMessage('Akses Ditolak: Akun yang Anda masukkan bukan akun Administrator.');
        showToast('Akun Anda tidak memiliki hak akses administrator.', 'error');
        return;
      }

      showToast('Login Administrator berhasil. Selamat datang di Panel Pengelola.', 'success');
      navigate('/admin/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (!err.response
          ? 'Gagal terhubung ke server backend (port 5000). Pastikan server backend sedang aktif.'
          : 'Login gagal. Periksa kembali email dan kata sandi admin.');
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFillAdmin = () => {
    setEmail('admin@mabbaca.id');
    setPassword('admin123');
  };

  return (
    <div className="min-h-screen bg-[#111A16] text-white flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#075E54]/30 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Bar */}
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5 text-white hover:text-emerald-300 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-[#075E54] flex items-center justify-center text-white">
            <BookOpen className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight">MABBACA</span>
          <span className="text-xs text-emerald-400 font-medium ml-1">/ Portal Utama</span>
        </Link>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <ShieldCheck className="w-3.5 h-3.5" /> Akses Terbatas Pengelola
        </span>
      </div>

      {/* Login Box */}
      <div className="max-w-md w-full mx-auto my-auto z-10">
        <div className="bg-[#1A2621] border border-emerald-900/60 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Portal Admin MABBACA
            </h1>
            <p className="text-xs text-gray-400">
              Sistem Pengawasan & Verifikasi Ekosistem Literasi Sidrap
            </p>
          </div>

          {/* Current user warning if logged in as non-admin */}
          {user && !isAdmin && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2">
              <p className="font-medium">
                Anda saat ini terhubung sebagai <strong>{user.name}</strong> (Role: {user.role}).
              </p>
              <button
                type="button"
                onClick={logout}
                className="text-xs underline font-semibold text-amber-300 hover:text-white"
              >
                Klik di sini untuk keluar dan login sebagai Admin
              </button>
            </div>
          )}

          {/* Error message */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Email Administrator
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#111A16] border border-emerald-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1.5">
                Kata Sandi Administrator
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-[#111A16] border border-emerald-900/80 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isLoading}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-md mt-2"
            >
              Masuk Dashboard Admin <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Demo button */}
          <div className="pt-3 border-t border-gray-800 text-center">
            <button
              type="button"
              onClick={handleQuickFillAdmin}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Isi Otomatis Kredensial Admin Demo
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full text-center text-xs text-gray-500 z-10 pt-6">
        © 2026 MABBACA. Khusus Pengelola Sistem Ekosistem Literasi Kabupaten Sidrap.
      </div>
    </div>
  );
};
