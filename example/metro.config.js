const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Local file:.. install — use library source for fast refresh (npm uses bundled lib/).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@antdigital/agentui-react-native') {
    return {
      type: 'sourceFile',
      filePath: path.join(monorepoRoot, 'src/index.ts'),
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

// remark/unified in src/ (example alias) are exports-only ESM packages
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
