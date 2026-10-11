const { formatDate } = require("../utils/dateUtils");

const formatted = formatDate("2026-01-01T12:00:00Z");
console.assert(formatted === "2026-01-01", "dateUtils test failed");
