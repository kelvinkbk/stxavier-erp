// Performance and Bundle Configuration for St. Xavier ERP
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Performance optimizations
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Bundle splitting for web
config.transformer.getTransformOptions = async () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

// Optimize bundle size
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Asset optimization
config.resolver.assetExts.push(
  // Add more asset extensions if needed
  'bin', 'txt', 'jpg', 'png', 'json'
);

// Source map configuration for production debugging
config.serializer.createModuleIdFactory = function() {
  const projectRoot = process.cwd();
  return function(path) {
    // Create predictable module IDs for better caching
    return path.substr(projectRoot.length + 1);
  };
};

module.exports = config;
