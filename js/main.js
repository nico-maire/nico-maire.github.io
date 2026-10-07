// Entry point: loads data and translations, picks the desktop (office + CRT) or phone (Nokia) experience, routes.
import { applyPrefs } from './core/store.js';
import { initI18n } from './core/i18n.js';
import { loadData } from './core/data.js';
import { buildFs, getNode } from './core/fs.js';
import { installCursors } from './core/cursors.js';
import { bus } from './core/bus.js';
import { parseRoute, go } from './core/router.js';
import { mountDesk } from './scene/scene.js';
import { mountPhone } from './phone/phone.js';
import { openQuick, closeQuick } from './quick/quick.js';

const app = document.getElementById('app');
let current = null;
let currentMode = null;

function detectMode() {
  const w = window.innerWidth;
  const hgt = window.innerHeight;
  if (Math.min(w, hgt) < 560 || w < 640) return 'phone';
  const fine = window.matchMedia('(pointer: fine)').matches;
  if (w >= 1000 && hgt >= 560 && fine) return 'scene';
  return 'monitor';
}

function mount(route) {
  const mode = detectMode();
  if (mode === currentMode && current) return;
  current?.destroy();
  currentMode = mode;
  const deepLink = route.name === 'open' && getNode(route.arg) ? route.arg : null;
  document.documentElement.dataset.mode = mode;
  current = mode === 'phone' ? mountPhone(app, { deepLink }) : mountDesk(app, { mode, deepLink });
  if (deepLink) current.openNode(deepLink);
}

function handleRoute(route) {
  if (route.name === 'quick') {
    openQuick({ onClose: () => (history.length > 1 ? history.back() : go('', { replace: true })) });
    return;
  }
  closeQuick();
  if (route.name === 'open' && getNode(route.arg)) current?.openNode(route.arg);
  else if (route.name === 'home') current?.home?.();
}

async function start() {
  applyPrefs();
  installCursors();
  try {
    await Promise.all([initI18n(), loadData()]);
  } catch (err) {
    console.error(err);
    app.textContent = 'NicOS: could not load data. Please reload.';
    return;
  }
  buildFs();
  const route = parseRoute();
  mount(route);
  if (route.name === 'quick') handleRoute(route);
  bus.on('route', handleRoute);

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => mount(parseRoute()), 250);
  });
}

start();
