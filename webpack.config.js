const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');
const webpack = require('webpack');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: ['react-native'],
      },
    },
    argv
  );

  // Agregar plugins para reemplazar módulos problemáticos
  const polyfillsPath = path.resolve(__dirname, 'webpack-polyfills');

  // Agregar alias para módulos de React Native que no existen en web
  config.resolve.alias = {
    ...config.resolve.alias,
    'react-native$': 'react-native-web',
    // Forzar reemplazo de react-native-maps en web usando alias
    'react-native-maps': path.join(polyfillsPath, 'react-native-maps-stub.js'),
    'react-native-maps/lib': path.join(polyfillsPath, 'react-native-maps-stub.js'),
  };
  
  config.plugins = [
    ...(config.plugins || []),
    // Reemplazar Platform (paths relativos desde diferentes niveles)
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/Utilities\/Platform$/,
      'react-native-web/dist/exports/Platform'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/Utilities\/Platform$/,
      'react-native-web/dist/exports/Platform'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/\.\.\/Utilities\/Platform$/,
      'react-native-web/dist/exports/Platform'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/\.\.\/\.\.\/Utilities\/Platform$/,
      'react-native-web/dist/exports/Platform'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/Utilities\/Platform$/,
      'react-native-web/dist/exports/Platform'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/Utilities\/Platform$/,
      'react-native-web/dist/exports/Platform'
    ),
    // Reemplazar Image
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/Image\/Image$/,
      'react-native-web/dist/exports/Image'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/Image\/Image$/,
      'react-native-web/dist/exports/Image'
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/\.\.\/Image\/Image$/,
      'react-native-web/dist/exports/Image'
    ),
    // Reemplazar otros módulos problemáticos
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/Blob\/BlobManager$/,
      path.join(polyfillsPath, 'BlobManager.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\/RCTNetworking$/,
      path.join(polyfillsPath, 'RCTNetworking.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\/RCTAlertManager$/,
      path.join(polyfillsPath, 'RCTAlertManager.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/Utilities\/BackHandler$/,
      path.join(polyfillsPath, 'BackHandler.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/DevToolsSettings\/DevToolsSettingsManager$/,
      path.join(polyfillsPath, 'DevToolsSettingsManager.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\/BaseViewConfig$/,
      path.join(polyfillsPath, 'BaseViewConfig.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/Components\/AccessibilityInfo\/legacySendAccessibilityEvent$/,
      path.join(polyfillsPath, 'legacySendAccessibilityEvent.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\/PlatformColorValueTypes$/,
      path.join(polyfillsPath, 'PlatformColorValueTypes.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/StyleSheet\/PlatformColorValueTypes$/,
      path.join(polyfillsPath, 'PlatformColorValueTypes.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/StyleSheet\/PlatformColorValueTypes$/,
      path.join(polyfillsPath, 'PlatformColorValueTypes.js')
    ),
    // Reemplazar Platform en el mismo directorio (para HMRClient)
    new webpack.NormalModuleReplacementPlugin(
      /^\.\/Platform$/,
      'react-native-web/dist/exports/Platform'
    ),
    // Reemplazar DeviceInfo
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/Utilities\/DeviceInfo$/,
      path.join(polyfillsPath, 'DeviceInfo.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/Utilities\/DeviceInfo$/,
      path.join(polyfillsPath, 'DeviceInfo.js')
    ),
    // Reemplazar UIManager - debe hacerse antes de que react-native-maps lo use
    new webpack.NormalModuleReplacementPlugin(
      /ReactNative\/UIManager$/,
      path.join(polyfillsPath, 'UIManager.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/ReactNative\/UIManager$/,
      path.join(polyfillsPath, 'UIManager.js')
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^\.\.\/\.\.\/ReactNative\/UIManager$/,
      path.join(polyfillsPath, 'UIManager.js')
    ),
    // Reemplazar react-native-maps completamente en web
    // Esto debe hacerse antes de que se cargue el módulo
    new webpack.NormalModuleReplacementPlugin(
      /react-native-maps/,
      (resource) => {
        // Reemplazar cualquier importación de react-native-maps
        if (resource.context && resource.context.includes('node_modules')) {
          resource.request = path.join(polyfillsPath, 'react-native-maps-stub.js');
        }
      }
    ),
  ];

  // Ignorar warnings de módulos opcionales (estos son comunes en React Native Web)
  // Estos warnings no afectan la funcionalidad de la aplicación
  config.ignoreWarnings = [
    { module: /Module not found.*Platform/ },
    { module: /export 'default'.*was not found/ },
    /Failed to parse source map/,
    /ENOENT.*favicon\.png/,
    /Could not find MIME for Buffer/,
    /Can't resolve.*View\/View/,
    /Can't resolve.*Text\/Text/,
    /Can't resolve.*StyleSheet\/StyleSheet/,
    /Can't resolve.*ScrollView\/ScrollView/,
    /Can't resolve.*StatusBar\/StatusBar/,
    /Can't resolve.*Linking\/Linking/,
    /Can't resolve.*UIManager/,
    /Can't resolve.*SoundManager/,
    /Can't resolve.*BugReporting/,
    /Can't resolve.*GlobalPerformanceLogger/,
    /Can't resolve.*ReactNativeViewConfigRegistry/,
    /Can't resolve.*createReactNativeComponentClass/,
    /Can't resolve.*getDevServer/,
    /Can't resolve.*normalizeColor/,
    /Can't resolve.*Blob\/Blob/,
  ];

  // Manejar assets faltantes de manera más flexible
  // Esto permite que webpack continúe incluso si faltan algunos assets
  config.resolve.fallback = {
    ...config.resolve.fallback,
    fs: false,
    path: false,
    buffer: false,
    stream: false,
  };

  // Mejorar el manejo de assets
  if (config.module && config.module.rules) {
    // Buscar la regla de assets y modificarla
    const assetRuleIndex = config.module.rules.findIndex(
      (rule) => rule && rule.test && rule.test.toString().includes('png|jpg|jpeg')
    );
    
    if (assetRuleIndex >= 0) {
      const assetRule = config.module.rules[assetRuleIndex];
      // Asegurar que los assets vacíos no causen errores
      if (assetRule.generator) {
        assetRule.generator.emit = assetRule.generator.emit || false;
      } else {
        assetRule.generator = { emit: false };
      }
    } else {
      // Agregar regla para assets si no existe
      config.module.rules.push({
        test: /\.(png|jpg|jpeg|gif|svg|ico|webp)$/,
        type: 'asset/resource',
        generator: {
          emit: false,
        },
      });
    }
  }

  // Configurar stats para reducir el ruido en la consola
  if (!config.stats) {
    config.stats = {};
  }
  config.stats.warningsFilter = [
    /export 'default'.*was not found/,
    /Module not found/,
    /Failed to parse source map/,
    /Could not find MIME/,
  ];

  return config;
};

