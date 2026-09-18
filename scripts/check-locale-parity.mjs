// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Locale parity check for the Information Maximalist page template.
 *
 * The template's type declarations already carry most of this contract:
 * `PortalContent` keys every run by an id union or fixes it at a `Run<T, N>`
 * length, so a missing service, headline, quote row or ranking entry is a
 * compile error rather than something this script has to find. `pnpm run
 * typecheck` is the first half of locale parity and the cheaper half.
 *
 * What a type cannot say is checked here, by parsing the template rather than
 * running it — so the check costs nothing at runtime and ships no assertion
 * code to a consumer:
 *
 * 1. **The two editions are the same object twice.** Every property path and
 *    every array position in `JAPANESE_CONTENT` exists in `ENGLISH_CONTENT`
 *    and holds the same kind of value, and the reverse. This catches what the
 *    types allow: an optional property filled in on one side only, a nested
 *    literal the compiler widened, a string where the other edition has a
 *    function.
 * 2. **No Japanese copy has escaped the model.** Every string literal in the
 *    file bearing a kana, kanji, CJK punctuation or fullwidth codepoint is
 *    either inside the Japanese edition or bound to one of the shared
 *    identifiers declared below. An `aria-label` translated in place, or a
 *    Japanese label left on a component after a refactor, fails here.
 * 3. **No user-visible literal is written straight into the JSX.** Any text
 *    node, any string an expression container renders as a child, and any
 *    string on an attribute a reader can hear or read, has to be on the short
 *    allowlist below — which is the documented list of symbols and brand
 *    conventions that are deliberately the same in both editions.
 *
 * The one thing no automated check can do is judge the English side: a
 * plausible English sentence in the wrong place is still a plausible English
 * sentence. Parity of *shape* is mechanical and is enforced; parity of meaning
 * is read by a person.
 *
 * Run by `pnpm run check`. Exits non-zero with a list of every failure, not
 * just the first.
 *
 * Takes an optional path to check a file other than the template, which is
 * what `--self-test` uses to check the checker against the fixtures at the
 * foot of this file: `node scripts/check-locale-parity.mjs --self-test`.
 */

