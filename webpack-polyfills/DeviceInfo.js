// Polyfill para DeviceInfo en web
const DeviceInfo = {
  getConstants: () => ({
    isIPhoneX_deprecated: false,
  }),
};

module.exports = { default: DeviceInfo };
module.exports.default = DeviceInfo;

