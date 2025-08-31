// Standard Metro config for Expo
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Make sure JSON files are properly handled
config.resolver.sourceExts = [...config.resolver.sourceExts, 'json'];
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'json');

// Fix for symbolication issues with <anonymous> files
config.transformer.minifierConfig = {
  mangle: {
    keep_classnames: true,
    keep_fnames: true,
  },
};

// Make source maps more reliable
config.transformer.sourceMap = true;

module.exports = config;
