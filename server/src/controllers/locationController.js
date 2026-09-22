const locationService = require('../services/location.service');
const { successResponse } = require('../utils/responseHelper');

const getLocations = async (req, res, next) => {
  try {
    const locations = await locationService.getLocations();
    return successResponse(res, 'Daftar wilayah kecamatan di Sidrap berhasil dimuat.', locations);
  } catch (error) {
    next(error);
  }
};

const getNearby = async (req, res, next) => {
  try {
    const { latitude, longitude, radius = 25, type = 'all' } = req.query;
    const result = await locationService.getNearbyResources({
      latitude,
      longitude,
      radius,
      type,
    });
    return successResponse(res, 'Sumber daya literasi terdekat berhasil dimuat.', result);
  } catch (error) {
    next(error);
  }
};

const getEcosystemStats = async (req, res, next) => {
  try {
    const stats = await locationService.getEcosystemStats();
    return successResponse(res, 'Statistik ekosistem literasi Sidrap berhasil dimuat.', stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLocations,
  getNearby,
  getEcosystemStats,
};
