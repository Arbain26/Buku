import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Bell,
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
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isMitra, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLiterasiOpen, setIsLiterasiOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Buku', path: '/buku' },
    {
      name: 'Literasi',
      isDropdown: true,
      items: [
        { name: 'Toko Buku', path: '/literasi/toko', icon: Store },
        { name: 'Perpustakaan', path: '/literasi/perpustakaan', icon: Landmark },
      ],
    },
    { name: 'Event', path: '/event' },
    { name: 'Komunitas', path: '/komunitas' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-[#075E54] flex items-center justify-center text-white shadow-xs group-hover:bg-[#05473F] transition-colors">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#075E54] leading-none">
                MABBACA
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide">
                LITERASI SIDRAP
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              if (link.isDropdown) {
                return (
                  <div key={link.name} className="relative" ref={literasiRef}>
                    <button
                      onClick={() => setIsLiterasiOpen(!isLiterasiOpen)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname.startsWith('/literasi')
                          ? 'text-[#075E54] font-semibold bg-emerald-50'
                          : 'text-gray-700 hover:text-[#075E54] hover:bg-gray-50'
                      }`}
                    >
                      {link.name}
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {isLiterasiOpen && (
                      <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E5E7EB] py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                        {link.items.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              to={item.path}
                              onClick={() => setIsLiterasiOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#075E54] transition-colors"
                            >
                              <ItemIcon className="w-4 h-4 text-emerald-700" />
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
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#075E54] font-semibold bg-emerald-50'
                      : 'text-gray-700 hover:text-[#075E54] hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Universal Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex items-center flex-1 max-w-xs md:max-w-sm relative"
          >
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mau mencari apa hari ini?"
                className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs sm:text-sm bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075E54] focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Right Action Icons & User Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                {/* Favorites button */}
                <Link
                  to="/dashboard"
                  title="Buku Favorit"
                  className="p-2 rounded-full text-gray-600 hover:text-[#075E54] hover:bg-emerald-50 transition-colors relative"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Notifications icon */}
                <Link
                  to="/dashboard"
                  title="Notifikasi"
                  className="p-2 rounded-full text-gray-600 hover:text-[#075E54] hover:bg-emerald-50 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-600 rounded-full ring-2 ring-white"></span>
                </Link>

                {/* Admin Mode Quick Badge */}
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white shadow-xs hover:bg-amber-600 transition-all"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" /> Panel Admin
                  </Link>
                )}

                {/* User Dropdown */}
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full border border-gray-200 hover:border-emerald-300 hover:bg-gray-50 transition-all"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={user?.name}
                      className="w-7 h-7 rounded-full object-cover border border-emerald-600/30"
                    />
                    <span className="hidden lg:block text-xs font-semibold text-[#17211D] max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#E5E7EB] py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Akun</p>
                        <p className="text-sm font-semibold text-[#17211D] truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          {user?.level || 'Pembaca Pemula'} ({user?.points || 0} Poin)
                        </div>
                      </div>

                      {/* Navigation list */}
                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-[#075E54]"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-700" />
                          Dashboard Pengguna
                        </Link>

                        {isMitra && (
                          <Link
                            to="/mitra/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-[#075E54] bg-emerald-50/60 hover:bg-emerald-100"
                          >
                            <Store className="w-4 h-4 text-[#075E54]" />
                            Dashboard Mitra
                          </Link>
                        )}

                        {isAdmin && (
                          <Link
                            to="/admin/dashboard"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-900 bg-amber-50 hover:bg-amber-100"
                          >
                            <LayoutDashboard className="w-4 h-4 text-amber-700" />
                            Dashboard Admin
                          </Link>
                        )}

                        <button
                          onClick={() => {
                            setIsProfileOpen(false);
                            logout();
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 text-left border-t border-gray-100 mt-1"
                        >
                          <LogOut className="w-4 h-4" />
                          Keluar (Logout)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-700 hover:text-[#075E54] hover:bg-gray-100 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-medium bg-[#075E54] text-white hover:bg-[#05473F] transition-colors shadow-xs"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar below header */}
        <div className="sm:hidden pb-3 pt-1">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mau mencari apa hari ini?"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            />
          </form>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            if (link.isDropdown) {
              return (
                <div key={link.name} className="py-1 border-b border-gray-50">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">
                    Literasi
                  </p>
                  {link.items.map((item) => (
                    <Link
                      key={item.name}
                      to={item.path}
                      className="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-emerald-50 hover:text-[#075E54]"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              );
            }
            return (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-[#075E54]"
              >
                {link.name}
              </Link>
            );
          })}

          <Link
            to="/baca-5-menit"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-[#075E54]"
          >
            Baca 5 Menit
          </Link>
          <Link
            to="/mitra"
            className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-800 bg-emerald-50/80"
          >
            Jadilah Mitra Literasi
          </Link>
        </div>
      )}
    </header>
  );
};
