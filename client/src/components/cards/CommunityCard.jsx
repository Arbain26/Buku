import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';
import { LocationBadge } from '../common/LocationBadge';

export const CommunityCard = ({ community }) => {
  if (!community) return null;

  const {
    id,
    name,
    address,
    district,
    distance,
    formattedDistance,
    totalMembers = 15,
    membersCount,
    totalEvents = 0,
    eventsCount,
    logo,
    description,
  } = community;

  const members = membersCount || totalMembers || 0;
  const events = eventsCount || totalEvents || 0;

  return (
    <div className="group bg-white rounded-2xl border border-[#E2E8E5] p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-0.5">
      <div>
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl bg-[#E8F3EF] border border-[#cbe1d7] flex items-center justify-center shrink-0 overflow-hidden">
            <ImageWithFallback
              src={logo}
              alt={name}
              fallbackIcon={Users}
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

        {description && (
          <p className="text-xs text-[#66736D] line-clamp-2 mb-3 bg-[#F8FAF8] p-2.5 rounded-xl border border-[#E2E8E5]/70">
            {description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-[#66736D] mb-3">
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#075E54]" />
            <span className="font-semibold text-[#17211D]">{members} Anggota</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#075E54]" />
            <span className="font-semibold text-[#17211D]">{events} Event</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
        <LocationBadge distance={distance || (formattedDistance ? parseFloat(formattedDistance) : undefined)} district={district} />

        <Link
          to={`/komunitas/${id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#075E54] hover:underline"
        >
          Lihat Komunitas <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
