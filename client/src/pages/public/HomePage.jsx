import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Landmark,
  Store,
  Calendar,
  Users,
  Clock,
  ArrowRight,
  Compass,
  MapPin,
  Sparkles,
  FileText,
  Search,
} from 'lucide-react';
import {
  bookService,
  storeService,
  libraryService,
  eventService,
  articleService,
  communityService,
} from '../../services/dataServices';
import { useLocation } from '../../contexts/LocationContext';
import { BookCard } from '../../components/cards/BookCard';
import { StoreCard } from '../../components/cards/StoreCard';
import { LibraryCard } from '../../components/cards/LibraryCard';
import { CommunityCard } from '../../components/cards/CommunityCard';
import { EventCard } from '../../components/cards/EventCard';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';

export const HomePage = () => {
  const navigate = useNavigate();
  const { location, requestGeolocation, isDetecting } = useLocation();

  const [heroSearch, setHeroSearch] = useState('');
  const [books, setBooks] = useState([]);
  const [stores, setStores] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [activeNearbyTab, setActiveNearbyTab] = useState('perpustakaan'); // perpustakaan | toko | komunitas
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [booksRes, storesRes, libsRes, commsRes, eventsRes, artsRes] = await Promise.all([
          bookService.getBooks({ limit: 4 }),
          storeService.getStores({ userLat: location.lat, userLng: location.lng, limit: 3 }),
          libraryService.getLibraries({ userLat: location.lat, userLng: location.lng, limit: 3 }),
          communityService.getCommunities({ userLat: location.lat, userLng: location.lng, limit: 3 }),
          eventService.getEvents({ limit: 3 }),
          articleService.getArticles({ limit: 3 }),
        ]);

        if (booksRes?.data) setBooks(booksRes.data);
        if (storesRes?.data) setStores(storesRes.data.slice(0, 3));
        if (libsRes?.data) setLibraries(libsRes.data.slice(0, 3));
        if (commsRes?.data) setCommunities(commsRes.data.slice(0, 3));
        if (eventsRes?.data) setEvents(eventsRes.data.slice(0, 3));
        if (artsRes?.data) setArticles(artsRes.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch homepage data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.lat, location.lng]);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  const quickCategories = [
    {
      title: 'Buku',
      desc: 'Ribuan judul bacaan',
      icon: BookOpen,
      color: 'bg-[#E8F3EF] text-[#075E54] border-[#cbe1d7]',
      link: '/buku',
    },
    {
      title: 'Toko Buku',
      desc: 'Toko buku terdekat',
      icon: Store,
      color: 'bg-emerald-50 text-[#075E54] border-emerald-200',
      link: '/literasi/toko',
    },
    {
      title: 'Perpustakaan',
      desc: 'Peminjaman publik',
      icon: Landmark,
      color: 'bg-teal-50 text-[#0F766E] border-teal-200',
      link: '/literasi/perpustakaan',
    },
    {
      title: 'Komunitas',
      desc: 'Ruang belajar bersama',
      icon: Users,
      color: 'bg-sky-50 text-sky-800 border-sky-200',
      link: '/komunitas',
    },
    {
      title: 'Event',
      desc: 'Agenda literasi aktif',
      icon: Calendar,
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      link: '/event',
    },
    {
      title: 'Baca 5 Menit',
      desc: 'Artikel edukatif ringkas',
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      link: '/baca-5-menit',
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-16 pb-16 w-full max-w-full overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#075E54] to-[#05473F] text-white w-full">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-14 w-full">
          {/* Left Text */}
          <div className="flex-1 space-y-4 text-center lg:text-left z-10 w-full max-w-full min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-xs text-emerald-100 border border-white/20 max-w-full">
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Ekosistem Literasi Masyarakat Sidrap</span>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight break-words">
              Temukan Literasi di Sekitarmu.
            </h1>

            <p className="text-white/90 text-xs sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              MABBACA membantu masyarakat Sidenreng Rappang menemukan buku, perpustakaan daerah, toko buku lokal, komunitas pegiat baca, agenda event, dan artikel literasi bermanfaat dalam satu ekosistem terpadu.
            </p>

            {/* Big Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="pt-2 max-w-xl mx-auto lg:mx-0 w-full"
            >
              <div className="relative flex items-center shadow-lg rounded-2xl bg-white p-1 sm:p-1.5 border border-white/30 w-full">
                <Search className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 ml-2.5 sm:ml-3 shrink-0" />
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder="Cari buku, toko, event..."
                  className="flex-1 min-w-0 px-2 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-black placeholder-gray-700 focus:outline-none bg-transparent"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#075E54] text-white hover:bg-[#05473F] font-bold shrink-0 rounded-xl px-3.5 sm:px-6 shadow-xs text-xs sm:text-sm"
                >
                  Cari
                </Button>
              </div>
            </form>

            {/* Dual CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 w-full sm:w-auto">
              <Button
                variant="light"
                size="md"
                onClick={() => navigate('/buku')}
                className="w-full sm:w-auto gap-2 shadow-md justify-center"
              >
                Jelajahi Literasi <ArrowRight className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={requestGeolocation}
                disabled={isDetecting}
                className="w-full sm:w-auto border-white/40 text-white bg-white/10 hover:bg-white/20 justify-center"
              >
                <MapPin className="w-4 h-4 mr-1 text-emerald-300 shrink-0" />
                <span className="truncate">
                  {isDetecting
                    ? 'Mendeteksi...'
                    : location.isDetected
                    ? location.name
                    : 'Temukan Terdekat'}
                </span>
              </Button>
            </div>
          </div>

          {/* Right Visual (Authentic literacy photo feeling) */}
          <div className="flex-1 relative w-full max-w-md lg:max-w-none">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-[16/10] sm:aspect-[4/3] max-h-72 sm:max-h-96 lg:max-h-none bg-emerald-900">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80"
                alt="Aktivitas Literasi Masyarakat Sidrap"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex items-end p-5 sm:p-6">
                <div className="text-white">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 bg-black/40 px-2 py-0.5 rounded-md">
                    Gerakan Sidrap Membaca
                  </span>
                  <p className="text-sm sm:text-base font-bold mt-1">
                    Lapak Baca & Diskusi Ruang Publik di Pangkajene
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK CATEGORY CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 sm:-mt-10 relative z-20 w-full">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4 w-full">
          {quickCategories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.title}
                to={cat.link}
                className="group bg-white rounded-2xl p-2 sm:p-4 border border-[#E2E8E5] shadow-xs hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-0.5 transition-all flex flex-col items-center text-center w-full"
              >
                <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-1 sm:mb-2.5 border ${cat.color} group-hover:scale-105 transition-transform`}>
                  <IconComponent className="w-4 h-4 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-[11px] sm:text-xs md:text-sm text-[#17211D] group-hover:text-[#075E54] transition-colors line-clamp-1">
                  {cat.title}
                </h3>
                <p className="hidden sm:block text-[11px] text-[#66736D] mt-0.5 line-clamp-1">{cat.desc}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. BUKU PILIHAN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#075E54] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Rekomendasi
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#17211D] tracking-tight">
              Buku Pilihan
            </h2>
            <p className="text-xs sm:text-sm text-[#66736D]">
              Temukan bacaan menarik dari berbagai sumber literasi di Kabupaten Sidrap.
            </p>
          </div>
          <Link
            to="/buku"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#075E54] hover:underline shrink-0"
          >
            Lihat Semua Buku <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6 w-full">
            {[1, 2, 3, 4].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            title="Belum ada buku pilihan"
            description="Buku pilihan dari toko buku dan perpustakaan Sidrap akan segera ditampilkan."
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-6 w-full">
            {books.slice(0, 4).map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>

      {/* 4. LITERASI TERDEKAT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-[#E8F3EF]/50 rounded-3xl p-4 sm:p-8 border border-[#cbe1d7]/60 space-y-5 sm:space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#075E54] uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" /> Geolokasi Sidrap
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#17211D]">
                Literasi Terdekat
              </h2>
              <p className="text-xs sm:text-sm text-[#66736D]">
                Berdasarkan lokasi Anda:{' '}
                <strong className="text-[#075E54]">{location.name}</strong>
              </p>
            </div>

            {/* Toggle Tabs */}
            <div className="flex bg-white p-1 rounded-2xl border border-[#cbe1d7] shadow-xs shrink-0 overflow-x-auto no-scrollbar max-w-full">
              <button
                onClick={() => setActiveNearbyTab('perpustakaan')}
                className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeNearbyTab === 'perpustakaan'
                    ? 'bg-[#075E54] text-white shadow-xs'
                    : 'text-[#66736D] hover:text-[#17211D]'
                }`}
              >
                Perpustakaan
              </button>
              <button
                onClick={() => setActiveNearbyTab('toko')}
                className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeNearbyTab === 'toko'
                    ? 'bg-[#075E54] text-white shadow-xs'
                    : 'text-[#66736D] hover:text-[#17211D]'
                }`}
              >
                Toko Buku
              </button>
              <button
                onClick={() => setActiveNearbyTab('komunitas')}
                className={`px-3 sm:px-4 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                  activeNearbyTab === 'komunitas'
                    ? 'bg-[#075E54] text-white shadow-xs'
                    : 'text-[#66736D] hover:text-[#17211D]'
                }`}
              >
                Komunitas
              </button>
            </div>
          </div>

          {/* Tab Content Cards */}
          {activeNearbyTab === 'perpustakaan' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {libraries.map((lib) => (
                <LibraryCard key={lib.id} library={lib} />
              ))}
            </div>
          )}

          {activeNearbyTab === 'toko' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}

          {activeNearbyTab === 'komunitas' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {communities.map((comm) => (
                <CommunityCard key={comm.id} community={comm} />
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              to={
                activeNearbyTab === 'perpustakaan'
                  ? '/literasi/perpustakaan'
                  : activeNearbyTab === 'toko'
                  ? '/literasi/toko'
                  : '/komunitas'
              }
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#075E54] hover:underline"
            >
              Lihat Semua di Sekitar <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. EVENT LITERASI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#075E54] uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5" /> Agenda Belajar
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#17211D] tracking-tight">
              Event Literasi
            </h2>
            <p className="text-xs sm:text-sm text-[#66736D]">
              Ikuti lokakarya, bedah buku, dan kelas komunitas literasi di Sidrap.
            </p>
          </div>
          <Link
            to="/event"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#075E54] hover:underline shrink-0"
          >
            Lihat Semua Event <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="Belum ada agenda event"
            description="Agenda kegiatan literasi akan segera hadir."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* 6. BACA 5 MENIT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#075E54] uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" /> Bacaan Cepat
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#17211D] tracking-tight">
              Baca 5 Menit
            </h2>
            <p className="text-xs sm:text-sm text-[#66736D]">
              Tingkatkan wawasan dengan artikel ringkas, inspiratif, dan penuh pengetahuan.
            </p>
          </div>
          <Link
            to="/baca-5-menit"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#075E54] hover:underline shrink-0"
          >
            Lihat Semua Artikel <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <EmptyState
            title="Belum ada artikel"
            description="Artikel ringkas 5 menit akan segera diterbitkan."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        )}
      </section>

      {/* 7. KOMUNITAS LITERASI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <div className="inline-flex items-center gap-1 text-xs font-bold text-[#075E54] uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" /> Paguyuban & Lapak
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#17211D] tracking-tight">
              Komunitas Literasi
            </h2>
            <p className="text-xs sm:text-sm text-[#66736D]">
              Bergabung dengan para penggerak baca dan pegiat literasi Sidrap.
            </p>
          </div>
          <Link
            to="/komunitas"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#075E54] hover:underline shrink-0"
          >
            Temukan Komunitas <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <EmptyState
            title="Belum ada komunitas terdaftar"
            description="Komunitas literasi masyarakat Sidrap akan muncul di sini."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {communities.map((comm) => (
              <CommunityCard key={comm.id} community={comm} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
