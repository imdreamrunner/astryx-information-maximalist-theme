// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Information Maximalist — a portal home page that puts everything above the
 * fold, in Japanese or in English.
 *
 * The model is the high-density news portal, and the composition is what makes
 * it one: a bounded sheet, a two-row masthead over a tinted search well, then
 * three unequal columns of ruled modules — a service directory, a news module
 * under section tabs, and a rail of weather, markets and rankings. Where a
 * dashboard spends its width on a few large figures, a portal spends it on many
 * small ones, so every module is sized to its text rather than to a grid of
 * equal cards, and nothing hides behind a disclosure the eye would have to open.
 *
 * Two decisions carry most of the density:
 *
 * - **The text link is the unit of design.** Modules are lists of bulleted
 *   links with a comment count and, where something is new, a status flag.
 *   That is roughly six times as many entry points per vertical inch as a card
 *   grid, and it is why the theme reserves its accent for links alone.
 * - **Imagery is rationed to one focal image per module, at most.** Most
 *   modules have none. A portal's pictures are there to break a column of
 *   text, not to illustrate every row, and a second image inside one module
 *   immediately reads as an advertisement.
 *
 * Responsive in three steps, each one measured against the template's own
 * surface rather than the window (see {@link useSurfaceWidth}):
 *
 * - Wide (>= 960px): three columns — directory, news well, rail.
 * - Medium (880–959px): two columns. The service directory unfolds from a
 *   vertical rail into a wrapped band of links above the columns, which is the
 *   one module that reads equally well either way, so the news well and the
 *   rail both keep a usable measure.
 * - Narrow (< 880px): one wide column, modules in reading order.
 *
 * The masthead has its own, lower threshold (720px): a tablet crosses into one
 * column while still having room for the full three-across masthead, and only
 * a phone gets the stacked wordmark, the sideways-scrolling search scopes and
 * the focal image moved below its headline list.
 *
 * **The page ships two complete locales, and opens in Japanese.** Japanese is
 * the default on a first visit whatever the browser asks for; the language
 * switcher in the utility strip is the only thing that changes it, and what it
 * changes is every string on the page — copy, figures, units, dates, badges,
 * alt text, landmark names, the document title and its meta description — not
 * just the headings. The choice is remembered in `localStorage`; a reader who
 * has never chosen, or whose storage is unavailable, gets Japanese. How that is
 * built is described over {@link PortalContent}: the page holds one typed
 * content model per locale over one shared structure, so a module cannot be
 * translated in one locale and forgotten in the other without the compiler
 * saying so.
 *
 * All content is fictional and all figures are fixtures: no clocks, no
 * randomness, no fetching, so the preview and any screenshot of it are
 * byte-stable. Links are inert (`#`).
 *
 * This file is content and composition only. It declares no colours, no px
 * literals and no class names, and it does not import or mount a `Theme` — the
 * host chooses what to render it in. Everything visual it relies on (the type
 * scale, the hairlines, the tinted utility surface, the tab trough, the bounded
 * centred shell) comes from theme tokens and theming targets, which is what
 * lets the same composition be re-skinned without touching this file. The theme
 * stays locale-neutral in the same way: it carries no strings at all, and its
 * font stack covers both writing systems.
 */

import {
  createContext,
  Fragment,
  use,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type {ReactNode} from 'react';
import {AspectRatio} from '@astryxdesign/core/AspectRatio';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Center} from '@astryxdesign/core/Center';
import {Divider} from '@astryxdesign/core/Divider';
import {Grid} from '@astryxdesign/core/Grid';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {InternationalizationProvider} from '@astryxdesign/core/i18n';
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Stack';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import type {IconType} from '@astryxdesign/core/Icon';
import type {MessagesByLocale} from '@astryxdesign/core/i18n';
import japaneseAstryxCatalog from '@astryxdesign/core/locales/ja-JP.json';
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  Bars3Icon,
  BanknotesIcon,
  BellIcon,
  BookOpenIcon,
  BriefcaseIcon,
  BuildingStorefrontIcon,
  CakeIcon,
  CalendarDaysIcon,
  ChatBubbleLeftEllipsisIcon,
  CloudIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  GiftIcon,
  HomeModernIcon,
  MagnifyingGlassIcon,
  MapIcon,
  NewspaperIcon,
  PaperAirplaneIcon,
  PuzzlePieceIcon,
  SunIcon,
  TagIcon,
  TrophyIcon,
  TruckIcon,
  TvIcon,
} from '@heroicons/react/24/outline';

// =============================================================================
// Responsive thresholds
// =============================================================================

/**
 * Above this surface width the page runs three columns. 960 is where the
 * directory rail, a news well wide enough for a headline on one line, and the
 * right rail stop fitting together — below it one of the three always starves,
 * and the directory is the one that survives being folded.
 *
 * It is set low on purpose. The three-column portal is the whole arrangement,
 * so the threshold is pushed down to the narrowest width at which the middle
 * column still holds a one-line headline (see the widths below) rather than to
 * a comfortable one: a reader on a 1024 laptop should get the portal, not the
 * folded version of it.
 */
const THREE_COLUMN_SURFACE = 960;

/**
 * Above this width the news well and the rail stay side by side. 880 is set by
 * the rail, not the well: the rail is a fixed 332, so anything narrower leaves
 * the well under ~530 and its headlines start taking two lines each with the
 * comment count orphaned onto a third. One wide column of one-line headlines
 * beats two columns of wrapped ones, so below this the rail goes underneath.
 */
const TWO_COLUMN_SURFACE = 880;

/**
 * Below this width the masthead splits into rows, the search scopes scroll
 * sideways, and the news module's focal image moves under its headline list.
 *
 * Deliberately not tied to the column count: a 768 tablet reads best as one
 * *wide* column — full-width modules, side-by-side focal image, and the
 * three-across masthead it has room for — so it crosses the column threshold
 * long before it needs a phone's chrome.
 */
const NARROW_SURFACE = 720;

/**
 * Widths of the two fixed columns; the news well takes what is left.
 *
 * Sized against a ~1000px sheet: 176 is a service label plus its icon and no
 * more, 332 leaves the rail room for a two-across forecast, and the remaining
 * ~460 in the middle is the reading column the whole page is built around.
 */
const DIRECTORY_WIDTH = 176;
const RAIL_WIDTH = 332;

/**
 * The width of the box this template was given, tracked as it changes.
 *
 * Every responsive decision here is a question about that box, not about the
 * window. The two agree only when the template owns the page — rendered into
 * the docsite's preview dialog, a split editor or a catalog card, `matchMedia`
 * describes a viewport the template can't see, and a rail sized from it lands
 * on top of the content instead of beside it.
 *
 * The first read is synchronous, inside `useLayoutEffect`, so the opening
 * frame is already laid out for the real width rather than snapping to it
 * after paint. Both reads are `offsetWidth`-based: `getBoundingClientRect`
 * reports the box as *painted*, so an ancestor `transform: scale()` is baked
 * into it, while a `ResizeObserver` reports the box as *laid out* and ignores
 * that transform. Mixing the two halves the answer inside any scaled preview.
 */
function useSurfaceWidth() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const {paddingInlineStart, paddingInlineEnd} = getComputedStyle(node);
    setWidth(
      node.offsetWidth -
        parseFloat(paddingInlineStart) -
        parseFloat(paddingInlineEnd),
    );

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

// =============================================================================
// Locale
// =============================================================================

/**
 * The locales this page is written in. Both are complete; neither is a partial
 * translation of the other.
 */
type PortalLocale = 'ja' | 'en';

/**
 * The locale a reader who has never chosen gets, whatever the browser asks
 * for.
 *
 * Japanese, not the navigator's language. The portal is a Japanese publication
 * whose English edition is a translation of it, and a publication's default
 * edition is a fact about the publication — negotiating it against
 * `navigator.languages` would hand two readers in the same room two different
 * front pages and make the first paint unpredictable. The switcher is one
 * click away and the choice is remembered, which is the part a reader actually
 * needs.
 */
const DEFAULT_LOCALE: PortalLocale = 'ja';

/**
 * Where an explicit choice is remembered.
 *
 * Namespaced by package so the key cannot collide with a host application's
 * own locale state, and stable so an existing choice survives every later
 * version of this template.
 */
const LOCALE_STORAGE_KEY = 'astryx-information-maximalist.locale';

/** Narrows a stored or event-supplied string to a locale this page has. */
function isPortalLocale(value: string): value is PortalLocale {
  return value === 'ja' || value === 'en';
}

/**
 * The switcher's two choices.
 *
 * Both labels are endonyms — each language named in its own language — so they
 * are the same in either locale and belong to the structure rather than to
 * either content model. That is also the accessible choice: a reader who has
 * landed on the wrong edition cannot be expected to recognise the name of
 * their own language written in a script they do not read.
 */
const LOCALE_OPTIONS: readonly {id: PortalLocale; label: string}[] = [
  {id: 'ja', label: '日本語'},
  {id: 'en', label: 'English'},
];

/**
 * Astryx's own Japanese catalog, for the strings this file never writes.
 *
 * A handful of accessible names on the page come from inside Astryx rather
 * than from the content model — the clear button in the search field, the tab
 * strip's overflow affordances, the scroll region around the narrow scope run.
 * Left alone they stay English under a Japanese page, which is exactly the
 * mixed-locale leak the switcher is supposed to prevent, so the page mounts
 * `InternationalizationProvider` with the catalog Astryx ships for `ja`.
 *
 * Mounting this provider is not the same as mounting a `Theme`: it carries no
 * visual opinion, it is scoped to this subtree, and a host that renders the
 * template inside its own provider simply overrides it. English needs no entry
 * — Astryx's `en` catalog is bundled and is the final fallback for every key.
 */
const ASTRYX_MESSAGES: MessagesByLocale = {ja: japaneseAstryxCatalog};

/**
 * Reads the remembered choice, falling back to the default.
 *
 * Wrapped because `localStorage` is not merely empty in a hostile environment,
 * it throws: Safari's private mode, a blocked third-party frame and a browser
 * with site data disabled all raise on access rather than returning `null`. A
 * front page must not fail to render over a storage preference, so anything
 * unreadable, unparseable or unrecognised resolves to the Japanese default —
 * the same state as a first visit.
 */
function readStoredLocale(): PortalLocale {
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored !== null && isPortalLocale(stored)) {
      return stored;
    }
  } catch {
    // Storage is unavailable. The default is the answer.
  }
  return DEFAULT_LOCALE;
}

/** Remembers an explicit choice, and stays silent if it cannot. */
function storeLocale(locale: PortalLocale): void {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Storage is unavailable. The selection still applies to this visit.
  }
}

// =============================================================================
// Fixtures: the locale-independent half
//
// Astryx — アストリクス in Japanese — is an invented portal for an invented port
// city: 潮見 in the Japanese edition, Harborview in the English one. Every
// name, headline, figure, source and date in either locale is fictional.
//
// This block holds what does not translate: the stable id each module and row
// is keyed by, the icon or image it draws, and the figures whose written form
// is the same either way. The translated half is `PORTAL_CONTENT`, keyed by
// these same ids, so neither half can gain or lose an entry on its own.
// =============================================================================

/**
 * A readonly tuple of exactly `N` elements.
 *
 * Every counted run below is declared as one, and that is the whole parity
 * mechanism: `Record<Id, …>` makes a missing translation a compile error where
 * a run is keyed, and `Run<T, N>` makes a missing *row* a compile error where
 * it is ordered. Between them, a locale cannot ship seven headlines where the
 * other ships eight, and no runtime check is needed to find out.
 */
type Run<
  T,
  N extends number,
  Acc extends readonly T[] = [],
> = Acc['length'] extends N ? Acc : Run<T, N, readonly [...Acc, T]>;

/**
 * The status flag `NEW`, which is the same mark in both locales.
 *
 * Kept out of the content model deliberately. It is a two-letter status
 * convention a Japanese portal prints in Latin exactly as an English one does
 * — the way `REIT` and `IT` are printed untranslated a few modules down — so
 * localising it would mean inventing a Japanese form no portal uses. `速報`
 * and "BREAKING", the other flag, genuinely differ and are in the model.
 */
const NEW_FLAG = 'NEW';

/** The masthead's icon shortcuts, three to a side of the wordmark. */
type ShortcutId =
  | 'shopping'
  | 'auctions'
  | 'marketplace'
  | 'travel'
  | 'cards'
  | 'mail';

interface ShortcutTile<Id extends string> {
  id: Id;
  icon: IconType;
}

const MASTHEAD_START: Run<ShortcutTile<ShortcutId>, 3> = [
  {id: 'shopping', icon: BuildingStorefrontIcon},
  {id: 'auctions', icon: TagIcon},
  {id: 'marketplace', icon: GiftIcon},
];

const MASTHEAD_END: Run<ShortcutTile<ShortcutId>, 3> = [
  {id: 'travel', icon: PaperAirplaneIcon},
  {id: 'cards', icon: CreditCardIcon},
  {id: 'mail', icon: EnvelopeIcon},
];

/** The service directory rail — a portal's whole surface area, spelled out. */
type ServiceId =
  | 'shopping'
  | 'auctions'
  | 'marketplace'
  | 'travel'
  | 'dining'
  | 'localGiving'
  | 'delivery'
  | 'news'
  | 'weather'
  | 'sports'
  | 'finance'
  | 'tvGuide'
  | 'answers'
  | 'maps'
  | 'jobs'
  | 'games'
  | 'ebooks'
  | 'calendar';

