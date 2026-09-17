# astryx-information-maximalist-theme

An [Astryx](https://github.com/facebook/astryx) integration package that contributes two separate,
independently usable things:

- **A source theme** — `information-maximalist`, a dense portal visual system expressed entirely in
  Astryx theme tokens and component theming targets. It restyles _any_ Astryx composition.
- **A page template** — `information-maximalist`, a deliberately dense portal home page. It is
  content only: it composes Astryx primitives and declares no provider of its own.

They are designed to be used together but are not coupled. The template is authored purely against
Astryx's semantic system — no hex colours, no stylesheets, no class names, no inline styles, and no
type, spacing or radius values of its own — so the theme restyles it without either one referring to
the other, and either can be used on its own. The only measurements it states are column widths and
grid track minimums, which are composition rather than style.

**[▸ Live demo](https://imdreamrunner.github.io/astryx-information-maximalist-theme/)** — the
template rendered through the theme. Append
[`?theme=off`](https://imdreamrunner.github.io/astryx-information-maximalist-theme/?theme=off) to
see the same template with no theme applied; the difference is entirely what the theme contributes.
Resize past 960px, 880px and 720px to watch the directory fold, the rail drop under the news well,
and the masthead split.

## Separation of concerns

| Lives in                    | Owns                                                                 |
| --------------------------- | -------------------------------------------------------------------- |
| `themes/` (this package)    | The visual system — tokens, component overrides, icons, adaptations  |
| `templates/` (this package) | The page structure and content, written against that semantic system |
| `apps/demo` (not shipped)   | **Activation** — mounting React and wrapping the page in `<Theme>`   |

The template deliberately does **not** wrap itself in a `<Theme>` provider. A page template that
installed a global theme would fight any app that already has one, and would make it impossible to
render the page under a different theme. Activation belongs to the host, which is why it lives in
the demo app and why the demo is the only project here that deploys to Pages.

## Install the integration

Published only on GitHub (not npm), so install it by repository reference:

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

## Use the theme

```bash
astryx theme list --package astryx-information-maximalist-theme
astryx theme add information-maximalist ./src/theme
```

`theme add` copies the theme in as **editable source you own** — both
`informationMaximalistTheme.ts` and its `icons.tsx` — rather than linking a dependency. Activate it
in your app's root:

```tsx
import {Theme} from '@astryxdesign/core/theme';
import {informationMaximalistTheme} from './theme/informationMaximalistTheme';

<Theme theme={informationMaximalistTheme}>
  <App />
</Theme>;
```

Passing the theme as source means `<Theme>` compiles it to CSS at runtime. For production, compile
it ahead of time and ship the stylesheet:

```bash
astryx theme build ./src/theme/informationMaximalistTheme.ts -o ./src/theme/theme.css \
  --icons-specifier ./icons.mjs
```

### What the theme does

Eight rules, all encoded through public theme APIs — no page-specific CSS:

1. **Dense type** — 14px base on a shallow 1.08 ratio, so eight levels of hierarchy fit between
   12px and 16px, with every leading pinned into 1.36–1.43. The family stack is the platform UI
   face and nothing else (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`,
   `Helvetica Neue`, `Arial`), because a portal at this size is unreadable in a fallback serif.
2. **Compressed space** — steps 1–4 are left at a canonical 4/8/12/16 rhythm, which is what a dense
   layout actually gauges itself against; only the larger steps are pulled in, so nothing above the
   fold spends space on air.
3. **Hairlines, not boxes** — structure carried by 1px blue-gray separators; `--shadow-low` and
   `--shadow-med` are set to `none` rather than softened, so a module is a ruled rectangle.
4. **Near-square corners** — `radius: {base: 4, multiplier: 0.25}`.
5. **A bounded sheet** — the `layout` target gets `max-width: 1000px` and `margin-inline: auto`, so
   the page reads as a centred document rather than stretching to any monitor. Pale blue-gray
   utility surfaces sit against it.
6. **Blue for links, red for alarms** — the accent is `#225BFF`, the fill of the official Astryx
   brand mark, set as the theme's `color.accent` and pinned on `--color-accent` so every
   accent-derived state follows it: link text, interactive icons, the active tab and its indicator,
   focus rings, the search button's fill. It is spent on those alone — neutral text, hairlines and
   surfaces stay as they are — and exactly one other hue is defined: a red on `--color-text-red` /
   `--color-error` for the values a reader scans _for_, plus an amber `--color-warning` flag with
   dark text on it. Rationed, so it still registers.
7. **Utilitarian tabs** — plain text on the module's own surface, divided by hairlines and closed by
   one rule underneath: no trough, no pills, no filled tab. Nine sections fit in 28px of height, and
   the row says where you are three ways over — weight, colour and a 2px indicator.
8. **Density follows the viewport** — expressed as theme `adaptations` (width breakpoints plus a
   coarse-pointer rule), not as media queries in a consumer's stylesheet. Below `md` the scale
   relaxes for hand-held reading; coarse pointers get real hit targets; above `2xl` both step back
   up for across-the-room legibility.

Component overrides address theming targets from `astryx theme targets` (`card`, `layout-header`,
`tab-indicator`, `badge`, `link`, …), which is what makes the system portable rather than tied to
one page.

#### A note on the fonts

The stack is deliberately system-only — every face in it ships with macOS, Windows, iOS or Android,
and every one is on `astryx theme build`'s preinstalled list, so the build raises no
"names fonts it does not load" notice, the theme costs no webfont request, and nothing flashes on
first paint.

One platform is still worth knowing about: a bare Linux machine with none of these families
installed and no fontconfig substitution falls through to generic `sans-serif`, which is whatever
that machine happens to have. The metrics hold — the theme pins its own sizes and leadings — but
the face is not the one you designed against. If you need a guaranteed face, load a webfont in your
host and put it at the front of the stack:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter&display=swap"
  rel="stylesheet" />
```

## Use the template

```bash
astryx template --list --package astryx-information-maximalist-theme
astryx template information-maximalist ./src/app/page.tsx
```

Scaffolding rewrites the template's `/template-assets/*` image references to inline placeholder
data URIs, so the scaffolded page renders with zero setup regardless of whether the consuming
project has those asset files. The masthead's `/astryx-logo.svg` is not among them — it is a brand
mark, and there is no placeholder to stand in for one — so copy that one file out of the package's
`public/` into the host's own public directory, or point the `<img>` at wherever the host keeps it.

The page is a high-density portal home, and its content is original fictional US English copy
throughout — a two-row masthead over a tinted search well, then three unequal columns of ruled
modules: a service directory rail, headlines under section tabs, and a rail of sign-in, forecast,
index quotes and most-popular rankings. It is built from bulleted text links carrying comment
counts and status flags rather than from cards, with imagery rationed to one focal image per
module.

Every row whose content is a piece of writing you open and read is the same `ArticleRow`: a flush
bullet in the body ink, the headline at the page's 14px body size, and its metadata inside one
row-wide anchor, so any point in the row is a hit, nothing is tinted behind it, and the hover
underline marks the headline alone. Five runs take it — the news feed, Features & Columns, both
columns of City Notices, Answers and Most Popular, which swaps the bullet for the `<ol>`'s ordinal.
The page's other runs are deliberately not headline rows and keep their own: the service directory,
the market quotes, the keyword cloud and the dated event listings. The template's `Article rows`
section lists which are which, and why.

Three surface widths change the arrangement: below 960px the directory folds into a band across the
top, below 880px the rail drops under the news well, and below 720px the masthead splits into rows,
the search scopes scroll sideways and the focal image moves under its headline list. All three are
measured against the template's own surface width rather than the viewport, so the page also renders
correctly inside a preview dialog, a split editor or a catalog card.

## Repository layout

This is a [pnpm workspace](https://pnpm.io/workspaces). The repository root is itself a workspace
member — it _is_ the integration package — so `apps/demo` can depend on it with `workspace:*` and
consume the real package rather than a copy.

```
package.json                                  — the integration package (published by GitHub ref)
pnpm-workspace.yaml                           — workspace definition; lists '.' and 'apps/*'
astryx.integration.mjs                        — integration manifest (./templates and ./themes)

themes/
  manifest.json                                — theme catalog
  information-maximalist/
    informationMaximalistTheme.ts              — the theme (catalog `entry`)
    icons.tsx                                  — Heroicons-backed IconRegistry

templates/
  information-maximalist.tsx                   — the page template source
  information-maximalist.template.mjs          — template metadata (name, description, category)

public/astryx-logo.svg                         — the official Astryx brand mark in the masthead,
                                                 copied byte-for-byte from facebook/astryx's
                                                 docsite brand asset (see Source);
                                                 published with the package, unlike the imagery it
                                                 sits beside, because the CLI has no placeholder
                                                 to substitute for a brand mark

public/template-assets/                        — the original imagery; rendered as-is by the demo,
                                                 and not required by the CLI, which rewrites every
                                                 `/template-assets/*` reference to an inline
                                                 placeholder on scaffold

apps/demo/                                     — private workspace app; consumes the theme and the
                                                 template and owns activation. Not published: it is
                                                 absent from `files` in package.json
```

pnpm is used rather than npm workspaces for one concrete reason: pnpm keeps the workspace definition
in `pnpm-workspace.yaml`, so the root `package.json` — the manifest consumers actually install —
carries no `workspaces` field it has no use for.

## Workspace commands

Run from the repository root:

```bash
pnpm install
pnpm dev
```

| Command              | Does                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`           | Vite dev server for `apps/demo`, with hot reload over both theme and template                                |
| `pnpm build`         | Production build of every app into `apps/*/dist`                                                             |
| `pnpm typecheck`     | `tsc --noEmit` per app, which also covers the theme and template sources they import                         |
| `pnpm lint`          | Prettier check across the workspace                                                                          |
| `pnpm format`        | Prettier write                                                                                               |
| `pnpm theme:build`   | Compile the theme with the Astryx CLI — the only thing that validates overrides against real theming targets |
| `pnpm theme:targets` | List every themeable target, with its props and states                                                       |
| `pnpm theme:list`    | Verify the theme catalog resolves through the integration                                                    |
| `pnpm template:list` | Verify the template is discoverable through the integration                                                  |
| `pnpm check`         | lint → typecheck → theme:build → build, the same gates CI runs                                               |

## The demo app

[`apps/demo`](./apps/demo) is a small Vite + React app whose only job is to put the template on a
screen under the theme. It is chrome-free: no wrapper UI, nothing layered over the page.

[`apps/demo/src/main.tsx`](./apps/demo/src/main.tsx) imports both the theme and the template through
the **package name**, not relative paths — the same specifiers a consuming project uses — so the
demo exercises the package's real `exports` contract:

```tsx
import {informationMaximalistTheme} from 'astryx-information-maximalist-theme/themes/information-maximalist/informationMaximalistTheme.ts';
import InformationMaximalistPage from 'astryx-information-maximalist-theme/templates/information-maximalist.tsx';
```

`?theme=off` renders the same page with the provider removed. That switch exists so the claim that
the template is authored against the theme's semantic system is checkable rather than asserted.

Two notes on the wiring, both in [`apps/demo/vite.config.ts`](./apps/demo/vite.config.ts):

- **Base path.** Pages serves the site from `/astryx-information-maximalist-theme/`, so the demo
  builds against that base by default; `DEMO_BASE=/ pnpm build` targets a domain root instead. The
  template addresses its imagery with root-absolute `/template-assets/*` paths, which only resolve
  at a domain root, so a small transform rewrites those literals under the configured base. The
  template source is left untouched — this is the same rewrite `astryx template` performs on
  scaffold, except that it points at the real images rather than inline placeholders, so the demo
  shows the original design.
- **Assets.** `publicDir` points at this repository's own `public/`, so the demo serves the shipped
  imagery instead of keeping a second copy.

Pushes to `main` build and publish the demo via
[`.github/workflows/deploy-demo.yml`](./.github/workflows/deploy-demo.yml). Only `apps/demo` is
deployed; the integration is never published to npm.

## Source

This package began as an extraction of the Information Maximalist page template from
[facebook/astryx](https://github.com/facebook/astryx) at commit
[`5c6b6f2b0cdb4c187ca9174f6e993307f2b51ee7`](https://github.com/facebook/astryx/commit/5c6b6f2b0cdb4c187ca9174f6e993307f2b51ee7),
repackaged as a standalone installable integration.

The template has since been rewritten: its composition and all of its copy are original to this
repository, and the copy is fiction — the portal, its services, its headlines, its quotes and its
place names do not exist. The theme is original to this repository too. What remains from the
extraction is the imagery in `public/template-assets/`, which is Astryx's own stock template asset
set.

Two things in the page are upstream's rather than this repository's, and are kept byte-identical to
it:

| File                      | From                                                                                                                                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `public/astryx-logo.svg`  | [`apps/docsite/public/brand-icon.svg`](https://github.com/facebook/astryx/blob/5a7b81959305e8f7e63238ff2f475353a7716222/apps/docsite/public/brand-icon.svg) at `5a7b819`, sha256 `54e9c7b2405ff964750159384a9c169159e3efa93c4a412dba3331f1a4c38b75` |
| `public/template-assets/` | the stock template asset set, as above                                                                                                                                                                                                              |

The mark is the current official Astryx brand mark and is not redrawn here, so the copy is
verifiable: `sha256sum` it against the upstream path. It is the docsite's brand asset, which is the
same artwork the docsite's `logos.tsx` inlines as `AstryxIcon`; the public file is the form this
template wants, because an `<img>` cannot inherit `currentColor` the way that inline path does, and
the file carries the brand blue itself. It renders before the `Astryx` wordmark with `alt=""` — the
`<h1>` beside it already carries the site's name, so naming the image too would announce that name
twice.

The wordmark next to it is set to match the mark rather than to look like a heading: the theme
defines a `wordmark` role on Heading's `type` axis whose line box collapses onto a 20px glyph box,
published as a `--text-wordmark-size` theme-local property that the template also reads for the
`<img>`, so mark and wordmark cannot drift. The `<h1>` keeps its level — `type` decides only how it
is set — and takes its ink from `color="accent"`, which is the same brand blue the file is drawn in.

## License

MIT, see [LICENSE](./LICENSE). Copyright (c) Meta Platforms, Inc.
