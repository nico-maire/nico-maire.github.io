// Step-by-step guided tour: highlights a desktop element and explains it.
import { h } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { bus } from '../core/bus.js';
import { pixelSvg } from '../core/icons.js';

let current = null;

function steps(os) {
  const list = [
    { target: null, key: 'guide.s.welcome' },
    { target: '[data-id="about"]', key: 'guide.s.about' },
    { target: '[data-id="projects"]', key: 'guide.s.projects' },
    { target: '[data-id="skills"]', key: 'guide.s.skills' },
    { target: '[data-id="knowledge"]', key: 'guide.s.knowledge' },
    { target: '[data-id="experience"]', key: 'guide.s.experience' },
    { target: '[data-id="contact"]', key: 'guide.s.contact' },
    { target: '[data-id="cv"]', key: 'guide.s.cv' },
    { target: '.os-widget', key: 'guide.s.widget' },
    { target: '.tb-tray', key: 'guide.s.tray' },
    { target: '.tb-start', key: 'guide.s.start' },
    { target: '[data-id="terminal"]', key: 'guide.s.terminal' },
    { target: '[data-id="quick"]', key: 'guide.s.quick' },
  ];
  if (os.host.mode === 'scene') list.push({ target: null, key: 'guide.s.office', office: true });
  list.push({ target: null, key: 'guide.s.end' });
  return list;
}

export function stopGuide() {
  if (!current) return;
  current.cleanup();
  current = null;
}

export function startGuide(os) {
  stopGuide();
  const list = steps(os);
  let index = 0;
  const box = h('div', { class: 'guide-box', role: 'dialog', 'aria-modal': 'true', 'aria-live': 'polite' });
  const ring = h('div', { class: 'guide-ring', 'aria-hidden': 'true' });
  const layer = h('div', { class: 'guide-layer' }, ring, box);
  os.root.append(layer);

  function rectOf(selector) {
    const el = selector && os.root.querySelector(selector);
    if (!el) return null;
    const rootBox = os.root.getBoundingClientRect();
    const scale = rootBox.width / os.root.offsetWidth || 1;
    const r = el.getBoundingClientRect();
    return {
      x: (r.left - rootBox.left) / scale,
      y: (r.top - rootBox.top) / scale,
      w: r.width / scale,
      h: r.height / scale,
    };
  }

  function render() {
    const step = list[index];
    const r = rectOf(step.target);
    if (step.office) os.host.hintObjects?.();
    ring.hidden = !r;
    if (r) {
      Object.assign(ring.style, { left: `${r.x - 8}px`, top: `${r.y - 8}px`, width: `${r.w + 16}px`, height: `${r.h + 16}px` });
    }
    const last = index === list.length - 1;
    box.replaceChildren(
      h('header', { class: 'guide-head' },
        h('span', { class: 'px-ico', html: pixelSvg('help') }),
        h('span', {}, t('guide.title')),
        h('span', { class: 'guide-count' }, `${index + 1}/${list.length}`)),
      h('p', { class: 'guide-text' }, t(step.key)),
      h('div', { class: 'guide-actions' },
        h('button', { class: 'btn', type: 'button', disabled: index === 0, onClick: () => go(-1) }, `< ${t('guide.prev')}`),
        last
          ? h('button', { class: 'btn btn-primary', type: 'button', onClick: stopGuide }, t('guide.done'))
          : h('button', { class: 'btn btn-primary', type: 'button', onClick: () => go(1) }, `${t('guide.next')} >`),
        h('button', { class: 'btn btn-ghost', type: 'button', onClick: stopGuide }, t('guide.skip'))),
    );
    // Place the box next to the highlighted element, or centred
    const bw = 420;
    let x = 302;
    let y = 220;
    if (r) {
      x = r.x + r.w + 24;
      y = Math.max(12, Math.min(768 - 36 - 230, r.y - 10));
      if (x + bw > 1012) x = Math.max(12, r.x - bw - 24);
      if (r.y > 600) y = r.y - 250;
    }
    Object.assign(box.style, { left: `${x}px`, top: `${y}px`, width: `${bw}px` });
    box.querySelector('.btn-primary')?.focus();
  }

  function go(delta) {
    index = Math.max(0, Math.min(list.length - 1, index + delta));
    render();
  }

  const onKey = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); stopGuide(); }
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  };
  document.addEventListener('keydown', onKey, true);
  const offLang = bus.on('lang', render);

  current = {
    cleanup() {
      document.removeEventListener('keydown', onKey, true);
      offLang();
      layer.remove();
    },
  };
  render();
}