const SERVICE_DIRECTORY: Run<ShortcutTile<ServiceId>, 18> = [
  {id: 'shopping', icon: BuildingStorefrontIcon},
  {id: 'auctions', icon: TagIcon},
  {id: 'marketplace', icon: GiftIcon},
  {id: 'travel', icon: PaperAirplaneIcon},
  {id: 'dining', icon: CakeIcon},
  {id: 'localGiving', icon: HomeModernIcon},
  {id: 'delivery', icon: TruckIcon},
  {id: 'news', icon: NewspaperIcon},
  {id: 'weather', icon: CloudIcon},
  {id: 'sports', icon: TrophyIcon},
  {id: 'finance', icon: BanknotesIcon},
  {id: 'tvGuide', icon: TvIcon},
  {id: 'answers', icon: ChatBubbleLeftEllipsisIcon},
  {id: 'maps', icon: MapIcon},
  {id: 'jobs', icon: BriefcaseIcon},
  {id: 'games', icon: PuzzlePieceIcon},
  {id: 'ebooks', icon: BookOpenIcon},
  {id: 'calendar', icon: CalendarDaysIcon},
];

/** The sign-in module's three shortcuts. */
type SignInShortcutId = 'mail' | 'dailyDraw' | 'balance';

const SIGNIN_SHORTCUTS: Run<ShortcutTile<SignInShortcutId>, 3> = [
  {id: 'mail', icon: EnvelopeIcon},
  {id: 'dailyDraw', icon: GiftIcon},
  {id: 'balance', icon: CreditCardIcon},
];

/**
 * The news module's sections. The ids are the tab values and the feed keys, and
 * they are English words used as identifiers rather than as copy — which is
 * what lets the selected section survive a switch of locale untouched.
 */
type TopicId =
  | 'main'
  | 'domestic'
  | 'world'
  | 'economy'
  | 'tech'
  | 'sports'
  | 'life'
  | 'local';

const TOPIC_ORDER: Run<TopicId, 8> = [
  'main',
  'domestic',
  'world',
  'economy',
  'tech',
  'sports',
  'life',
  'local',
];

interface HeadlineFacts {
  /** Comment count. Rendered as an alert chip once it runs into four figures. */
  comments: number;
  /** Optional status flag. */
  flag?: 'new' | 'breaking';
}

/** What a feed's rows carry besides their headline, in reading order. */
const NEWS_HEADLINES: Record<TopicId, Run<HeadlineFacts, 8>> = {
  main: [
    {comments: 238, flag: 'new'},
    {comments: 176},
    {comments: 87},
    {comments: 41, flag: 'new'},
    {comments: 512},
    {comments: 1240},
    {comments: 63, flag: 'new'},
    {comments: 95},
  ],
  domestic: [
    {comments: 148, flag: 'new'},
    {comments: 96},
    {comments: 58},
    {comments: 33},
    {comments: 271},
    {comments: 149},
    {comments: 24},
    {comments: 37},
  ],
  world: [
    {comments: 204, flag: 'breaking'},
    {comments: 77},
    {comments: 61},
    {comments: 45},
    {comments: 302},
    {comments: 58},
    {comments: 38},
    {comments: 112},
  ],
  economy: [
    {comments: 186, flag: 'new'},
    {comments: 54},
    {comments: 89},
    {comments: 27},
    {comments: 163},
    {comments: 341},
    {comments: 205},
    {comments: 118},
  ],
  tech: [
    {comments: 141, flag: 'new'},
    {comments: 71},
    {comments: 46},
    {comments: 258},
    {comments: 134},
    {comments: 63},
    {comments: 19},
    {comments: 88},
  ],
  sports: [
    {comments: 486, flag: 'breaking'},
    {comments: 1240},
    {comments: 92},
    {comments: 57},
    {comments: 613},
    {comments: 88},
    {comments: 44},
    {comments: 76},
  ],
  life: [
    {comments: 64, flag: 'new'},
    {comments: 36},
    {comments: 74},
    {comments: 51},
    {comments: 118},
    {comments: 82},
    {comments: 29},
    {comments: 47},
  ],
  local: [
    {comments: 31, flag: 'new'},
    {comments: 58},
    {comments: 44},
    {comments: 12},
    {comments: 67},
    {comments: 23},
    {comments: 19},
    {comments: 26},
  ],
};

/** Each feed's one focal image. The picture is the same in both editions. */
const NEWS_FOCAL_IMAGES: Record<TopicId, string> = {
  main: '/template-assets/moody-working-horizontal-1.png',
  domestic: '/template-assets/light-home-horizontal-1.png',
  world: '/template-assets/moody-scene-horizontal-2.png',
  economy: '/template-assets/light-working-horizontal-2.png',
  tech: '/template-assets/colorful-working-horizontal-2.png',
  sports: '/template-assets/colorful-lifestyle-horizontal-1.png',
  life: '/template-assets/matcha-product-3.png',
  local: '/template-assets/building.png',
};

const FEATURE_LEAD_IMAGE = '/template-assets/light-lifestyle-horizontal-1.png';

/** Answers: how many answers a thread has, and whether it still takes them. */
const QA_FACTS: Run<{answers: number; isOpen: boolean}, 6> = [
  {answers: 14, isOpen: true},
  {answers: 9, isOpen: true},
  {answers: 23, isOpen: false},
  {answers: 6, isOpen: true},
  {answers: 41, isOpen: false},
  {answers: 3, isOpen: true},
];

/** The two forecast columns. Which glyph a day draws is the same either way. */
type DayId = 'today' | 'tomorrow';

interface ForecastDay {
  id: DayId;
  icon: IconType;
}

const FORECAST: Run<ForecastDay, 2> = [
  {id: 'today', icon: CloudIcon},
  {id: 'tomorrow', icon: SunIcon},
];

/**
 * The quote rows.
 *
 * The direction and the day change are locale-independent: a signed percentage
 * to two places is written the same way in both editions, so only the
 * instrument's name and its level — which carries a currency symbol in the
 * English edition and none in the Japanese one — are translated.
 */
type MarketId = 'composite' | 'broad500' | 'tech100' | 'reit' | 'gold' | 'crude';

interface MarketFacts {
  id: MarketId;
  change: string;
  isUp: boolean;
}

const MARKETS: Run<MarketFacts, 6> = [
  {id: 'composite', change: '+0.84%', isUp: true},
  {id: 'broad500', change: '+0.31%', isUp: true},
  {id: 'tech100', change: '−0.62%', isUp: false},
  {id: 'reit', change: '+0.11%', isUp: true},
  {id: 'gold', change: '−0.25%', isUp: false},
  {id: 'crude', change: '+1.42%', isUp: true},
];

/** The ranking module's three boards, and the tab values that select them. */
type BoardId = 'read' | 'shared' | 'discussed';

const BOARD_ORDER: Run<BoardId, 3> = ['read', 'shared', 'discussed'];

const RAIL_FEATURE_IMAGE = '/template-assets/light-home-square-1.png';

// =============================================================================
// Fixtures: the translated half
// =============================================================================

/** One news feed, as written. */
interface NewsFeedCopy {
  /** Stamp above the list, in whichever form the edition writes a time. */
  updated: string;
  headlines: Run<string, 8>;
  focal: {caption: string; stamp: string; source: string; alt: string};
}

/** One forecast column, as written, in the edition's own units. */
interface DayForecastCopy {
  /**
   * The day this column is for.
   *
   * Bare "Today"/"Tomorrow" rather than "Today's weather": the module header
   * already says both the date and the district, so repeating "weather" in each
   * column head spends the comparison's narrowest measure restating what the
   * frame states once.
   */
  label: string;
  summary: string;
  high: string;
  low: string;
  rain: string;
}

/**
 * Everything on the page that is written in a language.
 *
 * The shape is the parity contract. Every keyed run is a `Record` over an id
 * union from the structure block above, and every ordered run is a `Run<T, N>`
 * of the count that block fixes, so `PORTAL_CONTENT` cannot hold a locale that
 * is missing a service, a headline, a quote row or a ranking — the two editions
 * are the same object twice, filled in twice, and TypeScript is what checks
 * that they are.
 *
 * Nothing structural lives here: no icons, no image paths, no ids, no booleans
 * that drive behaviour. That division is what keeps a translation from being
 * able to change the page, and what lets the selected news section and ranking
 * board be carried straight across a switch — the state is an id, and ids are
 * not translated.
 *
 * The counted phrases are functions rather than templates with a placeholder,
 * because a count is not a substitution in either language: Japanese needs its
 * counter word in place (`コメント312件`) and English needs the figure first
 * (`312 comments`), and a function is the only form that lets each edition
 * write its own sentence.
 */
interface PortalContent {
  /**
   * What the page writes to the document itself.
   *
   * A page template that owns an `<h1>` and the three landmarks owns the
   * document's language and name too: a reader whose screen reader announces
   * the tab, and a browser choosing which font to fall back to for the text
   * below, both read these rather than anything in the body. `lang` is also the
   * tag Astryx's own catalog is resolved against.
   */
  document: {lang: string; title: string; description: string};
  /** The masthead wordmark, which is the site's name in the edition's script. */
  identity: string;
  /** The three landmark names, which is how a reader jumps between them. */
  landmarks: {header: string; content: string; footer: string};
  /** The language switcher's group label. Its options are endonyms. */
  languageSwitcher: {label: string};
  utility: {teaser: string; links: Run<string, 4>};
  /** The masthead's shortcut labels, by side. */
  masthead: {shortcuts: Record<ShortcutId, string>};
  search: {
    scopesLabel: string;
    scopes: Run<string, 7>;
    fieldLabel: string;
    placeholder: string;
    submit: string;
  };
  account: {mail: string; notifications: string; menu: string};
  promos: Run<string, 2>;
  services: {heading: string; labels: Record<ServiceId, string>};
  news: {
    sectionsLabel: string;
    tabs: Record<TopicId, string>;
    feeds: Record<TopicId, NewsFeedCopy>;
    breakingFlag: string;
    commentCount: (count: number) => string;
    more: string;
    all: string;
  };
  features: {
    title: string;
    more: string;
    lead: {title: string; body: string; meta: string; alt: string};
    links: Run<{title: string; meta: string}, 5>;
  };
  notices: {title: string; more: string; items: Run<string, 8>};
  questions: {
    title: string;
    more: string;
    openFlag: string;
    answerCount: (count: number) => string;
    items: Run<string, 6>;
    ask: string;
    awaiting: string;
  };
  keywords: {
    title: string;
    more: string;
    items: Run<string, 12>;
    footnote: string;
  };
  events: {
    title: string;
    all: string;
    items: Run<{date: string; title: string; place: string}, 3>;
  };
  signIn: {title: string; signUp: string; accountInfo: string};
  signInShortcuts: Record<SignInShortcutId, string>;
  weather: {
    title: string;
    location: string;
    days: Record<DayId, DayForecastCopy>;
    rain: (chance: string) => string;
    heatIndex: string;
    heatIndexLevel: string;
    radar: string;
  };
  markets: {
    title: string;
    more: string;
    up: string;
    down: string;
    rows: Record<MarketId, {name: string; value: string}>;
    footnote: string;
  };
  rankings: {
    title: string;
    all: string;
    boardsLabel: string;
    tabs: Record<BoardId, string>;
    boards: Record<BoardId, Run<{title: string; metric: string}, 6>>;
    footnote: string;
  };
  railFeature: {title: string; body: string; cta: string; alt: string};
  footer: {links: Run<string, 10>; copyright: string; location: string};
}

/**
 * The Japanese edition — the portal as originally written, and the default.
 *
 * Japanese conventions throughout, and not only in the prose: `℃` rather than
 * `°F`, `月/日(曜)` dates with a 24-hour clock, index levels without a currency
 * symbol, 万 for ten thousand in the ranking figures, and counter words on the
 * comment and answer counts.
 */
