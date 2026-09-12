import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  KeyRound,
  Edit,
  Sparkles,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Avatar } from '../../components/common/Avatar';
import { Breadcrumb } from '../../components/common/Breadcrumb';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Edit Profile Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editDistrict, setEditDistrict] = useState(user?.district || 'Pangkajene');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Change Password Modal
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const districts = [
    'Pangkajene',
    'Maritengngae',
    'Baranti',
    'Watang Pulu',
    'Tellu Limpoe',
    'Dua Pitue',
    'Panca Rijang',
    'Kulo',
    'Panca Lautang',
    'Watang Sidenreng',
    'Pitu Riase',
  ];

  const handleOpenEditProfile = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditDistrict(user?.district || 'Pangkajene');
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Nama tidak boleh kosong.', 'error');
      return;
    }

    try {
      setIsSubmittingProfile(true);
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('phone', editPhone);
      formData.append('district', editDistrict);

      const res = await authService.updateProfile(formData);
      showToast(res.message || 'Profil berhasil diperbarui!', 'success');
      await refreshUser();
      setIsEditProfileOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal memperbarui profil.', 'error');
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Kata sandi baru minimal 6 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok.', 'error');
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const res = await authService.changePassword({ newPassword });
      showToast(res.message || 'Kata sandi berhasil diubah!', 'success');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangePasswordOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengubah kata sandi.', 'error');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: 'Profil Pengguna' }]} />

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <Avatar
            src={user?.avatar}
            name={user?.name}
            size="xl"
            className="ring-4 ring-[#E8F3EF]"
          />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#17211D]">
                {user?.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F3EF] text-[#075E54]">
                {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'MITRA' ? 'Mitra Sidrap' : 'Warga Pembaca'}
              </span>
            </div>
            <p className="text-xs text-[#66736D]">{user?.email}</p>
            <p className="text-xs text-[#075E54] font-semibold flex items-center justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5" /> Kecamatan {user?.district || 'Pangkajene'}, Sidrap
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleOpenEditProfile}
            className="gap-1.5 border-[#E2E8E5]"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Profil
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsChangePasswordOpen(true)}
            className="gap-1.5 border-[#E2E8E5]"
          >
            <KeyRound className="w-3.5 h-3.5" /> Ubah Password
          </Button>
        </div>
      </div>

      {/* Detail Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info Card */}
        <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#17211D] border-b border-gray-100 pb-3">
            Informasi Pribadi & Kontak
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-[#66736D] flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Nama Lengkap
              </span>
              <strong className="text-[#17211D]">{user?.name}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-[#66736D] flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" /> Email Terdaftar
              </span>
              <strong className="text-[#17211D]">{user?.email}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-[#66736D] flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> Nomor Telepon / WA
              </span>
              <strong className="text-[#17211D]">{user?.phone || '-'}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-100">
              <span className="text-[#66736D] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Wilayah Kecamatan
              </span>
              <strong className="text-[#17211D]">Kec. {user?.district || 'Pangkajene'}</strong>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#66736D] flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" /> Peran Akses (Role)
              </span>
              <strong className="text-[#075E54]">{user?.role}</strong>
            </div>
          </div>
        </div>

        {/* Gamification & Literacy Stats Card */}
        <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#17211D] border-b border-gray-100 pb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Statistik Literasi
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="p-4 rounded-2xl bg-[#E8F3EF] border border-[#cbe1d7] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#075E54]">Tingkat Pembaca</span>
                <p className="text-base font-extrabold text-[#075E54]">{user?.level || 'Pembaca Pemula'}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#075E54]">Total XP</span>
                <p className="text-base font-extrabold text-[#075E54]">{user?.points || 0} XP</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F8FAF8] border border-[#E2E8E5] space-y-2">
              <p className="font-semibold text-[#17211D]">Aktivitas Terhubung</p>
              <p className="text-[11px] text-[#66736D] leading-relaxed">
                Akun Anda telah terintegrasi dengan ekosistem literasi Kabupaten Sidrap. Anda dapat meminjam buku, memesan via WhatsApp, dan mengikuti event komunitas.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profil Pengguna"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
          <Input
            label="Nama Lengkap *"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          <Input
            label="Nomor WhatsApp / HP"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="081234567890"
          />

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Kecamatan Domisili di Sidrap
            </label>
            <select
              value={editDistrict}
              onChange={(e) => setEditDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  Kecamatan {d}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-[#E2E8E5] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditProfileOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingProfile}
              className="bg-[#075E54] text-white font-bold"
            >
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* CHANGE PASSWORD MODAL */}
      <Modal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        title="Ubah Kata Sandi Akun"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Kata Sandi Baru (Min. 6 karakter) *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full px-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Konfirmasi Kata Sandi Baru *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            />
          </div>

          <div className="pt-3 border-t border-[#E2E8E5] flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsChangePasswordOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSubmittingPassword}
              className="bg-[#075E54] text-white font-bold"
            >
              Perbarui Kata Sandi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
