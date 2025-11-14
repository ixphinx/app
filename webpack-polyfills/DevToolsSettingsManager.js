// Polyfill para DevToolsSettingsManager en web
const DevToolsSettingsManager = {
  reload: () => {},
  setProfilingEnabled: () => {},
};

module.exports = DevToolsSettingsManager;
module.exports.default = DevToolsSettingsManager;

