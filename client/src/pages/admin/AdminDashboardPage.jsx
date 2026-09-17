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
  ShoppingBag,
  BookMarked,
  Plus,
  MessageCircle,
  Upload,
  Image as ImageIcon,
  X,
  ExternalLink,
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
import { adminService, bookService, eventService, articleService } from '../../services/dataServices';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ImageWithFallback, resolveImageUrl } from '../../components/common/ImageWithFallback';

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

const ORDER_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Semua Status Pesanan' },
  { value: 'PENDING', label: 'Menunggu Konfirmasi (Pending)' },
  { value: 'CONTACTED', label: 'Dihubungi via WA' },
  { value: 'CONFIRMED', label: 'Pesanan Dikonfirmasi' },
  { value: 'COMPLETED', label: 'Pesanan Selesai' },
  { value: 'CANCELLED', label: 'Dibatalkan' },
];

const BORROW_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Semua Status Peminjaman' },
  { value: 'PENDING', label: 'Menunggu Persetujuan' },
  { value: 'APPROVED', label: 'Disetujui Siap Diambil' },
  { value: 'BORROWED', label: 'Sedang Dipinjam' },
  { value: 'RETURNED', label: 'Telah Dikembalikan' },
  { value: 'REJECTED', label: 'Permohonan Ditolak' },
  { value: 'OVERDUE', label: 'Terlambat / Jatuh Tempo' },
];

const formatRupiah = (num) => 'Rp ' + Number(num || 0).toLocaleString('id-ID');

