import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  Sparkles,
} from 'lucide-react';
import { eventService } from '../../services/dataServices';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

export const EventDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const res = await eventService.getEventById(id);
        if (res?.data) {
          setEvent(res.data);
          setIsRegistered(res.data.isRegistered || false);
        }
      } catch (err) {
        console.error('Failed to load event detail:', err);
        showToast('Gagal memuat detail event.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!isAuthenticated) {
      showToast('Silakan masuk (login) terlebih dahulu untuk mendaftar event.', 'info');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await eventService.registerEvent(event.id);
      setIsRegistered(true);
      showToast(res.message || 'Pendaftaran event berhasil!', 'success');
      // Refresh event
      const refreshed = await eventService.getEventById(event.id);
      if (refreshed?.data) setEvent(refreshed.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mendaftar event.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="w-1/3 h-6" />
        <Skeleton className="w-full h-80 rounded-3xl" />
        <Skeleton className="w-2/3 h-8" />
        <Skeleton className="w-1/2 h-5" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-[#17211D]">Event tidak ditemukan.</h2>
        <Link to="/event" className="text-[#075E54] font-bold hover:underline inline-block text-sm">
          ← Kembali ke Agenda Event
        </Link>
      </div>
    );
  }

  const formattedDate = new Date(event.eventDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const isFull = event.currentParticipants >= event.quota;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Event', link: '/event' },
          { label: event.title },
        ]}
      />

      {/* Banner */}
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-[#E8F3EF] shadow-xs border border-[#E2E8E5]">
        <ImageWithFallback
          src={event.image || event.banner}
          alt={event.title}
          fallbackIcon={Calendar}
          fallbackText={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-[#075E54] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {event.category?.replace('_', ' ') || 'Workshop Literasi'}
          </span>
          {event.audience && (
            <span className="bg-white/95 text-[#17211D] text-xs font-bold px-3 py-1 rounded-full shadow-md">
              Audiens: {event.audience}
            </span>
          )}
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211D] leading-tight">
          {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-[#66736D]">
          <span className="flex items-center gap-1.5 font-bold text-[#075E54]">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            {event.startTime} - {event.endTime} WITA
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            {event.locationName}, {event.district ? `${event.district}, Sidrap` : 'Sidrap'}
          </span>
        </div>
      </div>

      {/* Main Grid: Details and Registration Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left 2 cols: Description */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E2E8E5] shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#17211D]">Tentang Kegiatan</h3>
            <p className="whitespace-pre-line leading-relaxed text-xs sm:text-sm text-[#17211D]/80">
              {event.description}
            </p>

            <h4 className="text-sm font-bold text-[#17211D] pt-4 border-t border-gray-100">
              Lokasi Lengkap
            </h4>
            <p className="text-xs text-[#66736D] flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#075E54] shrink-0 mt-0.5" />
              <span>{event.address || event.locationName}, Kec. {event.district || 'Pangkajene'}, Kab. Sidrap</span>
            </p>
          </div>

          {/* Organizer Card */}
          {event.organizer && (
            <div className="bg-white p-5 rounded-2xl border border-[#E2E8E5] shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#E8F3EF] border border-[#cbe1d7] flex items-center justify-center shrink-0 overflow-hidden">
                  <Building2 className="w-6 h-6 text-[#075E54]" />
                </div>
                <div>
                  <p className="text-[10px] text-[#66736D] font-bold uppercase tracking-wider">Penyelenggara</p>
                  <h4 className="font-bold text-sm text-[#17211D]">
                    {typeof event.organizer === 'object' && event.organizer !== null
                      ? event.organizer.name || event.organizer.organizationName || 'Penyelenggara Literasi'
                      : event.organizer || 'Penyelenggara Literasi'}
                  </h4>
                  <p className="text-xs text-[#66736D]">Kabupaten Sidrap</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 col: Registration Box */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-[#E2E8E5] shadow-sm space-y-4 sticky top-24">
            <h3 className="font-bold text-sm text-[#17211D] border-b border-gray-100 pb-2.5">
              Pendaftaran Event
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#66736D]">Biaya Partisipasi:</span>
                <span className="font-bold text-[#075E54] bg-[#E8F3EF] px-2.5 py-0.5 rounded-full border border-[#cbe1d7]">
                  {event.isFree ? 'Gratis' : `Rp ${event.price?.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#66736D]">Kapasitas Total:</span>
                <span className="font-bold text-[#17211D]">{event.quota} Peserta</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#66736D]">Jumlah Terdaftar:</span>
                <span className="font-bold text-[#075E54]">{event.currentParticipants} Peserta</span>
              </div>
            </div>

            {/* Quota Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#075E54] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (event.currentParticipants / (event.quota || 1)) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-[#66736D] text-right">
                Tersisa {Math.max(0, event.quota - event.currentParticipants)} kursi
              </p>
            </div>

            {/* Registration CTA Statuses (Section 22) */}
            {isRegistered ? (
              <div className="p-3.5 rounded-2xl bg-[#E8F3EF] border border-[#cbe1d7] text-center space-y-1">
                <p className="text-xs font-bold text-[#075E54] flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#075E54]" />
                  Anda Sudah Terdaftar
                </p>
                <p className="text-[11px] text-[#075E54]/80">
                  Konfirmasi kehadiran dapat Anda tunjukkan kepada petugas saat acara berlangsung.
                </p>
              </div>
            ) : isFull ? (
              <Button
                variant="outline"
                size="md"
                className="w-full font-bold text-gray-500 bg-gray-100 border-gray-200 cursor-not-allowed"
                disabled={true}
              >
                Event Penuh
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="w-full bg-[#075E54] hover:bg-[#05473F] text-white font-bold shadow-xs gap-1.5"
                isLoading={isSubmitting}
                onClick={handleRegister}
              >
                <Calendar className="w-4 h-4" /> Daftar Event (+10 XP)
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
