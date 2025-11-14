// Polyfill para BackHandler en web
const BackHandler = {
  addEventListener: () => ({ remove: () => {} }),
  exitApp: () => {},
};

module.exports = { default: BackHandler };
module.exports.default = BackHandler;

