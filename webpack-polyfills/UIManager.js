// Polyfill para UIManager en web
// Este polyfill debe estar disponible antes de que react-native-maps se cargue
const UIManager = {
  getViewManagerConfig: (name) => {
    // Retornar un objeto vacío en lugar de null para evitar errores
    // cuando react-native-maps intenta acceder a propiedades
    return {};
  },
  hasViewManagerConfig: (name) => {
    return false;
  },
  measure: (node, callback) => {
    if (typeof callback === 'function') {
      callback(0, 0, 0, 0, 0, 0);
    }
  },
  measureInWindow: (node, callback) => {
    if (typeof callback === 'function') {
      callback(0, 0, 0, 0);
    }
  },
  measureLayout: (node, relativeToNativeNode, onFail, onSuccess) => {
    if (typeof onSuccess === 'function') {
      onSuccess(0, 0, 0, 0);
    }
  },
};

// Exportar de múltiples formas para compatibilidad
module.exports = UIManager;
module.exports.default = UIManager;
module.exports.UIManager = UIManager;

