/**
 * Filter undefined or null values from an object
 */
function cleanObject(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));
}

module.exports = { cleanObject };
