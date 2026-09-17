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
 * The model is the high-density news portal: a bounded, centred sheet of ruled
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
 *    chrome — navigation rails, search wells, module headers. The tint is what
 *    tells a reader which parts of the page are furniture.
 * 5. **Blue is the link colour, red is the alarm.** The accent is the Astryx
 *    brand blue, and it is load-bearing: on a page that is mostly text links it
 *    is the primary wayfinding device, so it is not spent on decoration. Every
 *    accent-derived state — links, interactive icons, the tab row and its
 *    indicator, buttons, focus rings — comes off that one colour. Exactly one
 *    other hue is allowed — a red for the values a reader is scanning *for* —
 *    and it stays rare enough to keep meaning something.
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
 * The stack is the platform UI face and nothing else: `-apple-system` and
 * `BlinkMacSystemFont` for Apple, `Segoe UI` for Windows, `Roboto` for Android
 * and most Linux desktops, then `Helvetica Neue`/`Arial` for anything older,
 * ending in generic `sans-serif`. It names no script-specific family and makes
 * no assumption about the writing system of the text poured into it — the
 * system face is the one font already tuned for small UI sizes on the reader's
 * own platform, which is what this type scale needs at 14px. No webfont is
 * loaded, so consumers inherit no network dependency — a theme that shows this
 * much text cannot afford a flash of unstyled content on first paint.
 */
const FONT_FAMILY = '-apple-system';
const FONT_FALLBACKS =
  'BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

/**
 * The Astryx brand blue, and the whole system's accent.
 *
 * `#225BFF` is the fill of the official Astryx brand mark, so this is the one
 * colour in the theme that is given rather than chosen: the mark and the
 * interface it sits in should not be two different blues. It has to survive
 * three jobs at once — a 13px text link, a filled submit button and a 2px tab
 * underline — and it does: 5.2:1 on the white content surface and the same
 * 5.2:1 white-on-accent inside a button, both past AA for body text. That is a
 * step down from the 6.5:1 the previous, darker accent resolved to, which is
 * the cost of using the brand's own blue instead of one picked for contrast
 * alone; it is spent on the text case, and the chrome tint below is lifted to
 * pay for the one place where it did not leave enough room.
 *
 * The dark seed is a tint of the same hue (H≈225) rather than an inversion, so
 * the two schemes read as one brand: 9.4:1 on the near-black body.
 */
const ACCENT: [light: string, dark: string] = ['#225BFF', '#9CB5FF'];

/**
 * Hairline separators, seeded blue rather than neutral grey. On a page whose
 * structure *is* its rules, a warm or dead-neutral hairline reads as a dirty
 * edge next to a blue link; matching the hairline to the accent's hue is what
 * makes a screen full of 1px lines look drawn rather than smudged. Low enough
 * contrast to recede, high enough to survive a non-colour-managed display —
 * which is where 1px rules on white usually disappear.
 */
const HAIRLINE: [light: string, dark: string] = ['#ABB3C8', '#333B47'];
const HAIRLINE_STRONG: [light: string, dark: string] = ['#8795AE', '#48525F'];

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
/**
 * The light tint is set by a contrast floor, not by taste. Chrome is where this
 * theme puts accent-coloured text on something other than white — the tab row's
 * unselected tabs, the links in the search well — and the brand blue is lighter
 * than the accent it replaced, so the old `#E8ECF7` left that text at 4.43:1,
 * a hair under AA. Lifting the tint two steps takes it to 4.56:1 and costs the
 * tint almost nothing: it still reads as furniture against white (1.15:1, was
 * 1.18:1), which is the only job it has.
 */
const SURFACE_MUTED: [light: string, dark: string] = ['#ECEFF9', '#1A202A'];

/**
 * The status reds and the flag amber.
 *
 * A portal spends colour on two things only: the link, and the handful of
 * values a reader is scanning *for* — a count that has run away, a temperature,
 * a "new" flag. Both are pinned here rather than left at the stock semantic
 * palette, because the stock reds and yellows are tuned for alert banners that
 * occupy a whole row; at 12px, inside a list, they need more ink to register
 * and less area to sit in. The amber is a fill with dark text rather than the
 * usual light-text-on-saturated, which is what keeps a 12px flag legible.
 */
