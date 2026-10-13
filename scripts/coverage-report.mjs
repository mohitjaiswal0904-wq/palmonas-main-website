#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const summaryPath = path.join(root, 'coverage', 'coverage-summary.json');
const TARGET = 90;

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

const supportsColor = process.stdout.isTTY !== false;

function paint(text, ...styles) {
  if (!supportsColor) return text;
  return `${styles.join('')}${text}${c.reset}`;
}

const LAYER_GLOBS = [
  { name: 'config', match: (p) => p.startsWith('src/config/') },
  { name: 'types', match: (p) => p.startsWith('src/types/') },
  { name: 'lib', match: (p) => p.startsWith('src/lib/') },
  {
    name: 'services',
    match: (p) => p.startsWith('src/services/') && !p.startsWith('src/services/server/'),
  },
  { name: 'services/server', match: (p) => p.startsWith('src/services/server/') },
  { name: 'repositories', match: (p) => p.startsWith('src/repositories/') },
  { name: 'hooks', match: (p) => p.startsWith('src/hooks/') },
  { name: 'providers', match: (p) => p.startsWith('src/providers/') },
  { name: 'infrastructure', match: (p) => p.startsWith('src/infrastructure/') },
  { name: 'components', match: (p) => p.startsWith('src/components/') },
];

function pct(covered, total) {
  if (total === 0) return 100;
  return Math.round((covered / total) * 1000) / 10;
}

function colorPct(value) {
  if (value >= TARGET) return paint(`${value}%`.padStart(6), c.green);
  if (value >= 70) return paint(`${value}%`.padStart(6), c.yellow);
  if (value > 0) return paint(`${value}%`.padStart(6), c.red);
  return paint(`${value}%`.padStart(6), c.gray);
}

function statusLabel(metrics) {
  const min = Math.min(metrics.statements, metrics.branches, metrics.functions, metrics.lines);
  if (min >= TARGET) return paint(' OK ', c.bold, c.green);
  return paint('WARN', c.bold, c.yellow);
}

function relPath(absPath) {
  return path.relative(root, absPath).replace(/\\/g, '/');
}

function aggregateFromSummary(summary, predicate) {
  const totals = {
    lines: { covered: 0, total: 0 },
    statements: { covered: 0, total: 0 },
    functions: { covered: 0, total: 0 },
    branches: { covered: 0, total: 0 },
  };

  for (const [filePath, data] of Object.entries(summary)) {
    if (filePath === 'total') continue;
    const rel = relPath(filePath);
    if (!predicate(rel)) continue;

    for (const key of ['lines', 'statements', 'functions', 'branches']) {
      totals[key].covered += data[key].covered;
      totals[key].total += data[key].total;
    }
  }

  return {
    lines: pct(totals.lines.covered, totals.lines.total),
    statements: pct(totals.statements.covered, totals.statements.total),
    branches: pct(totals.branches.covered, totals.branches.total),
    functions: pct(totals.functions.covered, totals.functions.total),
  };
}

function pad(str, len) {
  return String(str).padEnd(len);
}

function printDivider(char = '─', width = 72) {
  console.log(paint(char.repeat(width), c.dim));
}

function printLegend() {
  console.log('');
  printDivider('═');
  console.log(paint('  COVERAGE REPORT', c.bold, c.cyan));
  printDivider('─');
  console.log(paint('  Metrics', c.bold));
  console.log(`  ${paint('Stmts', c.blue)}   executable statements run`);
  console.log(`  ${paint('Branch', c.blue)}  if/else and error paths taken`);
  console.log(`  ${paint('Funcs', c.blue)}   functions called at least once`);
  console.log(`  ${paint('Lines', c.blue)}   source lines hit`);
  console.log(
    `  ${paint('Target', c.magenta)}  ${TARGET}–95% on modules you change · below ${TARGET}% = ${paint('WARN', c.yellow)} (advisory)`,
  );
  console.log('');
  console.log(paint('  Sections', c.bold));
  console.log(`  ${paint('LAYER', c.blue)}    architecture folders (config, lib, services, components, …)`);
  console.log(`  ${paint('FEATURE', c.blue)}  product areas (auth, cart, cms, product, …)`);
  console.log('');
  console.log(paint('  Color key', c.bold));
  console.log(`  ${paint('green', c.green)} ≥${TARGET}%   ${paint('yellow', c.yellow)} 70–${TARGET - 1}%   ${paint('red', c.red)} 1–69%   ${paint('gray', c.gray)} 0%`);
  printDivider('─');
  console.log('');
}

