import {fileURLToPath} from 'node:url';
import react from '@vitejs/plugin-react';
import {defineConfig, type Plugin} from 'vite';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

/**
 * GitHub Pages serves this project site from a sub-path, so the default base is
 * the repository name. Override it for a different host (`DEMO_BASE=/` to serve
 * from a domain root); the Pages workflow passes the base that
 * `actions/configure-pages` reports, so renaming the repository needs no edit
 * here.
 *
 * Normalised to a trailing slash because the asset rewrite below concatenates
 * onto it, and `configure-pages` does not guarantee one.
 */
const rawBase = process.env.DEMO_BASE || '/astryx-information-maximalist-theme';
const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

/**
 * The template addresses its imagery with root-absolute `/template-assets/*`
 * paths, which only resolve when the app is served from a domain root. Rather
 * than edit the template — its source is the product this repository ships, and
 * is kept byte-identical to the upstream extraction — rewrite those literals at
 * transform time to sit under the configured base.
 *
 * This mirrors what `astryx template` does when it scaffolds the template into
 * a project, except that it points at the real images in `public/` instead of
 * inline placeholder data URIs, so the demo shows the original design.
 */
function baseTemplateAssets(): Plugin {
  return {
    name: 'demo:base-template-assets',
    enforce: 'pre',
    transform(code, id) {
      if (!id.endsWith('templates/information-maximalist.tsx')) {
        return null;
      }
      return {
        code: code.replaceAll('/template-assets/', `${base}template-assets/`),
        map: null,
      };
    },
  };
}

export default defineConfig({
  base,
  plugins: [baseTemplateAssets(), react()],
  // The template's imagery lives at the repository root and is part of the
  // published package, so serve it from there rather than keeping a second copy.
  publicDir: fileURLToPath(new URL('../public', import.meta.url)),
  resolve: {
    // The integration package is a `file:..` dependency, so it is a symlink out
    // of `demo/`. Following it to its real path would make the template's own
    // imports (`react`, `@astryxdesign/core/*`) resolve from the repository
    // root, which has no `node_modules`. Keeping the symlinked path resolves
    // them from `demo/node_modules`. `tsconfig.json` mirrors this.
    preserveSymlinks: true,
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Linked source, not a pre-built dependency: let Vite transform the
    // template's TSX through the normal pipeline.
    exclude: ['astryx-information-maximalist-theme'],
  },
  server: {
    fs: {allow: [repoRoot]},
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // One page pulling in React and the whole component library lands a little
    // over Vite's 500 kB default warning; ~170 kB gzipped is fine for a demo,
    // and splitting it would only add a second round trip.
    chunkSizeWarningLimit: 700,
  },
});