import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {join, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const [pathArgument] = process.argv.slice(2);

if (pathArgument === '--self-test') {
  selfTest();
}

const TEMPLATE_PATH =
  pathArgument === undefined
    ? join(REPO_ROOT, 'templates/information-maximalist.tsx')
    : resolve(pathArgument);

/** How the file under check is named in messages, relative to the repo root. */
const TEMPLATE_LABEL = relative(REPO_ROOT, TEMPLATE_PATH);

/** The two edition objects, and which one is allowed to hold Japanese. */
const JAPANESE_EDITION = 'JAPANESE_CONTENT';
const ENGLISH_EDITION = 'ENGLISH_CONTENT';

/**
 * Kana, kanji, CJK punctuation and fullwidth forms.
 *
 * Latin letters and Arabic numerals are deliberately not here: Japanese copy
 * prints acronyms (`IT`, `REIT`, `WEB`) and figures in Latin script, so their
 * presence says nothing about which edition a string belongs to.
 */
const JAPANESE_CODEPOINT = /[　-〿぀-ゟ゠-ヿ一-鿿＀-￯]/u;

/**
 * Module constants outside the content model that hold text a reader sees,
 * with the exact values they are allowed to hold.
 *
 * This is the whole list of intentional exceptions to "all copy lives in
 * `PORTAL_CONTENT`", and each one is an exception for the same reason: the
 * string is identical in both editions, so putting it in the model would mean
 * maintaining two copies of one fact.
 *
 * - `NEW_FLAG` — a two-letter status convention printed in Latin by portals in
 *   either language. The other flag, `速報` / `BREAKING`, genuinely differs and
 *   is in the model.
 * - `LOCALE_OPTIONS` — each language named in its own language, so the
 *   switcher reads the same whichever edition a reader has landed in. Its id
 *   and label literals are listed in written order, so the default-first
 *   ordering and the pairing of each id with its endonym are checked too.
 */
const SHARED_BINDINGS = {
  NEW_FLAG: ['NEW'],
  LOCALE_OPTIONS: ['ja', '日本語', 'en', 'English'],
};

/**
 * Literals written directly into the JSX, and why each is not copy.
 *
 * All three are typographic or structural rather than linguistic, so they are
 * the same mark in both editions.
 */
const SHARED_JSX_LITERALS = new Map([
  ['•', 'the article row’s bullet, set in the row’s own type size'],
  ['»', 'the promo run’s lead-in mark'],
  ['', 'the brand mark’s empty alt: the <h1> beside it is the accessible name'],
]);

/**
 * Attributes whose string value reaches a reader, by eye or by ear.
 *
 * `href`, `value`, `src`, `rel` and the rest are addresses and identifiers, so
 * a literal on one of them is not copy and is not flagged.
 */
const VISIBLE_ATTRIBUTES = new Set([
  'alt',
  'aria-description',
  'aria-label',
  'aria-placeholder',
  'aria-roledescription',
  'aria-valuetext',
  'caption',
  'label',
  'moreLabel',
  'placeholder',
  'summary',
  'title',
]);

const failures = [];

function fail(message) {
  failures.push(message);
}

const source = ts.createSourceFile(
  TEMPLATE_PATH,
  readFileSync(TEMPLATE_PATH, 'utf8'),
  ts.ScriptTarget.Latest,
  /* setParentNodes */ true,
  ts.ScriptKind.TSX,
);

/** `templates/information-maximalist.tsx:512`, for a message a reader can click. */
function at(node) {
  const {line} = source.getLineAndCharacterOfPosition(node.getStart(source));
  return `${TEMPLATE_LABEL}:${line + 1}`;
}

/** The initializer of a top-level `const <name> = …`, if the file has one. */
function findBinding(name) {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) {
      continue;
    }
    for (const declaration of statement.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === name &&
        declaration.initializer !== undefined
      ) {
        return declaration.initializer;
      }
    }
  }
  return undefined;
}

function isTextLiteral(node) {
  return (
    ts.isStringLiteral(node) ||
    ts.isNoSubstitutionTemplateLiteral(node) ||
    ts.isTemplateExpression(node)
  );
}

/** A literal's written text, with a template's interpolations left as `${}`. */
function literalText(node) {
  if (ts.isTemplateExpression(node)) {
    return (
      node.head.text +
      node.templateSpans.map(span => `\${}${span.literal.text}`).join('')
    );
  }
  return node.text;
}

/**
 * Whether a literal writes any text of its own.
 *
 * `{' '}` is the standard way to keep a space JSX would otherwise collapse, and
 * `` {`${a}${b}`} `` only joins two values from the model. A JSX *text* node of
 * pure whitespace is already ignored, so ignoring these keeps the two forms
 * symmetrical.
 *
 * Only whitespace counts as writing nothing. A mark like `•` or `/` is text a
 * reader sees, so it belongs on `SHARED_JSX_LITERALS` with a reason next to it
 * rather than being waved through by category — which is why the two marks the
 * template does use are listed there.
 */
function isWrittenCopy(node) {
  return literalText(node).replaceAll('${}', '').trim() !== '';
}

/**
 * The literals an expression can put on the page, ignoring the ones it only
 * reads.
 *
 * `{flag === 'new' && <Badge />}` renders a badge, never the word `new`: the
 * literal is an identifier being compared, so descending into the left of an
 * `&&` would flag the template's own internal ids. The same reasoning excludes
 * call arguments and property names — an argument is an input, not output.
 * What is left is the set of positions whose value React actually renders, so a
 * literal reached through one of them is copy and has to be accounted for.
 */