function printTable(title, rows) {
  console.log(paint(title, c.bold, c.cyan));
  console.log(
    paint(
      `${pad('', 20)} Stmts   Branch   Funcs   Lines   Status`,
      c.dim,
    ),
  );
  printDivider();

  for (const row of rows) {
    const m = row.metrics;
    console.log(
      `${pad(row.name, 20)} ${colorPct(m.statements)} ${colorPct(m.branches)} ${colorPct(m.functions)} ${colorPct(m.lines)}  ${statusLabel(m)}`,
    );
  }
  console.log('');
}

const AUTH_FEATURE_PREFIXES = [
  'components/auth',
  'config/auth',
  'hooks/auth',
  'infrastructure/identity',
  'lib/auth',
  'providers/auth',
  'repositories/auth',
  'services/auth',
  'types/auth',
];

/** Product feature domains — business areas, not architecture layers. */
const FEATURE_DOMAIN_ORDER = [
  'auth',
  'cart',
  'account',
  'product',
  'collection',
  'product-listing',
  'cms',
  'blog',
  'search',
  'wishlist',
  'layout',
  'home',
  'seo',
  'ui',
  'icons',
  'store',
  'app',
  'other',
];

function featureKey(relPath) {
  const parts = relPath.split('/');
  if (parts.length < 3) return parts[1] ?? 'root';
  return parts[2].replace(/\.(ts|tsx)$/, '') === parts[2] ? parts[2] : parts[1];
}

function isAuthScopePath(rel) {
  if (rel === 'src/middleware.ts' || rel === 'src/lib/api.ts') return true;
  const layer = LAYER_GLOBS.find((l) => l.match(rel))?.name ?? 'other';
  return AUTH_FEATURE_PREFIXES.includes(`${layer}/${featureKey(rel)}`);
}

function pathIncludes(rel, ...segments) {
  return segments.some(
    (segment) =>
      rel.includes(`/${segment}/`) ||
      rel.endsWith(`/${segment}.ts`) ||
      rel.endsWith(`/${segment}.tsx`),
  );
}

function nameIncludes(rel, ...patterns) {
  const base = rel.split('/').pop() ?? '';
  return patterns.some((pattern) => base.includes(pattern));
}

/**
 * Maps a source file to a product feature domain (auth, cart, cms, …).
 * Unmatched files roll into "other" — layer rollups live in the LAYER table only.
 *
 * @param rel - Path relative to repo root.
 * @returns Feature slug for the FEATURE table.
 */
function resolveFeatureDomain(rel) {
  if (!rel.startsWith('src/')) return null;
  if (isAuthScopePath(rel)) return 'auth';

  if (
    pathIncludes(rel, 'cart', 'store/cart') ||
    nameIncludes(rel, 'useCart', 'CartProvider', 'cart.service', 'cart.reducer', 'cart.actions', 'cart.context', 'cart.types', 'cart.initial-state')
  ) {
    return 'cart';
  }
  if (pathIncludes(rel, 'account') || nameIncludes(rel, 'useCustomer', 'customer.service')) {
    return 'account';
  }
  if (
    pathIncludes(rel, 'global/product-listing', 'product-listing') ||
    nameIncludes(rel, 'useProductListing', 'product-listing')
  ) {
    return 'product-listing';
  }
  if (
    pathIncludes(rel, 'product', 'products') ||
    nameIncludes(rel, 'useProducts', 'productService', 'product.service')
  ) {
    return 'product';
  }
  if (pathIncludes(rel, 'collection', 'collections') || nameIncludes(rel, 'useCollection', 'collection.service')) {
    return 'collection';
  }
  if (pathIncludes(rel, 'cms') || nameIncludes(rel, 'useCms', 'cms.service', 'cms-slot')) {
    return 'cms';
  }
  if (pathIncludes(rel, 'blog', 'blogs') || nameIncludes(rel, 'useBlog', 'blog.service')) {
    return 'blog';
  }
  if (pathIncludes(rel, 'search') || nameIncludes(rel, 'useSearch', 'search.service')) {
    return 'search';
  }
  if (pathIncludes(rel, 'wishlist') || nameIncludes(rel, 'useWishlist', 'WishlistProvider')) {
    return 'wishlist';
  }
  if (pathIncludes(rel, 'layout', 'Footer', 'Header') || nameIncludes(rel, 'footer.service', 'transform-footer', 'footer-theme', 'footer-layout')) {
    return 'layout';
  }
  if (pathIncludes(rel, 'home')) return 'home';
  if (pathIncludes(rel, 'seo', 'lib/seo') || nameIncludes(rel, 'build-metadata', 'json-ld')) return 'seo';
  if (pathIncludes(rel, 'components/ui')) return 'ui';
  if (pathIncludes(rel, 'icons')) return 'icons';
  if (pathIncludes(rel, 'store/')) return 'store';
  if (rel.startsWith('src/app/')) return 'app';

  return 'other';
}