const JAPANESE_CONTENT: PortalContent = {
  document: {
    lang: 'ja',
    title: 'アストリクス — Astryx テンプレートのデモ',
    description:
      'Astryx の Information Maximalist ページテンプレートのデモです。検索マストヘッド、サービス一覧、分野別ニュース、天気、マーケット、アクセスランキングを一画面にならべた高密度ポータルの構成例（架空の内容）。',
  },
  identity: 'アストリクス',
  landmarks: {
    header: 'アストリクス ヘッダー',
    content: 'アストリクス ホーム',
    footer: 'アストリクス フッター',
  },
  languageSwitcher: {label: '表示言語'},
  utility: {
    teaser: '駅の待合室に本棚が増えている理由',
    links: ['ホームに設定', 'こども向け', 'アプリ', 'ヘルプ'],
  },
  masthead: {
    shortcuts: {
      shopping: 'ショッピング',
      auctions: 'オークション',
      marketplace: 'フリマ',
      travel: 'トラベル',
      cards: 'カード',
      mail: 'メール',
    },
  },
  search: {
    scopesLabel: '検索の種類',
    scopes: ['ウェブ', '画像', '動画', '地図', 'ニュース', '辞典', '一覧'],
    fieldLabel: 'キーワードで検索',
    placeholder: 'キーワードを入力',
    submit: '検索',
  },
  account: {
    mail: 'メール 未読3件',
    notifications: 'お知らせ 未読5件',
    menu: 'メニューとアカウント',
  },
  promos: ['秋の交通ダイヤ改正まとめ', 'メール障害のお知らせと復旧状況'],
  services: {
    heading: 'サービス一覧',
    labels: {
      shopping: 'ショッピング',
      auctions: 'オークション',
      marketplace: 'フリマ',
      travel: 'トラベル',
      dining: 'グルメ',
      localGiving: 'ふるさと納税',
      delivery: '宅配',
      news: 'ニュース',
      weather: '天気・災害',
      sports: 'スポーツ',
      finance: 'ファイナンス',
      tvGuide: '番組表',
      answers: 'みんなの質問',
      maps: '地図',
      jobs: '求人',
      games: 'ゲーム',
      ebooks: '電子書籍',
      calendar: 'カレンダー',
    },
  },
  news: {
    sectionsLabel: 'ニュースの分野',
    tabs: {
      main: '主要',
      domestic: '国内',
      world: '国際',
      economy: '経済',
      tech: 'IT・科学',
      sports: 'スポーツ',
      life: '暮らし',
      local: '地域',
    },
    feeds: {
      main: {
        updated: '9/17(木) 6:30更新',
        headlines: [
          '深夜バス14便を増発 通勤実態調査うけ',
          '野菜の値下がり3カ月連続 供給が回復',
          '海水冷却で消費電力31%減 実証実験おわる',
          '高架橋の補修が完了 予定より9週間早く',
          '木曜夕方から内陸で大雨のおそれ 気象台',
          '秋季代表23人を発表 初選出は2人',
          '空き家改修の助成 申請受付をきょう開始',
          '宅配の時間帯的中率 公表を各社に要請',
        ],
        focal: {
          caption: '夜間の整備ヤードで',
          stamp: '9/16(水) 18:20',
          source: 'みなと通信',
          alt: '夜間の鉄道ホームで保線作業にあたる作業員',
        },
      },
      domestic: {
        updated: '9/17(木) 6:24更新',
        headlines: [
          '空き家改修の助成 3000世帯を上限に受付',
          '学校給食の無償化 4月から2地区に拡大',
          '深夜バス88系統が本格運行へ 9カ月の試行おわる',
          'インフルエンザ予防接種 65歳以上の予約開始',
          '市民マラソンの抽選 14万2000人が応募',
          '沿岸風力の環境審査が終了 着工は来春',
          '図書館の延滞料 児童書で廃止へ',
          '県営住宅の家賃減免 申請書類を簡素化',
        ],
        focal: {
          caption: '静かな住宅地の一角',
          stamp: '9/16(水) 15:40',
          source: '潮見タイムズ',
          alt: '低層の住宅がならぶ静かな通り',
        },
      },
      world: {
        updated: '9/17(木) 6:18更新',
        headlines: [
          '港湾ストが終結 人員確保の保証で合意',
          'コンテナ滞留 11日で解消の見通し',
          '越境鉄道が有料運行1カ月 利用は想定の8割',
          '東部流域の干ばつ警戒度を1段引き下げ',
          '中央銀行が金利を据え置き 成長見通しは下方修正',
          '小麦の輸出見通し 2期連続で上方修正',
          '2都市が広場の暑さ対策で共同計画に署名',
          '海底ケーブルの修復完了 予定より1週間早く',
        ],
        focal: {
          caption: '稼働がもどった埠頭',
          stamp: '9/16(水) 20:05',
          source: '北町ポスト',
          alt: '稼働する港のコンテナクレーン',
        },
      },
      economy: {
        updated: '9/17(木) 6:12更新',
        headlines: [
          '食品チェーンが加盟店210店を買収 二重価格を解消',
          '宅配大手が黒字転換 3年ぶり',
          '地銀が12支店を再開 2年前の閉鎖分',
          '潮見便に2便目を増設 航空会社が発表',
          '半導体後工程に600億円 内陸2工場目',
          '小売の最低賃金4.1%上げ 業種協定で妥結',
          '電気料金の還付 冬の請求期間まで延長',
          '長期金利が小幅上昇 3カ月ごとの調整観測で',
        ],
        focal: {
          caption: '棚の補充がすすむ売り場',
          stamp: '9/16(水) 17:10',
          source: '台帳経済',
          alt: 'スーパーマーケットの棚を補充する従業員',
        },
      },
      tech: {
        updated: '9/17(木) 6:06更新',
        headlines: [
          '海水冷却でデータホールの電力31%減 実証で',
          '交通アプリがオフライン時刻表に対応',
          '公開気象データに沿岸40年分を追加',
          '端末メーカーが7年間の更新提供を約束',
          '遅延予測モデルを公開 鉄道事業者',
          'ストレージ価格 4期連続で下落',
          '2大学がキャンパス網の試験環境を共用',
          '観測衛星の小型化 打ち上げ費用は3割減',
        ],
        focal: {
          caption: '冷却配管の点検',
          stamp: '9/16(水) 16:45',
          source: '北町ポスト',
          alt: 'サーバー室で冷却配管を点検する技術者',
        },
      },
      sports: {
        updated: '9/17(木) 6:00更新',
        headlines: [
          '潮見が2-1で逃げきる アウェー4連勝',
          '秋季代表23人 ベテラン2人が落選',
          '200m自由形で0.34秒短縮 記録更新',
          'マラソン経路を変更 高架橋工事を回避',
          '来季から26チーム制を承認 リーグ理事会',
          '山岳ステージで41kmの独走 単独首位',
          'センターと2年契約 バスケ潮見',
          '女子駅伝の区間編成を見直し 全6区に',
        ],
        focal: {
          caption: 'スタンドの歓声',
          stamp: '9/16(水) 21:30',
          source: 'サイドライン',
          alt: 'スタジアムのスタンドで歓声をあげるサポーター',
        },
      },
      life: {
        updated: '9/17(木) 5:54更新',
        headlines: [
          '9リットルの備蓄棚 ひとり分を無駄なく',
          '難しい一角は最後に植える 庭づくりの順番',
          '1日乗車券で行ける小さな山歩き5選',
          '時間指定をやめた美術館で起きたこと',
          '交代勤務の睡眠 平易な手引きを公開',
          '年間1900個のやかんを直した修理喫茶',
          '長い通勤のための読書リスト 運転士が選ぶ',
          '2平方メートルの台所 収納の考え方',
        ],
        focal: {
          caption: '台所の作業台で',
          stamp: '9/16(水) 14:00',
          source: 'みなと生活',
          alt: '木の作業台にならべられた保存食材',
        },
      },
      local: {
        updated: '9/17(木) 5:48更新',
        headlines: [
          '潮見区で給水管の切替工事 22日未明',
          '北町の踏切を立体交差化 説明会は28日',
          '市民ホールの改修 来年3月まで休館',
          '海岸清掃の参加者を募集 定員300人',
          '区役所の窓口 土曜開庁を月2回に',
          '古紙回収の日程 10月から第2・第4火曜へ',
          '公園の遊具を入れ替え 5カ所で順次',
          '防災無線の試験放送 19日正午',
        ],
        focal: {
          caption: '区役所前の歩道',
          stamp: '9/16(水) 13:15',
          source: '潮見タイムズ',
          alt: '外壁に設備がならぶ集合住宅',
        },
      },
    },
    breakingFlag: '速報',
    commentCount: count => `コメント${count}件`,
    more: 'もっと見る',
    all: 'ニュース一覧',
  },
  features: {
    title: '特集・コラム',
    more: '特集一覧',
    lead: {
      title: 'パン屋で終わる散歩道、六つ',
      body: '坂と水路をたどって、最後に焼きたてに行きあたる道を選びました。いずれも駅から歩いて始められます。',
      meta: '週末 · 読了8分',
      alt: '街角のパン屋の前で休む自転車',
    },
    links: [
      {title: '新しい冷房規則は借主に何をもたらすか', meta: '解説 · 読了5分'},
      {title: '2平方メートルのために設計された台所', meta: '住まい · 読了6分'},
      {title: '列車を動かしつづける夜勤の現場', meta: '写真 · 読了12分'},
      {title: '値段の話をやめた商店街はどうなったか', meta: '経済 · 読了9分'},
      {title: '古い高架下をどう使うか、五つの答え', meta: '都市 · 読了7分'},
    ],
  },
  notices: {
    title: '地域のお知らせ',
    more: '潮見区の一覧',
    items: [
      '粗大ごみの申込みが電話からWEBに',
      '住民票のコンビニ交付 手数料を改定',
      '区民プールの改修工事は10月20日から',
      '巡回図書館の停車地を2カ所追加',
      '保育所の入所申請 受付は11月4日まで',
      '検診バスの日程を区の広報に掲載',
      '駐輪場の定期利用 抽選結果は25日',
      '街路樹の剪定 12月まで順次実施',
    ],
  },
  questions: {
    title: 'みんなの質問',
    more: '質問一覧',
    openFlag: '受付中',
    answerCount: count => `回答${count}`,
    items: [
      '深夜バスの定期券は増発分にも使えますか',
      '空き家助成、名義が親のままでも申請できる？',
      '高架橋の補修後、騒音は本当に減りましたか',
      '区民プール休館中に使える近隣の施設は',
      '宅配の時間帯指定、実際どのくらい当たる？',
      '粗大ごみのWEB申込み、受付番号はどこに届く',
    ],
    ask: '質問してみる',
    awaiting: '回答を待っている質問',
  },
  keywords: {
    title: '話題のキーワード',
    more: '検索ランキング',
    items: [
      '深夜バス 88系統',
      '空き家改修 助成',
      '秋季代表 23人',
      '大雨 時間帯',
      '海水冷却 実証',
      '高架橋 補修完了',
      '野菜 価格',
      '宅配 的中率',
      '市民マラソン 抽選',
      '給水管 切替',
      '最低賃金 小売',
      '港湾スト 合意',
    ],
    footnote: '9/17(木) 6:30時点の検索数にもとづきます',
  },
  events: {
    title: '今週のイベント',
    all: 'イベント一覧',
    items: [
      {date: '9/19(土)', title: '潮見港あさ市', place: '第3埠頭'},
      {date: '9/20(日)', title: '北町たそがれ演奏会', place: '市民ホール前'},
      {date: '9/23(水)', title: '古本と珈琲の日', place: '高架下商店街'},
    ],
  },
  signIn: {title: 'ログイン', signUp: '［新規登録］', accountInfo: '登録情報'},
  signInShortcuts: {
    mail: 'メール',
    dailyDraw: '毎日のくじ',
    balance: '残高を確認',
  },
  weather: {
    title: '2026年9月17日(木)',
    location: '潮見区 ▾',
    days: {
      today: {
        label: '今日',
        summary: 'くもり 一時雨',
        high: '24℃',
        low: '19℃',
        rain: '60%',
      },
      tomorrow: {
        label: '明日',
        summary: 'くもり のち晴れ',
        high: '23℃',
        low: '19℃',
        rain: '50%',
      },
    },
    rain: chance => `降水 ${chance}`,
    heatIndex: '熱中症指数',
    heatIndexLevel: '注意',
    radar: '雨雲レーダー',
  },
  markets: {
    title: 'マーケット',
    more: 'ファイナンス',
    up: '上昇',
    down: '下落',
    rows: {
      composite: {name: '潮見総合225', value: '38,942.16'},
      broad500: {name: '広域500', value: '2,714.08'},
      tech100: {name: 'テック100', value: '17,308.55'},
      reit: {name: 'みなとREIT', value: '1,986.20'},
      gold: {name: '金 現物', value: '2,388.40'},
      crude: {name: '原油', value: '79.18'},
    },
    footnote: '6:30現在 · 20分遅れの値です',
  },
  rankings: {
    title: 'アクセスランキング',
    all: '一覧',
    boardsLabel: 'ランキングの種類',
    tabs: {read: '読まれた', shared: '共有', discussed: 'コメント'},
    boards: {
      read: [
        {title: '深夜バス増発、対象は六路線', metric: '8.4万'},
        {title: '野菜はなぜ3カ月下がったのか', metric: '6.1万'},
        {title: '空き家助成、対象と時期の全容', metric: '5.5万'},
        {title: '代表23人、驚きの2人はだれか', metric: '4.8万'},
        {title: '大雨の時間帯、1時間ごとに', metric: '3.9万'},
        {title: '9週間早まった補修の裏側', metric: '3.1万'},
      ],
      shared: [
        {title: '2平方メートルの台所', metric: '1.2万'},
        {title: '年間1900個を直した修理喫茶', metric: '9800'},
        {title: 'パン屋で終わる散歩道、六つ', metric: '8100'},
        {title: '列車を動かしつづける夜勤', metric: '7600'},
        {title: '児童書の延滞料を廃止', metric: '6200'},
        {title: '時間指定をやめた美術館', metric: '4900'},
      ],
      discussed: [
        {title: '来季から26チーム制を承認', metric: '613'},
        {title: '小売の最低賃金4.1%上げ', metric: '341'},
        {title: '金利据え置き、見通しは下方修正', metric: '302'},
        {title: 'マラソン抽選の倍率を読む', metric: '271'},
        {title: '7年間の更新提供という約束', metric: '258'},
        {title: '野菜価格と供給回復のいま', metric: '214'},
      ],
    },
    footnote: '直近24時間の集計です',
  },
  railFeature: {
    title: '潮見の宿 秋の連泊プラン',
    body: '海沿いの14軒を、連泊の料金と送迎の有無でくらべられるようにしました。',
    cta: 'プランを見る',
    alt: '海に面した宿の客室からの眺め',
  },
  footer: {
    links: [
      '会社情報',
      '広告掲載',
      '掲載社一覧',
      '編集方針',
      '訂正とお詫び',
      'アクセシビリティ',
      'プライバシー',
      '利用規約',
      'ヘルプ',
      'お問い合わせ',
    ],
    copyright: '© 2026 アストリクス · 記事は128の提携社から配信されています',
    location: '地域: 潮見区',
  },
};

/**
 * The English edition — the same portal, published for Harborview.
 *
 * A localisation rather than a gloss: US conventions all the way down, so `°F`
 * rather than `℃`, `Day M/D` dates on a 12-hour clock, dollar levels on the
 * commodity rows, thousands-abbreviated ranking figures, and measurements
 * converted rather than transliterated — the Japanese `2平方メートル` kitchen
 * is 22 square feet here, not two square metres.
 */
