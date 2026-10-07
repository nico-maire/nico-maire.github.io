// Spoken languages with level bars.
import { h } from '../core/dom.js';
import { t, tr } from '../core/i18n.js';
import { db } from '../core/data.js';

export default function languages(node) {
  return {
    title: () => node.label(),
    icon: 'globe',
    size: [600, 400],
    mount(body) {
      body.append(h('article', { class: 'sheet' },
        h('p', { class: 'dim' }, `C:\\> TYPE ${node.name()}`),
        h('h1', { class: 'sheet-title' }, t('lang.title')),
        h('div', { class: 'lang-table' }, db.languages.map((l) => h('div', { class: 'lang-row' },
          h('span', { class: 'lang-code' }, l.code.toUpperCase()),
          h('span', { class: 'lang-name' }, tr(l.name)),
          h('span', { class: 'meter', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '10', 'aria-valuenow': String(l.score), 'aria-label': tr(l.name) },
            Array.from({ length: 10 }, (_, i) => h('i', { class: i < l.score ? 'on' : '' }))),
          h('span', { class: 'lang-level' }, tr(l.level))))),
        h('p', { class: 'note' }, t('lang.note'))));
    },
  };
}
