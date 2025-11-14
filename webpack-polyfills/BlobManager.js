// Polyfill para BlobManager en web
const BlobManager = {
  isAvailable: false,
  removeWebSocketHandler: () => {},
  createFromOptions: (data) => data,
};

module.exports = BlobManager;
module.exports.default = BlobManager;