const ENGLISH_CONTENT: PortalContent = {
  document: {
    lang: 'en',
    title: 'Astryx — Information Maximalist template demo',
    description:
      'A demo of the Astryx Information Maximalist page template: a high-density portal home that puts a search masthead, a service directory, sectioned news, weather, markets and rankings on one screen. All content is fictional.',
  },
  identity: 'Astryx',
  landmarks: {
    header: 'Astryx header',
    content: 'Astryx home',
    footer: 'Astryx footer',
  },
  languageSwitcher: {label: 'Display language'},
  utility: {
    teaser: 'Why station waiting rooms are filling up with bookshelves',
    links: ['Set as homepage', 'Kids', 'Apps', 'Help'],
  },
  masthead: {
    shortcuts: {
      shopping: 'Shopping',
      auctions: 'Auctions',
      marketplace: 'Marketplace',
      travel: 'Travel',
      cards: 'Cards',
      mail: 'Mail',
    },
  },
  search: {
    scopesLabel: 'Search categories',
    scopes: ['Web', 'Images', 'Video', 'Maps', 'News', 'Dictionary', 'More'],
    fieldLabel: 'Search Astryx',
    placeholder: 'Enter a search term',
    submit: 'Search',
  },
  account: {
    mail: 'Mail, 3 unread',
    notifications: 'Notifications, 5 unread',
    menu: 'Menu and account',
  },
  promos: [
    'Fall transit schedule changes, explained',
    'Mail outage notice and restoration status',
  ],
  services: {
    heading: 'Services',
    labels: {
      shopping: 'Shopping',
      auctions: 'Auctions',
      marketplace: 'Marketplace',
      travel: 'Travel',
      dining: 'Dining',
      localGiving: 'Local Giving',
      delivery: 'Delivery',
      news: 'News',
      weather: 'Weather & Alerts',
      sports: 'Sports',
      finance: 'Finance',
      tvGuide: 'TV Guide',
      answers: 'Answers',
      maps: 'Maps',
      jobs: 'Jobs',
      games: 'Games',
      ebooks: 'E-books',
      calendar: 'Calendar',
    },
  },
  news: {
    sectionsLabel: 'News sections',
    tabs: {
      main: 'Top',
      domestic: 'Nation',
      world: 'World',
      economy: 'Business',
      tech: 'Tech & Science',
      sports: 'Sports',
      life: 'Life',
      local: 'Local',
    },
    feeds: {
      main: {
        updated: 'Updated Thu 9/17, 6:30 AM',
        headlines: [
          'Transit adds 14 late-night bus trips',
          'Grocery prices ease a third month',
          'Seawater cooling cuts power draw 31%',
          'Viaduct repair finishes nine weeks early',
          'Heavy rain likely inland Thursday evening',
          'National squad names 23 players',
          'Empty-home renovation grant opens today',
          'Regulator asks carriers to publish delivery-window accuracy',
        ],
        focal: {
          caption: 'Inside the night maintenance yard',
          stamp: 'Wed 9/16, 6:20 PM',
          source: 'Harbor Wire',
          alt: 'Maintenance crew working on a rail platform at night',
        },
      },
      domestic: {
        updated: 'Updated Thu 9/17, 6:24 AM',
        headlines: [
          'Empty-home grant caps at 3,000 households',
          'School lunch program adds two districts',
          'Night bus 88 becomes permanent',
          'Flu shot appointments open for adults 65+',
          'City marathon lottery draws 142,000 entries',
          'Coastal wind farm clears environmental review',
          'Library drops overdue fines on children’s books',
          'Rent relief for public housing cuts paperwork',
        ],
        focal: {
          caption: 'A quiet block on the north side',
          stamp: 'Wed 9/16, 3:40 PM',
          source: 'Harborview Times',
          alt: 'Low houses along a quiet residential street',
        },
      },
      world: {
        updated: 'Updated Thu 9/17, 6:18 AM',
        headlines: [
          'Port strike ends in a staffing deal',
          'Container backlog expected to clear in 11 days',
          'Cross-border rail ends first month at 80% of forecast',
          'Drought monitor lowers its alert level',
          'Central bank holds rates, trims outlook',
          'Wheat exporters lift shipment estimates',
          'Two cities sign a plan to cool public squares',
          'Undersea cable repair finishes a week early',
        ],
        focal: {
          caption: 'A working pier, back at capacity',
          stamp: 'Wed 9/16, 8:05 PM',
          source: 'Northline Post',
          alt: 'Container cranes at a working port',
        },
      },
      economy: {
        updated: 'Updated Thu 9/17, 6:12 AM',
        headlines: [
          'Grocery chain buys 210 franchise stores',
          'Parcel carrier posts first profit in three years',
          'Regional lender reopens 12 branches',
          'Airline adds a second daily Harborview flight',
          'Chip packager commits $600M to a second inland plant',
          'Retail wage floor rises 4.1% in a sector deal',
          'Electricity rebate extended for winter',
          'Long-term yields edge up on rebalancing',
        ],
        focal: {
          caption: 'Restocking the aisles before open',
          stamp: 'Wed 9/16, 5:10 PM',
          source: 'Ledger Daily',
          alt: 'Shop assistant restocking a supermarket aisle',
        },
      },
      tech: {
        updated: 'Updated Thu 9/17, 6:06 AM',
        headlines: [
          'Seawater cooling cuts a data hall’s power draw 31%',
          'Transit app ships offline timetables',
          'Open forecast dataset adds 40 years of readings',
          'Handset maker promises seven years of security updates',
          'Rail operator publishes a delay-prediction model',
          'Storage prices fall a fourth consecutive quarter',
          'Two universities share a network testbed',
          'Smaller satellites cut launch costs 30%',
        ],
        focal: {
          caption: 'Checking the cooling loop',
          stamp: 'Wed 9/16, 4:45 PM',
          source: 'Northline Post',
          alt: 'Engineer inspecting cooling pipework in a server hall',
        },
      },
      sports: {
        updated: 'Updated Thu 9/17, 6:00 AM',
        headlines: [
          'Harborview holds on 2–1 for a fourth straight road win',
          'Fall series squad leaves out two veterans',
          'Swimmer takes the 200m freestyle record by 0.34 seconds',
          'Marathon course reroutes around viaduct work',
          'League approves a 26-team format',
          'Cyclist wins the hill stage on a 25-mile solo break',
          'Basketball team signs a center to a two-year deal',
          'Women’s relay redrawn into six legs',
        ],
        focal: {
          caption: 'Noise from the north stand',
          stamp: 'Wed 9/16, 9:30 PM',
          source: 'Sideline',
          alt: 'Supporters cheering in a stadium stand',
        },
      },
      life: {
        updated: 'Updated Thu 9/17, 5:54 AM',
        headlines: [
          'The two-gallon pantry: cooking for one',
          'A gardener’s case for planting hard corners last',
          'Five short hikes you can reach on a day pass',
          'When the museum dropped timed entry',
          'Sleep clinic publishes a shift-work guide',
          'The repair café that fixed 1,900 kettles in a year',
          'A reading list for the long commute',
          'Storage in a 22-square-foot kitchen',
        ],
        focal: {
          caption: 'At the kitchen counter',
          stamp: 'Wed 9/16, 2:00 PM',
          source: 'Harbor Living',
          alt: 'Pantry staples arranged on a wooden counter',
        },
      },
      local: {
        updated: 'Updated Thu 9/17, 5:48 AM',
        headlines: [
          'Water main switchover in the Harbor District',
          'Northline crossing to be raised',
          'Civic Hall closes for renovation through March',
          'Beach cleanup seeks 300 volunteers',
          'City offices to open two Saturdays a month',
          'Paper recycling moves to the 2nd and 4th Tuesdays in October',
          'Playground equipment replaced at five parks',
          'Emergency siren test at noon on the 19th',
        ],
        focal: {
          caption: 'The sidewalk outside the city offices',
          stamp: 'Wed 9/16, 1:15 PM',
          source: 'Harborview Times',
          alt: 'Apartment block with exterior air handling units',
        },
      },
    },
    breakingFlag: 'BREAKING',
    commentCount: count => `${count} comments`,
    more: 'More',
    all: 'All news',
  },
  features: {
    title: 'Features & Columns',
    more: 'All features',
    lead: {
      title: 'Six walks that end at a bakery',
      body: 'Six routes that follow the hills and the canal and finish at something still warm. Every one of them starts within walking distance of a station.',
      meta: 'Weekend · 8 min read',
      alt: 'Cyclist resting outside a corner bakery',
    },
    links: [
      {
        title: 'What the new cooling rules mean for renters',
        meta: 'Explainer · 5 min read',
      },
      {title: 'A kitchen designed for 22 square feet', meta: 'Home · 6 min read'},
      {
        title: 'The night shift that keeps the trains moving',
        meta: 'Photos · 12 min read',
      },
      {
        title: 'The market row that stopped discounting',
        meta: 'Business · 9 min read',
      },
      {
        title: 'Five answers to what an old viaduct is for',
        meta: 'Cities · 7 min read',
      },
    ],
  },
  notices: {
    title: 'City Notices',
    more: 'All notices',
    items: [
      'Bulky trash pickup moves online',
      'New fee for convenience-store records',
      'City pool renovation starts October 20',
      'Bookmobile adds two more stops',
      'Preschool applications due November 4',
      'Screening van schedule posted',
      'Bike parking permit lottery results',
      'Street tree pruning through December',
    ],
  },
  questions: {
    title: 'Answers',
    more: 'All questions',
    openFlag: 'Open',
    answerCount: count => `${count} answers`,
    items: [
      'Do bus passes work on the new late-night trips?',
      'Can I apply for the home grant if the deed is in my parent’s name?',
      'Is the viaduct really quieter since the repair?',
      'Which nearby pools are open while the city pool is closed?',
      'How often do delivery windows actually hold?',
      'Where does the confirmation number for online pickup go?',
    ],
    ask: 'Ask a question',
    awaiting: 'Questions awaiting answers',
  },
  keywords: {
    title: 'Trending Searches',
    more: 'Search rankings',
    items: [
      'late-night bus 88',
      'empty-home grant',
      'fall squad 23',
      'rain timing',
      'seawater cooling',
      'viaduct reopening',
      'grocery prices',
      'delivery accuracy',
      'marathon lottery',
      'water main switchover',
      'retail wage floor',
      'port strike deal',
    ],
    footnote: 'Based on searches as of Thu 9/17, 6:30 AM',
  },
  events: {
    title: 'This Week’s Events',
    all: 'All events',
    items: [
      {date: 'Sat 9/19', title: 'Harbor Morning Market', place: 'Pier 3'},
      {
        date: 'Sun 9/20',
        title: 'Northline Twilight Concert',
        place: 'Civic Hall lawn',
      },
      {
        date: 'Wed 9/23',
        title: 'Used Books & Coffee Day',
        place: 'Viaduct Market Row',
      },
    ],
  },
  signIn: {title: 'Sign in', signUp: '[Sign up]', accountInfo: 'Account info'},
  signInShortcuts: {
    mail: 'Mail',
    dailyDraw: 'Daily draw',
    balance: 'Check balance',
  },
  weather: {
    title: 'Thursday, Sep 17',
    location: 'Harbor District ▾',
    days: {
      today: {
        label: 'Today',
        summary: 'Cloudy, showers',
        high: '75°F',
        low: '66°F',
        rain: '60%',
      },
      tomorrow: {
        label: 'Tomorrow',
        summary: 'Cloudy, then sun',
        high: '73°F',
        low: '66°F',
        rain: '50%',
      },
    },
    rain: chance => `Rain ${chance}`,
    heatIndex: 'Heat index',
    heatIndexLevel: 'Caution',
    radar: 'Rain radar',
  },
  markets: {
    title: 'Markets',
    more: 'Finance',
    up: 'Up',
    down: 'Down',
    rows: {
      composite: {name: 'Harborview Composite', value: '38,942.16'},
      broad500: {name: 'Broad 500', value: '2,714.08'},
      tech100: {name: 'Tech 100', value: '17,308.55'},
      reit: {name: 'Harborview REIT', value: '1,986.20'},
      gold: {name: 'Gold, spot', value: '$2,388.40'},
      crude: {name: 'Crude oil', value: '$79.18'},
    },
    footnote: 'As of 6:30 AM · quotes delayed 20 minutes',
  },
  rankings: {
    title: 'Most Popular',
    all: 'All',
    boardsLabel: 'Ranking type',
    tabs: {read: 'Read', shared: 'Shared', discussed: 'Discussed'},
    boards: {
      read: [
        {title: 'Late-night service back on six routes', metric: '84K'},
        {title: 'Why grocery prices kept falling', metric: '61K'},
        {title: 'Empty-home grant: who qualifies', metric: '55K'},
        {title: 'The squad list, and two surprises', metric: '48K'},
        {title: 'Rain timing, hour by hour', metric: '39K'},
        {title: 'The repair that beat its schedule', metric: '31K'},
      ],
      shared: [
        {title: 'A kitchen for 22 square feet', metric: '12K'},
        {title: 'The repair café that fixed 1,900 kettles', metric: '9,800'},
        {title: 'Six walks that end at a bakery', metric: '8,100'},
        {title: 'The night shift keeping trains moving', metric: '7,600'},
        {title: 'Library drops children’s book fines', metric: '6,200'},
        {title: 'The museum without timed entry', metric: '4,900'},
      ],
      discussed: [
        {title: 'League approves a 26-team format', metric: '613'},
        {title: 'Retail wage floor rises 4.1%', metric: '341'},
        {title: 'Central bank holds, trims its forecast', metric: '302'},
        {title: 'Marathon lottery odds, explained', metric: '271'},
        {title: 'Seven years of security updates, promised', metric: '258'},
        {title: 'Grocery prices and the supply recovery', metric: '214'},
      ],
    },
    footnote: 'Totals for the past 24 hours',
  },
  railFeature: {
    title: 'Harborview inns: fall multi-night rates',
    body: 'Fourteen places along the water, compared on multi-night rates and whether they run a shuttle.',
    cta: 'See the rates',
    alt: 'View of the water from an inn’s guest room',
  },
  footer: {
    links: [
      'About',
      'Advertise',
      'Publishers',
      'Editorial standards',
      'Corrections',
      'Accessibility',
      'Privacy',
      'Terms',
      'Help',
      'Contact',
    ],
    copyright: '© 2026 Astryx · Stories from 128 partner publishers',
    location: 'Location: Harbor District',
  },
};

