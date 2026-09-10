import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '../components/common/Button';

// Layouts
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Public Pages
import { HomePage } from '../pages/public/HomePage';
import { BooksPage } from '../pages/public/BooksPage';
import { BookDetailPage } from '../pages/public/BookDetailPage';
import { StoresPage } from '../pages/public/StoresPage';
import { StoreDetailPage } from '../pages/public/StoreDetailPage';
import { LibrariesPage } from '../pages/public/LibrariesPage';
import { LibraryDetailPage } from '../pages/public/LibraryDetailPage';
import { CommunitiesPage } from '../pages/public/CommunitiesPage';
import { CommunityDetailPage } from '../pages/public/CommunityDetailPage';
import { EventsPage } from '../pages/public/EventsPage';
import { EventDetailPage } from '../pages/public/EventDetailPage';
import { ArticlesPage } from '../pages/public/ArticlesPage';
import { ArticleDetailPage } from '../pages/public/ArticleDetailPage';
import { UniversalSearchPage } from '../pages/public/UniversalSearchPage';
import { MitraLandingPage } from '../pages/public/MitraLandingPage';

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { RegisterMitraPage } from '../pages/auth/RegisterMitraPage';

// Admin Auth & Dashboard
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';

// User & Mitra Dashboards
import { UserDashboardPage } from '../pages/user/UserDashboardPage';
import { MitraDashboardPage } from '../pages/mitra/MitraDashboardPage';

// Protected Route Helpers
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center text-sm">Memverifikasi sesi...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const MitraRoute = ({ children }) => {
  const { isAuthenticated, isMitra, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center text-sm">Memverifikasi sesi mitra...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isMitra) return <Navigate to="/dashboard" replace />;
  return children;
};

// Dedicated Admin Guard with 403 Forbidden Screen
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111A16] text-white flex items-center justify-center p-8 text-sm">
        Memverifikasi otentikasi administrator...
      </div>
    );
  }

  // If not logged in, redirect directly to dedicated /admin/login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // If logged in but NOT an Admin (e.g. USER or MITRA)
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#111A16] text-white flex items-center justify-center p-4 sm:p-6">
        <div className="max-w-md w-full bg-[#1A2621] border border-red-500/30 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs font-bold text-red-400 uppercase tracking-widest">
              Error 403 — Akses Ditolak
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Halaman Khusus Administrator
            </h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Anda saat ini masuk sebagai <strong className="text-white">{user?.name}</strong> dengan peran <strong className="text-amber-400">{user?.role}</strong>. Akun ini tidak memiliki izin administratif untuk mengakses dashboard pengelola platform MABBACA.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={logout}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <LogOut className="w-4 h-4" /> Keluar & Masuk Sebagai Admin
            </button>

            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Utama
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages wrapped in MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<UniversalSearchPage />} />
        <Route path="/buku" element={<BooksPage />} />
        <Route path="/buku/:id" element={<BookDetailPage />} />
        <Route path="/literasi/toko" element={<StoresPage />} />
        <Route path="/literasi/toko/:id" element={<StoreDetailPage />} />
        <Route path="/literasi/perpustakaan" element={<LibrariesPage />} />
        <Route path="/literasi/perpustakaan/:id" element={<LibraryDetailPage />} />
        <Route path="/komunitas" element={<CommunitiesPage />} />
        <Route path="/komunitas/:id" element={<CommunityDetailPage />} />
        <Route path="/event" element={<EventsPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/baca-5-menit" element={<ArticlesPage />} />
        <Route path="/baca-5-menit/:id" element={<ArticleDetailPage />} />
        <Route path="/mitra" element={<MitraLandingPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-mitra" element={<RegisterMitraPage />} />

        {/* User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboardPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Dedicated Admin Login Route */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Admin Panel Index redirect */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Admin Dashboard Panel with dedicated sidebar & role protection */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <DashboardLayout type="admin" />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
      </Route>

      {/* Mitra Dashboard Panel with dedicated sidebar & role protection */}
      <Route
        path="/mitra"
        element={
          <MitraRoute>
            <DashboardLayout type="mitra" />
          </MitraRoute>
        }
      >
        <Route path="dashboard" element={<MitraDashboardPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
