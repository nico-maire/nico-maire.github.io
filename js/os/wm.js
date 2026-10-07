// Window manager for NicOS: open/focus/close, drag, resize, minimise, maximise. Works in the 1024x768 logical space.
import { h } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { pixelSvg } from '../core/icons.js';
import { sfx } from '../core/sound.js';

export const DESK_W = 1024;
export const DESK_H = 768 - 36; // minus taskbar

let uid = 0;

export function createWM(layer, { getScale, onChange }) {
  const wins = new Map();
  let z = 100;
  let cascade = 0;

  const notify = () => onChange?.();

  function active() {
    let top = null;
    for (const w of wins.values()) if (!w.minimized && (!top || +w.el.style.zIndex > +top.el.style.zIndex)) top = w;
    return top;
  }

  function focus(win) {
    if (!win) return;
    if (win.minimized) {
      win.minimized = false;
      win.el.hidden = false;
    }
    win.el.style.zIndex = ++z;
    for (const w of wins.values()) w.el.classList.toggle('is-active', w === win);
    if (!win.el.contains(document.activeElement)) win.el.focus({ preventScroll: true });
    notify();
  }

  function render(win) {
    win.titleEl.textContent = win.spec.title();
    win.icoEl.innerHTML = pixelSvg(win.spec.icon || 'doc');
    win.btnMin.setAttribute('aria-label', t('win.min'));
    win.btnMax.setAttribute('aria-label', t('win.max'));
    win.btnClose.setAttribute('aria-label', t('win.close'));
    const scroll = win.body.scrollTop;
    win.body.replaceChildren();
    win.spec.mount(win.body, win);
    win.body.scrollTop = scroll;
    if (win.spec.status) {
      win.statusEl.hidden = false;
      win.statusEl.textContent = win.spec.status();
    }
  }

  function open(key, spec) {
    const existing = wins.get(key);
    if (existing) {
      focus(existing);
      return existing;
    }
    const [w0, h0] = spec.size || [620, 460];
    const w = Math.min(w0, DESK_W - 16);
    const hgt = Math.min(h0, DESK_H - 16);
    const off = (cascade++ % 6) * 26 - 52;
    const x = Math.max(8, Math.min(DESK_W - w - 8, Math.round((DESK_W - w) / 2 + off + 40)));
    const y = Math.max(8, Math.min(DESK_H - hgt - 8, Math.round((DESK_H - hgt) / 2 + off)));

    const id = `win-${++uid}`;
    const icoEl = h('span', { class: 'win-ico px-ico', 'aria-hidden': 'true' });
    const titleEl = h('h2', { class: 'win-title', id: `${id}-title` });
    const btnMin = h('button', { class: 'win-btn', type: 'button', html: pixelSvg('min') });
    const btnMax = h('button', { class: 'win-btn', type: 'button', html: pixelSvg('max') });
    const btnClose = h('button', { class: 'win-btn', type: 'button', html: pixelSvg('close') });
    const bar = h('header', { class: 'win-bar' }, icoEl, titleEl, h('div', { class: 'win-btns' }, btnMin, btnMax, btnClose));
    const body = h('div', { class: ['win-body', spec.bodyClass] });
    const statusEl = h('footer', { class: 'win-status', hidden: true });
    const grip = h('div', { class: 'win-grip', 'aria-hidden': 'true' });
    const el = h('section', {
      class: ['win', spec.className],
      role: 'dialog',
      'aria-labelledby': `${id}-title`,
      tabindex: '-1',
      style: { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${hgt}px`, zIndex: ++z },
    }, bar, body, statusEl, grip);

    const win = { key, el, body, spec, titleEl, icoEl, statusEl, btnMin, btnMax, btnClose, minimized: false, maximized: false };
    win.rerender = () => render(win);
    win.setTitle = () => { titleEl.textContent = spec.title(); notify(); };
    win.close = () => close(win);
    wins.set(key, win);

    btnMin.addEventListener('click', (e) => { e.stopPropagation(); minimize(win); });
    btnMax.addEventListener('click', (e) => { e.stopPropagation(); toggleMax(win); });
    btnClose.addEventListener('click', (e) => { e.stopPropagation(); close(win); });
    el.addEventListener('pointerdown', () => { if (!el.classList.contains('is-active')) focus(win); }, true);
    bar.addEventListener('dblclick', (e) => { if (!e.target.closest('.win-btn')) toggleMax(win); });
    enableDrag(win, bar);
    enableResize(win, grip);

    layer.append(el);
    render(win);
    el.classList.add('is-opening');
    el.addEventListener('animationend', () => el.classList.remove('is-opening'), { once: true });
    sfx.open();
    focus(win);
    return win;
  }

  function close(win) {
    if (!wins.has(win.key)) return;
    win.spec.onClose?.();
    wins.delete(win.key);
    win.el.remove();
    sfx.close();
    focus(active());
    notify();
  }

  function minimize(win) {
    win.minimized = true;
    win.el.hidden = true;
    win.el.classList.remove('is-active');
    focus(active());
    notify();
  }

  function toggleMax(win) {
    win.maximized = !win.maximized;
    win.el.classList.toggle('is-max', win.maximized);
    win.btnMax.setAttribute('aria-pressed', String(win.maximized));
    focus(win);
  }

  function enableDrag(win, handle) {
    let start = null;
    handle.addEventListener('pointerdown', (e) => {
      if (e.button !== 0 || e.target.closest('.win-btn') || win.maximized) return;
      start = { x: e.clientX, y: e.clientY, left: win.el.offsetLeft, top: win.el.offsetTop, scale: getScale() };
      handle.setPointerCapture(e.pointerId);
      win.el.classList.add('is-dragging');
    });
    handle.addEventListener('pointermove', (e) => {
      if (!start) return;
      const dx = (e.clientX - start.x) / start.scale;
      const dy = (e.clientY - start.y) / start.scale;
      const w = win.el.offsetWidth;
      const left = Math.max(-w + 80, Math.min(DESK_W - 80, start.left + dx));
      const top = Math.max(0, Math.min(DESK_H - 30, start.top + dy));
      win.el.style.left = `${Math.round(left)}px`;
      win.el.style.top = `${Math.round(top)}px`;
    });
    const end = () => { start = null; win.el.classList.remove('is-dragging'); };
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  function enableResize(win, grip) {
    let start = null;
    grip.addEventListener('pointerdown', (e) => {
      if (win.maximized) return;
      e.stopPropagation();
      start = { x: e.clientX, y: e.clientY, w: win.el.offsetWidth, h: win.el.offsetHeight, scale: getScale() };
      grip.setPointerCapture(e.pointerId);
    });
    grip.addEventListener('pointermove', (e) => {
      if (!start) return;
      const w = Math.max(300, Math.min(DESK_W - win.el.offsetLeft, start.w + (e.clientX - start.x) / start.scale));
      const hh = Math.max(180, Math.min(DESK_H - win.el.offsetTop, start.h + (e.clientY - start.y) / start.scale));
      win.el.style.width = `${Math.round(w)}px`;
      win.el.style.height = `${Math.round(hh)}px`;
    });
    const end = () => { start = null; };
    grip.addEventListener('pointerup', end);
    grip.addEventListener('pointercancel', end);
  }

  return {
    open,
    close,
    focus,
    minimize,
    toggleMax,
    active,
    get: (key) => wins.get(key),
    // Lets a window (e.g. the explorer navigating in place) represent a different node.
    rekey(win, newKey) {
      if (wins.has(newKey) && wins.get(newKey) !== win) {
        focus(wins.get(newKey));
        return false;
      }
      wins.delete(win.key);
      win.key = newKey;
      wins.set(newKey, win);
      notify();
      return true;
    },
    list: () => [...wins.values()],
    closeAll: () => { for (const w of [...wins.values()]) close(w); },
    rerenderAll: () => { for (const w of wins.values()) render(w); notify(); },
  };
}
