import {Theme} from '@astryxdesign/core/theme';
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import './styles.css';

// Both the theme and the template are imported through the package name rather
// than a relative path: these are the exact specifiers a consuming project uses
// after `npm install github:imdreamrunner/astryx-information-maximalist-theme`,
// so the demo exercises the package's real `exports` contract. Here they
// resolve through the `workspace:*` dependency back to this repository's own
// `themes/` and `templates/`.
import {informationMaximalistTheme} from 'astryx-information-maximalist-theme/themes/information-maximalist/informationMaximalistTheme.ts';
import InformationMaximalistPage from 'astryx-information-maximalist-theme/templates/information-maximalist.tsx';

const container = document.getElementById('root');
if (container == null) {
  throw new Error('Missing #root container');
}

// `?theme=off` renders the same template with no provider at all, so the two
// URLs are a side-by-side of what the theme contributes. It exists because the
// claim "the template is authored against the theme's semantic system" is only
// worth anything if you can see it: the template holds no colours, no px
// literals and no class names, so with the provider gone it falls back to the
// Astryx defaults in `astryx.css` and the page visibly relaxes.
const isThemed =
  new URLSearchParams(window.location.search).get('theme') !== 'off';

// Activation lives here, in the host, not in the template. The template is
// content-only — it composes Astryx primitives and declares no theme — which is
// what lets a consumer drop it into an app that already has its own Theme, or
// render it under a different theme entirely. Wrapping it here is the demo
// choosing which theme to show it in.
//
// It does bring one provider of its own, and it is the exception that proves the
// rule: the template mounts `InternationalizationProvider` for the locale it
// publishes in, because the copy is the page and a page template that did not
// own its own words would not be a page template. That provider carries no
// visual opinion, is scoped to the template's subtree, and is overridden by a
// host that already has one — none of which is true of a Theme.
//
// The theme is passed as unbuilt source, so <Theme> compiles it to CSS and
// injects it at runtime. That is the right trade for a demo: it proves the
// checked-in source theme is what you are looking at, with no build artifact in
// between. A production app would run `astryx theme build` and ship the CSS.
const page = <InformationMaximalistPage />;

createRoot(container).render(
  <StrictMode>
    {isThemed ? <Theme theme={informationMaximalistTheme}>{page}</Theme> : page}
  </StrictMode>,
);
