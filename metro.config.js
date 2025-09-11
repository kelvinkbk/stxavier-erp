// Performance and Bundle Configuration for St. Xavier ERP
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Basic platform support
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Safe transformer options
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: false, // Set to false to prevent module resolution issues
  },
});

// Asset optimization
config.resolver.assetExts.push(
  'bin', 'txt', 'jpg', 'png', 'json'
);

// Use default module ID factory to prevent path truncation issues
// config.serializer.createModuleIdFactory removed to use Metro's default

module.exports = config;

module.exports = config;