/**
 * The two editions, by locale.
 *
 * A `Record` over `PortalLocale`, so adding a third locale to the union is a
 * compile error until its content exists — there is no default edition to fall
 * through to and no partial locale to ship by accident.
 */
const PORTAL_CONTENT: Record<PortalLocale, PortalContent> = {
  ja: JAPANESE_CONTENT,
  en: ENGLISH_CONTENT,
};

/**
 * The edition the modules below read from.
 *
 * A context rather than a prop threaded through every component. The
 * alternative is either a `content` parameter on all two dozen of them — which
 * makes every signature about localisation instead of about the module — or the
 * two duplicated page trees this design exists to avoid. The default value is
 * the Japanese edition, so a module rendered outside the page still has copy.
 */
const PortalContentContext = createContext<PortalContent>(
  PORTAL_CONTENT[DEFAULT_LOCALE],
);
PortalContentContext.displayName = 'PortalContentContext';

function usePortalContent(): PortalContent {
  return use(PortalContentContext);
}

/**
 * Writes the edition's language and name onto the document.
 *
 * `documentElement.lang` first: it is what a screen reader picks a voice from,
 * what `:lang()` and font fallback select on, and — because the page's Japanese
 * and English editions are set in the same stack — the only signal a browser
 * has about which script the text below is in. Then the title, which is the
 * page's name in the tab and in history, and the meta description beside it.
 *
 * A layout effect rather than a passive one so all three land in the same frame
 * as the switch, with no flash of the previous edition's title. The description
 * tag is created if the host document has none, which is what makes the page
 * self-sufficient when it is scaffolded into an application that never wrote
 * one.
 */
function useDocumentLocale({
  lang,
  title,
  description,
}: PortalContent['document']): void {
  useLayoutEffect(() => {
    document.documentElement.lang = lang;
    document.title = title;

    let tag = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (tag === null) {
      tag = document.createElement('meta');
      tag.name = 'description';
      document.head.appendChild(tag);
    }
    tag.content = description;
  }, [lang, title, description]);
}

// =============================================================================
// Shared module furniture
// =============================================================================

interface ModuleProps {
  title: string;
  /** Inert "see everything" affordance a portal module always carries. */
  moreLabel?: string;
  /** Replaces `moreLabel` when the header needs something other than a link. */
  headerEnd?: ReactNode;
  /** Set for modules whose body supplies its own edge-to-edge padding. */
  isFlush?: boolean;
  children: ReactNode;
}

/**
 * One ruled module: a bordered rectangle with a hairline under its header.
 *
 * `Card` rather than `Section` because the module's defining feature here is
 * its 1px frame, and the theme puts that on `card`. The header sits outside the
 * padded body so its rule runs the full width of the frame — a rule that stops
 * short of the border reads as an underlined heading instead of a division of
 * the module, which is the whole grammar of this layout.
 */
function Module({
  title,
  moreLabel,
  headerEnd,
  isFlush = false,
  children,
}: ModuleProps) {
  return (
    <Card padding={0}>
      <VStack gap={0}>
        <HStack gap={2} align="center" justify="between" padding={2}>
          <Heading level={2} maxLines={1}>
            {title}
          </Heading>
          {headerEnd}
          {moreLabel !== undefined && (
            <Link href="#" size="sm">
              {moreLabel}
            </Link>
          )}
        </HStack>
        <Divider isFullBleed />
        {isFlush ? children : <VStack padding={2}>{children}</VStack>}
      </VStack>
    </Card>
  );
}

/**
 * The comment count that closes every headline row.
 *
 * Four figures is where a count stops being metadata and becomes the reason to
 * click, so at that point it graduates from secondary text to a red chip. The
 * threshold is what keeps the alert colour rationed: two or three rows on the
 * whole page carry it, which is why it still reads as an alert.
 *
 * `Center isInline` rather than a bare `HStack`: the count sits inside the
 * headline's anchor, and a hovered anchor paints its underline straight through
 * any in-flow descendant. An inline-flex box is an atomic inline, which is
 * where that underline stops — so the hover rule lands on the headline text and
 * not on the glyph and figure trailing it. It also keeps the count on the
 * headline's own line instead of breaking it, which a block-level stack would.
 *
 * The count reaches assistive technology as one phrase from `VisuallyHidden`,
 * with the glyph and the figure hidden, so the row's name ends "…312 comments"
 * — or "…コメント312件" — rather than a bare "312" whose unit only the icon
 * carried. Which of the two it is comes from the edition, because a counter
 * word is not a suffix a placeholder can hold. The words cannot ride on the
 * icon: a `@heroicons` component ships its own `aria-hidden` on the `<svg>`,
 * which outranks the `role="img"` and label `Icon` derives from `label`, so
 * that label never reaches the tree.
 */
function CommentCount({count}: {count: number}) {
  const {news} = usePortalContent();
  const label = news.commentCount(count);

  return (
    <Center isInline>
      {count >= 1000 ? (
        <Token size="sm" color="red" label={String(count)} aria-hidden />
      ) : (
        <HStack gap={0.5} align="center">
          <Icon icon={ChatBubbleLeftEllipsisIcon} size="xsm" color="secondary" />
          <Text size="xsm" color="secondary" hasTabularNumbers aria-hidden>
            {count}
          </Text>
        </HStack>
      )}
      <VisuallyHidden>{label}</VisuallyHidden>
    </Center>
  );
}

/**
 * What trails an article's headline inside the row's anchor — a flag, a count,
 * a byline — held in one inline-flex island.
 *
 * The island earns its place for two reasons. It is an atomic inline, so the
 * anchor's hover underline ends with the headline instead of running on under
 * marks that are not the thing being named. And it is one box, so when the row
 * runs out of measure everything in it wraps together and keeps its own
 * spacing, rather than a flag stranding on the line above its count.
 *
 * The leading gap is this box's padding rather than a space after the headline,
 * because a space *is* headline text: it would carry the underline out past the
 * last character.
 */
function ArticleMeta({children}: {children: ReactNode}) {
  return (
    <Center isInline paddingInlineStart={1}>
      <HStack gap={1} align="center">
        {children}
      </HStack>
    </Center>
  );
}

/** A news row's trail: the status flag, then the comment count. */
function HeadlineMeta({headline}: {headline: HeadlineFacts}) {
  const {news} = usePortalContent();

  return (
    <ArticleMeta>
      {headline.flag === 'breaking' && (
        <Badge variant="error" label={news.breakingFlag} />
      )}
      {headline.flag === 'new' && <Badge variant="warning" label={NEW_FLAG} />}
      <CommentCount count={headline.comments} />
    </ArticleMeta>
  );
}

/**
 * The article row's bullet.
 *
 * Composed instead of using `List`'s own `listStyle="disc"` marker. That marker
 * is a fixed 6px dot centred in a 16px box, and neither the dot nor the box is
 * reachable from a theme target — so on a page this dense it is both too heavy
 * and held 13px off the headline, with the row itself inset again on top of
 * that. A typographic bullet set in the row's type size is smaller, sits on the
 * column edge the rest of the page aligns to, and comes in at a 2px gap. The
 * `<li>` and its `<ul>` are untouched, so the list is still a list; the bullet
 * is `aria-hidden`, so the row's accessible name is still just its headline,
 * exactly as it was with the native marker.
 *
 * `primary` rather than `accent` because an article row is not link text end to
 * end — it carries a flag, a desk, a count — and a blue dot in front of that
 * mix reads as a fourth coloured element rather than as the list's marker.
 */
function ArticleBullet() {
  return (
    <Text size="base" color="primary" aria-hidden>
      •
    </Text>
  );
}

/**
 * Renders a `Link`'s anchor as the filling item of the stack row it sits in.
 *
 * `Link` styles, focuses and gives link semantics to whatever element it is
 * told to render, and `StackItem` is polymorphic, so handing one to the other
 * produces a single real `<a>` that is also a filling flex item — one anchor
 * spanning the row, no nesting, no second tab stop, and nothing about it styled
 * here: it grows for the same reason every other filling row in this file does.
 *
 * Widening the anchor, rather than making the row interactive, is also what
 * keeps the row's background clear. An interactive `ListItem` paints a hover
 * plate behind the whole row, and an article row is a headline plus whatever
 * trails it — a flag, a count, a section and a reading time — so tinting all of
 * it implies the metadata is part of what you are clicking. Here the row itself
 * stays inert, so the plate is never composed in for a headline row and the
 * anchor's underline carries the affordance; the one run that keeps the plate
 * is Markets, whose rows are three separate figures rather than a sentence.
 */
function RowFillAnchor({
  children,
  // Astryx hands a custom link component `to` alongside `href` so that
  // `to`-based routers need no adapter. This one renders a native anchor,
  // where `to` is not an attribute, so it is taken off rather than stamped
  // onto the DOM.
  to: _to,
  ...anchorProps
}: {
  children?: ReactNode;
  to?: string;
}) {
  return (
    <StackItem as="a" size="fill" {...anchorProps}>
      {children}
    </StackItem>
  );
}

// =============================================================================
// Article rows
//
// Which of this page's link runs are article lists, and which are not.
//
// A *headline row* is a row whose whole content is a piece of writing you open
// and read: a sentence, and at most some marks about it. Every one of them on
// this page takes the row below, so a reader learns the interaction once —
// bullet, body-size sentence, one row-wide anchor, an underline under the
// sentence on hover, and no plate behind any of it — and it holds wherever a
// headline appears. Five runs qualify:
//
// - **The news feed (`NewsModule`)** — the page's lede. It takes the same row
//   at the same body size as the rest: what marks it as the lede is its place
//   at the top of the main column, not larger type.
// - **Features & Columns (`FeatureModule`)** — the editorial run under the
//   module's lead piece. Its section-and-reading-time metadata rides in the
//   row's `ArticleMeta` island, exactly as the news row's flag and comment
//   count do.
// - **City Notices (`NoticeModule`)**, both columns — municipal notices. No
//   desk and no byline, but a city notice is still a sentence you click to go
//   and read, which is what the row is for; the rows differ from the news feed
//   only in carrying no metadata.
// - **Answers (`QuestionModule`)** — reader threads. A question is a sentence
//   you open, and its "open" flag and answer count are the same kind of marks
//   as a news row's flag and comment count, so they ride in the same island
//   inside the same anchor.
// - **Most Popular (`RankingModule`)** — articles, ranked. The ordinal is
//   information, so the row keeps the `<ol>`'s decimal marker in place of the
//   bullet (`marker="ordinal"`); everything else about it is the standard row,
//   with the page-view figure moved off the row's far end and into the island
//   so the anchor is unbroken.
//
// The rest of the page's link runs are not headline rows, and keep their own:
//
// - **This Week’s Events (`EventModule`)** — dated listings, and the closest
//   call here. What a reader wants from the row is *when*, so the date leads a
//   line of its own and the three rows align on it; folding it in beside the
//   title the way an article row folds in a flag would cost that alignment and,
//   in a 188px rail, wrap it under the title anyway. The rows carry no plate
//   and no row interaction to begin with — the title is a plain link, so
//   hovering it underlines the title and nothing else, which is the same
//   affordance the article rows carry.
//
// - **Services (`ServiceDirectory`)** — navigation, not reading. Each row is a
//   service's name beside its icon, so the destination is the row and the
//   affordance is the icon-and-label pair, not an underlined sentence.
// - **Markets (`MarketModule`)** — a quote readout: a direction arrow, an
//   instrument, a level, a change. Three separate cells, no sentence, so the
//   row keeps Astryx's interactive `ListItem` — with a row this heterogeneous
//   the hover plate is what says the *row* is one target, where on a headline
//   row the underline says it better and a plate says it wrongly.
// - **Trending Searches (`KeywordModule`)** — search terms. Each is a query,
//   not a piece of writing, and the rank number is what separates them, so they
//   wrap rather than list.
// - The masthead's promo links, the footer's link run, the rail promo
//   (`RailFeature`), "Ask a question" and each module's "More" / "All" links —
//   single navigation links, not rows.
// =============================================================================

/**
 * One article row — the page's single pattern for a headline you can open.
 *
 * Five decisions make up the pattern, and they are here rather than repeated at
 * each call site so that every headline run on the page is the same object:
 *
 * - A small bullet in the body ink, flush to the module's content edge, so a
 *   run of rows reads as one list and the bullet marks where the column starts
 *   (see {@link ArticleBullet}) — or, in a ranked list, the ordinal in its
 *   place.
 * - The headline at the page's body size, 14px, in every list including the
 *   news module: one article row means one article type size, so no list can be
 *   read as outranking another by its type alone.
 * - **One** anchor, filling the row: the headline, its metadata and the empty
 *   width past them are all inside it, so anywhere in the row is a hit
 *   (see {@link RowFillAnchor}).
 * - No hover plate. The `ListItem` takes no `href`, so it has no interactive
 *   state to paint; the affordance is the anchor's underline.
 * - That underline runs under the headline and stops there, because the
 *   metadata is an atomic inline island (see {@link ArticleMeta}).
 *
 * Which of the page's runs take this row — and, as importantly, which do not —
 * is settled in the note above.
 */
