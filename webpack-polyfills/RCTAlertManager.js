// Polyfill para RCTAlertManager en web
const RCTAlertManager = {
  alert: (config, callback) => {
    if (typeof window !== 'undefined' && window.alert) {
      window.alert(config.title || config.message || 'Alert');
      if (callback) callback();
    }
  },
};

module.exports = { default: RCTAlertManager };
module.exports.default = RCTAlertManager;

