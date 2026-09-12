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
  Activity,
  Award,
} from 'lucide-react';
import { communityService } from '../../services/dataServices';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/common/Button';
import { EventCard } from '../../components/cards/EventCard';
import { Skeleton } from '../../components/common/Skeleton';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';

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
      showToast('Silakan login terlebih dahulu untuk bergabung dengan komunitas.', 'info');
      return;
    }

    try {
      setIsSubmittingJoin(true);
      const res = await communityService.toggleJoin(community.id);
      showToast(res.message || 'Status keanggotaan berhasil diperbarui!', 'success');
      // Refresh details
      const refreshed = await communityService.getCommunityById(community.id);
      if (refreshed?.data) setCommunity(refreshed.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui status keanggotaan.', 'error');
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="w-full h-64 rounded-3xl" />
        <Skeleton className="w-1/3 h-8" />
      </div>
    );
  }

  if (!community) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-[#17211D]">Komunitas tidak ditemukan.</h2>
        <Link to="/komunitas" className="text-[#075E54] font-bold hover:underline inline-block text-sm">
          ← Kembali ke Daftar Komunitas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Komunitas', link: '/komunitas' },
          { label: community.name },
        ]}
      />

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8E5] overflow-hidden shadow-xs">
        <div className="h-48 sm:h-64 relative bg-[#075E54]">
          <ImageWithFallback
            src={community.banner}
            alt={community.name}
            fallbackIcon={Users}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden shrink-0">
                <ImageWithFallback
                  src={community.logo}
                  alt={community.name}
                  fallbackIcon={Users}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211D]">
                  {community.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#66736D] flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#075E54]" />
                  {community.address}, Kec. {community.district}, Sidrap
                </p>
              </div>
            </div>

            {/* Join CTA */}
            <Button
              variant={community.isMember ? 'outline' : 'primary'}
              size="md"
              isLoading={isSubmittingJoin}
              onClick={handleToggleJoin}
              className={`font-bold gap-2 ${
                community.isMember
                  ? 'border-emerald-600 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                  : 'bg-[#075E54] text-white hover:bg-[#05473F] shadow-sm'
              }`}
            >
              {community.isMember ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Sudah Bergabung
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Gabung Komunitas (+10 XP)
                </>
              )}
            </Button>
          </div>

          <p className="text-xs sm:text-sm text-[#17211D]/80 mt-5 max-w-3xl leading-relaxed">
            {community.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-gray-100 text-xs text-[#66736D]">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#075E54]" />
              <span>Anggota Terdaftar: <strong className="text-[#17211D]">{community.totalMembers || community.membersCount || 15} Orang</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#075E54]" />
              <span>Agenda Kegiatan: <strong className="text-[#17211D]">{community.events?.length || 0} Event Terjadwal</strong></span>
            </div>
            {community.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#075E54]" />
                <span>Narahubung: <strong className="text-[#17211D]">+{community.phone}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Community Activities & Events Section */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-extrabold text-[#17211D]">
            Agenda & Kegiatan Komunitas
          </h3>
          <p className="text-xs text-[#66736D]">
            Kegiatan literasi yang diadakan oleh pengurus {community.name}
          </p>
        </div>

        {community.events && community.events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {community.events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E2E8E5] p-8 text-center space-y-2">
            <Calendar className="w-10 h-10 text-gray-400 mx-auto" />
            <h4 className="text-sm font-bold text-[#17211D]">Belum Ada Event Aktif</h4>
            <p className="text-xs text-[#66736D] max-w-sm mx-auto">
              Komunitas ini belum menjadwalkan event baru. Pantau terus halaman ini untuk pembaruan agenda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
