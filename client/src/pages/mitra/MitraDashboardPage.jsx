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
  Trash2,
  Edit,
  Sparkles,
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
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';

export const MitraDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'dashboard';

  const { user } = useAuth();
  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);

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

  const mitraType = user?.mitraProfile?.mitraType || 'TOKO_BUKU';

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await mitraService.getDashboard();
      if (res?.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      console.error('Failed to load mitra dashboard:', err);
    } finally {
      setIsLoading(false);
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
      showToast(res.message, 'success');
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
      showToast(res.message, 'success');
      fetchDashboard();
    } catch {
      showToast('Gagal menghapus item.', 'error');
    }
  };

  const handleUpdateBorrowStatus = async (borrowingId, newStatus) => {
    try {
      const res = await mitraService.updateBorrowingStatus(borrowingId, newStatus);
      showToast(res.message, 'success');
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

  const { metrics, chartData, topSellingBooks, recentActivities, products, collections, borrowings } = dashboardData || {};

  return (
    <div className="space-y-8">
      {/* Top Welcome Card matching mockup */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#17211D]">
            Selamat datang, {user?.mitraProfile?.organizationName || user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Kelola {mitraType === 'TOKO_BUKU' ? 'toko buku' : mitraType === 'PERPUSTAKAAN' ? 'perpustakaan' : 'komunitas'} Anda dan tingkatkan jangkauan literasi di Sidrap.
          </p>
        </div>

        <Button
          size="md"
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="shrink-0"
        >
          <Plus className="w-4 h-4" />
          {mitraType === 'TOKO_BUKU' ? 'Tambah Buku' : mitraType === 'PERPUSTAKAAN' ? 'Tambah Koleksi' : 'Tambah Event'}
        </Button>
      </div>

      {/* 4 Metrics Cards matching mockup */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Produk / Koleksi */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">
              {mitraType === 'TOKO_BUKU' ? 'Produk' : mitraType === 'PERPUSTAKAAN' ? 'Koleksi' : 'Anggota'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#17211D]">
            {metrics?.totalProducts || metrics?.totalCollections || metrics?.totalMembers || 125}
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +12% dari bulan lalu
          </span>
        </div>

        {/* Card 2: Dilihat */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Dilihat</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#17211D]">
            {(metrics?.totalViews || metrics?.totalVisitors || 1240).toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +18% dari bulan lalu
          </span>
        </div>

        {/* Card 3: Pesanan / Peminjaman */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">
              {mitraType === 'TOKO_BUKU' ? 'Pesanan' : 'Peminjaman'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#17211D]">
            {metrics?.totalOrders || metrics?.totalBorrowings || 34}
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +6% dari bulan lalu
          </span>
        </div>

        {/* Card 4: Event */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Event</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#17211D]">
            {metrics?.totalEvents || 4}
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +50% dari bulan lalu
          </span>
        </div>
      </div>

      {/* Main Row: Activity Chart & Best Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 cols: Grafik Aktivitas matching mockup */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-[#17211D]">Grafik Aktivitas</h3>
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
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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

        {/* Right 4 cols: Produk Terlaris matching mockup */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#17211D]">Produk Terlaris</h3>
          <div className="space-y-3">
            {topSellingBooks?.map((book, i) => (
              <div key={i} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-7 h-9 rounded-md object-cover bg-gray-100 shrink-0"
                  />
                  <span className="font-semibold text-[#17211D] truncate">{book.title}</span>
                </div>
                <span className="text-gray-500 font-medium whitespace-nowrap">
                  {book.sold} terjual
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Table Aktivitas Terbaru & Tips matching mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 cols: Aktivitas Terbaru Table */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#17211D]">Aktivitas Terbaru</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                <tr>
                  <th className="pb-3 w-12">No</th>
                  <th className="pb-3">Waktu</th>
                  <th className="pb-3">Aktivitas</th>
                  <th className="pb-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600">
                {recentActivities?.map((act) => (
                  <tr key={act.id} className="hover:bg-gray-50/60">
                    <td className="py-3 font-semibold text-gray-400">{act.id}</td>
                    <td className="py-3 whitespace-nowrap">{act.time}</td>
                    <td className="py-3 font-semibold text-[#17211D]">{act.activity}</td>
                    <td className="py-3 text-gray-500">{act.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 4 cols: Tips & Informasi matching mockup */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" /> Tips & Informasi
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tingkatkan penjualan dan jangkauan perpustakaan Anda dengan mempromosikan koleksi buku pilihan pada halaman utama MABBACA.
            </p>
          </div>

          <div className="pt-4">
            <Button
              size="sm"
              variant="primary"
              onClick={() => showToast('Panduan mitra tersedia di dokumentasi bantuan.', 'info')}
              className="w-full text-xs"
            >
              Lihat Panduan
            </Button>
          </div>
        </div>
      </div>

      {/* Inventory & Management Table for Products / Collections */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-[#17211D]">
              {mitraType === 'TOKO_BUKU' ? 'Daftar Inventaris Produk Toko' : 'Daftar Koleksi Perpustakaan'}
            </h3>
            <p className="text-xs text-gray-500">
              Data terhubung langsung dengan katalog publik MABBACA
            </p>
          </div>
          <Button size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Tambah Baru
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
              <tr>
                <th className="p-3">Cover</th>
                <th className="p-3">Judul & Penulis</th>
                <th className="p-3">Kategori</th>
                {mitraType === 'TOKO_BUKU' ? (
                  <>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Stok</th>
                  </>
                ) : (
                  <>
                    <th className="p-3">No. Panggil</th>
                    <th className="p-3">Stok Tersedia</th>
                  </>
                )}
                <th className="p-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(products || collections)?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/60">
                  <td className="p-3">
                    <img src={item.coverImage} alt={item.title} className="w-8 h-10 object-cover rounded-sm" />
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-[#17211D]">{item.title}</p>
                    <p className="text-gray-400">{item.author}</p>
                  </td>
                  <td className="p-3">{item.category}</td>
                  {mitraType === 'TOKO_BUKU' ? (
                    <>
                      <td className="p-3 font-semibold text-[#075E54]">Rp {item.price?.toLocaleString('id-ID')}</td>
                      <td className="p-3">{item.stock} pcs</td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 font-medium text-gray-700">{item.callNumber || '-'}</td>
                      <td className="p-3 font-semibold text-emerald-700">{item.availableStock} eks</td>
                    </>
                  )}
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Ubah Keterangan & Data Buku"
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
      </div>

      {/* Library Borrowing Management (Only for PERPUSTAKAAN) */}
      {mitraType === 'PERPUSTAKAAN' && borrowings && borrowings.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-4">
          <h3 className="font-bold text-base text-[#17211D]">
            Permohonan Peminjaman Masuk
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Peminjam</th>
                  <th className="p-3">Buku</th>
                  <th className="p-3">Batas Kembali</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {borrowings.map((b) => (
                  <tr key={b.id}>
                    <td className="p-3">
                      <p className="font-bold text-[#17211D]">{b.borrowerName}</p>
                      <p className="text-gray-400">{b.borrowerPhone}</p>
                    </td>
                    <td className="p-3 font-semibold text-gray-700">{b.bookTitle}</td>
                    <td className="p-3">{new Date(b.dueDate).toLocaleDateString('id-ID')}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800">
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateBorrowStatus(b.id, 'APPROVED')}
                          className="px-2 py-1 rounded bg-emerald-600 text-white font-semibold"
                        >
                          Setujui
                        </button>
                      )}
                      {b.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateBorrowStatus(b.id, 'BORROWED')}
                          className="px-2 py-1 rounded bg-blue-600 text-white font-semibold"
                        >
                          Tandai Diambil
                        </button>
                      )}
                      {b.status === 'BORROWED' && (
                        <button
                          onClick={() => handleUpdateBorrowStatus(b.id, 'RETURNED')}
                          className="px-2 py-1 rounded bg-gray-700 text-white font-semibold"
                        >
                          Kembali
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Inventory Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={mitraType === 'TOKO_BUKU' ? 'Tambah Buku ke Toko' : 'Tambah Koleksi Perpustakaan'}
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
                <label className="block font-medium text-gray-700 mb-1">Nomor Panggil</label>
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
              Simpan ke Database
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Book / Inventory Modal */}
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
