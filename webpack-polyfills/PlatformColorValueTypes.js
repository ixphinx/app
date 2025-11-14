// Polyfill para PlatformColorValueTypes en web
const PlatformColorValueTypes = {
  normalizeColorObject: (color) => color,
  processColorObject: (color) => color,
};

module.exports = PlatformColorValueTypes;
module.exports.default = PlatformColorValueTypes;