const STATUS_RED: [light: string, dark: string] = ['#B81E26', '#F0909A'];
const STATUS_RED_FILL: [light: string, dark: string] = ['#C2181F', '#B3141B'];
const FLAG_AMBER: [light: string, dark: string] = ['#FFAF00', '#E5A000'];
const FLAG_AMBER_TEXT: [light: string, dark: string] = ['#3D2B00', '#2B1E00'];

/** The 1px rule, named once so the component overrides below read as a set. */
const RULE = 'var(--border-width) solid var(--color-border)';

/**
 * The masthead lockup's metric: the size of a wordmark set beside a brand mark.
 *
 * A wordmark next to a logo is not a heading that happens to be large — it is
 * one object with the mark, so its type size and its line box are the mark's
 * box. 20px is the size at which this theme's masthead mark reads at a glance
 * without out-measuring the 18px section headings under it.
 *
 * Published as a theme-local custom property, not just written into the
 * override below, because the composition has to size the mark to match and
 * the two must not drift: the template reads this same variable for its
 * `<img>` (with a literal fallback, so it still lays out under a theme that has
 * no wordmark opinion). It is a fixed pixel value rather than a scale step
 * because it answers to the mark's artboard, not to the type ramp — the ramp
 * moves with the viewport, and a lockup that comes apart at 390px is not a
 * lockup.
 */
const WORDMARK_SIZE = '20px';

/**
 * The `wordmark` role on Heading's `type` axis, as a value rather than a
 * literal in one place.
 *
 * It has to be a value because it is written three times: once at the theme
 * root, and once inside each adaptation rule that moves the type scale. An
 * adaptation re-emits the whole typography block it affects — including
 * `[data-level="1"]`, at the same specificity as `[data-type="wordmark"]` and
 * after it in source order — so a role that is only declared at the root is
 * silently outranked at exactly the widths the adaptation covers, and a
 * wordmark would go back to being a heading. Restating the role inside those
 * rules puts it after the level again.
 *
 * `line-height: 1` is the point of the role: it collapses the line box onto the
 * 20px glyph box, so the wordmark's box is the brand mark's box and the two
 * centre on one another with no leading to account for. The ink is deliberately
 * *not* set here — a wordmark is not always the accent, and Heading already has
 * a semantic prop for that, so the composition passes `color="accent"` and this
 * role stays about metrics.
 */
const WORDMARK_HEADING = {
  'type:wordmark': {
    fontSize: `var(--text-wordmark-size, ${WORDMARK_SIZE})`,
    lineHeight: '1',
  },
};

/**
 * How far a focus ring reaches outside the element it marks.
 *
 * Read from the tokens that draw the ring rather than written as a pixel
 * value, so a container reserving room for a ring cannot fall behind a change
 * to the ring itself.
 */
