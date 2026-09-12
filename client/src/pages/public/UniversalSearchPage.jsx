import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Landmark,
  Store,
  Users,
  Calendar,
  FileText,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { searchService } from '../../services/dataServices';
import { useLocation } from '../../contexts/LocationContext';
import { BookCard } from '../../components/cards/BookCard';
import { StoreCard } from '../../components/cards/StoreCard';
import { LibraryCard } from '../../components/cards/LibraryCard';
import { CommunityCard } from '../../components/cards/CommunityCard';
import { EventCard } from '../../components/cards/EventCard';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBar } from '../../components/common/SearchBar';
import { Tabs } from '../../components/common/Tabs';

export const UniversalSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location } = useLocation();

  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [activeFilter, setActiveFilter] = useState('Semua');

  const [results, setResults] = useState(null);
  const [counts, setCounts] = useState({
    all: 0,
    books: 0,
    libraries: 0,
    stores: 0,
    communities: 0,
    events: 0,
    articles: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSearchInput(query);
    if (!query) {
      setResults(null);
      return;
    }

    const fetchSearch = async () => {
      try {
        setIsLoading(true);
        const res = await searchService.universalSearch({
          q: query,
          userLat: location.lat,
          userLng: location.lng,
        });
        if (res?.data) {
          setResults(res.data.results);
          setCounts(res.data.counts);
        }
      } catch (err) {
        console.error('Universal search error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearch();
  }, [query, location.lat, location.lng]);

  const handleSearchSubmit = (val) => {
    if (val && val.trim()) {
      setSearchParams({ q: val.trim() });
    }
  };

  const filterTabs = [
    { id: 'Semua', label: 'Semua', count: counts.all },
    { id: 'Buku', label: 'Buku', count: counts.books, icon: BookOpen },
    { id: 'Toko Buku', label: 'Toko Buku', count: counts.stores, icon: Store },
    { id: 'Perpustakaan', label: 'Perpustakaan', count: counts.libraries, icon: Landmark },
    { id: 'Komunitas', label: 'Komunitas', count: counts.communities, icon: Users },
    { id: 'Event', label: 'Event', count: counts.events, icon: Calendar },
    { id: 'Artikel', label: 'Artikel', count: counts.articles, icon: FileText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="max-w-3xl space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211D] tracking-tight">
          Pencarian Ekosistem Literasi
        </h1>
        <p className="text-xs sm:text-sm text-[#66736D]">
          Cari buku, toko buku, perpustakaan, komunitas, agenda event, dan artikel di seluruh Kabupaten Sidrap
        </p>

        {/* Input Bar */}
        <div className="pt-2">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={handleSearchSubmit}
            placeholder="Cari buku, toko, event, komunitas..."
            size="lg"
          />
        </div>
      </div>

      {/* Query Status & Filter Tabs */}
      {query && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm text-[#66736D]">
              Menampilkan hasil untuk: <strong className="text-[#075E54]">&ldquo;{query}&rdquo;</strong> ({counts.all} hasil ditemukan)
            </p>
          </div>

          <Tabs
            tabs={filterTabs}
            activeTab={activeFilter}
            onChange={setActiveFilter}
            variant="pills"
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && query && counts.all === 0 && (
        <EmptyState
          icon={Search}
          title="Tidak Ada Hasil Ditemukan"
          description={`Tidak ada data yang cocok dengan kata kunci "${query}". Silakan coba kata kunci lain seperti nama penulis, judul buku, atau nama kecamatan di Sidrap.`}
        />
      )}

      {!isLoading && !query && (
        <EmptyState
          icon={Search}
          title="Mulai Pencarian Literasi"
          description="Ketik kata kunci di kolom pencarian di atas untuk mencari seluruh ekosistem bacaan di Kabupaten Sidrap."
        />
      )}

      {/* Search Results Display by Category */}
      {!isLoading && results && counts.all > 0 && (
        <div className="space-y-10">
          {/* 1. Buku */}
          {(activeFilter === 'Semua' || activeFilter === 'Buku') && results.books?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-base sm:text-lg font-bold text-[#17211D] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#075E54]" />
                  Buku ({results.books.length})
                </h3>
                <Link to={`/buku?q=${encodeURIComponent(query)}`} className="text-xs font-bold text-[#075E54] hover:underline">
                  Lihat Semua Buku →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {results.books.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            </section>
          )}

          {/* 2. Toko Buku */}
          {(activeFilter === 'Semua' || activeFilter === 'Toko Buku') && results.stores?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-base sm:text-lg font-bold text-[#17211D] flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#075E54]" />
                  Toko Buku ({results.stores.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.stores.map((s) => (
                  <StoreCard key={s.id} store={s} />
                ))}
              </div>
            </section>
          )}

          {/* 3. Perpustakaan */}
          {(activeFilter === 'Semua' || activeFilter === 'Perpustakaan') && results.libraries?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-base sm:text-lg font-bold text-[#17211D] flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-[#0F766E]" />
                  Perpustakaan ({results.libraries.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.libraries.map((l) => (
                  <LibraryCard key={l.id} library={l} />
                ))}
              </div>
            </section>
          )}

          {/* 4. Komunitas */}
          {(activeFilter === 'Semua' || activeFilter === 'Komunitas') && results.communities?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-base sm:text-lg font-bold text-[#17211D] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#075E54]" />
                  Komunitas ({results.communities.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.communities.map((c) => (
                  <CommunityCard key={c.id} community={c} />
                ))}
              </div>
            </section>
          )}

          {/* 5. Event */}
          {(activeFilter === 'Semua' || activeFilter === 'Event') && results.events?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-base sm:text-lg font-bold text-[#17211D] flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#075E54]" />
                  Agenda Event ({results.events.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {results.events.map((e) => (
                  <EventCard key={e.id} event={e} />
                ))}
              </div>
            </section>
          )}

          {/* 6. Artikel */}
          {(activeFilter === 'Semua' || activeFilter === 'Artikel') && results.articles?.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-base sm:text-lg font-bold text-[#17211D] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#075E54]" />
                  Artikel Baca 5 Menit ({results.articles.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {results.articles.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
