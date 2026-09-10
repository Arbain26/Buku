import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  Heart,
  Calendar,
  Clock,
  CheckCircle2,
  Trophy,
  Activity,
  ArrowRight,
  Landmark,
} from 'lucide-react';
import { userService } from '../../services/dataServices';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const UserDashboardPage = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('misi'); // misi, favorit, peminjaman, event, aktivitas

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        const res = await userService.getDashboard();
        if (res?.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error('Failed to load user dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleCompleteMission = async (missionId) => {
    try {
      const res = await userService.completeMission(missionId);
      showToast(res.message, 'success');
      refreshUser();
      // Refresh dashboard data
      const refreshed = await userService.getDashboard();
      if (refreshed?.data) setDashboardData(refreshed.data);
    } catch (err) {
      showToast('Gagal menyelesaikan misi.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="w-1/3 h-10" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { summary, favorites, borrowings, events, activities, missions } = dashboardData || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner & Gamification Card */}
      <div className="bg-gradient-to-r from-[#075E54] to-[#0F766E] rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/40 shadow-inner shrink-0"
          />
          <div>
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Dashboard Warga Pembaca
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Selamat datang, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              Kecamatan {user?.district || 'Pangkajene'}, Sidrap
            </p>
          </div>
        </div>

        {/* Gamification Level Box */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-full md:w-80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-300" /> Level Membaca:
            </span>
            <span className="text-xs font-bold text-amber-300">
              {dashboardData?.user?.level}
            </span>
          </div>

          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-300 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${dashboardData?.user?.levelProgress || 40}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-100 pt-0.5">
            <span>{summary?.points || 0} Poin</span>
            <span>Menuju: {dashboardData?.user?.nextLevel}</span>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Artikel Dibaca</span>
            <BookOpen className="w-4 h-4 text-[#075E54]" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{summary?.articlesRead || 0}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Baca 5 Menit</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Buku Disimpan</span>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{summary?.booksSaved || 0}</p>
          <span className="text-[11px] text-gray-400">Koleksi Favorit</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Peminjaman</span>
            <Landmark className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{summary?.activeBorrowings || 0}</p>
          <span className="text-[11px] text-teal-700 font-medium">Di Perpustakaan</span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Event Diikuti</span>
            <Calendar className="w-4 h-4 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{summary?.eventsJoined || 0}</p>
          <span className="text-[11px] text-cyan-700 font-medium">Komunitas Sidrap</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('misi')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'misi'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Misi Hari Ini
        </button>
        <button
          onClick={() => setActiveTab('favorit')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'favorit'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          Buku Favorit ({favorites?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('peminjaman')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'peminjaman'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Landmark className="w-4 h-4" />
          Riwayat Peminjaman ({borrowings?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('event')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'event'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Event Saya ({events?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('aktivitas')}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            activeTab === 'aktivitas'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Activity className="w-4 h-4" />
          Aktivitas Terakhir
        </button>
      </div>

      {/* Tab Contents */}
      {/* 1. MISI HARI INI */}
      {activeTab === 'misi' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#17211D]">Misi Harian Literasi</h3>
            <span className="text-xs text-gray-500">Selesaikan misi untuk menaikkan level</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missions?.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  m.isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-white border-[#E5E7EB]'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#17211D]">{m.title}</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full">
                      +{m.pointsReward} Poin
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{m.description}</p>
                </div>

                {m.isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Selesai
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteMission(m.id)}
                    className="text-xs shrink-0"
                  >
                    Klaim Misi
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. BUKU FAVORIT */}
      {activeTab === 'favorit' && (
        <div>
          {favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map((book) => (
                <div key={book.id} className="bg-white p-3 rounded-2xl border border-gray-200 space-y-2">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <h4 className="font-semibold text-xs text-[#17211D] truncate">{book.title}</h4>
                  <p className="text-[11px] text-gray-500">{book.author}</p>
                  <Link
                    to={`/buku/${book.id}`}
                    className="block text-center text-xs font-semibold text-[#075E54] hover:underline pt-1"
                  >
                    Buka Detail →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada buku favorit"
              description="Jelajahi katalog buku dan klik ikon hati untuk menyimpan buku ke daftar ini."
              actionText="Jelajahi Buku Sekarang"
              onAction={() => (window.location.href = '/buku')}
            />
          )}
        </div>
      )}

      {/* 3. PEMINJAMAN */}
      {activeTab === 'peminjaman' && (
        <div className="space-y-4">
          {borrowings && borrowings.length > 0 ? (
            <div className="space-y-3">
              {borrowings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded-2xl border border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      <img src={b.coverImage} alt={b.bookTitle} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#17211D]">{b.bookTitle}</h4>
                      <p className="text-xs text-gray-500">{b.libraryName}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Batas Kembali: {new Date(b.dueDate).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-center ${
                      b.status === 'BORROWED'
                        ? 'bg-blue-50 text-blue-800'
                        : b.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-800'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada peminjaman aktif"
              description="Anda dapat meminjam buku dari koleksi perpustakaan desa atau perpustakaan daerah di Sidrap."
              actionText="Cari Koleksi Perpustakaan"
              onAction={() => (window.location.href = '/literasi/perpustakaan')}
            />
          )}
        </div>
      )}

      {/* 4. EVENT SAYA */}
      {activeTab === 'event' && (
        <div className="space-y-4">
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white p-4 rounded-2xl border border-[#E5E7EB] flex gap-3 items-center"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    <img src={ev.banner} alt={ev.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs text-[#17211D] truncate">{ev.title}</h4>
                    <p className="text-[11px] text-gray-500">{ev.locationName}, {ev.district}</p>
                    <p className="text-[10px] text-emerald-700 font-medium mt-1">
                      {new Date(ev.eventDate).toLocaleDateString('id-ID')} • {ev.startTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum mendaftar di event manapun"
              description="Temukan agenda bedah buku atau diskusi literasi menarik akhir pekan ini."
              actionText="Lihat Agenda Event"
              onAction={() => (window.location.href = '/event')}
            />
          )}
        </div>
      )}

      {/* 5. AKTIVITAS TERAKHIR */}
      {activeTab === 'aktivitas' && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 space-y-3">
          <h3 className="font-bold text-sm text-[#17211D] mb-2">Riwayat Poin & Aktivitas</h3>
          <div className="space-y-2.5">
            {activities?.map((act) => (
              <div
                key={act.id}
                className="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-0"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-[#17211D]">{act.description}</p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(act.createdAt).toLocaleString('id-ID')}
                  </p>
                </div>
                {act.pointsEarned > 0 && (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    +{act.pointsEarned} Poin
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
