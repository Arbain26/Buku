import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  ChevronRight,
  Package,
} from 'lucide-react';
import { storeService } from '../../services/dataServices';
import { useLocation } from '../../contexts/LocationContext';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const StoreDetailPage = () => {
  const { id } = useParams();
  const { location } = useLocation();

  const [store, setStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setIsLoading(true);
        const res = await storeService.getStoreById(id, {
          userLat: location.lat,
          userLng: location.lng,
        });
        if (res?.data) {
          setStore(res.data);
        }
      } catch (err) {
        console.error('Failed to load store detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [id, location.lat, location.lng]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
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

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Toko buku tidak ditemukan.</h2>
        <Link to="/literasi/toko" className="text-[#075E54] font-medium hover:underline mt-2 inline-block">
          ← Kembali ke Daftar Toko Buku
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-[#075E54]">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/literasi/toko" className="hover:text-[#075E54]">Toko Buku</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-[#17211D] truncate">{store.name}</span>
      </nav>

      {/* Banner & Store Header Card */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="h-48 sm:h-64 relative bg-emerald-900">
          <img
            src={store.banner || 'https://images.unsplash.com/photo-1507842229451-7f01e677c423?w=1200&auto=format&fit=crop&q=80'}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden shrink-0">
                <img
                  src={store.logo || 'https://images.unsplash.com/photo-1526243741027-444d633d7080?w=200&auto=format&fit=crop&q=80'}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D]">
                  {store.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {store.address}, Kec. {store.district}, Sidrap
                </p>
              </div>
            </div>

            <span className="inline-flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Jarak {store.formattedDistance} dari lokasi Anda
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mt-5 max-w-3xl leading-relaxed">
            {store.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Jam Operasional: <strong>{store.openHours}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp: <strong>+{store.phoneWa}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-gray-400" />
              <span>Total Koleksi: <strong>{store.products?.length || 0} Judul Tersedia</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Products Catalog */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#17211D]">
          Buku yang Tersedia di Toko Ini
        </h3>

        {store.products && store.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {store.products.map((product) => (
              <div
                key={product.productId}
                className="bg-white rounded-2xl border border-[#E5E7EB] p-3.5 flex flex-col justify-between shadow-xs hover:shadow-card-hover transition-shadow"
              >
                <div>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 mb-3 relative">
                    <img
                      src={product.coverImage}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-semibold bg-white/95 px-2 py-0.5 rounded-md text-emerald-800">
                      {product.category}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-[#17211D] line-clamp-1">
                    {product.title}
                  </h4>
                  <p className="text-xs text-gray-500">{product.author}</p>

                  <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-sm font-bold text-[#075E54]">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-gray-500">Stok: {product.stock}</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                  <a
                    href={product.waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 bg-[#075E54] text-white text-xs font-semibold py-2 rounded-xl hover:bg-[#05473F] transition-colors shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Pesan via WhatsApp
                  </a>

                  <Link
                    to={`/buku/${product.bookId}`}
                    className="block text-center text-[11px] text-gray-500 hover:text-[#075E54] hover:underline"
                  >
                    Lihat Sinopsis Buku
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada buku terdaftar"
            description="Toko ini belum menambahkan daftar inventaris buku."
          />
        )}
      </div>
    </div>
  );
};
