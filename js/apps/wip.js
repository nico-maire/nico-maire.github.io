// Work in progress: a compile that never quite finishes (projects not published yet).
import { h } from '../core/dom.js';
import { t } from '../core/i18n.js';

export default function wip(node) {
  let timer = null;
  return {
    title: () => node.name(),
    icon: 'hourglass',
    size: [600, 420],
    onClose: () => clearInterval(timer),
    mount(body) {
      clearInterval(timer);
      const bar = h('span', { class: 'meter meter-wide', 'aria-hidden': 'true' }, Array.from({ length: 30 }, () => h('i')));
      const pct = h('span', { class: 'wip-pct' }, '0%');
      const log = h('pre', { class: 'term-out wip-log' });
      body.append(h('article', { class: 'sheet' },
        h('h1', { class: 'sheet-title' }, t('wip.title')),
        h('p', {}, t('wip.text')),
        h('div', { class: 'wip-progress' }, bar, pct),
        log,
        h('p', { class: 'note' }, t('wip.note'))));
      const steps = t('wip.log').split('|');
      let p = 0;
      let line = 0;
      timer = setInterval(() => {
        if (!body.isConnected) { clearInterval(timer); return; }
        p = Math.min(87, p + Math.ceil(Math.random() * 4));
        [...bar.children].forEach((el, i) => el.classList.toggle('on', i < Math.round((p / 100) * 30)));
        pct.textContent = `${p}%`;
        if (line < steps.length && Math.random() < 0.45) log.textContent += `${steps[line++]}\n`;
        if (p >= 87 && line >= steps.length) {
          clearInterval(timer);
          log.textContent += `${t('wip.stuck')}\n`;
        }
      }, 220);
    },
  };
}