function ArticleRow({
  title,
  meta,
  marker = 'bullet',
}: {
  title: string;
  /** What trails the headline inside the anchor, wrapped in `ArticleMeta`. */
  meta?: ReactNode;
  /**
   * What marks the row.
   *
   * `bullet` is the row's own (see {@link ArticleBullet}). `ordinal` leaves the
   * mark to the enclosing ranked `ArticleList`, whose decimal counter is both
   * the marker and information the reader came for — two marks on one row would
   * be one too many.
   *
   * @default 'bullet'
   */
  marker?: 'bullet' | 'ordinal';
}) {
  return (
    // No `href` on the `ListItem`, unlike the page's quote rows: the anchor
    // *is* the row here, so the row has no interactive state of its own and
    // nothing paints behind it.
    <ListItem
      label={
        // `align="start"` rather than `center`: the bullet marks the first line
        // of the row, so on a headline that wraps it stays on that line instead
        // of drifting to the middle of the block.
        <HStack gap={0.5} align="start">
          {marker === 'bullet' && <ArticleBullet />}
          {/*
            `size="base"` and no prop to change it: the row's type size is part
            of the pattern, not a per-call-site choice. `display="block"` keeps
            the row's contents in inline flow instead of a flex line: a flex
            container blockifies its children, which would drag the metadata
            island back under the underline and cost it its place on the
            headline's line.
          */}
          <Link href="#" as={RowFillAnchor} size="base" display="block">
            {title}
            {meta}
          </Link>
        </HStack>
      }
    />
  );
}

/**
 * The list an article row belongs in: compact, unruled, and nothing else.
 *
 * Thin on purpose — it exists so that "an article list" is one name in this
 * file rather than a `density` prop that has to be remembered at each of the
 * call sites, and so a later change to how article runs are spaced or divided
 * lands in one place instead of being applied to each of them by hand.
 */
function ArticleList({
  children,
  isRanked = false,
}: {
  children: ReactNode;
  /**
   * Whether the run is a ranking, which makes it an `<ol>` numbered from 1.
   *
   * The rows in it take `marker="ordinal"`, so the counter replaces the bullet
   * rather than joining it.
   *
   * @default false
   */
  isRanked?: boolean;
}) {
  return (
    <List density="compact" listStyle={isRanked ? 'decimal' : 'none'}>
      {children}
    </List>
  );
}

/** A directory row: hairline-stroke glyph, then the service name as a link. */
function ServiceRow({icon, label}: {icon: IconType; label: string}) {
  return (
    <HStack gap={1.5} align="center">
      <Icon icon={icon} size="sm" color="accent" />
      <Link href="#" size="sm" maxLines={1}>
        {label}
      </Link>
    </HStack>
  );
}

/** A masthead / sign-in shortcut: glyph over label, sized for a 12px caption. */
function ShortcutButton({
  icon,
  label,
  canWrap = false,
}: {
  icon: IconType;
  label: string;
  /**
   * Lets the label run onto a second line instead of truncating.
   *
   * The masthead rows are free to be as wide as their labels, so they clamp to
   * one line; the sign-in panel divides a fixed rail into equal thirds, and
   * there the longest of the three labels has to be allowed to wrap — clamping
   * it would hide half a word, and widening its column would break the equal
   * thirds the vertical rules are drawn on.
   */
  canWrap?: boolean;
}) {
  return (
    <Link href="#" size="xsm" color="secondary">
      <VStack gap={0.5} align="center">
        <Icon icon={icon} size="lg" color="accent" />
        <Text
          size="xsm"
          color="inherit"
          justify="center"
          maxLines={canWrap ? 0 : 1}>
          {label}
        </Text>
      </VStack>
    </Link>
  );
}

// =============================================================================
// Masthead
// =============================================================================

/**
 * The current official Astryx brand mark, ahead of the wordmark.
 *
 * Copied byte-for-byte from the canonical brand asset in
 * [facebook/astryx](https://github.com/facebook/astryx) at
 * `apps/docsite/public/brand-icon.svg`
 * (`5a7b81959305e8f7e63238ff2f475353a7716222`,
 * sha256 `54e9c7b2…a4c38b75`) into this package's `public/`, so the mark on the
 * page is the upstream file rather than a redraw of it. It is published with
 * the package (`files` includes `public`) and, like the template's imagery, is
 * addressed root-absolute — the demo's Vite config rewrites that literal under
 * whatever base the site is served from, which is what makes it resolve both at
 * a domain root and under the GitHub Pages project path.
 *
 * The docsite's own `logos.tsx` calls itself the source of truth for the
 * artwork, but it inlines the mark so the path can take `currentColor`. An
 * `<img>` cannot inherit `color`, so the public file is the right form here: it
 * carries the brand blue itself, which is also what keeps the mark on-brand
 * under either colour scheme.
 *
 * The artboard is square and the mark bleeds to its edges, so the box is square
 * too — no distortion — and it is the wordmark's box rather than a size of its
 * own: `--text-wordmark-size` is the metric the theme sets the wordmark to (see
 * its `heading` / `type:wordmark` role), so reading the same variable here is
 * what guarantees the mark and the text are one lockup instead of two things
 * that happen to be 20px today. The literal fallback is what the mark falls back
 * to under a theme with no wordmark opinion, and it is also what the `width` and
 * `height` attributes carry: those are the intrinsic box the browser reserves
 * before any CSS lands, so they keep the masthead from reflowing on load.
 */
const LOGO_SRC = '/astryx-logo.svg';
const LOGO_WIDTH = 20;
const LOGO_HEIGHT = 20;
const LOGO_BOX = `var(--text-wordmark-size, ${LOGO_WIDTH}px)`;

/**
 * The language switcher: two choices, in the utility strip, no reload.
 *
 * `SegmentedControl` rather than a pair of buttons or a `<select>`, for three
 * reasons. It already carries the semantics this control needs — a
 * `role="radiogroup"` of `role="radio"` segments, so the selected edition is
 * announced as selected rather than inferred from colour, one arrow-key ring
 * instead of two tab stops, and Astryx's own focus outline on the segment that
 * has focus. It is themed by this repository's theme (`segmented-control` and
 * `segmented-control-item`) into the same squared, hairline-bordered, tint-well
 * object the search scopes and the tab troughs are, so the control needs no
 * styling here and cannot disagree with the page. And it is a *closed* choice
 * of two, which is what a radio group is for; a menu would hide one of the two
 * options behind a click for nothing.
 *
 * `size="sm"` is the density this strip is set at, and the theme's coarse-
 * pointer adaptation lifts `--size-element-sm` so the same markup is a touch
 * target on a phone without a breakpoint here — which is the whole point of
 * putting density in the theme rather than in the page.
 *
 * The group's accessible name is the edition's word for "display language", and
 * the segments are named `日本語` and `English` in both editions, so nothing
 * here is announced twice: the group says what is being chosen and each option
 * says which language it is, in that language.
 */
function LanguageSwitcher({
  locale,
  onLocaleChange,
}: {
  locale: PortalLocale;
  onLocaleChange: (next: PortalLocale) => void;
}) {
  const {languageSwitcher} = usePortalContent();

  return (
    <SegmentedControl
      value={locale}
      onChange={next => {
        // `SegmentedControl` reports the selected segment as a `string`,
        // because its values are open. This one's are not, so the value is
        // narrowed back to the union before it reaches page state.
        if (isPortalLocale(next)) {
          onLocaleChange(next);
        }
      }}
      label={languageSwitcher.label}
      size="sm">
      {LOCALE_OPTIONS.map(option => (
        <SegmentedControlItem
          key={option.id}
          value={option.id}
          label={option.label}
        />
      ))}
    </SegmentedControl>
  );
}

function UtilityBar({
  locale,
  onLocaleChange,
}: {
  locale: PortalLocale;
  onLocaleChange: (next: PortalLocale) => void;
}) {
  const {utility} = usePortalContent();

  return (
    <HStack gap={2} align="center" justify="between" wrap="wrap">
      <Link href="#" size="xsm" color="secondary" maxLines={1}>
        {utility.teaser}
      </Link>
      {/*
        The switcher sits at the end of the utility strip, which is where a
        portal keeps the controls that are about the site rather than about the
        story: it is the first thing in the reading order that can change the
        whole page, and it is out of the way of the masthead the reader came
        for.

        Its own wrapper wraps, and the link run inside it does not: the run's
        vertical hairlines divide four links into one object, and a wrap inside
        it would leave a rule dangling at the end of a line. So on a phone the
        switcher drops to a line of its own, right-aligned under the links,
        rather than the links breaking up around it. `align="stretch"` on the
        run is what makes those hairlines the height of the link text; the row
        holding it is centred, so the taller switcher beside it does not
        stretch them.
      */}
      <HStack gap={2} align="center" justify="end" wrap="wrap">
        <HStack gap={1.5} align="stretch">
          {utility.links.map((link, index) => (
            <Fragment key={link}>
              {index > 0 && <Divider orientation="vertical" />}
              <Link href="#" size="xsm" color="secondary" maxLines={1}>
                {link}
              </Link>
            </Fragment>
          ))}
        </HStack>
        <LanguageSwitcher locale={locale} onLocaleChange={onLocaleChange} />
      </HStack>
    </HStack>
  );
}

function Masthead({
  isNarrow,
  locale,
  onLocaleChange,
}: {
  isNarrow: boolean;
  locale: PortalLocale;
  onLocaleChange: (next: PortalLocale) => void;
}) {
  const {identity, masthead, search, account, promos} = usePortalContent();
  const [query, setQuery] = useState('');
  /**
   * Which scope is active, held as a position rather than as its label.
   *
   * The labels are translated, so a scope stored as `'ウェブ'` would stop
   * matching the moment the reader switched edition and the run would lose its
   * current item. The position is the same fact in both editions — which is the
   * same reason the news tabs and the ranking boards are stored as ids.
   */
  const [scope, setScope] = useState(0);

  /**
   * The mark and the wordmark, as one object.
   *
   * `alt=""` is deliberate and is the accessible treatment the pair needs: the
   * mark and the `<h1>` beside it say the same thing, so naming the image would
   * put the site's name into the tree twice and make a reader hear it, then
   * hear it again. Decorated out, the heading is the one name — and because it
   * is an `<h1>`, the name is still the first thing a reader reaches. It is
   * also why the mark needs no localised alternative: it names nothing, so
   * there is nothing in it to translate, while the heading beside it is the
   * site's name in the edition's own script (`アストリクス` / `Astryx`).
   *
   * `align="center"` is what aligns the pair, at every width: the mark is a
   * direct flex child of the row, so it is blockified — it never sits on the
   * heading's text baseline — and the row centres it on the heading's line box
   * in the three-across desktop masthead and in the narrow row where the
   * wordmark sits opposite the account buttons alike, with nothing to adjust
   * per breakpoint. `width`/`height` are set on the attributes rather than left
   * to the asset's intrinsic 32px, so the row is laid out to its final measure
   * before the image lands and the mark never reflows the masthead.
   *
   * The two halves are also set to match rather than merely sit together.
   * `type="wordmark"` is the theme's masthead role: it puts the text at
   * `--text-wordmark-size` with a line box collapsed onto it, which is the same
   * variable `LOGO_BOX` sizes the mark from — so the glyphs and the artboard are
   * the same 20px square and stay that way if the theme moves the metric.
   * `color="accent"` is the other half: the accent *is* the brand blue the mark
   * is drawn in (see the theme's `--color-accent`), so asking for the accent by
   * name is how the text matches the mark's ink without this file naming a hex
   * — and it keeps matching under a theme that brands itself differently.
   */
  const wordmark = (
    <HStack gap={1} align="center">
      <img
        src={LOGO_SRC}
        alt=""
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        style={{width: LOGO_BOX, height: LOGO_BOX}}
      />
      <Heading level={1} type="wordmark" color="accent" maxLines={1}>
        {identity}
      </Heading>
    </HStack>
  );

  const shortcutRow = (side: Run<ShortcutTile<ShortcutId>, 3>) => (
    <HStack gap={4} align="start">
      {side.map(shortcut => (
        <ShortcutButton
          key={shortcut.id}
          icon={shortcut.icon}
          label={masthead.shortcuts[shortcut.id]}
        />
      ))}
    </HStack>
  );

  /**
   * The scope run is a list of links rather than a `TabList`: these change what
   * the field searches, they do not switch a panel below, and a reader who
   * tabs through the masthead should not be handed arrow-key tab semantics for
   * something that is really a set of destinations.
   */
  const scopeRun = (
    <HStack gap={2} align="center" wrap={isNarrow ? 'nowrap' : 'wrap'}>
      {search.scopes.map((entry, index) => (
        <Link
          key={index}
          href="#"
          size="sm"
          color={index === scope ? 'primary' : 'accent'}
          weight={index === scope ? 'bold' : 'normal'}
          onClick={() => setScope(index)}
          aria-current={index === scope ? 'true' : undefined}>
          {entry}
        </Link>
      ))}
    </HStack>
  );

  const searchWell = (
    <Card variant="muted" padding={2}>
      <VStack gap={1.5}>
        {isNarrow ? (
          <ScrollableArea axis="inline" label={search.scopesLabel}>
            {scopeRun}
          </ScrollableArea>
        ) : (
          scopeRun
        )}
        <HStack gap={1} align="center">
          <StackItem size="fill">
            <TextInput
              label={search.fieldLabel}
              isLabelHidden
              placeholder={search.placeholder}
              value={query}
              onChange={setQuery}
              hasClear
              width="100%"
            />
          </StackItem>
          <Button
            label={search.submit}
            variant="primary"
            icon={<Icon icon={MagnifyingGlassIcon} size="sm" />}
          />
        </HStack>
      </VStack>
    </Card>
  );

  const promoRun = (
    <HStack gap={4} align="center" justify="center" wrap="wrap">
      {promos.map(promo => (
        <Link key={promo} href="#" size="sm" maxLines={1}>
          » {promo}
        </Link>
      ))}
    </HStack>
  );

  const accountActions = (
    <HStack gap={0.5} align="center">
      <IconButton
        label={account.mail}
        icon={<Icon icon={EnvelopeIcon} size="md" />}
        variant="ghost"
      />
      <IconButton
        label={account.notifications}
        icon={<Icon icon={BellIcon} size="md" />}
        variant="ghost"
      />
      <IconButton
        label={account.menu}
        icon={<Icon icon={Bars3Icon} size="md" />}
        variant="ghost"
      />
    </HStack>
  );

  return (
    <VStack gap={2}>
      <UtilityBar locale={locale} onLocaleChange={onLocaleChange} />
      {isNarrow ? (
        <HStack gap={2} align="center" justify="between">
          {wordmark}
          {accountActions}
        </HStack>
      ) : (
        <HStack gap={4} align="center" justify="between">
          {shortcutRow(MASTHEAD_START)}
          {wordmark}
          {shortcutRow(MASTHEAD_END)}
        </HStack>
      )}
      {searchWell}
      {promoRun}
    </VStack>
  );
}

