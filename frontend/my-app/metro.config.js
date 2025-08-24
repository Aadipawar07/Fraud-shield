// Standard Metro config for Expo
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Temporary: disable NativeWind to fix bundling issue
// const { withNativeWind } = require('nativewind/metro');
// module.exports = withNativeWind(config, {
//   input: './app/global.css',
// });

module.exports = config;
