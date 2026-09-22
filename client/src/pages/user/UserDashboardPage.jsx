import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
  ShoppingBag,
  Users,
  Bell,
  MessageCircle,
  ExternalLink,
  Award,
} from 'lucide-react';
import { userService, orderService, notificationService } from '../../services/dataServices';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Tabs } from '../../components/common/Tabs';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { Avatar } from '../../components/common/Avatar';
import { EcosystemStatsOverview } from '../../components/dashboard/EcosystemStatsOverview';

export const UserDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'misi';

  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [userNotifs, setUserNotifs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabParam);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const [dashRes, ordersRes, lbRes, notifRes] = await Promise.allSettled([
        userService.getDashboard(),
        orderService.getOrders(),
        api.get('/gamification/leaderboard'),
        notificationService.getNotifications({ limit: 10 }),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboardData(dashRes.value.data);
      }
      if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
        setUserOrders(Array.isArray(ordersRes.value.data) ? ordersRes.value.data : ordersRes.value.data.orders || []);
      }
      if (lbRes.status === 'fulfilled' && lbRes.value?.data?.data) {
        setLeaderboard(lbRes.value.data.data);
      }
      if (notifRes.status === 'fulfilled' && notifRes.value?.data) {
        const list = notifRes.value.data.notifications || (Array.isArray(notifRes.value.data) ? notifRes.value.data : []);
        setUserNotifs(list);
      }
    } catch (err) {
      console.error('Failed to load user dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams);
    params.set('tab', newTab);
    setSearchParams(params);
  };

  const handleCompleteMission = async (missionId) => {
    try {
      const res = await userService.completeMission(missionId);
      showToast(res.message || 'Misi berhasil diselesaikan!', 'success');
      refreshUser();
      const refreshed = await userService.getDashboard();
      if (refreshed?.data) setDashboardData(refreshed.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyelesaikan misi.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="w-1/3 h-10" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, n) => (
            <Skeleton key={n} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="w-full h-80 rounded-3xl" />
      </div>
    );
  }

  const { summary, favorites, borrowings, events, activities, missions } = dashboardData || {};

  const dashboardTabs = [
    { id: 'misi', label: 'Misi Literasi', count: missions?.filter((m) => !m.isCompleted).length },
    { id: 'aktivitas', label: 'Aktivitas Terbaru' },
    { id: 'favorit', label: 'Buku Favorit', count: favorites?.length },
    { id: 'event', label: 'Event Saya', count: events?.length },
    { id: 'peminjaman', label: 'Peminjaman', count: borrowings?.length },
    { id: 'order', label: 'Pesanan Buku', count: userOrders?.length },
    { id: 'leaderboard', label: 'Leaderboard Sidrap' },
    { id: 'notifikasi', label: 'Notifikasi', count: userNotifs?.filter((n) => !n.isRead).length },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. WELCOME BANNER & GAMIFICATION (SECTION 25 & 26) */}
      <div className="bg-gradient-to-r from-[#075E54] to-[#0F766E] rounded-3xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar
            src={user?.avatar}
            name={user?.name}
            size="xl"
            className="border-2 border-white/40 shadow-inner"
          />
          <div>
            <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider">
              Dashboard Warga Pembaca
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Halo, {user?.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-1">
              Kecamatan {user?.district || 'Pangkajene'}, Kabupaten Sidrap
            </p>
          </div>
        </div>

        {/* Level & XP Progress Card */}
        <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 w-full md:w-80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-300" /> Level Literasi:
            </span>
            <span className="text-xs font-extrabold text-amber-300">
              {dashboardData?.user?.level || user?.level || 'Pembaca Pemula'}
            </span>
          </div>

          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-amber-300 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${dashboardData?.user?.levelProgress || 45}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-emerald-100 pt-0.5">
            <span className="font-bold">{summary?.points || user?.points || 0} XP</span>
            <span>Menuju: {dashboardData?.user?.nextLevel || 'Pembaca Setia'}</span>
          </div>
        </div>
      </div>

      {/* 2. STATISTIK LENGKAP (SECTION 25) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-[#E2E8E5] shadow-xs">
          <span className="text-[11px] font-bold text-[#66736D] block mb-1">Total Poin</span>
          <p className="text-xl font-extrabold text-[#075E54]">{summary?.points || user?.points || 0}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">XP Terkumpul</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8E5] shadow-xs">
          <span className="text-[11px] font-bold text-[#66736D] block mb-1">Level Anda</span>
          <p className="text-sm font-extrabold text-[#17211D] truncate">{user?.level || 'Pemula'}</p>
          <span className="text-[10px] text-amber-600 font-semibold">Tingkat Membaca</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8E5] shadow-xs">
          <span className="text-[11px] font-bold text-[#66736D] block mb-1">Buku Favorit</span>
          <p className="text-xl font-extrabold text-[#17211D]">{summary?.booksSaved || favorites?.length || 0}</p>
          <span className="text-[10px] text-[#66736D]">Tersimpan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8E5] shadow-xs">
          <span className="text-[11px] font-bold text-[#66736D] block mb-1">Event Diikuti</span>
          <p className="text-xl font-extrabold text-[#17211D]">{summary?.eventsJoined || events?.length || 0}</p>
          <span className="text-[10px] text-sky-600 font-semibold">Agenda Aktif</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8E5] shadow-xs">
          <span className="text-[11px] font-bold text-[#66736D] block mb-1">Komunitas</span>
          <p className="text-xl font-extrabold text-[#17211D]">{summary?.communitiesJoined || 1}</p>
          <span className="text-[10px] text-teal-600 font-semibold">Diikuti</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E2E8E5] shadow-xs">
          <span className="text-[11px] font-bold text-[#66736D] block mb-1">Buku Dipinjam</span>
          <p className="text-xl font-extrabold text-[#17211D]">{summary?.activeBorrowings || borrowings?.length || 0}</p>
          <span className="text-[10px] text-indigo-600 font-semibold">Di Perpustakaan</span>
        </div>
      </div>

      {/* 3. EKOSISTEM LITERASI KABUPATEN SIDRAP (Hanya tampil di tab utama Dashboard) */}
      {activeTab === 'misi' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#17211D] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#075E54]" />
                Kondisi Ekosistem Literasi Sidrap
              </h2>
              <p className="text-xs text-gray-500">
                Jejaring perpustakaan, toko buku, komunitas literasi, dan agenda literasi se-Kabupaten Sidrap
              </p>
            </div>
          </div>
          <EcosystemStatsOverview
            counts={dashboardData?.ecosystemCounts}
            onCardClick={(key) => {
              if (key === 'events') {
                handleTabChange('event');
                return true;
              }
              if (key === 'users') {
                handleTabChange('leaderboard');
                return true;
              }
              return false;
            }}
          />
        </div>
      )}

      {/* 4. TABS NAVIGATION */}
      <Tabs
        tabs={dashboardTabs}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="pills"
      />

      {/* 4. TAB CONTENT SECTIONS */}

      {/* A. MISI LITERASI (GAMIFICATION) */}
      {activeTab === 'misi' && (
        <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#17211D]">Misi Literasi Harian & Mingguan</h3>
            <p className="text-xs text-[#66736D]">
              Selesaikan misi aktivitas membaca dan berinteraksi untuk mengumpulkan poin dan naik level
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {missions?.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl border border-[#E2E8E5] bg-[#F8FAF8] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3EF] text-[#075E54] flex items-center justify-center shrink-0 border border-[#cbe1d7]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#17211D]">{m.title}</h4>
                    <p className="text-xs text-[#66736D] mt-0.5">{m.description}</p>
                    <span className="inline-block mt-1 font-bold text-[11px] text-[#075E54]">
                      +{m.rewardPoints} XP
                    </span>
                  </div>
                </div>

                {m.isCompleted ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#075E54] bg-[#E8F3EF] px-3 py-1 rounded-full border border-[#cbe1d7] shrink-0 self-start sm:self-center">
                    <CheckCircle2 className="w-4 h-4" /> Selesai
                  </span>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteMission(m.id)}
                    className="text-xs font-bold border-[#075E54] text-[#075E54] hover:bg-[#E8F3EF] shrink-0 self-start sm:self-center"
                  >
                    Klaim Misi (+{m.rewardPoints} XP)
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* B. AKTIVITAS TERBARU */}
      {activeTab === 'aktivitas' && (
        <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#17211D]">Riwayat Aktivitas & Perolehan Poin</h3>
          <div className="divide-y divide-gray-100">
            {activities && activities.length > 0 ? (
              activities.map((act) => (
                <div key={act.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-[#17211D]">{act.description}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(act.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  {act.pointsEarned > 0 && (
                    <span className="font-bold text-[#075E54] bg-[#E8F3EF] px-2.5 py-0.5 rounded-full border border-[#cbe1d7]">
                      +{act.pointsEarned} XP
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-[#66736D] py-4 text-center">Belum ada aktivitas tercatat.</p>
            )}
          </div>
        </div>
      )}

      {/* C. BUKU FAVORIT */}
      {activeTab === 'favorit' && (
        <div>
          {favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {favorites.map((book) => (
                <div key={book.id} className="bg-white p-3.5 rounded-2xl border border-[#E2E8E5] space-y-2 shadow-xs">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#E8F3EF]">
                    <ImageWithFallback
                      src={book.coverImage}
                      alt={book.title}
                      fallbackText={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-xs text-[#17211D] truncate">{book.title}</h4>
                  <p className="text-[11px] text-[#66736D] truncate">{book.author}</p>
                  <Link
                    to={`/buku/${book.id}`}
                    className="block text-center text-xs font-bold text-[#075E54] hover:underline pt-1"
                  >
                    Buka Detail →
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada buku favorit"
              description="Buku yang Anda simpan akan muncul di sini. Klik ikon hati pada buku yang ingin Anda simpan."
              actionText="Jelajahi Buku Sekarang"
              onAction={() => (window.location.href = '/buku')}
            />
          )}
        </div>
      )}

      {/* D. PEMINJAMAN BUKU */}
      {activeTab === 'peminjaman' && (
        <div className="space-y-4">
          {borrowings && borrowings.length > 0 ? (
            <div className="space-y-3">
              {borrowings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white p-4 rounded-2xl border border-[#E2E8E5] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-xl bg-[#E8F3EF] overflow-hidden shrink-0">
                      <ImageWithFallback src={b.coverImage} alt={b.bookTitle} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#17211D]">{b.bookTitle}</h4>
                      <p className="text-xs text-[#66736D]">{b.libraryName}</p>
                      <p className="text-[11px] text-[#66736D] mt-1">
                        Batas Kembali: {b.dueDate ? new Date(b.dueDate).toLocaleDateString('id-ID') : '14 Hari'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold self-start sm:self-center ${
                      b.status === 'BORROWED' || b.status === 'APPROVED'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : b.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {b.status === 'APPROVED' ? 'Disetujui' : b.status === 'PENDING' ? 'Menunggu Verifikasi' : b.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada peminjaman aktif"
              description="Anda dapat meminjam buku dari koleksi perpustakaan daerah di Kabupaten Sidrap secara gratis."
              actionText="Cari Koleksi Perpustakaan"
              onAction={() => (window.location.href = '/literasi/perpustakaan')}
            />
          )}
        </div>
      )}

      {/* E. EVENT SAYA */}
      {activeTab === 'event' && (
        <div className="space-y-4">
          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="bg-white p-4 rounded-2xl border border-[#E2E8E5] flex gap-3.5 items-center shadow-xs"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#E8F3EF] shrink-0">
                    <ImageWithFallback src={ev.banner} alt={ev.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs sm:text-sm text-[#17211D] truncate">{ev.title}</h4>
                    <p className="text-[11px] text-[#66736D]">{ev.locationName}, {ev.district}</p>
                    <p className="text-[11px] text-[#075E54] font-bold mt-1">
                      {new Date(ev.eventDate).toLocaleDateString('id-ID')} • {ev.startTime} WITA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum mendaftar di event manapun"
              description="Temukan agenda bedah buku, workshop literasi, dan kelas inspiratif di Sidrap."
              actionText="Lihat Agenda Event"
              onAction={() => (window.location.href = '/event')}
            />
          )}
        </div>
      )}

      {/* F. PESANAN BUKU / ORDER (SECTION 40) */}
      {activeTab === 'order' && (
        <div className="space-y-4">
          {userOrders && userOrders.length > 0 ? (
            <div className="space-y-3">
              {userOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white p-5 rounded-2xl border border-[#E2E8E5] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-[#075E54]">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-[#E8F3EF] text-[#075E54]">
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-[#17211D] font-semibold">
                      Toko: {ord.store?.name || 'Toko Buku Mitra'}
                    </p>
                    <p className="text-[11px] text-[#66736D]">
                      Tanggal: {new Date(ord.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-xs font-bold text-[#17211D]">
                      Total: Rp {Number(ord.totalAmount).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                        onClick={() => {
                          if (ord.whatsappUrl) {
                            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                            let finalUrl = ord.whatsappUrl;
                            if (!isMobile) {
                              finalUrl = finalUrl.replace('https://api.whatsapp.com/send', 'https://web.whatsapp.com/send');
                            }
                            window.open(finalUrl, '_blank');
                          }
                        }}
                      className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold gap-1.5 shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> Lanjut ke WhatsApp
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum Ada Pesanan Buku"
              description="Pesanan buku yang Anda buat di toko buku lokal Sidrap akan muncul di sini."
              actionText="Cari Buku Sekarang"
              onAction={() => (window.location.href = '/buku')}
            />
          )}
        </div>
      )}

      {/* G. GAMIFICATION LEADERBOARD (SECTION 26) */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#17211D] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Peringkat Pembaca Teraktif Sidrap
            </h3>
            <p className="text-xs text-[#66736D]">
              Semakin rajin membaca artikel dan berpartisipasi, semakin tinggi posisi Anda di ekosistem Sidrap
            </p>
          </div>

          <div className="divide-y divide-gray-100 pt-2">
            {leaderboard && leaderboard.length > 0 ? (
              leaderboard.map((u, idx) => {
                const isMe = u.id === user?.id;
                return (
                  <div
                    key={u.id || idx}
                    className={`py-3 flex items-center justify-between px-3 rounded-2xl transition-colors ${
                      isMe ? 'bg-[#E8F3EF] border border-[#cbe1d7]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 text-center font-extrabold text-sm ${
                        idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-gray-500' : idx === 2 ? 'text-amber-700' : 'text-gray-400'
                      }`}>
                        #{idx + 1}
                      </span>
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <h4 className="font-bold text-xs sm:text-sm text-[#17211D]">
                          {u.name} {isMe && <span className="text-[10px] text-[#075E54] font-bold">(Anda)</span>}
                        </h4>
                        <p className="text-[10px] text-[#66736D]">{u.level || 'Pembaca Aktif'} • Kec. {u.district || 'Sidrap'}</p>
                      </div>
                    </div>

                    <span className="font-extrabold text-xs text-[#075E54] bg-white px-2.5 py-1 rounded-xl border border-[#cbe1d7] shadow-2xs">
                      {u.points || 0} XP
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-[#66736D] py-4 text-center">Memuat data peringkat pembaca...</p>
            )}
          </div>
        </div>
      )}

      {/* H. NOTIFIKASI */}
      {activeTab === 'notifikasi' && (
        <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#17211D]">Pemberitahuan Sistem</h3>
          <div className="divide-y divide-gray-100">
            {userNotifs && userNotifs.length > 0 ? (
              userNotifs.map((n) => (
                <div key={n.id} className="py-3 flex items-start gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#E8F3EF] text-[#075E54] flex items-center justify-center shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#17211D]">{n.title}</h4>
                    <p className="text-[11px] text-[#66736D] mt-0.5">{n.message}</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('id-ID') : ''}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#66736D] py-4 text-center">Belum ada notifikasi.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
