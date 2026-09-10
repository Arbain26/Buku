import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Landmark,
  MapPin,
  Clock,
  Phone,
  BookOpen,
  Search,
  CheckCircle2,
  ChevronRight,
  BookMarked,
} from 'lucide-react';
import { libraryService } from '../../services/dataServices';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const LibraryDetailPage = () => {
  const { id } = useParams();
  const { location } = useLocation();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [library, setLibrary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [searchCollection, setSearchCollection] = useState('');

  // Borrow Modal
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState(null);
  const [borrowNotes, setBorrowNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Semua', 'Anak', 'Pendidikan', 'Agama', 'Pertanian', 'Novel', 'Umum'];

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        setIsLoading(true);
        const res = await libraryService.getLibraryById(id, {
          userLat: location.lat,
          userLng: location.lng,
          collectionCategory: selectedCategory !== 'Semua' ? selectedCategory : undefined,
          searchCollection: searchCollection || undefined,
        });
        if (res?.data) {
          setLibrary(res.data);
        }
      } catch (err) {
        console.error('Failed to load library detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibrary();
  }, [id, selectedCategory, searchCollection, location.lat, location.lng]);

  const handleOpenBorrow = (col) => {
    if (!isAuthenticated) {
      showToast('Silakan masuk (login) terlebih dahulu untuk meminjam buku.', 'info');
      return;
    }
    setActiveCollection(col);
    setIsBorrowModalOpen(true);
  };

  const handleSubmitBorrow = async (e) => {
    e.preventDefault();
    if (!activeCollection) return;

    try {
      setIsSubmitting(true);
      const res = await libraryService.requestBorrow({
        collectionId: activeCollection.collectionId,
        notes: borrowNotes,
      });
      showToast(res.message, 'success');
      setIsBorrowModalOpen(false);
      setBorrowNotes('');
      // Refresh library details
      const refreshed = await libraryService.getLibraryById(id);
      if (refreshed?.data) setLibrary(refreshed.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengajukan peminjaman.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="w-full h-64 rounded-3xl" />
        <Skeleton className="w-1/3 h-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!library) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Perpustakaan tidak ditemukan.</h2>
        <Link to="/literasi/perpustakaan" className="text-[#075E54] font-medium hover:underline mt-2 inline-block">
          ← Kembali ke Daftar Perpustakaan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-[#075E54]">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/literasi/perpustakaan" className="hover:text-[#075E54]">Perpustakaan</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-[#17211D] truncate">{library.name}</span>
      </nav>

      {/* Banner & Library Info Card */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="h-48 sm:h-64 relative bg-teal-900">
          <img
            src={library.banner || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&auto=format&fit=crop&q=80'}
            alt={library.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden shrink-0">
                <img
                  src={library.logo || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=200&auto=format&fit=crop&q=80'}
                  alt={library.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D]">
                  {library.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  {library.address}, Kec. {library.district}, Sidrap
                </p>
              </div>
            </div>

            <span className="inline-flex items-center text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Jarak {library.formattedDistance} dari lokasi Anda
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mt-5 max-w-3xl leading-relaxed">
            {library.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Jam Layanan: <strong>{library.openHours}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-teal-600" />
              <span>Kontak Petugas: <strong>+{library.phoneWa}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookMarked className="w-4 h-4 text-gray-400" />
              <span>Koleksi: <strong>{library.totalCollections} Judul Buku</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Section with Search & Category filters */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#17211D]">
              Koleksi Buku Perpustakaan
            </h3>
            <p className="text-xs text-gray-500">
              Cari dan ajukan peminjaman buku langsung dari rumah
            </p>
          </div>

          {/* Search collection */}
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCollection}
              onChange={(e) => setSearchCollection(e.target.value)}
              placeholder="Cari judul koleksi atau nomor panggil..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            />
          </div>
        </div>

        {/* Categories: Anak, Pendidikan, Agama, Pertanian, Novel, Umum */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Collections Grid */}
        {library.collections && library.collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {library.collections.map((col) => (
              <div
                key={col.collectionId}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 flex flex-col justify-between shadow-xs hover:shadow-card-hover transition-shadow"
              >
                <div>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-3 relative">
                    <img
                      src={col.coverImage}
                      alt={col.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold bg-white/95 px-2 py-0.5 rounded-md text-teal-800">
                      {col.category}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-[#17211D] line-clamp-1">
                    {col.title}
                  </h4>
                  <p className="text-xs text-gray-500">{col.author}</p>

                  <div className="mt-2 pt-2 border-t border-gray-100 text-xs space-y-1">
                    <p className="text-gray-400 text-[11px]">
                      No. Panggil: <strong className="text-gray-700">{col.callNumber || 'UM-01'}</strong>
                    </p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">{col.locationShelf || 'Rak Utama'}</span>
                      <span className={`font-semibold ${col.isAvailable ? 'text-emerald-700' : 'text-red-500'}`}>
                        {col.isAvailable ? `Tersedia (${col.availableStock})` : 'Sedang Dipinjam'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs"
                    disabled={!col.isAvailable}
                    onClick={() => handleOpenBorrow(col)}
                  >
                    {col.isAvailable ? 'Pinjam Buku Ini' : 'Stok Habis'}
                  </Button>

                  <Link
                    to={`/buku/${col.bookId}`}
                    className="block text-center text-[11px] text-gray-500 hover:text-[#075E54] hover:underline"
                  >
                    Lihat Sinopsis Buku
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Tidak ada koleksi ditemukan"
            description="Coba ubah kata kunci pencarian atau pilih kategori lain."
            actionText="Tampilkan Semua Koleksi"
            onAction={() => {
              setSelectedCategory('Semua');
              setSearchCollection('');
            }}
          />
        )}
      </div>

      {/* Borrow Modal */}
      <Modal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        title="Ajukan Peminjaman Koleksi Perpustakaan"
      >
        <form onSubmit={handleSubmitBorrow} className="space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-teal-50/50 border border-teal-100 space-y-1">
            <p className="font-semibold text-sm text-[#17211D]">{activeCollection?.title}</p>
            <p className="text-gray-500">Penulis: {activeCollection?.author}</p>
            <p className="text-teal-800 font-medium">Perpustakaan: {library.name}</p>
            <p className="text-gray-400 text-[11px]">Nomor Panggil: {activeCollection?.callNumber}</p>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">
              Catatan / Keperluan Peminjaman:
            </label>
            <textarea
              value={borrowNotes}
              onChange={(e) => setBorrowNotes(e.target.value)}
              placeholder="Contoh: Untuk referensi belajar mandiri atau tugas sekolah..."
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
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Kirim Permohonan (+15 Poin)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
