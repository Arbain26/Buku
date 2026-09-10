// Haversine formula to compute great-circle distance between two points on a sphere
const SIDRAP_DEFAULT_LAT = -3.9274;
const SIDRAP_DEFAULT_LNG = 119.7997;

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return parseFloat(distance.toFixed(1));
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function formatDistance(km) {
  if (km == null) return null;
  if (km < 1) {
    return `${Math.round(km * 1000)} m`;
  }
  return `${km.toString().replace('.', ',')} km`;
}

module.exports = {
  SIDRAP_DEFAULT_LAT,
  SIDRAP_DEFAULT_LNG,
  calculateDistance,
  formatDistance,
};
