import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Compass,
} from 'lucide-react';
import { eventService } from '../../services/dataServices';
import { useLocation } from '../../contexts/LocationContext';
import { EventCard } from '../../components/cards/EventCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const EventsPage = () => {
  const { location } = useLocation();

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Semua');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedAudience, setSelectedAudience] = useState('Semua');
  const [sortBy, setSortBy] = useState('terbaru'); // terbaru, terdekat

  const districts = ['Semua', 'Pangkajene', 'Maritengngae', 'Baranti', 'Tellu Limpoe', 'Watang Pulu'];
  const audiences = ['Semua', 'ANAK', 'REMAJA', 'DEWASA', 'UMUM'];
  const categories = ['Semua', 'BEDAH_BUKU', 'DISKUSI', 'LAPAK_BACA', 'PELATIHAN', 'FESTIVAL_LITERASI'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const res = await eventService.getEvents({
          search: searchQuery,
          district: selectedDistrict,
          category: selectedCategory,
          audience: selectedAudience,
          userLat: location.lat,
          userLng: location.lng,
        });
        if (res?.data) {
          let sorted = [...res.data];
          if (sortBy === 'terdekat') {
            sorted.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
          }
          setEvents(sorted);
        }
      } catch (err) {
        console.error('Failed to load events:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [searchQuery, selectedDistrict, selectedCategory, selectedAudience, sortBy, location.lat, location.lng]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D] tracking-tight">
          Event Literasi
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Temukan berbagai kegiatan lapak baca, diskusi, dan festival literasi di sekitarmu
        </p>
      </div>

      {/* Filter Bar matching mockup */}
      <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* District Filter */}
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#075E54]"
          >
            {districts.map((d) => (
              <option key={d} value={d}>
                {d === 'Semua' ? '📍 Semua Lokasi' : `📍 Kec. ${d}`}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#075E54]"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'Semua' ? '📚 Semua Kategori' : c.replace('_', ' ')}
              </option>
            ))}
          </select>

          {/* Audience Filter */}
          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#075E54]"
          >
            {audiences.map((a) => (
              <option key={a} value={a}>
                {a === 'Semua' ? '👥 Semua Audiens' : `Audiens ${a}`}
              </option>
            ))}
          </select>
        </div>

        {/* Sort toggle (Terbaru / Terdekat) */}
        <div className="flex bg-gray-100 p-1 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setSortBy('terbaru')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              sortBy === 'terbaru'
                ? 'bg-[#075E54] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Terbaru
          </button>
          <button
            onClick={() => setSortBy('terdekat')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              sortBy === 'terdekat'
                ? 'bg-[#075E54] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Terdekat
          </button>
        </div>
      </div>

      {/* Events Grid and Nearby Events sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 8 cols: Events list */}
        <div className="lg:col-span-8 space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[1, 2, 3, 4].map((n) => (
                <CardSkeleton key={n} />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {events.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Tidak ada event ditemukan"
              description="Coba ubah kata kunci pencarian atau filter lokasi."
              actionText="Reset Filter"
              onAction={() => {
                setSelectedDistrict('Semua');
                setSelectedCategory('Semua');
                setSelectedAudience('Semua');
                setSearchQuery('');
              }}
            />
          )}
        </div>

        {/* Right 4 cols: Event di Sekitar Anda matching mockup */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-[#17211D]">Event di Sekitar Anda</h3>
            <span className="text-xs text-gray-400 font-medium">Sidrap</span>
          </div>

          {/* Map Preview Graphic */}
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=600&auto=format&fit=crop&q=80"
              alt="Peta Lokasi Sidrap"
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-[#075E54]/20 flex items-center justify-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-[#075E54] shadow-md">
                <MapPin className="w-3.5 h-3.5 fill-[#075E54]" />
                {location.name}
              </span>
            </div>
          </div>

          {/* Nearby list items with km distance */}
          <div className="space-y-2.5 text-xs">
            {events.slice(0, 4).map((ev) => (
              <Link
                key={ev.id}
                to={`/event/${ev.id}`}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <h4 className="font-semibold text-[#17211D] truncate">{ev.title}</h4>
                  <p className="text-[11px] text-gray-500">
                    {ev.district} • {new Date(ev.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                  {ev.formattedDistance}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
