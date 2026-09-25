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
  AlertTriangle,
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
  Upload,
  Image as ImageIcon,
  X,
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
import { mitraService, bookService, orderService, borrowingService, eventService } from '../../services/dataServices';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ImageWithFallback, resolveImageUrl } from '../../components/common/ImageWithFallback';
import { EcosystemStatsOverview } from '../../components/dashboard/EcosystemStatsOverview';

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
  const [addCoverFile, setAddCoverFile] = useState(null);
  const [addCoverPreview, setAddCoverPreview] = useState('');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
  const [catalogSearchResults, setCatalogSearchResults] = useState([]);
  const [isSearchingCatalog, setIsSearchingCatalog] = useState(false);
  const [selectedCatalogBook, setSelectedCatalogBook] = useState(null);
  const [inventoryForm, setInventoryForm] = useState({
    bookId: '',
    title: '',
    author: '',
    categoryId: '1',
    publisher: '',
    isbn: '',
    publishYear: '2024',
    pages: '200',
    language: 'Bahasa Indonesia',
    price: '95000',
    stock: '10',
    callNumber: '',
    totalStock: '5',
    locationShelf: 'Rak Utama',
    readUrl: '',
    description: '',
    coverImage: '',
  });

  // Edit Book/Inventory Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCoverFile, setEditCoverFile] = useState(null);
  const [editCoverPreview, setEditCoverPreview] = useState('');
  const [editForm, setEditForm] = useState({
    id: null,
    title: '',
    author: '',
    categoryId: '1',
    publisher: '',
    isbn: '',
    publishYear: '2024',
    pages: '200',
    language: 'Bahasa Indonesia',
    price: '',
    stock: '',
    callNumber: '',
    totalStock: '',
    locationShelf: '',
    readUrl: '',
    description: '',
    coverImage: '',
  });

  // Order Status & Delete Modal State (Toko Buku)
  const [orderStatusModalOpen, setOrderStatusModalOpen] = useState(false);
  const [selectedOrderMitra, setSelectedOrderMitra] = useState(null);
  const [newOrderStatusMitra, setNewOrderStatusMitra] = useState('CONFIRMED');
  const [isSubmittingOrderStatus, setIsSubmittingOrderStatus] = useState(false);

  const [deleteOrderModalOpen, setDeleteOrderModalOpen] = useState(false);
  const [orderToDeleteMitra, setOrderToDeleteMitra] = useState(null);
  const [isSubmittingDeleteOrder, setIsSubmittingDeleteOrder] = useState(false);

  // Reject & Delete Borrowing Modal State (Perpustakaan)
  const [rejectBorrowModalOpen, setRejectBorrowModalOpen] = useState(false);
  const [borrowingToReject, setBorrowingToReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmittingRejectBorrow, setIsSubmittingRejectBorrow] = useState(false);

  const [deleteBorrowModalOpen, setDeleteBorrowModalOpen] = useState(false);
  const [borrowingToDeleteMitra, setBorrowingToDeleteMitra] = useState(null);
  const [isSubmittingDeleteBorrow, setIsSubmittingDeleteBorrow] = useState(false);

  // Delete Event Modal State
  const [deleteEventModalOpen, setDeleteEventModalOpen] = useState(false);
  const [eventToDeleteMitra, setEventToDeleteMitra] = useState(null);
  const [isSubmittingDeleteEvent, setIsSubmittingDeleteEvent] = useState(false);

  // Add Event Modal State (Semua Mitra: Toko Buku, Perpustakaan, Komunitas)
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [eventCoverFile, setEventCoverFile] = useState(null);
  const [eventCoverPreview, setEventCoverPreview] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    category: 'BEDAH_BUKU',
    audience: 'UMUM',
    eventDate: '',
    startTime: '09:00',
    endTime: '12:00',
    location: '',
    address: '',
    district: 'Pangkajene',
    capacity: '50',
    isFree: true,
    price: '',
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
  const [profileLogoFile, setProfileLogoFile] = useState(null);
  const [profileBannerFile, setProfileBannerFile] = useState(null);
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
      const formData = new FormData();
      Object.keys(profileForm).forEach((key) => {
        formData.append(key, profileForm[key]);
      });
      if (profileLogoFile) formData.append('logo', profileLogoFile);
      if (profileBannerFile) formData.append('banner', profileBannerFile);

      const res = await mitraService.updateProfile(formData);
      showToast(res?.message || 'Profil berhasil diperbarui!', 'success');
      setProfileLogoFile(null);
      setProfileBannerFile(null);
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

  const handleAddCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file gambar maksimal 5MB.', 'error');
        return;
      }
      setAddCoverFile(file);
      setAddCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAddCover = () => {
    setAddCoverFile(null);
    setAddCoverPreview('');
    setInventoryForm((prev) => ({ ...prev, coverImage: '' }));
  };

  const handleCatalogSearch = async (query) => {
    setCatalogSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setCatalogSearchResults([]);
      return;
    }
    try {
      setIsSearchingCatalog(true);
      const res = await bookService.getBooks({ search: query.trim(), limit: 6 });
      if (res?.data) {
        setCatalogSearchResults(res.data);
      } else {
        setCatalogSearchResults([]);
      }
    } catch (err) {
      console.error('Error searching master book catalog:', err);
    } finally {
      setIsSearchingCatalog(false);
    }
  };

  const handleSelectExistingBook = (book) => {
    setSelectedCatalogBook(book);
    setCatalogSearchResults([]);
    setCatalogSearchQuery('');

    // Pre-fill all metadata from existing book
    setInventoryForm((prev) => ({
      ...prev,
      bookId: String(book.id),
      title: book.title || '',
      author: book.author || '',
      categoryId: book.categoryId ? String(book.categoryId) : (book.category?.id ? String(book.category.id) : '1'),
      publisher: book.publisher || '',
      isbn: book.isbn || '',
      publishYear: book.publishYear ? String(book.publishYear) : '2024',
      pages: book.pages ? String(book.pages) : '',
      language: book.language || 'Bahasa Indonesia',
      description: book.description || '',
      coverImage: book.coverImage || '',
    }));

    if (book.coverImage) {
      setAddCoverPreview(resolveImageUrl(book.coverImage));
      setAddCoverFile(null);
    }

    showToast(`Buku "${book.title}" dipilih! Data buku & sampul terisi otomatis.`, 'success');
  };

  const handleResetCatalogSelection = () => {
    setSelectedCatalogBook(null);
    setCatalogSearchQuery('');
    setCatalogSearchResults([]);
    setAddCoverFile(null);
    setAddCoverPreview('');
    setInventoryForm({
      bookId: '',
      title: '',
      author: '',
      categoryId: '1',
      publisher: '',
      isbn: '',
      publishYear: '2024',
      pages: '200',
      language: 'Bahasa Indonesia',
      price: '95000',
      stock: '10',
      callNumber: '',
      totalStock: '5',
      locationShelf: 'Rak Utama',
      readUrl: '',
      description: '',
      coverImage: '',
    });
  };

  const handleOpenAddModal = () => {
    handleResetCatalogSelection();
    setIsAddModalOpen(true);
  };

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!inventoryForm.title || !inventoryForm.author) {
      showToast('Judul dan penulis buku wajib diisi.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const fd = new FormData();
      Object.keys(inventoryForm).forEach((key) => {
        if (inventoryForm[key] !== null && inventoryForm[key] !== undefined && inventoryForm[key] !== '') {
          fd.append(key, inventoryForm[key]);
        }
      });
      if (addCoverFile) {
        fd.append('coverImage', addCoverFile);
      } else if (inventoryForm.coverImage) {
        fd.append('coverImage', inventoryForm.coverImage);
      }

      const res = await mitraService.addInventory(fd);
      showToast(res.message || 'Item berhasil ditambahkan ke inventaris!', 'success');
      setIsAddModalOpen(false);
      handleResetCatalogSelection();
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
      publisher: item.publisher || '',
      isbn: item.isbn || '',
      publishYear: item.publishYear ? String(item.publishYear) : '2024',
      pages: item.pages ? String(item.pages) : '',
      language: item.language || 'Bahasa Indonesia',
      price: item.price !== undefined ? String(item.price) : '',
      stock: item.stock !== undefined ? String(item.stock) : '',
      callNumber: item.callNumber || '',
      totalStock: item.totalStock !== undefined ? String(item.totalStock) : '',
      locationShelf: item.locationShelf || '',
      readUrl: item.readUrl || '',
      description: item.description || '',
      coverImage: item.coverImage || '',
    });
    setEditCoverFile(null);
    setEditCoverPreview(item.coverImage ? resolveImageUrl(item.coverImage) : '');
    setIsEditModalOpen(true);
  };

  const handleEditFormChange = (e) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleEditCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file gambar maksimal 5MB.', 'error');
        return;
      }
      setEditCoverFile(file);
      setEditCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveEditCover = () => {
    setEditCoverFile(null);
    setEditCoverPreview('');
    setEditForm((prev) => ({ ...prev, coverImage: '' }));
  };

  const handleUpdateInventory = async (e) => {
    e.preventDefault();
    if (!editForm.title || !editForm.author) {
      showToast('Judul dan penulis buku wajib diisi.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const fd = new FormData();
      Object.keys(editForm).forEach((key) => {
        if (editForm[key] !== null && editForm[key] !== undefined) {
          fd.append(key, editForm[key]);
        }
      });
      if (editCoverFile) {
        fd.append('coverImage', editCoverFile);
      }

      const res = await mitraService.updateInventory(editForm.id, fd);
      showToast(res.message || 'Keterangan dan data buku berhasil diperbarui!', 'success');
      setIsEditModalOpen(false);
      setEditCoverFile(null);
      setEditCoverPreview('');
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

  // Order Handlers (Toko Buku)
  const handleOpenUpdateOrderStatus = (ord) => {
    setSelectedOrderMitra(ord);
    setNewOrderStatusMitra(ord.status || 'CONFIRMED');
    setOrderStatusModalOpen(true);
  };

  const handleSaveOrderStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrderMitra) return;
    try {
      setIsSubmittingOrderStatus(true);
      const res = await orderService.updateOrderStatus(selectedOrderMitra.id, newOrderStatusMitra);
      showToast(res.message || `Status pesanan #${selectedOrderMitra.orderNumber} berhasil diperbarui!`, 'success');
      setOrderStatusModalOpen(false);
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengubah status pesanan.', 'error');
    } finally {
      setIsSubmittingOrderStatus(false);
    }
  };

  const handleOpenDeleteOrder = (ord) => {
    setOrderToDeleteMitra(ord);
    setDeleteOrderModalOpen(true);
  };

  const handleConfirmDeleteOrder = async () => {
    if (!orderToDeleteMitra) return;
    try {
      setIsSubmittingDeleteOrder(true);
      const res = await orderService.deleteOrder(orderToDeleteMitra.id);
      showToast(res.message || 'Pesanan berhasil dihapus.', 'success');
      setDeleteOrderModalOpen(false);
      setOrderToDeleteMitra(null);
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus pesanan.', 'error');
    } finally {
      setIsSubmittingDeleteOrder(false);
    }
  };

  // Borrowing Handlers (Perpustakaan)
  const handleOpenRejectBorrow = (b) => {
    setBorrowingToReject(b);
    setRejectReason('');
    setRejectBorrowModalOpen(true);
  };

  const handleConfirmRejectBorrow = async (e) => {
    e.preventDefault();
    if (!borrowingToReject) return;
    try {
      setIsSubmittingRejectBorrow(true);
      const res = await borrowingService.updateBorrowingStatus(borrowingToReject.id, 'REJECTED', rejectReason);
      showToast(res.message || 'Permohonan peminjaman berhasil ditolak.', 'success');
      setRejectBorrowModalOpen(false);
      setBorrowingToReject(null);
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menolak permohonan.', 'error');
    } finally {
      setIsSubmittingRejectBorrow(false);
    }
  };

  const handleOpenDeleteBorrow = (b) => {
    setBorrowingToDeleteMitra(b);
    setDeleteBorrowModalOpen(true);
  };

  const handleConfirmDeleteBorrow = async () => {
    if (!borrowingToDeleteMitra) return;
    try {
      setIsSubmittingDeleteBorrow(true);
      const res = await borrowingService.deleteBorrowing(borrowingToDeleteMitra.id);
      showToast(res.message || 'Data riwayat peminjaman berhasil dihapus.', 'success');
      setDeleteBorrowModalOpen(false);
      setBorrowingToDeleteMitra(null);
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus data peminjaman.', 'error');
    } finally {
      setIsSubmittingDeleteBorrow(false);
    }
  };

  // Event Handlers (Semua Mitra: Toko Buku, Perpustakaan, Komunitas)
  const handleOpenAddEvent = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    const defaultDate = today.toISOString().split('T')[0];

    setEventForm({
      title: '',
      category: mitraType === 'TOKO_BUKU' ? 'BEDAH_BUKU' : mitraType === 'PERPUSTAKAAN' ? 'WORKSHOP' : 'LAPAK_BACA',
      audience: 'UMUM',
      eventDate: defaultDate,
      startTime: '09:00',
      endTime: '12:00',
      location: profileForm.organizationName || 'Lokasi Mitra MABBACA',
      address: profileForm.address || '',
      district: profileForm.district || 'Pangkajene',
      capacity: '50',
      isFree: true,
      price: '',
      description: '',
    });
    setEventCoverFile(null);
    setEventCoverPreview('');
    setIsAddEventModalOpen(true);
  };

  const handleEventFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEventCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran banner kegiatan maksimal 5MB.', 'error');
        return;
      }
      setEventCoverFile(file);
      setEventCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveEventCover = () => {
    setEventCoverFile(null);
    setEventCoverPreview('');
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventForm.title.trim() || !eventForm.description.trim() || !eventForm.eventDate || !eventForm.location.trim()) {
      showToast('Judul, tanggal, lokasi, dan deskripsi kegiatan wajib diisi.', 'error');
      return;
    }

    try {
      setIsSubmittingEvent(true);
      const fd = new FormData();
      Object.keys(eventForm).forEach((key) => {
        if (eventForm[key] !== null && eventForm[key] !== undefined) {
          fd.append(key, eventForm[key]);
        }
      });
      if (eventCoverFile) {
        fd.append('image', eventCoverFile);
      }

      const res = await eventService.createEvent(fd);
      showToast(res.message || 'Agenda kegiatan literasi berhasil dibuat dan dipublikasikan!', 'success');
      setIsAddEventModalOpen(false);
      setEventCoverFile(null);
      setEventCoverPreview('');
      await fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal membuat agenda kegiatan.', 'error');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleOpenDeleteEvent = (ev) => {
    setEventToDeleteMitra(ev);
    setDeleteEventModalOpen(true);
  };

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDeleteMitra) return;
    try {
      setIsSubmittingDeleteEvent(true);
      const res = await eventService.deleteEvent(eventToDeleteMitra.id);
      showToast(res.message || 'Agenda kegiatan berhasil dihapus.', 'success');
      setDeleteEventModalOpen(false);
      setEventToDeleteMitra(null);
      fetchDashboard();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus agenda.', 'error');
    } finally {
      setIsSubmittingDeleteEvent(false);
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
              href={`https://wa.me/6283131930949?text=${encodeURIComponent(
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
              href="https://wa.me/6283131930949"
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
      : 'Komunitas Literasi';

  // Define tabs based on role
  const getTabs = () => {
    switch (mitraType) {
      case 'TOKO_BUKU':
        return [
          { id: 'dashboard', label: 'Ringkasan', icon: TrendingUp },
          { id: 'products', label: `Produk Toko (${products?.length || 0})`, icon: Package },
          { id: 'orders', label: `Pesanan Masuk (${orders?.length || 0})`, icon: ShoppingBag },
          { id: 'events', label: `Agenda Kegiatan (${events?.length || 0})`, icon: Calendar },
          { id: 'profile', label: 'Profil Toko', icon: Building2 },
          { id: 'stats', label: 'Statistik', icon: BarChart3 },
        ];
      case 'PERPUSTAKAAN':
        return [
          { id: 'dashboard', label: 'Ringkasan', icon: TrendingUp },
          { id: 'collections', label: `Koleksi Buku (${collections?.length || 0})`, icon: BookOpen },
          { id: 'borrowings', label: `Peminjaman Masuk (${borrowings?.length || 0})`, icon: ShoppingBag },
          { id: 'events', label: `Agenda Kegiatan (${events?.length || 0})`, icon: Calendar },
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

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {(mitraType === 'TOKO_BUKU' || mitraType === 'PERPUSTAKAAN') && (
            <Button
              size="md"
              variant="primary"
              onClick={handleOpenAddModal}
            >
              <Plus className="w-4 h-4" />
              {mitraType === 'TOKO_BUKU' ? 'Tambah Produk Buku' : 'Tambah Koleksi'}
            </Button>
          )}
          <Button
            size="md"
            variant="outline"
            onClick={() => setIsAddEventModalOpen(true)}
            className="bg-white border-emerald-600 text-emerald-800 hover:bg-emerald-50 shadow-2xs font-semibold"
          >
            <Calendar className="w-4 h-4 text-emerald-700" />
            + Buat Agenda Kegiatan
          </Button>
        </div>
      </div>

      {/* 8 Overview KPI Cards - Hanya tampil di menu Dashboard (Ringkasan) */}
      {currentTab === 'dashboard' && (
        <EcosystemStatsOverview
          counts={dashboardData?.ecosystemCounts}
          activeCard={null}
          onCardClick={(key) => {
            if (key === 'books') {
              if (mitraType === 'TOKO_BUKU') {
                setSearchParams({ tab: 'products' });
                return true;
              }
              if (mitraType === 'PERPUSTAKAAN') {
                setSearchParams({ tab: 'collections' });
                return true;
              }
            }
            if (key === 'events') {
              setSearchParams({ tab: 'events' });
              return true;
            }
            if (key === 'communities' && mitraType === 'KOMUNITAS') {
              setSearchParams({ tab: 'members' });
              return true;
            }
            if (key === 'users') {
              setSearchParams({ tab: 'stats' });
              return true;
            }
            return false;
          }}
        />
      )}

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

                <div
                  onClick={() => setSearchParams({ tab: 'events' })}
                  className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all"
                  title="Klik untuk melihat dan membuat agenda kegiatan"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Event Diadakan</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalEvents || 0}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                    Kelola / Buat Event →
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

                <div
                  onClick={() => setSearchParams({ tab: 'events' })}
                  className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all"
                  title="Klik untuk melihat dan membuat agenda kegiatan"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Event Literasi</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalEvents || 0}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                    Kelola / Buat Event →
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

                <div
                  onClick={() => setSearchParams({ tab: 'events' })}
                  className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all"
                  title="Klik untuk melihat dan membuat agenda kegiatan"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-500">Event & Lapak</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center">
                      <Calendar className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#17211D]">{metrics?.totalEvents || 0}</p>
                  <span className="text-[11px] font-semibold text-emerald-700 mt-1 flex items-center gap-1">
                    Kelola / Buat Event →
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
                      dataKey={mitraType === 'TOKO_BUKU' ? 'pesanan' : 'peminjaman'}
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
              <Button size="sm" onClick={handleOpenAddModal}>
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
              onAction={handleOpenAddModal}
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
              <Button size="sm" onClick={handleOpenAddModal}>
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
                    <th className="p-3">Link Digital</th>
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
                        {item.readUrl ? (
                          <a
                            href={item.readUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2 py-1 rounded-lg transition"
                            title={item.readUrl}
                          >
                            <ExternalLink className="w-3 h-3 text-teal-600" />
                            Buka Link
                          </a>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Hanya Fisik</span>
                        )}
                      </td>
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
              onAction={handleOpenAddModal}
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
                              : ord.status === 'CONFIRMED'
                              ? 'bg-teal-50 text-teal-800'
                              : ord.status === 'CONTACTED'
                              ? 'bg-blue-50 text-blue-800'
                              : ord.status === 'CANCELLED'
                              ? 'bg-red-50 text-red-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/${ord.customerPhone?.replace(/^0/, '62')}?text=${encodeURIComponent(
                              `Halo Kak ${ord.customerName}, kami dari Toko Buku MABBACA ingin mengonfirmasi pesanan #${ord.orderNumber}.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#075E54] font-semibold text-[11px] transition-colors"
                            title="Hubungi Pelanggan via WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> WA
                          </a>
                          <button
                            onClick={() => handleOpenUpdateOrderStatus(ord)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-semibold text-[11px] transition-colors"
                            title="Ubah Status Pesanan"
                          >
                            <Edit className="w-3.5 h-3.5" /> Status
                          </button>
                          <button
                            onClick={() => handleOpenDeleteOrder(ord)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Pesanan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                              : b.status === 'REJECTED'
                              ? 'bg-red-50 text-red-800'
                              : 'bg-amber-50 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.status === 'PENDING' && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleUpdateBorrowStatus(b.id, 'APPROVED')}
                              >
                                Setujui
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleOpenRejectBorrow(b)}
                              >
                                Tolak
                              </Button>
                            </>
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
                          <button
                            onClick={() => handleOpenDeleteBorrow(b)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center"
                            title="Hapus Riwayat Peminjaman"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Agenda Kegiatan Literasi</h3>
              <p className="text-xs text-gray-500">
                Event, bedah buku, lapak baca, dan diskusi yang diselenggarakan oleh mitra {roleTitle}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenAddEvent}
              className="bg-[#075E54] hover:bg-[#05473F] text-white font-bold text-xs gap-1.5 shadow-xs shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Buat Agenda Kegiatan Baru
            </Button>
          </div>

          {events && events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all space-y-3 bg-gray-50/50 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {ev.image && (
                      <div className="h-32 w-full rounded-xl overflow-hidden bg-gray-100 mb-2">
                        <img
                          src={resolveImageUrl(ev.image)}
                          alt={ev.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                        {ev.category || 'DISKUSI'}
                      </span>
                      <button
                        onClick={() => handleOpenDeleteEvent(ev)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus Agenda Kegiatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h4 className="font-bold text-sm text-[#17211D] line-clamp-2">{ev.title}</h4>
                    <p className="text-xs text-gray-500">
                      📅 {new Date(ev.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      <br />
                      ⏰ {ev.startTime} - {ev.endTime} WITA
                      <br />
                      📍 {ev.location}
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-between text-xs text-gray-600 border-t border-gray-100">
                    <span>Partisipan: <strong>{ev._count?.participants || 0}</strong> orang</span>
                    <span className="font-semibold text-emerald-800">
                      {ev.isFree ? 'Gratis' : `Rp ${Number(ev.price || 0).toLocaleString('id-ID')}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-4">
              <EmptyState
                title="Belum ada agenda kegiatan"
                description="Buat agenda lapak baca, bedah buku, atau diskusi untuk meramaikan gerakan membaca di Sidrap."
              />
              <Button
                size="sm"
                onClick={handleOpenAddEvent}
                className="bg-[#075E54] hover:bg-[#05473F] text-white font-bold text-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Buat Kegiatan Pertama
              </Button>
            </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Logo Toko/Komunitas (Opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileLogoFile(e.target.files[0])}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54] bg-white"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Format: JPG, PNG. Maksimal 5MB.
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1.5">
                    Banner / Foto Sampul (Opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfileBannerFile(e.target.files[0])}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54] bg-white"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    Tampil di bagian atas profil toko Anda.
                  </span>
                </div>
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
          {/* ========================================================= */}
          {/* FITUR AUTO-FILL: CARI DARI KATALOG MASTER MABBACA */}
          {/* ========================================================= */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 text-gray-800 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-[#075E54]">
                <Sparkles className="w-4 h-4 shrink-0 text-[#075E54]" />
                <span className="font-bold text-xs text-[#075E54]">
                  💡 Auto-Fill: Pilih dari Master Katalog MABBACA
                </span>
              </div>
              {selectedCatalogBook && (
                <button
                  type="button"
                  onClick={handleResetCatalogSelection}
                  className="text-[11px] font-semibold text-red-600 hover:text-red-700 underline"
                >
                  Reset / Ganti Buku
                </button>
              )}
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed">
              Jika buku sudah pernah diinput oleh Toko Buku atau mitra lain, Anda{' '}
              <strong className="text-emerald-800 font-semibold">TIDAK PERLU upload ulang sampul atau mengetik ulang keterangan</strong>!
              Cari judul buku di bawah, klik untuk memilih, dan semua data langsung terisi otomatis.
            </p>

            {selectedCatalogBook ? (
              <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white border border-emerald-300 shadow-2xs">
                {selectedCatalogBook.coverImage ? (
                  <img
                    src={resolveImageUrl(selectedCatalogBook.coverImage)}
                    alt={selectedCatalogBook.title}
                    className="w-10 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                      ✓ Master ID: #{selectedCatalogBook.id}
                    </span>
                    <span className="font-semibold text-gray-900 text-xs truncate">
                      {selectedCatalogBook.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">
                    Penulis: {selectedCatalogBook.author || '-'} {selectedCatalogBook.publisher ? `• Penerbit: ${selectedCatalogBook.publisher}` : ''}
                  </p>
                  <p className="text-[10px] text-emerald-700 font-medium mt-0.5">
                    Sampul & deskripsi terisi otomatis. Cukup isi{' '}
                    {mitraType === 'TOKO_BUKU' ? 'Harga & Stok Jual' : 'Nomor Panggil, Stok Koleksi & Lokasi Rak'} di bawah.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catalogSearchQuery}
                    onChange={(e) => handleCatalogSearch(e.target.value)}
                    placeholder="Ketik judul buku, penulis, atau ISBN (contoh: Filosofi Teras, Laskar Pelangi)..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-emerald-300 bg-white text-xs focus:ring-2 focus:ring-[#075E54]/20 focus:border-[#075E54]"
                  />
                  {isSearchingCatalog && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-3.5 h-3.5 border-2 border-[#075E54] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                {/* Dropdown Hasil Pencarian */}
                {catalogSearchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100">
                    {catalogSearchResults.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => handleSelectExistingBook(b)}
                        className="flex items-center gap-3 p-2.5 hover:bg-emerald-50/70 cursor-pointer transition-colors"
                      >
                        {b.coverImage ? (
                          <img
                            src={resolveImageUrl(b.coverImage)}
                            alt={b.title}
                            className="w-9 h-12 object-cover rounded border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-12 rounded bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-xs truncate">{b.title}</p>
                          <p className="text-[10px] text-gray-500 truncate">
                            {b.author} {b.publisher ? `• ${b.publisher}` : ''} {b.publishYear ? `(${b.publishYear})` : ''}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[10px] shrink-0 hover:bg-emerald-700">
                          Pilih Buku ↵
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {catalogSearchQuery.trim().length >= 2 && !isSearchingCatalog && catalogSearchResults.length === 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-center text-gray-500 text-xs">
                    Buku tidak ditemukan di katalog. Anda dapat langsung mengisinya secara manual di form bawah.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">
                Judul Buku *
                {selectedCatalogBook && (
                  <span className="text-[10px] text-emerald-700 font-semibold ml-1.5">(Auto-fill)</span>
                )}
              </label>
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
              <label className="block font-medium text-gray-700 mb-1">
                Penulis *
                {selectedCatalogBook && (
                  <span className="text-[10px] text-emerald-700 font-semibold ml-1.5">(Auto-fill)</span>
                )}
              </label>
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
            <div className="space-y-3">
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

              <div>
                <label className="block font-medium text-gray-700 mb-1 flex items-center justify-between">
                  <span>Link Baca Digital / E-Book (Opsional)</span>
                  <span className="text-[10px] text-[#075E54] font-semibold bg-emerald-50 px-2 py-0.5 rounded">Tautan Online</span>
                </label>
                <input
                  type="url"
                  name="readUrl"
                  value={inventoryForm.readUrl || ''}
                  onChange={handleFormChange}
                  placeholder="https://... (contoh: tautan PDF, Google Drive, iPusnas, repositori)"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Masukkan tautan jika buku ini dapat dibaca langsung secara online/digital oleh pemustaka.
                </p>
              </div>
            </div>
          )}

          {/* Informasi Detail Buku */}
          <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-200/80 space-y-2.5">
            <h4 className="font-semibold text-gray-800 text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#075E54]" />
              Informasi Detail Buku
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Penerbit</label>
                <input
                  type="text"
                  name="publisher"
                  value={inventoryForm.publisher}
                  onChange={handleFormChange}
                  placeholder="Contoh: Penerbit Kompas"
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Tahun Terbit</label>
                <input
                  type="number"
                  name="publishYear"
                  value={inventoryForm.publishYear}
                  onChange={handleFormChange}
                  placeholder="2024"
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Jumlah Halaman</label>
                <input
                  type="number"
                  name="pages"
                  value={inventoryForm.pages}
                  onChange={handleFormChange}
                  placeholder="Contoh: 346"
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Bahasa</label>
                <input
                  type="text"
                  name="language"
                  value={inventoryForm.language}
                  onChange={handleFormChange}
                  placeholder="Bahasa Indonesia"
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Sampul Buku (Cover Image)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60">
              {addCoverPreview ? (
                <div className="relative group shrink-0">
                  <img
                    src={addCoverPreview}
                    alt="Preview Sampul"
                    className="w-16 h-22 object-cover rounded-xl border border-gray-200 shadow-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveAddCover}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow-sm hover:bg-red-600 transition-colors"
                    title="Hapus Sampul"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-22 rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center text-gray-400 shrink-0">
                  <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                  <span className="text-[9px] mt-1">No Cover</span>
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="add-cover-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#075E54] hover:bg-emerald-50 hover:border-emerald-200 font-semibold text-xs shadow-2xs transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {addCoverPreview ? 'Ganti File Sampul' : 'Upload Sampul Buku'}
                  </label>
                  <input
                    type="file"
                    id="add-cover-input"
                    accept="image/*"
                    onChange={handleAddCoverChange}
                    className="hidden"
                  />
                  {addCoverPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveAddCover}
                      className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Batal
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">
                  {selectedCatalogBook && !addCoverFile ? (
                    <span className="text-emerald-700 font-medium">
                      ✓ Menggunakan sampul resmi dari Master Katalog MABBACA (tidak perlu upload ulang). Anda tetap dapat menggantinya jika diinginkan.
                    </span>
                  ) : (
                    'Pilih file gambar sampul dari perangkat (JPG, PNG, atau WebP, maks. 5MB).'
                  )}
                </p>
              </div>
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
            <div className="space-y-3">
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

              <div>
                <label className="block font-medium text-gray-700 mb-1 flex items-center justify-between">
                  <span>Link Baca Digital / E-Book (Opsional)</span>
                  <span className="text-[10px] text-[#075E54] font-semibold bg-emerald-50 px-2 py-0.5 rounded">Tautan Online</span>
                </label>
                <input
                  type="url"
                  name="readUrl"
                  value={editForm.readUrl || ''}
                  onChange={handleEditFormChange}
                  placeholder="https://... (contoh: tautan PDF, Google Drive, iPusnas, repositori)"
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs"
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Masukkan tautan jika buku ini dapat dibaca langsung secara online/digital oleh pemustaka.
                </p>
              </div>
            </div>
          )}

          {/* Informasi Detail Buku (Penerbit, Tahun, ISBN, Halaman, Bahasa) */}
          <div className="bg-gray-50/80 p-3 rounded-2xl border border-gray-200/80 space-y-2.5">
            <h4 className="font-semibold text-gray-800 text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#075E54]" />
              Informasi Detail Buku
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Penerbit</label>
                <input
                  type="text"
                  name="publisher"
                  value={editForm.publisher}
                  onChange={handleEditFormChange}
                  placeholder="Contoh: Penerbit Kompas"
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Tahun Terbit</label>
                <input
                  type="number"
                  name="publishYear"
                  value={editForm.publishYear}
                  onChange={handleEditFormChange}
                  placeholder="2018"
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  value={editForm.isbn}
                  onChange={handleEditFormChange}
                  placeholder="978-602-..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Jumlah Halaman</label>
                <input
                  type="number"
                  name="pages"
                  value={editForm.pages}
                  onChange={handleEditFormChange}
                  placeholder="346"
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Bahasa</label>
                <input
                  type="text"
                  name="language"
                  value={editForm.language}
                  onChange={handleEditFormChange}
                  placeholder="Bahasa Indonesia"
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Cover Image Upload (Edit) */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Sampul Buku (Cover Image)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60">
              {editCoverPreview ? (
                <div className="relative group shrink-0">
                  <img
                    src={editCoverPreview}
                    alt="Preview Sampul"
                    className="w-16 h-22 object-cover rounded-xl border border-gray-200 shadow-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveEditCover}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow-sm hover:bg-red-600 transition-colors"
                    title="Hapus / Reset Sampul"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-22 rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center text-gray-400 shrink-0">
                  <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                  <span className="text-[9px] mt-1">No Cover</span>
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="edit-cover-input"
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#075E54] hover:bg-emerald-50 hover:border-emerald-200 font-semibold text-xs shadow-2xs transition-all"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {editCoverPreview ? 'Ganti File Sampul' : 'Upload Sampul Buku'}
                  </label>
                  <input
                    type="file"
                    id="edit-cover-input"
                    accept="image/*"
                    onChange={handleEditCoverChange}
                    className="hidden"
                  />
                  {editCoverPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveEditCover}
                      className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      Hapus Sampul
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">
                  Pilih file gambar baru untuk memperbarui sampul buku ini (JPG, PNG, atau WebP, maks. 5MB).
                </p>
              </div>
            </div>
          </div>

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

      {/* ===================================================================== */}
      {/* MITRA: ORDER STATUS MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={orderStatusModalOpen}
        onClose={() => setOrderStatusModalOpen(false)}
        title={`Perbarui Status Pesanan #${selectedOrderMitra?.orderNumber || ''}`}
      >
        <form onSubmit={handleSaveOrderStatus} className="space-y-4 text-xs">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950 space-y-1">
            <p><strong>Pelanggan:</strong> {selectedOrderMitra?.customerName}</p>
            <p><strong>Kontak:</strong> +{selectedOrderMitra?.customerPhone}</p>
            <p><strong>Total Pesanan:</strong> Rp {Number(selectedOrderMitra?.totalAmount || 0).toLocaleString('id-ID')}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Status Transaksi</label>
            <select
              value={newOrderStatusMitra}
              onChange={(e) => setNewOrderStatusMitra(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[#075E54]"
            >
              <option value="PENDING">Menunggu Konfirmasi (PENDING)</option>
              <option value="CONTACTED">Telah Dihubungi via WA (CONTACTED)</option>
              <option value="CONFIRMED">Dikonfirmasi & Diproses (CONFIRMED)</option>
              <option value="COMPLETED">Selesai / Buku Diambil (COMPLETED)</option>
              <option value="CANCELLED">Dibatalkan (CANCELLED)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOrderStatusModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingOrderStatus}
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MITRA: DELETE ORDER MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={deleteOrderModalOpen}
        onClose={() => setDeleteOrderModalOpen(false)}
        title="Hapus Data Pesanan"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-red-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              Konfirmasi Hapus Pesanan
            </div>
            <p>
              Apakah Anda yakin ingin menghapus data pesanan <strong>#{orderToDeleteMitra?.orderNumber}</strong> dari pelanggan <strong>{orderToDeleteMitra?.customerName}</strong>?
            </p>
            <p className="text-[11px] text-red-700">
              Data transaksi pesanan ini akan dihapus permanen dari sistem toko Anda.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteOrderModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isSubmittingDeleteOrder}
              onClick={handleConfirmDeleteOrder}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Ya, Hapus Pesanan
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MITRA: REJECT BORROWING MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={rejectBorrowModalOpen}
        onClose={() => setRejectBorrowModalOpen(false)}
        title="Tolak Permohonan Peminjaman Buku"
      >
        <form onSubmit={handleConfirmRejectBorrow} className="space-y-4 text-xs">
          <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-950 space-y-1">
            <p><strong>Pemustaka:</strong> {borrowingToReject?.user?.name || borrowingToReject?.borrowerName}</p>
            <p><strong>Judul Buku:</strong> {borrowingToReject?.book?.title || borrowingToReject?.bookTitle}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Alasan Penolakan (Opsional)</label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Buku sedang dalam perbaikan fisik, pemustaka memiliki tanggungan pinjaman lain, dll..."
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRejectBorrowModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={isSubmittingRejectBorrow}
            >
              Konfirmasi Tolak
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MITRA: DELETE BORROWING MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={deleteBorrowModalOpen}
        onClose={() => setDeleteBorrowModalOpen(false)}
        title="Hapus Data Riwayat Peminjaman"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-red-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              Konfirmasi Hapus Riwayat
            </div>
            <p>
              Apakah Anda yakin ingin menghapus data sirkulasi peminjaman buku:
              <br />
              <strong className="text-red-950 font-bold">"{borrowingToDeleteMitra?.book?.title || borrowingToDeleteMitra?.bookTitle}"</strong>
              <br />
              Pemustaka: <strong>{borrowingToDeleteMitra?.user?.name || borrowingToDeleteMitra?.borrowerName}</strong>
            </p>
            <p className="text-[11px] text-red-700">
              Catatan: Menghapus data ini tidak mempengaruhi stok koleksi yang tercatat.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteBorrowModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isSubmittingDeleteBorrow}
              onClick={handleConfirmDeleteBorrow}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Ya, Hapus Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MITRA: DELETE EVENT MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={deleteEventModalOpen}
        onClose={() => setDeleteEventModalOpen(false)}
        title="Hapus Agenda Kegiatan"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-red-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              Konfirmasi Hapus Agenda Kegiatan
            </div>
            <p>
              Apakah Anda yakin ingin menghapus kegiatan literasi:
              <br />
              <strong className="text-base text-red-950 font-bold block mt-1">"{eventToDeleteMitra?.title}"</strong>
            </p>
            <p className="text-[11px] text-red-700">
              Agenda ini akan dihapus dari kalender kegiatan publik MABBACA.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteEventModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isSubmittingDeleteEvent}
              onClick={handleConfirmDeleteEvent}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Ya, Hapus Kegiatan
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MITRA: CREATE EVENT MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={isAddEventModalOpen}
        onClose={() => setIsAddEventModalOpen(false)}
        title="Buat Agenda Kegiatan Literasi Baru"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs py-1">
          <div>
            <label className="block font-medium text-gray-700 mb-1">Judul Kegiatan / Event *</label>
            <input
              type="text"
              name="title"
              value={eventForm.title}
              onChange={handleEventFormChange}
              placeholder="Contoh: Bedah Buku & Diskusi Literasi Bersama Komunitas"
              required
              className="w-full p-2.5 rounded-xl border border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Kategori Kegiatan *</label>
              <select
                name="category"
                value={eventForm.category}
                onChange={handleEventFormChange}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
              >
                <option value="BEDAH_BUKU">Bedah Buku</option>
                <option value="LAPAK_BACA">Lapak Baca & Literasi Desa</option>
                <option value="DISKUSI">Diskusi & Bincang Literasi</option>
                <option value="WORKSHOP">Workshop / Pelatihan</option>
                <option value="FESTIVAL">Festival / Lomba Literasi</option>
                <option value="WEBINAR">Webinar Online</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Target Audiens *</label>
              <select
                name="audience"
                value={eventForm.audience}
                onChange={handleEventFormChange}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
              >
                <option value="UMUM">Masyarakat Umum</option>
                <option value="PELAJAR">Pelajar (SD, SMP, SMA)</option>
                <option value="MAHASISWA">Mahasiswa & Pemuda</option>
                <option value="ANAK_ANAK">Anak-Anak</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Tanggal Kegiatan *</label>
              <input
                type="date"
                name="eventDate"
                value={eventForm.eventDate}
                onChange={handleEventFormChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Jam Mulai *</label>
              <input
                type="time"
                name="startTime"
                value={eventForm.startTime}
                onChange={handleEventFormChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Jam Selesai *</label>
              <input
                type="time"
                name="endTime"
                value={eventForm.endTime}
                onChange={handleEventFormChange}
                required
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Nama Tempat / Lokasi *</label>
              <input
                type="text"
                name="location"
                value={eventForm.location}
                onChange={handleEventFormChange}
                placeholder="Contoh: Toko Buku Sobat Baca / Aula Perpus"
                required
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Kecamatan di Sidrap</label>
              <select
                name="district"
                value={eventForm.district}
                onChange={handleEventFormChange}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
              >
                {districtsList.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Alamat Lengkap Tempat</label>
            <input
              type="text"
              name="address"
              value={eventForm.address}
              onChange={handleEventFormChange}
              placeholder="Jl. Jenderal Sudirman No. 45..."
              className="w-full p-2.5 rounded-xl border border-gray-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Kapasitas Peserta (Orang)</label>
              <input
                type="number"
                name="capacity"
                value={eventForm.capacity}
                onChange={handleEventFormChange}
                placeholder="50"
                min="1"
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
            <div>
              <label className="block font-medium text-gray-700 mb-1">Biaya Pendaftaran</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isFreeRadio"
                    checked={eventForm.isFree === true || eventForm.isFree === 'true'}
                    onChange={() => setEventForm((prev) => ({ ...prev, isFree: true, price: '' }))}
                  />
                  <span>Gratis</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="isFreeRadio"
                    checked={eventForm.isFree === false || eventForm.isFree === 'false'}
                    onChange={() => setEventForm((prev) => ({ ...prev, isFree: false, price: '25000' }))}
                  />
                  <span>Berbayar</span>
                </label>
              </div>
            </div>
          </div>

          {!eventForm.isFree && (
            <div>
              <label className="block font-medium text-gray-700 mb-1">Harga Tiket / Biaya (Rp)</label>
              <input
                type="number"
                name="price"
                value={eventForm.price}
                onChange={handleEventFormChange}
                placeholder="25000"
                className="w-full p-2.5 rounded-xl border border-gray-200"
              />
            </div>
          )}

          {/* Banner Upload */}
          <div>
            <label className="block font-medium text-gray-700 mb-1">Banner / Poster Kegiatan</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60">
              {eventCoverPreview ? (
                <div className="relative group shrink-0">
                  <img
                    src={eventCoverPreview}
                    alt="Preview Banner"
                    className="w-20 h-14 object-cover rounded-xl border border-gray-200 shadow-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveEventCover}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shadow-sm hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-14 rounded-xl border border-gray-200 bg-white flex flex-col items-center justify-center text-gray-400 shrink-0">
                  <ImageIcon className="w-5 h-5 stroke-[1.5]" />
                  <span className="text-[8px] mt-0.5">Poster</span>
                </div>
              )}

              <div className="flex-1 space-y-1">
                <label
                  htmlFor="add-event-image"
                  className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#075E54] hover:bg-emerald-50 hover:border-emerald-200 font-semibold text-xs shadow-2xs transition-all"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {eventCoverPreview ? 'Ganti Poster' : 'Upload Banner / Poster'}
                </label>
                <input
                  type="file"
                  id="add-event-image"
                  accept="image/*"
                  onChange={handleEventCoverChange}
                  className="hidden"
                />
                <p className="text-[11px] text-gray-500">
                  Format gambar JPG, PNG, atau WebP (maks. 5MB).
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Deskripsi Lengkap Kegiatan *</label>
            <textarea
              name="description"
              value={eventForm.description}
              onChange={handleEventFormChange}
              rows={3}
              placeholder="Tuliskan tujuan kegiatan, narasumber/pembicara, dan detail acara..."
              required
              className="w-full p-2.5 rounded-xl border border-gray-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddEventModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmittingEvent}>
              Publikasikan Kegiatan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
