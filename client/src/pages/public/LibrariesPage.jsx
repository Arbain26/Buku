import React, { useState, useEffect } from 'react';
import { Landmark, MapPin } from 'lucide-react';
import { libraryService } from '../../services/dataServices';
import { useLocation } from '../../contexts/LocationContext';
import { LibraryCard } from '../../components/cards/LibraryCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const LibrariesPage = () => {
  const { location } = useLocation();
  const [libraries, setLibraries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('Semua');

  const districts = ['Semua', 'Pangkajene', 'Maritengngae', 'Baranti', 'Tellu Limpoe', 'Watang Pulu'];

  useEffect(() => {
    const fetchLibraries = async () => {
      try {
        setIsLoading(true);
        const res = await libraryService.getLibraries({
          district: selectedDistrict !== 'Semua' ? selectedDistrict : undefined,
          userLat: location.lat,
          userLng: location.lng,
        });
        if (res?.data) {
          setLibraries(res.data);
        }
      } catch (err) {
        console.error('Failed to load libraries:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibraries();
  }, [selectedDistrict, location.lat, location.lng]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D] tracking-tight">
          Perpustakaan di Kabupaten Sidrap
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Temukan perpustakaan daerah, pojok baca digital (POCADI), dan taman baca masyarakat terdekat
        </p>
      </div>

      {/* Filter by district */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {districts.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDistrict(d)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDistrict === d
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {d === 'Semua' ? 'Semua Wilayah' : `Kec. ${d}`}
          </button>
        ))}
      </div>

      {/* Libraries Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      ) : libraries.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {libraries.map((library) => (
            <LibraryCard key={library.id} library={library} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Tidak ada perpustakaan di wilayah ini"
          description="Coba pilih wilayah lain di Kabupaten Sidrap."
          actionText="Tampilkan Semua Wilayah"
          onAction={() => setSelectedDistrict('Semua')}
        />
      )}
    </div>
  );
};
