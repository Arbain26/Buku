import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

// Layouts (loaded directly for instant shell rendering)
import { MainLayout } from '../layouts/MainLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Loading fallback component matching MABBACA Design System
const PageFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 p-8">
    <div className="w-9 h-9 border-3 border-[#075E54]/20 border-t-[#075E54] rounded-full animate-spin" />
    <span className="text-xs font-semibold text-[#66736D] animate-pulse">
      Memuat halaman MABBACA...
    </span>
  </div>
);

// Route-based Code Splitting with React.lazy
const HomePage = lazy(() => import('../pages/public/HomePage').then((m) => ({ default: m.HomePage })));
const BooksPage = lazy(() => import('../pages/public/BooksPage').then((m) => ({ default: m.BooksPage })));
const BookDetailPage = lazy(() => import('../pages/public/BookDetailPage').then((m) => ({ default: m.BookDetailPage })));
const StoresPage = lazy(() => import('../pages/public/StoresPage').then((m) => ({ default: m.StoresPage })));
const StoreDetailPage = lazy(() => import('../pages/public/StoreDetailPage').then((m) => ({ default: m.StoreDetailPage })));
const LibrariesPage = lazy(() => import('../pages/public/LibrariesPage').then((m) => ({ default: m.LibrariesPage })));
const LibraryDetailPage = lazy(() => import('../pages/public/LibraryDetailPage').then((m) => ({ default: m.LibraryDetailPage })));
const CommunitiesPage = lazy(() => import('../pages/public/CommunitiesPage').then((m) => ({ default: m.CommunitiesPage })));
const CommunityDetailPage = lazy(() => import('../pages/public/CommunityDetailPage').then((m) => ({ default: m.CommunityDetailPage })));
const EventsPage = lazy(() => import('../pages/public/EventsPage').then((m) => ({ default: m.EventsPage })));
const EventDetailPage = lazy(() => import('../pages/public/EventDetailPage').then((m) => ({ default: m.EventDetailPage })));
const ArticlesPage = lazy(() => import('../pages/public/ArticlesPage').then((m) => ({ default: m.ArticlesPage })));
const ArticleDetailPage = lazy(() => import('../pages/public/ArticleDetailPage').then((m) => ({ default: m.ArticleDetailPage })));
const UniversalSearchPage = lazy(() => import('../pages/public/UniversalSearchPage').then((m) => ({ default: m.UniversalSearchPage })));
const MitraLandingPage = lazy(() => import('../pages/public/MitraLandingPage').then((m) => ({ default: m.MitraLandingPage })));
const AboutPage = lazy(() => import('../pages/public/AboutPage').then((m) => ({ default: m.AboutPage })));

// Auth Pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));
const RegisterMitraPage = lazy(() => import('../pages/auth/RegisterMitraPage').then((m) => ({ default: m.RegisterMitraPage })));

// Admin Auth & Dashboard
const AdminLoginPage = lazy(() => import('../pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));

// User & Mitra Dashboards
const UserDashboardPage = lazy(() => import('../pages/user/UserDashboardPage').then((m) => ({ default: m.UserDashboardPage })));
const ProfilePage = lazy(() => import('../pages/user/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const MitraDashboardPage = lazy(() => import('../pages/mitra/MitraDashboardPage').then((m) => ({ default: m.MitraDashboardPage })));

// Protected Route Helpers
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <PageFallback />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const MitraRoute = ({ children }) => {
  const { isAuthenticated, isMitra, isLoading } = useAuth();
  if (isLoading) return <PageFallback />;
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
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Pages wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<UniversalSearchPage />} />

          {/* Books */}
          <Route path="/buku" element={<BooksPage />} />
          <Route path="/buku/:id" element={<BookDetailPage />} />
          <Route path="/books" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />

          {/* Stores */}
          <Route path="/literasi/toko" element={<StoresPage />} />
          <Route path="/literasi/toko/:id" element={<StoreDetailPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/stores/:id" element={<StoreDetailPage />} />

          {/* Libraries */}
          <Route path="/literasi/perpustakaan" element={<LibrariesPage />} />
          <Route path="/literasi/perpustakaan/:id" element={<LibraryDetailPage />} />
          <Route path="/libraries" element={<LibrariesPage />} />
          <Route path="/libraries/:id" element={<LibraryDetailPage />} />

          {/* Communities */}
          <Route path="/komunitas" element={<CommunitiesPage />} />
          <Route path="/komunitas/:id" element={<CommunityDetailPage />} />
          <Route path="/communities" element={<CommunitiesPage />} />
          <Route path="/communities/:id" element={<CommunityDetailPage />} />

          {/* Events */}
          <Route path="/event" element={<EventsPage />} />
          <Route path="/event/:id" element={<EventDetailPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />

          {/* Articles */}
          <Route path="/baca-5-menit" element={<ArticlesPage />} />
          <Route path="/baca-5-menit/:id" element={<ArticleDetailPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />

          {/* Mitra & About */}
          <Route path="/mitra" element={<MitraLandingPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/tentang" element={<AboutPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/register-mitra" element={<RegisterMitraPage />} />
          <Route path="/register/mitra" element={<RegisterMitraPage />} />

          {/* User Dashboard & Profile */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
    </Suspense>
  );
};
