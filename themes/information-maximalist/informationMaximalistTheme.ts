// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file informationMaximalistTheme.ts
 * @input Astryx `defineTheme` plus this theme's icon registry
 * @output Exports `informationMaximalistTheme`
 * @position Entry point of the Information Maximalist source theme; declared in
 *   ../manifest.json and reachable through the integration's `themes` root
 *
 * # Information Maximalist
 *
 * A visual system for surfaces whose job is to show a lot at once: portal home
 * pages, operations consoles, market and status boards. It is a general theme,
 * not page styling — it is expressed entirely in Astryx theme tokens and
 * component theming targets, so it restyles any Astryx composition, and the
 * page template this package also ships happens to be one such composition.
 *
 * Five rules define it:
 *
 * 1. **Tight type.** A 13px base on a 1.14 ratio. The small ratio is the point:
 *    it keeps eight levels of hierarchy inside a narrow band so a screen can
 *    carry more of them before the largest one starts to dominate.
 * 2. **Compressed space.** The spacing scale is pulled in roughly 25% at the
 *    sizes layouts actually reach for, so the same composition fits more rows
 *    per screen without any component changing its internal proportions.
 * 3. **Hairlines, not boxes.** Structure is carried by 1px separators and flat
 *    surfaces. Shadows are removed rather than softened, because a shadow at
 *    this density reads as noise between adjacent panels.
 * 4. **Near-square corners.** Radii scale to a quarter of stock. Rounded
 *    corners cost horizontal room at small sizes and blur the grid.
 * 5. **Density follows the viewport.** Encoded as `adaptations` rather than
 *    page media queries, so any consumer inherits it.
 *
 * Deliberately NOT here: anything keyed to one page's structure. Every override
 * below addresses a theming target from `astryx theme targets`, which is what
 * makes the system portable.
 */

import {defineTheme} from '@astryxdesign/core/theme';
import {informationMaximalistIconRegistry} from './icons';

/**
 * A cool steel blue. Dense screens are mostly neutral surface, so the accent
 * has to stay legible as a 1px underline or a 6px dot, not just as a filled
 * button — a desaturated hue holds up better at those sizes than a vivid one.
 * The dark seed is lifted, not just inverted, so it clears the near-black
 * background the theme uses.
 */
const ACCENT: [light: string, dark: string] = ['#1B5FA8', '#79AEEA'];

/**
 * Hairline separators. Low enough contrast to recede into the page, high
 * enough to survive a non-color-managed display — which is where 1px rules on
 * an off-white background usually disappear.
 */
const HAIRLINE: [light: string, dark: string] = ['#D8DCE1', '#31363D'];
const HAIRLINE_STRONG: [light: string, dark: string] = ['#B9C0C8', '#464D56'];

/**
 * Surfaces. Body sits a shade below cards so panel edges read even where no
 * separator is drawn; the gap between them is kept small so the page does not
 * turn into a set of floating boxes.
 */
const SURFACE_BODY: [light: string, dark: string] = ['#F4F5F7', '#0E1116'];
const SURFACE_CARD: [light: string, dark: string] = ['#FFFFFF', '#151920'];
const SURFACE_MUTED: [light: string, dark: string] = ['#EDEFF2', '#1B2028'];

