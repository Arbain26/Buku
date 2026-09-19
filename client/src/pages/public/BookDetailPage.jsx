import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  BookOpen,
  MapPin,
  Heart,
  Share2,
  Store,
  Landmark,
  MessageCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Send,
  ShoppingBag,
  ExternalLink,
  ArrowDown,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { bookService, libraryService, orderService } from '../../services/dataServices';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { Rating } from '../../components/common/Rating';
import { Input, Textarea } from '../../components/common/Input';
import { LocationBadge } from '../../components/common/LocationBadge';

export const BookDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

  // WhatsApp Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createdOrderResult, setCreatedOrderResult] = useState(null);

  // Borrow Modal State
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [borrowNotes, setBorrowNotes] = useState('');
  const [isSubmittingBorrow, setIsSubmittingBorrow] = useState(false);

  // Review Form State
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        const res = await bookService.getBookById(id);
        if (res?.data) {
          setBook(res.data);
          setIsFavorited(res.data.isFavorited || false);
        }
      } catch (err) {
        console.error('Failed to fetch book detail:', err);
        showToast('Gagal memuat informasi buku.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  // Pre-fill user information for orders if authenticated
  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerPhone(user.phone || '');
      setCustomerAddress(user.district ? `Kecamatan ${user.district}, Sidrap` : '');
    }
  }, [user]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('Silakan login terlebih dahulu untuk menyimpan favorit.', 'info');
      return;
    }
    try {
      const res = await bookService.toggleFavorite(book.id);
      setIsFavorited(res.data?.isFavorited ?? !isFavorited);
      showToast(res.message || 'Status favorit diperbarui.', 'success');
    } catch {
      showToast('Gagal mengubah status favorit.', 'error');
    }
  };

  // Open Order Modal
  const handleOpenOrderModal = (store) => {
    setSelectedStore(store);
    setOrderQuantity(1);
    setCreatedOrderResult(null);
    setIsOrderModalOpen(true);
  };

  // Submit Order to API (POST /api/orders)
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!selectedStore) return;
    if (!customerName || !customerPhone) {
      showToast('Nama dan nomor telepon/WhatsApp wajib diisi.', 'error');
      return;
    }

    try {
      setIsSubmittingOrder(true);
      const payload = {
        storeId: selectedStore.storeId,
        items: [{ bookId: Number(book.id), quantity: Number(orderQuantity) }],
        customerName,
        customerPhone,
        customerAddress: customerAddress || 'Ambil di Toko / Sesuai Kesepakatan',
        notes: orderNotes,
      };

      const res = await orderService.createOrder(payload);
      if (res?.data) {
        setCreatedOrderResult(res.data);
        showToast('Pesanan berhasil dibuat di sistem!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal membuat pesanan buku.';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Follow-up to WhatsApp
  const handleContinueWhatsApp = async () => {
    if (!createdOrderResult) return;
    try {
      // Mark as contacted in backend
      await orderService.contactWhatsapp(createdOrderResult.order.id);
    } catch (err) {
      console.warn('Could not mark contacted status:', err);
    }

    // Open WhatsApp link
    if (createdOrderResult.whatsappUrl) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      let finalUrl = createdOrderResult.whatsappUrl;
      if (!isMobile) {
        finalUrl = finalUrl.replace('https://api.whatsapp.com/send', 'https://web.whatsapp.com/send');
      }
      window.open(finalUrl, '_blank');
    }
  };

  // Open Borrow Modal
  const handleOpenBorrowModal = (collection) => {
    if (!isAuthenticated) {
      showToast('Silakan login terlebih dahulu untuk meminjam buku.', 'info');
      return;
    }
    setSelectedCollection(collection);
    setIsBorrowModalOpen(true);
  };

  const handleSubmitBorrow = async (e) => {
    e.preventDefault();
    if (!selectedCollection) return;

    try {
      setIsSubmittingBorrow(true);
      const res = await libraryService.requestBorrow({
        libraryId: selectedCollection.libraryId,
        bookId: book.id,
        collectionId: selectedCollection.collectionId || selectedCollection.libraryCollectionId || selectedCollection.id,
        notes: borrowNotes,
      });
      showToast(res.message || 'Pengajuan peminjaman berhasil dikirim!', 'success');
      setIsBorrowModalOpen(false);
      setBorrowNotes('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengajukan peminjaman.', 'error');
    } finally {
      setIsSubmittingBorrow(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast('Silakan login terlebih dahulu untuk menulis ulasan.', 'info');
      return;
    }
    if (!userComment.trim()) {
      showToast('Silakan tulis ulasan Anda.', 'error');
      return;
    }

    try {
      setIsSubmittingReview(true);
      const res = await bookService.addReview(book.id, {
        rating: userRating,
        comment: userComment,
      });
      showToast(res.message, 'success');
      setUserComment('');

      // Refresh book details
      const refreshed = await bookService.getBookById(book.id);
      if (refreshed?.data) setBook(refreshed.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengirim ulasan.', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const scrollToAvailability = () => {
    const el = document.getElementById('availability-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="w-1/3 h-6" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="lg:col-span-4 h-96 rounded-2xl" />
          <Skeleton className="lg:col-span-5 h-96 rounded-2xl" />
          <Skeleton className="lg:col-span-3 h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-[#17211D]">Buku tidak ditemukan.</h2>
        <Link to="/buku" className="text-[#075E54] font-bold hover:underline inline-block text-sm">
          ← Kembali ke Katalog Buku
        </Link>
      </div>
    );
  }

  const categoryName = typeof book.category === 'string' ? book.category : book.category?.name;
  const authorDisplay = book.author || book.authorName || 'Penulis Sidrap';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Buku', link: '/buku' },
          { label: book.title },
        ]}
      />

      {/* Main Book Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Col 1: Large Cover Preview (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E2E8E5] p-4 shadow-sm">
            <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#E8F3EF] relative shadow-inner">
              <ImageWithFallback
                src={book.coverImage}
                alt={book.title}
                fallbackText={book.title}
                fallbackIcon={BookOpen}
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleToggleFavorite}
                className={`absolute top-3 right-3 p-2.5 rounded-full shadow-md backdrop-blur-xs transition-transform active:scale-90 ${
                  isFavorited
                    ? 'bg-red-50 text-red-600'
                    : 'bg-white/85 text-gray-600 hover:text-red-500'
                }`}
                title={isFavorited ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                aria-label="Simpan ke favorit"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-600 text-red-600' : ''}`} />
              </button>
            </div>
          </div>

          <Button
            size="lg"
            onClick={scrollToAvailability}
            className="w-full bg-[#075E54] text-white hover:bg-[#05473F] font-bold shadow-sm gap-2"
          >
            <ArrowDown className="w-4 h-4" /> Cari Buku Ini (Ketersediaan)
          </Button>
        </div>

        {/* Col 2: Book Info (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#E8F3EF] text-[#075E54] border border-[#cbe1d7] mb-2">
              {categoryName || 'Umum'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211D] tracking-tight leading-snug">
              {book.title}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-[#66736D] mt-1">
              Penulis: <span className="text-[#075E54]">{authorDisplay}</span>
            </p>

            {/* Rating Display */}
            <div className="mt-2.5 flex items-center gap-2">
              <Rating
                value={book.rating > 0 ? book.rating : 4.8}
                reviewsCount={book.reviews?.length || 0}
                size="sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-[#E2E8E5] pt-4">
            <h3 className="text-xs font-bold text-[#66736D] uppercase tracking-wider mb-2">
              Sinopsis & Deskripsi
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-[#17211D]/80 whitespace-pre-line">
              {book.description || 'Tidak ada deskripsi rinci untuk buku ini.'}
            </p>
          </div>

          {/* Detailed Metadata Spec Table */}
          <div className="bg-[#F8FAF8] rounded-2xl p-4 border border-[#E2E8E5] text-xs space-y-2.5">
            <h4 className="font-bold text-[#17211D] text-xs uppercase tracking-wider mb-1">
              Informasi Detail Buku
            </h4>
            <div className="grid grid-cols-3 gap-2 border-b border-gray-200/60 pb-2">
              <span className="text-[#66736D]">Penerbit</span>
              <span className="col-span-2 font-semibold text-[#17211D]">{book.publisher || 'Penerbit Nasional'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-gray-200/60 pb-2">
              <span className="text-[#66736D]">Tahun Terbit</span>
              <span className="col-span-2 font-semibold text-[#17211D]">{book.publishYear || '2021'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-gray-200/60 pb-2">
              <span className="text-[#66736D]">ISBN</span>
              <span className="col-span-2 font-semibold text-[#17211D]">{book.isbn || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 border-b border-gray-200/60 pb-2">
              <span className="text-[#66736D]">Jumlah Halaman</span>
              <span className="col-span-2 font-semibold text-[#17211D]">{book.pages ? `${book.pages} halaman` : '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-[#66736D]">Bahasa</span>
              <span className="col-span-2 font-semibold text-[#17211D]">{book.language || 'Bahasa Indonesia'}</span>
            </div>
          </div>
        </div>

        {/* Col 3: Availability Section ("Tersedia di Toko" & "Tersedia di Perpustakaan") */}
        <div id="availability-section" className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E2E8E5] p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-base text-[#17211D] border-b border-gray-100 pb-3 flex items-center justify-between">
              <span>Ketersediaan di Sidrap</span>
            </h3>

            {/* 1. Toko Buku Section */}
            <div className="space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#075E54] block">
                Tersedia di Toko Buku
              </span>

              {((book.availableStores && book.availableStores.length > 0) || (book.stores && book.stores.length > 0)) ? (
                (book.availableStores || book.stores).map((store) => (
                  <div
                    key={store.storeId || store.productId || store.id}
                    className="p-3.5 rounded-2xl border border-[#cbe1d7] bg-[#E8F3EF]/40 space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white text-[#075E54] flex items-center justify-center shrink-0 border border-[#cbe1d7] shadow-2xs">
                        <Store className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-[#17211D] truncate">
                          {store.storeName || store.name || 'Toko Buku Mitra'}
                        </h4>
                        <p className="text-[11px] text-[#66736D]">
                          {store.district ? `Kec. ${store.district}, Sidrap` : 'Kab. Sidrap'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-sm font-extrabold text-[#075E54]">
                        Rp {Number(store.price).toLocaleString('id-ID')}
                      </span>
                      <span className="text-[11px] text-[#66736D] font-medium">
                        Stok {store.stock} eks
                      </span>
                    </div>

                    {/* WhatsApp Ordering Flow CTA */}
                    <Button
                      size="sm"
                      onClick={() => handleOpenOrderModal(store)}
                      className="w-full bg-[#075E54] text-white hover:bg-[#05473F] text-xs font-bold gap-1.5 shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4" /> Pesan via WhatsApp
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#66736D] bg-gray-50 p-2.5 rounded-xl">
                  Belum tersedia di toko buku mitra saat ini.
                </p>
              )}
            </div>

            {/* 2. Perpustakaan Section */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0F766E] block">
                Tersedia di Perpustakaan
              </span>

              {((book.availableLibraries && book.availableLibraries.length > 0) || (book.libraries && book.libraries.length > 0)) ? (
                (book.availableLibraries || book.libraries).map((lib) => (
                  <div
                    key={lib.libraryCollectionId || lib.collectionId || lib.id}
                    className="p-3.5 rounded-2xl border border-teal-200 bg-teal-50/40 space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-white text-[#0F766E] flex items-center justify-center shrink-0 border border-teal-200 shadow-2xs">
                        <Landmark className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-[#17211D] truncate">
                          {lib.libraryName || lib.name || 'Perpustakaan Daerah'}
                        </h4>
                        <p className="text-[11px] text-[#66736D]">
                          {lib.district ? `Kec. ${lib.district}, Sidrap` : 'Kab. Sidrap'}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#66736D] space-y-0.5">
                      <p className="flex items-center gap-1 text-[#075E54] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tersedia {lib.availableStock ?? lib.availableQuantity ?? 1} eksemplar
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        Peminjaman publik gratis selama 7 - 14 hari
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs font-bold border-[#0F766E] text-[#0F766E] hover:bg-[#E8F3EF]"
                      onClick={() => handleOpenBorrowModal(lib)}
                    >
                      Ajukan Peminjaman
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#66736D] bg-gray-50 p-2.5 rounded-xl">
                  Belum ada koleksi perpustakaan terdaftar untuk buku ini.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reader Reviews Section */}
      <section className="border-t border-[#E2E8E5] pt-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-[#17211D]">Ulasan Pembaca</h3>
            <p className="text-xs text-[#66736D]">
              Ulasan dan tanggapan nyata dari para pembaca di Sidrap
            </p>
          </div>
        </div>

        {/* Existing reviews cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {book.reviews && book.reviews.length > 0 ? (
            book.reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-4 border border-[#E2E8E5] shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={rev.user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-[#17211D]">{rev.user?.name}</h4>
                      <p className="text-[10px] text-[#66736D]">{rev.user?.district ? `Kec. ${rev.user.district}` : 'Sidrap'}</p>
                    </div>
                  </div>

                  <Rating value={rev.rating} size="xs" />
                </div>
                <p className="text-xs text-[#17211D]/80 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-[#66736D] col-span-2 py-4 text-center bg-white rounded-2xl border border-[#E2E8E5]">
              Belum ada ulasan untuk buku ini. Jadilah yang pertama memberikan ulasan!
            </p>
          )}
        </div>

        {/* Add Review Form */}
        <div className="bg-[#F8FAF8] rounded-2xl p-5 border border-[#E2E8E5] max-w-xl">
          <h4 className="text-sm font-bold text-[#17211D] mb-1">
            Tulis Ulasan Anda
          </h4>
          <p className="text-xs text-[#66736D] mb-4">
            Bantu pembaca lain di Sidrap menemukan buku yang tepat (+10 XP)
          </p>

          <form onSubmit={handleAddReview} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#17211D] mb-1">
                Beri Nilai (Rating)
              </label>
              <Rating
                value={userRating}
                interactive={true}
                size="md"
                onChange={setUserRating}
              />
            </div>

            <div>
              <Textarea
                label="Komentar / Ulasan Anda"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Bagikan pendapat Anda tentang buku ini..."
                rows={3}
                required
              />
            </div>

            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingReview}
              className="bg-[#075E54] text-white font-bold"
            >
              <Send className="w-3.5 h-3.5 mr-1" /> Kirim Ulasan
            </Button>
          </form>
        </div>
      </section>

      {/* WHATSAPP ORDER MODAL FLOW (SECTION 40) */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setCreatedOrderResult(null);
        }}
        title={createdOrderResult ? 'Ringkasan Pesanan Buku' : 'Pesan Buku via WhatsApp'}
        maxWidth="max-w-lg"
      >
        {!createdOrderResult ? (
          <form onSubmit={handleSubmitOrder} className="space-y-4 py-2">
            <div className="p-3.5 rounded-2xl bg-[#E8F3EF] border border-[#cbe1d7] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#075E54]">{book.title}</p>
                <p className="text-[11px] text-[#66736D]">Toko: {selectedStore?.storeName}</p>
              </div>
              <p className="text-sm font-extrabold text-[#075E54]">
                Rp {selectedStore?.price?.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Jumlah (Eks) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedStore?.stock || 10}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-[#E2E8E5] focus:ring-2 focus:ring-[#075E54]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Estimasi Total
                </label>
                <div className="px-3.5 py-2 rounded-xl text-sm font-bold bg-gray-50 border border-[#E2E8E5] text-[#075E54]">
                  Rp {((selectedStore?.price || 0) * orderQuantity).toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <Input
              label="Nama Pemesan *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Andi Muhammad"
              required
            />

            <Input
              label="Nomor WhatsApp Pemesan *"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              required
            />

            <Input
              label="Alamat Pengiriman / Catatan Pengambilan"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Contoh: Ambil di Toko / Jl. Poros Sidrap No. 10"
            />

            <Textarea
              label="Catatan Tambahan (Opsional)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Contoh: Mohon disampul plastik bening"
              rows={2}
            />

            <div className="pt-3 border-t border-[#E2E8E5] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOrderModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmittingOrder}
                className="bg-[#075E54] text-white font-bold"
              >
                Buat Pesanan
              </Button>
            </div>
          </form>
        ) : (
          /* ORDER SUMMARY RECEIPT & WHATSAPP REDIRECT */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-[#E8F3EF] border border-[#cbe1d7] text-center space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#075E54] text-white uppercase tracking-wider mb-1">
                Pesanan Terdaftar
              </span>
              <h4 className="text-base font-extrabold text-[#075E54]">
                Order #{createdOrderResult.order?.orderNumber}
              </h4>
              <p className="text-xs text-[#17211D]">
                Total Pesanan:{' '}
                <strong>
                  Rp {createdOrderResult.totalAmount?.toLocaleString('id-ID')}
                </strong>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-700" /> Informasi Alur WhatsApp:
              </p>
              <p>
                Nomor pesanan resmi telah dibuat di platform MABBACA. Transaksi pembayaran dan konfirmasi pengiriman akan Anda lanjutkan langsung dengan admin toko melalui chat WhatsApp resmi.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E2E8E5] flex flex-col gap-2">
              <Button
                size="lg"
                onClick={handleContinueWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold gap-2 shadow-sm"
              >
                <MessageCircle className="w-5 h-5" /> Lanjut ke WhatsApp
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOrderModalOpen(false)}
                className="w-full border-[#E2E8E5]"
              >
                Tutup Ringkasan
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* BORROW MODAL */}
      <Modal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        title="Ajukan Peminjaman Buku Perpustakaan"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitBorrow} className="space-y-4 py-2">
          <div className="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs">
            <p className="font-bold text-[#0F766E]">{book.title}</p>
            <p className="text-gray-600 mt-0.5">
              Perpustakaan: <strong>{selectedCollection?.libraryName}</strong>
            </p>
          </div>

          <p className="text-xs text-[#66736D] leading-relaxed">
            Peminjaman akan diverifikasi oleh petugas perpustakaan. Setelah disetujui, Anda dapat mengambil fisik buku di lokasi perpustakaan terkait.
          </p>

          <Textarea
            label="Catatan Tambahan (Opsional)"
            value={borrowNotes}
            onChange={(e) => setBorrowNotes(e.target.value)}
            placeholder="Contoh: Digunakan untuk keperluan riset sekolah"
            rows={3}
          />

          <div className="pt-3 border-t border-[#E2E8E5] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsBorrowModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingBorrow}
              className="bg-[#0F766E] text-white font-bold"
            >
              Kirim Pengajuan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
