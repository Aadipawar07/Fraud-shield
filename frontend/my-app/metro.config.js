// Standard Metro config for Expo
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Make sure JSON files are properly handled
config.resolver.sourceExts = [...config.resolver.sourceExts, 'json'];
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'json');

// Temporary: disable NativeWind to fix bundling issue
// const { withNativeWind } = require('nativewind/metro');
// module.exports = withNativeWind(config, {
//   input: './app/global.css',
// });

module.exports = config;
