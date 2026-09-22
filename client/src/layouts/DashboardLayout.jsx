import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Menu, Bell, Home, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { resolveImageUrl } from '../components/common/ImageWithFallback';

export const DashboardLayout = ({ type = 'mitra' }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-[#F4F6F4]">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
        type={type}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500">
              <Link to="/" className="hover:text-[#075E54] flex items-center gap-1">
                <Home className="w-3.5 h-3.5" /> Beranda
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span className="font-semibold text-[#17211D] capitalize">
                {type === 'admin' ? 'Panel Admin' : 'Panel Mitra'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="text-xs font-medium text-[#075E54] hover:underline hidden sm:block"
            >
              Lihat Website Utama →
            </Link>

            <Link
              to={type === 'admin' ? '/admin/profile' : '/profile'}
              className="flex items-center gap-2 pl-3 border-l border-gray-200 hover:opacity-80 transition-all group"
              title="Klik untuk mengelola profil & ganti foto"
            >
              <img
                src={resolveImageUrl(user?.avatar) || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border border-emerald-600/30 group-hover:ring-2 group-hover:ring-[#075E54]/50 transition-all"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-[#17211D] group-hover:text-[#075E54] transition-colors leading-tight">
                  {user?.mitraProfile?.organizationName || user?.name}
                </span>
                <span className="text-[10px] text-gray-400 font-medium leading-tight">
                  {type === 'admin' ? 'Admin MABBACA' : 'Mitra'} • Edit Profil
                </span>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
