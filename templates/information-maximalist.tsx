// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * Information Maximalist — a portal home page that puts everything above the
 * fold.
 *
 * The model is the East Asian web portal, and the composition is what makes it
 * one: a bounded sheet, a two-row masthead over a tinted search well, then
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
 * All content is fictional and all figures are fixtures: no clocks, no
 * randomness, no fetching, so the preview and any screenshot of it are
 * byte-stable. Links are inert (`#`).
 *
 * This file is content and composition only. It declares no colours, no px
 * literals and no class names, and it does not import or mount a `Theme` — the
 * host chooses what to render it in. Everything visual it relies on (the type
 * scale, the hairlines, the tinted utility surface, the tab trough, the bounded
 * centred shell) comes from theme tokens and theming targets, which is what
 * lets the same composition be re-skinned without touching this file.
 */

import {Fragment, useLayoutEffect, useRef, useState} from 'react';
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
import {
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {ScrollableArea} from '@astryxdesign/core/ScrollableArea';
import {HStack, StackItem, VStack} from '@astryxdesign/core/Stack';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {Heading, Text} from '@astryxdesign/core/Text';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {VisuallyHidden} from '@astryxdesign/core/VisuallyHidden';
import type {IconType} from '@astryxdesign/core/Icon';
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
// Fixtures
//
// アストリクス is an invented site for the invented city of 潮見; every name,
// headline, figure, source and date below is fictional.
// =============================================================================

/** The thin utility strip above the masthead. */
const UTILITY_LINKS: readonly string[] = [
  'ホームに設定',
  'こども向け',
  'アプリ',
  'ヘルプ',
];

interface ShortcutTile {
  label: string;
  icon: IconType;
}

/** Icon shortcuts flanking the wordmark, three to a side. */
const MASTHEAD_START: readonly ShortcutTile[] = [
  {label: 'ショッピング', icon: BuildingStorefrontIcon},
  {label: 'オークション', icon: TagIcon},
  {label: 'フリマ', icon: GiftIcon},
];

const MASTHEAD_END: readonly ShortcutTile[] = [
  {label: 'トラベル', icon: PaperAirplaneIcon},
  {label: 'カード', icon: CreditCardIcon},
  {label: 'メール', icon: EnvelopeIcon},
];

/** Search scopes. The first is the active one. */
const SEARCH_SCOPES: readonly string[] = [
  'ウェブ',
  '画像',
  '動画',
  '地図',
  'ニュース',
  '辞典',
  '一覧',
];

/** The two announcement links under the search well. */
const PROMO_LINKS: readonly string[] = [
  '秋の交通ダイヤ改正まとめ',
  'メール障害のお知らせと復旧状況',
];

/** The service directory rail — a portal's whole surface area, spelled out. */
const SERVICE_DIRECTORY: readonly ShortcutTile[] = [
  {label: 'ショッピング', icon: BuildingStorefrontIcon},
  {label: 'オークション', icon: TagIcon},
  {label: 'フリマ', icon: GiftIcon},
  {label: 'トラベル', icon: PaperAirplaneIcon},
  {label: 'グルメ', icon: CakeIcon},
  {label: 'ふるさと納税', icon: HomeModernIcon},
  {label: '宅配', icon: TruckIcon},
  {label: 'ニュース', icon: NewspaperIcon},
  {label: '天気・災害', icon: CloudIcon},
  {label: 'スポーツ', icon: TrophyIcon},
  {label: 'ファイナンス', icon: BanknotesIcon},
  {label: '番組表', icon: TvIcon},
  {label: 'みんなの質問', icon: ChatBubbleLeftEllipsisIcon},
  {label: '地図', icon: MapIcon},
  {label: '求人', icon: BriefcaseIcon},
  {label: 'ゲーム', icon: PuzzlePieceIcon},
  {label: '電子書籍', icon: BookOpenIcon},
  {label: 'カレンダー', icon: CalendarDaysIcon},
];

interface Headline {
  title: string;
  /** Comment count. Rendered as an alert chip once it runs into four figures. */
  comments: number;
  /** Optional status flag: NEW for new, 速報 for breaking. */
  flag?: {label: string; tone: 'new' | 'breaking'};
}

interface NewsFeed {
  /** Stamp above the list, in the portal's usual 月/日(曜) 時:分 form. */
  updated: string;
  headlines: readonly Headline[];
  /** The module's single focal image. */
  focal: {
    caption: string;
    stamp: string;
    source: string;
    image: string;
    alt: string;
  };
}

const NEWS_TABS: readonly {id: string; label: string}[] = [
  {id: 'main', label: '主要'},
  {id: 'domestic', label: '国内'},
  {id: 'world', label: '国際'},
  {id: 'economy', label: '経済'},
  {id: 'tech', label: 'IT・科学'},
  {id: 'sports', label: 'スポーツ'},
  {id: 'life', label: '暮らし'},
  {id: 'local', label: '地域'},
];

const NEWS_FEEDS: Record<string, NewsFeed> = {
  main: {
    updated: '9/17(木) 6:30更新',
    headlines: [
      {
        title: '深夜バス14便を増発 通勤実態調査うけ',
        comments: 238,
        flag: {label: 'NEW', tone: 'new'},
      },
      {title: '野菜の値下がり3カ月連続 供給が回復', comments: 176},
      {title: '海水冷却で消費電力31%減 実証実験おわる', comments: 87},
      {
        title: '高架橋の補修が完了 予定より9週間早く',
        comments: 41,
        flag: {label: 'NEW', tone: 'new'},
      },
      {title: '木曜夕方から内陸で大雨のおそれ 気象台', comments: 512},
      {title: '秋季代表23人を発表 初選出は2人', comments: 1240},
      {
        title: '空き家改修の助成 申請受付をきょう開始',
        comments: 63,
        flag: {label: 'NEW', tone: 'new'},
      },
      {title: '宅配の時間帯的中率 公表を各社に要請', comments: 95},
    ],
    focal: {
      caption: '夜間の整備ヤードで',
      stamp: '9/16(水) 18:20',
      source: 'みなと通信',
      image: '/template-assets/moody-working-horizontal-1.png',
      alt: '夜間の鉄道ホームで保線作業にあたる作業員',
    },
  },
  domestic: {
    updated: '9/17(木) 6:24更新',
    headlines: [
      {
        title: '空き家改修の助成 3000世帯を上限に受付',
        comments: 148,
        flag: {label: 'NEW', tone: 'new'},
      },
      {title: '学校給食の無償化 4月から2地区に拡大', comments: 96},
      {title: '深夜バス88系統が本格運行へ 9カ月の試行おわる', comments: 58},
      {title: 'インフルエンザ予防接種 65歳以上の予約開始', comments: 33},
      {title: '市民マラソンの抽選 14万2000人が応募', comments: 271},
      {title: '沿岸風力の環境審査が終了 着工は来春', comments: 149},
      {title: '図書館の延滞料 児童書で廃止へ', comments: 24},
      {title: '県営住宅の家賃減免 申請書類を簡素化', comments: 37},
    ],
    focal: {
      caption: '静かな住宅地の一角',
      stamp: '9/16(水) 15:40',
      source: '潮見タイムズ',
      image: '/template-assets/light-home-horizontal-1.png',
      alt: '低層の住宅がならぶ静かな通り',
    },
  },
  world: {
    updated: '9/17(木) 6:18更新',
    headlines: [
      {
        title: '港湾ストが終結 人員確保の保証で合意',
        comments: 204,
        flag: {label: '速報', tone: 'breaking'},
      },
      {title: 'コンテナ滞留 11日で解消の見通し', comments: 77},
      {title: '越境鉄道が有料運行1カ月 利用は想定の8割', comments: 61},
      {title: '東部流域の干ばつ警戒度を1段引き下げ', comments: 45},
      {title: '中央銀行が金利を据え置き 成長見通しは下方修正', comments: 302},
      {title: '小麦の輸出見通し 2期連続で上方修正', comments: 58},
      {title: '2都市が広場の暑さ対策で共同計画に署名', comments: 38},
      {title: '海底ケーブルの修復完了 予定より1週間早く', comments: 112},
    ],
    focal: {
      caption: '稼働がもどった埠頭',
      stamp: '9/16(水) 20:05',
      source: '北町ポスト',
      image: '/template-assets/moody-scene-horizontal-2.png',
      alt: '稼働する港のコンテナクレーン',
    },
  },
  economy: {
    updated: '9/17(木) 6:12更新',
    headlines: [
      {
        title: '食品チェーンが加盟店210店を買収 二重価格を解消',
        comments: 186,
        flag: {label: 'NEW', tone: 'new'},
      },
      {title: '宅配大手が黒字転換 3年ぶり', comments: 54},
      {title: '地銀が12支店を再開 2年前の閉鎖分', comments: 89},
      {title: '潮見便に2便目を増設 航空会社が発表', comments: 27},
      {title: '半導体後工程に600億円 内陸2工場目', comments: 163},
      {title: '小売の最低賃金4.1%上げ 業種協定で妥結', comments: 341},
      {title: '電気料金の還付 冬の請求期間まで延長', comments: 205},
      {title: '長期金利が小幅上昇 3カ月ごとの調整観測で', comments: 118},
    ],
    focal: {
      caption: '棚の補充がすすむ売り場',
      stamp: '9/16(水) 17:10',
      source: '台帳経済',
      image: '/template-assets/light-working-horizontal-2.png',
      alt: 'スーパーマーケットの棚を補充する従業員',
    },
  },
  tech: {
    updated: '9/17(木) 6:06更新',
    headlines: [
      {
        title: '海水冷却でデータホールの電力31%減 実証で',
        comments: 141,
        flag: {label: 'NEW', tone: 'new'},
      },
      {title: '交通アプリがオフライン時刻表に対応', comments: 71},
      {title: '公開気象データに沿岸40年分を追加', comments: 46},
      {title: '端末メーカーが7年間の更新提供を約束', comments: 258},
      {title: '遅延予測モデルを公開 鉄道事業者', comments: 134},
      {title: 'ストレージ価格 4期連続で下落', comments: 63},
      {title: '2大学がキャンパス網の試験環境を共用', comments: 19},
      {title: '観測衛星の小型化 打ち上げ費用は3割減', comments: 88},
    ],
    focal: {
      caption: '冷却配管の点検',
      stamp: '9/16(水) 16:45',
      source: '北町ポスト',
      image: '/template-assets/colorful-working-horizontal-2.png',
      alt: 'サーバー室で冷却配管を点検する技術者',
    },
  },
  sports: {
    updated: '9/17(木) 6:00更新',
    headlines: [
      {
        title: '潮見が2-1で逃げきる アウェー4連勝',
        comments: 486,
        flag: {label: '速報', tone: 'breaking'},
      },
      {title: '秋季代表23人 ベテラン2人が落選', comments: 1240},
      {title: '200m自由形で0.34秒短縮 記録更新', comments: 92},
      {title: 'マラソン経路を変更 高架橋工事を回避', comments: 57},
      {title: '来季から26チーム制を承認 リーグ理事会', comments: 613},
      {title: '山岳ステージで41kmの独走 単独首位', comments: 88},
      {title: 'センターと2年契約 バスケ潮見', comments: 44},
      {title: '女子駅伝の区間編成を見直し 全6区に', comments: 76},
    ],
    focal: {
      caption: 'スタンドの歓声',
      stamp: '9/16(水) 21:30',
      source: 'サイドライン',
      image: '/template-assets/colorful-lifestyle-horizontal-1.png',
      alt: 'スタジアムのスタンドで歓声をあげるサポーター',
    },
  },
  life: {
    updated: '9/17(木) 5:54更新',
    headlines: [
      {
        title: '9リットルの備蓄棚 ひとり分を無駄なく',
        comments: 64,
        flag: {label: 'NEW', tone: 'new'},
      },
      {title: '難しい一角は最後に植える 庭づくりの順番', comments: 36},
      {title: '1日乗車券で行ける小さな山歩き5選', comments: 74},
      {title: '時間指定をやめた美術館で起きたこと', comments: 51},
      {title: '交代勤務の睡眠 平易な手引きを公開', comments: 118},
      {title: '年間1900個のやかんを直した修理喫茶', comments: 82},
      {title: '長い通勤のための読書リスト 運転士が選ぶ', comments: 29},
      {title: '2平方メートルの台所 収納の考え方', comments: 47},
    ],
    focal: {
      caption: '台所の作業台で',
      stamp: '9/16(水) 14:00',
      source: 'みなと生活',
      image: '/template-assets/matcha-product-3.png',
      alt: '木の作業台にならべられた保存食材',
    },
  },
  local: {
    updated: '9/17(木) 5:48更新',
    headlines: [
      {
        title: '潮見区で給水管の切替工事 22日未明',
        comments: 31,
        flag: {label: 'NEW', tone: 'new'},
      },
      {title: '北町の踏切を立体交差化 説明会は28日', comments: 58},
      {title: '市民ホールの改修 来年3月まで休館', comments: 44},
      {title: '海岸清掃の参加者を募集 定員300人', comments: 12},
      {title: '区役所の窓口 土曜開庁を月2回に', comments: 67},
      {title: '古紙回収の日程 10月から第2・第4火曜へ', comments: 23},
      {title: '公園の遊具を入れ替え 5カ所で順次', comments: 19},
      {title: '防災無線の試験放送 19日正午', comments: 26},
    ],
    focal: {
      caption: '区役所前の歩道',
      stamp: '9/16(水) 13:15',
      source: '潮見タイムズ',
      image: '/template-assets/building.png',
      alt: '外壁に設備がならぶ集合住宅',
    },
  },
};

/** The 特集 module: one focal image, then text links. */
const FEATURE_LEAD = {
  title: 'パン屋で終わる散歩道、六つ',
  body: '坂と水路をたどって、最後に焼きたてに行きあたる道を選びました。いずれも駅から歩いて始められます。',
  meta: '週末 · 読了8分',
  image: '/template-assets/light-lifestyle-horizontal-1.png',
  alt: '街角のパン屋の前で休む自転車',
};

const FEATURE_LINKS: readonly {title: string; meta: string}[] = [
  {title: '新しい冷房規則は借主に何をもたらすか', meta: '解説 · 読了5分'},
  {title: '2平方メートルのために設計された台所', meta: '住まい · 読了6分'},
  {title: '列車を動かしつづける夜勤の現場', meta: '写真 · 読了12分'},
  {title: '値段の話をやめた商店街はどうなったか', meta: '経済 · 読了9分'},
  {title: '古い高架下をどう使うか、五つの答え', meta: '都市 · 読了7分'},
];

/** 地域のお知らせ: a two-column run of pure text links, no imagery at all. */
const LOCAL_NOTICES: readonly string[] = [
  '粗大ごみの申込みが電話からWEBに',
  '住民票のコンビニ交付 手数料を改定',
  '区民プールの改修工事は10月20日から',
  '巡回図書館の停車地を2カ所追加',
  '保育所の入所申請 受付は11月4日まで',
  '検診バスの日程を区の広報に掲載',
  '駐輪場の定期利用 抽選結果は25日',
  '街路樹の剪定 12月まで順次実施',
];

/** みんなの質問: community threads, carrying an answer count instead of a date. */
const QA_THREADS: readonly {title: string; answers: number; isOpen: boolean}[] =
  [
    {
      title: '深夜バスの定期券は増発分にも使えますか',
      answers: 14,
      isOpen: true,
    },
    {
      title: '空き家助成、名義が親のままでも申請できる？',
      answers: 9,
      isOpen: true,
    },
    {
      title: '高架橋の補修後、騒音は本当に減りましたか',
      answers: 23,
      isOpen: false,
    },
    {title: '区民プール休館中に使える近隣の施設は', answers: 6, isOpen: true},
    {
      title: '宅配の時間帯指定、実際どのくらい当たる？',
      answers: 41,
      isOpen: false,
    },
    {
      title: '粗大ごみのWEB申込み、受付番号はどこに届く',
      answers: 3,
      isOpen: true,
    },
  ];

/** 話題のキーワード: ranked search terms — the densest module on the page. */
const TRENDING_KEYWORDS: readonly string[] = [
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
];

/** 今週のイベント: three dated local listings, sized for the directory rail. */
const EVENTS: readonly {date: string; title: string; place: string}[] = [
  {date: '9/19(土)', title: '潮見港あさ市', place: '第3埠頭'},
  {date: '9/20(日)', title: '北町たそがれ演奏会', place: '市民ホール前'},
  {date: '9/23(水)', title: '古本と珈琲の日', place: '高架下商店街'},
];

/** The sign-in module's three shortcuts. */
const SIGNIN_SHORTCUTS: readonly ShortcutTile[] = [
  {label: 'メール', icon: EnvelopeIcon},
  {label: '毎日のくじ', icon: GiftIcon},
  {label: '残高を確認', icon: CreditCardIcon},
];

interface DayForecast {
  /**
   * The day this column is for.
   *
   * Bare 今日/明日 rather than 今日の天気: the module header already says both
   * the date and the ward, so repeating 天気 in each column head spends the
   * comparison's narrowest measure restating what the frame states once.
   */
  label: string;
  icon: IconType;
  summary: string;
  high: string;
  low: string;
  rain: string;
}

const FORECAST: readonly DayForecast[] = [
  {
    label: '今日',
    icon: CloudIcon,
    summary: 'くもり 一時雨',
    high: '24℃',
    low: '19℃',
    rain: '60%',
  },
  {
    label: '明日',
    icon: SunIcon,
    summary: 'くもり のち晴れ',
    high: '23℃',
    low: '19℃',
    rain: '50%',
  },
];

interface MarketRow {
  name: string;
  value: string;
  change: string;
  isUp: boolean;
}

const MARKETS: readonly MarketRow[] = [
  {name: '潮見総合225', value: '38,942.16', change: '+0.84%', isUp: true},
  {name: '広域500', value: '2,714.08', change: '+0.31%', isUp: true},
  {name: 'テック100', value: '17,308.55', change: '−0.62%', isUp: false},
  {name: 'みなとREIT', value: '1,986.20', change: '+0.11%', isUp: true},
  {name: '金 現物', value: '2,388.40', change: '−0.25%', isUp: false},
  {name: '原油', value: '79.18', change: '+1.42%', isUp: true},
];

interface RankEntry {
  title: string;
  metric: string;
}

const RANKING_TABS: readonly {id: string; label: string}[] = [
  {id: 'read', label: '読まれた'},
  {id: 'shared', label: '共有'},
  {id: 'discussed', label: 'コメント'},
];

const RANKINGS: Record<string, readonly RankEntry[]> = {
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
};

/** The rail's single focal image — a house promotion, not a third-party ad. */
const RAIL_FEATURE = {
  title: '潮見の宿 秋の連泊プラン',
  body: '海沿いの14軒を、連泊の料金と送迎の有無でくらべられるようにしました。',
  cta: 'プランを見る',
  image: '/template-assets/light-home-square-1.png',
  alt: '海に面した宿の客室からの眺め',
};

const FOOTER_LINKS: readonly string[] = [
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
];

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
 * with the glyph and the figure hidden, so the row's name ends
 * "…コメント312件" rather than a bare "312" whose unit only the icon carried.
 * The words cannot ride on the icon: a `@heroicons` component ships its own
 * `aria-hidden` on the `<svg>`, which outranks the `role="img"` and label
 * `Icon` derives from `label`, so that label never reaches the tree.
 */
function CommentCount({count}: {count: number}) {
  const label = `コメント${count}件`;

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
function HeadlineMeta({headline}: {headline: Headline}) {
  return (
    <ArticleMeta>
      {headline.flag !== undefined &&
        (headline.flag.tone === 'breaking' ? (
          <Badge variant="error" label={headline.flag.label} />
        ) : (
          <Badge variant="warning" label={headline.flag.label} />
        ))}
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
 * is マーケット, whose rows are three separate figures rather than a sentence.
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
// - **主要/国内/… (`NewsModule`)** — the news feed, and the page's lede. It
//   takes the same row at the same body size as the rest: what marks it as the
//   lede is its place at the top of the main column, not larger type.
// - **特集・コラム (`FeatureModule`)** — the editorial run under the module's
//   lead piece. Its section-and-reading-time metadata rides in the row's
//   `ArticleMeta` island, exactly as the news row's flag and comment count do.
// - **地域のお知らせ (`NoticeModule`)**, both columns — municipal notices. No
//   desk and no byline, but a ward notice is still a sentence you click to go
//   and read, which is what the row is for; the rows differ from the news feed
//   only in carrying no metadata.
// - **みんなの質問 (`QuestionModule`)** — reader threads. A question is a
//   sentence you open, and its 受付中 flag and answer count are the same kind
//   of marks as a news row's flag and comment count, so they ride in the same
//   island inside the same anchor.
// - **アクセスランキング (`RankingModule`)** — articles, ranked. The ordinal is
//   information, so the row keeps the `<ol>`'s decimal marker in place of the
//   bullet (`marker="ordinal"`); everything else about it is the standard row,
//   with the page-view figure moved off the row's far end and into the island
//   so the anchor is unbroken.
//
// The rest of the page's link runs are not headline rows, and keep their own:
//
// - **今週のイベント (`EventModule`)** — dated listings, and the closest call
//   here. What a reader wants from the row is *when*, so the date leads a line
//   of its own and the three rows align on it; folding it in beside the title
//   the way an article row folds in a flag would cost that alignment and, in a
//   188px rail, wrap it under the title anyway. The rows carry no plate and no
//   row interaction to begin with — the title is a plain link, so hovering it
//   underlines the title and nothing else, which is the same affordance the
//   article rows carry.
//
// - **サービス一覧 (`ServiceDirectory`)** — navigation, not reading. Each row
//   is a service's name beside its icon, so the destination is the row and the
//   affordance is the icon-and-label pair, not an underlined sentence.
// - **マーケット (`MarketModule`)** — a quote readout: a direction arrow, an
//   instrument, a level, a change. Three separate cells, no sentence, so the
//   row keeps Astryx's interactive `ListItem` — with a row this heterogeneous
//   the hover plate is what says the *row* is one target, where on a headline
//   row the underline says it better and a plate says it wrongly.
// - **話題のキーワード (`KeywordModule`)** — search terms. Each is a query, not
//   a piece of writing, and the rank number is what separates them, so they
//   wrap rather than list.
// - The masthead's promo links, the footer's link run, the rail promo
//   (`RailFeature`), 質問してみる and each module's もっと見る / 一覧 links —
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
function ServiceRow({service}: {service: ShortcutTile}) {
  return (
    <HStack gap={1.5} align="center">
      <Icon icon={service.icon} size="sm" color="accent" />
      <Link href="#" size="sm" maxLines={1}>
        {service.label}
      </Link>
    </HStack>
  );
}

/** A masthead / sign-in shortcut: glyph over label, sized for a 12px caption. */
function ShortcutButton({
  shortcut,
  canWrap = false,
}: {
  shortcut: ShortcutTile;
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
        <Icon icon={shortcut.icon} size="lg" color="accent" />
        <Text
          size="xsm"
          color="inherit"
          justify="center"
          maxLines={canWrap ? 0 : 1}>
          {shortcut.label}
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

function UtilityBar() {
  return (
    <HStack gap={2} align="center" justify="between" wrap="wrap">
      <Link href="#" size="xsm" color="secondary" maxLines={1}>
        駅の待合室に本棚が増えている理由
      </Link>
      <HStack gap={1.5} align="stretch">
        {UTILITY_LINKS.map((link, index) => (
          <Fragment key={link}>
            {index > 0 && <Divider orientation="vertical" />}
            <Link href="#" size="xsm" color="secondary" maxLines={1}>
              {link}
            </Link>
          </Fragment>
        ))}
      </HStack>
    </HStack>
  );
}

function Masthead({isNarrow}: {isNarrow: boolean}) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState(SEARCH_SCOPES[0]);

  /**
   * The mark and the wordmark, as one object.
   *
   * `alt=""` is deliberate and is the accessible treatment the pair needs: the
   * mark and the `<h1>` beside it say the same thing, so naming the image would
   * put "アストリクス" into the tree twice and make a reader hear the site's
   * name, then hear it again. Decorated out, the heading is the one name — and
   * because it is an `<h1>`, the name is still the first thing a reader reaches.
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
        アストリクス
      </Heading>
    </HStack>
  );

  const shortcutRow = (side: readonly ShortcutTile[]) => (
    <HStack gap={4} align="start">
      {side.map(shortcut => (
        <ShortcutButton key={shortcut.label} shortcut={shortcut} />
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
      {SEARCH_SCOPES.map(entry => (
        <Link
          key={entry}
          href="#"
          size="sm"
          color={entry === scope ? 'primary' : 'accent'}
          weight={entry === scope ? 'bold' : 'normal'}
          onClick={() => setScope(entry)}
          aria-current={entry === scope ? 'true' : undefined}>
          {entry}
        </Link>
      ))}
    </HStack>
  );

  const searchWell = (
    <Card variant="muted" padding={2}>
      <VStack gap={1.5}>
        {isNarrow ? (
          <ScrollableArea axis="inline" label="検索の種類">
            {scopeRun}
          </ScrollableArea>
        ) : (
          scopeRun
        )}
        <HStack gap={1} align="center">
          <StackItem size="fill">
            <TextInput
              label="キーワードで検索"
              isLabelHidden
              placeholder="キーワードを入力"
              value={query}
              onChange={setQuery}
              hasClear
              width="100%"
            />
          </StackItem>
          <Button
            label="検索"
            variant="primary"
            icon={<Icon icon={MagnifyingGlassIcon} size="sm" />}
          />
        </HStack>
      </VStack>
    </Card>
  );

  const promoRun = (
    <HStack gap={4} align="center" justify="center" wrap="wrap">
      {PROMO_LINKS.map(promo => (
        <Link key={promo} href="#" size="sm" maxLines={1}>
          » {promo}
        </Link>
      ))}
    </HStack>
  );

  const accountActions = (
    <HStack gap={0.5} align="center">
      <IconButton
        label="メール 未読3件"
        icon={<Icon icon={EnvelopeIcon} size="md" />}
        variant="ghost"
      />
      <IconButton
        label="お知らせ 未読5件"
        icon={<Icon icon={BellIcon} size="md" />}
        variant="ghost"
      />
      <IconButton
        label="メニューとアカウント"
        icon={<Icon icon={Bars3Icon} size="md" />}
        variant="ghost"
      />
    </HStack>
  );

  return (
    <VStack gap={2}>
      <UtilityBar />
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
  if (layout === 'band') {
    return (
      <Card variant="muted" padding={2}>
        <VStack gap={1.5}>
          <Heading level={3}>サービス一覧</Heading>
          <Divider isFullBleed />
          <Grid columns={{minWidth: 148}} gap={1.5}>
            {SERVICE_DIRECTORY.map(service => (
              <ServiceRow key={service.label} service={service} />
            ))}
          </Grid>
        </VStack>
      </Card>
    );
  }

  return (
    <Card variant="muted" padding={2}>
      <VStack gap={1.5} as="nav" aria-label="サービス一覧">
        {SERVICE_DIRECTORY.map(service => (
          <ServiceRow key={service.label} service={service} />
        ))}
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
  topic: string;
  onTopicChange: (next: string) => void;
  isNarrow: boolean;
}) {
  const active = NEWS_TABS.find(entry => entry.id === topic) ?? NEWS_TABS[0];
  const feed = NEWS_FEEDS[active.id];

  const headlines = (
    <VStack gap={1.5}>
      <Text type="supporting">{feed.updated}</Text>
      <ArticleList>
        {feed.headlines.map(headline => (
          <ArticleRow
            key={headline.title}
            title={headline.title}
            meta={<HeadlineMeta headline={headline} />}
          />
        ))}
      </ArticleList>
      <HStack gap={4} align="center">
        <Link href="#" size="sm">
          もっと見る
        </Link>
        <Link href="#" size="sm">
          ニュース一覧
        </Link>
      </HStack>
    </VStack>
  );

  const focal = (
    <VStack gap={1} width={isNarrow ? undefined : 156}>
      <AspectRatio ratio={4 / 3} fit="cover">
        <img src={feed.focal.image} alt={feed.focal.alt} />
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
          onChange={onTopicChange}
          size="sm"
          aria-label="ニュースの分野"
          hasDivider
          isFullBleed
          overflow="scroll">
          {NEWS_TABS.map(entry => (
            <Tab key={entry.id} value={entry.id} label={entry.label} />
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

/** 特集: the one module that leads with a picture, then falls back to links. */
function FeatureModule() {
  return (
    <Module title="特集・コラム" moreLabel="特集一覧">
      <VStack gap={2}>
        <HStack gap={2} align="start">
          <VStack gap={1} width={136}>
            <AspectRatio ratio={4 / 3} fit="cover">
              <img src={FEATURE_LEAD.image} alt={FEATURE_LEAD.alt} />
            </AspectRatio>
          </VStack>
          <StackItem size="fill">
            <VStack gap={0.5}>
              <Link href="#" size="lg" weight="bold" maxLines={2}>
                {FEATURE_LEAD.title}
              </Link>
              <Text size="sm" color="secondary" maxLines={2}>
                {FEATURE_LEAD.body}
              </Text>
              <Text type="supporting">{FEATURE_LEAD.meta}</Text>
            </VStack>
          </StackItem>
        </HStack>
        <Divider isFullBleed />
        {/* Genuine editorial pieces, so the same row the news feed uses — at
            body size, which is every article list but the lede. The section and
            reading time ride inside the row's anchor as its metadata, the way
            the news row carries its flag and comment count. */}
        <ArticleList>
          {FEATURE_LINKS.map(feature => (
            <ArticleRow
              key={feature.title}
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
 * 地域のお知らせ: pure text, two columns, no imagery and no metadata.
 *
 * A ward notice has no desk and no byline, but it is still a sentence a reader
 * clicks to go and read it, so the rows are the page's article rows — the bare
 * case of them, with nothing trailing the headline.
 */
function NoticeModule() {
  return (
    <Module title="地域のお知らせ" moreLabel="潮見区の一覧">
      {/* Two lists rather than one two-column list: a `<ul>` cannot flow its
          own rows into columns without a multi-column ancestor, which would
          also break the rows' anchors across column boundaries. */}
      <Grid columns={{minWidth: 232, max: 2}} gap={1.5}>
        <ArticleList>
          {LOCAL_NOTICES.slice(0, 4).map(notice => (
            <ArticleRow key={notice} title={notice} />
          ))}
        </ArticleList>
        <ArticleList>
          {LOCAL_NOTICES.slice(4).map(notice => (
            <ArticleRow key={notice} title={notice} />
          ))}
        </ArticleList>
      </Grid>
    </Module>
  );
}

/**
 * みんなの質問: community threads.
 *
 * A question is a sentence a reader opens, so the rows are the page's article
 * rows. The answer count replaces the comment count as the module's one figure,
 * and the 受付中 flag is the only other mark on the row — a question with no
 * answer yet is the one a reader can act on, so it is worth a flag where "asked
 * three days ago" is not. Both ride in the row's `ArticleMeta` island, the way
 * a news row carries its flag and count.
 */
function QuestionModule() {
  return (
    <Module title="みんなの質問" moreLabel="質問一覧">
      <VStack gap={1.5}>
        <ArticleList>
          {QA_THREADS.map(thread => (
            <ArticleRow
              key={thread.title}
              title={thread.title}
              meta={
                <ArticleMeta>
                  {thread.isOpen && <Badge variant="info" label="受付中" />}
                  <Text size="xsm" color="secondary" hasTabularNumbers>
                    回答{thread.answers}
                  </Text>
                </ArticleMeta>
              }
            />
          ))}
        </ArticleList>
        <HStack gap={4} align="center">
          <Link href="#" size="sm">
            質問してみる
          </Link>
          <Link href="#" size="sm">
            回答を待っている質問
          </Link>
        </HStack>
      </VStack>
    </Module>
  );
}

/**
 * 話題のキーワード: ranked search terms, wrapped rather than listed.
 *
 * Twelve entries in three lines is the highest link density on the page, and it
 * only works because the rank number does the separating — wrapping a run of
 * bare links would leave a reader unable to tell where one ends and the next
 * begins once two terms share a line.
 */
function KeywordModule() {
  return (
    <Module title="話題のキーワード" moreLabel="検索ランキング">
      <VStack gap={1.5}>
        <HStack gap={3} align="center" wrap="wrap">
          {TRENDING_KEYWORDS.map((keyword, index) => (
            <HStack key={keyword} gap={1} align="center">
              <Text size="xsm" color="secondary" hasTabularNumbers>
                {index + 1}
              </Text>
              <Link href="#" size="sm">
                {keyword}
              </Link>
            </HStack>
          ))}
        </HStack>
        <Text type="supporting">9/17(木) 6:30時点の検索数にもとづきます</Text>
      </VStack>
    </Module>
  );
}

/**
 * 今週のイベント: three dated listings, narrow enough for the directory rail.
 *
 * Its whole job is to give the directory column something below it, because a
 * 188px rail runs out of links at about half the height of the news well. Dates
 * are tabular so the three rows align on one invisible column.
 */
function EventModule() {
  return (
    <Card padding={0}>
      <VStack gap={0}>
        <HStack gap={2} align="center" justify="between" padding={2}>
          <Heading level={3} maxLines={1}>
            今週のイベント
          </Heading>
        </HStack>
        <Divider isFullBleed />
        <VStack gap={1.5} padding={2}>
          {EVENTS.map(event => (
            <VStack key={event.title} gap={0}>
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
            イベント一覧
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
  return (
    <Card padding={0}>
      <VStack gap={0}>
        <AspectRatio ratio={16 / 9} fit="cover">
          <img src={RAIL_FEATURE.image} alt={RAIL_FEATURE.alt} />
        </AspectRatio>
        <Divider isFullBleed />
        <VStack gap={1} padding={2}>
          <Link href="#" size="sm" weight="bold" maxLines={2}>
            {RAIL_FEATURE.title}
          </Link>
          <Text type="supporting">{RAIL_FEATURE.body}</Text>
          <Link href="#" size="sm">
            {RAIL_FEATURE.cta}
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
  return (
    <Module
      title="ログイン"
      headerEnd={
        <HStack gap={1.5} align="center">
          <Link href="#" size="sm">
            ［新規登録］
          </Link>
          <Link href="#" size="xsm" color="secondary">
            登録情報
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
            <HStack key={shortcut.label} gap={0} align="stretch">
              {index > 0 && <Divider orientation="vertical" />}
              <StackItem size="fill">
                <VStack align="center">
                  <ShortcutButton shortcut={shortcut} canWrap />
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
 */
interface ForecastBand {
  /** Stable half of the cell key; the day supplies the other half. */
  id: string;
  render: (day: DayForecast) => ReactNode;
}

const FORECAST_BANDS: readonly ForecastBand[] = [
  {
    id: 'day',
    render: day => (
      <Text type="label" size="sm">
        {day.label}
      </Text>
    ),
  },
  {
    id: 'reading',
    // `align="center"` and no wrap: the glyph and the two figures are one
    // reading, and a band that wrapped would take its column's rows out of
    // step with the other day's.
    render: day => (
      <HStack gap={1.5} align="center">
        <Icon icon={day.icon} size="lg" color="accent" />
        <HStack gap={1} align="center">
          <Text size="lg" weight="bold" hasTabularNumbers>
            {day.high}
          </Text>
          <Text size="sm" color="secondary" hasTabularNumbers>
            {day.low}
          </Text>
        </HStack>
      </HStack>
    ),
  },
  {
    id: 'rain',
    render: day => (
      <Text type="supporting" hasTabularNumbers>
        降水 {day.rain}
      </Text>
    ),
  },
  {
    id: 'summary',
    render: day => <Text type="supporting">{day.summary}</Text>,
  },
];

/** Date, two days of forecast, and the day's heat advisory. */
function WeatherModule() {
  return (
    <Module
      title="2026年9月17日(木)"
      headerEnd={
        <Link href="#" size="sm">
          潮見区 ▾
        </Link>
      }>
      <VStack gap={2}>
        {/*
          Two fixed columns, filled band by band rather than column by column.

          The module is a comparison — the reason to look at it is 今日 against
          明日 — and a comparison only works if the two readings can be scanned
          across. Emitting a column at a time makes each column its own stack,
          so the bands only line up while both days happen to render to the same
          heights: a summary that wraps, a 気温 that loses a digit or an icon
          that changes metric all shear the other column's rows out of line.
          Emitting a band at a time puts both days' icons in one grid row, both
          temperatures in the next, and so on, so the rows are aligned by the
          grid itself and stay aligned whatever the fixtures say.

          `columns={2}` rather than the responsive `{minWidth, max: 2}` this
          module used before: row-major filling is only correct at exactly two
          tracks. Were the grid to collapse to one, the flow would read
          今日, 明日, then both icons, then both temperatures — the bands
          interleaved instead of stacked. Two columns stay legible all the way
          down to the 390px rail (each track still clears 150px, and the widest
          cell in the module is a four-character summary), so there is no width
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
              <Fragment key={`${band.id}-${day.label}`}>
                {band.render(day)}
              </Fragment>
            )),
          )}
        </Grid>
        <Divider isFullBleed />
        <HStack gap={1.5} align="center" justify="between" wrap="wrap">
          <HStack gap={1.5} align="center">
            <Text size="sm">熱中症指数</Text>
            <Badge variant="warning" label="注意" />
          </HStack>
          <Link href="#" size="sm">
            雨雲レーダー
          </Link>
        </HStack>
      </VStack>
    </Module>
  );
}

/** Index levels and their day change, as a ruled two-column run. */
function MarketModule() {
  return (
    <Module title="マーケット" moreLabel="ファイナンス">
      <VStack gap={1.5}>
        <List density="compact" hasDividers>
          {MARKETS.map(row => (
            <ListItem
              key={row.name}
              href="#"
              startContent={
                <Icon
                  icon={row.isUp ? ArrowTrendingUpIcon : ArrowTrendingDownIcon}
                  size="xsm"
                  color={row.isUp ? 'success' : 'error'}
                  label={row.isUp ? '上昇' : '下落'}
                />
              }
              label={
                <Text size="sm" color="accent" maxLines={1}>
                  {row.name}
                </Text>
              }
              endContent={
                <HStack gap={1} align="center">
                  <Text size="sm" weight="medium" hasTabularNumbers>
                    {row.value}
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
        <Text type="supporting">6:30現在 · 20分遅れの値です</Text>
      </VStack>
    </Module>
  );
}

/** Access rankings, switched by a tab trough like the news module's. */
function RankingModule({
  board,
  onBoardChange,
}: {
  board: string;
  onBoardChange: (next: string) => void;
}) {
  const active = RANKING_TABS.find(tab => tab.id === board) ?? RANKING_TABS[0];
  const entries = RANKINGS[active.id];

  return (
    <Card padding={0}>
      <VStack gap={0}>
        <HStack gap={2} align="center" justify="between" padding={2}>
          <Heading level={2} maxLines={1}>
            アクセスランキング
          </Heading>
          <Link href="#" size="sm">
            一覧
          </Link>
        </HStack>
        <TabList
          value={board}
          onChange={onBoardChange}
          size="sm"
          aria-label="ランキングの種類"
          hasDivider
          isFullBleed>
          {RANKING_TABS.map(tab => (
            <Tab key={tab.id} value={tab.id} label={tab.label} />
          ))}
        </TabList>
        <VStack gap={1.5} padding={2}>
          {/* Ranked articles are still articles, so the rows are the page's
              article rows with the `<ol>`'s ordinal standing in for the bullet.
              The page-view figure moves off the row's far end and into the
              headline's island: at the end of the row it sat outside the
              anchor, which left a gap in a row a reader reads as one target. */}
          <ArticleList isRanked>
            {entries.map(entry => (
              <ArticleRow
                key={entry.title}
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
          <Text type="supporting">直近24時間の集計です</Text>
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
  board: string;
  onBoardChange: (next: string) => void;
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
  return (
    <VStack gap={1.5}>
      <HStack gap={2} align="center" justify="center" wrap="wrap">
        {FOOTER_LINKS.map(link => (
          <Link key={link} href="#" size="xsm" color="secondary">
            {link}
          </Link>
        ))}
      </HStack>
      <HStack gap={2} align="center" justify="between" wrap="wrap">
        <Text type="supporting">
          © 2026 アストリクス · 記事は128の提携社から配信されています
        </Text>
        <HStack gap={1} align="center">
          <Icon icon={DevicePhoneMobileIcon} size="xsm" color="secondary" />
          <Link href="#" size="xsm" color="secondary">
            地域: 潮見区
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
  const [topic, setTopic] = useState('main');
  const [board, setBoard] = useState('read');

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
          label="アストリクス ヘッダー">
          <Masthead isNarrow={isNarrow} />
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={2} label="アストリクス ホーム">
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
        <LayoutFooter padding={2} hasDivider label="アストリクス フッター">
          <PortalFooter />
        </LayoutFooter>
      }
    />
  );
}
