import { cpSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import esbuild from 'esbuild';
import { globSync } from 'glob';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = path.join(root, 'src');
const libRoot = path.join(root, 'lib');

const RN_EXTERNALS = ['react', 'react-native', 'react/jsx-runtime'];

const externalAssetPlugin = {
  name: 'external-relative-assets',
  setup(build) {
    build.onResolve({ filter: /\.(png|jpg|jpeg|gif|webp|svg)$/ }, (args) => {
      if (args.path.startsWith('.') || path.isAbsolute(args.path)) {
        return { path: path.resolve(args.resolveDir, args.path), external: true };
      }
      return null;
    });
  },
};

const bundleResolve = {
  mainFields: ['module', 'main'],
  conditions: ['import', 'require', 'default'],
};

function copyAssetTree() {
  for (const file of globSync('src/**/*.{png,jpg,jpeg,gif,webp,svg}', { cwd: root })) {
    const dest = file.replace(/^src/, 'lib');
    mkdirSync(path.dirname(path.join(root, dest)), { recursive: true });
    cpSync(path.join(root, file), path.join(root, dest));
  }
}

rmSync(libRoot, { recursive: true, force: true });
mkdirSync(libRoot, { recursive: true });

const remarkBundleEntry = path.join(srcRoot, 'MarkdownRenderer/remarkBundle.ts');

await esbuild.build({
  entryPoints: [remarkBundleEntry],
  outfile: path.join(libRoot, 'MarkdownRenderer/remarkBundle.js'),
  bundle: true,
  format: 'cjs',
  platform: 'neutral',
  packages: 'bundle',
  logLevel: 'info',
  ...bundleResolve,
});

const transpileEntries = globSync('src/**/*.{ts,tsx}', {
  cwd: root,
  ignore: ['**/*.d.ts', '**/MarkdownRenderer/remarkBundle.ts'],
});

await esbuild.build({
  entryPoints: transpileEntries.map((p) => path.join(root, p)),
  outdir: libRoot,
  outbase: srcRoot,
  bundle: false,
  format: 'cjs',
  platform: 'neutral',
  logLevel: 'info',
});

await esbuild.build({
  entryPoints: [path.join(srcRoot, 'index.ts')],
  outfile: path.join(libRoot, 'index.mjs'),
  bundle: true,
  format: 'esm',
  platform: 'neutral',
  packages: 'bundle',
  external: RN_EXTERNALS,
  plugins: [externalAssetPlugin],
  logLevel: 'info',
  ...bundleResolve,
});

copyAssetTree();

execSync('tsc -p tsconfig.build.json', { cwd: root, stdio: 'inherit' });

console.log('Build complete: lib/ (remarkBundle + transpiled modules + index.mjs + .d.ts)');
