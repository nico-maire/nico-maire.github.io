// Desktop experience: the office scene, the monitor, power on/off, zoom and the clickable objects.
import { h, sleep, reducedMotion } from '../core/dom.js';
import { db } from '../core/data.js';
import { t, LANGS, getLang, setLang } from '../core/i18n.js';
import { bus } from '../core/bus.js';
import { prefs, setPref, load, save } from '../core/store.js';
import { sfx, startHum, stopHum } from '../core/sound.js';
import { pixelSvg } from '../core/icons.js';
import { go } from '../core/router.js';
import { runBoot } from './boot.js';
import { createOS } from '../os/os.js';

const OS_W = 1024;
const OS_H = 768;

// Which hotspot lights up when a node opens
const NODE_OBJECT = { education: 'diploma', languages: 'map', knowledge: 'books', experience: 'binders', skills: 'robot', projects: 'floppies', terminal: 'keyboard', contact: 'nokia', cv: 'cvsheet' };

export function mountDesk(app, { mode, deepLink }) {
  const cfg = db.scene;
  const S = cfg.screen;
  const state = { power: 'off', view: mode === 'scene' ? 'overview' : 'zoomed', mode, os: null, boot: null, scale: 1 };

  // ---------------------------------------------------------------- DOM
  const stage = h('div', { class: 'stage', style: { width: `${cfg.width}px`, height: `${cfg.height}px` } });
  const layers = cfg.layers.map((l, i) => h('img', {
    class: ['layer', i === 0 && cfg.layers.length > 1 ? 'layer-back' : 'layer-front'],
    src: l.src, alt: '', draggable: 'false', decoding: 'async', dataset: { depth: l.depth || 0 },
  }));
  const pad = 170;
  const glow = h('div', { class: 'screen-glow', style: { left: `${S.x - pad}px`, top: `${S.y - pad}px`, width: `${S.w + pad * 2}px`, height: `${S.h + pad * 2}px` } });

  const osRoot = h('div', { class: 'os', id: 'os' });
  // Overscan: keep the OS away from the rounded corners of the glass
  const M = S.inset ?? 9;
  const osScale = (S.w - M * 2) / OS_W;
  const osWrap = h('div', { class: 'os-wrap', style: { left: `${M}px`, top: `${M}px`, transform: `scale(${osScale}, ${(S.h - M * 2) / OS_H})` } },
    osRoot, h('div', { class: 'crt-fx', 'aria-hidden': 'true' }));
  const tube = h('div', { class: 'crt-tube crt-flicker' }, osWrap);
  const zoomTarget = h('button', { class: 'screen-zoom-target', type: 'button', onClick: () => zoomIn() });
  const screen = h('div', {
    class: 'screen',
    style: { left: `${S.x}px`, top: `${S.y}px`, width: `${S.w}px`, height: `${S.h}px`, borderRadius: `${S.radius || 0}px` },
  }, tube, zoomTarget);

  const P = cfg.power;
  const powerBtn = h('button', {
    class: 'power-btn', type: 'button',
    style: { left: `${P.x}px`, top: `${P.y}px`, width: `${P.w}px`, height: `${P.h}px` },
    onClick: (e) => { e.stopPropagation(); state.power === 'off' ? powerOn() : powerOff(); },
  });
  const leds = cfg.leds.map((l) => h('span', {
    class: `led led-${l.id}`, 'aria-hidden': 'true',
    style: { left: `${l.x - l.r}px`, top: `${l.y - l.r}px`, width: `${l.r * 2}px`, height: `${l.r * 2}px` },
  }));
  const callout = h('div', { class: 'callout', style: { left: `${cfg.callout.x}px`, top: `${cfg.callout.y}px` }, 'aria-hidden': 'true' });

  const BEZEL = new Set(['postit-mail', 'postit-github', 'postit-linkedin']);
  const hotspots = cfg.hotspots.map((hs) => h('button', {
    class: 'hotspot', type: 'button', dataset: { hot: hs.id, ...(BEZEL.has(hs.id) ? { bezel: '' } : {}), ...(hs.y < 200 ? { below: '' } : {}) },
    style: { left: `${hs.x}px`, top: `${hs.y}px`, width: `${hs.w}px`, height: `${hs.h}px` },
    onClick: (e) => { e.stopPropagation(); activateHotspot(hs); },
  }, h('span', { class: 'hotspot-label' })));

  stage.append(...layers, glow, screen, powerBtn, ...leds, callout, ...hotspots);

  const ui = h('div', { class: 'scene-ui' });
  const vignette = h('div', { class: 'vignette', 'aria-hidden': 'true' });
  const root = h('div', { class: 'scene', dataset: { power: 'off', view: state.view, mode } }, stage, vignette, ui);
  app.replaceChildren(root);

  // ---------------------------------------------------------------- layout
  function fit() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let s;
    let tx;
    let ty;
    if (state.view === 'overview') {
      s = Math.max(vw / cfg.width, vh / cfg.height);
      tx = (vw - cfg.width * s) / 2;
      ty = (vh - cfg.height * s) / 2;
    } else {
      s = Math.min((vw * 0.97) / S.w, (vh * 0.87) / S.h);
      tx = vw / 2 - (S.x + S.w / 2) * s;
      ty = vh / 2 - (S.y + S.h / 2) * s;
    }
    state.scale = s;
    stage.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${s.toFixed(4)})`;
  }

  function setView(view) {
    state.view = view;
    root.dataset.view = view;
    fit();
    renderUI();
  }

  function setPower(p) {
    state.power = p;
    root.dataset.power = p;
    renderUI();
  }

  // ---------------------------------------------------------------- parallax (overview only)
  function onMove(e) {
    if (state.view !== 'overview' || reducedMotion()) return;
    const dx = e.clientX / window.innerWidth - 0.5;
    const dy = e.clientY / window.innerHeight - 0.5;
    for (const img of layers) {
      const depth = +img.dataset.depth;
      if (depth) img.style.transform = `translate(${(-dx * depth).toFixed(1)}px, ${(-dy * depth * 0.6).toFixed(1)}px) scale(1.03)`;
    }
  }

  // ---------------------------------------------------------------- power
  function zoomIn() {
    if (state.view !== 'zoomed') setView('zoomed');
  }

  function zoomOut() {
    if (mode === 'scene' && state.view !== 'overview') setView('overview');
  }

  async function powerOn({ fast = false } = {}) {
    if (state.power === 'on') return;
    if (state.boot) return state.boot;
    setPower('booting');
    sfx.power();
    startHum();
    zoomIn();
    tube.classList.remove('turning-off');
    tube.classList.add('turning-on');
    state.boot = (async () => {
      const quick = fast || reducedMotion();
      await sleep(quick ? 50 : 650);
      const seen = load('booted', false);
      await runBoot(osRoot, { fast: quick || seen });
      save('booted', true);
      state.os = createOS(osRoot, host);
      setPower('on');
      tube.classList.remove('turning-on');
      state.boot = null;
    })();
    return state.boot;
  }

  async function powerOff() {
    if (state.power !== 'on') return;
    state.os?.destroy();
    state.os = null;
    tube.classList.remove('turning-on');
    tube.classList.add('turning-off');
    stopHum();
    await sleep(reducedMotion() ? 0 : 460);
    osRoot.replaceChildren();
    setPower('off');
    zoomOut();
    go('', { replace: true, silent: true });
  }

  async function restart() {
    await powerOff();
    await sleep(500);
    await powerOn();
  }

  async function openNode(id) {
    await powerOn({ fast: true });
    zoomIn();
    state.os?.open(id);
  }

  function activateHotspot(hs) {
    sfx.click();
    if (hs.url) {
      window.open(db.profile.links[hs.url], '_blank', 'noopener');
      return;
    }
    openNode(hs.open);
  }

  function highlightObject(id) {
    const hot = NODE_OBJECT[id] && root.querySelector(`[data-hot="${NODE_OBJECT[id]}"]`);
    if (!hot || state.view !== 'overview') return;
    hot.classList.add('is-hinted');
    setTimeout(() => hot.classList.remove('is-hinted'), 3200);
  }

  function hintObjects() {
    for (const el of hotspots) {
      el.classList.add('is-hinted');
      setTimeout(() => el.classList.remove('is-hinted'), 3200);
    }
    if (mode === 'scene') setTimeout(() => zoomOut(), 50);
  }

  const host = {
    mode,
    deepLink,
    getScale: () => state.scale * osScale,
    powerOff,
    restart,
    zoomOut,
    highlightObject,
    hintObjects,
  };

  // ---------------------------------------------------------------- overlay UI (outside the screen)
  function renderUI() {
    const langs = h('div', { class: 'chip-group', role: 'group', 'aria-label': t('tb.lang') }, LANGS.map((l) => h('button', {
      class: 'chip', type: 'button', 'aria-pressed': String(l.code === getLang()), lang: l.code, title: l.name,
      onClick: () => setLang(l.code),
    }, l.label)));
    const sound = h('button', {
      class: 'chip', type: 'button', 'aria-pressed': String(prefs.sound), title: t('tb.sound'), 'aria-label': t('tb.sound'),
      onClick: () => { setPref('sound', !prefs.sound); sfx.beep(); },
    }, h('span', { class: 'px-ico', html: pixelSvg(prefs.sound ? 'speaker' : 'mute') }));
    const quick = h('button', { class: 'chip', type: 'button', onClick: () => go('quick') },
      h('span', { class: 'px-ico', html: pixelSvg('printer') }), t('scene.quick'));
    const bar = h('div', { class: 'scene-bar' }, state.power === 'off' ? langs : null, sound, quick);

    const viewToggle = h('button', {
      class: 'chip view-toggle', type: 'button',
      onClick: () => (state.view === 'zoomed' ? zoomOut() : zoomIn()),
    }, h('span', { class: 'px-ico', html: pixelSvg(state.view === 'zoomed' ? 'back' : 'computer') }),
    state.view === 'zoomed' ? t('scene.office') : t('scene.monitor'));

    const cta = h('div', { class: 'cta' },
      h('button', { class: 'cta-main', type: 'button', onClick: () => powerOn() },
        h('span', {}, t(mode === 'scene' ? 'scene.cta' : 'scene.cta.monitor')), h('span', { class: 'blink' }, ' _')),
      h('div', { class: 'cta-sub' },
        h('button', { class: 'chip', type: 'button', onClick: () => powerOn({ fast: true }) }, t('scene.skip')),
        h('button', { class: 'chip', type: 'button', onClick: () => go('quick') }, t('scene.quick'))));

    ui.replaceChildren(bar, viewToggle, cta);

    callout.replaceChildren(
      h('div', { class: 'callout-box' }, t('scene.callout'), h('small', {}, t('scene.callout.sub'))),
      h('div', { class: 'callout-arrow' }));
    powerBtn.setAttribute('aria-label', t(state.power === 'off' ? 'scene.power.on' : 'scene.power.off'));
    zoomTarget.setAttribute('aria-label', t('scene.monitor'));
    hotspots.forEach((el, i) => {
      const label = t(cfg.hotspots[i].label);
      el.setAttribute('aria-label', label);
      el.firstChild.textContent = label;
    });
  }

  // ---------------------------------------------------------------- events
  const onResize = () => fit();
  const onKey = (e) => {
    if (state.power === 'off' && (e.key === 'Enter' || e.key === ' ') && !e.target.closest?.('button, a, input, textarea')) {
      e.preventDefault();
      powerOn();
    }
  };
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKey);
  root.addEventListener('pointermove', onMove);
  const offLang = bus.on('lang', renderUI);
  const offPrefs = bus.on('prefs', ({ key }) => { if (key === 'sound') renderUI(); });

  root.classList.add('no-anim');
  fit();
  renderUI();
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('no-anim')));

  return {
    openNode,
    powerOn,
    get os() { return state.os; },
    destroy() {
      state.os?.destroy();
      stopHum();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
      offLang();
      offPrefs();
      app.replaceChildren();
    },
  };
}
