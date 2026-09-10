import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';

export const EventCard = ({ event }) => {
  const {
    id,
    title,
    eventDate,
    startTime,
    endTime,
    locationName,
    district,
    banner,
    organizer,
    quota,
    currentParticipants = 0,
    status = 'UPCOMING',
  } = event;

  const formattedDate = new Date(eventDate).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isOngoing = status === 'ONGOING';

  return (
    <div className="group bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-0.5">
      {/* Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
        <img
          src={banner || 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&auto=format&fit=crop&q=80'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Status Badge */}
        <span
          className={`absolute top-2.5 left-2.5 text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs ${
            isOngoing
              ? 'bg-emerald-600 text-white'
              : 'bg-amber-500/95 text-white'
          }`}
        >
          {isOngoing ? 'Sedang berlangsung' : 'Akan datang'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-semibold text-sm text-[#17211D] line-clamp-1 group-hover:text-[#075E54] transition-colors mb-2">
            {title}
          </h4>

          <div className="space-y-1.5 text-xs text-gray-500 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{formattedDate} • {startTime} - {endTime}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="truncate">{locationName || district}, Sidrap</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Kuota {quota} peserta ({currentParticipants} terdaftar)</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
          <span className="text-[11px] text-gray-500 truncate max-w-[130px]">
            Oleh: <strong className="text-[#17211D]">{organizer}</strong>
          </span>

          <Link
            to={`/event/${id}`}
            className="inline-flex items-center justify-center gap-1 bg-[#075E54] text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-[#05473F] transition-colors"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};
