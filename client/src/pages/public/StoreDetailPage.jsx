import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Store,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Package,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';
import { storeService, orderService } from '../../services/dataServices';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Skeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { LocationBadge } from '../../components/common/LocationBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input, Textarea } from '../../components/common/Input';

export const StoreDetailPage = () => {
  const { id } = useParams();
  const { location } = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [store, setStore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // WhatsApp Order Modal State
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [createdOrderResult, setCreatedOrderResult] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setIsLoading(true);
        const res = await storeService.getStoreById(id, {
          userLat: location.lat,
          userLng: location.lng,
        });
        if (res?.data) {
          setStore(res.data);
        }
      } catch (err) {
        console.error('Failed to load store detail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [id, location.lat, location.lng]);

  useEffect(() => {
    if (user) {
      setCustomerName(user.name || '');
      setCustomerPhone(user.phone || '');
      setCustomerAddress(user.district ? `Kecamatan ${user.district}, Sidrap` : '');
    }
  }, [user]);

  const handleOpenOrderModal = (product) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
    setCreatedOrderResult(null);
    setIsOrderModalOpen(true);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!customerName || !customerPhone) {
      showToast('Nama dan nomor WhatsApp wajib diisi.', 'error');
      return;
    }

    try {
      setIsSubmittingOrder(true);
      const payload = {
        storeId: Number(store.id),
        items: [{ bookId: Number(selectedProduct.bookId), quantity: Number(orderQuantity) }],
        customerName,
        customerPhone,
        customerAddress: customerAddress || 'Ambil di Toko / Sesuai Kesepakatan',
        notes: orderNotes,
      };

      const res = await orderService.createOrder(payload);
      if (res?.data) {
        setCreatedOrderResult(res.data);
        showToast('Pesanan berhasil dibuat di sistem!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal membuat pesanan buku.';
      showToast(msg, 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleContinueWhatsApp = async () => {
    if (!createdOrderResult) return;
    try {
      await orderService.contactWhatsapp(createdOrderResult.order.id);
    } catch (err) {
      console.warn('Could not mark contacted status:', err);
    }

    if (createdOrderResult.whatsappUrl) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      let finalUrl = createdOrderResult.whatsappUrl;
      if (!isMobile) {
        finalUrl = finalUrl.replace('https://api.whatsapp.com/send', 'https://web.whatsapp.com/send');
      }
      window.open(finalUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <Skeleton className="w-full h-64 rounded-3xl" />
        <Skeleton className="w-1/3 h-8" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-3">
        <h2 className="text-xl font-bold text-[#17211D]">Toko buku tidak ditemukan.</h2>
        <Link to="/literasi/toko" className="text-[#075E54] font-bold hover:underline inline-block text-sm">
          ← Kembali ke Daftar Toko Buku
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Toko Buku', link: '/literasi/toko' },
          { label: store.name },
        ]}
      />

      {/* Banner & Store Header Card */}
      <div className="bg-white rounded-3xl border border-[#E2E8E5] overflow-hidden shadow-xs">
        <div className="h-48 sm:h-64 relative bg-emerald-900">
          <ImageWithFallback
            src={store.banner}
            alt={store.name}
            fallbackIcon={Store}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        </div>

        <div className="p-6 sm:p-8 -mt-12 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-white shadow-lg overflow-hidden shrink-0">
                <ImageWithFallback
                  src={store.logo}
                  alt={store.name}
                  fallbackIcon={Store}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17211D]">
                  {store.name}
                </h1>
                <p className="text-xs sm:text-sm text-[#66736D] flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[#075E54]" />
                  {store.address}, Kec. {store.district}, Sidrap
                </p>
              </div>
            </div>

            <LocationBadge distance={store.distance || (store.formattedDistance ? parseFloat(store.formattedDistance) : undefined)} district={store.district} size="md" />
          </div>

          <p className="text-xs sm:text-sm text-[#17211D]/80 mt-5 max-w-3xl leading-relaxed">
            {store.description}
          </p>

          <div className="flex flex-wrap items-center gap-6 mt-5 pt-5 border-t border-gray-100 text-xs text-[#66736D]">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>Jam Operasional: <strong className="text-[#17211D]">{store.openHours}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#075E54]" />
              <span>WhatsApp: <strong className="text-[#17211D]">+{store.phoneWa}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Package className="w-4 h-4 text-gray-400" />
              <span>Total Koleksi: <strong className="text-[#075E54]">{store.products?.length || 0} Judul Tersedia</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Store Products Catalog */}
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold text-[#17211D]">
          Buku yang Tersedia di Toko Ini
        </h3>

        {store.products && store.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {store.products.map((product) => (
              <div
                key={product.productId}
                className="bg-white rounded-2xl border border-[#E2E8E5] p-3.5 flex flex-col justify-between shadow-xs hover:shadow-card-hover transition-all duration-200"
              >
                <div>
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#E8F3EF] mb-3 relative">
                    <ImageWithFallback
                      src={product.coverImage}
                      alt={product.title}
                      fallbackText={product.title}
                      fallbackIcon={BookOpen}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 text-[10px] font-bold bg-white/95 px-2 py-0.5 rounded-md text-[#075E54] border border-[#cbe1d7] shadow-xs">
                      {product.category}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs sm:text-sm text-[#17211D] line-clamp-1">
                    {product.title}
                  </h4>
                  <p className="text-[11px] text-[#66736D] line-clamp-1 mt-0.5">{product.author}</p>

                  <div className="flex items-baseline justify-between mt-2 pt-2 border-t border-gray-100">
                    <span className="text-sm font-extrabold text-[#075E54]">
                      Rp {Number(product.price).toLocaleString('id-ID')}
                    </span>
                    <span className="text-[11px] text-[#66736D] font-medium">Stok: {product.stock}</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 space-y-2">
                  <Button
                    size="sm"
                    onClick={() => handleOpenOrderModal(product)}
                    className="w-full bg-[#075E54] text-white hover:bg-[#05473F] text-xs font-bold gap-1.5 shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Pesan via WhatsApp
                  </Button>

                  <Link
                    to={`/buku/${product.bookId}`}
                    className="block text-center text-[11px] font-semibold text-[#66736D] hover:text-[#075E54] hover:underline"
                  >
                    Lihat Sinopsis Buku
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Belum ada buku terdaftar"
            description="Toko ini belum menambahkan daftar inventaris buku."
          />
        )}
      </div>

      {/* WHATSAPP ORDER MODAL FLOW */}
      <Modal
        isOpen={isOrderModalOpen}
        onClose={() => {
          setIsOrderModalOpen(false);
          setCreatedOrderResult(null);
        }}
        title={createdOrderResult ? 'Ringkasan Pesanan Toko' : 'Pesan Buku via WhatsApp'}
        maxWidth="max-w-lg"
      >
        {!createdOrderResult ? (
          <form onSubmit={handleSubmitOrder} className="space-y-4 py-2">
            <div className="p-3.5 rounded-2xl bg-[#E8F3EF] border border-[#cbe1d7] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#075E54]">{selectedProduct?.title}</p>
                <p className="text-[11px] text-[#66736D]">Toko: {store?.name}</p>
              </div>
              <p className="text-sm font-extrabold text-[#075E54]">
                Rp {selectedProduct?.price?.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Jumlah (Eks) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct?.stock || 10}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm border border-[#E2E8E5] focus:ring-2 focus:ring-[#075E54]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Estimasi Total
                </label>
                <div className="px-3.5 py-2 rounded-xl text-sm font-bold bg-gray-50 border border-[#E2E8E5] text-[#075E54]">
                  Rp {((selectedProduct?.price || 0) * orderQuantity).toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <Input
              label="Nama Pemesan *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Andi Muhammad"
              required
            />

            <Input
              label="Nomor WhatsApp Pemesan *"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Contoh: 081234567890"
              required
            />

            <Input
              label="Alamat Pengiriman / Catatan Pengambilan"
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Contoh: Ambil di Toko / Jl. Poros Sidrap No. 10"
            />

            <Textarea
              label="Catatan Tambahan (Opsional)"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              placeholder="Contoh: Titip di kasir jam 4 sore"
              rows={2}
            />

            <div className="pt-3 border-t border-[#E2E8E5] flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsOrderModalOpen(false)}
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isSubmittingOrder}
                className="bg-[#075E54] text-white font-bold"
              >
                Buat Pesanan
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-[#E8F3EF] border border-[#cbe1d7] text-center space-y-1">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#075E54] text-white uppercase tracking-wider mb-1">
                Pesanan Terdaftar
              </span>
              <h4 className="text-base font-extrabold text-[#075E54]">
                Order #{createdOrderResult.order?.orderNumber}
              </h4>
              <p className="text-xs text-[#17211D]">
                Total Pesanan:{' '}
                <strong>
                  Rp {createdOrderResult.totalAmount?.toLocaleString('id-ID')}
                </strong>
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <ShieldCheck className="w-4 h-4 text-amber-700" /> Informasi Alur WhatsApp:
              </p>
              <p>
                Nomor pesanan resmi telah dibuat di platform MABBACA. Transaksi pembayaran dan konfirmasi pengiriman akan Anda lanjutkan langsung dengan admin toko melalui chat WhatsApp resmi.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E2E8E5] flex flex-col gap-2">
              <Button
                size="lg"
                onClick={handleContinueWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold gap-2 shadow-sm"
              >
                <MessageCircle className="w-5 h-5" /> Lanjut ke WhatsApp
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOrderModalOpen(false)}
                className="w-full border-[#E2E8E5]"
              >
                Tutup Ringkasan
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
