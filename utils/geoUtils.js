/**
 * Calculate Euclidean approximation for short distance
 */
function approxDistance(lat1, lon1, lat2, lon2) {
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  return Math.sqrt(dLat * dLat + dLon * dLon);
}

module.exports = { approxDistance };
