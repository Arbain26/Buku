const communityService = require('../services/community.service');
const { successResponse, paginateResponse } = require('../utils/responseHelper');

const getCommunities = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, district, userLat, userLng } = req.query;
    const result = await communityService.getCommunities({ page, limit, search, district, userLat, userLng });
    return paginateResponse(res, 'Daftar komunitas literasi berhasil dimuat.', result.communities, result.page, result.limit, result.total);
  } catch (error) {
    next(error);
  }
};

const getCommunityById = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const community = await communityService.getCommunityById(req.params.id, userId);
    return successResponse(res, 'Detail komunitas berhasil dimuat.', community);
  } catch (error) {
    next(error);
  }
};

const createCommunity = async (req, res, next) => {
  try {
    const mitraId = req.user.mitraProfile.id;
    const community = await communityService.createCommunity(mitraId, req.body, req.files);
    return successResponse(res, 'Komunitas berhasil dibuat.', community, 201);
  } catch (error) {
    next(error);
  }
};

const updateCommunity = async (req, res, next) => {
  try {
    const updated = await communityService.updateCommunity(req.params.id, req.body, req.files);
    return successResponse(res, 'Data komunitas berhasil diperbarui.', updated);
  } catch (error) {
    next(error);
  }
};

const deleteCommunity = async (req, res, next) => {
  try {
    await communityService.deleteCommunity(req.params.id);
    return successResponse(res, 'Komunitas berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

const toggleJoin = async (req, res, next) => {
  try {
    const result = await communityService.joinCommunity(req.params.id, req.user.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

const leaveCommunity = async (req, res, next) => {
  try {
    const result = await communityService.leaveCommunity(req.params.id, req.user.id);
    return successResponse(res, result.message, result);
  } catch (error) {
    next(error);
  }
};

const getMembers = async (req, res, next) => {
  try {
    const members = await communityService.getMembers(req.params.id);
    return successResponse(res, 'Daftar anggota komunitas berhasil dimuat.', members);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommunities,
  getCommunityById,
  createCommunity,
  updateCommunity,
  deleteCommunity,
  toggleJoin,
  leaveCommunity,
  getMembers,
};
