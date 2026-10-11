/**
 * Format date to standard ISO date string (YYYY-MM-DD)
 */
function formatDate(date) {
  return new Date(date).toISOString().split("T")[0];
}

module.exports = { formatDate };
