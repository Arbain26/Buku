import React, { useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  Camera,
  Upload,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { authService } from '../../services/authService';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Avatar } from '../../components/common/Avatar';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { resolveImageUrl } from '../../components/common/ImageWithFallback';

export const ProfilePage = () => {
  const { user, refreshUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();

  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);

  // Direct avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Edit Profile Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDistrict, setEditDistrict] = useState('Pangkajene');
  const [editBio, setEditBio] = useState('');
  const [modalAvatarFile, setModalAvatarFile] = useState(null);
  const [modalAvatarPreview, setModalAvatarPreview] = useState('');
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  // Change Password Modal State
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
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

  const isAdmin = user?.role === 'ADMIN';
  const isMitra = user?.role === 'MITRA';

  // Handle direct avatar upload from camera overlay button
  const handleDirectAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar (JPG, PNG, atau WEBP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto terlalu besar! Maksimal 5 MB.', 'error');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      if (user?.name) formData.append('name', user.name);

      const res = await authService.updateProfile(formData);
      await refreshUser();
      showToast(res.message || 'Foto profil berhasil diperbarui!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengunggah foto profil.', 'error');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Open Edit Profile Modal
  const handleOpenEditProfile = () => {
    setEditName(user?.name || '');
    setEditPhone(user?.phone || '');
    setEditDistrict(user?.district || 'Pangkajene');
    setEditBio(user?.bio || '');
    setModalAvatarFile(null);
    setModalAvatarPreview('');
    setIsEditProfileOpen(true);
  };

  // Select Avatar in Modal
  const handleModalAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('File harus berupa gambar (JPG, PNG, atau WEBP).', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Ukuran foto terlalu besar! Maksimal 5 MB.', 'error');
      return;
    }

    setModalAvatarFile(file);
    setModalAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveModalAvatar = () => {
    setModalAvatarFile(null);
    setModalAvatarPreview('');
    if (modalFileInputRef.current) modalFileInputRef.current.value = '';
  };

  // Save Profile (Name, Phone, District, Avatar)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Nama lengkap tidak boleh kosong.', 'error');
      return;
    }

    try {
      setIsSubmittingProfile(true);
      const formData = new FormData();
      formData.append('name', editName.trim());
      formData.append('phone', editPhone.trim());
      formData.append('district', editDistrict);
      formData.append('bio', editBio.trim());

      if (modalAvatarFile) {
        formData.append('avatar', modalAvatarFile);
      }

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

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showToast('Kata sandi saat ini wajib diisi.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Kata sandi baru minimal 6 karakter.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const res = await authService.changePassword({ currentPassword, newPassword });
      showToast(res.message || 'Kata sandi berhasil diubah!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsChangePasswordOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Gagal mengubah kata sandi.', 'error');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Dynamic Breadcrumbs
  const breadcrumbItems = isAdmin
    ? [{ label: 'Panel Admin', path: '/admin/dashboard' }, { label: 'Profil Administrator' }]
    : isMitra
    ? [{ label: 'Panel Mitra', path: '/mitra/dashboard' }, { label: 'Profil Mitra' }]
    : [{ label: 'Profil Saya' }];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hidden File Input for direct avatar upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDirectAvatarChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
      />

      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumb items={breadcrumbItems} />
        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className="text-xs font-semibold text-[#075E54] hover:underline flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
          </Link>
        )}
      </div>

      {/* Header Profile Card with Interactive Avatar */}
      <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative overflow-hidden">
        {/* Subtle decorative accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-emerald-100/40 via-transparent to-transparent rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left relative z-10">
          {/* Avatar with Camera Overlay Button */}
          <div className="relative group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-[#E8F3EF] overflow-hidden bg-gray-100 shadow-sm relative">
              <img
                src={
                  resolveImageUrl(user?.avatar) ||
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'
                }
                alt={user?.name}
                className="w-full h-full object-cover"
              />

              {/* Uploading Spinner overlay */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mb-1" />
                  <span className="text-[10px] font-bold">Menyimpan...</span>
                </div>
              )}
            </div>

            {/* Camera Overlay Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#075E54] hover:bg-[#064e46] text-white shadow-md transition-transform transform hover:scale-110 active:scale-95 border-2 border-white"
              title="Ganti Foto Profil"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          {/* User Details */}
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#17211D]">
                {user?.name}
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isAdmin
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : isMitra
                    ? 'bg-teal-50 text-teal-800 border-teal-200'
                    : 'bg-[#E8F3EF] text-[#075E54] border-emerald-200'
                }`}
              >
                {isAdmin ? 'Administrator Platform' : isMitra ? 'Mitra Sidrap' : 'Warga Pembaca'}
              </span>
            </div>

            <p className="text-xs text-[#66736D]">{user?.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-0.5 text-xs text-[#66736D]">
              <span className="text-[#075E54] font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Kecamatan {user?.district || 'Pangkajene'}, Sidrap
              </span>
              {user?.phone && (
                <span className="flex items-center gap-1 text-gray-500">
                  <Phone className="w-3.5 h-3.5" /> {user.phone}
                </span>
              )}
            </div>

            {user?.bio && (
              <p className="text-xs text-gray-600 italic pt-1 max-w-md">
                "{user.bio}"
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 relative z-10">
          <Button
            size="sm"
            onClick={handleOpenEditProfile}
            className="gap-1.5 bg-[#075E54] text-white hover:bg-[#064e46] shadow-xs"
          >
            <Edit className="w-3.5 h-3.5" /> Edit Nama & Profil
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsChangePasswordOpen(true)}
            className="gap-1.5 border-[#E2E8E5] text-gray-700 hover:bg-gray-50"
          >
            <KeyRound className="w-3.5 h-3.5" /> Ubah Password
          </Button>
        </div>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal & Account Info */}
        <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#17211D] border-b border-gray-100 pb-3 flex items-center justify-between">
            <span>Informasi Akun Terdaftar</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
              Akun Aktif
            </span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-[#66736D] flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" /> Nama Lengkap
              </span>
              <strong className="text-[#17211D] text-right font-bold">{user?.name}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-[#66736D] flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" /> Email Login
              </span>
              <strong className="text-[#17211D] text-right">{user?.email}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-[#66736D] flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> Nomor WhatsApp
              </span>
              <strong className="text-[#17211D] text-right">{user?.phone || '-'}</strong>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-[#66736D] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" /> Wilayah Kecamatan
              </span>
              <strong className="text-[#17211D] text-right">Kecamatan {user?.district || 'Pangkajene'}</strong>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-[#66736D] flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" /> Peran Akses (Role)
              </span>
              <strong className="text-[#075E54] font-bold text-right">{user?.role}</strong>
            </div>
          </div>
        </div>

        {/* Role Privileges / Literacy Overview Card */}
        {isAdmin ? (
          <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#17211D] border-b border-gray-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Hak Akses Administrator
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  Otoritas Pengelola Platform
                </span>
                <p className="text-xs text-amber-950 font-medium leading-relaxed">
                  Sebagai Administrator MABBACA, Anda memiliki kewenangan penuh dalam memverifikasi mitra se-Kabupaten Sidrap, mengelola pengguna, katalog buku, agenda event, artikel edukasi, dan memonitor data literasi daerah.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAF8] border border-[#E2E8E5] space-y-2">
                <p className="font-semibold text-[#17211D]">Keamanan & Identitas Akun</p>
                <p className="text-[11px] text-[#66736D] leading-relaxed">
                  Nama dan foto profil ini akan tampil sebagai identitas resmi Administrator pada header dashboard platform serta catatan verifikasi mitra.
                </p>
              </div>
            </div>
          </div>
        ) : isMitra ? (
          <div className="bg-white rounded-3xl border border-[#E2E8E5] p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#17211D] border-b border-gray-100 pb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0F766E]" /> Profil Kemitraan Literasi
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-2xl bg-[#E8F3EF] border border-[#cbe1d7] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#075E54]">Nama Organisasi / Usaha</span>
                <p className="text-base font-extrabold text-[#075E54]">
                  {user?.mitraProfile?.organizationName || user?.name}
                </p>
                <p className="text-[11px] text-[#075E54]/80">Tipe: {user?.mitraProfile?.mitraType || 'LITERASI'}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F8FAF8] border border-[#E2E8E5] space-y-1.5">
                <p className="font-semibold text-[#17211D]">Status Kemitraan</p>
                <p className="text-[11px] text-[#66736D]">
                  Status: <strong className="text-[#075E54]">{user?.mitraProfile?.status || 'APPROVED'}</strong>
                </p>
              </div>
            </div>
          </div>
        ) : (
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
                  Akun Anda terintegrasi dengan ekosistem literasi Kabupaten Sidrap untuk meminjam buku, memesan produk toko via WA, dan bergabung di event literasi.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* EDIT PROFILE MODAL */}
      <Modal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        title="Edit Profil & Identitas"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4 py-2">
          {/* Avatar Preview & Upload Inside Modal */}
          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
              Foto Profil
            </label>
            <input
              type="file"
              ref={modalFileInputRef}
              onChange={handleModalAvatarChange}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />

            <div className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 border border-gray-200">
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-[#075E54]/30 shrink-0 bg-gray-100">
                <img
                  src={
                    modalAvatarPreview ||
                    resolveImageUrl(user?.avatar) ||
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
                  }
                  alt="Preview Avatar"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    onClick={() => modalFileInputRef.current?.click()}
                    className="gap-1 bg-white"
                  >
                    <Upload className="w-3 h-3" /> Pilih Foto Baru
                  </Button>

                  {modalAvatarPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveModalAvatar}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Batal Ganti
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-gray-500">
                  Format JPG, PNG, atau WEBP. Maksimal 5 MB.
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Nama Lengkap *"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Masukkan nama lengkap Anda"
            required
          />

          <Input
            label="Nomor WhatsApp / HP"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="Contoh: 081234567890"
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

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Bio / Deskripsi Singkat
            </label>
            <textarea
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={2}
              placeholder="Catatan atau deskripsi singkat profil Anda..."
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
            />
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
              Kata Sandi Saat Ini *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Masukkan kata sandi lama"
                className="w-full px-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Kata Sandi Baru (Min. 6 karakter) *
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                placeholder="Minimal 6 karakter"
                className="w-full px-3.5 pr-10 py-2.5 rounded-xl text-xs sm:text-sm bg-gray-50 border border-[#E2E8E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#075E54]"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#17211D] mb-1">
              Konfirmasi Kata Sandi Baru *
            </label>
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Ulangi kata sandi baru"
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

