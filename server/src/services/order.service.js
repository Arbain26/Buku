const prisma = require('../config/db');

class OrderService {
  // Create Order via WhatsApp flow (Prisma Transaction)
  async createOrder(userId, { storeId, items, customerName, customerPhone, customerAddress, notes }) {
    const sId = parseInt(storeId);
    if (!items || !Array.isArray(items) || items.length === 0) {
      const error = new Error('Pesanan harus memiliki minimal 1 item buku.');
      error.statusCode = 400;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      // Verifikasi keberadaan Toko
      const store = await tx.store.findUnique({
        where: { id: sId },
      });

      if (!store || !store.isActive || store.deletedAt) {
        const error = new Error('Toko buku tidak ditemukan atau sedang tidak aktif.');
        error.statusCode = 404;
        throw error;
      }

      // Validasi setiap buku dan ambil harga ASLI dari database (StoreProduct)
      let calculatedTotal = 0;
      const verifiedItems = [];

      for (const item of items) {
        const bId = parseInt(item.bookId);
        const qty = Math.max(1, parseInt(item.quantity || 1));

        const storeProduct = await tx.storeProduct.findUnique({
          where: {
            storeId_bookId: {
              storeId: sId,
              bookId: bId,
            },
          },
          include: { book: true },
        });

        if (!storeProduct || !storeProduct.isAvailable || storeProduct.stock < qty) {
          const error = new Error(
            `Buku dengan ID ${bId} tidak tersedia di toko ini atau stok tidak mencukupi.`
          );
          error.statusCode = 400;
          throw error;
        }

        const price = Number(storeProduct.price);
        const subtotal = price * qty;
        calculatedTotal += subtotal;

        verifiedItems.push({
          bookId: bId,
          storeProductId: storeProduct.id,
          bookTitle: storeProduct.book.title,
          quantity: qty,
          price,
          subtotal,
        });
      }

      // Generate Order Number unik: ORD-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ORD-${dateStr}-${randomDigits}`;

      // Buat Order
      const order = await tx.order.create({
        data: {
          userId: userId || null,
          storeId: sId,
          orderNumber,
          totalAmount: calculatedTotal,
          status: 'PENDING',
          customerName,
          customerPhone,
          customerAddress: customerAddress || null,
          notes: notes || null,
          waMessageSent: true,
        },
      });

      // Buat Order Items
      for (const vi of verifiedItems) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            bookId: vi.bookId,
            storeProductId: vi.storeProductId,
            quantity: vi.quantity,
            price: vi.price,
            subtotal: vi.subtotal,
          },
        });
      }

      // Susun pesan WhatsApp otomatis
      const itemLines = verifiedItems
        .map((i, idx) => `${idx + 1}. ${i.bookTitle} (${i.quantity}x) — Rp ${i.subtotal.toLocaleString('id-ID')}`)
        .join('\n');

      const waMessage = `Halo ${store.name},\nSaya ingin memesan buku via platform MABBACA:\n\n*Nomor Order:* ${order.orderNumber}\n*Nama Pemesan:* ${customerName}\n*No. HP:* ${customerPhone}\n*Alamat:* ${customerAddress || '-'}\n\n*Daftar Buku:*\n${itemLines}\n\n*Total Pembayaran:* Rp ${calculatedTotal.toLocaleString('id-ID')}\n*Catatan:* ${notes || '-'}\n\nMohon konfirmasi ketersediaan dan petunjuk pembayarannya. Terima kasih!`;

      const cleanWaPhone = store.whatsappNumber.replace(/[^0-9]/g, '');
      const waLink = `https://wa.me/${cleanWaPhone}?text=${encodeURIComponent(waMessage)}`;

      // Catat notifikasi ke user jika login
      if (userId) {
        await tx.notification.create({
          data: {
            userId,
            type: 'INFO',
            title: 'Pesanan Buku Dibuat',
            message: `Pesanan Anda #${order.orderNumber} di ${store.name} telah dibuat. Silakan hubungi toko via WhatsApp.`,
          },
        });
      }

      return {
        order,
        store: {
          id: store.id,
          name: store.name,
          phone: store.phone,
          whatsappNumber: store.whatsappNumber,
        },
        items: verifiedItems,
        totalAmount: calculatedTotal,
        whatsappMessage: waMessage,
        whatsappUrl: waLink,
      };
    });
  }

  // Get orders list
  async getOrders(user, { page = 1, limit = 10, status }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const where = {};

    if (user.role === 'USER') {
      where.userId = user.id;
    } else if (user.role === 'MITRA') {
      const store = await prisma.store.findUnique({
        where: { mitraId: user.mitraProfile.id },
      });
      if (!store) {
        return { orders: [], total: 0, page: p, limit: l };
      }
      where.storeId = store.id;
    }
    // Admin melihat semua

    if (status) {
      where.status = status;
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: {
          store: true,
          items: {
            include: { book: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
    ]);

    return { orders, total, page: p, limit: l };
  }

  // Get order by ID
  async getOrderById(id, user) {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        store: true,
        items: {
          include: { book: true },
        },
      },
    });

    if (!order) {
      const error = new Error('Pesanan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'USER' && order.userId !== user.id) {
      const error = new Error('Akses ditolak.');
      error.statusCode = 403;
      throw error;
    }

    if (user.role === 'MITRA' && (!user.mitraProfile || order.store.mitraId !== user.mitraProfile.id)) {
      const error = new Error('Anda tidak memiliki izin untuk melihat pesanan toko lain.');
      error.statusCode = 403;
      throw error;
    }

    return order;
  }

  // Update order status (PENDING, CONTACTED, CONFIRMED, COMPLETED, CANCELLED)
  async updateOrderStatus(id, status, user) {
    const orderId = parseInt(id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true, items: true },
    });

    if (!order) {
      const error = new Error('Pesanan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'MITRA' && order.store.mitraId !== user.mitraProfile.id) {
      const error = new Error('Anda tidak berwenang mengelola pesanan untuk toko ini.');
      error.statusCode = 403;
      throw error;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      // Jika status berubah COMPLETED dan user terdaftar, beri reward poin dan kurangi stok toko
      if (status === 'COMPLETED' && order.status !== 'COMPLETED') {
        // Kurangi stok produk
        for (const item of order.items) {
          if (item.storeProductId) {
            await tx.storeProduct.update({
              where: { id: item.storeProductId },
              data: { stock: { decrement: item.quantity } },
            });
          }
        }

        if (order.userId) {
          await tx.user.update({
            where: { id: order.userId },
            data: { points: { increment: 25 } },
          });

          await tx.userActivity.create({
            data: {
              userId: order.userId,
              activityType: 'BUY_BOOK',
              referenceId: order.id,
              pointsEarned: 25,
              description: `Menyelesaikan pembelian buku (${order.orderNumber})`,
            },
          });
        }
      }

      // Kirim notifikasi status ke pembeli jika login
      if (order.userId) {
        await tx.notification.create({
          data: {
            userId: order.userId,
            type: status === 'CANCELLED' ? 'WARNING' : 'INFO',
            title: `Status Pesanan Diperbarui`,
            message: `Pesanan #${order.orderNumber} Anda di ${order.store.name} telah diubah menjadi: ${status}.`,
          },
        });
      }

      return res;
    });

    return updated;
  }

  // Contact WhatsApp action endpoint (marks order status as CONTACTED if still PENDING)
  async contactWhatsapp(id) {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        store: true,
        items: { include: { book: true } },
      },
    });

    if (!order) {
      const error = new Error('Pesanan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (order.status === 'PENDING') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CONTACTED' },
      });
    }

    const itemLines = order.items
      .map((i, idx) => `${idx + 1}. ${i.book.title} (${i.quantity}x) — Rp ${Number(i.subtotal).toLocaleString('id-ID')}`)
      .join('\n');

    const waMessage = `Halo ${order.store.name},\nSaya ingin menindaklanjuti pesanan buku via MABBACA:\n\n*Nomor Order:* ${order.orderNumber}\n*Nama Pemesan:* ${order.customerName}\n*No. HP:* ${order.customerPhone}\n\n*Daftar Buku:*\n${itemLines}\n\n*Total:* Rp ${Number(order.totalAmount).toLocaleString('id-ID')}`;

    const cleanWaPhone = order.store.whatsappNumber.replace(/[^0-9]/g, '');
    const waLink = `https://wa.me/${cleanWaPhone}?text=${encodeURIComponent(waMessage)}`;

    return {
      orderNumber: order.orderNumber,
      status: 'CONTACTED',
      storeName: order.store.name,
      whatsappNumber: order.store.whatsappNumber,
      whatsappUrl: waLink,
    };
  }

  // Delete order (Admin or Store owner Mitra)
  async deleteOrder(id, user) {
    const orderId = parseInt(id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true },
    });

    if (!order) {
      const error = new Error('Pesanan tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'MITRA' && (!user.mitraProfile || order.store.mitraId !== user.mitraProfile.id)) {
      const error = new Error('Anda tidak berwenang menghapus pesanan toko ini.');
      error.statusCode = 403;
      throw error;
    }

    await prisma.$transaction(async (tx) => {
      await tx.orderItem.deleteMany({ where: { orderId } });
      await tx.order.delete({ where: { id: orderId } });
    });

    return { id: orderId, message: 'Pesanan berhasil dihapus.' };
  }
}

module.exports = new OrderService();
