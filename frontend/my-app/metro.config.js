// Simplified Metro config for better compatibility
const { getDefaultConfig } = require("expo/metro-config");
const path = require('path');

const config = getDefaultConfig(__dirname);

// Basic configuration for better mobile compatibility
config.resolver.sourceExts = [...config.resolver.sourceExts, 'json'];
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'json');

// Re-enable source maps for better debugging
config.transformer.sourceMap = true;

// Add path aliases for @ imports
config.resolver.alias = {
  '@': path.resolve(__dirname),
};

module.exports = config;
