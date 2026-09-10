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
} from 'lucide-react';
import { bookService, libraryService } from '../../services/dataServices';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';

export const BookDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);

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
          setIsFavorited(res.data.isFavorited);
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

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      showToast('Silakan login terlebih dahulu untuk menyimpan favorit.', 'info');
      return;
    }
    try {
      const res = await bookService.toggleFavorite(book.id);
      setIsFavorited(res.data.isFavorited);
      showToast(res.message, 'success');
    } catch {
      showToast('Gagal mengubah status favorit.', 'error');
    }
  };

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
        collectionId: selectedCollection.libraryCollectionId,
        notes: borrowNotes,
      });
      showToast(res.message, 'success');
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="w-1/3 h-5" />
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Buku tidak ditemukan.</h2>
        <Link to="/buku" className="text-[#075E54] font-medium hover:underline mt-2 inline-block">
          ← Kembali ke Katalog Buku
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-[#075E54]">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/buku" className="hover:text-[#075E54]">Buku</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-[#17211D] truncate max-w-xs">{book.title}</span>
      </nav>

      {/* Main Book Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Col 1: Book Cover Image (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E5E7EB] p-4 shadow-sm">
            <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-gray-100 relative shadow-inner">
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleToggleFavorite}
                className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-sm transition-transform active:scale-90 ${
                  isFavorited
                    ? 'bg-red-50 text-red-600 fill-red-600'
                    : 'bg-white/80 text-gray-600 hover:text-red-500'
                }`}
                title={isFavorited ? 'Hapus dari favorit' : 'Simpan ke favorit'}
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-red-600' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Col 2: Book Info (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D] tracking-tight">
              {book.title}
            </h1>
            <p className="text-sm sm:text-base font-medium text-gray-600 mt-1">
              Penulis: <span className="text-[#075E54] font-semibold">{book.author}</span>
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(book.rating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-gray-800">
                {book.rating > 0 ? book.rating.toFixed(1) : '4.8'}
              </span>
              <span className="text-xs text-gray-500">
                ({book.reviews?.length || 0} ulasan)
              </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                <BookOpen className="w-3.5 h-3.5" />
                {book.category?.name || 'Umum'}
              </span>
              {book.pages && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {book.pages} halaman
                </span>
              )}
              {book.publishYear && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  Tahun {book.publishYear}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="prose prose-sm text-gray-700 border-t border-gray-100 pt-4">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Sinopsis & Deskripsi
            </h4>
            <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600">
              {book.description}
            </p>
          </div>

          {/* Metadata Table */}
          <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-200/60 text-xs space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-400">Penerbit</span>
              <span className="col-span-2 font-medium text-[#17211D]">{book.publisher || 'Penerbit Nasional'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-400">Tahun Terbit</span>
              <span className="col-span-2 font-medium text-[#17211D]">{book.publishYear || '2021'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-400">ISBN</span>
              <span className="col-span-2 font-medium text-[#17211D]">{book.isbn || '-'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <span className="text-gray-400">Bahasa</span>
              <span className="col-span-2 font-medium text-[#17211D]">{book.language || 'Bahasa Indonesia'}</span>
            </div>
          </div>
        </div>

        {/* Col 3: "TERSEDIA DI" Sidebar matching mockup (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-[#17211D] border-b border-gray-100 pb-3 flex items-center gap-2">
              <span>Tersedia di:</span>
            </h3>

            {/* List of Stores having this book */}
            {book.availableStores && book.availableStores.length > 0 ? (
              book.availableStores.map((store) => (
                <div
                  key={store.storeId}
                  className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/30 space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#075E54] flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-[#17211D] truncate">
                        {store.storeName}
                      </h4>
                      <p className="text-[11px] text-gray-500">{store.district}, Sidrap</p>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-sm font-bold text-[#075E54]">
                      Rp {store.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-gray-500">Stok {store.stock}</span>
                  </div>

                  <a
                    href={store.waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 bg-[#075E54] text-white text-xs font-semibold py-2 rounded-xl hover:bg-[#05473F] transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Pesan via WhatsApp
                  </a>
                </div>
              ))
            ) : null}

            {/* List of Libraries having this book */}
            {book.availableLibraries && book.availableLibraries.length > 0 ? (
              book.availableLibraries.map((lib) => (
                <div
                  key={lib.libraryCollectionId}
                  className="p-3.5 rounded-xl border border-teal-100 bg-teal-50/30 space-y-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-[#0F766E] flex items-center justify-center shrink-0">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-xs text-[#17211D] truncate">
                        {lib.libraryName}
                      </h4>
                      <p className="text-[11px] text-gray-500">{lib.district}, Sidrap</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-600 space-y-0.5">
                    <p className="flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Tersedia ({lib.availableStock} eks)
                    </p>
                    <p className="text-gray-400 text-[10px]">
                      Bisa dipinjam selama 7-14 hari
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full text-xs"
                    onClick={() => handleOpenBorrowModal(lib)}
                  >
                    Pinjam Sekarang
                  </Button>
                </div>
              ))
            ) : null}

            {(!book.availableStores || book.availableStores.length === 0) &&
              (!book.availableLibraries || book.availableLibraries.length === 0) && (
                <p className="text-xs text-gray-500 text-center py-4">
                  Buku ini belum didaftarkan di toko buku atau perpustakaan mitra aktif.
                </p>
              )}
          </div>
        </div>
      </div>

      {/* Ulasan Pembaca Section (Matching Mockup) */}
      <section className="border-t border-gray-200 pt-10 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-[#17211D]">Ulasan Pembaca</h3>
            <p className="text-xs text-gray-500">
              Pengalaman membaca dari masyarakat Sidrap
            </p>
          </div>
        </div>

        {/* Existing reviews cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {book.reviews && book.reviews.length > 0 ? (
            book.reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={rev.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                      alt={rev.user?.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <h5 className="font-semibold text-xs text-[#17211D]">
                        {rev.user?.name}
                      </h5>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
                        {rev.user?.level || 'Pembaca Aktif'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{rev.rating.toFixed(1)}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  &quot;{rev.comment}&quot;
                </p>

                <p className="text-[10px] text-gray-400 pt-1">
                  {new Date(rev.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 italic">Belum ada ulasan untuk buku ini. Jadilah yang pertama memberikan ulasan!</p>
          )}
        </div>

        {/* Form add review */}
        <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-xs max-w-xl">
          <h4 className="font-semibold text-sm text-[#17211D] mb-3">Tulis Ulasan & Rating Anda</h4>
          <form onSubmit={handleAddReview} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Pilih Rating:</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUserRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= userRating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-gray-700 ml-2">
                  {userRating} / 5 Bintang
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ulasan Anda:</label>
              <textarea
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                placeholder="Bagikan pandangan Anda tentang buku ini..."
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
            </div>

            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingReview}
              className="w-full sm:w-auto"
            >
              <Send className="w-3.5 h-3.5" /> Kirim Ulasan (+10 Poin)
            </Button>
          </form>
        </div>
      </section>

      {/* Borrow Modal */}
      <Modal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        title="Pengajuan Peminjaman Buku"
      >
        <form onSubmit={handleSubmitBorrow} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
            <p className="font-semibold text-sm text-[#17211D]">{book.title}</p>
            <p className="text-gray-500">Penulis: {book.author}</p>
            <p className="text-[#075E54] font-medium">Perpustakaan: {selectedCollection?.libraryName}</p>
            <p className="text-gray-400 text-[11px]">Durasi standar: 7 hari peminjaman</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Catatan Peminjaman (Opsional)
            </label>
            <textarea
              value={borrowNotes}
              onChange={(e) => setBorrowNotes(e.target.value)}
              placeholder="Misal: untuk keperluan tugas kuliah atau penelitian..."
              rows={3}
              className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBorrowModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmittingBorrow}>
              Konfirmasi Pinjam (+15 Poin)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
