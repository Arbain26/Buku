import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin, ArrowRight } from 'lucide-react';

export const CommunityCard = ({ community }) => {
  const {
    id,
    name,
    address,
    district,
    totalMembers = 15,
    totalEvents = 0,
    logo,
    description,
  } = community;

  return (
    <div className="group bg-white rounded-2xl border border-[#E5E7EB] p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-0.5">
      <div>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 overflow-hidden">
            {logo ? (
              <img src={logo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <Users className="w-6 h-6 text-[#075E54]" />
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

        <p className="text-xs text-gray-600 line-clamp-2 mb-3 bg-[#F8FAF8] p-2.5 rounded-xl">
          {description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-[#17211D]">{totalMembers} Anggota</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium text-[#17211D]">{totalEvents} Event</span>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-100 mt-auto flex justify-end">
        <Link
          to={`/komunitas/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075E54] hover:underline"
        >
          Lihat Komunitas <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
