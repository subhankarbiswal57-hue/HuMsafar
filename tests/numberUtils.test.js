const { safeParseFloat } = require("../utils/numberUtils");

console.assert(safeParseFloat("invalid", 10) === 10, "numberUtils test failed");
