import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  MapPin,
  Calendar,
  Phone,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { communityService } from '../../services/dataServices';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { EventCard } from '../../components/cards/EventCard';
import { Skeleton } from '../../components/common/Skeleton';

export const CommunityDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [community, setCommunity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setIsLoading(true);
        const res = await communityService.getCommunityById(id);
        if (res?.data) {
          setCommunity(res.data);
        }
      } catch (err) {
        console.error('Failed to load community detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunity();
  }, [id]);

  const handleToggleJoin = async () => {
    if (!isAuthenticated) {
      showToast('Silakan login terlebih dahulu untuk bergabung.', 'info');
      return;
    }

    try {
      setIsSubmittingJoin(true);
      const res = await communityService.toggleJoin(community.id);
      showToast(res.message, 'success');
      // Refresh
      const refreshed = await communityService.getCommunityById(community.id);
      if (refreshed?.data) setCommunity(refreshed.data);
    } catch (err) {
      showToast('Gagal mengubah status keanggotaan.', 'error');
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-10 space-y-6">
        <Skeleton className="w-full h-64 rounded-3xl" />
        <Skeleton className="w-1/3 h-8" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-gray-800">Komunitas tidak ditemukan.</h2>
        <Link to="/komunitas" className="text-[#075E54] font-medium hover:underline mt-2 inline-block">
          ← Kembali ke Daftar Komunitas
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
        <Link to="/komunitas" className="hover:text-[#075E54]">Komunitas</Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        <span className="font-semibold text-[#17211D] truncate">{community.name}</span>
      </nav>

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-[#E5E7EB] overflow-hidden shadow-sm">
        <div className="h-48 sm:h-64 relative bg-[#075E54]">
          <img
            src={community.banner || 'https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=1200&auto=format&fit=crop&q=80'}
            alt={community.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden shrink-0">
                <img
                  src={community.logo || 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&auto=format&fit=crop&q=80'}
                  alt={community.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#17211D]">
                  {community.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  {community.address}, Kec. {community.district}, Sidrap
                </p>
              </div>
            </div>

            <Button
              variant={community.isMember ? 'outline' : 'primary'}
              size="md"
              isLoading={isSubmittingJoin}
              onClick={handleToggleJoin}
            >
              {community.isMember ? 'Sudah Bergabung (Keluar)' : 'Ikuti Komunitas (+15 Poin)'}
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-gray-600 mt-5 max-w-3xl leading-relaxed">
            {community.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-gray-100 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Total Anggota: <strong>{community.totalMembers} Orang</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Event Diselenggarakan: <strong>{community.totalEvents} Kegiatan</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Narahubung: <strong>+{community.phoneWa}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Activities and Upcoming Events */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left: Regular activities */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#17211D] border-b border-gray-100 pb-2.5">
              Ragam Aktivitas Komunitas
            </h3>
            <ul className="space-y-2 text-xs text-gray-600">
              {community.activities?.map((act, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#075E54] shrink-0" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Members preview */}
          <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#17211D] border-b border-gray-100 pb-2.5">
              Penggerak & Anggota Aktif
            </h3>
            <div className="space-y-2.5">
              {community.members?.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5 text-xs">
                  <img
                    src={m.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                    alt={m.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-[#17211D] truncate">{m.name}</p>
                    <p className="text-[10px] text-gray-400">{m.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Upcoming events */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold text-[#17211D]">
            Agenda Kegiatan Mendatang
          </h3>

          {community.upcomingEvents && community.upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {community.upcomingEvents.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={{
                    ...ev,
                    organizer: community.name,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-xs text-gray-500">
              Belum ada event terjadwal dari komunitas ini dalam waktu dekat.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
