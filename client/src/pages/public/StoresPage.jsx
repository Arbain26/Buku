import React, { useState, useEffect } from 'react';
import { Store, MapPin } from 'lucide-react';
import { storeService } from '../../services/dataServices';
import { useLocation } from '../../contexts/LocationContext';
import { StoreCard } from '../../components/cards/StoreCard';
import { CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const StoresPage = () => {
  const { location } = useLocation();
  const [stores, setStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDistrict, setSelectedDistrict] = useState('Semua');

  const districts = ['Semua', 'Pangkajene', 'Maritengngae', 'Baranti', 'Tellu Limpoe', 'Watang Pulu'];

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        const res = await storeService.getStores({
          district: selectedDistrict !== 'Semua' ? selectedDistrict : undefined,
          userLat: location.lat,
          userLng: location.lng,
        });
        if (res?.data) {
          setStores(res.data);
        }
      } catch (err) {
        console.error('Failed to load stores:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [selectedDistrict, location.lat, location.lng]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D] tracking-tight">
          Toko Buku Sidrap
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Dukung usaha toko buku lokal di sekitarmu dan pesan buku langsung melalui WhatsApp
        </p>
      </div>

      {/* Filter by district */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {districts.map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDistrict(d)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedDistrict === d
                ? 'bg-[#075E54] text-white shadow-xs'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {d === 'Semua' ? 'Semua Wilayah' : `Kec. ${d}`}
          </button>
        ))}
      </div>

      {/* Store Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <CardSkeleton key={n} />
          ))}
        </div>
      ) : stores.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Tidak ada toko buku di wilayah ini"
          description="Coba pilih wilayah lain di Kabupaten Sidrap."
          actionText="Tampilkan Semua Wilayah"
          onAction={() => setSelectedDistrict('Semua')}
        />
      )}
    </div>
  );
};
