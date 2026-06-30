const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

/** Resolve from example app so ../src never pulls react from repo-root node_modules. */
function resolveFromExampleApp(moduleName) {
  try {
    return require.resolve(moduleName, { paths: [projectRoot] });
  } catch {
    return null;
  }
}

const REACT_SINGLETON_PREFIXES = ['react', 'react-dom', 'react-native', 'react-native-web'];

function isReactSingleton(moduleName) {
  return REACT_SINGLETON_PREFIXES.some(
    (pkg) => moduleName === pkg || moduleName.startsWith(`${pkg}/`),
  );
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Parent package (file:..) — src/, theme/*.css, and shared node_modules must be watchable for SHA-1.
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = true;

const reactRoot = path.dirname(
  require.resolve('react/package.json', { paths: [projectRoot] }),
);
config.resolver.extraNodeModules = {
  react: reactRoot,
  'react-dom': path.dirname(
    require.resolve('react-dom/package.json', { paths: [projectRoot] }),
  ),
  'react-native': path.dirname(
    require.resolve('react-native/package.json', { paths: [projectRoot] }),
  ),
  'react-native-web': path.dirname(
    require.resolve('react-native-web/package.json', { paths: [projectRoot] }),
  ),
};

// Local file:.. install — use library source for fast refresh (npm uses bundled lib/).
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (isReactSingleton(moduleName)) {
    const filePath = resolveFromExampleApp(moduleName);
    if (filePath) {
      return { type: 'sourceFile', filePath };
    }
  }
  if (moduleName === '@antdigital/agentui-react-native') {
    return {
      type: 'sourceFile',
      filePath: path.join(monorepoRoot, 'src/index.ts'),
    };
  }
  if (
    moduleName === '@antdigital/agentui-react-native/theme/markdownWebReset.css'
  ) {
    return {
      type: 'sourceFile',
      filePath: path.join(monorepoRoot, 'theme/markdownWebReset.css'),
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