const FOCUS_RING_REACH =
  'calc(var(--focus-outline-width) + var(--focus-outline-offset))';

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
   * rows, loose enough that two-line headlines set at 14px keep an obvious gap
   * between the descenders of one line and the caps of the next.
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
    // that a wrapped headline needs — a bare 1.2 closes that gap up entirely
    // at these sizes.
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

    // --- Colour: the accent *is* the brand blue -----------------------------
    // `color.accent` above seeds the palette — the accent's hover and pressed
    // tints, `--color-on-accent`, the neutrals' hue — from #225BFF, and that
    // seeding is what keeps every accent-derived state in the brand's hue. But
    // the seed is a seed: Astryx reads the accent itself off tone 40 of the
    // ramp it generates, which is a darker blue than the mark. Pinning the base
    // token to the brand hex is what makes the colour on the page the brand's
    // own, and it reaches everything: `--color-text-accent`,
    // `--color-icon-accent` and `--color-accent-muted` are generated as
    // `var(--color-accent)` references, and `--focus-outline-color` defaults to
    // one too, so links, interactive icons, the tab row, the selected
    // indicator, buttons and focus rings all resolve to #225BFF from this one
    // line. `--color-on-accent` is the exception — it is baked from the seed
    // because it is a contrast computation CSS cannot express — which is
    // exactly why the seed above and this pin are the same colour rather than
    // this being a pin on its own.
    '--color-accent': ACCENT,

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

    // --- Status: the two colours that are not the link --------------------
    // See STATUS_RED above. `text-red` is the scanning colour — a runaway
    // count, a high temperature — and it is the only hue on the page besides
    // the accent, which is what keeps it meaning "look here". The solid fills
    // below are the badge variants: error stays red, warning becomes the
    // portal's amber flag with dark text on it.
    '--color-text-red': STATUS_RED,
    '--color-icon-red': STATUS_RED,
    '--color-error': STATUS_RED_FILL,
    '--color-warning': FLAG_AMBER,
    '--color-on-warning': FLAG_AMBER_TEXT,

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
    // as a wall: past about 1000px the eye stops being able to scan a row of
    // modules, and a full-bleed version of this layout stretches its text
    // columns instead of adding any information. 1000 is deliberate rather
    // than round — it is the width at which three columns of this kind still
    // hold a ~460px reading column in the middle, which is the measure the
    // whole arrangement is built around. Expressed as a `max-width` on the
    // shell so it holds for any composition, and as `auto` margins so the
    // sheet centres in whatever the host gives it.
    layout: {
      base: {
        fontFamily: `${FONT_FAMILY}, ${FONT_FALLBACKS}`,
        backgroundColor: 'var(--color-background-body)',
        maxWidth: '1000px',
        marginInline: 'auto',
      },
    },
    'app-shell': {
      base: {fontFamily: `${FONT_FAMILY}, ${FONT_FALLBACKS}`},
    },

    // The footer is separated from content by a rule rather than by a shadow or
    // a background change, which is the single most recognisable move in this
    // system.
    //
    // The header deliberately does not take the matching rule. Its last row is
    // a centred run of promo links, and a hairline directly under them closes
    // the masthead a second time — the masthead already ends where the two
    // column grids begin, so the rule only draws a line under two links and
    // makes them look like a section of their own. `hasDivider` on the header
    // is left off in the template for the same reason; this target is the other
    // half of that decision, so the two cannot drift apart.
    'layout-header': {
      base: {
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
    // The utilitarian tab bar: a row of plain text sitting directly on the
    // module's own surface, divided by hairlines and closed by one rule
    // underneath. No trough, no pills, no filled selected tab.
    //
    // This is what a portal's section switcher actually is — a list of links,
    // one of which you are already on — and at this density it is also the
    // only version that fits: nine sections in 28px of height, with no chrome
    // between the tab row and the first headline under it. An unselected tab
    // is a link and wears the accent; the selected one drops the accent and
    // takes bold near-black, so the row says where you are by both colour and
    // weight rather than by a filled shape.
    'tab-list': {
      base: {
        borderBottom: RULE,
        // The tab row is furniture, not content, so it takes the same pale
        // utility surface the search well and the service rail take. It is the
        // tint that tells a reader the row switches the module below rather
        // than belonging to it — on white the row reads as the module's first
        // line of content, and the rule under it as a heading underline.
        backgroundColor: 'var(--color-background-muted)',
        // Astryx reserves a 4px gap above that rule so a hover pill never
        // touches it. This system has no pill to protect, and the gap is the
        // one thing that stops the row from reading as a ruled tab bar: the
        // tabs float 4px clear of their own underline, which at a 24px tab
        // height is a visible band of nothing between the label and the line
        // that is supposed to close it. Taken back to zero so the row sits on
        // the rule, the way the header and footer sit on theirs.
        paddingBlockEnd: '0px',
        // The tab row is the first child of a card that clips its overflow,
        // and the row's scroller bleeds its own 3px of ring room *outside* the
        // row — which puts that room outside the card too, so a focused tab
        // lost its top edge, the first tab its left edge and the last tab its
        // right edge. The row therefore reserves the ring's own reach itself,
        // read from the same tokens that draw it so the two cannot drift
        // apart, on the three sides that have something to clip against.
        //
        // Block-end is deliberately not among them: the gap above is what
        // keeps a focus ring whole, the gap below is what would stop the row
        // sitting on its rule.
        paddingBlockStart: FOCUS_RING_REACH,
        paddingInline: FOCUS_RING_REACH,
        // The reserved gap also drops the selected indicator through it, so
        // the indicator has to come back up by the same amount. `-1px` is
        // Astryx's own no-gap value: the indicator overlays the rule rather
        // than sitting above it, which is what keeps the selected column
        // marked for a reader who cannot resolve colour or weight.
        '--_tab-indicator-bottom': 'calc(-1 * var(--border-width))',
      },
    },
    tab: {
      base: {
        borderRadius: '0px',
        backgroundColor: 'transparent',
        fontWeight: 'var(--font-weight-normal)',
        color: 'var(--color-text-accent)',
        paddingInline: 'var(--spacing-3)',
        // The divider belongs *between* tabs, so it hangs off the start edge
        // and the first tab gives its own back — otherwise the row opens with
        // a stray rule floating against the module's left border.
        borderInlineStart: RULE,
        ':first-child': {borderInlineStart: 'none'},
      },
      // Bare key, not `state:selected` — states are addressed by name.
      selected: {
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--color-text-primary)',
      },
    },
    'tab-indicator': {
      // A 2px underline, not a pill: it marks a column of the grid. It is the
      // one piece of the stock tab treatment worth keeping, because weight and
      // colour alone leave the selected tab unmarked for a reader who cannot
      // resolve either.
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
      // Rows run flush to their module's content edge. Astryx insets every
      // item by 8px so a hover plate clears the text; in this system the module
      // already supplies that padding, so the inset only pushes a bulleted run
      // off the left edge every other module aligns to — and the bullet is the
      // one mark on the page that has to sit on that edge, because it is what
      // tells the eye where the column starts.
      base: {paddingInline: '0px'},
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
      // No negative tracking: it is a display-size trick, and these headings
      // are not display sizes. At 16–18px, pulling the letters together only
      // closes the gaps that keep a module header legible.
      base: {letterSpacing: '0'},

      // A custom visual role on Heading's `type` axis, so a masthead wordmark
      // is a named thing a composition asks for — `<Heading level={1}
      // type="wordmark">` — instead of a heading with its metrics overridden at
      // the call site. `level` still decides the element, so the page keeps its
      // one `<h1>`; `type` decides only how it is set. The augmentation at the
      // bottom of this file is what makes the name type-check, and the metrics
      // themselves are on `WORDMARK_HEADING`, which the adaptations restate.
      ...WORDMARK_HEADING,
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

  /**
   * Theme-local custom properties: values this theme owns and a composition
   * may read, as opposed to the Astryx tokens above, which every theme
   * defines. One entry — the wordmark metric documented on `WORDMARK_SIZE`.
   */
  localTokens: {
    '--text-wordmark-size': WORDMARK_SIZE,
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
          // Restated because this rule re-emits the heading levels; see
          // `WORDMARK_HEADING`.
          components: {heading: WORDMARK_HEADING},
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
          // As above: the wordmark's box answers to the brand mark, so it does
          // not move with the scale this rule widens.
          components: {heading: WORDMARK_HEADING},
        },
      },
    ],
  },
});

/**
 * The type side of the `wordmark` heading role above.
 *
 * Heading's `type` is an open axis: the union comes from `HeadingTypeMap`, which
 * core declares as the augmentation point, and the component reflects the value
 * to the DOM so theme CSS can style it. A custom role is therefore a promise
 * made in two places — the override above styles it, this widens the prop that
 * asks for it — and it is declared here, in the file that owns the override, so
 * neither half can be shipped without the other. `astryx theme build` emits the
 * same augmentation into its generated `.variants.d.ts`; that file is a build
 * artifact, so the source of truth is here.
 */
declare module '@astryxdesign/core/Heading' {
  interface HeadingTypeMap {
    wordmark: true;
  }
}