function renderedLiterals(node, found = []) {
  if (node === undefined) {
    return found;
  }
  if (isTextLiteral(node)) {
    found.push(node);
    return found;
  }
  if (ts.isParenthesizedExpression(node)) {
    return renderedLiterals(node.expression, found);
  }
  if (ts.isJsxExpression(node)) {
    return renderedLiterals(node.expression, found);
  }
  if (ts.isConditionalExpression(node)) {
    // The condition is read; both branches are rendered.
    renderedLiterals(node.whenTrue, found);
    renderedLiterals(node.whenFalse, found);
    return found;
  }
  if (ts.isBinaryExpression(node)) {
    const operator = node.operatorToken.kind;
    if (operator === ts.SyntaxKind.AmpersandAmpersandToken) {
      // `cond && value`: only the right side reaches the page.
      return renderedLiterals(node.right, found);
    }
    if (
      operator === ts.SyntaxKind.BarBarToken ||
      operator === ts.SyntaxKind.QuestionQuestionToken ||
      operator === ts.SyntaxKind.PlusToken
    ) {
      // A fallback or a concatenation renders either side.
      renderedLiterals(node.left, found);
      renderedLiterals(node.right, found);
    }
    return found;
  }
  if (ts.isArrayLiteralExpression(node)) {
    // An array of children renders each element.
    for (const element of node.elements) {
      renderedLiterals(element, found);
    }
    return found;
  }
  // Calls, identifiers, property accesses and comparisons are opaque: whatever
  // they evaluate to comes from somewhere else, and that somewhere is checked
  // on its own terms.
  return found;
}

/** Whether an expression container sits in child position, not on an attribute. */
function isJsxChild(node) {
  return (
    node.parent !== undefined &&
    (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
  );
}

// -----------------------------------------------------------------------------
// 1. The two editions are the same object twice
// -----------------------------------------------------------------------------

/** What a leaf holds, at the coarseness the two editions have to agree on. */
function leafKind(node) {
  if (isTextLiteral(node)) {
    return 'string';
  }
  if (ts.isNumericLiteral(node)) {
    return 'number';
  }
  if (
    node.kind === ts.SyntaxKind.TrueKeyword ||
    node.kind === ts.SyntaxKind.FalseKeyword
  ) {
    return 'boolean';
  }
  if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
    return 'function';
  }
  return ts.SyntaxKind[node.kind];
}

/**
 * Flattens an edition into `path -> kind`.
 *
 * Arrays record their length as well as their elements: the elements alone
 * would catch a length mismatch, but the length turns "`…[7]` is missing" into
 * "one edition has seven of these and the other has eight", which is the thing
 * a reader actually needs to know.
 */
function describe(node, path, shape) {
  if (ts.isObjectLiteralExpression(node)) {
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) {
        // Shorthand, spread and accessors would make the two editions
        // structurally incomparable, so they are a failure rather than a gap.
        fail(
          `${at(property)}: edition property at ${path} is a ` +
            `${ts.SyntaxKind[property.kind]}; only plain properties can be ` +
            `compared across locales`,
        );
        continue;
      }
      const key =
        ts.isIdentifier(property.name) || ts.isStringLiteral(property.name)
          ? property.name.text
          : '<computed>';
      describe(property.initializer, `${path}.${key}`, shape);
    }
    return shape;
  }

  if (ts.isArrayLiteralExpression(node)) {
    shape.set(`${path}.length`, String(node.elements.length));
    node.elements.forEach((element, index) => {
      describe(element, `${path}[${index}]`, shape);
    });
    return shape;
  }

  shape.set(path, leafKind(node));
  return shape;
}

function shapeOf(name) {
  const initializer = findBinding(name);
  if (initializer === undefined) {
    fail(`${name} is not declared as a top-level const in the template`);
    return new Map();
  }
  return describe(initializer, name.toLowerCase(), new Map());
}

const japaneseShape = shapeOf(JAPANESE_EDITION);
const englishShape = shapeOf(ENGLISH_EDITION);

