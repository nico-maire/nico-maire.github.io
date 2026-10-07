// User preferences persisted in localStorage. Every access is guarded: storage can be unavailable.
import { bus } from './bus.js';

const PREFIX = 'nicos:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* ignore */ }
}

export const prefs = {
  theme: load('theme', 'green'),   // green | amber | white
  crt: load('crt', 'high'),        // high | low | off
  sound: load('sound', false),
  lcd: load('lcd', 'lcd'),         // lcd | phosphor (phone)
};

export function setPref(key, value) {
  prefs[key] = value;
  save(key, value);
  applyPrefs();
  bus.emit('prefs', { key, value });
}

export function applyPrefs() {
  const root = document.documentElement;
  root.dataset.theme = prefs.theme;
  root.dataset.crt = prefs.crt;
  root.dataset.lcd = prefs.lcd;
}

export const THEMES = ['green', 'amber', 'white'];
export const CRT_LEVELS = ['high', 'low', 'off'];
