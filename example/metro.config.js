const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

// remark/unified deps (e.g. devlop) are exports-only; required for web + monorepo resolution
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'browser',
  'require',
  'react-native',
  'development',
  'default',
];

module.exports = config;
