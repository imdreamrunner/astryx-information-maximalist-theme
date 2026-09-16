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
 * The model is the East Asian web portal: a bounded, centred sheet of ruled
 * modules, read at arm's length on a desktop monitor, where the unit of design
 * is the text link rather than the card. Six rules define it:
 *
 * 1. **Tight type in a narrow band.** A 14px base on a 1.08 ratio. The very
 *    small ratio is the point: it keeps eleven steps inside roughly 10px, so a
 *    screen can carry eight levels of hierarchy before the largest one starts
 *    to dominate. Nothing lands below 12px, because metadata that cannot be
 *    read is not density, it is decoration.
 * 2. **Ruled, not boxed.** Structure is carried by 1px blue-grey separators and
 *    flat surfaces. Shadows are removed rather than softened, because a shadow
 *    at this density reads as noise between adjacent panels.
 * 3. **Square corners.** Radii collapse to 0–3px. Rounded corners cost
 *    horizontal room at small sizes and blur the grid the modules sit on.
 * 4. **Two surfaces, one hue.** White for content, a pale blue-grey for utility
 *    chrome — navigation rails, search wells, tab troughs. The tint is what
 *    tells a reader which parts of the page are furniture.
 * 5. **Blue is the link colour.** Saturated, accessible, and load-bearing:
 *    on a page that is mostly text links, the accent is the primary wayfinding
 *    device, so it is not spent on decoration.
 * 6. **Density follows the viewport.** Encoded as `adaptations` rather than
 *    page media queries, so any consumer inherits it.
 *
 * Deliberately NOT here: anything keyed to one page's structure. Every override
 * below addresses a theming target from `astryx theme targets`, which is what
 * makes the system portable.
 */

import {defineTheme} from '@astryxdesign/core/theme';
import {informationMaximalistIconRegistry} from './icons';

/**
 * The font stack.
 *
 * Declared as one constant because it is referenced twice: once to generate
 * `--font-family-body`, and once to *apply* that variable at the shell targets
 * (see `layout` / `app-shell` below). Astryx sets `font-family: inherit` on
 * controls — Button, Tab, Banner and the form primitives — so they take the
 * font from whatever encloses them. Nothing in Astryx's own stylesheet puts a
 * family on a shell element, so under a bare host the controls inherit from
 * `<body>` and fall through to the browser default, which on most desktops is
 * a serif. That is why these targets set a family rather than relying on the
 * token alone: a theme that ships a font stack has to make something actually
 * wear it.
 *
 * `-apple-system`/`BlinkMacSystemFont` first for the platform UI face, then
 * explicit Japanese faces before the generic fallback. CJK is named
 * deliberately: a Latin-only stack ending in `sans-serif` lets the browser pick
 * any installed CJK font per glyph, which on a dense page shows up as mixed
 * stroke weights inside a single headline. No webfont is loaded, so consumers
 * inherit no network dependency — a theme that shows this much text cannot
 * afford a flash of unstyled content on first paint.
 */
const FONT_FAMILY = '-apple-system';
const FONT_FALLBACKS =
  'BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", sans-serif';

/**
 * A saturated portal blue. It has to survive three jobs at once: a 13px text
 * link, a filled submit button, and a 2px tab underline. A desaturated accent
 * holds up at the last two and goes muddy at the first, so this one is picked
 * for the text case and checked against white — 6.1:1, comfortably past AA for
 * body text — with the button relying on white-on-accent instead. The dark
 * seed is lifted rather than inverted so it clears the near-black background.
 */
const ACCENT: [light: string, dark: string] = ['#1046BE', '#8CB8F2'];

/**
 * Hairline separators, seeded blue rather than neutral grey. On a page whose
 * structure *is* its rules, a warm or dead-neutral hairline reads as a dirty
 * edge next to a blue link; matching the hairline to the accent's hue is what
 * makes a screen full of 1px lines look drawn rather than smudged. Low enough
 * contrast to recede, high enough to survive a non-colour-managed display —
 * which is where 1px rules on white usually disappear.
 */
const HAIRLINE: [light: string, dark: string] = ['#C2CEE0', '#333B47'];
const HAIRLINE_STRONG: [light: string, dark: string] = ['#9AAECB', '#48525F'];

/**
 * Surfaces. Content sits on white and furniture sits on a pale blue-grey, so
 * the tint alone says "this is chrome" without a border or a heading. The body
 * is white too: this theme bounds and centres its shell (see `layout`), so the
 * page margin is already doing the work that a darker body colour does in a
 * full-bleed layout, and tinting both would leave the modules with nothing to
 * sit against.
 */
