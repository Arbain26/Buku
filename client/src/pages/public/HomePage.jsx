import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Landmark,
  Store,
  GraduationCap,
  Sparkles,
  MapPin,
  ArrowRight,
  Clock,
  Users,
  Compass,
} from 'lucide-react';
import { bookService, storeService, libraryService, eventService, articleService, communityService } from '../../services/dataServices';
import { useLocation } from '../../contexts/LocationContext';
import { BookCard } from '../../components/cards/BookCard';
import { EventCard } from '../../components/cards/EventCard';
import { ArticleCard } from '../../components/cards/ArticleCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { Button } from '../../components/common/Button';

export const HomePage = () => {
  const navigate = useNavigate();
  const { location, requestGeolocation, isDetecting } = useLocation();

  const [books, setBooks] = useState([]);
  const [stores, setStores] = useState([]);
  const [libraries, setLibraries] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [articles, setArticles] = useState([]);
  const [activeNearbyTab, setActiveNearbyTab] = useState('perpustakaan'); // perpustakaan, toko, komunitas
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [booksRes, storesRes, libsRes, commsRes, eventsRes, artsRes] = await Promise.all([
          bookService.getBooks({ limit: 5 }),
          storeService.getStores({ userLat: location.lat, userLng: location.lng }),
          libraryService.getLibraries({ userLat: location.lat, userLng: location.lng }),
          communityService.getCommunities({ userLat: location.lat, userLng: location.lng }),
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

  const quickCategories = [
    {
      title: 'Buku',
      desc: 'Jelajahi koleksi buku',
      icon: BookOpen,
      color: 'bg-emerald-50 text-[#075E54] border-emerald-100',
      link: '/buku',
    },
    {
      title: 'Perpustakaan',
      desc: 'Temukan perpustakaan terdekat',
      icon: Landmark,
      color: 'bg-teal-50 text-[#0F766E] border-teal-100',
      link: '/literasi/perpustakaan',
    },
    {
      title: 'Toko Buku',
      desc: 'Dukung toko buku lokal',
      icon: Store,
      color: 'bg-emerald-50 text-[#075E54] border-emerald-100',
      link: '/literasi/toko',
    },
    {
      title: 'Kelas & Event',
      desc: 'Tingkatkan kemampuanmu',
      icon: GraduationCap,
      color: 'bg-cyan-50 text-cyan-800 border-cyan-100',
      link: '/event',
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-[#075E54] text-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left Text */}
          <div className="flex-1 space-y-4 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-sm text-emerald-100 border border-white/20">
              <Compass className="w-3.5 h-3.5" />
              Ekosistem Literasi Kabupaten Sidrap
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Temukan Literasi di Sekitarmu
            </h1>

            <p className="text-emerald-100 font-medium text-base sm:text-lg">
              Cari. Baca. Belajar. Berbagi.
            </p>

            <p className="text-white/80 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Temukan buku, perpustakaan, toko buku, komunitas, dan kegiatan literasi yang ada di sekitar Anda di seluruh Kabupaten Sidrap.
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <Button
                size="lg"
                onClick={() => navigate('/buku')}
                className="bg-white text-[#075E54] hover:bg-emerald-50 font-semibold shadow-md"
              >
                Jelajahi Sekarang <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={requestGeolocation}
                disabled={isDetecting}
                className="border-white/40 text-white bg-white/10 hover:bg-white/20"
              >
                <MapPin className="w-4 h-4 mr-1 text-emerald-300" />
                {isDetecting ? 'Mendeteksi...' : location.isDetected ? location.district : 'Aktifkan Lokasi Saya'}
              </Button>
            </div>
          </div>

          {/* Right Visual (Authentic literacy photography feel) */}
          <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80"
                alt="Aktivitas Literasi Masyarakat Sidrap"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 sm:p-6">
                <div className="text-white">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-300">Aktivitas Komunitas</p>
                  <p className="text-sm font-medium">Lapak Baca & Diskusi Pemuda di Ruang Terbuka Sidrap</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QUICK CATEGORY CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {quickCategories.map((cat) => {
            const IconComponent = cat.icon;
            return (
              <Link
                key={cat.title}
                to={cat.link}
                className="group bg-white rounded-2xl p-4 sm:p-5 border border-[#E5E7EB] shadow-card hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-1 transition-all flex items-center gap-3.5"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 border ${cat.color} group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-[#17211D] group-hover:text-[#075E54] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. BUKU PILIHAN & LITERASI TERDEKAT (Two Columns Grid matching mockup) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Buku Pilihan (7 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#17211D] tracking-tight">
                  Buku Pilihan
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Rekomendasi bacaan terbaik dari perpustakaan dan toko buku di Sidrap
                </p>
              </div>
              <Link
                to="/buku"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#075E54] hover:underline"
              >
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((n) => (
                  <CardSkeleton key={n} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {books.slice(0, 4).map((book) => (
                  <BookCard key={book.id} book={book} />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Literasi di Sekitarmu (4 cols matching mockup right box) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#17211D]">
                    Literasi di Sekitarmu
                  </h3>
                  <p className="text-xs text-gray-500">
                    Berdasarkan lokasi: <strong className="text-[#075E54]">{location.name}</strong>
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex bg-gray-100 p-1 rounded-xl gap-1 mb-4">
                <button
                  onClick={() => setActiveNearbyTab('perpustakaan')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeNearbyTab === 'perpustakaan'
                      ? 'bg-[#075E54] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Perpustakaan
                </button>
                <button
                  onClick={() => setActiveNearbyTab('toko')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeNearbyTab === 'toko'
                      ? 'bg-[#075E54] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Toko Buku
                </button>
                <button
                  onClick={() => setActiveNearbyTab('komunitas')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    activeNearbyTab === 'komunitas'
                      ? 'bg-[#075E54] text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Komunitas
                </button>
              </div>

              {/* List Cards with km distance */}
              <div className="space-y-3">
                {activeNearbyTab === 'perpustakaan' &&
                  libraries.map((lib) => (
                    <Link
                      key={lib.id}
                      to={`/literasi/perpustakaan/${lib.id}`}
                      className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-teal-50 text-[#0F766E] flex items-center justify-center shrink-0">
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-[#17211D] truncate group-hover:text-[#075E54]">
                            {lib.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 truncate">
                            {lib.district} • {lib.openHours}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                          {lib.formattedDistance}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#075E54]" />
                      </div>
                    </Link>
                  ))}

                {activeNearbyTab === 'toko' &&
                  stores.map((st) => (
                    <Link
                      key={st.id}
                      to={`/literasi/toko/${st.id}`}
                      className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-[#17211D] truncate group-hover:text-[#075E54]">
                            {st.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 truncate">
                            {st.district} • Buka sekarang
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {st.formattedDistance}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#075E54]" />
                      </div>
                    </Link>
                  ))}

                {activeNearbyTab === 'komunitas' &&
                  communities.map((cm) => (
                    <Link
                      key={cm.id}
                      to={`/komunitas/${cm.id}`}
                      className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#075E54] flex items-center justify-center shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-[#17211D] truncate group-hover:text-[#075E54]">
                            {cm.name}
                          </h4>
                          <p className="text-[11px] text-gray-500 truncate">
                            {cm.district} • {cm.totalMembers} anggota
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          {cm.formattedDistance}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#075E54]" />
                      </div>
                    </Link>
                  ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 text-center">
              <Link
                to={
                  activeNearbyTab === 'perpustakaan'
                    ? '/literasi/perpustakaan'
                    : activeNearbyTab === 'toko'
                    ? '/literasi/toko'
                    : '/komunitas'
                }
                className="text-xs font-semibold text-[#075E54] hover:underline"
              >
                Lihat Semua {activeNearbyTab === 'perpustakaan' ? 'Perpustakaan' : activeNearbyTab === 'toko' ? 'Toko Buku' : 'Komunitas'} Terdekat →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EVENT LITERASI SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#17211D] tracking-tight">
              Event Literasi
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Temukan kegiatan bedah buku, lapak baca, dan diskusi di sekitar Sidrap
            </p>
          </div>
          <Link
            to="/event"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#075E54] hover:underline"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} />
          ))}
        </div>
      </section>

      {/* 5. BACA 5 MENIT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-900/5 rounded-3xl p-6 sm:p-8 border border-emerald-900/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full mb-1">
                <Clock className="w-3.5 h-3.5" /> Baca 5 Menit
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#17211D] tracking-tight">
                Mulai Dari 5 Menit
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Tidak punya banyak waktu? Luangkan 5 menit untuk menambah wawasan dan sejarah Sidrap.
              </p>
            </div>
            <Link
              to="/baca-5-menit"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#075E54] hover:underline"
            >
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION (CTA) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#075E54] to-[#0F766E] p-8 sm:p-12 text-white text-center shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Temukan dunia literasi di sekitarmu.
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Bergabunglah bersama ribuan masyarakat Sidrap dalam membaca buku, mengunjungi perpustakaan desa, dan meramaikan komunitas literasi.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate('/buku')}
                className="bg-white text-[#075E54] hover:bg-emerald-50 font-semibold"
              >
                Mulai Menjelajah
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/mitra')}
                className="border-white/40 text-white bg-white/10 hover:bg-white/20"
              >
                Daftar Sebagai Mitra
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
