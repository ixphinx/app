// Polyfill para RCTNetworking en web
const RCTNetworking = {
  sendRequest: () => {},
  abortRequest: () => {},
  clearCookies: () => {},
};

module.exports = { default: RCTNetworking };
module.exports.default = RCTNetworking;