const SURFACE_BODY: [light: string, dark: string] = ['#FFFFFF', '#0E1116'];
const SURFACE_CARD: [light: string, dark: string] = ['#FFFFFF', '#151A21'];
const SURFACE_MUTED: [light: string, dark: string] = ['#EDF2FA', '#1A202A'];

/** The 1px rule, named once so the component overrides below read as a set. */
const RULE = 'var(--border-width) solid var(--color-border)';

export const informationMaximalistTheme = defineTheme({
  name: 'information-maximalist',

  /**
   * 14px base on a 1.08 ratio, rather than the stock 14 on ~1.2.
   *
   * The base is ordinary; the ratio is the whole idea. At 1.08 the eleven size
   * steps span roughly 10px instead of 40, which does two things a dense
   * surface needs. Headings stop out-shouting the text they label — `h2` lands
   * at 16px, a portal module header, not a page title. And the small end stays
   * legible: the two steps below body are 13px and 12px, so metadata,
   * timestamps and counts sit at a real reading size instead of the 10–11px
   * that a conventional ratio would put them at.
   *
   * Line heights come out of the same expansion at 1.38–1.43 for the text
   * sizes, which is the band this kind of page wants: tight enough to stack
   * rows, loose enough that CJK glyphs — which fill their em box far more than
   * Latin ones — do not touch across lines.
   */
  typography: {
    scale: {base: 14, ratio: 1.08},
    body: {family: FONT_FAMILY, fallbacks: FONT_FALLBACKS},
    heading: {
      // Headings carry weight instead of size, since a 1.08 ratio leaves
      // almost no size difference to work with.
      weights: {
        1: 'bold',
        2: 'bold',
        3: 'bold',
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
   * Neutrals seeded cool to match the accent and the hairlines, at high
   * contrast. High contrast is a density decision, not an accessibility
   * afterthought: with less white space separating elements, tone has to do the
   * separating.
   */
  color: {
    accent: ACCENT,
    neutralStyle: 'cool',
    contrast: 'high',
  },

  /**
   * Near-zero radii. `base: 4` keeps the stock step relationships; the 0.25
   * multiplier is what flattens them, landing element corners at 2px and inner
   * ones at 1px. The two large steps are then pinned by hand below, because the
   * multiplier leaves them at 7px — enough to visibly round a module in a grid
   * of otherwise square ones.
   */
  radius: {base: 4, multiplier: 0.25},

  /**
   * Snappy. On an information-dense surface a transition is feedback that a
   * value changed, so it has to finish before the eye moves on.
   */
  motion: {fast: 100, medium: 200, slow: 400, ratio: 0.75},

  tokens: {
    // --- Spacing: canonical at the small end, compressed at the large -------
    // Steps 1–4 are left at the stock 4/8/12/16. That run is the page's whole
    // rhythm here — module padding, row gaps, the space between a label and
    // its value — and it is already as tight as a 4px grid goes, so shaving it
    // would only break the grid. The compression starts at step 5, where the
    // stock scale begins opening section-sized gaps this theme has no use for:
    // pulling those in is what stops a dozen stacked modules from spreading
    // past a screen.
    '--spacing-5': '18px', // 20
    '--spacing-6': '20px', // 24
    '--spacing-7': '22px', // 28
    '--spacing-8': '24px', // 32
    '--spacing-9': '26px', // 36
    '--spacing-10': '28px', // 40
    '--spacing-11': '30px', // 44
    '--spacing-12': '32px', // 48

    // --- Leading: pinned into one compact band -----------------------------
    // The scale expansion derives line heights by rounding each size up to a
    // whole-pixel leading, which is right in principle and drifts in practice:
    // across a band this narrow the rounding lands body at 1.43 and supporting
    // at 1.54, so a 13px metadata row ends up *taller* than the 14px headline
    // above it. These pin every step a reader meets to 1.36–1.43, which keeps
    // the stack of rows even and still clears the descender-to-ascender gap
    // that CJK glyphs need — they fill their em box, so the usual Latin
    // allowance of 1.2 closes up entirely.
    '--text-body-leading': '1.4286', // 20px on 14
    '--text-label-leading': '1.4286', // 20px on 14
    '--text-code-leading': '1.4286', // 20px on 14
    '--text-supporting-leading': '1.3846', // 18px on 13
    '--text-large-leading': '1.4', // 21px on 15
    '--text-heading-1-leading': '1.3889', // 25px on 18
    '--text-heading-2-leading': '1.375', // 22px on 16
    '--text-heading-3-leading': '1.4', // 21px on 15
    '--text-heading-4-leading': '1.4286', // 20px on 14
    '--text-heading-5-leading': '1.3846', // 18px on 13
    '--text-heading-6-leading': '1.4167', // 17px on 12
    '--text-display-1-leading': '1.3636', // 30px on 22
    '--text-display-2-leading': '1.381', // 29px on 21
    '--text-display-3-leading': '1.3684', // 26px on 19

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
    '--color-background-popover': SURFACE_CARD,

    // Secondary text is the page's metadata colour — sources, timestamps,
    // counts — so it is lifted off the near-black primary to a blue-grey.
    // The stock high-contrast value is close enough to primary that a row of
    // metadata competes with the headline above it; this still clears AA on
    // both surfaces above at 13px.
    '--color-text-secondary': ['#4A5666', '#AFBACA'],
    '--color-icon-secondary': ['#5A6675', '#9BA7B7'],

    // --- Corners: squared -------------------------------------------------
    // `radius` handles the element/inner/container steps; these two are the
    // ones its multiplier cannot reach far enough down.
    '--radius-page': '0px',
    '--radius-chat': '4px',

    // --- Elevation: flattened --------------------------------------------
    // Set to `none` rather than to a softer shadow. A card and the panel
    // behind it are separated by a border here; adding a shadow on top of that
    // draws a second edge a few pixels away from the first, which at this
    // density reads as a rendering artifact. `high` keeps one tight shade so
    // genuinely floating surfaces — menus, popovers — still detach from a page
    // this busy, which is a function, not a decoration.
    '--shadow-low': 'none',
    '--shadow-med': 'none',
    '--shadow-high':
      '0px 1px 4px light-dark(rgba(16, 24, 40, 0.16), rgba(0, 0, 0, 0.6))',

    // --- Focus: tight ring ------------------------------------------------
    // The stock 3px offset is generous for controls sitting 8px apart; at this
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
    // -- Page shell -------------------------------------------------------
    // Both shell roots carry the font family, for the inheritance reason
    // documented on FONT_FAMILY: Astryx's controls are `font-family: inherit`,
    // so unless a shell wears the stack they fall through `<body>` to the
    // browser's default serif. Setting it here rather than asking every
    // consumer for a global rule is what makes the stack part of the theme.
    //
    // The shell is also bounded and centred. A portal is read as a sheet, not
    // as a wall: past about 1100px the eye stops being able to scan a row of
    // modules, and a full-bleed version of this layout stretches its text
    // columns instead of adding any information. Expressed as a `max-width` on
    // the shell so it holds for any composition, and as `auto` margins so the
    // sheet centres in whatever the host gives it.
    layout: {
      base: {
        fontFamily: `${FONT_FAMILY}, ${FONT_FALLBACKS}`,
        backgroundColor: 'var(--color-background-body)',
        maxWidth: '1120px',
        marginInline: 'auto',
      },
    },
    'app-shell': {
      base: {fontFamily: `${FONT_FAMILY}, ${FONT_FALLBACKS}`},
    },

    // The header and footer are separated from content by a rule rather than
    // by a shadow or a background change, which is the single most recognisable
    // move in this system.
    'layout-header': {
      base: {
        borderBottom: RULE,
        backgroundColor: 'var(--color-background-surface)',
      },
    },
    'layout-footer': {
      base: {
        borderTop: RULE,
        backgroundColor: 'var(--color-background-surface)',
      },
    },
    // A side rail reads as part of the page grid, not as a floating panel.
    'layout-panel': {
      base: {
        borderInlineEnd: RULE,
        backgroundColor: 'var(--color-background-surface)',
      },
    },
    'layout-content': {
      base: {backgroundColor: 'var(--color-background-body)'},
    },

    // -- Modules ----------------------------------------------------------
    // Cards are rectangles with a hairline, never raised. `muted` is the
    // utility surface: the pale blue-grey that marks navigation rails and
    // search wells as furniture rather than content.
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

    // Sections separate on tone alone, so that a module built from a Card can
    // hold Sections inside it without drawing a second frame 1px in.
    section: {
      'variant:muted': {backgroundColor: 'var(--color-background-muted)'},
    },

    // Separators are the primary structural device, so they are tuned rather
    // than left at stock: subtle is the default page rule, strong is reserved
    // for a real change of subject.
    divider: {
      'variant:subtle': {backgroundColor: 'var(--color-border)'},
      'variant:strong': {backgroundColor: 'var(--color-border-emphasized)'},

      // A vertical divider ships `height: 100%`, which resolves to `auto`
      // inside a row of auto height — so the rule collapses to nothing and
      // every caller has to hand it a pixel height instead. Asking to be
      // stretched to the row's cross size is what a rule *between two items*
      // wants in every case, and it is a rule about how separators behave
      // rather than about this page, so it is fixed once here.
      'orientation:vertical': {alignSelf: 'stretch', height: 'auto'},
    },

    // -- Tabs -------------------------------------------------------------
    // The utilitarian tab bar: a trough of tinted, ruled-off tabs with the
    // selected one cut out in white so it joins the panel below it. This is
    // the portal's own idiom and it earns its place at this density — a row of
    // nine sections fits in 28px of height and still says which one is open
    // twice over, by tone and by weight.
    'tab-list': {
      base: {borderBottom: RULE},
    },
    tab: {
      base: {
        borderRadius: '0px',
        fontWeight: 'var(--font-weight-medium)',
        backgroundColor: 'var(--color-background-muted)',
        // Tabs butt against each other and are told apart by a hairline, not
        // by a gap. `-1px` collapses each pair of adjacent edges into the one
        // rule a reader should see.
        borderInlineEnd: RULE,
        marginInlineEnd: '-1px',
        color: 'var(--color-text-accent)',
      },
      // Bare key, not `state:selected` — states are addressed by name.
      selected: {
        fontWeight: 'var(--font-weight-bold)',
        backgroundColor: 'var(--color-background-surface)',
        color: 'var(--color-text-primary)',
      },
    },
    'tab-indicator': {
      // A 2px underline, not a pill: it marks a column of the grid.
      base: {height: '2px', borderRadius: '0px'},
    },

    'segmented-control': {
      base: {
        borderRadius: 'var(--radius-inner)',
        border: RULE,
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
        border: RULE,
      },
    },

    // -- Text -------------------------------------------------------------
    // Links carry colour and weight, and take their underline on hover.
    //
    // This inverts the usual advice, and the density is the reason. A portal
    // module is twenty consecutive links; underlining them all turns the
    // module into a hatched block and costs the 1px rules their meaning, since
    // a reader can no longer tell a separator from a link. What keeps this
    // accessible is that the links are never mixed into running prose — they
    // are the list — so their position already marks them, and the accent is
    // reserved for them alone, which is rule 5 of the system.
    link: {
      base: {
        textDecorationLine: 'none',
        textDecorationThickness: '1px',
        textUnderlineOffset: '2px',
        ':hover': {
          textDecorationLine: 'underline',
          textDecorationColor: 'currentColor',
        },
      },
    },

    // Lists are the workhorse of a dense page; the compact density gets
    // tightened to the 4px grid and keeps its row hairlines available.
    list: {
      'density:compact': {rowGap: 'var(--spacing-1)'},
    },
    'list-item': {
      // Markers sit in the accent so a bulleted run of links reads as one
      // object rather than as black dots beside blue text.
      base: {'::marker': {color: 'var(--color-text-accent)'}},
    },

    // Supporting text is where a dense layout puts its metadata. It keeps the
    // scale's own step below body — 13px, not a further reduction — because
    // the point of the 1.08 ratio is that the small end is already small
    // enough to sit under a headline and still be read. Tabular figures
    // because columns of numbers that do not align are the most common failure
    // of this kind of page.
    text: {
      'type:supporting': {fontVariantNumeric: 'tabular-nums'},
      'type:label': {
        letterSpacing: '0.01em',
        fontVariantNumeric: 'tabular-nums',
      },
    },
    heading: {
      // No negative tracking: it is a Latin-display trick, and on CJK text —
      // where every glyph already fills its em box — it closes the gaps
      // between characters that keep a 16px header legible.
      base: {letterSpacing: '0'},
    },

    // Badges and tokens are labels, not buttons: squared off, tight, and
    // reading at the supporting size so a row of them does not out-shout the
    // text it annotates.
    badge: {
      base: {
        borderRadius: 'var(--radius-inner)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-bold)',
        letterSpacing: '0.02em',
        paddingInline: 'var(--spacing-1)',
      },
    },
    token: {
      base: {
        borderRadius: 'var(--radius-inner)',
        fontSize: 'var(--font-size-xs)',
      },
    },
  },

  icons: informationMaximalistIconRegistry,

  /**
   * Density is a function of how much room there is, so it belongs in the
   * theme rather than in each consumer's media queries.
   *
   * Below `md` the ratio opens up while the base holds: a phone is read at
   * arm's-length-minus-a-foot, so 14px body is still right, but the 1.08 band
   * that separates eight levels on a monitor collapses into one grey mass in
   * the hand. Widening the ratio there buys back the hierarchy without
   * inflating the text. Spacing opens a step for the same reason. Above `2xl`
   * type steps up rather than out: a very wide board is usually read from
   * across a room, and the bounded shell means the extra width is margin, not
   * columns, so there is nothing to spend spacing on.
   */
  adaptations: {
    rules: [
      {
        when: {width: {below: 'md'}},
        value: {
          typography: {scale: {base: 14, ratio: 1.16}},
          tokens: {
            '--spacing-5': '20px',
            '--spacing-6': '24px',
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
          typography: {scale: {base: 15, ratio: 1.09}},
        },
      },
    ],
  },
});
