import {fileURLToPath} from 'node:url';
import react from '@vitejs/plugin-react';
import {defineConfig, type Plugin} from 'vite';

// This app lives at `apps/demo`, so the repository root is two levels up.
const repoRoot = fileURLToPath(new URL('../..', import.meta.url));

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
 * Hostnames the dev and preview servers will answer to, comma-separated.
 *
 * Vite rejects requests carrying a `Host` header it was not started for, which
 * is the right default — it is what stops a page in the browser from reaching a
 * server bound to a developer's machine. Reviewing a build from another machine
 * (a remote workstation, a shared preview box) means naming that host, so it is
 * read from the environment rather than written in: nothing is trusted unless
 * whoever starts the server says so.
 *
 * `DEMO_ALLOWED_HOSTS=devvm1030.example.com pnpm --filter …demo run preview`
 */
const allowedHosts = (process.env.DEMO_ALLOWED_HOSTS ?? '')
  .split(',')
  .map(host => host.trim())
  .filter(host => host.length > 0);

/**
 * Every root-absolute asset path the template addresses, without its leading
 * slash so it can be concatenated onto the base.
 *
 * `template-assets/` is the imagery directory; `astryx-logo.svg` is the
 * official Astryx brand mark in the masthead, a single file not a directory,
 * which is why these are matched as literal prefixes rather than as one
 * directory rule.
 */
const ROOT_ABSOLUTE_ASSETS: readonly string[] = [
  'template-assets/',
  'astryx-logo.svg',
];

/**
 * The template addresses its assets with root-absolute paths, which only
 * resolve when the app is served from a domain root. Rather than edit the
 * template — its source is the product this repository ships — rewrite those
 * literals at transform time to sit under the configured base, so the same
 * source works at a domain root and under the Pages project path.
 *
 * This mirrors what `astryx template` does when it scaffolds the template into
 * a project, except that it points at the real assets in `public/` instead of
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
        code: ROOT_ABSOLUTE_ASSETS.reduce(
          (out, asset) => out.replaceAll(`/${asset}`, `${base}${asset}`),
          code,
        ),
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
  publicDir: fileURLToPath(new URL('../../public', import.meta.url)),
  resolve: {
    // Symlinks are followed (pnpm's default). The integration package is a
    // `workspace:*` dependency and declares `react`, `@astryxdesign/core` and
    // `@heroicons/react` itself, so the template's and theme's own imports
    // resolve from the repository root's `node_modules` — and because pnpm
    // links both projects at the same store path, that is the same physical
    // React this app loads. `dedupe` makes the guarantee explicit rather than
    // incidental.
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // Linked source, not a pre-built dependency: let Vite transform the
    // template's TSX through the normal pipeline.
    exclude: ['astryx-information-maximalist-theme'],
  },
  server: {
    fs: {allow: [repoRoot]},
    // Empty by default, which leaves Vite's own host check in place.
    allowedHosts: allowedHosts,
  },
  preview: {
    allowedHosts: allowedHosts,
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
