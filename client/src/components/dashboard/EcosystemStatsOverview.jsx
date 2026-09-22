import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  BookOpen,
  Landmark,
  Store,
  Calendar,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { ecosystemService } from '../../services/dataServices';

/**
 * EcosystemStatsOverview
 * 8 KPI cards displaying the Sidrap Literacy Ecosystem overview:
 * 1. Total Pengguna (Masyarakat & Pembaca)
 * 2. Total Mitra (Toko, Perpus & Komunitas)
 * 3. Katalog Buku (Judul Terdaftar)
 * 4. Perpustakaan (Titik Baca Daerah & Desa)
 * 5. Toko Buku (Mitra Pedagang Buku)
 * 6. Komunitas (Lapak Baca & Gerakan)
 * 7. Event Literasi (Agenda Terdaftar)
 * 8. Baca 5 Menit (Artikel Edukasi)
 */
export const EcosystemStatsOverview = ({
  counts: externalCounts,
  activeCard = null,
  onCardClick = null,
  className = '',
}) => {
  const navigate = useNavigate();
  const [internalCounts, setInternalCounts] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If externalCounts not provided or values are all undefined, auto-fetch from backend
    if (!externalCounts || (externalCounts.totalBooks === undefined && externalCounts.totalUsers === undefined)) {
      setIsLoading(true);
      ecosystemService
        .getOverviewStats()
        .then((res) => {
          if (res?.data) {
            setInternalCounts(res.data);
          }
        })
        .catch((err) => {
          console.warn('Failed to load ecosystem stats:', err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [externalCounts]);

  const rawCounts = externalCounts || internalCounts || {};

  const stats = {
    totalUsers: rawCounts.totalUsers ?? 0,
    totalMitra: rawCounts.totalMitra ?? 0,
    totalBooks: rawCounts.totalBooks ?? 0,
    totalLibraries: rawCounts.totalLibraries ?? 0,
    totalStores: rawCounts.totalStores ?? 0,
    totalCommunities: rawCounts.totalCommunities ?? 0,
    totalEvents: rawCounts.totalEvents ?? 0,
    totalArticles: rawCounts.totalArticles ?? 0,
  };

  const handleCardClick = (key, defaultRoute) => {
    if (onCardClick) {
      const handled = onCardClick(key);
      if (handled !== false) return;
    }
    if (defaultRoute) {
      navigate(defaultRoute);
    }
  };

  const cards = [
    {
      id: 'users',
      title: 'Total Pengguna',
      count: stats.totalUsers,
      subtitle: 'Masyarakat & Pembaca',
      icon: Users,
      iconColor: 'text-[#075E54]',
      titleColor: 'text-emerald-950',
      subColor: 'text-[#075E54]',
      hoverBorder: 'hover:border-[#075E54]',
      activeStyle: 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs',
      defaultRoute: '/mitra',
      tooltip: 'Total pengguna terdaftar (masyarakat & pembaca)',
    },
    {
      id: 'mitra',
      title: 'Total Mitra',
      count: stats.totalMitra,
      subtitle: 'Toko, Perpus & Komunitas',
      icon: Building2,
      iconColor: 'text-[#0F766E]',
      titleColor: 'text-teal-950',
      subColor: 'text-[#0F766E]',
      hoverBorder: 'hover:border-[#0F766E]',
      activeStyle: 'bg-teal-50/60 border-teal-500 ring-2 ring-teal-500/20 shadow-xs',
      defaultRoute: '/mitra',
      tooltip: 'Total mitra literasi se-Kabupaten Sidrap',
    },
    {
      id: 'books',
      title: 'Katalog Buku',
      count: stats.totalBooks,
      subtitle: 'Judul Terdaftar',
      icon: BookOpen,
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-950',
      subColor: 'text-emerald-700',
      hoverBorder: 'hover:border-emerald-500',
      activeStyle: 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs',
      defaultRoute: '/buku',
      tooltip: 'Total judul buku dalam katalog daerah',
    },
    {
      id: 'libraries',
      title: 'Perpustakaan',
      count: stats.totalLibraries,
      subtitle: 'Titik Baca Daerah & Desa',
      icon: Landmark,
      iconColor: 'text-teal-600',
      titleColor: 'text-teal-950',
      subColor: 'text-teal-700',
      hoverBorder: 'hover:border-teal-500',
      activeStyle: 'bg-teal-50/60 border-teal-500 ring-2 ring-teal-500/20 shadow-xs',
      defaultRoute: '/literasi/perpustakaan',
      tooltip: 'Perpustakaan daerah, desa, dan titik baca',
    },
    {
      id: 'stores',
      title: 'Toko Buku',
      count: stats.totalStores,
      subtitle: 'Mitra Pedagang Buku',
      icon: Store,
      iconColor: 'text-emerald-700',
      titleColor: 'text-emerald-950',
      subColor: 'text-emerald-800',
      hoverBorder: 'hover:border-emerald-600',
      activeStyle: 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs',
      defaultRoute: '/literasi/toko',
      tooltip: 'Toko buku dan distributor literasi mitra',
    },
    {
      id: 'communities',
      title: 'Komunitas',
      count: stats.totalCommunities,
      subtitle: 'Lapak Baca & Gerakan',
      icon: Users,
      iconColor: 'text-cyan-700',
      titleColor: 'text-cyan-950',
      subColor: 'text-cyan-800',
      hoverBorder: 'hover:border-cyan-600',
      activeStyle: 'bg-cyan-50/60 border-cyan-500 ring-2 ring-cyan-500/20 shadow-xs',
      defaultRoute: '/literasi/komunitas',
      tooltip: 'Komunitas literasi, lapak baca, dan pegiat literasi',
    },
    {
      id: 'events',
      title: 'Event Literasi',
      count: stats.totalEvents,
      subtitle: 'Agenda Terdaftar',
      icon: Calendar,
      iconColor: 'text-indigo-600',
      titleColor: 'text-indigo-950',
      subColor: 'text-indigo-600',
      hoverBorder: 'hover:border-indigo-400',
      activeStyle: 'bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs',
      defaultRoute: '/event',
      tooltip: 'Agenda bedah buku, workshop, dan festival literasi',
    },
    {
      id: 'articles',
      title: 'Baca 5 Menit',
      count: stats.totalArticles,
      subtitle: 'Artikel Edukasi',
      icon: FileText,
      iconColor: 'text-amber-600',
      titleColor: 'text-amber-950',
      subColor: 'text-amber-700',
      hoverBorder: 'hover:border-amber-400',
      activeStyle: 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20 shadow-xs',
      defaultRoute: '/artikel',
      tooltip: 'Artikel edukasi dan ringkasan baca 5 menit',
    },
  ];

  if (isLoading && !externalCounts) {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border border-[#E5E7EB] bg-white animate-pulse space-y-2">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-6 w-12 bg-gray-300 rounded" />
            <div className="h-2.5 w-28 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = activeCard === c.id;

        return (
          <div
            key={c.id}
            onClick={() => handleCardClick(c.id, c.defaultRoute)}
            title={c.tooltip}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              isActive
                ? c.activeStyle
                : `bg-white border-[#E5E7EB] ${c.hoverBorder} hover:shadow-xs`
            }`}
          >
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span className={`font-semibold ${c.titleColor}`}>{c.title}</span>
              <Icon className={`w-4 h-4 ${c.iconColor}`} />
            </div>
            <p className="text-2xl font-bold text-[#17211D]">{c.count}</p>
            <span className={`text-[11px] ${c.subColor} font-medium flex items-center gap-0.5 mt-0.5`}>
              {c.subtitle} <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        );
      })}
    </div>
  );
};
