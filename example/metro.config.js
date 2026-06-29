const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Expo SDK 56+ resolves monorepos automatically; only keep export-aware resolution for remark/unified.
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
  'development',
  'default',
];

config.transformer = {
  ...config.transformer,
  _expoRelativeProjectRoot: projectRoot,
};

module.exports = config;
