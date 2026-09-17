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
  Info,
} from 'lucide-react';
import { libraryService } from '../../services/dataServices';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { LocationBadge } from '../../components/common/LocationBadge';
import { Textarea } from '../../components/common/Input';

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
        libraryId: library.id,
        bookId: activeCollection.bookId,
        collectionId: activeCollection.collectionId,
        notes: borrowNotes,
      });
      showToast(res.message || 'Pengajuan peminjaman berhasil dikirim!', 'success');
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
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
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-[#17211D]">Perpustakaan tidak ditemukan.</h2>
        <Link to="/literasi/perpustakaan" className="text-[#075E54] font-bold hover:underline inline-block text-sm">
          ← Kembali ke Daftar Perpustakaan
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Perpustakaan', link: '/literasi/perpustakaan' },
          { label: library.name },
        ]}
      />

      {/* Banner & Library Info Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8E5] overflow-hidden shadow-xs">
        <div className="h-48 sm:h-64 relative bg-teal-900">
          <ImageWithFallback
            src={library.banner}
            alt={library.name}
            fallbackIcon={Landmark}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden shrink-0">
                <ImageWithFallback
                  src={library.logo}
                  alt={library.name}
                  fallbackIcon={Landmark}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211D]">
                  {library.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#66736D] flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                  {library.address}, Kec. {library.district}, Sidrap
                </p>
              </div>
            </div>

            <LocationBadge distance={library.distance || (library.formattedDistance ? parseFloat(library.formattedDistance) : undefined)} district={library.district} size="md" />
          </div>

          <p className="text-xs sm:text-sm text-[#17211D]/80 mt-5 max-w-3xl leading-relaxed">
            {library.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-gray-100 text-xs text-[#66736D]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Jam Layanan: <strong className="text-[#17211D]">{library.openHours}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#0F766E]" />
              <span>Kontak Petugas: <strong className="text-[#17211D]">+{library.phoneWa}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span>Total Koleksi: <strong className="text-[#0F766E]">{library.collections?.length || 0} Judul Terdata</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Collection Catalog & Search */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-[#17211D]">
              Katalog Koleksi Buku Fisik
            </h3>
            <p className="text-xs text-[#66736D]">
              Pilih buku yang ingin Anda pinjam untuk dibaca di rumah atau di ruang baca
            </p>
          </div>

          <div className="w-full sm:w-72 relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchCollection}
              onChange={(e) => setSearchCollection(e.target.value)}
              placeholder="Cari koleksi buku..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E2E8E5] focus:outline-none focus:ring-2 focus:ring-[#075E54] bg-white shadow-xs"
            />
          </div>
        </div>

        {/* Collections Grid */}
        {library.collections && library.collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {library.collections.map((col) => (
              <div
                key={col.collectionId}
                className="bg-white rounded-2xl border border-[#E2E8E5] p-3.5 flex flex-col justify-between shadow-xs hover:shadow-card-hover transition-all duration-200"
              >
                <div>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#E8F3EF] mb-3 relative">
                    <ImageWithFallback
                      src={col.coverImage}
                      alt={col.title}
                      fallbackText={col.title}
                      fallbackIcon={BookOpen}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-white/95 px-2 py-0.5 rounded-md text-[#0F766E] border border-teal-200 shadow-xs">
                      {col.category}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-[#17211D] line-clamp-1">
                    {col.title}
                  </h4>
                  <p className="text-[11px] text-[#66736D] line-clamp-1 mt-0.5">{col.author}</p>

                  <div className="space-y-1 mt-2.5 pt-2 border-t border-gray-100 text-[11px] text-[#66736D]">
                    <div className="flex items-center justify-between">
                      <span>No. Panggil (Call No):</span>
                      <strong className="text-[#17211D]">{col.callNumber || '-'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Lokasi Rak:</span>
                      <strong className="text-[#17211D]">{col.locationShelf || 'Rak Utama'}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Ketersediaan:</span>
                      <span className="font-bold text-[#075E54]">{col.availableStock} dari {col.totalStock} eks</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenBorrow(col)}
                    disabled={col.availableStock <= 0}
                    className="w-full bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold gap-1.5 shadow-xs"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    {col.availableStock > 0 ? 'Ajukan Peminjaman' : 'Stok Sedang Kosong'}
                  </Button>

                  <Link
                    to={`/buku/${col.bookId}`}
                    className="block text-center text-[11px] font-semibold text-[#66736D] hover:text-[#075E54] hover:underline"
                  >
                    Lihat Sinopsis Buku
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Tidak ada koleksi buku"
            description="Belum ada buku pada perpustakaan ini yang cocok dengan pencarian Anda."
          />
        )}
      </div>

      {/* Borrow Modal */}
      <Modal
        isOpen={isBorrowModalOpen}
        onClose={() => setIsBorrowModalOpen(false)}
        title="Ajukan Peminjaman Buku"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmitBorrow} className="space-y-4 py-2">
          <div className="p-3.5 rounded-2xl bg-[#E8F3EF] border border-[#cbe1d7] text-xs">
            <p className="font-bold text-[#075E54] text-sm">{activeCollection?.title}</p>
            <p className="text-[#66736D] mt-0.5">
              Lokasi: <strong>{library.name}</strong> • Rak: <strong>{activeCollection?.locationShelf}</strong>
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-start gap-2 leading-relaxed">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <p>
              Pengajuan peminjaman akan ditinjau oleh staf perpustakaan. Anda memiliki batas waktu 2 hari kerja untuk mengambil buku setelah status disetujui.
            </p>
          </div>

          <Textarea
            label="Catatan Pengajuan (Opsional)"
            value={borrowNotes}
            onChange={(e) => setBorrowNotes(e.target.value)}
            placeholder="Contoh: Digunakan untuk tugas sekolah / penelitian karya tulis"
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
              isLoading={isSubmitting}
              className="bg-[#0F766E] text-white font-bold"
            >
              Kirim Pengajuan Pinjam
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
