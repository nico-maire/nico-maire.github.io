// NicOS desktop: icons, status widget, taskbar, start menu and the bridge between nodes and apps.
import { h } from '../core/dom.js';
import { createWM } from './wm.js';
import { DESKTOP, getNode } from '../core/fs.js';
import { APPS } from '../apps/index.js';
import { t, tr, LANGS, getLang, setLang } from '../core/i18n.js';
import { bus } from '../core/bus.js';
import { prefs, setPref, THEMES, load, save } from '../core/store.js';
import { pixelSvg } from '../core/icons.js';
import { db } from '../core/data.js';
import { go, openPath } from '../core/router.js';
import { sfx } from '../core/sound.js';
import { startGuide, stopGuide } from './guide.js';


const START_ITEMS = ['about', 'projects', 'skills', 'knowledge', 'experience', 'education', 'languages', 'contact', 'cv', '-', 'terminal', 'quick', 'guide', 'settings'];
const FEATURED = ['citasalon', 'dist-minesweeper', 'llm-security', 'raytracing', 'iot'];

// Allow line breaks after '.' and '_' in file names
function breakable(name) {
  return name.split(/(?<=[._])/).flatMap((part, i) => (i ? [h('wbr'), part] : [part]));
}

export function createOS(root, host) {
  root.replaceChildren();
  const wall = h('div', { class: 'os-wallpaper', 'aria-hidden': 'true' });
  const iconsEl = h('nav', { class: 'os-icons' });
  const widget = h('aside', { class: 'os-widget' });
  const layer = h('div', { class: 'os-windows' });
  const desktop = h('div', { class: 'os-desktop' }, wall, iconsEl, widget, layer);
  const tasksEl = h('div', { class: 'tb-tasks' });
  const startBtn = h('button', { class: 'tb-start', type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false' });
  const tray = h('div', { class: 'tb-tray' });
  const taskbar = h('div', { class: 'os-taskbar' }, startBtn, tasksEl, tray);
  const startMenu = h('div', { class: 'os-start', role: 'menu', hidden: true });
  const langMenu = h('div', { class: 'os-popup tb-langmenu', role: 'menu', hidden: true });
  root.append(desktop, taskbar, startMenu, langMenu);

  const wm = createWM(layer, { getScale: host.getScale, onChange: () => { renderTasks(); syncHash(); } });
  let selected = null;
  let clockTimer = null;

  const os = {
    root,
    host,
    wm,
    open,
    openViewer,
    close: () => wm.closeAll(),
    destroy,
  };

  // ------------------------------------------------------------ opening nodes
  function open(id, opts = {}) {
    const node = getNode(id);
    if (!node) return null;
    if (node.app === 'quick') { go('quick'); return null; }
    if (node.app === 'guide') { startGuide(os); return null; }
    const create = APPS[node.app];
    if (!create) return null;
    const spec = create(node, os, opts);
    const win = wm.open(id, spec);
    host.highlightObject?.(id);
    return win;
  }

  function openViewer(media, title) {
    return wm.open(`view:${media.src}`, APPS.viewer({ media, title }, os));
  }

  function syncHash() {
    const top = wm.active();
    const key = top?.key;
    if (key && getNode(key)) go(openPath(key), { replace: true, silent: true });
    else if (!key && location.hash.startsWith('#/open/')) go('', { replace: true, silent: true });
  }

  // ------------------------------------------------------------ desktop icons
  function renderIcons() {
    iconsEl.setAttribute('aria-label', t('desk.aria'));
    iconsEl.replaceChildren(...DESKTOP.map((id) => {
      const node = getNode(id);
      const btn = h('button', {
        class: ['d-icon', selected === id && 'is-selected'],
        type: 'button',
        dataset: { id },
        title: node.label(),
        onClick: (e) => {
          select(id);
          if (e.pointerType === 'touch' || e.detail === 0) open(id);
        },
        onDblclick: () => open(id),
        onKeydown: (e) => moveSelection(e, id),
      },
      h('span', { class: 'px-ico d-icon-img', html: pixelSvg(node.icon) }),
      h('span', { class: 'd-icon-label' }, breakable(node.name())));
      return btn;
    }));
  }

  function select(id) {
    selected = id;
    for (const el of iconsEl.children) el.classList.toggle('is-selected', el.dataset.id === id);
    sfx.click();
  }

  function moveSelection(e, id) {
    const keys = { ArrowDown: 1, ArrowRight: 6, ArrowUp: -1, ArrowLeft: -6 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const idx = DESKTOP.indexOf(id);
    const next = DESKTOP[Math.max(0, Math.min(DESKTOP.length - 1, idx + keys[e.key]))];
    select(next);
    iconsEl.querySelector(`[data-id="${next}"]`)?.focus();
  }

  // ------------------------------------------------------------ wallpaper and widget
  function renderWallpaper() {
    wall.replaceChildren(
      h('p', { class: 'wall-logo' }, 'NicOS'),
      h('p', { class: 'wall-quote' }, db.profile.quote),
      h('p', { class: 'wall-hint' }, t('desk.hint')),
    );
  }

  function renderWidget() {
    const p = db.profile;
    widget.replaceChildren(
      h('header', { class: 'w-head' }, h('span', { class: 'px-ico', html: pixelSvg('id') }), p.name.toUpperCase()),
      h('p', { class: 'w-role' }, tr(p.role)),
      h('p', { class: 'w-status' }, h('span', { class: 'w-dot', 'aria-hidden': 'true' }), tr(p.status).toUpperCase()),
      h('p', { class: 'w-loc' }, tr(p.location)),
      h('div', { class: 'w-actions' },
        h('button', { class: 'btn btn-sm', type: 'button', onClick: () => open('cv') }, t('w.cv')),
        h('button', { class: 'btn btn-sm', type: 'button', onClick: () => open('contact') }, t('w.contact')),
        h('button', { class: 'btn btn-sm', type: 'button', onClick: () => open('about') }, t('w.about'))),
      h('p', { class: 'w-sub' }, t('w.featured')),
      h('ul', { class: 'w-list' }, FEATURED.map((pid) => {
        const pr = db.projectById.get(pid);
        return h('li', {}, h('button', { class: 'link', type: 'button', onClick: () => open(`p/${pid}`) }, `> ${tr(pr.title)}`));
      })),
    );
  }

  // ------------------------------------------------------------ taskbar
  function renderTaskbar() {
    startBtn.replaceChildren(h('span', { class: 'px-ico', html: pixelSvg('computer') }), h('span', {}, t('tb.start')));
    startBtn.onclick = (e) => { e.stopPropagation(); toggleStart(); };
    const lang = LANGS.find((l) => l.code === getLang());
    tray.replaceChildren(
      h('button', {
        class: 'tb-btn tb-lang', type: 'button', title: t('tb.lang'), 'aria-label': t('tb.lang'), 'aria-haspopup': 'menu',
        onClick: (e) => { e.stopPropagation(); toggleLangMenu(); },
      }, h('span', { class: 'px-ico', html: pixelSvg('globe') }), lang.label),
      h('button', {
        class: 'tb-btn tb-theme', type: 'button', title: t('tb.theme'), 'aria-label': t('tb.theme'),
        onClick: () => { const i = THEMES.indexOf(prefs.theme); setPref('theme', THEMES[(i + 1) % THEMES.length]); },
      }, h('span', { class: 'px-ico', html: pixelSvg('palette') })),
      h('button', {
        class: 'tb-btn tb-sound', type: 'button', title: t('tb.sound'), 'aria-label': t('tb.sound'), 'aria-pressed': String(prefs.sound),
        onClick: () => { setPref('sound', !prefs.sound); sfx.beep(); },
      }, h('span', { class: 'px-ico', html: pixelSvg(prefs.sound ? 'speaker' : 'mute') })),
      h('span', { class: 'tb-clock', 'aria-label': t('tb.clock') }, clock()),
    );
    langMenu.replaceChildren(...LANGS.map((l) => h('button', {
      class: 'menu-item', type: 'button', role: 'menuitemradio', 'aria-checked': String(l.code === getLang()),
      onClick: () => { langMenu.hidden = true; setLang(l.code); },
    }, `${l.code === getLang() ? '*' : ' '} ${l.label}  ${l.name}`)));
    renderTasks();
  }

  function renderTasks() {
    const top = wm.active();
    tasksEl.replaceChildren(...wm.list().map((w) => h('button', {
      class: ['tb-task', w === top && 'is-active', w.minimized && 'is-min'],
      type: 'button',
      title: w.spec.title(),
      onClick: () => (w === top ? wm.minimize(w) : wm.focus(w)),
    }, h('span', { class: 'px-ico', html: pixelSvg(w.spec.icon || 'doc') }), h('span', { class: 'tb-task-label' }, w.spec.title()))));
  }

  function clock() {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  // ------------------------------------------------------------ start menu
  function renderStart() {
    const items = START_ITEMS.map((id) => {
      if (id === '-') return h('div', { class: 'menu-sep', role: 'separator' });
      const node = getNode(id);
      return h('button', {
        class: 'menu-item', type: 'button', role: 'menuitem',
        onClick: () => { closeMenus(); open(id); },
      }, h('span', { class: 'px-ico', html: pixelSvg(node.icon) }), node.label());
    });
    items.push(h('div', { class: 'menu-sep', role: 'separator' }));
    if (host.mode === 'scene') {
      items.push(h('button', { class: 'menu-item', type: 'button', role: 'menuitem', onClick: () => { closeMenus(); host.zoomOut(); } },
        h('span', { class: 'px-ico', html: pixelSvg('back') }), t('start.office')));
    }
    items.push(h('button', { class: 'menu-item', type: 'button', role: 'menuitem', onClick: () => { closeMenus(); host.restart(); } },
      h('span', { class: 'px-ico', html: pixelSvg('hourglass') }), t('start.restart')));
    items.push(h('button', { class: 'menu-item', type: 'button', role: 'menuitem', onClick: () => { closeMenus(); host.powerOff(); } },
      h('span', { class: 'px-ico', html: pixelSvg('power') }), t('start.shutdown')));
    startMenu.replaceChildren(
      h('div', { class: 'start-band', 'aria-hidden': 'true' }, h('span', {}, 'NicOS 2.6')),
      h('div', { class: 'start-items' }, items),
    );
  }

  function toggleStart() {
    const show = startMenu.hidden;
    closeMenus();
    if (show) {
      renderStart();
      startMenu.hidden = false;
      startBtn.setAttribute('aria-expanded', 'true');
      startMenu.querySelector('.menu-item')?.focus();
      sfx.click();
    }
  }

  function toggleLangMenu() {
    const show = langMenu.hidden;
    closeMenus();
    langMenu.hidden = !show;
    if (show) langMenu.querySelector('[aria-checked="true"]')?.focus();
  }

  function closeMenus() {
    startMenu.hidden = true;
    langMenu.hidden = true;
    startBtn.setAttribute('aria-expanded', 'false');
  }

  // ------------------------------------------------------------ global handlers
  const onDocClick = (e) => {
    if (!startMenu.contains(e.target) && !langMenu.contains(e.target)) closeMenus();
  };
  const onKey = (e) => {
    if (e.key !== 'Escape') return;
    if (!startMenu.hidden || !langMenu.hidden) { closeMenus(); startBtn.focus(); return; }
    if (root.querySelector('.guide-layer')) return;
    const top = wm.active();
    if (top && root.contains(document.activeElement)) wm.close(top);
  };
  desktop.addEventListener('pointerdown', (e) => {
    if (e.target === desktop || e.target === wall || e.target.closest('.os-wallpaper')) select(null);
  });
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKey);

  const offLang = bus.on('lang', () => {
    renderIcons();
    renderWallpaper();
    renderWidget();
    renderTaskbar();
    if (!startMenu.hidden) renderStart();
    wm.rerenderAll();
  });
  const offPrefs = bus.on('prefs', ({ key }) => {
    if (key === 'sound') renderTaskbar();
    if (key === 'theme' || key === 'crt') wm.list().filter((w) => w.key === 'settings').forEach((w) => w.rerender());
  });

  function destroy() {
    stopGuide();
    clearInterval(clockTimer);
    offLang();
    offPrefs();
    document.removeEventListener('click', onDocClick);
    document.removeEventListener('keydown', onKey);
    root.replaceChildren();
  }

  renderIcons();
  renderWallpaper();
  renderWidget();
  renderTaskbar();
  clockTimer = setInterval(() => {
    const el = tray.querySelector('.tb-clock');
    if (el) el.textContent = clock();
  }, 15000);

  // First visit: welcome dialog with the guided tour
  if (!load('welcomed', false) && !host.deepLink) {
    save('welcomed', true);
    setTimeout(() => wm.open('welcome', APPS.welcome(null, os)), 350);
  }

  return os;
}
