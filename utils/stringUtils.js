/**
 * Capitalize first letter of string
 */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { capitalize };
