// Consistency checks for the portfolio. Run: node scripts/check.mjs
// - every UI dictionary has the same keys as en.json
// - every t('key') used in the code exists
// - every multilingual content field has the 5 languages
// - every local asset referenced by the data exists
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LANGS = ['es', 'en', 'it', 'fr', 'zh'];
const errors = [];
const warn = (msg) => errors.push(msg);
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

// 1. Dictionaries
const dicts = Object.fromEntries(LANGS.map((l) => [l, read(`data/i18n/${l}.json`)]));
const ref = Object.keys(dicts.en);
for (const l of LANGS) {
  for (const k of ref) if (!(k in dicts[l])) warn(`i18n: ${l}.json is missing "${k}"`);
  for (const k of Object.keys(dicts[l])) if (!(k in dicts.en)) warn(`i18n: ${l}.json has unknown key "${k}"`);
  for (const [k, v] of Object.entries(dicts[l])) {
    const vars = (s) => (s.match(/\{\w+\}/g) || []).sort().join();
    if (vars(v) !== vars(dicts.en[k] || '')) warn(`i18n: ${l}.json "${k}" placeholders differ from en`);
  }
}

// 2. Keys used in code
function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const DYNAMIC = /^(dir|cat|desk|file|ctx|vis|theme|crt|link|hot)\.$/;
for (const file of walk(join(ROOT, 'js')).filter((f) => f.endsWith('.js'))) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/\bt\(\s*'([\w.]+)'/g)) {
    if (!(m[1] in dicts.en)) warn(`code: ${file.replace(ROOT, '')} uses missing key "${m[1]}"`);
  }
  for (const m of src.matchAll(/\bt\(\s*`([\w.]+)\$\{/g)) {
    if (!DYNAMIC.test(m[1])) warn(`code: dynamic key prefix "${m[1]}" in ${file.replace(ROOT, '')} is not whitelisted`);
  }
}
const dynamicSets = {
  dir: ['startup', 'ai', 'security', 'systems', 'algorithms', 'iot', 'web', 'games', 'all', 'projects', 'skills', 'knowledge', 'trash'],
  cat: ['startup', 'ai', 'security', 'systems', 'algorithms', 'iot', 'web', 'games', 'all'],
  desk: ['about', 'projects', 'skills', 'knowledge', 'experience', 'education', 'languages', 'contact', 'cv', 'terminal', 'quick', 'guide', 'settings', 'trash'],
  file: ['about', 'experience', 'education', 'languages', 'contact', 'cv', 'terminal', 'quick', 'guide', 'settings', 'wip', 'excuses', 'bugs'],
  ctx: ['startup', 'personal', 'uc3m', 'unibo'],
  vis: ['product', 'public', 'private', 'confidential'],
  theme: ['green', 'amber', 'white'],
  crt: ['high', 'low', 'off'],
  link: ['github', 'web', 'youtube', 'linkedin', 'mail', 'pdf', 'open'],
};
for (const [prefix, names] of Object.entries(dynamicSets)) {
  for (const n of names) if (!(`${prefix}.${n}` in dicts.en)) warn(`i18n: missing dynamic key "${prefix}.${n}"`);
}

// 3. Content fields
function checkContent(value, path) {
  if (Array.isArray(value)) { value.forEach((v, i) => checkContent(v, `${path}[${i}]`)); return; }
  if (!value || typeof value !== 'object') return;
  const keys = Object.keys(value);
  if (keys.some((k) => LANGS.includes(k))) {
    for (const l of LANGS) if (!(l in value)) warn(`content: ${path} is missing "${l}"`);
    const lens = LANGS.filter((l) => Array.isArray(value[l])).map((l) => value[l].length);
    if (lens.length && new Set(lens).size > 1) warn(`content: ${path} lists have different lengths ${lens}`);
    return;
  }
  for (const [k, v] of Object.entries(value)) checkContent(v, `${path}.${k}`);
}
for (const f of ['profile', 'projects', 'skills', 'knowledge', 'timeline', 'languages']) checkContent(read(`data/${f}.json`), f);

// 4. Assets
const assetRefs = new Set();
const collect = (v) => {
  if (typeof v === 'string' && /^assets\//.test(v)) assetRefs.add(v);
  else if (Array.isArray(v)) v.forEach(collect);
  else if (v && typeof v === 'object') Object.values(v).forEach(collect);
};
for (const f of ['profile', 'projects', 'scene']) collect(read(`data/${f}.json`));
for (const l of LANGS) assetRefs.add(`assets/cv/CV-NicolasMaireBravo-${l.toUpperCase()}.pdf`);
for (const a of assetRefs) if (!existsSync(join(ROOT, a))) warn(`asset: missing ${a}`);

// 5. Projects reference known skills
const skills = new Set(read('data/skills.json').skills.map((s) => s.id));
for (const p of read('data/projects.json')) for (const s of p.skills) if (!skills.has(s)) warn(`projects: ${p.id} uses unknown skill "${s}"`);

if (errors.length) {
  console.log(errors.join('\n'));
  console.log(`\n${errors.length} problem(s)`);
  process.exit(1);
}
console.log(`OK: ${ref.length} UI keys x ${LANGS.length} languages, ${assetRefs.size} assets`);