if (japaneseShape.size > 0 && englishShape.size > 0) {
  const normalize = shape =>
    new Map(
      [...shape].map(([path, kind]) => [
        path.split('.').slice(1).join('.'),
        kind,
      ]),
    );
  const japanese = normalize(japaneseShape);
  const english = normalize(englishShape);

  for (const [path, kind] of japanese) {
    if (!english.has(path)) {
      fail(
        `${path} is in the Japanese edition but missing from the English one`,
      );
    } else if (english.get(path) !== kind) {
      fail(
        `${path} holds a ${kind} in Japanese and a ${english.get(path)} in English`,
      );
    }
  }
  for (const path of english.keys()) {
    if (!japanese.has(path)) {
      fail(
        `${path} is in the English edition but missing from the Japanese one`,
      );
    }
  }
}

// -----------------------------------------------------------------------------
// 2 & 3. Nothing user-visible has escaped the model
// -----------------------------------------------------------------------------

/** The nearest enclosing `const <name> = …`, for attributing a stray literal. */
function enclosingBinding(node) {
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isVariableDeclaration(current) && ts.isIdentifier(current.name)) {
      return current.name.text;
    }
  }
  return undefined;
}

const editionRanges = [JAPANESE_EDITION, ENGLISH_EDITION]
  .map(findBinding)
  .filter(node => node !== undefined)
  .map(node => [node.getStart(source), node.end]);

function insideAnEdition(node) {
  const start = node.getStart(source);
  return editionRanges.some(([from, to]) => start >= from && node.end <= to);
}

const seenJsxLiterals = new Set();

function inspect(node) {
  if (insideAnEdition(node)) {
    return;
  }

  // 3. Text a reader reads or hears, written into the markup.
  if (ts.isJsxText(node)) {
    const text = node.text.trim();
    if (text !== '' && !SHARED_JSX_LITERALS.has(text)) {
      fail(
        `${at(node)}: JSX text "${text}" is not in the content model and is ` +
          `not a documented shared literal`,
      );
    }
    if (text !== '') {
      seenJsxLiterals.add(text);
    }
  }

  // The same text, written into an expression container instead: `{'Tokyo'}`
  // renders exactly what `Tokyo` renders, and Prettier keeps both forms, so
  // checking only text nodes would leave the quoted one as a way through.
  if (ts.isJsxExpression(node) && isJsxChild(node)) {
    for (const literal of renderedLiterals(node)) {
      const text = literalText(literal);
      if (SHARED_JSX_LITERALS.has(text)) {
        seenJsxLiterals.add(text);
      } else if (isWrittenCopy(literal)) {
        fail(
          `${at(literal)}: JSX expression text "${text}" is not in the ` +
            `content model and is not a documented shared literal`,
        );
      }
    }
  }

  if (
    ts.isJsxAttribute(node) &&
    VISIBLE_ATTRIBUTES.has(node.name.getText(source))
  ) {
    // `renderedLiterals` rather than the initializer itself: an attribute is
    // just as reachable through a ternary — `aria-label={open ? 'Hide' : …}` —
    // as a child is.
    for (const literal of renderedLiterals(node.initializer)) {
      const text = literalText(literal);
      if (SHARED_JSX_LITERALS.has(text)) {
        seenJsxLiterals.add(text);
      } else if (isWrittenCopy(literal)) {
        fail(
          `${at(node)}: ${node.name.getText(source)}="${text}" is a literal ` +
            `rather than a value from the content model`,
        );
      }
    }
  }

  // 2. Japanese copy anywhere but the Japanese edition.
  if (isTextLiteral(node) && JAPANESE_CODEPOINT.test(literalText(node))) {
    const binding = enclosingBinding(node);
    if (binding === undefined || !(binding in SHARED_BINDINGS)) {
      fail(
        `${at(node)}: Japanese text "${literalText(node)}" is outside ` +
          `${JAPANESE_EDITION}` +
          (binding === undefined ? '' : ` (in ${binding})`),
      );
    }
  }
}

(function walk(node) {
  inspect(node);
  ts.forEachChild(node, walk);
})(source);