// =============================================================================
// Columns
// =============================================================================

/**
 * The service directory.
 *
 * `layout` is the one thing that changes between breakpoints: as a `rail` it is
 * a tinted vertical column of one-per-row links; as a `band` the same links
 * wrap across the full width above the columns. A directory is a set of equal
 * destinations with no internal order, which is why it survives that change
 * when none of the other modules would.
 */
function ServiceDirectory({layout}: {layout: 'rail' | 'band'}) {
  const {services} = usePortalContent();
  const rows = SERVICE_DIRECTORY.map(service => (
    <ServiceRow
      key={service.id}
      icon={service.icon}
      label={services.labels[service.id]}
    />
  ));

  if (layout === 'band') {
    return (
      <Card variant="muted" padding={2}>
        <VStack gap={1.5}>
          <Heading level={3}>{services.heading}</Heading>
          <Divider isFullBleed />
          <Grid columns={{minWidth: 148}} gap={1.5}>
            {rows}
          </Grid>
        </VStack>
      </Card>
    );
  }

  return (
    <Card variant="muted" padding={2}>
      <VStack gap={1.5} as="nav" aria-label={services.heading}>
        {rows}
      </VStack>
    </Card>
  );
}

/**
 * The news module: section tabs over a bulleted headline run, with the day's
 * focal image held out to the side.
 *
 * The image sits beside the list rather than above it because a portal's news
 * module is judged on how many headlines clear the fold, and stacking the
 * picture would cost three of them. Below the narrow threshold it moves under
 * the list, where it costs nothing that was visible anyway.
 */
function NewsModule({
  topic,
  onTopicChange,
  isNarrow,
}: {
  topic: TopicId;
  onTopicChange: (next: TopicId) => void;
  isNarrow: boolean;
}) {
  const {news} = usePortalContent();
  const feed = news.feeds[topic];
  const facts = NEWS_HEADLINES[topic];

  const headlines = (
    <VStack gap={1.5}>
      <Text type="supporting">{feed.updated}</Text>
      <ArticleList>
        {feed.headlines.map((title, index) => (
          // Keyed by position, not by headline: the title is the half of the
          // row that changes with the edition, so keying on it would throw
          // every row away and rebuild it on a switch of language. The
          // position is what a row *is* in a ranked feed, and it is the same
          // fact in both editions.
          <ArticleRow
            key={`${topic}-${index}`}
            title={title}
            meta={<HeadlineMeta headline={facts[index]} />}
          />
        ))}
      </ArticleList>
      <HStack gap={4} align="center">
        <Link href="#" size="sm">
          {news.more}
        </Link>
        <Link href="#" size="sm">
          {news.all}
        </Link>
      </HStack>
    </VStack>
  );

  const focal = (
    <VStack gap={1} width={isNarrow ? undefined : 156}>
      <AspectRatio ratio={4 / 3} fit="cover">
        <img src={NEWS_FOCAL_IMAGES[topic]} alt={feed.focal.alt} />
      </AspectRatio>
      <Link href="#" size="sm" maxLines={2}>
        {feed.focal.caption}
      </Link>
      <Text type="supporting">{feed.focal.stamp}</Text>
      <Text type="supporting">{feed.focal.source}</Text>
    </VStack>
  );

  return (
    <Card padding={0}>
      <VStack gap={0}>
        <TabList
          value={topic}
          onChange={next => onTopicChange(next as TopicId)}
          size="sm"
          aria-label={news.sectionsLabel}
          hasDivider
          isFullBleed
          overflow="scroll">
          {TOPIC_ORDER.map(id => (
            <Tab key={id} value={id} label={news.tabs[id]} />
          ))}
        </TabList>
        <VStack padding={2}>
          {isNarrow ? (
            <VStack gap={2}>
              {headlines}
              <Divider isFullBleed />
              {focal}
            </VStack>
          ) : (
            <HStack gap={3} align="start">
              <StackItem size="fill">{headlines}</StackItem>
              {focal}
            </HStack>
          )}
        </VStack>
      </VStack>
    </Card>
  );
}

/** Features: the one module that leads with a picture, then falls to links. */
function FeatureModule() {
  const {features} = usePortalContent();

  return (
    <Module title={features.title} moreLabel={features.more}>
      <VStack gap={2}>
        <HStack gap={2} align="start">
          <VStack gap={1} width={136}>
            <AspectRatio ratio={4 / 3} fit="cover">
              <img src={FEATURE_LEAD_IMAGE} alt={features.lead.alt} />
            </AspectRatio>
          </VStack>
          <StackItem size="fill">
            <VStack gap={0.5}>
              <Link href="#" size="lg" weight="bold" maxLines={2}>
                {features.lead.title}
              </Link>
              <Text size="sm" color="secondary" maxLines={2}>
                {features.lead.body}
              </Text>
              <Text type="supporting">{features.lead.meta}</Text>
            </VStack>
          </StackItem>
        </HStack>
        <Divider isFullBleed />
        {/* Genuine editorial pieces, so the same row the news feed uses — at
            body size, which is every article list but the lede. The section and
            reading time ride inside the row's anchor as its metadata, the way
            the news row carries its flag and comment count. */}
        <ArticleList>
          {features.links.map((feature, index) => (
            <ArticleRow
              key={index}
              title={feature.title}
              meta={
                <ArticleMeta>
                  <Text type="supporting">{feature.meta}</Text>
                </ArticleMeta>
              }
            />
          ))}
        </ArticleList>
      </VStack>
    </Module>
  );
}

/**
 * City Notices: pure text, two columns, no imagery and no metadata.
 *
 * A city notice has no desk and no byline, but it is still a sentence a reader
 * clicks to go and read it, so the rows are the page's article rows — the bare
 * case of them, with nothing trailing the headline.
 */
function NoticeModule() {
  const {notices} = usePortalContent();

  return (
    <Module title={notices.title} moreLabel={notices.more}>
      {/* Two lists rather than one two-column list: a `<ul>` cannot flow its
          own rows into columns without a multi-column ancestor, which would
          also break the rows' anchors across column boundaries. */}
      <Grid columns={{minWidth: 232, max: 2}} gap={1.5}>
        <ArticleList>
          {notices.items.slice(0, 4).map((notice, index) => (
            <ArticleRow key={index} title={notice} />
          ))}
        </ArticleList>
        <ArticleList>
          {notices.items.slice(4).map((notice, index) => (
            <ArticleRow key={index} title={notice} />
          ))}
        </ArticleList>
      </Grid>
    </Module>
  );
}

/**
 * Answers: community threads.
 *
 * A question is a sentence a reader opens, so the rows are the page's article
 * rows. The answer count replaces the comment count as the module's one figure,
 * and the "open" flag is the only other mark on the row — a question still
 * taking answers is the one a reader can act on, so it is worth a flag where
 * "asked three days ago" is not. Both ride in the row's `ArticleMeta` island,
 * the way a news row carries its flag and count.
 */
function QuestionModule() {
  const {questions} = usePortalContent();

  return (
    <Module title={questions.title} moreLabel={questions.more}>
      <VStack gap={1.5}>
        <ArticleList>
          {questions.items.map((title, index) => (
            <ArticleRow
              key={index}
              title={title}
              meta={
                <ArticleMeta>
                  {QA_FACTS[index].isOpen && (
                    <Badge variant="info" label={questions.openFlag} />
                  )}
                  <Text size="xsm" color="secondary" hasTabularNumbers>
                    {questions.answerCount(QA_FACTS[index].answers)}
                  </Text>
                </ArticleMeta>
              }
            />
          ))}
        </ArticleList>
        <HStack gap={4} align="center">
          <Link href="#" size="sm">
            {questions.ask}
          </Link>
          <Link href="#" size="sm">
            {questions.awaiting}
          </Link>
        </HStack>
      </VStack>
    </Module>
  );
}

/**
 * Trending Searches: ranked search terms, wrapped rather than listed.
 *
 * Twelve entries in three lines is the highest link density on the page, and it
 * only works because the rank number does the separating — wrapping a run of
 * bare links would leave a reader unable to tell where one ends and the next
 * begins once two terms share a line.
 */
function KeywordModule() {
  const {keywords} = usePortalContent();

  return (
    <Module title={keywords.title} moreLabel={keywords.more}>
      <VStack gap={1.5}>
        <HStack gap={3} align="center" wrap="wrap">
          {keywords.items.map((keyword, index) => (
            <HStack key={index} gap={1} align="center">
              <Text size="xsm" color="secondary" hasTabularNumbers>
                {index + 1}
              </Text>
              <Link href="#" size="sm">
                {keyword}
              </Link>
            </HStack>
          ))}
        </HStack>
        <Text type="supporting">{keywords.footnote}</Text>
      </VStack>
    </Module>
  );
}

/**
 * This Week’s Events: three dated listings, narrow enough for the rail.
 *
 * Its whole job is to give the directory column something below it, because a
 * 188px rail runs out of links at about half the height of the news well. Dates
 * are tabular so the three rows align on one invisible column.
 */
function EventModule() {
  const {events} = usePortalContent();

  return (
    <Card padding={0}>
      <VStack gap={0}>
        <HStack gap={2} align="center" justify="between" padding={2}>
          <Heading level={3} maxLines={1}>
            {events.title}
          </Heading>
        </HStack>
        <Divider isFullBleed />
        <VStack gap={1.5} padding={2}>
          {events.items.map((event, index) => (
            <VStack key={index} gap={0}>
              <Text size="xsm" color="secondary" hasTabularNumbers>
                {event.date}
              </Text>
              <Link href="#" size="sm" maxLines={2}>
                {event.title}
              </Link>
              <Text type="supporting">{event.place}</Text>
            </VStack>
          ))}
          <Link href="#" size="sm">
            {events.all}
          </Link>
        </VStack>
      </VStack>
    </Card>
  );
}

// =============================================================================
// Rail modules
// =============================================================================

/** The rail's promo: the page's one unavoidable large image, kept in house. */
function RailFeature() {
  const {railFeature} = usePortalContent();

  return (
    <Card padding={0}>
      <VStack gap={0}>
        <AspectRatio ratio={16 / 9} fit="cover">
          <img src={RAIL_FEATURE_IMAGE} alt={railFeature.alt} />
        </AspectRatio>
        <Divider isFullBleed />
        <VStack gap={1} padding={2}>
          <Link href="#" size="sm" weight="bold" maxLines={2}>
            {railFeature.title}
          </Link>
          <Text type="supporting">{railFeature.body}</Text>
          <Link href="#" size="sm">
            {railFeature.cta}
          </Link>
        </VStack>
      </VStack>
    </Card>
  );
}

/**
 * The sign-in module.
 *
 * Its shortcuts sit in their own bordered panel, divided by vertical
 * hairlines — the portal's way of saying "these three belong to your account"
 * without a second heading. It is the one place on the page where a rule runs
 * vertically, which is what makes the grouping read.
 */
function SignInModule() {
  const {signIn, signInShortcuts} = usePortalContent();

  return (
    <Module
      title={signIn.title}
      headerEnd={
        <HStack gap={1.5} align="center">
          <Link href="#" size="sm">
            {signIn.signUp}
          </Link>
          <Link href="#" size="xsm" color="secondary">
            {signIn.accountInfo}
          </Link>
        </HStack>
      }>
      <Card variant="muted" padding={2}>
        {/*
          A `Grid` of three fixed tracks, not a row of `size="fill"` stack
          items: `fill` is `flex-grow` over an `auto` basis, so each third still
          starts from its own label's width and the three come out unequal —
          which is exactly what put the icons off the centres of their cells.
          `repeat(3, 1fr)` measures the tracks before the content, so the
          middle label can wrap onto a second line without moving either rule.

          Each rule leads the cell it divides off, which is what pins it to an
          exact third. Grid items stretch by default, and the theme gives a
          vertical `Divider` `align-self: stretch`, so both rules run the full
          height of the tallest cell and stay identical when one label wraps.
        */}
        <Grid columns={3} gap={0}>
          {SIGNIN_SHORTCUTS.map((shortcut, index) => (
            <HStack key={shortcut.id} gap={0} align="stretch">
              {index > 0 && <Divider orientation="vertical" />}
              <StackItem size="fill">
                <VStack align="center">
                  <ShortcutButton
                    icon={shortcut.icon}
                    label={signInShortcuts[shortcut.id]}
                    canWrap
                  />
                </VStack>
              </StackItem>
            </HStack>
          ))}
        </Grid>
      </Card>
    </Module>
  );
}

