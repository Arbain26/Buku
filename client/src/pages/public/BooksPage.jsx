import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, BookOpen } from 'lucide-react';
import { bookService } from '../../services/dataServices';
import { BookCard } from '../../components/cards/BookCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const BooksPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);

  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('q') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    // Fetch categories
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
  }, [currentCategory, currentSearch, currentSort, currentPage]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchInput.trim()) {
      params.set('q', searchInput.trim());
    } else {
      params.delete('q');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleCategorySelect = (slug) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSortChange = (sortValue) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', sortValue);
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D] tracking-tight">
          Koleksi & Katalog Buku Sidrap
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Jelajahi buku bacaan berkualitas dari perpustakaan dan toko buku di seluruh Sidrap
        </p>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Cari judul, penulis, atau topik buku..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#075E54]"
          />
        </form>

        {/* Sort */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs text-gray-400 font-medium">Urutkan:</span>
          <select
            value={currentSort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#075E54]"
          >
            <option value="newest">Terbaru</option>
            <option value="rating">Rating Tertinggi</option>
            <option value="popular">Paling Populer</option>
            <option value="title">Judul (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
            !currentCategory
              ? 'bg-[#075E54] text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Semua Kategori
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategorySelect(cat.slug)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              currentCategory === cat.slug
                ? 'bg-[#075E54] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Book Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      ) : books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Tidak ada buku ditemukan"
          description="Coba gunakan kata kunci lain atau pilih kategori yang berbeda."
          actionText="Lihat Semua Buku"
          onAction={() => {
            setSearchInput('');
            handleCategorySelect('');
          }}
        />
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={!pagination.hasPrevPage}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', String(currentPage - 1));
              setSearchParams(params);
            }}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-xs text-gray-500">
            Halaman {pagination.currentPage} dari {pagination.totalPages}
          </span>
          <button
            disabled={!pagination.hasNextPage}
            onClick={() => {
              const params = new URLSearchParams(searchParams);
              params.set('page', String(currentPage + 1));
              setSearchParams(params);
            }}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-medium disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
};