for (const [literal, reason] of SHARED_JSX_LITERALS) {
  if (!seenJsxLiterals.has(literal)) {
    fail(
      `the shared-literal allowlist still carries "${literal}" (${reason}), ` +
        `but the template no longer uses it`,
    );
  }
}

// -----------------------------------------------------------------------------
// The shared bindings hold exactly what they are documented to hold
// -----------------------------------------------------------------------------

for (const [name, expected] of Object.entries(SHARED_BINDINGS)) {
  const initializer = findBinding(name);
  if (initializer === undefined) {
    fail(`${name} is on the shared-literal list but is no longer declared`);
    continue;
  }
  const found = [];
  (function collect(node) {
    if (isTextLiteral(node)) {
      found.push(literalText(node));
    }
    ts.forEachChild(node, collect);
  })(initializer);
  if (found.join(' ') !== expected.join(' ')) {
    fail(
      `${at(initializer)}: ${name} holds [${found.join(', ')}] but is ` +
        `documented as holding [${expected.join(', ')}]`,
    );
  }
}

// -----------------------------------------------------------------------------
// Report
// -----------------------------------------------------------------------------

if (failures.length > 0) {
  console.error(
    `✗ locale parity: ${failures.length} problem${
      failures.length === 1 ? '' : 's'
    }\n`,
  );
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  console.error('');
  process.exit(1);
}

const paths = [...japaneseShape.keys()].filter(
  path => !path.endsWith('.length'),
);
console.log(
  `✓ locale parity: ja and en agree on ${paths.length} content values ` +
    `across ${japaneseShape.size - paths.length} counted runs; ` +
    `${SHARED_JSX_LITERALS.size + Object.values(SHARED_BINDINGS).flat().length} ` +
    `documented shared literals`,
);

// -----------------------------------------------------------------------------
// Self-test
// -----------------------------------------------------------------------------

/**
 * Checks the checker, by running it over fixtures that each write one literal
 * in one syntactic position.
 *
 * Check 3 is only as good as its list of positions, and the list is not
 * obvious: `{'Tokyo'}` renders the same text as `Tokyo` but is a different
 * node, and Prettier preserves whichever form is written, so a form nobody
 * thought of is a silent hole rather than a formatting error. The cases below
 * are therefore paired — for each position that has to fail, a neighbouring one
 * that has to keep passing, because a check that flags `flag === 'new'` or an
 * `href` would be turned off within a week.
 *
 * Fixtures are deliberately not whole templates: each one is asserted on the
 * presence or absence of its own marker, so the unrelated failures a two-line
 * module naturally produces (no editions to compare, allowlist entries unused)
 * do not have to be modelled.
 */
