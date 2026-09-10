import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronRight,
  Share2,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { eventService } from '../../services/dataServices';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';

export const EventDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
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
          setIsRegistered(res.data.isRegistered);
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
      showToast(res.message, 'success');
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
        <Skeleton className="w-full h-80 rounded-2xl" />
        <Skeleton className="w-2/3 h-8" />
        <Skeleton className="w-1/2 h-5" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Event tidak ditemukan.</h2>
        <Link to="/event" className="text-[#075E54] font-medium hover:underline mt-2 inline-block">
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-[#075E54]">Beranda</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <Link to="/event" className="hover:text-[#075E54]">Event</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-[#17211D] truncate max-w-xs">{event.title}</span>
      </nav>

      {/* Banner */}
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-[#E5E7EB]">
        <img
          src={event.banner || 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1000&auto=format&fit=crop&q=80'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            {event.category?.replace('_', ' ')}
          </span>
          <span className="bg-white/95 text-gray-800 text-xs font-medium px-3 py-1 rounded-full shadow-md">
            Audiens {event.audience}
          </span>
        </div>
      </div>

      {/* Header Info */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D] leading-tight">
          {event.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-600">
          <span className="flex items-center gap-1.5 font-medium text-[#075E54]">
            <Calendar className="w-4 h-4" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            {event.startTime} - {event.endTime}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            {event.locationName}, {event.district}
          </span>
        </div>
      </div>

      {/* Main Grid: Details and Registration Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left 2 cols: Description */}
        <div className="md:col-span-2 space-y-6">
          <div className="prose prose-sm text-gray-700 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <h3 className="text-base font-bold text-[#17211D] mb-3">Tentang Kegiatan</h3>
            <p className="whitespace-pre-line leading-relaxed text-sm text-gray-600">
              {event.description}
            </p>

            <h4 className="text-sm font-bold text-[#17211D] mt-6 mb-2">Lokasi Lengkap</h4>
            <p className="text-xs text-gray-600 flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{event.address}, Kec. {event.district}, Kab. Sidenreng Rappang</span>
            </p>
          </div>

          {/* Organizer Card */}
          {event.organizer && (
            <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={event.organizer.logo || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=100&auto=format&fit=crop&q=80'}
                  alt={event.organizer.organizationName}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-100"
                />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase">Penyelenggara</p>
                  <h4 className="font-semibold text-sm text-[#17211D]">
                    {event.organizer.organizationName}
                  </h4>
                  <p className="text-xs text-gray-500">{event.organizer.district}, Sidrap</p>
                </div>
              </div>

              {event.organizer.slug && (
                <Link
                  to={`/komunitas/${event.organizer.id}`}
                  className="text-xs font-semibold text-[#075E54] hover:underline"
                >
                  Profil Penyelenggara →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Right 1 col: Registration Box */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4 sticky top-24">
            <h3 className="font-bold text-sm text-[#17211D] border-b border-gray-100 pb-2.5">
              Pendaftaran Event
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Biaya:</span>
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {event.isFree ? 'Gratis' : `Rp ${event.price?.toLocaleString('id-ID')}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Kapasitas:</span>
                <span className="font-medium text-[#17211D]">{event.quota} Peserta</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Terdaftar:</span>
                <span className="font-medium text-[#075E54]">{event.currentParticipants} Peserta</span>
              </div>
            </div>

            {/* Quota bar */}
            <div className="space-y-1">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#075E54] h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (event.currentParticipants / event.quota) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-gray-400 text-right">
                Tersisa {Math.max(0, event.quota - event.currentParticipants)} kursi
              </p>
            </div>

            {isRegistered ? (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                <p className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Anda Sudah Terdaftar!
                </p>
                <p className="text-[11px] text-emerald-700">
                  Tunjukkan konfirmasi ini saat tiba di lokasi acara.
                </p>
              </div>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="w-full"
                disabled={event.currentParticipants >= event.quota}
                isLoading={isSubmitting}
                onClick={handleRegister}
              >
                {event.currentParticipants >= event.quota ? 'Kuota Penuh' : 'Daftar Event (+20 Poin)'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
