import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const EventCard = ({ event }) => {
  if (!event) return null;

  const {
    id,
    title,
    eventDate,
    startTime = '09:00',
    endTime = '12:00',
    locationName,
    district,
    banner,
    organizer,
    quota = 50,
    currentParticipants = 0,
    status = 'UPCOMING',
  } = event;

  const dateObj = new Date(eventDate);
  const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
  const dayNum = dateObj.getDate();
  const monthName = dateObj.toLocaleDateString('id-ID', { month: 'short' });
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const isOngoing = status === 'ONGOING';
  const isCompleted = status === 'COMPLETED';

  return (
    <div className="group bg-white rounded-2xl border border-[#E2E8E5] overflow-hidden flex flex-col transition-all duration-200 hover:shadow-card-hover hover:border-[#075E54]/30 hover:-translate-y-0.5">
      {/* Banner with ImageWithFallback */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#E8F3EF]">
        <ImageWithFallback
          src={banner}
          alt={title}
          fallbackIcon={Calendar}
          fallbackText={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Date badge on top-left */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs rounded-xl p-1.5 px-2.5 text-center shadow-md border border-white/60">
          <span className="block text-[10px] font-bold uppercase text-[#075E54] tracking-wider">
            {monthName}
          </span>
          <span className="block text-base font-extrabold text-[#17211D] leading-none">
            {dayNum}
          </span>
        </div>

        {/* Status Badge */}
        <span
          className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
            isOngoing
              ? 'bg-emerald-600 text-white'
              : isCompleted
              ? 'bg-gray-600 text-white'
              : 'bg-[#075E54] text-white'
          }`}
        >
          {isOngoing ? 'Sedang berlangsung' : isCompleted ? 'Selesai' : 'Akan datang'}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="font-bold text-sm text-[#17211D] line-clamp-2 group-hover:text-[#075E54] transition-colors mb-2 leading-snug">
            {title}
          </h4>

          <div className="space-y-1.5 text-xs text-[#66736D] mb-3">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#075E54] shrink-0" />
              <span>{startTime} - {endTime} WITA</span>
            </div>

            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#075E54] shrink-0" />
              <span className="truncate">{locationName || (district ? `${district}, Sidrap` : 'Kab. Sidrap')}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#075E54] shrink-0" />
              <span>Kapasitas: {quota} ({currentParticipants} terdaftar)</span>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-auto">
          <span className="text-[11px] text-[#66736D] truncate max-w-[130px]">
            Oleh: <strong className="text-[#17211D]">
              {typeof organizer === 'object' && organizer !== null
                ? organizer.name || organizer.organizationName || 'Mitra Sidrap'
                : organizer || 'Mitra Sidrap'}
            </strong>
          </span>

          <Link
            to={`/event/${id}`}
            className="inline-flex items-center justify-center gap-1 bg-[#075E54] text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-[#05473F] transition-colors shadow-xs"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  );
};