function parseJestSummary(output) {
  const suiteMatch = output.match(/Test Suites:\s+(\d+) passed(?:,\s*(\d+) total)?/);
  const testMatch = output.match(/Tests:\s+(\d+) passed(?:,\s*(\d+) total)?/);
  return {
    suites: suiteMatch ? Number(suiteMatch[2] ?? suiteMatch[1]) : null,
    tests: testMatch ? Number(testMatch[2] ?? testMatch[1]) : null,
    passed: testMatch ? Number(testMatch[1]) : null,
  };
}

const jest = spawnSync(
  'pnpm',
  [
    'exec',
    'jest',
    '--coverage',
    '--coverageReporters=json-summary',
    '--coverageReporters=json',
    '--passWithNoTests=false',
  ],
  { cwd: root, encoding: 'utf8' },
);

if (jest.stdout) process.stdout.write(jest.stdout);
if (jest.stderr) process.stderr.write(jest.stderr);

if (jest.status !== 0) {
  process.exit(jest.status ?? 1);
}

if (!existsSync(summaryPath)) {
  console.error(paint('coverage-summary.json not found after jest run', c.red));
  process.exit(1);
}

const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
const jestOutput = `${jest.stdout ?? ''}${jest.stderr ?? ''}`;
const jestStats = parseJestSummary(jestOutput);

printLegend();

if (jestStats.tests != null) {
  console.log(
    paint('  Tests', c.bold),
    `${paint(String(jestStats.passed), c.green)} passed`,
    paint(`(${jestStats.tests} total · ${jestStats.suites ?? '?'} suites)`, c.dim),
  );
  console.log('');
}

const overall = aggregateFromSummary(summary, () => true);
printTable('OVERALL', [{ name: 'all', metrics: overall }]);

const layerRows = LAYER_GLOBS.map(({ name, match }) => ({
  name,
  metrics: aggregateFromSummary(summary, match),
}));
printTable('LAYER (architecture)', layerRows);

const featureBuckets = new Map();
for (const filePath of Object.keys(summary)) {
  if (filePath === 'total') continue;
  const rel = relPath(filePath);
  const domain = resolveFeatureDomain(rel);
  if (!domain) continue;
  if (!featureBuckets.has(domain)) featureBuckets.set(domain, []);
  featureBuckets.get(domain).push(rel);
}

const featureRows = [...featureBuckets.entries()]
  .map(([name, paths]) => ({
    name,
    metrics: aggregateFromSummary(summary, (rel) => paths.includes(rel)),
  }))
  .sort((a, b) => {
    const ai = FEATURE_DOMAIN_ORDER.indexOf(a.name);
    const bi = FEATURE_DOMAIN_ORDER.indexOf(b.name);
    const orderA = ai === -1 ? FEATURE_DOMAIN_ORDER.length : ai;
    const orderB = bi === -1 ? FEATURE_DOMAIN_ORDER.length : bi;
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });

printTable('FEATURE (product areas)', featureRows);

const authScope = aggregateFromSummary(summary, isAuthScopePath);
printTable('THIS PR — auth scope', [{ name: 'auth', metrics: authScope }]);

printDivider('═');
console.log('');

process.exit(0);
