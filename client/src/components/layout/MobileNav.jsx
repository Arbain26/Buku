import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Compass, Calendar, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const MobileNav = () => {
  const { isAuthenticated, isAdmin, isMitra } = useAuth();

  const navItems = [
    { name: 'Beranda', path: '/', icon: Home },
    { name: 'Buku', path: '/buku', icon: BookOpen },
    { name: 'Terdekat', path: '/literasi/toko', icon: Compass },
    { name: 'Event', path: '/event', icon: Calendar },
    {
      name: isAuthenticated ? (isAdmin ? 'Admin' : isMitra ? 'Mitra' : 'Akun') : 'Masuk',
      path: isAuthenticated ? (isAdmin ? '/admin/dashboard' : isMitra ? '/mitra/dashboard' : '/dashboard') : '/login',
      icon: User,
    },
  ];

  return (
    <nav
      aria-label="Navigasi Mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#E2E8E5] px-2 py-1 shadow-md safe-area-bottom pb-[calc(0.4rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-2xl transition-all duration-150 ${
                  isActive
                    ? 'text-[#075E54] font-bold bg-[#E8F3EF]'
                    : 'text-[#66736D] hover:text-[#17211D] active:scale-95'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight tracking-tight">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