/**
 * One horizontal band of the forecast comparison, rendered once per day.
 *
 * The bands are listed rather than written out inside the grid so that the
 * order of the grid's children is the order of the bands: `FORECAST_BANDS` is
 * the outer loop and `FORECAST` the inner one, which is what puts a band's two
 * cells side by side in a single grid row. Writing the four bands inline would
 * be the same markup but would let a later edit reorder or nest a cell and
 * quietly break the row alignment; here a band is a row by construction.
 *
 * Every band is one line tall on purpose. The readings are what gets compared,
 * so each is given its own row at its own type size — the reading band carries
 * the icon and both temperatures because the icon *is* the reading's glyph and
 * belongs on its line, not on a row of its own.
 *
 * A band takes the day's structure and the edition's whole weather copy, and
 * looks the day's readings up in it. That keeps the units out of here: whether
 * the reading band prints `24℃` or `75°F`, and whether the rain band reads
 * `降水 60%` or `Rain 60%`, is settled in `PORTAL_CONTENT` and not by a
 * conditional in this file.
 */
interface ForecastBand {
  /** Stable half of the cell key; the day supplies the other half. */
  id: string;
  render: (day: ForecastDay, weather: PortalContent['weather']) => ReactNode;
}

const FORECAST_BANDS: readonly ForecastBand[] = [
  {
    id: 'day',
    render: (day, weather) => (
      <Text type="label" size="sm">
        {weather.days[day.id].label}
      </Text>
    ),
  },
  {
    id: 'reading',
    // `align="center"` and no wrap: the glyph and the two figures are one
    // reading, and a band that wrapped would take its column's rows out of
    // step with the other day's.
    render: (day, weather) => (
      <HStack gap={1.5} align="center">
        <Icon icon={day.icon} size="lg" color="accent" />
        <HStack gap={1} align="center">
          <Text size="lg" weight="bold" hasTabularNumbers>
            {weather.days[day.id].high}
          </Text>
          <Text size="sm" color="secondary" hasTabularNumbers>
            {weather.days[day.id].low}
          </Text>
        </HStack>
      </HStack>
    ),
  },
  {
    id: 'rain',
    render: (day, weather) => (
      <Text type="supporting" hasTabularNumbers>
        {weather.rain(weather.days[day.id].rain)}
      </Text>
    ),
  },
  {
    id: 'summary',
    render: (day, weather) => (
      <Text type="supporting">{weather.days[day.id].summary}</Text>
    ),
  },
];

/** Date, two days of forecast, and the day's heat advisory. */
function WeatherModule() {
  const {weather} = usePortalContent();

  return (
    <Module
      title={weather.title}
      headerEnd={
        <Link href="#" size="sm">
          {weather.location}
        </Link>
      }>
      <VStack gap={2}>
        {/*
          Two fixed columns, filled band by band rather than column by column.

          The module is a comparison — the reason to look at it is today against
          tomorrow — and a comparison only works if the two readings can be
          scanned across. Emitting a column at a time makes each column its own
          stack, so the bands only line up while both days happen to render to
          the same heights: a summary that wraps, a temperature that loses a
          digit or an icon that changes metric all shear the other column's rows
          out of line. Emitting a band at a time puts both days' icons in one
          grid row, both temperatures in the next, and so on, so the rows are
          aligned by the grid itself and stay aligned whatever the fixtures say —
          which now includes whichever edition is on screen, since the Japanese
          and English readings are not the same number of characters wide.

          `columns={2}` rather than the responsive `{minWidth, max: 2}` this
          module used before: row-major filling is only correct at exactly two
          tracks. Were the grid to collapse to one, the flow would read Today,
          Tomorrow, then both icons, then both temperatures — the bands
          interleaved instead of stacked. Two columns stay legible all the way
          down to the 390px rail (each track still clears 150px, and the widest
          cell in the module is a short summary line), so there is no width
          in this template's range where collapsing would be the better trade;
          pinning the count is what makes the row-major fill safe.

          `rowGap` under `columnGap`: the bands are readings of one day and want
          to cohere vertically, while the two days want to stay told apart. That
          is also why no centre divider is drawn — a third track would have to
          come out of the columns' width, and at rail measure the gap already
          separates them.
        */}
        <Grid columns={2} columnGap={2} rowGap={1}>
          {FORECAST_BANDS.map(band =>
            FORECAST.map(day => (
              <Fragment key={`${band.id}-${day.id}`}>
                {band.render(day, weather)}
              </Fragment>
            )),
          )}
        </Grid>
        <Divider isFullBleed />
        <HStack gap={1.5} align="center" justify="between" wrap="wrap">
          <HStack gap={1.5} align="center">
            <Text size="sm">{weather.heatIndex}</Text>
            <Badge variant="warning" label={weather.heatIndexLevel} />
          </HStack>
          <Link href="#" size="sm">
            {weather.radar}
          </Link>
        </HStack>
      </VStack>
    </Module>
  );
}

/** Index levels and their day change, as a ruled two-column run. */
function MarketModule() {
  const {markets} = usePortalContent();

  return (
    <Module title={markets.title} moreLabel={markets.more}>
      <VStack gap={1.5}>
        <List density="compact" hasDividers>
          {MARKETS.map(row => (
            <ListItem
              key={row.id}
              href="#"
              startContent={
                <Icon
                  icon={row.isUp ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
                  size="xsm"
                  color={row.isUp ? 'success' : 'error'}
                  label={row.isUp ? markets.up : markets.down}
                />
              }
              label={
                <Text size="sm" color="accent" maxLines={1}>
                  {markets.rows[row.id].name}
                </Text>
              }
              endContent={
                <HStack gap={1} align="center">
                  <Text size="sm" weight="medium" hasTabularNumbers>
                    {markets.rows[row.id].value}
                  </Text>
                  <Token
                    size="sm"
                    color={row.isUp ? 'green' : 'red'}
                    label={row.change}
                  />
                </HStack>
              }
            />
          ))}
        </List>
        <Text type="supporting">{markets.footnote}</Text>
      </VStack>
    </Module>
  );
}

/** Access rankings, switched by a tab trough like the news module's. */
function RankingModule({
  board,
  onBoardChange,
}: {
  board: BoardId;
  onBoardChange: (next: BoardId) => void;
}) {
  const {rankings} = usePortalContent();
  const entries = rankings.boards[board];

  return (
    <Card padding={0}>
      <VStack gap={0}>
        <HStack gap={2} align="center" justify="between" padding={2}>
          <Heading level={2} maxLines={1}>
            {rankings.title}
          </Heading>
          <Link href="#" size="sm">
            {rankings.all}
          </Link>
        </HStack>
        <TabList
          value={board}
          onChange={next => onBoardChange(next as BoardId)}
          size="sm"
          aria-label={rankings.boardsLabel}
          hasDivider
          isFullBleed>
          {BOARD_ORDER.map(id => (
            <Tab key={id} value={id} label={rankings.tabs[id]} />
          ))}
        </TabList>
        <VStack gap={1.5} padding={2}>
          {/* Ranked articles are still articles, so the rows are the page's
              article rows with the `<ol>`'s ordinal standing in for the bullet.
              The page-view figure moves off the row's far end and into the
              headline's island: at the end of the row it sat outside the
              anchor, which left a gap in a row a reader reads as one target. */}
          <ArticleList isRanked>
            {entries.map((entry, index) => (
              <ArticleRow
                key={`${board}-${index}`}
                marker="ordinal"
                title={entry.title}
                meta={
                  <ArticleMeta>
                    <Text size="xsm" color="secondary" hasTabularNumbers>
                      {entry.metric}
                    </Text>
                  </ArticleMeta>
                }
              />
            ))}
          </ArticleList>
          <Text type="supporting">{rankings.footnote}</Text>
        </VStack>
      </VStack>
    </Card>
  );
}

/** The rail, in the order a reader needs it: account, day, money, popularity. */
function RailModules({
  board,
  onBoardChange,
}: {
  board: BoardId;
  onBoardChange: (next: BoardId) => void;
}) {
  return (
    <>
      <RailFeature />
      <SignInModule />
      <WeatherModule />
      <MarketModule />
      <RankingModule board={board} onBoardChange={onBoardChange} />
    </>
  );
}

// =============================================================================
// Footer
// =============================================================================

function PortalFooter() {
  const {footer} = usePortalContent();

  return (
    <VStack gap={1.5}>
      <HStack gap={2} align="center" justify="center" wrap="wrap">
        {footer.links.map((link, index) => (
          <Link key={index} href="#" size="xsm" color="secondary">
            {link}
          </Link>
        ))}
      </HStack>
      <HStack gap={2} align="center" justify="between" wrap="wrap">
        <Text type="supporting">{footer.copyright}</Text>
        <HStack gap={1} align="center">
          <Icon icon={DevicePhoneMobileIcon} size="xsm" color="secondary" />
          <Link href="#" size="xsm" color="secondary">
            {footer.location}
          </Link>
        </HStack>
      </HStack>
    </VStack>
  );
}

// =============================================================================
// Page
// =============================================================================

export default function InformationMaximalistPage() {
  const [surfaceRef, surfaceWidth] = useSurfaceWidth();
  /**
   * The edition on screen.
   *
   * Seeded from storage by a lazy initialiser, so the remembered choice is
   * already in the first render rather than swapped in by an effect afterwards
   * — there is no server render to disagree with here, and reading storage
   * during render is what keeps a reader who chose English from seeing a frame
   * of Japanese. A reader who has chosen nothing gets `DEFAULT_LOCALE`.
   */
  const [locale, setLocale] = useState<PortalLocale>(readStoredLocale);
  /**
   * The selected news section and ranking board, held as ids.
   *
   * Both survive a change of edition untouched, because an id is not copy: the
   * tab strip re-labels itself and the feed under it re-writes itself, while
   * `'economy'` stays `'economy'`.
   */
  const [topic, setTopic] = useState<TopicId>('main');
  const [board, setBoard] = useState<BoardId>('read');

  const content = PORTAL_CONTENT[locale];
  useDocumentLocale(content.document);

  const selectLocale = (next: PortalLocale) => {
    setLocale(next);
    storeLocale(next);
  };

  // Until the first measurement lands, assume the widest arrangement: it is
  // the one a page-owning template almost always gets, and it reflows down in
  // the same frame as the measurement rather than flashing a wider layout.
  const columns =
    surfaceWidth === 0 || surfaceWidth >= THREE_COLUMN_SURFACE
      ? 3
      : surfaceWidth >= TWO_COLUMN_SURFACE
        ? 2
        : 1;
  const isNarrow = surfaceWidth > 0 && surfaceWidth < NARROW_SURFACE;

  const newsWell = (
    <VStack gap={2}>
      <NewsModule topic={topic} onTopicChange={setTopic} isNarrow={isNarrow} />
      <FeatureModule />
      <QuestionModule />
      <NoticeModule />
      <KeywordModule />
    </VStack>
  );

  const rail = (
    <VStack gap={2}>
      <RailModules board={board} onBoardChange={setBoard} />
    </VStack>
  );

  return (
    // Two providers, one for each half of what "this page is in Japanese"
    // means. `InternationalizationProvider` settles the strings that come from
    // inside Astryx; `PortalContentContext` carries the edition every module
    // below reads its own copy from. Neither is a `Theme` — the page still
    // brings no visual opinion of its own, and a host that has already mounted
    // either provider simply wins over this one inside its own subtree.
    <InternationalizationProvider
      locale={content.document.lang}
      messages={ASTRYX_MESSAGES}>
      <PortalContentContext value={content}>
        <Layout
          ref={surfaceRef}
          // `auto`, not the default `fill`: a portal home is a document, and the
          // masthead here is three stacked rows deep. Pinning it would spend a
          // fifth of a laptop screen on chrome that scrolls out of the way on
          // every real portal, and on a phone it would leave the news module
          // reading through a letterbox.
          height="auto"
          header={
            // No `hasDivider`: the masthead's last row is a centred pair of promo
            // links, and a rule directly under them reads as an underline for those
            // two links rather than as the end of the header. The header already
            // ends where the column grids begin. See the `layout-header` note in
            // the theme, which drops the matching border for the same reason.
            //
            // `paddingBlockEnd={0}` docks that promo row on the header's bottom
            // edge. Without it the row is spaced by 8px above (the masthead's own
            // stack gap) and 16px below (the header's bottom padding plus the
            // content's top padding), so the run of links floats low and reads as
            // belonging to the columns underneath rather than to the masthead.
            // Ceding the edge to `LayoutContent`'s padding leaves one 8px step on
            // each side, which is the gap every other row of the masthead uses.
            <LayoutHeader
              padding={2}
              paddingBlockEnd={0}
              label={content.landmarks.header}>
              <Masthead
                isNarrow={isNarrow}
                locale={locale}
                onLocaleChange={selectLocale}
              />
            </LayoutHeader>
          }
          content={
            <LayoutContent padding={2} label={content.landmarks.content}>
              {columns === 3 ? (
                <HStack gap={2} align="start">
                  <VStack gap={2} width={DIRECTORY_WIDTH}>
                    <ServiceDirectory layout="rail" />
                    <EventModule />
                  </VStack>
                  <StackItem size="fill">{newsWell}</StackItem>
                  <VStack width={RAIL_WIDTH}>{rail}</VStack>
                </HStack>
              ) : columns === 2 ? (
                <VStack gap={2}>
                  <ServiceDirectory layout="band" />
                  <HStack gap={2} align="start">
                    <StackItem size="fill">{newsWell}</StackItem>
                    <VStack gap={2} width={RAIL_WIDTH}>
                      {rail}
                      <EventModule />
                    </VStack>
                  </HStack>
                </VStack>
              ) : (
                <VStack gap={2}>
                  <ServiceDirectory layout="band" />
                  {newsWell}
                  {rail}
                  <EventModule />
                </VStack>
              )}
            </LayoutContent>
          }
          footer={
            <LayoutFooter
              padding={2}
              hasDivider
              label={content.landmarks.footer}>
              <PortalFooter />
            </LayoutFooter>
          }
        />
      </PortalContentContext>
    </InternationalizationProvider>
  );
}