export const AdminDashboardPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview'; // overview, verifikasi, literasi-stats, users, books, orders, borrowings

  const { showToast } = useToast();

  const [dashboardData, setDashboardData] = useState(null);
  const [pendingMitra, setPendingMitra] = useState([]);
  const [literacyStats, setLiteracyStats] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [booksList, setBooksList] = useState([]);
  const [eventsList, setEventsList] = useState([]);
  const [articlesList, setArticlesList] = useState([]);
  const [articleCategoriesList, setArticleCategoriesList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [borrowingsList, setBorrowingsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [borrowStatusFilter, setBorrowStatusFilter] = useState('ALL');

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

  // Delete User/Mitra Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  // Book CRUD Modal State
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookModalMode, setBookModalMode] = useState('create'); // 'create' | 'edit'
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookFormData, setBookFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    isbn: '',
    publishYear: '2024',
    pages: '200',
    language: 'Bahasa Indonesia',
    categoryId: '1',
    description: '',
    coverImage: '',
  });
  const [bookCoverFile, setBookCoverFile] = useState(null);
  const [bookCoverPreview, setBookCoverPreview] = useState('');
  const [isSubmittingBook, setIsSubmittingBook] = useState(false);

  // Delete Book Modal State
  const [deleteBookModalOpen, setDeleteBookModalOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);
  const [isSubmittingDeleteBook, setIsSubmittingDeleteBook] = useState(false);

  // Order Status Modal State
  const [orderStatusModalOpen, setOrderStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newOrderStatus, setNewOrderStatus] = useState('CONFIRMED');
  const [isSubmittingOrderStatus, setIsSubmittingOrderStatus] = useState(false);

  // Delete Order Modal State
  const [deleteOrderModalOpen, setDeleteOrderModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isSubmittingDeleteOrder, setIsSubmittingDeleteOrder] = useState(false);

  // Borrowing Status Modal State
  const [borrowingStatusModalOpen, setBorrowingStatusModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState(null);
  const [newBorrowingStatus, setNewBorrowingStatus] = useState('APPROVED');
  const [borrowingNotes, setBorrowingNotes] = useState('');
  const [isSubmittingBorrowingStatus, setIsSubmittingBorrowingStatus] = useState(false);

  // Delete Borrowing Modal State
  const [deleteBorrowingModalOpen, setDeleteBorrowingModalOpen] = useState(false);
  const [borrowingToDelete, setBorrowingToDelete] = useState(null);
  const [isSubmittingDeleteBorrowing, setIsSubmittingDeleteBorrowing] = useState(false);

  // Event CRUD State
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventFormData, setEventFormData] = useState({
    title: '',
    category: 'BEDAH_BUKU',
    eventDate: '',
    startTime: '09:00',
    endTime: '12:00',
    location: '',
    district: 'Pangkajene',
    audience: 'UMUM',
    capacity: 50,
    isFree: true,
    price: 0,
    description: '',
    organizerMitraId: '',
  });
  const [eventPosterFile, setEventPosterFile] = useState(null);
  const [eventPosterPreview, setEventPosterPreview] = useState('');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [deleteEventModalOpen, setDeleteEventModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [isSubmittingDeleteEvent, setIsSubmittingDeleteEvent] = useState(false);

  // Article CRUD State
  const [articleModalOpen, setArticleModalOpen] = useState(false);
  const [articleFormData, setArticleFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    readingTime: 5,
    categoryId: '',
  });
  const [articleThumbnailFile, setArticleThumbnailFile] = useState(null);
  const [articleThumbnailPreview, setArticleThumbnailPreview] = useState('');
  const [isSubmittingArticle, setIsSubmittingArticle] = useState(false);
  const [deleteArticleModalOpen, setDeleteArticleModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
  const [isSubmittingDeleteArticle, setIsSubmittingDeleteArticle] = useState(false);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      const [dashRes, pendingRes, statsRes, usersRes, booksRes, eventsRes, ordersRes, borrowingsRes, categoriesRes, articlesRes, artCatsRes] = await Promise.all([
        adminService.getDashboard().catch(() => null),
        adminService.getPendingMitra().catch(() => null),
        adminService.getLiteracyStats().catch(() => null),
        adminService.getAllUsers({ limit: 200 }).catch(() => null),
        adminService.getBooks({ limit: 200 }).catch(() => null),
        adminService.getEvents().catch(() => null),
        adminService.getOrders({ limit: 200 }).catch(() => null),
        adminService.getBorrowings({ limit: 200 }).catch(() => null),
        adminService.getCategories().catch(() => null),
        adminService.getArticles({ limit: 100 }).catch(() => null),
        articleService.getCategories().catch(() => null),
      ]);

      if (dashRes?.data) setDashboardData(dashRes.data);
      if (pendingRes?.data) setPendingMitra(pendingRes.data);
      if (statsRes?.data?.districtStats || statsRes?.data) {
        setLiteracyStats(statsRes.data.districtStats || statsRes.data);
      }
      if (usersRes?.data) setUsersList(usersRes.data);
      if (booksRes?.data) setBooksList(booksRes.data);
      if (eventsRes?.data) {
        setEventsList(Array.isArray(eventsRes.data) ? eventsRes.data : eventsRes.data.events || []);
      }
      if (articlesRes?.data) {
        setArticlesList(Array.isArray(articlesRes.data) ? articlesRes.data : articlesRes.data.articles || []);
      }
      if (artCatsRes?.data) {
        setArticleCategoriesList(Array.isArray(artCatsRes.data) ? artCatsRes.data : []);
      }
      if (ordersRes?.data) setOrdersList(ordersRes.data);
      if (borrowingsRes?.data) setBorrowingsList(borrowingsRes.data);
      if (categoriesRes?.data) setCategoriesList(categoriesRes.data);
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

  // Book Handlers
  const handleBookCoverChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Ukuran file gambar maksimal 5MB.', 'error');
        return;
      }
      setBookCoverFile(file);
      setBookCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveBookCover = () => {
    setBookCoverFile(null);
    setBookCoverPreview('');
    setBookFormData((prev) => ({ ...prev, coverImage: '' }));
  };

  const handleOpenAddBook = () => {
    setBookModalMode('create');
    setSelectedBook(null);
    setBookCoverFile(null);
    setBookCoverPreview('');
    setBookFormData({
      title: '',
      author: '',
      publisher: '',
      isbn: '',
      publishYear: '2024',
      pages: '200',
      language: 'Bahasa Indonesia',
      categoryId: categoriesList[0]?.id ? String(categoriesList[0].id) : '1',
      description: '',
      coverImage: '',
    });
    setBookModalOpen(true);
  };

  const handleOpenEditBook = (b) => {
    setBookModalMode('edit');
    setSelectedBook(b);
    setBookCoverFile(null);
    setBookCoverPreview(b.coverImage ? resolveImageUrl(b.coverImage) : '');
    setBookFormData({
      title: b.title || '',
      author: b.author || '',
      publisher: b.publisher || '',
      isbn: b.isbn || '',
      publishYear: b.publishYear ? String(b.publishYear) : '2024',
      pages: b.pages ? String(b.pages) : '200',
      language: b.language || 'Bahasa Indonesia',
      categoryId: b.categoryId ? String(b.categoryId) : '1',
      description: b.description || '',
      coverImage: b.coverImage || '',
    });
    setBookModalOpen(true);
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!bookFormData.title.trim() || !bookFormData.author.trim() || !bookFormData.description.trim()) {
      showToast('Judul, penulis, dan deskripsi buku wajib diisi.', 'error');
      return;
    }

    try {
      setIsSubmittingBook(true);
      const fd = new FormData();
      Object.keys(bookFormData).forEach((key) => {
        if (bookFormData[key] !== null && bookFormData[key] !== undefined) {
          fd.append(key, bookFormData[key]);
        }
      });
      if (bookCoverFile) {
        fd.append('coverImage', bookCoverFile);
      }

      if (bookModalMode === 'create') {
        const res = await adminService.createBook(fd);
        showToast(res.message || 'Buku baru berhasil ditambahkan ke katalog!', 'success');
      } else {
        const res = await adminService.updateBook(selectedBook.id, fd);
        showToast(res.message || 'Katalog buku berhasil diperbarui!', 'success');
      }
      setBookModalOpen(false);
      setBookCoverFile(null);
      setBookCoverPreview('');
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menyimpan data buku.', 'error');
    } finally {
      setIsSubmittingBook(false);
    }
  };

  const handleOpenDeleteBook = (b) => {
    setBookToDelete(b);
    setDeleteBookModalOpen(true);
  };

  const handleConfirmDeleteBook = async () => {
    if (!bookToDelete) return;
    try {
      setIsSubmittingDeleteBook(true);
      const res = await adminService.deleteBook(bookToDelete.id);
      showToast(res.message || 'Buku berhasil dihapus dari katalog.', 'success');
      setDeleteBookModalOpen(false);
      setBookToDelete(null);
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus buku.', 'error');
    } finally {
      setIsSubmittingDeleteBook(false);
    }
  };

  // Order Handlers
  const handleOpenUpdateOrderStatus = (order) => {
    setSelectedOrder(order);
    setNewOrderStatus(order.status || 'CONFIRMED');
    setOrderStatusModalOpen(true);
  };

  const handleSaveOrderStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setIsSubmittingOrderStatus(true);
      const res = await adminService.updateOrderStatus(selectedOrder.id, newOrderStatus);
      showToast(res.message || `Status pesanan #${selectedOrder.orderNumber} berhasil diubah!`, 'success');
      setOrderStatusModalOpen(false);
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui status pesanan.', 'error');
    } finally {
      setIsSubmittingOrderStatus(false);
    }
  };

  const handleOpenDeleteOrder = (order) => {
    setOrderToDelete(order);
    setDeleteOrderModalOpen(true);
  };

  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    try {
      setIsSubmittingDeleteOrder(true);
      const res = await adminService.deleteOrder(orderToDelete.id);
      showToast(res.message || 'Pesanan berhasil dihapus.', 'success');
      setDeleteOrderModalOpen(false);
      setOrderToDelete(null);
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus pesanan.', 'error');
    } finally {
      setIsSubmittingDeleteOrder(false);
    }
  };

  // Borrowing Handlers
  const handleOpenUpdateBorrowingStatus = (borrowing) => {
    setSelectedBorrowing(borrowing);
    setNewBorrowingStatus(borrowing.status || 'APPROVED');
    setBorrowingNotes(borrowing.notes || '');
    setBorrowingStatusModalOpen(true);
  };

  const handleSaveBorrowingStatus = async (e) => {
    e.preventDefault();
    if (!selectedBorrowing) return;
    try {
      setIsSubmittingBorrowingStatus(true);
      const res = await adminService.updateBorrowingStatus(selectedBorrowing.id, newBorrowingStatus, borrowingNotes);
      showToast(res.message || 'Status peminjaman berhasil diperbarui!', 'success');
      setBorrowingStatusModalOpen(false);
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui status peminjaman.', 'error');
    } finally {
      setIsSubmittingBorrowingStatus(false);
    }
  };

  const handleOpenDeleteBorrowing = (borrowing) => {
    setBorrowingToDelete(borrowing);
    setDeleteBorrowingModalOpen(true);
  };

  const handleConfirmDeleteBorrowing = async () => {
    if (!borrowingToDelete) return;
    try {
      setIsSubmittingDeleteBorrowing(true);
      const res = await adminService.deleteBorrowing(borrowingToDelete.id);
      showToast(res.message || 'Data peminjaman berhasil dihapus.', 'success');
      setDeleteBorrowingModalOpen(false);
      setBorrowingToDelete(null);
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus data peminjaman.', 'error');
    } finally {
      setIsSubmittingDeleteBorrowing(false);
    }
  };

  // Event handlers
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!eventFormData.title || !eventFormData.eventDate || !eventFormData.location || !eventFormData.description) {
      showToast('Mohon lengkapi data wajib (Judul, Tanggal, Lokasi, Deskripsi)', 'error');
      return;
    }
    try {
      setIsSubmittingEvent(true);
      const fd = new FormData();
      Object.keys(eventFormData).forEach((key) => {
        if (eventFormData[key] !== null && eventFormData[key] !== undefined && eventFormData[key] !== '') {
          fd.append(key, eventFormData[key]);
        }
      });
      if (eventPosterFile) {
        fd.append('image', eventPosterFile);
      }
      const res = await eventService.createEvent(fd);
      if (res?.data) {
        showToast('Event literasi berhasil diterbitkan!', 'success');
        setEventModalOpen(false);
        setEventFormData({
          title: '',
          category: 'BEDAH_BUKU',
          eventDate: '',
          startTime: '09:00',
          endTime: '12:00',
          location: '',
          district: 'Pangkajene',
          audience: 'UMUM',
          capacity: 50,
          isFree: true,
          price: 0,
          description: '',
          organizerMitraId: '',
        });
        setEventPosterFile(null);
        setEventPosterPreview('');
        await fetchAdminData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menerbitkan event literasi', 'error');
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const handleOpenDeleteEvent = (event) => {
    setEventToDelete(event);
    setDeleteEventModalOpen(true);
  };

  const handleConfirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    try {
      setIsSubmittingDeleteEvent(true);
      await eventService.deleteEvent(eventToDelete.id);
      showToast('Event literasi berhasil dihapus', 'success');
      setDeleteEventModalOpen(false);
      setEventToDelete(null);
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus event', 'error');
    } finally {
      setIsSubmittingDeleteEvent(false);
    }
  };

  // Article handlers
  const handleCreateArticle = async (e) => {
    e.preventDefault();
    if (!articleFormData.title || !articleFormData.excerpt || !articleFormData.content) {
      showToast('Mohon lengkapi Judul, Ringkasan, dan Konten artikel', 'error');
      return;
    }
    try {
      setIsSubmittingArticle(true);
      const fd = new FormData();
      fd.append('title', articleFormData.title);
      fd.append('excerpt', articleFormData.excerpt);
      fd.append('content', articleFormData.content);
      fd.append('readingTime', articleFormData.readingTime || 5);
      if (articleFormData.categoryId) {
        fd.append('categoryId', articleFormData.categoryId);
      }
      if (articleThumbnailFile) {
        fd.append('thumbnail', articleThumbnailFile);
      }
      const res = await articleService.createArticle(fd);
      if (res?.data) {
        showToast('Artikel Baca 5 Menit berhasil diterbitkan!', 'success');
        setArticleModalOpen(false);
        setArticleFormData({
          title: '',
          excerpt: '',
          content: '',
          readingTime: 5,
          categoryId: '',
        });
        setArticleThumbnailFile(null);
        setArticleThumbnailPreview('');
        await fetchAdminData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menerbitkan artikel', 'error');
    } finally {
      setIsSubmittingArticle(false);
    }
  };

  const handleOpenDeleteArticle = (art) => {
    setArticleToDelete(art);
    setDeleteArticleModalOpen(true);
  };

  const handleConfirmDeleteArticle = async () => {
    if (!articleToDelete) return;
    try {
      setIsSubmittingDeleteArticle(true);
      await articleService.deleteArticle(articleToDelete.id);
      showToast('Artikel berhasil dihapus', 'success');
      setDeleteArticleModalOpen(false);
      setArticleToDelete(null);
      await fetchAdminData();
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal menghapus artikel', 'error');
    } finally {
      setIsSubmittingDeleteArticle(false);
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
  const filteredBooks = booksList.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.publisher?.toLowerCase().includes(q) ||
      b.isbn?.toLowerCase().includes(q)
    );
  });

  // Filtered orders
  const filteredOrders = ordersList.filter((ord) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      ord.orderNumber?.toLowerCase().includes(q) ||
      ord.customerName?.toLowerCase().includes(q) ||
      ord.customerPhone?.toLowerCase().includes(q) ||
      ord.store?.name?.toLowerCase().includes(q);
    const matchStatus = orderStatusFilter === 'ALL' || ord.status === orderStatusFilter;
    return matchSearch && matchStatus;
  });

  // Filtered borrowings
  const filteredBorrowings = borrowingsList.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      b.user?.name?.toLowerCase().includes(q) ||
      b.user?.email?.toLowerCase().includes(q) ||
      b.user?.phone?.toLowerCase().includes(q) ||
      b.book?.title?.toLowerCase().includes(q) ||
      b.library?.name?.toLowerCase().includes(q);
    const matchStatus = borrowStatusFilter === 'ALL' || b.status === borrowStatusFilter;
    return matchSearch && matchStatus;
  });

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

        <div
          onClick={() => setSearchParams({ tab: 'events' })}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            currentTab === 'events'
              ? 'bg-indigo-50/60 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
              : 'bg-white border-[#E5E7EB] hover:border-indigo-400 hover:shadow-xs'
          }`}
          title="Klik untuk mengelola Agenda Event Literasi"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span className="font-semibold text-indigo-950">Event Literasi</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalEvents || eventsList.length || 0}</p>
          <span className="text-[11px] text-indigo-600 font-semibold flex items-center gap-0.5">
            Agenda Terdaftar <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        <div
          onClick={() => setSearchParams({ tab: 'articles' })}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            currentTab === 'articles'
              ? 'bg-amber-50/60 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
              : 'bg-white border-[#E5E7EB] hover:border-amber-400 hover:shadow-xs'
          }`}
          title="Klik untuk mengelola Artikel Baca 5 Menit"
        >
          <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
            <span className="font-semibold text-amber-950">Baca 5 Menit</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-[#17211D]">{counts?.totalArticles || articlesList.length || 0}</p>
          <span className="text-[11px] text-amber-600 font-semibold flex items-center gap-0.5">
            Artikel Edukasi <ChevronRight className="w-3 h-3" />
          </span>
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

        <button
          onClick={() => setSearchParams({ tab: 'events' })}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            currentTab === 'events'
              ? 'border-indigo-600 text-indigo-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-600" />
          Agenda Event ({eventsList.length})
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'articles' })}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            currentTab === 'articles'
              ? 'border-amber-600 text-amber-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-600" />
          Baca 5 Menit ({articlesList.length})
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'orders' })}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            currentTab === 'orders'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          Pesanan Buku ({ordersList.length})
        </button>

        <button
          onClick={() => setSearchParams({ tab: 'borrowings' })}
          className={`px-4 py-2.5 text-xs font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
            currentTab === 'borrowings'
              ? 'border-[#075E54] text-[#075E54]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          Peminjaman ({borrowingsList.length})
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
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari judul / penulis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 p-2 rounded-xl border border-gray-200 text-xs"
              />
              <Button size="sm" variant="primary" onClick={handleOpenAddBook} className="whitespace-nowrap">
                <Plus className="w-3.5 h-3.5 mr-1" /> Tambah Judul Buku
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="p-3">Cover</th>
                  <th className="p-3">Judul Buku</th>
                  <th className="p-3">Penulis & Penerbit</th>
                  <th className="p-3">Kategori</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBooks.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3">
                      <ImageWithFallback
                        src={b.coverImage}
                        alt={b.title}
                        className="w-8 h-11 object-cover rounded-md"
                      />
                    </td>
                    <td className="p-3">
                      <p className="font-bold text-[#17211D]">{b.title}</p>
                      {b.isbn && <p className="text-gray-400 text-[10px]">ISBN: {b.isbn}</p>}
                    </td>
                    <td className="p-3 text-gray-600">
                      <p className="font-medium text-gray-800">{b.author}</p>
                      {b.publisher && <p className="text-gray-400 text-[10px]">{b.publisher}</p>}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px]">
                        {b.category?.name || 'Umum'}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-amber-600 whitespace-nowrap">★ {b.rating || '5.0'}</td>
                    <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditBook(b)}
                        title="Edit Buku"
                        className="px-2.5 py-1 text-xs"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-600 mr-1" /> Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleOpenDeleteBook(b)}
                        title="Hapus Buku"
                        className="px-2.5 py-1 text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 6: PESANAN BUKU (TRANSAKSI TOKO BUKU) */}
      {/* ===================================================================== */}
      {currentTab === 'orders' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Transaksi Pesanan Buku MABBACA</h3>
              <p className="text-xs text-gray-500">
                Semua pesanan buku warga Sidrap dari mitra toko buku lokal via WhatsApp & platform
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari no order / pemesan / toko..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 p-2 rounded-xl border border-gray-200 text-xs"
              />
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="p-2 rounded-xl border border-gray-200 text-xs"
              >
                {ORDER_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">No. Pesanan</th>
                    <th className="p-3">Mitra Toko</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Item Buku</th>
                    <th className="p-3">Total Tagihan</th>
                    <th className="p-3">Tanggal</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-[#075E54]">
                        #{ord.orderNumber}
                      </td>
                      <td className="p-3 font-medium text-gray-800">
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                          <span>{ord.store?.name || 'Toko Buku Sidrap'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-[#17211D]">{ord.customerName}</p>
                        <p className="text-gray-400 text-[11px]">📞 {ord.customerPhone}</p>
                        {ord.customerAddress && (
                          <p className="text-gray-400 text-[10px] truncate max-w-xs">{ord.customerAddress}</p>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs">
                          {ord.items && ord.items.length > 0 ? (
                            ord.items.map((it, idx) => (
                              <p key={idx} className="text-gray-700 text-[11px] truncate">
                                • {it.book?.title || 'Buku'} ({it.quantity}x)
                              </p>
                            ))
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-bold text-[#075E54] whitespace-nowrap">
                        Rp {Number(ord.totalAmount).toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-gray-500 whitespace-nowrap">
                        {new Date(ord.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            ord.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.status === 'CONFIRMED'
                              ? 'bg-blue-100 text-blue-800'
                              : ord.status === 'CONTACTED'
                              ? 'bg-teal-100 text-teal-800'
                              : ord.status === 'CANCELLED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenUpdateOrderStatus(ord)}
                          title="Ubah Status Pesanan"
                          className="px-2.5 py-1 text-xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600 mr-1" /> Status
                        </Button>
                        <a
                          href={`https://wa.me/${ord.customerPhone?.replace(/^0/, '62').replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#075E54] font-semibold text-xs border border-emerald-200 transition-colors"
                          title="Hubungi Pemesan via WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#075E54]" /> WA
                        </a>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleOpenDeleteOrder(ord)}
                          title="Hapus Pesanan"
                          className="px-2.5 py-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={ShoppingBag}
              title="Tidak ada transaksi pesanan"
              description="Belum ada pesanan buku yang sesuai dengan pencarian atau filter status."
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 7: PEMINJAMAN BUKU PERPUSTAKAAN */}
      {/* ===================================================================== */}
      {currentTab === 'borrowings' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Sirkulasi Peminjaman Buku Fisik Perpustakaan</h3>
              <p className="text-xs text-gray-500">
                Peminjaman koleksi buku masyarakat dari Perpustakaan Daerah & Desa se-Kabupaten Sidrap
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari peminjam / buku / perpustakaan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 p-2 rounded-xl border border-gray-200 text-xs"
              />
              <select
                value={borrowStatusFilter}
                onChange={(e) => setBorrowStatusFilter(e.target.value)}
                className="p-2 rounded-xl border border-gray-200 text-xs"
              >
                {BORROW_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredBorrowings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Pemustaka (Peminjam)</th>
                    <th className="p-3">Buku Dipinjam</th>
                    <th className="p-3">Perpustakaan</th>
                    <th className="p-3">Tgl Pinjam</th>
                    <th className="p-3">Jatuh Tempo</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredBorrowings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="p-3 font-mono font-bold text-gray-500">#{b.id}</td>
                      <td className="p-3">
                        <p className="font-bold text-[#17211D]">{b.user?.name || 'Masyarakat'}</p>
                        <p className="text-gray-400 text-[11px]">{b.user?.email || b.user?.phone || '-'}</p>
                      </td>
                      <td className="p-3 font-semibold text-gray-800">
                        {b.book?.title || 'Judul Buku'}
                        {b.quantity > 1 && <span className="text-gray-400 text-[11px] ml-1">({b.quantity} eks)</span>}
                      </td>
                      <td className="p-3 font-medium text-[#0F766E]">
                        <div className="flex items-center gap-1">
                          <Landmark className="w-3.5 h-3.5 shrink-0" />
                          <span>{b.library?.name || 'Perpustakaan Sidrap'}</span>
                        </div>
                      </td>
                      <td className="p-3 text-gray-500 whitespace-nowrap">
                        {new Date(b.requestedAt || b.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="p-3 font-medium text-gray-700 whitespace-nowrap">
                        {b.dueDate ? new Date(b.dueDate).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                            b.status === 'RETURNED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'BORROWED'
                              ? 'bg-blue-100 text-blue-800'
                              : b.status === 'APPROVED'
                              ? 'bg-teal-100 text-teal-800'
                              : b.status === 'OVERDUE'
                              ? 'bg-rose-100 text-rose-800'
                              : b.status === 'REJECTED'
                              ? 'bg-gray-200 text-gray-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenUpdateBorrowingStatus(b)}
                          title="Ubah Status Peminjaman"
                          className="px-2.5 py-1 text-xs"
                        >
                          <Edit className="w-3.5 h-3.5 text-blue-600 mr-1" /> Status
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleOpenDeleteBorrowing(b)}
                          title="Hapus Data Peminjaman"
                          className="px-2.5 py-1 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={BookMarked}
              title="Tidak ada sirkulasi peminjaman"
              description="Belum ada peminjaman buku yang sesuai dengan pencarian atau filter status."
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: AGENDA EVENT LITERASI */}
      {/* ===================================================================== */}
      {currentTab === 'events' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Agenda Event Literasi Sidrap</h3>
              <p className="text-xs text-gray-500">
                Kelola jadwal bedah buku, diskusi literasi, lapak baca, dan festival literasi di seluruh Sidrap
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari judul event / lokasi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 p-2 rounded-xl border border-gray-200 text-xs"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => setEventModalOpen(true)}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-1" />
                Buat Event Literasi
              </Button>
            </div>
          </div>

          {eventsList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Poster</th>
                    <th className="p-3">Judul Kegiatan</th>
                    <th className="p-3">Penyelenggara</th>
                    <th className="p-3">Jadwal & Waktu</th>
                    <th className="p-3">Lokasi / Kecamatan</th>
                    <th className="p-3">Kategori</th>
                    <th className="p-3">Peserta</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {eventsList
                    .filter((ev) =>
                      searchQuery
                        ? ev.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ev.organizer?.organizationName?.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((ev) => (
                      <tr key={ev.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3">
                          <ImageWithFallback
                            src={ev.image}
                            alt={ev.title}
                            className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                          />
                        </td>
                        <td className="p-3">
                          <p className="font-bold text-[#17211D] line-clamp-1">{ev.title}</p>
                          <span className="text-gray-400 text-[10px]">Slug: {ev.slug || '-'}</span>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-[#0F766E]">
                            {ev.organizer?.organizationName || 'Penyelenggara Literasi'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <p className="font-medium text-gray-800">
                            {new Date(ev.eventDate).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-gray-400 text-[10px]">
                            {ev.startTime} - {ev.endTime} WITA
                          </p>
                        </td>
                        <td className="p-3">
                          <p className="font-medium text-gray-800 line-clamp-1">{ev.location}</p>
                          {ev.district && (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 text-[10px]">
                              {ev.district}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-[10px]">
                            {ev.category?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="font-bold text-[#17211D]">
                            {ev._count?.participants ?? ev.registeredCount ?? 0}
                          </span>
                          <span className="text-gray-400 text-[10px]"> / {ev.capacity || '∞'} org</span>
                        </td>
                        <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                          <Link
                            to={`/event/${ev.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
                            title="Lihat di Web Utama"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1 text-teal-700" /> Lihat
                          </Link>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleOpenDeleteEvent(ev)}
                            title="Hapus Event"
                            className="px-2.5 py-1 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="Belum ada agenda event literasi"
              description="Klik tombol 'Buat Event Literasi' untuk menambahkan jadwal kegiatan baru."
            />
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB: BACA 5 MENIT (ARTIKEL EDUKASI) */}
      {/* ===================================================================== */}
      {currentTab === 'articles' && (
        <div className="bg-white p-6 rounded-3xl border border-[#E5E7EB] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-[#17211D]">Artikel Edukasi "Baca 5 Menit"</h3>
              <p className="text-xs text-gray-500">
                Publikasikan artikel literasi ringkas, tips membaca, kearifan lokal, dan wawasan Sidrap
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Cari artikel / topik..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 p-2 rounded-xl border border-gray-200 text-xs"
              />
              <Button
                variant="primary"
                size="sm"
                onClick={() => setArticleModalOpen(true)}
                className="whitespace-nowrap bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Tulis Artikel Baru
              </Button>
            </div>
          </div>

          {articlesList.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Cover</th>
                    <th className="p-3">Judul Artikel & Ringkasan</th>
                    <th className="p-3">Kategori Topik</th>
                    <th className="p-3">Estimasi Baca</th>
                    <th className="p-3">Penulis</th>
                    <th className="p-3">Tanggal Terbit</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articlesList
                    .filter((art) =>
                      searchQuery
                        ? art.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          art.category?.toLowerCase().includes(searchQuery.toLowerCase())
                        : true
                    )
                    .map((art) => (
                      <tr key={art.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3">
                          <ImageWithFallback
                            src={art.thumbnail}
                            alt={art.title}
                            className="w-12 h-9 object-cover rounded-lg border border-gray-100"
                          />
                        </td>
                        <td className="p-3 max-w-xs">
                          <p className="font-bold text-[#17211D] line-clamp-1">{art.title}</p>
                          <p className="text-gray-400 text-[11px] line-clamp-1">{art.excerpt}</p>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold text-[10px]">
                            {art.category || (art.categories && art.categories[0]?.category?.name) || 'Umum'}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 font-medium text-gray-700 text-[11px]">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {art.readingTime || 5} menit
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap text-gray-600">
                          {art.author?.name || 'Redaksi MABBACA'}
                        </td>
                        <td className="p-3 whitespace-nowrap text-gray-500">
                          {new Date(art.publishedAt || art.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap space-x-1.5">
                          <Link
                            to={`/baca-5-menit/${art.slug || art.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-2.5 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-100 font-medium text-gray-700"
                            title="Baca Artikel di Web Utama"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1 text-amber-600" /> Baca
                          </Link>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleOpenDeleteArticle(art)}
                            title="Hapus Artikel"
                            className="px-2.5 py-1 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="Belum ada artikel 'Baca 5 Menit'"
              description="Klik tombol 'Tulis Artikel Baru' untuk mempublikasikan artikel edukasi ringkas pertama Anda."
            />
          )}
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

      {/* ===================================================================== */}
      {/* BOOK ADD / EDIT MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        title={bookModalMode === 'create' ? 'Tambah Judul Buku Baru' : 'Edit Data Buku'}
      >
        <form onSubmit={handleSaveBook} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">Judul Buku *</label>
              <input
                type="text"
                required
                value={bookFormData.title}
                onChange={(e) => setBookFormData({ ...bookFormData, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                placeholder="Contoh: Menelusuri Jejak Sejarah Sidrap"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Penulis *</label>
              <input
                type="text"
                required
                value={bookFormData.author}
                onChange={(e) => setBookFormData({ ...bookFormData, author: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                placeholder="Nama Pengarang / Penulis"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Penerbit</label>
              <input
                type="text"
                value={bookFormData.publisher}
                onChange={(e) => setBookFormData({ ...bookFormData, publisher: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                placeholder="Contoh: Balai Pustaka / Kompas Gramedia"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">ISBN</label>
              <input
                type="text"
                value={bookFormData.isbn}
                onChange={(e) => setBookFormData({ ...bookFormData, isbn: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                placeholder="978-602-xxx-xxx-x"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Kategori Buku</label>
              <select
                value={bookFormData.categoryId}
                onChange={(e) => setBookFormData({ ...bookFormData, categoryId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
              >
                {categoriesList && categoriesList.length > 0 ? (
                  categoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="1">Fiksi</option>
                    <option value="2">Non-Fiksi</option>
                    <option value="3">Sejarah & Budaya</option>
                    <option value="4">Pendidikan</option>
                    <option value="5">Sains & Teknologi</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Tahun Terbit</label>
              <input
                type="number"
                value={bookFormData.publishYear}
                onChange={(e) => setBookFormData({ ...bookFormData, publishYear: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                placeholder="2024"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Jumlah Halaman</label>
              <input
                type="number"
                value={bookFormData.pages}
                onChange={(e) => setBookFormData({ ...bookFormData, pages: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                placeholder="200"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">
                Sampul Buku (Cover Image)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 mb-2">
                {bookCoverPreview ? (
                  <div className="relative group shrink-0">
                    <img
                      src={bookCoverPreview}
                      alt="Preview Sampul"
                      className="w-16 h-22 object-cover rounded-xl border border-gray-200 shadow-xs bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveBookCover}
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
                      htmlFor="admin-book-cover-input"
                      className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#075E54] hover:bg-emerald-50 hover:border-emerald-200 font-semibold text-xs shadow-2xs transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {bookCoverPreview ? 'Ganti File Sampul' : 'Upload File Sampul'}
                    </label>
                    <input
                      type="file"
                      id="admin-book-cover-input"
                      accept="image/*"
                      onChange={handleBookCoverChange}
                      className="hidden"
                    />
                    {bookCoverPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveBookCover}
                        className="px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Upload file gambar sampul dari perangkat (JPG, PNG, atau WebP, maks. 5MB), atau masukkan link URL di bawah ini.
                  </p>
                </div>
              </div>

              <input
                type="text"
                value={bookFormData.coverImage}
                onChange={(e) => {
                  setBookFormData({ ...bookFormData, coverImage: e.target.value });
                  if (!bookCoverFile) setBookCoverPreview(e.target.value);
                }}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                placeholder="Atau tempel URL gambar (https://...)"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">Sinopsis / Deskripsi Buku *</label>
              <textarea
                rows={3}
                required
                value={bookFormData.description}
                onChange={(e) => setBookFormData({ ...bookFormData, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
                placeholder="Ringkasan atau sinopsis buku..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBookModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingBook}
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              {bookModalMode === 'create' ? 'Tambahkan ke Katalog' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* DELETE BOOK MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={deleteBookModalOpen}
        onClose={() => setDeleteBookModalOpen(false)}
        title="Hapus Buku dari Katalog"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-red-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              Konfirmasi Penghapusan Buku
            </div>
            <p>
              Apakah Anda yakin ingin menghapus judul buku:
              <br />
              <strong className="text-base text-red-950 font-bold block mt-1">"{bookToDelete?.title}"</strong>
              <span className="text-gray-600">Karya: {bookToDelete?.author}</span>
            </p>
            <p className="text-[11px] text-red-700">
              Perhatian: Buku ini akan dihapus dari katalog utama MABBACA.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteBookModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isSubmittingDeleteBook}
              onClick={handleConfirmDeleteBook}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Ya, Hapus Buku
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* ORDER STATUS MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={orderStatusModalOpen}
        onClose={() => setOrderStatusModalOpen(false)}
        title={`Update Status Pesanan #${selectedOrder?.orderNumber || ''}`}
      >
        <form onSubmit={handleSaveOrderStatus} className="space-y-4 text-xs">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1 text-emerald-950">
            <p><strong>Pembeli:</strong> {selectedOrder?.user?.name} ({selectedOrder?.user?.email})</p>
            <p><strong>Toko Buku Mitra:</strong> {selectedOrder?.store?.name}</p>
            <p><strong>Total Transaksi:</strong> {formatRupiah(selectedOrder?.totalAmount)}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Status Transaksi Pesanan</label>
            <select
              value={newOrderStatus}
              onChange={(e) => setNewOrderStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[#075E54]"
            >
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
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
              <Save className="w-3.5 h-3.5 mr-1" />
              Perbarui Status Pesanan
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* DELETE ORDER MODAL */}
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
              Apakah Anda yakin ingin menghapus data pesanan <strong>#{orderToDelete?.orderNumber}</strong>?
            </p>
            <p className="text-[11px] text-red-700">
              Tindakan ini akan menghapus riwayat transaksi dan rincian item pesanan secara permanen dari database.
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
      {/* BORROWING STATUS MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={borrowingStatusModalOpen}
        onClose={() => setBorrowingStatusModalOpen(false)}
        title="Update Status Sirkulasi Peminjaman"
      >
        <form onSubmit={handleSaveBorrowingStatus} className="space-y-4 text-xs">
          <div className="bg-teal-50 p-3 rounded-xl border border-teal-200 space-y-1 text-teal-950">
            <p><strong>Peminjam:</strong> {selectedBorrowing?.user?.name}</p>
            <p><strong>Buku:</strong> {selectedBorrowing?.collection?.book?.title}</p>
            <p><strong>Perpustakaan:</strong> {selectedBorrowing?.collection?.library?.name}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Status Peminjaman</label>
            <select
              value={newBorrowingStatus}
              onChange={(e) => setNewBorrowingStatus(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-1 focus:ring-[#075E54]"
            >
              {BORROW_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              rows={2}
              value={borrowingNotes}
              onChange={(e) => setBorrowingNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-[#075E54]"
              placeholder="Kondisi buku saat kembali, denda, atau alasan penolakan..."
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBorrowingStatusModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingBorrowingStatus}
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Simpan Status Peminjaman
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* DELETE BORROWING MODAL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={deleteBorrowingModalOpen}
        onClose={() => setDeleteBorrowingModalOpen(false)}
        title="Hapus Data Peminjaman"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-red-800 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-red-900">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              Konfirmasi Hapus Riwayat Peminjaman
            </div>
            <p>
              Apakah Anda yakin ingin menghapus data peminjaman buku:
              <br />
              <strong className="text-red-950 font-bold">"{borrowingToDelete?.collection?.book?.title}"</strong>
              <br />
              Peminjam: <strong>{borrowingToDelete?.user?.name}</strong>
            </p>
            <p className="text-[11px] text-red-700">
              Catatan: Menghapus data ini tidak akan mengubah stok buku yang sudah ada di perpustakaan.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteBorrowingModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isSubmittingDeleteBorrowing}
              onClick={handleConfirmDeleteBorrowing}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Ya, Hapus Peminjaman
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL BUAT EVENT LITERASI */}
      {/* ===================================================================== */}
      <Modal
        isOpen={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        title="Buat Agenda Kegiatan / Event Literasi Baru"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4 text-xs py-1">
          <div className="bg-indigo-50 p-3.5 rounded-2xl border border-indigo-200 text-indigo-900 text-xs">
            <p className="font-bold flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-700" /> Publikasi Agenda Literasi Kabupaten Sidrap
            </p>
            <p className="mt-0.5 text-indigo-700/90 text-[11px]">
              Event yang Anda buat akan langsung dipublikasikan pada halaman beranda MABBACA dan kalender event seluruh warga.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">Judul Agenda Kegiatan *</label>
              <input
                type="text"
                required
                value={eventFormData.title}
                onChange={(e) => setEventFormData({ ...eventFormData, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-indigo-500"
                placeholder="Contoh: Bedah Buku Sejarah Sidenreng Rappang"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Kategori Kegiatan *</label>
              <select
                value={eventFormData.category}
                onChange={(e) => setEventFormData({ ...eventFormData, category: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="BEDAH_BUKU">Bedah Buku</option>
                <option value="DISKUSI">Diskusi Literasi</option>
                <option value="LAPAK_BACA">Lapak Baca Komunitas</option>
                <option value="KELAS_MENULIS">Kelas Menulis</option>
                <option value="PELATIHAN">Pelatihan & Workshop</option>
                <option value="PAMERAN">Pameran Buku</option>
                <option value="FESTIVAL_LITERASI">Festival Literasi</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Mitra Penyelenggara</label>
              <select
                value={eventFormData.organizerMitraId}
                onChange={(e) => setEventFormData({ ...eventFormData, organizerMitraId: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">-- Gunakan Profil Mitra Default / Otomatis --</option>
                {usersList
                  .filter((u) => u.mitraProfile && u.mitraProfile.status === 'APPROVED')
                  .map((u) => (
                    <option key={u.mitraProfile.id} value={u.mitraProfile.id}>
                      {u.mitraProfile.organizationName} ({u.mitraProfile.mitraType})
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Tanggal Kegiatan *</label>
              <input
                type="date"
                required
                value={eventFormData.eventDate}
                onChange={(e) => setEventFormData({ ...eventFormData, eventDate: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Mulai (WITA) *</label>
                <input
                  type="time"
                  required
                  value={eventFormData.startTime}
                  onChange={(e) => setEventFormData({ ...eventFormData, startTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Selesai (WITA) *</label>
                <input
                  type="time"
                  required
                  value={eventFormData.endTime}
                  onChange={(e) => setEventFormData({ ...eventFormData, endTime: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Lokasi Tempat / Venue *</label>
              <input
                type="text"
                required
                value={eventFormData.location}
                onChange={(e) => setEventFormData({ ...eventFormData, location: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-indigo-500"
                placeholder="Contoh: Taman Usman Isa / Aula Dispusip"
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Kecamatan di Sidrap</label>
              <select
                value={eventFormData.district}
                onChange={(e) => setEventFormData({ ...eventFormData, district: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:ring-1 focus:ring-indigo-500"
              >
                {SIDRAP_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    Kecamatan {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Target Peserta</label>
              <select
                value={eventFormData.audience}
                onChange={(e) => setEventFormData({ ...eventFormData, audience: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:ring-1 focus:ring-indigo-500"
              >
                <option value="UMUM">Umum (Semua Umur)</option>
                <option value="ANAK">Anak-anak</option>
                <option value="REMAJA">Remaja & Pelajar</option>
                <option value="DEWASA">Dewasa & Mahasiswa</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Kapasitas (Kuota)</label>
                <input
                  type="number"
                  min="1"
                  value={eventFormData.capacity}
                  onChange={(e) => setEventFormData({ ...eventFormData, capacity: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-1">Biaya</label>
                <select
                  value={eventFormData.isFree ? 'free' : 'paid'}
                  onChange={(e) => setEventFormData({ ...eventFormData, isFree: e.target.value === 'free', price: e.target.value === 'free' ? 0 : eventFormData.price })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="free">Gratis</option>
                  <option value="paid">Berbayar</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">Poster Banner Kegiatan</label>
              <div className="flex items-center gap-3">
                {eventPosterPreview && (
                  <img
                    src={eventPosterPreview}
                    alt="Preview"
                    className="w-14 h-14 object-cover rounded-xl border border-gray-200 shrink-0"
                  />
                )}
                <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-gray-300 hover:border-indigo-400 bg-gray-50 cursor-pointer text-gray-600 text-xs transition-colors">
                  <Upload className="w-4 h-4 text-indigo-600" />
                  <span>{eventPosterFile ? eventPosterFile.name : 'Upload File Poster (JPG, PNG)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEventPosterFile(file);
                        setEventPosterPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-medium text-gray-700 mb-1">Deskripsi & Rundown Kegiatan *</label>
              <textarea
                required
                rows={3}
                value={eventFormData.description}
                onChange={(e) => setEventFormData({ ...eventFormData, description: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-indigo-500"
                placeholder="Rincian acara, pembicara, fasilitas, atau panduan kehadiran..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setEventModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingEvent}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Terbitkan Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL TULIS ARTIKEL BACA 5 MENIT */}
      {/* ===================================================================== */}
      <Modal
        isOpen={articleModalOpen}
        onClose={() => setArticleModalOpen(false)}
        title="Tulis Artikel Edukatif 'Baca 5 Menit' Baru"
      >
        <form onSubmit={handleCreateArticle} className="space-y-4 text-xs py-1">
          <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-amber-900 text-xs">
            <p className="font-bold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-700" /> Gerakan Baca Cepat & Literasi Ringkas
            </p>
            <p className="mt-0.5 text-amber-800/90 text-[11px]">
              Artikel Baca 5 Menit dirancang untuk dinikmati warga dalam waktu singkat, memberi wawasan praktis, dan memberi bonus XP membaca pada akun warga.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Judul Artikel Literasi *</label>
              <input
                type="text"
                required
                value={articleFormData.title}
                onChange={(e) => setArticleFormData({ ...articleFormData, title: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-amber-500"
                placeholder="Contoh: 5 Cara Membangun Kebiasaan Membaca Bagi Pekerja Sibuk"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-gray-700 mb-1">Kategori Topik</label>
                <select
                  value={articleFormData.categoryId}
                  onChange={(e) => setArticleFormData({ ...articleFormData, categoryId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-xs focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">-- Pilih Topik Kategori --</option>
                  {articleCategoriesList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                  {articleCategoriesList.length === 0 && (
                    <>
                      <option value="1">Tips Membaca</option>
                      <option value="2">Kearifan Lokal</option>
                      <option value="3">Teknologi & Literasi</option>
                      <option value="4">Edukasi Anak</option>
                      <option value="5">Ketahanan Pangan</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-medium text-gray-700 mb-1">Estimasi Waktu Baca (Menit)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={articleFormData.readingTime}
                    onChange={(e) => setArticleFormData({ ...articleFormData, readingTime: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-amber-500"
                    placeholder="5"
                  />
                  <span className="text-gray-400 font-medium shrink-0">Menit</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Thumbnail Foto / Cover Artikel</label>
              <div className="flex items-center gap-3">
                {articleThumbnailPreview && (
                  <img
                    src={articleThumbnailPreview}
                    alt="Preview"
                    className="w-16 h-12 object-cover rounded-xl border border-gray-200 shrink-0"
                  />
                )}
                <label className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-gray-300 hover:border-amber-400 bg-gray-50 cursor-pointer text-gray-600 text-xs transition-colors">
                  <Upload className="w-4 h-4 text-amber-600" />
                  <span>{articleThumbnailFile ? articleThumbnailFile.name : 'Pilih Foto Cover Artikel (JPG, PNG)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setArticleThumbnailFile(file);
                        setArticleThumbnailPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Ringkasan / Excerpt Singkat *</label>
              <textarea
                required
                rows={2}
                value={articleFormData.excerpt}
                onChange={(e) => setArticleFormData({ ...articleFormData, excerpt: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-amber-500"
                placeholder="Ringkasan 1-2 kalimat pemikat pembaca untuk tampil di kartu artikel..."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-gray-700">Isi Lengkap Konten Artikel *</label>
                <span className="text-[11px] text-amber-700 font-medium">
                  {articleFormData.content ? articleFormData.content.trim().split(/\s+/).filter(Boolean).length : 0} kata (~
                  {Math.max(1, Math.ceil((articleFormData.content?.trim().split(/\s+/).filter(Boolean).length || 0) / 200))} menit baca)
                </span>
              </div>
              <textarea
                required
                rows={7}
                value={articleFormData.content}
                onChange={(e) => {
                  const newContent = e.target.value;
                  const words = newContent.trim().split(/\s+/).filter(Boolean).length;
                  const estTime = Math.max(1, Math.ceil(words / 200));
                  setArticleFormData({
                    ...articleFormData,
                    content: newContent,
                    readingTime: estTime,
                  });
                }}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-1 focus:ring-amber-500"
                placeholder="Tulis atau tempel naskah artikel literasi secara lengkap di sini..."
              />
              <p className="text-[10px] text-gray-400 mt-1">
                * Standar kalkulasi membaca rata-rata: 200 kata per menit (WPM). Estimasi waktu baca akan otomatis diperbarui.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setArticleModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingArticle}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Save className="w-3.5 h-3.5 mr-1" />
              Terbitkan Artikel
            </Button>
          </div>
        </form>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL HAPUS EVENT */}
      {/* ===================================================================== */}
      <Modal
        isOpen={deleteEventModalOpen}
        onClose={() => setDeleteEventModalOpen(false)}
        title="Konfirmasi Hapus Event Literasi"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-red-900 space-y-2">
            <p className="font-bold text-sm">Apakah Anda yakin ingin menghapus agenda kegiatan ini?</p>
            <p className="text-xs text-red-800">
              Judul Kegiatan: <strong>{eventToDelete?.title}</strong>
            </p>
            <p className="text-[11px] text-red-700">
              Event ini akan ditarik dari halaman publik, beranda, dan daftar kegiatan masyarakat.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteEventModalOpen(false)}>
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
              Ya, Hapus Event
            </Button>
          </div>
        </div>
      </Modal>

      {/* ===================================================================== */}
      {/* MODAL HAPUS ARTIKEL */}
      {/* ===================================================================== */}
      <Modal
        isOpen={deleteArticleModalOpen}
        onClose={() => setDeleteArticleModalOpen(false)}
        title="Konfirmasi Hapus Artikel 'Baca 5 Menit'"
      >
        <div className="space-y-4 text-xs">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-200 text-red-900 space-y-2">
            <p className="font-bold text-sm">Apakah Anda yakin ingin menghapus artikel literasi ini?</p>
            <p className="text-xs text-red-800">
              Judul Artikel: <strong>{articleToDelete?.title}</strong>
            </p>
            <p className="text-[11px] text-red-700">
              Artikel ini akan dihapus dari portal edukasi 'Baca 5 Menit' dan tidak dapat diakses lagi oleh pembaca.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setDeleteArticleModalOpen(false)}>
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              isLoading={isSubmittingDeleteArticle}
              onClick={handleConfirmDeleteArticle}
            >
              <Trash2 className="w-3.5 h-3.5 mr-1" />
              Ya, Hapus Artikel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
