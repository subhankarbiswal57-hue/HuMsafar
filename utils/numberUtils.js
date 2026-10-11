/**
 * Safe float parser with fallback
 */
function safeParseFloat(val, fallback = 0) {
  const num = parseFloat(val);
  return Number.isNaN(num) ? fallback : num;
}

module.exports = { safeParseFloat };
