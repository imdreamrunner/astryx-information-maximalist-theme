# astryx-information-maximalist-theme

An [Astryx](https://github.com/facebook/astryx) integration package that contributes the
**Information Maximalist** page template: a deliberately dense portal home — a search masthead
over a horizontally scrollable section run, bands of headlines under topic tabs, a service
directory, ranked lists, delayed quotes and a forecast, closing on a promo rail. The rail is a
real `LayoutPanel` at wide surfaces, folds into the content column between 680–1139px, and the
masthead splits into two rows below 680px — all measured against the template's own surface
width rather than the viewport, so it renders correctly in embedded/preview surfaces too.

**[▸ Live demo](https://imdreamrunner.github.io/astryx-information-maximalist-theme/)** — the
template itself, rendered from this repository's `templates/` source. Resize the window past
1140px and 680px to see the rail fold and the masthead split.

## Install

This package is published only on GitHub (not npm), so install it by repository reference:

```bash
npm install github:imdreamrunner/astryx-information-maximalist-theme
```

npm resolves the installed module under `node_modules/astryx-information-maximalist-theme` — the
name in this package's `package.json`, not the GitHub slug — so `astryx.config` refers to it the
same way it would for an npm-published integration. Add it there:

```ts
// astryx.config.ts
export default {
  integrations: ['astryx-information-maximalist-theme'],
};
```

## Use

```bash
astryx template --list --package astryx-information-maximalist-theme
astryx template information-maximalist ./src/app/page.tsx
```

Scaffolding rewrites the template's `/template-assets/*` image references to inline placeholder
data URIs, so the scaffolded page renders with zero setup regardless of whether the consuming
project has those asset files.

## Demo app

[`demo/`](./demo) is a small Vite + React app whose only job is to put the template on a screen.
It is deliberately chrome-free: no wrapper UI, no theme switcher, nothing layered over the
template — what you see is the template.

```bash
cd demo
npm install
npm run dev
```

`npm install` resolves `astryx-information-maximalist-theme` as a `file:..` dependency — a link
back to this repository — so `demo/src/main.tsx` imports the template through the same package
specifier a consuming project uses, and any change to `templates/` shows up on the next reload.

| Script              | Does                                                     |
| ------------------- | -------------------------------------------------------- |
| `npm run dev`       | Vite dev server with hot reload                          |
| `npm run build`     | Production build into `demo/dist`                        |
| `npm run preview`   | Serve the built output, as Pages does                    |
| `npm run typecheck` | `tsc --noEmit`, covering the template source it imports  |
| `npm run lint`      | Prettier format check over `demo/`                       |

Two notes on how it is wired, both in [`demo/vite.config.ts`](./demo/vite.config.ts):

- **Base path.** Pages serves the site from `/astryx-information-maximalist-theme/`, so the demo
  builds against that base by default; `DEMO_BASE=/ npm run build` targets a domain root instead.
  The template addresses its imagery with root-absolute `/template-assets/*` paths, which only
  resolve at a domain root, so a small transform rewrites those literals under the configured
  base. The template source is left untouched — this is the same rewrite `astryx template`
  performs when it scaffolds the template, except that it points at the real images rather than
  inline placeholders, so the demo shows the original design.
- **Assets and symlinks.** `publicDir` points at this repository's own `public/`, so the demo
  serves the shipped imagery instead of keeping a second copy. Because the `file:..` dependency
  is a symlink out of `demo/`, both Vite and TypeScript run with `preserveSymlinks` so the
  template's own imports resolve from `demo/node_modules`.

Pushes to `main` build and publish the demo via
[`.github/workflows/deploy-demo.yml`](./.github/workflows/deploy-demo.yml). Nothing in `demo/` is
part of the published package — `files` in `package.json` does not include it — so installing this
integration does not pull the demo's dependencies.

## Package layout

```
astryx.integration.mjs                        — integration manifest (points the CLI at ./templates)
templates/
  information-maximalist.tsx                   — the page template source
  information-maximalist.template.mjs          — template metadata (name, description, category)
public/template-assets/                        — the original demo imagery; rendered as-is by the
                                                  demo app, and not required by the CLI, which
                                                  rewrites every `/template-assets/*` reference to
                                                  an inline placeholder on scaffold (see "Use")
demo/                                          — standalone Vite app that renders the template
                                                  (see "Demo app"); not part of the package
```

## Source

Extracted from [facebook/astryx](https://github.com/facebook/astryx) at commit
[`5c6b6f2b0cdb4c187ca9174f6e993307f2b51ee7`](https://github.com/facebook/astryx/commit/5c6b6f2b0cdb4c187ca9174f6e993307f2b51ee7),
repackaged as a standalone installable integration.

## License

MIT, see [LICENSE](./LICENSE). Copyright (c) Meta Platforms, Inc.
