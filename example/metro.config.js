const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Watch library source + root deps only. Do NOT watch all of monorepoRoot — that
// double-indexes example/node_modules (projectRoot + watchFolders) and breaks TreeFS.
config.watchFolders = [
  path.resolve(monorepoRoot, 'src'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;
config.resolver.unstable_enableSymlinks = true;

// remark/unified deps (e.g. devlop) are exports-only; required for web + monorepo resolution
config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
  'development',
  'default',
];

module.exports = config;
