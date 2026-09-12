import React from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { LocationBadge } from '../common/LocationBadge';

export const StoreCard = ({ store }) => {
  if (!store) return null;

  const {
    id,
    name,
    address,
    district,
    openHours = '08.00 - 21.00 WITA',
    distance,
    formattedDistance,
    totalProducts = 0,
    bookCount,
    logo,
  } = store;

  const productsCount = totalProducts || bookCount || 0;

  return (
    <div className="group bg-white rounded-2xl border border-[#E2E8E5] p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-0.5">
      <div>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-[#E8F3EF] border border-[#cbe1d7] flex items-center justify-center shrink-0 overflow-hidden">
            <ImageWithFallback
              src={logo}
              alt={name}
              fallbackIcon={Store}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-[#17211D] truncate group-hover:text-[#075E54] transition-colors">
              {name}
            </h4>
            <div className="flex items-center gap-1 text-xs text-[#66736D] mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#075E54] shrink-0" />
              <span className="truncate">{district ? `${district}, Sidrap` : address || 'Sidrap'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-xs text-[#66736D] bg-[#F8FAF8] rounded-xl p-3 mb-3 border border-[#E2E8E5]/70">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> Jam Buka:
            </span>
            <span className="font-semibold text-[#17211D]">{openHours}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-gray-400" /> Katalog:
            </span>
            <span className="font-bold text-[#075E54]">{productsCount} Judul Buku</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
        <LocationBadge distance={distance || (formattedDistance ? parseFloat(formattedDistance) : undefined)} district={district} />

        <Link
          to={`/literasi/toko/${id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#075E54] hover:underline"
        >
          Lihat Toko <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
