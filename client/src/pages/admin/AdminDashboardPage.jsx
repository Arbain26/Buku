import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Users,
  Building2,
  BookOpen,
  Landmark,
  Store,
  Calendar,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  BarChart3,
  TrendingUp,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { adminService } from '../../services/dataServices';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const AdminDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview'; // overview, verifikasi, literasi-stats, users

  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [pendingMitra, setPendingMitra] = useState([]);
  const [literacyStats, setLiteracyStats] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [dashRes, pendingRes, statsRes, usersRes] = await Promise.all([
        adminService.getDashboard(),
        adminService.getPendingMitra(),
        adminService.getLiteracyStats(),
        adminService.getAllUsers(),
      ]);

      if (dashRes?.data) setDashboardData(dashRes.data);
      if (pendingRes?.data) setPendingMitra(pendingRes.data);
      if (statsRes?.data) setLiteracyStats(statsRes.data);
      if (usersRes?.data) setUsersList(usersRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyMitra = async (mitraId, status) => {
    try {
      const res = await adminService.verifyMitra(mitraId, status);
      showToast(res.message, 'success');
      fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengubah status verifikasi.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-1/3 h-10" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const { counts, growthData } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
            Panel Pengelola Platform
          </span>
          <h1 className="text-2xl font-bold text-[#17211D] mt-1.5">
            Admin Dashboard MABBACA
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            Monitoring kondisi ekosistem literasi masyarakat dan verifikasi mitra se-Kabupaten Sidrap.
          </p>
        </div>

        {counts?.pendingMitraCount > 0 && (
          <button
            onClick={() => setSearchParams({ tab: 'verifikasi' })}
            className="flex items-center gap-2 bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs hover:bg-amber-600 transition-colors animate-pulse"
          >
            <ShieldCheck className="w-4 h-4" />
            {counts.pendingMitraCount} Mitra Menunggu Verifikasi
          </button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Total Pengguna</span>
            <Users className="w-4 h-4 text-[#075E54]" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalUsers || 0}</p>
          <span className="text-[11px] text-gray-400">Masyarakat & Pembaca</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Total Mitra</span>
            <Building2 className="w-4 h-4 text-[#0F766E]" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalMitra || 0}</p>
          <span className="text-[11px] text-gray-400">Toko, Perpus & Komunitas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Katalog Buku</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalBooks || 0}</p>
          <span className="text-[11px] text-gray-400">Judul Terdaftar</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Perpustakaan</span>
            <Landmark className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalLibraries || 0}</p>
          <span className="text-[11px] text-gray-400">Titik Baca Daerah & Desa</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Toko Buku</span>
            <Store className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalStores || 0}</p>
          <span className="text-[11px] text-gray-400">Mitra Pedagang Buku</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Komunitas</span>
            <Users className="w-4 h-4 text-cyan-700" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalCommunities || 0}</p>
          <span className="text-[11px] text-gray-400">Lapak Baca & Penggerak</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Event Literasi</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalEvents || 0}</p>
          <span className="text-[11px] text-gray-400">Agenda Kegiatan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Baca 5 Menit</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalArticles || 0}</p>
          <span className="text-[11px] text-gray-400">Artikel Edukasi</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setSearchParams({ tab: 'overview' })}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            currentTab === 'overview'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Grafik Pertumbuhan
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'verifikasi' })}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            currentTab === 'verifikasi'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Verifikasi Mitra Pending ({pendingMitra.length})
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'literasi-stats' })}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            currentTab === 'literasi-stats'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Data Literasi Kecamatan Sidrap
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'users' })}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            currentTab === 'users'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users className="w-4 h-4" />
          Kelola Pengguna ({usersList.length})
        </button>
      </div>

      {/* Tab 1: Overview Chart */}
      {currentTab === 'overview' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#17211D]">
              Grafik Pertumbuhan & Partisipasi Literasi Sidrap (5 Bulan Terakhir)
            </h3>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pengguna" fill="#075E54" name="Pertumbuhan Warga" radius={[4, 4, 0, 0]} />
                <Bar dataKey="peminjaman" fill="#0F766E" name="Peminjaman Buku" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pemesanan" fill="#F59E0B" name="Pesanan Buku WA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="event" fill="#0284C7" name="Event Diikuti" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tab 2: Verifikasi Mitra Pending */}
      {currentTab === 'verifikasi' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">
                Daftar Mitra Menunggu Verifikasi
              </h3>
              <p className="text-xs text-gray-500">
                Mitra baru tidak langsung aktif sebelum disetujui oleh pengelola
              </p>
            </div>
          </div>

          {pendingMitra.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Nama Organisasi / Usaha</th>
                    <th className="p-3">Tipe Mitra</th>
                    <th className="p-3">Penanggung Jawab</th>
                    <th className="p-3">Kontak WhatsApp</th>
                    <th className="p-3">Wilayah Sidrap</th>
                    <th className="p-3">Tanggal Daftar</th>
                    <th className="p-3 text-right">Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pendingMitra.map((mitra) => (
                    <tr key={mitra.id} className="hover:bg-gray-50/60">
                      <td className="p-3">
                        <p className="font-bold text-[#17211D]">{mitra.organizationName}</p>
                        <p className="text-gray-400 text-[11px] truncate max-w-xs">{mitra.address}</p>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {mitra.mitraType}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-gray-700">{mitra.user?.name}</td>
                      <td className="p-3 text-[#075E54] font-medium">+{mitra.phoneWa}</td>
                      <td className="p-3 font-medium">Kec. {mitra.district}</td>
                      <td className="p-3 text-gray-500">
                        {new Date(mitra.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-3 text-right space-x-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleVerifyMitra(mitra.id, 'APPROVED')}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleVerifyMitra(mitra.id, 'REJECTED')}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Tolak
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="Semua mitra telah terverifikasi"
              description="Tidak ada permohonan pendaftaran mitra yang berstatus pending saat ini."
            />
          )}
        </div>
      )}

      {/* Tab 3: Data Literasi Kecamatan Sidrap */}
      {currentTab === 'literasi-stats' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-[#17211D]">
              Kondisi Ekosistem Literasi Berdasarkan Wilayah Kecamatan Sidrap
            </h3>
            <p className="text-xs text-gray-500">
              Pemetaan penyebaran perpustakaan, toko buku, komunitas, dan kegiatan literasi di 8 kecamatan utama
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={literacyStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="district" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="perpustakaan" fill="#0F766E" name="Perpustakaan" stackId="a" />
                <Bar dataKey="tokoBuku" fill="#075E54" name="Toko Buku" stackId="a" />
                <Bar dataKey="komunitas" fill="#10B981" name="Komunitas" stackId="a" />
                <Bar dataKey="event" fill="#F59E0B" name="Event" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table Details per District */}
          <div className="overflow-x-auto pt-4 border-t border-gray-100">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Kecamatan</th>
                  <th className="p-3 text-center">Perpustakaan</th>
                  <th className="p-3 text-center">Toko Buku</th>
                  <th className="p-3 text-center">Komunitas</th>
                  <th className="p-3 text-center">Event</th>
                  <th className="p-3 text-center font-bold text-[#075E54]">Total Titik Literasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {literacyStats.map((st) => (
                  <tr key={st.district} className="hover:bg-gray-50/60">
                    <td className="p-3 font-semibold text-[#17211D]">Kec. {st.district}</td>
                    <td className="p-3 text-center">{st.perpustakaan}</td>
                    <td className="p-3 text-center">{st.tokoBuku}</td>
                    <td className="p-3 text-center">{st.komunitas}</td>
                    <td className="p-3 text-center">{st.event}</td>
                    <td className="p-3 text-center font-bold text-[#075E54]">
                      {st.totalLiterasi}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Kelola Pengguna */}
      {currentTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#17211D]">
              Daftar Pengguna Platform MABBACA
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Pengguna</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Wilayah</th>
                  <th className="p-3">Level Gamifikasi</th>
                  <th className="p-3">Poin</th>
                  <th className="p-3">Tanggal Bergabung</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60">
                    <td className="p-3">
                      <p className="font-bold text-[#17211D]">{u.name}</p>
                      <p className="text-gray-400">{u.email}</p>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800'
                            : u.role === 'MITRA'
                            ? 'bg-teal-100 text-teal-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-medium">Kec. {u.district || 'Pangkajene'}</td>
                    <td className="p-3 text-emerald-800 font-semibold">{u.level}</td>
                    <td className="p-3 font-bold text-[#075E54]">{u.points} Pts</td>
                    <td className="p-3 text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
