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

export const UniversalSearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { location } = useLocation();

  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [activeFilter, setActiveFilter] = useState('Semua'); // Semua, Buku, Perpustakaan, Toko Buku, Komunitas, Event, Artikel

  const [results, setResults] = useState(null);
  const [counts, setCounts] = useState({ all: 0, books: 0, libraries: 0, stores: 0, communities: 0, events: 0, articles: 0 });
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const filterTabs = [
    { label: 'Semua', count: counts.all },
    { label: 'Buku', count: counts.books },
    { label: 'Perpustakaan', count: counts.libraries },
    { label: 'Toko Buku', count: counts.stores },
    { label: 'Komunitas', count: counts.communities },
    { label: 'Event', count: counts.events },
    { label: 'Artikel', count: counts.articles },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D] tracking-tight">
          Pencarian Ekosistem Literasi
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Cari buku, toko buku, perpustakaan, komunitas, agenda event, dan artikel di Sidrap
        </p>

        {/* Input Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Contoh: jurnalistik, stoisisme, baranti, nenek mallomo..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#075E54] shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-[#075E54] text-white text-sm font-semibold rounded-2xl hover:bg-[#05473F] transition-colors shadow-xs shrink-0"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      {query && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200 scrollbar-none">
          {filterTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveFilter(tab.label)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === tab.label
                  ? 'bg-[#075E54] text-white shadow-xs'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === tab.label ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Results Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      ) : results ? (
        counts.all > 0 ? (
          <div className="space-y-10">
            {/* Books Section */}
            {(activeFilter === 'Semua' || activeFilter === 'Buku') && results.books?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#17211D] flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#075E54]" /> Buku ({results.books.length})
                  </h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {results.books.map((b) => (
                    <BookCard key={b.id} book={b} />
                  ))}
                </div>
              </div>
            )}

            {/* Libraries Section */}
            {(activeFilter === 'Semua' || activeFilter === 'Perpustakaan') && results.libraries?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#17211D] flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-[#0F766E]" /> Perpustakaan ({results.libraries.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.libraries.map((lib) => (
                    <LibraryCard key={lib.id} library={lib} />
                  ))}
                </div>
              </div>
            )}

            {/* Stores Section */}
            {(activeFilter === 'Semua' || activeFilter === 'Toko Buku') && results.stores?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#17211D] flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#075E54]" /> Toko Buku ({results.stores.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.stores.map((st) => (
                    <StoreCard key={st.id} store={st} />
                  ))}
                </div>
              </div>
            )}

            {/* Communities Section */}
            {(activeFilter === 'Semua' || activeFilter === 'Komunitas') && results.communities?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#17211D] flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#075E54]" /> Komunitas ({results.communities.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.communities.map((cm) => (
                    <CommunityCard key={cm.id} community={cm} />
                  ))}
                </div>
              </div>
            )}

            {/* Events Section */}
            {(activeFilter === 'Semua' || activeFilter === 'Event') && results.events?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#17211D] flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#075E54]" /> Event ({results.events.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.events.map((ev) => (
                    <EventCard key={ev.id} event={ev} />
                  ))}
                </div>
              </div>
            )}

            {/* Articles Section */}
            {(activeFilter === 'Semua' || activeFilter === 'Artikel') && results.articles?.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#17211D] flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#075E54]" /> Baca 5 Menit ({results.articles.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {results.articles.map((art) => (
                    <ArticleCard key={art.id} article={art} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title={`Tidak menemukan hasil untuk "${query}"`}
            description="Coba periksa ejaan kata atau gunakan istilah yang lebih umum seperti 'buku', 'sidrap', atau 'jurnalistik'."
          />
        )
      ) : (
        <div className="p-12 text-center text-gray-400 bg-white rounded-3xl border border-gray-200">
          <Sparkles className="w-8 h-8 mx-auto text-[#075E54] mb-3" />
          <p className="text-sm font-medium text-gray-600">
            Ketik kata kunci di atas untuk mencari buku, toko, perpustakaan, atau event di seluruh ekosistem MABBACA.
          </p>
        </div>
      )}
    </div>
  );
};
