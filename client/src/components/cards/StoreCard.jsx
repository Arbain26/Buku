import React from 'react';
import { Link } from 'react-router-dom';
import { Store, MapPin, Clock, ArrowRight } from 'lucide-react';

export const StoreCard = ({ store }) => {
  const {
    id,
    name,
    address,
    district,
    openHours = '08.00 - 21.00 WITA',
    formattedDistance = '1,2 km',
    totalProducts = 0,
    logo,
  } = store;

  return (
    <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-0.5">
      <div>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 overflow-hidden">
            {logo ? (
              <img src={logo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-6 h-6 text-[#075E54]" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-[#17211D] truncate group-hover:text-[#075E54] transition-colors">
              {name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{district ? `${district}, Sidrap` : address}</span>
            </div>
          </div>
        </div>

        <div className="space-y-1 text-xs text-gray-500 bg-[#F8FAF8] rounded-xl p-2.5 mb-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gray-400" /> Jam Buka:
            </span>
            <span className="font-medium text-[#17211D]">{openHours}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-gray-200/60">
            <span>Koleksi Buku:</span>
            <span className="font-medium text-[#075E54]">{totalProducts} Judul</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
        <span className="inline-flex items-center text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          {formattedDistance}
        </span>

        <Link
          to={`/literasi/toko/${id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#075E54] hover:underline"
        >
          Lihat Toko <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
