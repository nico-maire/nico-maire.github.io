// Internationalisation: UI strings live in data/i18n/<lang>.json, content fields are { es, en, it, fr, zh } objects.
import { bus } from './bus.js';
import { load, save } from './store.js';

export const LANGS = [
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'zh', label: '中文', name: '中文' },
];

const FALLBACK = 'en';
const dicts = {};
let current = FALLBACK;

export const getLang = () => current;
export const isLang = (code) => LANGS.some((l) => l.code === code);

async function loadDict(code) {
  if (!dicts[code]) {
    const res = await fetch(`data/i18n/${code}.json`);
    if (!res.ok) throw new Error(`i18n: cannot load ${code}`);
    dicts[code] = await res.json();
  }
  return dicts[code];
}

export function detectLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (fromUrl && isLang(fromUrl)) return fromUrl;
  const stored = load('lang', null);
  if (stored && isLang(stored)) return stored;
  for (const l of navigator.languages || [navigator.language || '']) {
    const code = String(l).slice(0, 2).toLowerCase();
    if (isLang(code)) return code;
  }
  return FALLBACK;
}

export async function initI18n() {
  await loadDict(FALLBACK);
  await setLang(detectLang(), { silent: true, persist: false });
}

export async function setLang(code, { silent = false, persist = true } = {}) {
  if (!isLang(code)) code = FALLBACK;
  await loadDict(code);
  current = code;
  document.documentElement.lang = code === 'zh' ? 'zh-Hans' : code;
  document.documentElement.dataset.lang = code;
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
  if (persist) save('lang', code);
  const url = new URL(location.href);
  if (url.searchParams.has('lang') && url.searchParams.get('lang') !== code) {
    url.searchParams.set('lang', code);
    try { history.replaceState(null, '', url); } catch { /* ignore */ }
  }
  if (!silent) bus.emit('lang', code);
}

// UI string lookup with {placeholder} interpolation.
export function t(key, vars) {
  let str = dicts[current]?.[key] ?? dicts[FALLBACK]?.[key];
  if (str == null) {
    console.warn('[i18n] missing key', key);
    return key;
  }
  if (vars) str = str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''));
  return str;
}

// Content field lookup: strings and numbers pass through, objects are resolved by language.
export function tr(value) {
  if (value == null) return '';
  if (typeof value !== 'object' || Array.isArray(value)) return value;
  return value[current] ?? value[FALLBACK] ?? value.es ?? Object.values(value)[0];
}

// Locale-aware lowercase/uppercase helpers for 8.3 style filenames.
export function upper(str) {
  return current === 'zh' ? str : str.toLocaleUpperCase(current);
}
