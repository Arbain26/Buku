import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  Package,
  ShoppingBag,
  BookMarked,
  Calendar,
  Users,
  Star,
  BarChart3,
  Settings,
  ShieldCheck,
  Building2,
  FileText,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = ({ isMobileOpen, onClose, type = 'mitra' }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const mitraType = user?.mitraProfile?.mitraType;

  // Navigation menu adapted for MITRA
  let mitraNavItems = [
    { name: 'Dashboard', path: '/mitra/dashboard', icon: LayoutDashboard },
  ];

  if (mitraType === 'TOKO_BUKU') {
    mitraNavItems.push(
      { name: 'Produk Buku', path: '/mitra/dashboard?tab=products', icon: Package },
      { name: 'Pesanan', path: '/mitra/dashboard?tab=orders', icon: ShoppingBag }
    );
  } else if (mitraType === 'PERPUSTAKAAN') {
    mitraNavItems.push(
      { name: 'Koleksi Buku', path: '/mitra/dashboard?tab=collections', icon: BookMarked },
      { name: 'Peminjaman', path: '/mitra/dashboard?tab=borrowings', icon: BookOpen }
    );
  } else if (mitraType === 'KOMUNITAS') {
    mitraNavItems.push(
      { name: 'Kegiatan & Event', path: '/mitra/dashboard?tab=events', icon: Calendar },
      { name: 'Anggota', path: '/mitra/dashboard?tab=members', icon: Users }
    );
  }

  mitraNavItems.push(
    { name: 'Event', path: '/event', icon: Calendar },
    { name: 'Komunitas', path: '/komunitas', icon: Users },
    { name: 'Statistik', path: '/mitra/dashboard?tab=stats', icon: BarChart3 },
    { name: 'Profil Mitra', path: '/mitra/dashboard?tab=profile', icon: Building2 }
  );

  // Navigation menu for ADMIN
  const adminNavItems = [
    { name: 'Dashboard Utama', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Verifikasi Mitra', path: '/admin/dashboard?tab=verifikasi', icon: ShieldCheck },
    { name: 'Data Literasi Sidrap', path: '/admin/dashboard?tab=literasi-stats', icon: BarChart3 },
    { name: 'Kelola Pengguna', path: '/admin/dashboard?tab=users', icon: Users },
    { name: 'Katalog Buku', path: '/buku', icon: BookOpen },
    { name: 'Agenda Event', path: '/event', icon: Calendar },
  ];

  const items = type === 'admin' ? adminNavItems : mitraNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#075E54] text-white flex flex-col justify-between z-50 transition-transform duration-200 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Top Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-white/10">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base tracking-wide block leading-none">
                  MABBACA
                </span>
                <span className="text-[10px] text-emerald-200 font-medium uppercase tracking-wider">
                  {type === 'admin' ? 'PANEL ADMIN' : `MITRA • ${mitraType || 'LITERASI'}`}
                </span>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md text-emerald-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Nav Items List */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-160px)]">
            {items.map((item) => {
              const ItemIcon = item.icon;
              const isActive = location.pathname + location.search === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/20 text-white shadow-xs font-semibold'
                      : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <ItemIcon className="w-4 h-4 text-emerald-200 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile card & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400/40"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.mitraProfile?.organizationName || user?.name}
              </p>
              <p className="text-[11px] text-emerald-200 truncate">
                {user?.district ? `${user.district}, Sidrap` : user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-emerald-100 bg-white/5 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Panel
          </button>
        </div>
      </aside>
    </>
  );
};