export const informationMaximalistTheme = defineTheme({
  name: 'information-maximalist',

  /**
   * 13px base rather than the stock 14, on a 1.14 ratio rather than ~1.2.
   * Together they compress the whole scale: the display sizes come down far
   * more than body text does, which is what stops a dense page from being
   * dominated by two or three headings.
   */
  typography: {
    scale: {base: 13, ratio: 1.14},
    body: {
      // System UI stack first: it renders at small sizes without a webfont
      // round trip, and a theme that shows this much text cannot afford a
      // flash of unstyled content on first paint. No font is loaded, so
      // consumers inherit no network dependency from the theme.
      family: 'system-ui',
      fallbacks:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    heading: {
      // Headings carry weight instead of size, since the tight ratio leaves
      // little size difference to work with.
      weights: {
        1: 'bold',
        2: 'bold',
        3: 'semibold',
        4: 'semibold',
        5: 'semibold',
        6: 'semibold',
      },
    },
    code: {
      family: 'ui-monospace',
      fallbacks: '"SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    },
  },

  /**
   * Neutrals seeded cool to match the accent, at high contrast. High contrast
   * is a density decision, not an accessibility afterthought: with less white
   * space separating elements, tone has to do the separating.
   */
  color: {
    accent: ACCENT,
    neutralStyle: 'cool',
    contrast: 'high',
  },

  /**
   * Quarter radii. `base: 4` keeps the stock step relationships; the
   * multiplier is what flattens them, so a consumer who wants slightly softer
   * corners can raise one number instead of restating seven tokens.
   */
  radius: {base: 4, multiplier: 0.25},

  /**
   * Snappy. On an information-dense surface a transition is feedback that a
   * value changed, so it has to finish before the eye moves on.
   */
  motion: {fast: 100, medium: 200, slow: 400, ratio: 0.75},

  tokens: {
    // --- Spacing: compressed where layouts actually reach ------------------
    // The small end is left alone; shaving 2px off a 4px gap would collapse
    // it. Compression ramps up through the middle and large steps, which is
    // where page-level padding and section gaps come from.
    '--spacing-2': '6px', // 8
    '--spacing-3': '10px', // 12
    '--spacing-4': '12px', // 16
    '--spacing-5': '16px', // 20
    '--spacing-6': '18px', // 24
    '--spacing-7': '21px', // 28
    '--spacing-8': '24px', // 32
    '--spacing-9': '27px', // 36
    '--spacing-10': '30px', // 40
    '--spacing-11': '33px', // 44
    '--spacing-12': '36px', // 48

    // --- Controls: shorter, so rows stack tighter --------------------------
    '--size-element-sm': '24px', // 28
    '--size-element-md': '28px', // 32
    '--size-element-lg': '32px', // 36

    // --- Structure: hairlines --------------------------------------------
    '--color-border': HAIRLINE,
    '--color-border-emphasized': HAIRLINE_STRONG,
    '--color-background-body': SURFACE_BODY,
    '--color-background-surface': SURFACE_CARD,
    '--color-background-card': SURFACE_CARD,
    '--color-background-muted': SURFACE_MUTED,
    // Popovers keep a hairline and a single flat shadow (below) rather than
    // the stock layered one — see the shadow tokens.
    '--color-background-popover': SURFACE_CARD,

    // --- Elevation: flattened --------------------------------------------
    // Set to `none` rather than to a softer shadow. A card and the panel
    // behind it are separated by a border here; adding a shadow on top of
    // that draws a second edge a few pixels away from the first, which at
    // this density reads as a rendering artifact. `high` keeps a single
    // hairline-plus-shade so genuinely floating surfaces (menus, popovers)
    // still detach from the page.
    '--shadow-low': 'none',
    '--shadow-med': 'none',
    '--shadow-high':
      '0px 2px 6px light-dark(rgba(16, 24, 40, 0.10), rgba(0, 0, 0, 0.55))',

    // --- Focus: tight ring ------------------------------------------------
    // The stock 3px offset is generous for controls sitting 6px apart; at this
    // spacing the ring of one control would overlap its neighbour.
    '--focus-outline-width': '2px',
    '--focus-outline-offset': '1px',
  },

  /**
   * Component overrides — each key is a theming target from
   * `astryx theme targets`, which is what keeps this portable across
   * compositions instead of tied to one page.
   */
  components: {
    // Page chrome. The header and footer are separated from content by a rule
    // rather than by a shadow or a background change, which is the single
    // most recognisable move in this system.
    'layout-header': {
      base: {
        borderBottom: 'var(--border-width) solid var(--color-border)',
        backgroundColor: 'var(--color-background-surface)',
      },
    },
    'layout-footer': {
      base: {
        borderTop: 'var(--border-width) solid var(--color-border)',
        backgroundColor: 'var(--color-background-surface)',
      },
    },
    // A side rail reads as part of the page grid, not as a floating panel.
    'layout-panel': {
      base: {
        borderInlineEnd: 'var(--border-width) solid var(--color-border)',
        backgroundColor: 'var(--color-background-surface)',
      },
    },
    'layout-content': {
      base: {backgroundColor: 'var(--color-background-body)'},
    },

    // Cards are rectangles with a hairline, never raised.
    card: {
      base: {
        borderRadius: 'var(--radius-element)',
        boxShadow: 'none',
      },
      'variant:default': {
        borderColor: 'var(--color-border)',
        borderWidth: 'var(--border-width)',
      },
      'variant:muted': {
        backgroundColor: 'var(--color-background-muted)',
        borderWidth: 'var(--border-width)',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
      },
    },
    'clickable-card': {
      base: {
        borderRadius: 'var(--radius-element)',
        boxShadow: 'none',
        transitionDuration: 'var(--duration-fast)',
        // Hover moves tone, not elevation — the card must not shift the grid.
        ':hover': {borderColor: 'var(--color-border-emphasized)'},
      },
    },

    // Sections separate on tone alone.
    section: {
      'variant:muted': {backgroundColor: 'var(--color-background-muted)'},
    },

    // Separators are the primary structural device, so they are tuned rather
    // than left at stock: subtle is the default page rule, strong is reserved
    // for a real change of subject.
    divider: {
      'variant:subtle': {backgroundColor: 'var(--color-border)'},
      'variant:strong': {backgroundColor: 'var(--color-border-emphasized)'},
    },

    // Badges and tokens are labels, not buttons: squared off, tight, and
    // reading at the supporting size so a row of them does not out-shout the
    // text it annotates.
    badge: {
      base: {
        borderRadius: 'var(--radius-inner)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-semibold)',
        letterSpacing: '0.02em',
        paddingInline: 'var(--spacing-1)',
      },
    },
    token: {
      base: {
        borderRadius: 'var(--radius-inner)',
        fontSize: 'var(--font-size-sm)',
      },
    },

    // Tabs sit on the page rule rather than in a raised strip.
    'tab-list': {
      base: {borderBottom: 'var(--border-width) solid var(--color-border)'},
    },
    tab: {
      base: {
        borderRadius: '0px',
        fontWeight: 'var(--font-weight-medium)',
      },
      // Bare key, not `state:selected` — states are addressed by name.
      selected: {fontWeight: 'var(--font-weight-semibold)'},
    },
    'tab-indicator': {
      // A 2px underline, not a pill: it marks a column of the grid.
      base: {height: '2px', borderRadius: '0px'},
    },

    'segmented-control': {
      base: {
        borderRadius: 'var(--radius-inner)',
        border: 'var(--border-width) solid var(--color-border)',
        backgroundColor: 'var(--color-background-muted)',
        boxShadow: 'none',
      },
    },
    'segmented-control-item': {
      base: {borderRadius: 'var(--radius-inner)'},
    },

    // Banners are informational rules across the page, not raised callouts.
    'banner-frame': {
      base: {
        borderRadius: 'var(--radius-element)',
        boxShadow: 'none',
        borderWidth: 'var(--border-width)',
        borderStyle: 'solid',
        borderColor: 'var(--color-border)',
      },
    },

    // Imagery is squared to the same grid as everything else.
    thumbnail: {
      base: {
        borderRadius: 'var(--radius-inner)',
        border: 'var(--border-width) solid var(--color-border)',
      },
    },

    // Links stay underlined. On a page this dense, colour alone is not a
    // reliable signal that something is a link.
    link: {
      base: {
        textDecorationLine: 'underline',
        textDecorationThickness: '1px',
        textUnderlineOffset: '2px',
        textDecorationColor:
          'color-mix(in srgb, currentColor 35%, transparent)',
        ':hover': {textDecorationColor: 'currentColor'},
      },
    },

    // Lists are the workhorse of a dense page; the compact density gets
    // tightened further and picks up row hairlines.
    list: {
      'density:compact': {rowGap: 'var(--spacing-1)'},
    },

    // Supporting text is where a dense layout puts its metadata, so it is
    // pushed down a step and given tabular figures — columns of numbers that
    // do not align are the most common failure of this kind of page.
    text: {
      'type:supporting': {
        fontSize: 'var(--font-size-xs)',
        fontVariantNumeric: 'tabular-nums',
      },
      'type:label': {
        letterSpacing: '0.01em',
        fontVariantNumeric: 'tabular-nums',
      },
    },
    heading: {
      base: {letterSpacing: '-0.011em'},
    },
  },

  icons: informationMaximalistIconRegistry,

  /**
   * Density is a function of how much room there is, so it belongs in the
   * theme rather than in each consumer's media queries.
   *
   * Below `md` the type scale relaxes slightly and spacing opens up: phone
   * reading distance is shorter, and 13px on a 1.14 ratio that works on a
   * 27-inch board is punishing in the hand. Above `2xl` it goes the other way
   * — a very wide board is usually read from across a room, so both type and
   * spacing step back up.
   */
  adaptations: {
    rules: [
      {
        when: {width: {below: 'md'}},
        value: {
          typography: {scale: {base: 14, ratio: 1.16}},
          tokens: {
            '--spacing-3': '12px',
            '--spacing-4': '14px',
            '--spacing-5': '18px',
            '--spacing-6': '22px',
            '--size-element-sm': '28px',
            '--size-element-md': '32px',
            '--size-element-lg': '36px',
          },
        },
      },
      {
        // Coarse pointers need a real hit target regardless of viewport, so
        // this rule is declared after the width rule and wins where both
        // match.
        when: {pointer: 'coarse'},
        value: {
          tokens: {
            '--size-element-sm': '32px',
            '--size-element-md': '40px',
            '--size-element-lg': '44px',
          },
        },
      },
      {
        when: {width: {from: '2xl'}},
        value: {
          typography: {scale: {base: 14, ratio: 1.15}},
          tokens: {
            '--spacing-5': '18px',
            '--spacing-6': '22px',
            '--spacing-8': '28px',
          },
        },
      },
    ],
  },
});
