import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Search,
  Filter,
  AlertTriangle,
  Phone,
  Clock,
  Eye,
  ChevronRight,
  Edit,
  Trash2,
  Save,
  Building,
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
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

const SIDRAP_DISTRICTS = [
  'Pangkajene',
  'Maritengngae',
  'Baranti',
  'Watang Pulu',
  'Tellu Limpoe',
  'Dua Pitue',
  'Panca Rijang',
  'Kulo',
  'Panca Lautang',
  'Watang Sidenreng',
  'Pitu Riase',
];

const MITRA_TYPES = [
  { value: 'TOKO_BUKU', label: 'Toko Buku' },
  { value: 'PERPUSTAKAAN', label: 'Perpustakaan Daerah/Desa' },
  { value: 'KOMUNITAS', label: 'Komunitas / Lapak Baca' },
];

const MITRA_STATUSES = [
  { value: 'APPROVED', label: 'Disetujui (Aktif)' },
  { value: 'PENDING', label: 'Menunggu Verifikasi' },
  { value: 'REJECTED', label: 'Ditolak' },
  { value: 'SUSPENDED', label: 'Ditangguhkan' },
];

export const AdminDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview'; // overview, verifikasi, literasi-stats, users, books, events

  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [pendingMitra, setPendingMitra] = useState([]);
  const [literacyStats, setLiteracyStats] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedMitraToReject, setSelectedMitraToReject] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Edit User & Mitra State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    district: 'Pangkajene',
    role: 'USER',
    isActive: true,
    level: 'Warga Gemar Membaca',
    points: 0,
    organizationName: '',
    mitraType: 'TOKO_BUKU',
    mitraStatus: 'APPROVED',
    phoneWa: '',
    address: '',
    openHours: '',
    description: '',
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [dashRes, pendingRes, statsRes, usersRes, booksRes, eventsRes] = await Promise.all([
        adminService.getDashboard().catch(() => null),
        adminService.getPendingMitra().catch(() => null),
        adminService.getLiteracyStats().catch(() => null),
        adminService.getAllUsers({ limit: 200 }).catch(() => null),
        adminService.getBooks().catch(() => null),
        adminService.getEvents().catch(() => null),
      ]);

      if (dashRes?.data) setDashboardData(dashRes.data);
      if (pendingRes?.data) setPendingMitra(pendingRes.data);
      if (statsRes?.data?.districtStats || statsRes?.data) {
        setLiteracyStats(statsRes.data.districtStats || statsRes.data);
      }
      if (usersRes?.data) setUsersList(usersRes.data);
      if (booksRes?.data) setBooksList(booksRes.data);
      if (eventsRes?.data) setEventsList(eventsRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleApproveMitra = async (mitraId) => {
    try {
      const res = await adminService.verifyMitra(mitraId, 'APPROVED');
      showToast(res.message || 'Mitra berhasil disetujui & diaktifkan!', 'success');
      fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyetujui mitra.', 'error');
    }
  };

  const handleOpenRejectModal = (mitra) => {
    setSelectedMitraToReject(mitra);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      showToast('Alasan penolakan wajib diisi untuk diinformasikan ke pendaftar.', 'error');
      return;
    }

    try {
      setIsSubmittingReject(true);
      const res = await adminService.verifyMitra(selectedMitraToReject.id, 'REJECTED', rejectionReason);
      showToast(res.message || 'Pendaftaran mitra telah ditolak.', 'info');
      setRejectModalOpen(false);
      fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menolak mitra.', 'error');
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const handleOpenEditUser = (u) => {
    setSelectedUserToEdit(u);
    setEditFormData({
      name: u.name || '',
      email: u.email || '',
      phone: u.phone || '',
      district: u.district || 'Pangkajene',
      role: u.role || 'USER',
      isActive: u.isActive !== undefined ? u.isActive : true,
      level: u.level || 'Warga Gemar Membaca',
      points: u.points !== undefined ? u.points : 0,
      organizationName: u.mitraProfile?.organizationName || '',
      mitraType: u.mitraProfile?.mitraType || 'TOKO_BUKU',
      mitraStatus: u.mitraProfile?.status || 'APPROVED',
      phoneWa: u.mitraProfile?.phoneWa || u.phone || '',
      address: u.mitraProfile?.address || '',
      openHours: u.mitraProfile?.openHours || '',
      description: u.mitraProfile?.description || '',
    });
    setEditModalOpen(true);
  };

  const handleOpenEditPendingMitra = (m) => {
    const pseudoUser = {
      id: m.userId || m.user?.id,
      name: m.user?.name || '',
      email: m.user?.email || '',
      phone: m.user?.phone || m.phoneWa || '',
      district: m.district || 'Pangkajene',
      role: 'MITRA',
      isActive: true,
      level: m.user?.level || 'Mitra Penggerak',
      points: m.user?.points || 0,
      mitraProfile: m,
    };
    handleOpenEditUser(pseudoUser);
  };

  const handleSaveEditUser = async (e) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;

    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      showToast('Nama dan email pengguna wajib diisi.', 'error');
      return;
    }

    if ((editFormData.role === 'MITRA' || selectedUserToEdit.mitraProfile) && !editFormData.organizationName.trim()) {
      showToast('Nama organisasi / usaha mitra wajib diisi.', 'error');
      return;
    }

    try {
      setIsSubmittingEdit(true);
      const res = await adminService.updateUser(selectedUserToEdit.id, editFormData);
      showToast(res.message || 'Data pengguna & mitra berhasil diperbarui!', 'success');
      setEditModalOpen(false);
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui data pengguna/mitra.', 'error');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleOpenDeleteUser = (u) => {
    setItemToDelete({
      type: 'USER',
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      mitraOrg: u.mitraProfile?.organizationName,
    });
    setDeleteModalOpen(true);
  };

  const handleOpenDeleteMitra = (m) => {
    setItemToDelete({
      type: 'MITRA',
      id: m.id,
      name: m.organizationName,
      email: m.user?.email,
      role: 'MITRA',
      mitraOrg: m.organizationName,
    });
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsSubmittingDelete(true);
      if (itemToDelete.type === 'USER') {
        const res = await adminService.deleteUser(itemToDelete.id);
        showToast(res.message || 'Akun pengguna dan data mitra berhasil dihapus.', 'success');
      } else {
        const res = await adminService.deleteMitra(itemToDelete.id);
        showToast(res.message || 'Data pendaftaran mitra berhasil dihapus.', 'success');
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus akun/mitra.', 'error');
    } finally {
      setIsSubmittingDelete(false);
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

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.district?.toLowerCase().includes(q) ||
      u.mitraProfile?.organizationName?.toLowerCase().includes(q) ||
      u.mitraProfile?.mitraType?.toLowerCase().includes(q);
    const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    return matchSearch && matchRole;
  });

  // Filtered books
  const filteredBooks = booksList.filter((b) =>
    b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs">
        <div>
          <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 uppercase">
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
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors animate-pulse"
          >
            <ShieldCheck className="w-4 h-4" />
            {counts.pendingMitraCount} Mitra Menunggu Verifikasi
          </button>
        )}
      </div>

      {/* 8 Overview KPI Cards */}
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
          <span className="text-[11px] text-gray-400">Lapak Baca & Gerakan</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span>Event Literasi</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalEvents || 0}</p>
          <span className="text-[11px] text-gray-400">Agenda Terdaftar</span>
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
          Verifikasi Mitra ({pendingMitra.length})
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
          Data Literasi Kecamatan
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

        <button
          onClick={() => setSearchParams({ tab: 'books' })}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            currentTab === 'books'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Katalog Buku ({booksList.length})
        </button>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: OVERVIEW CHART */}
      {/* ===================================================================== */}
      {currentTab === 'overview' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">
                Grafik Pertumbuhan & Partisipasi Literasi Sidrap
              </h3>
              <p className="text-xs text-gray-500">
                Aktivitas peminjaman, pengguna baru, pesanan buku, dan event bulanan
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                <YAxis stroke="#9CA3AF" fontSize={11} />
                <Tooltip />
                <Legend />
                <Bar dataKey="pengguna" fill="#075E54" name="Warga Terdaftar" radius={[4, 4, 0, 0]} />
                <Bar dataKey="peminjaman" fill="#0F766E" name="Peminjaman Buku" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pemesanan" fill="#F59E0B" name="Pesanan Toko WA" radius={[4, 4, 0, 0]} />
                <Bar dataKey="event" fill="#0284C7" name="Event Diikuti" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: VERIFIKASI MITRA PENDING */}
      {/* ===================================================================== */}
      {currentTab === 'verifikasi' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">
                Daftar Permohonan Mitra Menunggu Verifikasi
              </h3>
              <p className="text-xs text-gray-500">
                Setujui mitra resmi atau tolak dengan menyertakan alasan transparan
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
                    <th className="p-3 text-right">Aksi Verifikasi</th>
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
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleApproveMitra(mitra.id)}
                          title="Setujui Kemitraan"
                          className="px-2.5 py-1 text-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Setujui
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleOpenRejectModal(mitra)}
                          title="Tolak Kemitraan"
                          className="px-2.5 py-1 text-xs"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" /> Tolak
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditPendingMitra(mitra)}
                          title="Edit Data Mitra"
                          className="px-2 py-1 text-xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleOpenDeleteMitra(mitra)}
                          title="Hapus Pendaftaran Mitra"
                          className="px-2 py-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ===================================================================== */}
      {/* TAB 3: DATA LITERASI KECAMATAN SIDRAP */}
      {/* ===================================================================== */}
      {currentTab === 'literasi-stats' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-base text-[#17211D]">
              Kondisi Ekosistem Literasi Berdasarkan Wilayah Kecamatan Sidrap
            </h3>
            <p className="text-xs text-gray-500">
              Pemetaan sebaran perpustakaan, toko buku, komunitas, dan event di 8 kecamatan utama
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

          {/* Table Details */}
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

      {/* ===================================================================== */}
      {/* TAB 4: KELOLA PENGGUNA */}
      {/* ===================================================================== */}
      {currentTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Daftar Pengguna Platform MABBACA</h3>
              <p className="text-xs text-gray-500">Masyarakat, mitra pengelola, dan akun administrator</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari nama / email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 p-2 rounded-xl border border-gray-200 text-xs"
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="p-2 rounded-xl border border-gray-200 text-xs"
              >
                <option value="ALL">Semua Peran</option>
                <option value="USER">USER</option>
                <option value="MITRA">MITRA</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Pengguna & Lembaga</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Wilayah Sidrap</th>
                  <th className="p-3">Poin & Level</th>
                  <th className="p-3">Bergabung</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => {
                  const isMitra = u.role === 'MITRA' || !!u.mitraProfile;
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-[#17211D]">{u.name}</p>
                          <p className="text-gray-400 text-[11px]">{u.email}</p>
                          {u.phone && <p className="text-gray-400 text-[10px]">📞 {u.phone}</p>}
                          {isMitra && u.mitraProfile && (
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex items-center gap-1 font-semibold text-[10px] px-2 py-0.5 rounded-md bg-teal-50 text-[#0F766E] border border-teal-200">
                                <Building2 className="w-3 h-3" />
                                {u.mitraProfile.organizationName}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                                {u.mitraProfile.mitraType}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                  u.mitraProfile.status === 'APPROVED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : u.mitraProfile.status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {u.mitraProfile.status}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
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
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            u.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.isActive !== false ? 'Aktif' : 'Nonaktif'}
                        </span>
                      </td>
                      <td className="p-3 font-medium">Kec. {u.district || 'Pangkajene'}</td>
                      <td className="p-3">
                        <span className="text-emerald-800 font-semibold block">{u.level}</span>
                        <span className="font-bold text-[#075E54] text-[11px]">{u.points} Pts</span>
                      </td>
                      <td className="p-3 text-gray-500 whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditUser(u)}
                          title="Edit Pengguna / Mitra"
                          className="px-2.5 py-1 text-xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleOpenDeleteUser(u)}
                          title="Hapus Pengguna / Mitra"
                          className="px-2.5 py-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: KATALOG BUKU */}
      {/* ===================================================================== */}
      {currentTab === 'books' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Master Data Katalog Buku</h3>
              <p className="text-xs text-gray-500">Semua judul buku yang terdaftar di sistem MABBACA</p>
            </div>
            <input
              type="text"
              placeholder="Cari judul / penulis..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 p-2 rounded-xl border border-gray-200 text-xs"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Cover</th>
                  <th className="p-3">Judul Buku</th>
                  <th className="p-3">Penulis</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/60">
                    <td className="p-3">
                      <ImageWithFallback
                        src={b.coverImage}
                        alt={b.title}
                        className="w-8 h-11 object-cover rounded-md"
                      />
                    </td>
                    <td className="p-3 font-bold text-[#17211D]">{b.title}</td>
                    <td className="p-3 text-gray-600">{b.author}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px]">
                        {b.category?.name || 'Umum'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-amber-600">★ {b.rating || '5.0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* REJECTION REASON MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Tolak Pendaftaran Mitra"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-red-800 space-y-1">
            <p className="font-bold text-sm">
              Menolak Mitra: {selectedMitraToReject?.organizationName}
            </p>
            <p className="text-xs">
              Alasan penolakan akan disimpan ke profil mitra dan ditampilkan pada dashboard pendaftar agar mereka memahami kendala verifikasi.
            </p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Alasan Penolakan (Wajib Diisi) *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Contoh: Nomor kontak WhatsApp tidak dapat dihubungi atau alamat fisik di Kabupaten Sidrap belum valid..."
              required
              className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isSubmittingReject}
            >
              Konfirmasi Tolak
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* EDIT USER & MITRA MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={
          selectedUserToEdit?.mitraProfile || editFormData.role === 'MITRA'
            ? 'Edit Data Pengguna & Mitra'
            : 'Edit Data Pengguna'
        }
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSaveEditUser} className="space-y-4 text-xs max-h-[78vh] overflow-y-auto pr-1">
          {/* Section 1: Profil Akun Pengguna */}
          <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#075E54]" />
              Informasi Akun Pengguna
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                  placeholder="Nama lengkap pengguna"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Email Pengguna *</label>
                <input
                  type="email"
                  required
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Nomor Telepon</label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Kecamatan Sidrap</label>
                <select
                  value={editFormData.district}
                  onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                >
                  {SIDRAP_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      Kecamatan {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Role Akun</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                >
                  <option value="USER">USER (Masyarakat / Pembaca)</option>
                  <option value="MITRA">MITRA (Pengelola Usaha/Lembaga)</option>
                  <option value="ADMIN">ADMIN (Administrator)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Status Keaktifan Akun</label>
                <select
                  value={editFormData.isActive ? 'true' : 'false'}
                  onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === 'true' })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                >
                  <option value="true">Aktif (Dapat Login & Beraktivitas)</option>
                  <option value="false">Nonaktif / Dibekukan</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Level Gamifikasi</label>
                <input
                  type="text"
                  value={editFormData.level}
                  onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                  placeholder="Contoh: Warga Gemar Membaca"
                />
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Poin Literasi</label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.points}
                  onChange={(e) => setEditFormData({ ...editFormData, points: parseInt(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Profil Kemitraan (Shown if role === 'MITRA' or mitraProfile exists) */}
          {(editFormData.role === 'MITRA' || selectedUserToEdit?.mitraProfile) && (
            <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200 space-y-3">
              <h4 className="font-bold text-teal-900 text-sm flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#0F766E]" />
                Informasi Profil Mitra Resmi MABBACA
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-medium text-teal-900 mb-1">
                    Nama Usaha / Perpustakaan / Komunitas *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.organizationName}
                    onChange={(e) => setEditFormData({ ...editFormData, organizationName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-1 focus:ring-[#0F766E]"
                    placeholder="Contoh: Toko Buku Berkah Sidrap"
                  />
                </div>

                <div>
                  <label className="block font-medium text-teal-900 mb-1">Jenis Mitra (3 Kategori Resmi)</label>
                  <select
                    value={editFormData.mitraType}
                    onChange={(e) => setEditFormData({ ...editFormData, mitraType: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-1 focus:ring-[#0F766E]"
                  >
                    {MITRA_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-teal-900 mb-1">Status Kemitraan</label>
                  <select
                    value={editFormData.mitraStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, mitraStatus: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-1 focus:ring-[#0F766E]"
                  >
                    {MITRA_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-teal-900 mb-1">Nomor WhatsApp Mitra</label>
                  <input
                    type="text"
                    value={editFormData.phoneWa}
                    onChange={(e) => setEditFormData({ ...editFormData, phoneWa: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-1 focus:ring-[#0F766E]"
                    placeholder="628xxxxxxxxxx"
                  />
                </div>

                <div>
                  <label className="block font-medium text-teal-900 mb-1">Jam Operasional</label>
                  <input
                    type="text"
                    value={editFormData.openHours}
                    onChange={(e) => setEditFormData({ ...editFormData, openHours: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-1 focus:ring-[#0F766E]"
                    placeholder="Contoh: 08:00 - 17:00 WITA"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-teal-900 mb-1">Alamat Fisik di Sidrap</label>
                  <textarea
                    rows={2}
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-1 focus:ring-[#0F766E]"
                    placeholder="Jl. ..., Kel/Desa ..., Kec. ..., Kab. Sidrap"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-medium text-teal-900 mb-1">Deskripsi Profil Kemitraan</label>
                  <textarea
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-teal-200 bg-white text-xs focus:ring-1 focus:ring-[#0F766E]"
                    placeholder="Koleksi buku, fasilitas, atau layanan kemitraan..."
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setEditModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingEdit}
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Konfirmasi Hapus Data"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-red-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              Peringatan Tindakan Penghapusan
            </div>
            <p>
              Apakah Anda yakin ingin menghapus {itemToDelete?.type === 'USER' ? 'akun pengguna' : 'pendaftaran mitra'}{' '}
              <strong className="underline font-bold">{itemToDelete?.name}</strong>
              {itemToDelete?.email ? ` (${itemToDelete?.email})` : ''}?
            </p>
            {itemToDelete?.mitraOrg && (
              <p className="text-[11px] bg-red-100/70 p-2 rounded-lg text-red-900 font-medium">
                ⚠️ Akun ini terhubung dengan mitra: <strong>{itemToDelete.mitraOrg}</strong>.
                Seluruh data toko/perpustakaan/komunitas yang terafiliasi juga akan dinonaktifkan.
              </p>
            )}
            <p className="text-[11px] text-red-700">
              Data yang dihapus akan dinonaktifkan dari sistem dan tidak dapat login ke aplikasi MABBACA.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isSubmittingDelete}
              onClick={handleConfirmDelete}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Ya, Hapus Sekarang
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
