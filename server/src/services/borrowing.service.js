const prisma = require('../config/db');

class BorrowingService {
  // Get borrowings: filtered by user, library, or admin
  async getBorrowings(user, { page = 1, limit = 10, status }) {
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, parseInt(limit));
    const skip = (p - 1) * l;

    const where = {};

    if (user.role === 'USER') {
      where.userId = user.id;
    } else if (user.role === 'MITRA') {
      // Mitra Perpustakaan hanya melihat peminjaman perpustakaannya
      const lib = await prisma.library.findUnique({
        where: { mitraId: user.mitraProfile.id },
      });
      if (!lib) {
        return { borrowings: [], total: 0, page: p, limit: l };
      }
      where.libraryId = lib.id;
    }
    // Admin melihat semua

    if (status) {
      where.status = status;
    }

    const [total, borrowings] = await Promise.all([
      prisma.borrowing.count({ where }),
      prisma.borrowing.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          book: true,
          library: true,
          collection: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: l,
      }),
    ]);

    return { borrowings, total, page: p, limit: l };
  }

  // Get borrowing by ID
  async getBorrowingById(id, user) {
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, phone: true, email: true } },
        book: true,
        library: true,
        collection: true,
      },
    });

    if (!borrowing) {
      const error = new Error('Data peminjaman tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'USER' && borrowing.userId !== user.id) {
      const error = new Error('Akses ditolak.');
      error.statusCode = 403;
      throw error;
    }

    if (user.role === 'MITRA' && (!user.mitraProfile || borrowing.library.mitraId !== user.mitraProfile.id)) {
      const error = new Error('Anda tidak memiliki izin untuk melihat data peminjaman perpustakaan lain.');
      error.statusCode = 403;
      throw error;
    }

    return borrowing;
  }

  // Request borrow (User)
  async requestBorrow(userId, { libraryId, bookId, quantity = 1, notes, durationDays = 7 }) {
    const libId = parseInt(libraryId);
    const bId = parseInt(bookId);
    const qty = Math.max(1, parseInt(quantity));

    return prisma.$transaction(async (tx) => {
      // Cari koleksi buku di perpustakaan terkait
      const collection = await tx.libraryCollection.findUnique({
        where: {
          libraryId_bookId: {
            libraryId: libId,
            bookId: bId,
          },
        },
      });

      if (!collection) {
        const error = new Error('Buku ini tidak terdaftar dalam koleksi perpustakaan tersebut.');
        error.statusCode = 404;
        throw error;
      }

      if (collection.availableQuantity < qty) {
        const error = new Error(`Stok buku yang tersedia tidak mencukupi (Tersedia: ${collection.availableQuantity}).`);
        error.statusCode = 400;
        throw error;
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(durationDays));

      const borrowing = await tx.borrowing.create({
        data: {
          userId,
          libraryId: libId,
          bookId: bId,
          collectionId: collection.id,
          quantity: qty,
          dueDate,
          notes,
          status: 'PENDING',
        },
        include: {
          book: true,
          library: true,
        },
      });

      // Notifikasi ke user
      await tx.notification.create({
        data: {
          userId,
          type: 'INFO',
          title: 'Pengajuan Peminjaman Diajukan',
          message: `Permohonan peminjaman buku "${borrowing.book.title}" di ${borrowing.library.name} berhasil diajukan dan menunggu persetujuan.`,
        },
      });

      return borrowing;
    });
  }

  // Approve borrowing (Mitra Perpustakaan / Admin)
  async approveBorrowing(id, user) {
    const borrowId = parseInt(id);

    return prisma.$transaction(async (tx) => {
      const borrowing = await tx.borrowing.findUnique({
        where: { id: borrowId },
        include: {
          library: true,
          book: true,
          collection: true,
        },
      });

      if (!borrowing) {
        const error = new Error('Data peminjaman tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }

      // Validasi hak akses
      if (user.role === 'MITRA' && borrowing.library.mitraId !== user.mitraProfile.id) {
        const error = new Error('Anda tidak memiliki hak untuk mengelola peminjaman perpustakaan ini.');
        error.statusCode = 403;
        throw error;
      }

      if (borrowing.status !== 'PENDING') {
        const error = new Error(`Peminjaman tidak dapat disetujui karena status saat ini: ${borrowing.status}`);
        error.statusCode = 400;
        throw error;
      }

      // Kurangi stok tersedia (Safety check: availableQuantity >= quantity)
      if (borrowing.collection) {
        if (borrowing.collection.availableQuantity < borrowing.quantity) {
          const error = new Error('Stok fisik buku tidak mencukupi untuk disetujui.');
          error.statusCode = 400;
          throw error;
        }

        const newAvailableStock = borrowing.collection.availableQuantity - borrowing.quantity;
        await tx.libraryCollection.update({
          where: { id: borrowing.collection.id },
          data: {
            availableQuantity: newAvailableStock,
            isAvailable: newAvailableStock > 0,
          },
        });
      }

      const updated = await tx.borrowing.update({
        where: { id: borrowId },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          borrowedAt: new Date(),
        },
        include: {
          user: true,
          book: true,
        },
      });

      // Notifikasi ke peminjam
      await tx.notification.create({
        data: {
          userId: borrowing.userId,
          type: 'SUCCESS',
          title: 'Peminjaman Disetujui!',
          message: `Peminjaman buku "${borrowing.book.title}" telah disetujui. Silakan ambil buku di perpustakaan.`,
        },
      });

      return updated;
    });
  }

  // Reject borrowing (Mitra Perpustakaan / Admin)
  async rejectBorrowing(id, user, reason) {
    const borrowId = parseInt(id);

    return prisma.$transaction(async (tx) => {
      const borrowing = await tx.borrowing.findUnique({
        where: { id: borrowId },
        include: { library: true, book: true },
      });

      if (!borrowing) {
        const error = new Error('Data peminjaman tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }

      if (user.role === 'MITRA' && borrowing.library.mitraId !== user.mitraProfile.id) {
        const error = new Error('Anda tidak memiliki hak untuk mengelola peminjaman ini.');
        error.statusCode = 403;
        throw error;
      }

      const updated = await tx.borrowing.update({
        where: { id: borrowId },
        data: {
          status: 'REJECTED',
          notes: reason ? `${borrowing.notes || ''} [Ditolak: ${reason}]` : borrowing.notes,
        },
      });

      await tx.notification.create({
        data: {
          userId: borrowing.userId,
          type: 'WARNING',
          title: 'Peminjaman Ditolak',
          message: `Permohonan peminjaman buku "${borrowing.book.title}" ditolak.${reason ? ` Alasan: ${reason}` : ''}`,
        },
      });

      return updated;
    });
  }

  // Return book (Mitra Perpustakaan / Admin)
  async returnBorrowing(id, user) {
    const borrowId = parseInt(id);

    return prisma.$transaction(async (tx) => {
      const borrowing = await tx.borrowing.findUnique({
        where: { id: borrowId },
        include: { library: true, book: true, collection: true },
      });

      if (!borrowing) {
        const error = new Error('Data peminjaman tidak ditemukan.');
        error.statusCode = 404;
        throw error;
      }

      if (user.role === 'MITRA' && borrowing.library.mitraId !== user.mitraProfile.id) {
        const error = new Error('Anda tidak memiliki hak untuk mengelola peminjaman ini.');
        error.statusCode = 403;
        throw error;
      }

      if (borrowing.status === 'RETURNED') {
        const error = new Error('Buku sudah tercatat dikembalikan sebelumnya.');
        error.statusCode = 400;
        throw error;
      }

      // Pulihkan stok buku
      if (borrowing.collection) {
        const newAvailableStock = borrowing.collection.availableQuantity + borrowing.quantity;
        await tx.libraryCollection.update({
          where: { id: borrowing.collection.id },
          data: {
            availableQuantity: newAvailableStock,
            isAvailable: true,
          },
        });
      }

      const updated = await tx.borrowing.update({
        where: { id: borrowId },
        data: {
          status: 'RETURNED',
          returnedAt: new Date(),
        },
      });

      // Berikan reward poin ke user peminjam tertib
      await tx.user.update({
        where: { id: borrowing.userId },
        data: { points: { increment: 15 } },
      });

      await tx.userActivity.create({
        data: {
          userId: borrowing.userId,
          activityType: 'RETURN_BOOK',
          referenceId: borrowing.id,
          pointsEarned: 15,
          description: `Mengembalikan buku pinjaman: ${borrowing.book.title}`,
        },
      });

      await tx.notification.create({
        data: {
          userId: borrowing.userId,
          type: 'SUCCESS',
          title: 'Buku Berhasil Dikembalikan',
          message: `Terima kasih telah mengembalikan buku "${borrowing.book.title}" tepat waktu (+15 poin).`,
        },
      });

      return updated;
    });
  }

  // Update borrowing status directly (Admin or Library owner Mitra)
  async updateBorrowingStatus(id, status, notes, user) {
    const borrowId = parseInt(id);
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: borrowId },
      include: { library: true, book: true, collection: true },
    });

    if (!borrowing) {
      const error = new Error('Data peminjaman tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'MITRA' && (!user.mitraProfile || borrowing.library.mitraId !== user.mitraProfile.id)) {
      const error = new Error('Anda tidak memiliki izin mengelola peminjaman perpustakaan ini.');
      error.statusCode = 403;
      throw error;
    }

    return prisma.$transaction(async (tx) => {
      const updateData = { status };
      if (notes !== undefined) updateData.notes = notes;

      if (status === 'APPROVED' || status === 'BORROWED') {
        if (!borrowing.borrowedAt) updateData.borrowedAt = new Date();
        if (!borrowing.approvedAt) updateData.approvedAt = new Date();
      } else if (status === 'RETURNED') {
        updateData.returnedAt = new Date();
        if (borrowing.collection && borrowing.status !== 'RETURNED') {
          await tx.libraryCollection.update({
            where: { id: borrowing.collection.id },
            data: {
              availableQuantity: { increment: borrowing.quantity },
              isAvailable: true,
            },
          });
        }
      }

      const updated = await tx.borrowing.update({
        where: { id: borrowId },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, phone: true, email: true } },
          book: true,
          library: true,
        },
      });

      return updated;
    });
  }

  // Delete borrowing (Admin or Library owner Mitra)
  async deleteBorrowing(id, user) {
    const borrowId = parseInt(id);
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: borrowId },
      include: { library: true },
    });

    if (!borrowing) {
      const error = new Error('Data peminjaman tidak ditemukan.');
      error.statusCode = 404;
      throw error;
    }

    if (user.role === 'MITRA' && (!user.mitraProfile || borrowing.library.mitraId !== user.mitraProfile.id)) {
      const error = new Error('Anda tidak memiliki izin menghapus peminjaman perpustakaan ini.');
      error.statusCode = 403;
      throw error;
    }

    await prisma.borrowing.delete({ where: { id: borrowId } });
    return { id: borrowId, message: 'Data peminjaman berhasil dihapus.' };
  }
}

module.exports = new BorrowingService();
