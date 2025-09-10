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

// Add blacklist for problematic modules
config.resolver.blockList = [
  new RegExp('.*/__tests__/.*'),
  new RegExp('.*/\\.git/.*'),
];

// Cache configuration
config.cacheStores = [
  new (require('metro-cache').FileStore)({
    root: `${__dirname}/node_modules/.cache/metro`,
  }),
];

module.exports = config;
