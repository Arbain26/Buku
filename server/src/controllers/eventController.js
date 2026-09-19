const prisma = require('../config/db');
const eventService = require('../services/event.service');
const { successResponse, paginateResponse, errorResponse } = require('../utils/responseHelper');

const getEvents = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, category, audience, status, upcoming, district } = req.query;
    const result = await eventService.getEvents({ page, limit, search, category, audience, status, upcoming, district });
    return paginateResponse(res, 'Daftar kegiatan literasi berhasil dimuat.', result.events, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const event = await eventService.getEventById(req.params.id, userId);
    return successResponse(res, 'Detail event berhasil dimuat.', event);
  } catch (error) {
    next(error);
  }
};

const createEvent = async (req, res, next) => {
  try {
    let mitraProfile = req.user.mitraProfile;
    if (!mitraProfile && req.user?.id) {
      mitraProfile = await prisma.mitraProfile.findFirst({
        where: { userId: req.user.id, deletedAt: null },
      });
    }
    if (!mitraProfile && req.user?.role === 'ADMIN') {
      mitraProfile = await prisma.mitraProfile.findFirst({
        where: { status: 'APPROVED', deletedAt: null },
      });
    }
    if (!mitraProfile) {
      return errorResponse(res, 'Profil mitra tidak ditemukan untuk menyelenggarakan kegiatan.', 403);
    }
    const event = await eventService.createEvent(mitraProfile.id, req.body, req.file);
    return successResponse(res, 'Event literasi berhasil dibuat.', event, 201);
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const updated = await eventService.updateEvent(req.params.id, req.body, req.file);
    return successResponse(res, 'Event literasi berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id);
    return successResponse(res, 'Event literasi berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

const registerEvent = async (req, res, next) => {
  try {
    const result = await eventService.registerEvent(req.params.id, req.user.id);
    return successResponse(res, 'Pendaftaran event berhasil! (+10 poin)', result, 201);
  } catch (error) {
    next(error);
  }
};

const cancelRegistration = async (req, res, next) => {
  try {
    await eventService.cancelRegistration(req.params.id, req.user.id);
    return successResponse(res, 'Pendaftaran event berhasil dibatalkan.');
  } catch (error) {
    next(error);
  }
};

const getParticipants = async (req, res, next) => {
  try {
    const participants = await eventService.getParticipants(req.params.id);
    return successResponse(res, 'Daftar peserta event berhasil dimuat.', participants);
  } catch (error) {
    next(error);
  }
};

const checkInParticipant = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await eventService.checkInParticipant(req.params.id, userId);
    return successResponse(res, 'Check-in peserta berhasil! (+20 poin kehadiran)', result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerEvent,
  cancelRegistration,
  getParticipants,
  checkInParticipant,
};
