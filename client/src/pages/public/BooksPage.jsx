import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, BookOpen, SlidersHorizontal } from 'lucide-react';
import { bookService } from '../../services/dataServices';
import { BookCard } from '../../components/cards/BookCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { Select } from '../../components/common/Select';
import { SearchBar } from '../../components/common/SearchBar';
import { Drawer } from '../../components/common/Drawer';
import { Button } from '../../components/common/Button';

export const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentAvailability = searchParams.get('availability') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    bookService.getCategories().then((res) => {
      if (res?.data) setCategories(res.data);
    });
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const res = await bookService.getBooks({
          search: currentSearch,
          category: currentCategory,
          sortBy: currentSort,
          availability: currentAvailability,
          page: currentPage,
          limit: 12,
        });
        if (res?.data) {
          setBooks(res.data);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        }
      } catch (err) {
        console.error('Failed to load books:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [currentCategory, currentSearch, currentSort, currentAvailability, currentPage]);

  const handleSearchSubmit = (val) => {
    const params = new URLSearchParams(searchParams);
    if (val && val.trim()) {
      params.set('q', val.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'popular', label: 'Terpopuler' },
    { value: 'rating', label: 'Rating Tertinggi' },
    { value: 'title_asc', label: 'Judul A - Z' },
  ];

  const availabilityOptions = [
    { value: '', label: 'Semua Ketersediaan' },
    { value: 'store', label: 'Tersedia di Toko Buku' },
    { value: 'library', label: 'Tersedia di Perpustakaan' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211D] tracking-tight">
          Temukan Buku
        </h1>
        <p className="text-xs sm:text-sm text-[#66736D]">
          Jelajahi buku bacaan berkualitas dari perpustakaan daerah dan toko buku lokal di Sidrap
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8E5] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="w-full md:max-w-md">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearchSubmit}
            placeholder="Cari judul buku, penulis, atau topik..."
            size="md"
          />
        </div>

        {/* Desktop Filters */}
        <div className="hidden md:flex items-center gap-2.5 w-full md:w-auto">
          {/* Availability Select */}
          <div className="w-44">
            <Select
              value={currentAvailability}
              onChange={(e) => handleFilterChange('availability', e.target.value)}
              options={availabilityOptions}
              placeholder={false}
              className="py-2"
            />
          </div>

          {/* Sort Select */}
          <div className="w-40">
            <Select
              value={currentSort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              options={sortOptions}
              placeholder={false}
              className="py-2"
            />
          </div>
        </div>

        {/* Mobile Filter Button */}
        <div className="flex md:hidden w-full items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex-1 justify-center gap-2 border-[#E2E8E5]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#075E54]" />
            <span>Filter & Urutkan</span>
          </Button>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => handleFilterChange('category', '')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
            !currentCategory
              ? 'bg-[#075E54] text-white shadow-xs'
              : 'bg-white border border-[#E2E8E5] text-[#66736D] hover:bg-gray-50'
          }`}
        >
          Semua Kategori
        </button>

        {categories.map((cat) => {
          const isSelected = currentCategory === cat.slug || currentCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => handleFilterChange('category', cat.slug || cat.name)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
                isSelected
                  ? 'bg-[#075E54] text-white shadow-xs font-bold'
                  : 'bg-white border border-[#E2E8E5] text-[#66736D] hover:bg-gray-50'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {[...Array(8)].map((_, n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Buku Tidak Ditemukan"
          description="Tidak ada buku yang sesuai dengan kriteria pencarian Anda. Coba gunakan kata kunci lain atau reset filter."
          actionText="Reset Pencarian"
          onAction={() => {
            setSearchInput('');
            setSearchParams({});
          }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pt-6">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter & Pengurutan Buku"
        position="bottom"
      >
        <div className="space-y-4 py-2">
          <Select
            label="Ketersediaan Buku"
            value={currentAvailability}
            onChange={(e) => handleFilterChange('availability', e.target.value)}
            options={availabilityOptions}
            placeholder={false}
          />

          <Select
            label="Urutkan Berdasarkan"
            value={currentSort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            options={sortOptions}
            placeholder={false}
          />

          <Button
            size="md"
            className="w-full bg-[#075E54] text-white font-bold mt-4"
            onClick={() => setIsMobileFilterOpen(false)}
          >
            Terapkan Filter
          </Button>
        </div>
      </Drawer>
    </div>
  );
};
