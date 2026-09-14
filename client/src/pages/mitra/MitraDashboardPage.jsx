import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
  Eye,
  ShoppingBag,
  Calendar,
  Plus,
  TrendingUp,
  BookOpen,
  Landmark,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Edit,
  Sparkles,
  MessageCircle,
  ArrowRight,
  ExternalLink,
  Store,
  GraduationCap,
  Layers,
  Search,
  Check,
  BarChart3,
  Building2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { mitraService, bookService } from '../../services/dataServices';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

export const MitraDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const { user } = useAuth();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Search & filter within tabs
  const [searchInventory, setSearchInventory] = useState('');

  // Add Book/Inventory Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inventoryForm, setInventoryForm] = useState({
    title: '',
    author: '',
    categoryId: '1',
    publisher: '',
    isbn: '',
    price: '95000',
    stock: '10',
    callNumber: '',
    totalStock: '5',
    locationShelf: 'Rak Utama',
    description: '',
  });

  // Edit Book/Inventory Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    title: '',
    author: '',
    categoryId: '1',
    price: '',
    stock: '',
    callNumber: '',
    totalStock: '',
    locationShelf: '',
    description: '',
  });

  const mitraType = user?.mitraProfile?.mitraType || dashboardData?.profile?.mitraType || 'TOKO_BUKU';
  const mitraStatus = dashboardData?.profile?.status || user?.mitraProfile?.status || 'APPROVED';

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    organizationName: '',
    description: '',
    address: '',
    district: 'Pangkajene',
    village: '',
    phoneWa: '',
    openHours: '08.00 - 17.00 WITA',
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const districtsList = [
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

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await mitraService.getDashboard();
      if (res?.data) {
        setDashboardData(res.data);
        const p = res.data.profile;
        if (p) {
          setProfileForm({
            organizationName: p.organizationName || '',
            description: p.description || '',
            address: p.address || '',
            district: p.district || 'Pangkajene',
            village: p.village || '',
            phoneWa: p.phoneWa || '',
            openHours: p.openHours || '08.00 - 17.00 WITA',
          });
        }
      }
    } catch (err) {
      console.error('Failed to load mitra dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.organizationName || !profileForm.address) {
      showToast('Nama organisasi dan alamat lengkap wajib diisi.', 'error');
      return;
    }
    try {
      setIsUpdatingProfile(true);
      const res = await mitraService.updateProfile(profileForm);
      showToast(res?.message || 'Profil berhasil diperbarui!', 'success');
      await fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui profil.', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    bookService.getCategories().then((res) => {
      if (res?.data) setCategories(res.data);
    });
  }, []);

  const handleFormChange = (e) => {
    setInventoryForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!inventoryForm.title || !inventoryForm.author) {
      showToast('Judul dan penulis buku wajib diisi.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await mitraService.addInventory(inventoryForm);
      showToast(res.message || 'Item berhasil ditambahkan ke inventaris!', 'success');
      setIsAddModalOpen(false);
      setInventoryForm({
        title: '',
        author: '',
        categoryId: '1',
        publisher: '',
        isbn: '',
        price: '95000',
        stock: '10',
        callNumber: '',
        totalStock: '5',
        locationShelf: 'Rak Utama',
        description: '',
      });
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menambahkan buku.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (item) => {
    setEditForm({
      id: item.id,
      title: item.title || '',
      author: item.author || '',
      categoryId: item.categoryId ? String(item.categoryId) : '1',
      price: item.price !== undefined ? String(item.price) : '',
      stock: item.stock !== undefined ? String(item.stock) : '',
      callNumber: item.callNumber || '',
      totalStock: item.totalStock !== undefined ? String(item.totalStock) : '',
      locationShelf: item.locationShelf || '',
      description: item.description || '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.author) {
      showToast('Judul dan penulis buku wajib diisi.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await mitraService.updateInventory(editForm.id, editForm);
      showToast(res.message || 'Keterangan dan data buku berhasil diperbarui!', 'success');
      setIsEditModalOpen(false);
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui buku.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus buku ini dari daftar?')) return;
    try {
      const res = await mitraService.deleteInventory(id);
      showToast(res.message || 'Item berhasil dihapus.', 'success');
      fetchDashboard();
    } catch {
      showToast('Gagal menghapus item.', 'error');
    }
  };

  const handleUpdateBorrowStatus = async (borrowingId, newStatus) => {
    try {
      const res = await mitraService.updateBorrowingStatus(borrowingId, newStatus);
      showToast(res.message || 'Status peminjaman berhasil diperbarui.', 'success');
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui status.', 'error');
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
        <Skeleton className="w-full h-80 rounded-2xl" />
      </div>
    );
  }

  // =========================================================================
  // 1. PENDING VERIFICATION SCREEN (Prompt 3, Section 29)
  // =========================================================================
  if (mitraStatus === 'PENDING') {
    const profile = dashboardData?.profile || user?.mitraProfile;
    const regDate = profile?.createdAt
      ? new Date(profile.createdAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'Hari ini';

    return (
      <div className="max-w-4xl mx-auto space-y-8 py-4">
        {/* Verification Status Card */}
        <div className="bg-white rounded-3xl border border-amber-200/80 p-6 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
          </div>

          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Status: Menunggu Verifikasi
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211D]">
              Akun Mitra Anda Sedang Diverifikasi
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
              Tim MABBACA sedang meninjau informasi organisasi Anda untuk menjaga keaslian dan keamanan ekosistem literasi Sidrap. Proses ini biasanya membutuhkan waktu <strong>1x24 jam kerja</strong>.
            </p>
          </div>

          {/* Registration Details Summary */}
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 text-left grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-gray-400 font-medium">Nama Organisasi / Usaha:</span>
              <p className="font-bold text-[#17211D] text-sm mt-0.5">
                {profile?.organizationName || user?.name}
              </p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Jenis Kemitraan:</span>
              <p className="font-bold text-emerald-800 text-sm mt-0.5">
                {mitraType === 'TOKO_BUKU'
                  ? 'Toko Buku Fisik'
                  : mitraType === 'PERPUSTAKAAN'
                  ? 'Perpustakaan Daerah / Desa'
                  : mitraType === 'KOMUNITAS'
                  ? 'Komunitas / Lapak Baca'
                  : mitraType === 'SEKOLAH'
                  ? 'Sekolah'
                  : 'Pengajar'}
              </p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Kecamatan / Wilayah:</span>
              <p className="font-semibold text-gray-700 mt-0.5">
                Kec. {profile?.district || 'Sidrap'}
              </p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Nomor Kontak WhatsApp:</span>
              <p className="font-semibold text-gray-700 mt-0.5">
                +{profile?.phoneWa || user?.phone || '-'}
              </p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Tanggal Pendaftaran:</span>
              <p className="font-semibold text-gray-700 mt-0.5">{regDate}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Email Terdaftar:</span>
              <p className="font-semibold text-gray-700 mt-0.5">{user?.email}</p>
            </div>
          </div>

          {/* 3-Step Verification Timeline */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-6 text-center">
              Tahapan Proses Verifikasi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              {/* Step 1 */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-emerald-950">1. Pendaftaran Diterima</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    Data organisasi Anda telah tersimpan dengan aman di server MABBACA.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-amber-950">2. Validasi Data & Lokasi</h4>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    Pengelola memverifikasi nomor kontak WhatsApp dan alamat di Kab. Sidrap.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex gap-3 items-start opacity-70">
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-700">3. Akun Aktif & Katalog Tayang</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                    Akses kontrol penuh, input koleksi buku, dan tayang ke publik masyarakat.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Support CTA */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
            <div className="text-left">
              <h4 className="font-bold text-xs text-[#075E54]">Butuh Konfirmasi Cepat?</h4>
              <p className="text-[11px] text-gray-600">
                Hubungi staf sekretariat literasi MABBACA melalui WhatsApp resmi.
              </p>
            </div>
            <a
              href={`https://wa.me/6285255667788?text=${encodeURIComponent(
                `Halo Admin MABBACA, saya ingin menanyakan progres verifikasi akun mitra saya: ${profile?.organizationName || user?.name} (${user?.email}). Terima kasih!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#075E54] hover:bg-[#05473F] text-white text-xs font-bold transition-all shadow-sm shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
              Hubungi Admin via WhatsApp
            </a>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. REJECTED SCREEN
  // =========================================================================
  if (mitraStatus === 'REJECTED') {
    const profile = dashboardData?.profile || user?.mitraProfile;
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="bg-white rounded-3xl border border-red-200 p-8 text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              Pendaftaran Tidak Dapat Disetujui
            </span>
            <h2 className="text-2xl font-bold text-[#17211D] mt-1">
              Permohonan Kemitraan Ditolak
            </h2>
            <p className="text-xs text-gray-500 mt-2">
              Mohon maaf, permohonan kemitraan untuk <strong>{profile?.organizationName}</strong> belum memenuhi kriteria verifikasi.
            </p>
          </div>

          {profile?.rejectionReason && (
            <div className="bg-red-50 rounded-2xl p-4 border border-red-100 text-left">
              <span className="text-xs font-bold text-red-800 block mb-1">Alasan Penolakan:</span>
              <p className="text-xs text-red-700 leading-relaxed">{profile.rejectionReason}</p>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://wa.me/6285255667788"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#075E54] text-white text-xs font-bold hover:bg-[#05473F] transition-colors inline-flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Hubungi Dukungan Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. APPROVED MITRA DASHBOARD (DYNAMIC BY ROLE)
  // =========================================================================
  const {
    metrics,
    chartData,
    topSellingBooks,
    recentActivities,
    products,
    collections,
    borrowings,
    orders,
    members,
    events,
    reviews,
    articles,
  } = dashboardData || {};

  // Role labels
  const roleTitle =
    mitraType === 'TOKO_BUKU'
      ? 'Toko Buku'
      : mitraType === 'PERPUSTAKAAN'
      ? 'Perpustakaan'
      : mitraType === 'KOMUNITAS'
      ? 'Komunitas Literasi'
      : mitraType === 'SEKOLAH'
      ? 'Sekolah'
      : 'Pengajar';

  // Define tabs based on role
  const getTabs = () => {
    switch (mitraType) {
      case 'TOKO_BUKU':
        return [
          { id: 'dashboard', label: 'Ringkasan', icon: TrendingUp },
          { id: 'products', label: `Produk Toko (${products?.length || 0})`, icon: Package },
          { id: 'orders', label: `Pesanan Masuk (${orders?.length || 0})`, icon: ShoppingBag },
          { id: 'profile', label: 'Profil Toko', icon: Building2 },
          { id: 'stats', label: 'Statistik', icon: BarChart3 },
        ];
      case 'PERPUSTAKAAN':
        return [
          { id: 'dashboard', label: 'Ringkasan', icon: TrendingUp },
          { id: 'collections', label: `Koleksi Buku (${collections?.length || 0})`, icon: BookOpen },
          { id: 'borrowings', label: `Peminjaman Masuk (${borrowings?.length || 0})`, icon: ShoppingBag },
          { id: 'profile', label: 'Profil Perpustakaan', icon: Building2 },
          { id: 'stats', label: 'Statistik', icon: BarChart3 },
        ];
      case 'KOMUNITAS':
        return [
          { id: 'dashboard', label: 'Ringkasan', icon: TrendingUp },
          { id: 'members', label: `Anggota (${members?.length || 0})`, icon: Users },
          { id: 'events', label: `Agenda Kegiatan (${events?.length || 0})`, icon: Calendar },
          { id: 'profile', label: 'Profil Komunitas', icon: Building2 },
          { id: 'stats', label: 'Statistik', icon: BarChart3 },
        ];
      case 'SEKOLAH':
        return [
          { id: 'dashboard', label: 'Ringkasan', icon: TrendingUp },
          { id: 'events', label: `Kegiatan Literasi (${events?.length || 0})`, icon: BookOpen },
          { id: 'profile', label: 'Profil Sekolah', icon: Building2 },
          { id: 'stats', label: 'Statistik', icon: BarChart3 },
        ];
      case 'PENGAJAR':
        return [
          { id: 'dashboard', label: 'Ringkasan', icon: TrendingUp },
          { id: 'events', label: `Workshop / Kelas (${events?.length || 0})`, icon: Calendar },
          { id: 'profile', label: 'Profil Pengajar', icon: GraduationCap },
          { id: 'stats', label: 'Statistik', icon: BarChart3 },
        ];
      default:
        return [
          { id: 'dashboard', label: 'Ringkasan', icon: TrendingUp },
          { id: 'profile', label: 'Profil Mitra', icon: Building2 },
          { id: 'stats', label: 'Statistik', icon: BarChart3 },
        ];
    }
  };

  const tabs = getTabs();

  // Filtered inventory list
  const filteredProducts = products?.filter((p) =>
    p.title?.toLowerCase().includes(searchInventory.toLowerCase()) ||
    p.author?.toLowerCase().includes(searchInventory.toLowerCase())
  );

  const filteredCollections = collections?.filter((c) =>
    c.title?.toLowerCase().includes(searchInventory.toLowerCase()) ||
    c.author?.toLowerCase().includes(searchInventory.toLowerCase()) ||
    c.callNumber?.toLowerCase().includes(searchInventory.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#075E54] border border-emerald-200">
              Mitra {roleTitle}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              • Terverifikasi MABBACA
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17211D]">
            Selamat datang, {user?.mitraProfile?.organizationName || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Kelola inventaris dan partisipasi masyarakat dalam memajukan literasi di Sidrap.
          </p>
        </div>

        {(mitraType === 'TOKO_BUKU' || mitraType === 'PERPUSTAKAAN') && (
          <Button
            size="md"
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="shrink-0"
          >
            <Plus className="w-4 h-4" />
            {mitraType === 'TOKO_BUKU' ? 'Tambah Produk Buku' : 'Tambah Koleksi'}
          </Button>
        )}
      </div>

      {/* Dynamic Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-2 ${
                isActive
                  ? 'border-[#075E54] text-[#075E54]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* TAB: DASHBOARD OVERVIEW */}
      {/* ===================================================================== */}
      {currentTab === 'dashboard' && (
        <div className="space-y-8">
          {/* 4 Metrics Cards Customized by Role */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {mitraType === 'TOKO_BUKU' && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Total Produk</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalProducts || 0}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> Stok: {metrics?.totalStock || 0} pcs
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Pesanan Masuk</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalOrders || 0}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> Transaksi via WA
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Estimasi Omset</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-[#17211D]">
                    Rp {(metrics?.totalRevenue || 0).toLocaleString('id-ID')}
                  </p>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                    Pesanan Selesai
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Event Diadakan</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalEvents || 0}</p>
                  <span className="text-[11px] font-semibold text-gray-400 mt-1 block">
                    Bedah buku & lapak
                  </span>
                </div>
              </>
            )}

            {mitraType === 'PERPUSTAKAAN' && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Judul Koleksi</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalTitles || 0}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                    Katalog Perpustakaan
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Total Buku Fisik</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalBooks || 0}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                    {metrics?.totalAvailable || 0} eks siap pinjam
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Peminjaman Aktif</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.activeBorrowings || 0}</p>
                  <span className="text-[11px] font-semibold text-gray-400 mt-1 block">
                    Total riwayat: {metrics?.totalBorrowings || 0}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Event Literasi</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalEvents || 0}</p>
                  <span className="text-[11px] font-semibold text-gray-400 mt-1 block">
                    Kegiatan membaca
                  </span>
                </div>
              </>
            )}

            {mitraType === 'KOMUNITAS' && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Total Anggota</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalMembers || 0}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                    Relawan & Pembaca
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Event & Lapak</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalEvents || 0}</p>
                  <span className="text-[11px] font-semibold text-gray-400 mt-1 block">
                    Diskusi dan lapak baca
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Total Partisipan</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalParticipants || 0}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                    Warga terlibat
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Ulasan Publik</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalReviews || 0}</p>
                  <span className="text-[11px] font-semibold text-gray-400 mt-1 block">
                    Apresiasi komunitas
                  </span>
                </div>
              </>
            )}

            {(mitraType === 'SEKOLAH' || mitraType === 'PENGAJAR') && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Program Literasi</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalEvents || 0}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
                    Kegiatan siswa
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Total Partisipan</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalParticipants || 0}</p>
                  <span className="text-[11px] font-semibold text-gray-400 mt-1 block">
                    Pelajar & Pengajar
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Artikel Edukasi</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalArticles || 0}</p>
                  <span className="text-[11px] font-semibold text-gray-400 mt-1 block">
                    {metrics?.totalViews || 0} pembaca
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Status Kemitraan</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-base font-bold text-emerald-800">Aktif</p>
                  <span className="text-[11px] font-semibold text-gray-400 mt-1 block">
                    Dinas Pendidikan Sidrap
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Activity Chart & Best Sellers / Top Collections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 8 cols: Area Chart */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#17211D]">Grafik Aktivitas Mingguan</h3>
                  <p className="text-xs text-gray-500">Tren interaksi pembaca terhadap profil & katalog Anda</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#075E54]" /> Dilihat
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                    {mitraType === 'TOKO_BUKU' ? 'Pesanan' : 'Peminjaman'}
                  </span>
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={
                      chartData || [
                        { name: 'Sen', dilihat: 45, pesanan: 12 },
                        { name: 'Sel', dilihat: 52, pesanan: 18 },
                        { name: 'Rab', dilihat: 60, pesanan: 15 },
                        { name: 'Kam', dilihat: 75, pesanan: 22 },
                        { name: 'Jum', dilihat: 90, pesanan: 28 },
                        { name: 'Sab', dilihat: 120, pesanan: 35 },
                        { name: 'Min', dilihat: 110, pesanan: 30 },
                      ]
                    }
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorDilihat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#075E54" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#075E54" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPesanan" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                    <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="dilihat"
                      stroke="#075E54"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorDilihat)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pesanan"
                      stroke="#F59E0B"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorPesanan)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right 4 cols: Top Selling / Highlights */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
              <h3 className="font-bold text-base text-[#17211D]">
                {mitraType === 'TOKO_BUKU' ? 'Produk Terlaris' : 'Koleksi Populer'}
              </h3>
              <div className="space-y-3">
                {topSellingBooks && topSellingBooks.length > 0 ? (
                  topSellingBooks.map((book, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ImageWithFallback
                          src={book.coverImage}
                          alt={book.title}
                          className="w-8 h-10 rounded-md object-cover bg-gray-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-[#17211D] truncate">{book.title}</p>
                          <span className="text-[11px] text-gray-400">{book.sold} terjual</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic py-4">Belum ada data penjualan tercatat.</p>
                )}
              </div>

              {/* Quick Tip Box */}
              <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Tips Mitra Sidrap
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Lengkapi nomor panggil dan sinopsis buku agar mudah ditemukan pencarian katalog MABBACA.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: PRODUCTS (TOKO BUKU) */}
      {/* ===================================================================== */}
      {currentTab === 'products' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Daftar Inventaris Produk Toko</h3>
              <p className="text-xs text-gray-500">
                Katalog buku yang dapat dipesan oleh masyarakat melalui WhatsApp
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari judul atau penulis..."
                  value={searchInventory}
                  onChange={(e) => setSearchInventory(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                />
              </div>
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Tambah
              </Button>
            </div>
          </div>

          {filteredProducts && filteredProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Cover</th>
                    <th className="p-3">Judul & Penulis</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Stok</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="p-3">
                        <ImageWithFallback
                          src={item.coverImage}
                          alt={item.title}
                          className="w-9 h-12 object-cover rounded-md"
                        />
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-[#17211D]">{item.title}</p>
                        <p className="text-gray-400 text-[11px]">{item.author}</p>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px]">
                          {item.category || 'Umum'}
                        </span>
                      </td>
                      <td className="p-3 font-semibold text-[#075E54]">
                        Rp {item.price?.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3">
                        <span
                          className={`font-semibold ${
                            item.stock > 0 ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {item.stock} pcs
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Data"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Belum ada produk di inventaris"
              description="Tambahkan buku pertama Anda untuk mulai menerima pesanan dari masyarakat Sidrap."
              actionText="Tambah Buku Sekarang"
              onAction={() => setIsAddModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: COLLECTIONS (PERPUSTAKAAN) */}
      {/* ===================================================================== */}
      {currentTab === 'collections' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Daftar Koleksi Perpustakaan</h3>
              <p className="text-xs text-gray-500">
                Koleksi buku terdaftar untuk layanan baca di tempat dan peminjaman online
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari judul, no. panggil..."
                  value={searchInventory}
                  onChange={(e) => setSearchInventory(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                />
              </div>
              <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
                <Plus className="w-3.5 h-3.5" /> Tambah
              </Button>
            </div>
          </div>

          {filteredCollections && filteredCollections.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Cover</th>
                    <th className="p-3">Judul & Penulis</th>
                    <th className="p-3">No. Panggil</th>
                    <th className="p-3">Lokasi Rak</th>
                    <th className="p-3">Stok Siap Pinjam</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCollections.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/60">
                      <td className="p-3">
                        <ImageWithFallback
                          src={item.coverImage}
                          alt={item.title}
                          className="w-9 h-12 object-cover rounded-md"
                        />
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-[#17211D]">{item.title}</p>
                        <p className="text-gray-400 text-[11px]">{item.author}</p>
                      </td>
                      <td className="p-3 font-mono font-medium text-gray-700">
                        {item.callNumber || '-'}
                      </td>
                      <td className="p-3 text-gray-600">{item.locationShelf || 'Rak Umum'}</td>
                      <td className="p-3">
                        <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.availableStock} / {item.totalStock} eks
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Edit Data"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Belum ada koleksi buku"
              description="Daftarkan koleksi buku perpustakaan untuk memudahkan pencarian masyarakat."
              actionText="Tambah Koleksi Sekarang"
              onAction={() => setIsAddModalOpen(true)}
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: ORDERS (TOKO BUKU - WHATSAPP ORDERS) */}
      {/* ===================================================================== */}
      {currentTab === 'orders' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Pesanan Masuk via WhatsApp</h3>
              <p className="text-xs text-gray-500">
                Daftar transaksi pemesanan buku langsung dari masyarakat Sidrap
              </p>
            </div>
          </div>

          {orders && orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">No. Pesanan</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Kontak WA</th>
                    <th className="p-3">Total Tagihan</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/60">
                      <td className="p-3 font-mono font-bold text-[#075E54]">
                        #{ord.orderNumber}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-[#17211D]">{ord.customerName}</p>
                        <p className="text-gray-400 text-[11px] truncate max-w-xs">
                          {ord.customerAddress || 'Ambil di Toko'}
                        </p>
                      </td>
                      <td className="p-3 font-medium text-emerald-800">+{ord.customerPhone}</td>
                      <td className="p-3 font-bold text-[#17211D]">
                        Rp {Number(ord.totalAmount).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-gray-500">
                        {new Date(ord.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                            ord.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-800'
                              : ord.status === 'CONTACTED'
                              ? 'bg-blue-50 text-blue-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <a
                          href={`https://wa.me/${ord.customerPhone?.replace(/^0/, '62')}?text=${encodeURIComponent(
                            `Halo Kak ${ord.customerName}, kami dari Toko Buku MABBACA ingin mengonfirmasi pesanan #${ord.orderNumber}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#075E54] font-semibold text-xs transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Chat WA
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Belum ada pesanan masuk"
              description="Ketika pembeli mengklik pesan via WhatsApp di MABBACA, riwayat pesanan akan otomatis tercatat di sini."
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: BORROWINGS (PERPUSTAKAAN) */}
      {/* ===================================================================== */}
      {currentTab === 'borrowings' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Permohonan Peminjaman Buku</h3>
              <p className="text-xs text-gray-500">
                Pengelolaan persetujuan dan pengembalian buku pemustaka
              </p>
            </div>
          </div>

          {borrowings && borrowings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Pemustaka</th>
                    <th className="p-3">Buku Dipinjam</th>
                    <th className="p-3">Batas Kembali</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi Pengelola</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {borrowings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/60">
                      <td className="p-3">
                        <p className="font-bold text-[#17211D]">{b.user?.name || b.borrowerName}</p>
                        <p className="text-gray-400">{b.user?.phone || b.borrowerPhone || '-'}</p>
                      </td>
                      <td className="p-3 font-semibold text-gray-800">
                        {b.book?.title || b.bookTitle}
                      </td>
                      <td className="p-3 text-gray-600">
                        {new Date(b.dueDate).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                            b.status === 'BORROWED'
                              ? 'bg-blue-50 text-blue-800'
                              : b.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-800'
                              : b.status === 'RETURNED'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        {b.status === 'PENDING' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleUpdateBorrowStatus(b.id, 'APPROVED')}
                          >
                            Setujui
                          </Button>
                        )}
                        {b.status === 'APPROVED' && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateBorrowStatus(b.id, 'BORROWED')}
                          >
                            Diambil
                          </Button>
                        )}
                        {b.status === 'BORROWED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateBorrowStatus(b.id, 'RETURNED')}
                          >
                            Kembali
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Belum ada permohonan peminjaman"
              description="Ketika masyarakat mengajukan pinjam buku secara online, data permohonan akan masuk ke tabel ini."
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: MEMBERS (KOMUNITAS) */}
      {/* ===================================================================== */}
      {currentTab === 'members' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Daftar Anggota Komunitas</h3>
              <p className="text-xs text-gray-500">Relawan dan pegiat literasi yang bergabung</p>
            </div>
          </div>

          {members && members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Nama Anggota</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Kontak WA</th>
                    <th className="p-3">Peran</th>
                    <th className="p-3">Tanggal Bergabung</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50/60">
                      <td className="p-3 font-bold text-[#17211D]">{m.user?.name}</td>
                      <td className="p-3 text-gray-500">{m.user?.email}</td>
                      <td className="p-3 text-emerald-800 font-medium">
                        {m.user?.phone ? `+${m.user.phone}` : '-'}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 text-[11px]">
                          {m.role || 'ANGGOTA'}
                        </span>
                      </td>
                      <td className="p-3 text-gray-500">
                        {new Date(m.joinedAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              title="Belum ada anggota yang bergabung"
              description="Ajak pegiat literasi Sidrap untuk bergabung dengan komunitas Anda."
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: EVENTS */}
      {/* ===================================================================== */}
      {currentTab === 'events' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Agenda Kegiatan Literasi</h3>
              <p className="text-xs text-gray-500">
                Event, bedah buku, lapak baca, dan diskusi yang diselenggarakan
              </p>
            </div>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all space-y-2 bg-gray-50/50"
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {ev.category || 'DISKUSI'}
                  </span>
                  <h4 className="font-bold text-sm text-[#17211D]">{ev.title}</h4>
                  <p className="text-xs text-gray-500">
                    📅 {new Date(ev.eventDate).toLocaleDateString('id-ID')} • 📍 {ev.location}
                  </p>
                  <div className="pt-2 flex items-center justify-between text-xs text-gray-600 border-t border-gray-100">
                    <span>Partisipan: {ev._count?.participants || 0} orang</span>
                    <span className="font-semibold text-emerald-800">
                      {ev.isFree ? 'Gratis' : 'Berbayar'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Belum ada agenda kegiatan"
              description="Buat agenda lapak baca atau bedah buku untuk meramaikan gerakan membaca di Sidrap."
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: PROFILE (PROFIL TOKO / MITRA) */}
      {/* ===================================================================== */}
      {currentTab === 'profile' && (
        <div className="space-y-6">
          {/* Profile Overview Banner */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 text-[#075E54] border border-emerald-200 flex items-center justify-center shrink-0 shadow-inner">
                {mitraType === 'TOKO_BUKU' ? (
                  <Store className="w-8 h-8 sm:w-10 sm:h-10" />
                ) : mitraType === 'PERPUSTAKAAN' ? (
                  <Landmark className="w-8 h-8 sm:w-10 sm:h-10" />
                ) : (
                  <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Mitra {roleTitle}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Terverifikasi Resmi
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#17211D]">
                  {profileForm.organizationName || user?.mitraProfile?.organizationName || user?.name}
                </h2>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 flex-wrap">
                  <span>📍 Kec. {profileForm.district}, Sidrap</span>
                  <span>•</span>
                  <span>🕒 {profileForm.openHours || '08.00 - 17.00 WITA'}</span>
                  <span>•</span>
                  <span>📱 {profileForm.phoneWa ? `+${profileForm.phoneWa}` : 'Belum ada nomor WA'}</span>
                </p>
              </div>
            </div>

            {/* Public Link Button if Toko Buku or Perpustakaan */}
            {mitraType === 'TOKO_BUKU' && dashboardData?.profile?.store?.id && (
              <a
                href={`/literasi/toko/${dashboardData.profile.store.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#075E54] hover:bg-[#05473F] text-white text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                Kunjungi Halaman Publik Toko
              </a>
            )}
            {mitraType === 'PERPUSTAKAAN' && dashboardData?.profile?.library?.id && (
              <a
                href={`/literasi/perpustakaan/${dashboardData.profile.library.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#075E54] hover:bg-[#05473F] text-white text-xs font-bold transition-all shadow-xs shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
                Kunjungi Halaman Publik Perpustakaan
              </a>
            )}
          </div>

          {/* Edit Profile Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="font-bold text-base text-[#17211D]">
                Kelola Informasi & Pengaturan Profil {roleTitle}
              </h3>
              <p className="text-xs text-gray-500">
                Informasi ini akan ditampilkan kepada masyarakat Sidrap yang mencari buku dan literasi.
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Nama {roleTitle} *
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={profileForm.organizationName}
                    onChange={handleProfileChange}
                    required
                    placeholder={`Contoh: ${mitraType === 'TOKO_BUKU' ? 'Toko Buku Sidrap Mandiri' : 'Perpustakaan Daerah Sidrap'}`}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Nomor WhatsApp Bisnis / Transaksi *
                  </label>
                  <input
                    type="text"
                    name="phoneWa"
                    value={profileForm.phoneWa}
                    onChange={handleProfileChange}
                    required
                    placeholder="Contoh: 081234567890 atau 6281234567890"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54]"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Digunakan untuk menerima pesanan buku otomatis dari warga via WhatsApp.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Kecamatan Domisili di Sidrap *
                  </label>
                  <select
                    name="district"
                    value={profileForm.district}
                    onChange={handleProfileChange}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54]"
                  >
                    {districtsList.map((d) => (
                      <option key={d} value={d}>
                        Kecamatan {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Kelurahan / Desa
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={profileForm.village}
                    onChange={handleProfileChange}
                    placeholder="Contoh: Pangkajene"
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Jam Operasional Layanan
                </label>
                <input
                  type="text"
                  name="openHours"
                  value={profileForm.openHours}
                  onChange={handleProfileChange}
                  placeholder="Contoh: Senin - Sabtu: 08.00 - 21.00 WITA"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Alamat Lengkap *
                </label>
                <textarea
                  name="address"
                  value={profileForm.address}
                  onChange={handleProfileChange}
                  required
                  rows={2}
                  placeholder="Jl. Jenderal Sudirman No. 12, Pangkajene, Kabupaten Sidenreng Rappang"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">
                  Deskripsi / Profil Singkat {roleTitle}
                </label>
                <textarea
                  name="description"
                  value={profileForm.description}
                  onChange={handleProfileChange}
                  rows={3}
                  placeholder={`Ceritakan tentang koleksi buku, layanan baca, atau spesialisasi ${roleTitle} Anda...`}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54]"
                />
              </div>

              {/* PIC Info Readonly */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-400 font-medium">Penanggung Jawab Akun (PIC):</span>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{user?.name}</p>
                </div>
                <div>
                  <span className="text-gray-400 font-medium">Email Terdaftar:</span>
                  <p className="font-semibold text-gray-700 text-sm mt-0.5">{user?.email}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end">
                <Button
                  type="submit"
                  size="md"
                  variant="primary"
                  isLoading={isUpdatingProfile}
                  className="px-6 gap-2"
                >
                  <Check className="w-4 h-4" /> Simpan Perubahan Profil
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: STATS (STATISTIK) */}
      {/* ===================================================================== */}
      {currentTab === 'stats' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Statistik & Analisis Performa {roleTitle}</h3>
              <p className="text-xs text-gray-500">
                Data tren pesanan, aktivitas literasi, dan perputaran koleksi
              </p>
            </div>

            {/* Recharts Area Chart */}
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData || []}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#075E54" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#075E54" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '16px',
                      border: '1px solid #E5E7EB',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#075E54"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ADD INVENTORY MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={mitraType === 'TOKO_BUKU' ? 'Tambah Produk Buku ke Toko' : 'Tambah Koleksi Perpustakaan'}
      >
        <form onSubmit={handleAddInventory} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Judul Buku *</label>
              <input
                type="text"
                name="title"
                value={inventoryForm.title}
                onChange={handleFormChange}
                placeholder="Filosofi Teras"
                required
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Penulis *</label>
              <input
                type="text"
                name="author"
                value={inventoryForm.author}
                onChange={handleFormChange}
                placeholder="Henry Manampiring"
                required
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Kategori Buku *</label>
              <select
                name="categoryId"
                value={inventoryForm.categoryId}
                onChange={handleFormChange}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {mitraType === 'TOKO_BUKU' ? (
              <div>
                <label className="block font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                <input
                  type="number"
                  name="price"
                  value={inventoryForm.price}
                  onChange={handleFormChange}
                  placeholder="95000"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>
            ) : (
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nomor Panggil (DDC)</label>
                <input
                  type="text"
                  name="callNumber"
                  value={inventoryForm.callNumber}
                  onChange={handleFormChange}
                  placeholder="100.1 MAN f"
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                {mitraType === 'TOKO_BUKU' ? 'Jumlah Stok (pcs)' : 'Jumlah Stok Koleksi (eks)'}
              </label>
              <input
                type="number"
                name={mitraType === 'TOKO_BUKU' ? 'stock' : 'totalStock'}
                value={mitraType === 'TOKO_BUKU' ? inventoryForm.stock : inventoryForm.totalStock}
                onChange={handleFormChange}
                placeholder="10"
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">ISBN</label>
              <input
                type="text"
                name="isbn"
                value={inventoryForm.isbn}
                onChange={handleFormChange}
                placeholder="978-602-..."
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
          </div>

          {mitraType === 'PERPUSTAKAAN' && (
            <div>
              <label className="block font-medium text-gray-700 mb-1">Lokasi Rak / Lemari</label>
              <input
                type="text"
                name="locationShelf"
                value={inventoryForm.locationShelf}
                onChange={handleFormChange}
                placeholder="Rak A-3 Lantai 1"
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
          )}

          <div>
            <label className="block font-medium text-gray-700 mb-1">Deskripsi / Sinopsis</label>
            <textarea
              name="description"
              value={inventoryForm.description}
              onChange={handleFormChange}
              rows={3}
              placeholder="Deskripsi singkat mengenai buku ini..."
              className="w-full p-2.5 rounded-xl border border-gray-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Simpan ke Katalog
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* EDIT INVENTORY MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Ubah Keterangan & Data Buku"
      >
        <form onSubmit={handleUpdateInventory} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Judul Buku *</label>
              <input
                type="text"
                name="title"
                value={editForm.title}
                onChange={handleEditFormChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Penulis *</label>
              <input
                type="text"
                name="author"
                value={editForm.author}
                onChange={handleEditFormChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Kategori Buku *</label>
              <select
                name="categoryId"
                value={editForm.categoryId}
                onChange={handleEditFormChange}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {mitraType === 'TOKO_BUKU' ? (
              <div>
                <label className="block font-medium text-gray-700 mb-1">Harga (Rp) *</label>
                <input
                  type="number"
                  name="price"
                  value={editForm.price}
                  onChange={handleEditFormChange}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>
            ) : (
              <div>
                <label className="block font-medium text-gray-700 mb-1">Nomor Panggil</label>
                <input
                  type="text"
                  name="callNumber"
                  value={editForm.callNumber}
                  onChange={handleEditFormChange}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>
            )}
          </div>

          {mitraType === 'TOKO_BUKU' ? (
            <div>
              <label className="block font-medium text-gray-700 mb-1">Jumlah Stok (pcs)</label>
              <input
                type="number"
                name="stock"
                value={editForm.stock}
                onChange={handleEditFormChange}
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Jumlah Stok Koleksi</label>
                <input
                  type="number"
                  name="totalStock"
                  value={editForm.totalStock}
                  onChange={handleEditFormChange}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Lokasi Rak</label>
                <input
                  type="text"
                  name="locationShelf"
                  value={editForm.locationShelf}
                  onChange={handleEditFormChange}
                  className="w-full p-2.5 rounded-xl border border-gray-200"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Keterangan / Deskripsi / Sinopsis Buku *
            </label>
            <textarea
              name="description"
              value={editForm.description}
              onChange={handleEditFormChange}
              rows={4}
              placeholder="Tuliskan keterangan lengkap atau sinopsis buku ini..."
              required
              className="w-full p-2.5 rounded-xl border border-gray-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
