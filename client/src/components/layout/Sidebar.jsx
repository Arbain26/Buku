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
  BarChart3,
  ShieldCheck,
  Building2,
  FileText,
  LogOut,
  X,
  Layers,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar = ({ isMobileOpen, onClose, type = 'mitra' }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const mitraType = user?.mitraProfile?.mitraType;

  // Build Mitra navigation matching Section 28
  let mitraNavItems = [];

  if (mitraType === 'TOKO_BUKU') {
    mitraNavItems = [
      { name: 'Dashboard', path: '/mitra/dashboard', icon: LayoutDashboard },
      { name: 'Profil Toko', path: '/mitra/dashboard?tab=profile', icon: Building2 },
      { name: 'Produk Buku', path: '/mitra/dashboard?tab=products', icon: BookOpen },
      { name: 'Stok', path: '/mitra/dashboard?tab=products', icon: Package },
      { name: 'Pesanan Masuk', path: '/mitra/dashboard?tab=orders', icon: ShoppingBag },
      { name: 'Statistik', path: '/mitra/dashboard?tab=stats', icon: BarChart3 },
    ];
  } else if (mitraType === 'PERPUSTAKAAN') {
    mitraNavItems = [
      { name: 'Dashboard', path: '/mitra/dashboard', icon: LayoutDashboard },
      { name: 'Profil Perpustakaan', path: '/mitra/dashboard?tab=profile', icon: Building2 },
      { name: 'Koleksi', path: '/mitra/dashboard?tab=collections', icon: BookMarked },
      { name: 'Peminjaman', path: '/mitra/dashboard?tab=borrowings', icon: BookOpen },
      { name: 'Event', path: '/mitra/dashboard?tab=events', icon: Calendar },
      { name: 'Statistik', path: '/mitra/dashboard?tab=stats', icon: BarChart3 },
    ];
  } else if (mitraType === 'KOMUNITAS') {
    mitraNavItems = [
      { name: 'Dashboard', path: '/mitra/dashboard', icon: LayoutDashboard },
      { name: 'Profil Komunitas', path: '/mitra/dashboard?tab=profile', icon: Building2 },
      { name: 'Anggota', path: '/mitra/dashboard?tab=members', icon: Users },
      { name: 'Event', path: '/mitra/dashboard?tab=events', icon: Calendar },
      { name: 'Kegiatan Literasi', path: '/mitra/dashboard?tab=events', icon: Sparkles },
      { name: 'Statistik', path: '/mitra/dashboard?tab=stats', icon: BarChart3 },
    ];
  } else if (mitraType === 'SEKOLAH') {
    mitraNavItems = [
      { name: 'Dashboard', path: '/mitra/dashboard', icon: LayoutDashboard },
      { name: 'Profil Sekolah', path: '/mitra/dashboard?tab=profile', icon: Building2 },
      { name: 'Kegiatan Literasi', path: '/mitra/dashboard?tab=events', icon: BookOpen },
      { name: 'Event', path: '/mitra/dashboard?tab=events', icon: Calendar },
      { name: 'Statistik', path: '/mitra/dashboard?tab=stats', icon: BarChart3 },
    ];
  } else if (mitraType === 'PENGAJAR') {
    mitraNavItems = [
      { name: 'Dashboard', path: '/mitra/dashboard', icon: LayoutDashboard },
      { name: 'Profil Pengajar', path: '/mitra/dashboard?tab=profile', icon: GraduationCap },
      { name: 'Artikel Literasi', path: '/mitra/dashboard?tab=articles', icon: FileText },
      { name: 'Event / Workshop', path: '/mitra/dashboard?tab=events', icon: Calendar },
      { name: 'Statistik', path: '/mitra/dashboard?tab=stats', icon: BarChart3 },
    ];
  } else {
    mitraNavItems = [
      { name: 'Dashboard', path: '/mitra/dashboard', icon: LayoutDashboard },
      { name: 'Profil Mitra', path: '/mitra/dashboard?tab=profile', icon: Building2 },
      { name: 'Event & Kegiatan', path: '/mitra/dashboard?tab=events', icon: Calendar },
      { name: 'Statistik', path: '/mitra/dashboard?tab=stats', icon: BarChart3 },
    ];
  }

  // Admin Navigation matching Section 31
  const adminNavItems = [
    { section: 'Utama', items: [
      { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    ]},
    { section: 'Data Master & Mitra', items: [
      { name: 'Verifikasi Mitra', path: '/admin/dashboard?tab=verifikasi', icon: ShieldCheck },
      { name: 'Pengguna', path: '/admin/dashboard?tab=users', icon: Users },
      { name: 'Katalog Buku', path: '/admin/dashboard?tab=books', icon: BookOpen },
    ]},
    { section: 'Transaksi', items: [
      { name: 'Pesanan Buku', path: '/admin/dashboard?tab=orders', icon: ShoppingBag },
      { name: 'Peminjaman', path: '/admin/dashboard?tab=borrowings', icon: BookMarked },
    ]},
    { section: 'Analytics', items: [
      { name: 'Statistik Literasi', path: '/admin/dashboard?tab=literasi-stats', icon: BarChart3 },
    ]},
  ];

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
        <div className="flex-1 flex flex-col min-h-0">
          {/* Top Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-white/10 shrink-0">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white shadow-xs">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-wide block leading-none">
                  MABBACA
                </span>
                <span className="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">
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

          {/* Navigation Items List */}
          <nav className="p-4 space-y-4 overflow-y-auto flex-1 custom-scroll">
            {type === 'admin' ? (
              adminNavItems.map((group, idx) => (
                <div key={idx} className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300/70 px-3">
                    {group.section}
                  </span>
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = location.pathname + location.search === item.path;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => onClose && onClose()}
                        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-white/20 text-white shadow-xs'
                            : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <ItemIcon className="w-4 h-4 text-emerald-200 shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="space-y-1">
                {mitraNavItems.map((item) => {
                  const ItemIcon = item.icon;
                  const isActive = location.pathname + location.search === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => onClose && onClose()}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-white/20 text-white shadow-xs'
                          : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <ItemIcon className="w-4 h-4 text-emerald-200 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>
        </div>

        {/* Bottom User Profile card & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/10 shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-400/40"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {user?.mitraProfile?.organizationName || user?.name}
              </p>
              <p className="text-[10px] text-emerald-200 truncate">
                {user?.district ? `${user.district}, Sidrap` : user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-emerald-100 bg-white/5 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Keluar Panel
          </button>
        </div>
      </aside>
    </>
  );
};