function selfTest() {
  const FIXTURES = [
    // Positions that render text: each marker has to be reported.
    {
      name: 'jsx-text',
      source: 'export const A = () => <p>MARK_TEXT</p>;',
      flagged: ['MARK_TEXT'],
    },
    {
      name: 'jsx-expression-string',
      source: "export const A = () => <p>{'MARK_EXPR'}</p>;",
      flagged: ['MARK_EXPR'],
    },
    {
      name: 'jsx-expression-template',
      source: 'export const A = () => <p>{`MARK_TEMPLATE`}</p>;',
      flagged: ['MARK_TEMPLATE'],
    },
    {
      name: 'jsx-expression-interpolated',
      source:
        'export const A = ({n}: {n: number}) => <p>{`${n} MARK_INTERP`}</p>;',
      flagged: ['MARK_INTERP'],
    },
    {
      // A mark between two model values is still text, so it has to be
      // documented on the allowlist rather than exempt for being punctuation.
      name: 'separator-template',
      source:
        'export const A = ({a, b}: {a: string; b: string}) => <p>{`${a} / ${b}`}</p>;',
      flagged: ['JSX expression text'],
    },
    {
      name: 'jsx-expression-ternary',
      source:
        "export const A = ({on}: {on: boolean}) => <p>{on ? 'MARK_TRUE' : 'MARK_FALSE'}</p>;",
      flagged: ['MARK_TRUE', 'MARK_FALSE'],
    },
    {
      name: 'jsx-expression-logical-value',
      source:
        "export const A = ({on}: {on: boolean}) => <p>{on && 'MARK_RHS'}</p>;",
      flagged: ['MARK_RHS'],
    },
    {
      name: 'jsx-expression-fallback',
      source:
        "export const A = ({s}: {s?: string}) => <p>{s ?? 'MARK_FALLBACK'}</p>;",
      flagged: ['MARK_FALLBACK'],
    },
    {
      name: 'jsx-expression-array',
      source: "export const A = () => <p>{['MARK_ARRAY']}</p>;",
      flagged: ['MARK_ARRAY'],
    },
    {
      name: 'jsx-fragment-child',
      source: "export const A = () => <>{'MARK_FRAGMENT'}</>;",
      flagged: ['MARK_FRAGMENT'],
    },
    {
      name: 'visible-attribute',
      source: 'export const A = () => <img src="/a.png" alt="MARK_ALT" />;',
      flagged: ['MARK_ALT'],
    },
    {
      name: 'visible-attribute-ternary',
      source:
        "export const A = ({on}: {on: boolean}) => <p aria-label={on ? 'MARK_LABEL' : 'MARK_OTHER'} />;",
      flagged: ['MARK_LABEL', 'MARK_OTHER'],
    },

    // Positions that only read a value: reporting these would make the check
    // unusable, so each marker has to stay unreported.
    {
      name: 'comparison-under-guard',
      source:
        "export const A = ({flag}: {flag: string}) => <p>{flag === 'MARK_ID' && <b />}</p>;",
      ignored: ['MARK_ID'],
    },
    {
      name: 'call-argument',
      source:
        "export const A = ({t}: {t: (k: string) => string}) => <p>{t('MARK_KEY')}</p>;",
      ignored: ['MARK_KEY'],
    },
    {
      name: 'invisible-attribute',
      source: 'export const A = () => <a href="/MARK_HREF">{null}</a>;',
      ignored: ['MARK_HREF'],
    },
    {
      name: 'documented-shared-literal',
      source: "export const A = () => <p>{'•'}</p>;",
      ignored: ['JSX expression text'],
    },
    {
      name: 'explicit-space',
      source: "export const A = ({a}: {a: string}) => <p>{a}{' '}{a}</p>;",
      ignored: ['JSX expression text'],
    },
    {
      name: 'interpolation-only-template',
      source:
        'export const A = ({a, b}: {a: string; b: string}) => <p>{`${a}${b}`}</p>;',
      ignored: ['JSX expression text'],
    },
  ];

  const directory = mkdtempSync(join(tmpdir(), 'locale-parity-selftest-'));
  const problems = [];

  for (const fixture of FIXTURES) {
    const file = join(directory, `${fixture.name}.tsx`);
    writeFileSync(file, `${fixture.source}\n`);
    const run = spawnSync(
      process.execPath,
      [fileURLToPath(import.meta.url), file],
      {encoding: 'utf8'},
    );
    const output = `${run.stdout}${run.stderr}`;
    for (const marker of fixture.flagged ?? []) {
      if (!output.includes(marker)) {
        problems.push(`${fixture.name}: expected "${marker}" to be reported`);
      }
    }
    for (const marker of fixture.ignored ?? []) {
      if (output.includes(marker)) {
        problems.push(
          `${fixture.name}: expected "${marker}" not to be reported`,
        );
      }
    }
  }

  rmSync(directory, {recursive: true, force: true});

  if (problems.length > 0) {
    console.error(`✗ locale parity self-test: ${problems.length} problem(s)\n`);
    for (const problem of problems) {
      console.error(`  - ${problem}`);
    }
    console.error('');
    process.exit(1);
  }
  console.log(
    `✓ locale parity self-test: ${FIXTURES.length} literal positions ` +
      `classified as documented`,
  );
  process.exit(0);
}
