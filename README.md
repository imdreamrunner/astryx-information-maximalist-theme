# astryx-information-maximalist-theme

An [Astryx](https://github.com/facebook/astryx) integration package that contributes the
**Information Maximalist** page template: a deliberately dense portal home — a search masthead
over a horizontally scrollable section run, bands of headlines under topic tabs, a service
directory, ranked lists, delayed quotes and a forecast, closing on a promo rail. The rail is a
real `LayoutPanel` at wide surfaces, folds into the content column between 680–1139px, and the
masthead splits into two rows below 680px — all measured against the template's own surface
width rather than the viewport, so it renders correctly in embedded/preview surfaces too.

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

## Package layout

```
astryx.integration.mjs                        — integration manifest (points the CLI at ./templates)
templates/
  information-maximalist.tsx                   — the page template source
  information-maximalist.template.mjs          — template metadata (name, description, category)
public/template-assets/                        — the original demo imagery, kept as source/demo
                                                  reference (this repo does not itself ship a demo
                                                  app); not required by the CLI, which rewrites
                                                  every `/template-assets/*` reference to an inline
                                                  placeholder on scaffold (see "Use" above)
```

## Source

Extracted from [facebook/astryx](https://github.com/facebook/astryx) at commit
[`5c6b6f2b0cdb4c187ca9174f6e993307f2b51ee7`](https://github.com/facebook/astryx/commit/5c6b6f2b0cdb4c187ca9174f6e993307f2b51ee7),
repackaged as a standalone installable integration.

## License

MIT, see [LICENSE](./LICENSE). Copyright (c) Meta Platforms, Inc.
