import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Heart,
  User,
  ChevronDown,
  LogOut,
  LayoutDashboard,
  Store,
  Landmark,
  Calendar,
  Users,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  FileText,
  Info,
  Home,
  ShoppingBag,
  BookMarked,
  ArrowRight,
  Building2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationPanel } from './NotificationPanel';
import { Avatar } from '../common/Avatar';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isMitra, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLiterasiOpen, setIsLiterasiOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const profileRef = useRef(null);
  const literasiRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
      if (literasiRef.current && !literasiRef.current.contains(e.target)) {
        setIsLiterasiOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [location.pathname]);

  // Prevent background scrolling when mobile menu drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Buku', path: '/buku' },
    {
      name: 'Literasi',
      isDropdown: true,
      items: [
        { name: 'Toko Buku', path: '/literasi/toko', icon: Store },
        { name: 'Perpustakaan', path: '/literasi/perpustakaan', icon: Landmark },
        { name: 'Gabung Mitra', path: '/mitra', icon: Building2 },
      ],
    },
    { name: 'Event', path: '/event' },
    { name: 'Komunitas', path: '/komunitas' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8E5] w-full max-w-full">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4 w-full">
            {/* Logo & Brand */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-[#075E54] flex items-center justify-center text-white shadow-xs group-hover:bg-[#05473F] transition-colors">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-[#075E54] leading-none">
                  MABBACA
                </span>
                <span className="text-[9px] sm:text-[10px] text-[#66736D] font-bold tracking-wider">
                  LITERASI SIDRAP
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Visible on Large Tablet / Desktop >= 1024px) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => {
                if (link.isDropdown) {
                  return (
                    <div key={link.name} className="relative" ref={literasiRef}>
                      <button
                        onClick={() => setIsLiterasiOpen(!isLiterasiOpen)}
                        className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          location.pathname.startsWith('/literasi')
                            ? 'text-[#075E54] font-bold bg-[#E8F3EF]'
                            : 'text-[#17211D] hover:text-[#075E54] hover:bg-gray-50'
                        }`}
                      >
                        {link.name}
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                      </button>

                      {isLiterasiOpen && (
                        <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-[#E2E8E5] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                          {link.items.map((item) => {
                            const ItemIcon = item.icon;
                            return (
                              <Link
                                key={item.name}
                                to={item.path}
                                onClick={() => setIsLiterasiOpen(false)}
                                className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#17211D] hover:bg-[#E8F3EF] hover:text-[#075E54] transition-colors"
                              >
                                <ItemIcon className="w-4 h-4 text-[#075E54]" />
                                {item.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'text-[#075E54] font-bold bg-[#E8F3EF]'
                        : 'text-[#17211D] hover:text-[#075E54] hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Search Bar (Wide screens >= 1280px) */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden xl:flex items-center flex-1 max-w-sm relative mx-2"
            >
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari buku, toko, event, komunitas..."
                  className="w-full pl-10 pr-4 py-2 rounded-full text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:bg-white transition-all shadow-xs"
                />
              </div>
            </form>

            {/* Right Action Icons & Auth */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search Trigger (Mobile, Tablet, and iPad < 1280px) */}
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="xl:hidden p-2 rounded-xl text-[#66736D] hover:text-[#075E54] hover:bg-[#E8F3EF] transition-colors"
                aria-label="Buka pencarian"
                title="Pencarian Cepat"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Favorites Button (Hidden on tiny screens to prevent header cramming) */}
              {isAuthenticated && (
                <Link
                  to="/dashboard?tab=favorit"
                  title="Buku Favorit"
                  className="hidden sm:flex p-2 rounded-xl text-[#66736D] hover:text-[#075E54] hover:bg-[#E8F3EF] transition-colors"
                  aria-label="Favorit"
                >
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              {/* Notifications Dropdown Panel (Always visible) */}
              <NotificationPanel />

              {/* Admin Mode Badge */}
              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs hover:bg-amber-600 transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </Link>
              )}

              {/* User Dropdown (Visible on sm/tablet/desktop, inside mobile drawer on small screens) */}
              {isAuthenticated ? (
                <div className="relative hidden sm:block" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-[#E2E8E5] hover:border-[#075E54]/40 hover:bg-gray-50 transition-all"
                  >
                    <Avatar
                      src={user?.avatar}
                      name={user?.name}
                      size="xs"
                    />
                    <span className="text-xs font-bold text-[#17211D] max-w-[90px] lg:max-w-[120px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E2E8E5] py-2 z-50 animate-in fade-in slide-in-from-top-2">
                      {/* Header */}
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-[10px] text-[#66736D] uppercase tracking-wider font-semibold">Akun Terdaftar</p>
                        <p className="text-xs font-bold text-[#17211D] truncate">{user?.name}</p>
                        <p className="text-[11px] text-[#66736D] truncate">{user?.email}</p>
                        <div className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F3EF] text-[#075E54]">
                          <Sparkles className="w-3 h-3 text-[#075E54]" />
                          {user?.level || 'Pembaca Pemula'} ({user?.points || 0} XP)
                        </div>
                      </div>

                      {/* Links */}
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#E8F3EF] hover:text-[#075E54]"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#075E54]" />
                          Dashboard Pengguna
                        </Link>

                        <Link
                          to="/dashboard?tab=misi"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-[#E8F3EF] hover:text-[#075E54]"
                        >
                          <Sparkles className="w-4 h-4 text-[#075E54]" />
                          Misi Literasi
                        </Link>

                        {isMitra && (
                          <Link
                            to="/mitra/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#075E54] bg-[#E8F3EF]/60 hover:bg-[#E8F3EF]"
                          >
                            <Store className="w-4 h-4 text-[#075E54]" />
                            Dashboard Mitra
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            Panel Admin
                          </Link>
                        )}
                      </div>

                      {/* Logout */}
                      <div className="pt-1 border-t border-gray-100">
                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" /> Keluar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-[#075E54] hover:bg-[#E8F3EF] transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-[#075E54] text-white hover:bg-[#05473F] transition-colors shadow-xs"
                  >
                    Daftar
                  </Link>
                </div>
              )}

              {/* Hamburger Menu Toggle (Visible on Mobile & Tablet / iPad < 1024px) */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-xl text-[#66736D] hover:text-[#075E54] hover:bg-[#E8F3EF] transition-colors"
                aria-label="Buka Menu Navigasi"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Quick Search Bar Drawer for Mobile/Tablet */}
          {isMobileSearchOpen && (
            <div className="xl:hidden pb-3 pt-1 animate-in fade-in slide-in-from-top-1">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari buku, toko, perpustakaan, event..."
                    autoFocus
                    className="w-full pl-10 pr-4 py-2 rounded-full text-sm bg-gray-50 border border-gray-200 text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:bg-white shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-[#075E54] text-white text-xs font-bold shrink-0 hover:bg-[#05473F]"
                >
                  Cari
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {/* Modern Slide-Over Navigation Drawer for Mobile & Tablet (iPad) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          />

          {/* Drawer Sheet */}
          <div className="relative w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            {/* Top Section */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#075E54] flex items-center justify-center text-white">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="font-extrabold text-[#075E54] tracking-tight">MABBACA</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Tutup menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Card / Guest Welcome */}
              {isAuthenticated ? (
                <div className="bg-[#E8F3EF] rounded-2xl p-3.5 space-y-2.5 border border-[#cbe1d7]/70">
                  <div className="flex items-center gap-3">
                    <Avatar src={user?.avatar} name={user?.name} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-[#17211D] truncate">{user?.name}</p>
                      <p className="text-[10px] text-[#66736D] truncate">{user?.email}</p>
                      <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-bold text-[#075E54]">
                        <Sparkles className="w-3 h-3 text-[#075E54]" />
                        {user?.level || 'Pembaca'} • {user?.points || 0} XP
                      </span>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-white text-[#075E54] text-xs font-bold rounded-xl shadow-2xs hover:bg-emerald-50 transition-colors"
                  >
                    Buka Dashboard <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-[#075E54] to-[#0F766E] rounded-2xl p-4 text-white space-y-3 shadow-sm">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Warga Sidrap</p>
                    <p className="text-sm font-bold mt-0.5">Jelajahi Ekosistem Literasi</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 text-center text-xs font-bold bg-white text-[#075E54] rounded-xl hover:bg-emerald-50 shadow-xs"
                    >
                      Masuk
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="py-2 text-center text-xs font-bold border border-white/50 text-white rounded-xl hover:bg-white/15"
                    >
                      Daftar
                    </Link>
                  </div>
                </div>
              )}

              {/* In-Drawer Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari buku, event, toko..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-black placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:bg-white"
                />
              </form>

              {/* Navigation Links */}
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[#66736D] uppercase tracking-wider px-2">Menu Utama</p>
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/' ? 'bg-[#E8F3EF] text-[#075E54] font-bold' : 'text-[#17211D] hover:bg-gray-50'
                  }`}
                >
                  <Home className="w-4 h-4 text-[#075E54]" /> Beranda
                </Link>
                <Link
                  to="/buku"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/buku' ? 'bg-[#E8F3EF] text-[#075E54] font-bold' : 'text-[#17211D] hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#075E54]" /> Katalog Buku
                </Link>
                <Link
                  to="/literasi/toko"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/literasi/toko' ? 'bg-[#E8F3EF] text-[#075E54] font-bold' : 'text-[#17211D] hover:bg-gray-50'
                  }`}
                >
                  <Store className="w-4 h-4 text-[#075E54]" /> Toko Buku Sidrap
                </Link>
                <Link
                  to="/literasi/perpustakaan"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/literasi/perpustakaan' ? 'bg-[#E8F3EF] text-[#075E54] font-bold' : 'text-[#17211D] hover:bg-gray-50'
                  }`}
                >
                  <Landmark className="w-4 h-4 text-[#0F766E]" /> Perpustakaan Daerah
                </Link>
                <Link
                  to="/komunitas"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/komunitas' ? 'bg-[#E8F3EF] text-[#075E54] font-bold' : 'text-[#17211D] hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4 text-sky-700" /> Komunitas Literasi
                </Link>
                <Link
                  to="/event"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/event' ? 'bg-[#E8F3EF] text-[#075E54] font-bold' : 'text-[#17211D] hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-amber-600" /> Agenda Event
                </Link>
                <Link
                  to="/baca-5-menit"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/baca-5-menit' ? 'bg-[#E8F3EF] text-[#075E54] font-bold' : 'text-[#17211D] hover:bg-gray-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-indigo-600" /> Baca 5 Menit
                </Link>
                <Link
                  to="/mitra"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/mitra' ? 'bg-[#E8F3EF] text-[#075E54] font-bold' : 'text-[#17211D] hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#0F766E]" /> Gabung Jadi Mitra
                </Link>
                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    location.pathname === '/about' ? 'bg-[#E8F3EF] text-[#075E54] font-bold' : 'text-[#17211D] hover:bg-gray-50'
                  }`}
                >
                  <Info className="w-4 h-4 text-gray-500" /> Tentang MABBACA
                </Link>
              </div>

              {/* User Actions (if logged in) */}
              {isAuthenticated && (
                <div className="space-y-1 pt-2 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-[#66736D] uppercase tracking-wider px-2">Aktivitas Saya</p>
                  <Link
                    to="/dashboard?tab=favorit"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#17211D] hover:bg-gray-50"
                  >
                    <Heart className="w-4 h-4 text-red-500" /> Buku Favorit
                  </Link>
                  <Link
                    to="/dashboard?tab=peminjaman"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#17211D] hover:bg-gray-50"
                  >
                    <BookMarked className="w-4 h-4 text-teal-600" /> Riwayat Peminjaman
                  </Link>
                  <Link
                    to="/dashboard?tab=order"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-[#17211D] hover:bg-gray-50"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600" /> Pesanan Buku
                  </Link>
                </div>
              )}

              {/* Special Portals */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <Link
                  to="/mitra"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#075E54] hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4" />
                    <div>
                      <p className="text-xs font-bold">Gabung Mitra Sidrap</p>
                      <p className="text-[10px] text-emerald-700">Daftarkan Toko Buku, Perpus & Komunitas</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs hover:bg-amber-100 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" /> Panel Administrator
                  </Link>
                )}

                {isMitra && (
                  <Link
                    to="/mitra/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 font-bold text-xs hover:bg-teal-100 transition-colors"
                  >
                    <Store className="w-4 h-4 text-teal-600" /> Dashboard Mitra
                  </Link>
                )}
              </div>
            </div>

            {/* Drawer Footer (Logout / Session) */}
            {isAuthenticated && (
              <div className="p-4 border-t border-gray-100 bg-gray-50/80 pb-20 md:pb-4">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Keluar dari Akun
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
