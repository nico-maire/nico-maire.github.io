// Experience and education timelines.
import { h } from '../core/dom.js';
import { t, tr } from '../core/i18n.js';
import { db } from '../core/data.js';

function entries(list, os) {
  return h('ol', { class: 'timeline' }, list.map((e) => h('li', { class: 'tl-item' },
    h('div', { class: 'tl-period' }, tr(e.period)),
    h('div', { class: 'tl-body' },
      h('h3', { class: 'tl-title' }, tr(e.title)),
      h('p', { class: 'tl-role' }, [tr(e.role), e.place && tr(e.place)].filter(Boolean).join(' · ')),
      h('p', { class: 'tl-text' }, tr(e.text)),
      e.project ? h('button', { class: 'link', type: 'button', onClick: () => os.open(`p/${e.project}`) }, `> ${t('tl.open')}`) : null))));
}

export function experience(node, os) {
  return {
    title: () => node.label(),
    icon: 'briefcase',
    size: [640, 480],
    mount(body) {
      body.append(h('article', { class: 'sheet' },
        h('p', { class: 'dim' }, `C:\\> TYPE ${node.name()}`),
        h('h1', { class: 'sheet-title' }, t('tl.experience')),
        entries(db.timeline.experience, os),
        h('p', { class: 'note' }, t('tl.expnote'))));
    },
  };
}

export function education(node, os) {
  return {
    title: () => node.label(),
    icon: 'cap',
    size: [660, 540],
    mount(body) {
      body.append(h('article', { class: 'sheet' },
        h('h1', { class: 'sheet-title' }, t('tl.education')),
        entries(db.timeline.education, os),
        h('h2', { class: 'sheet-h' }, t('tl.certs')),
        h('ul', { class: 'cert-list' }, db.timeline.certificates.map((c) => h('li', {},
          h('strong', {}, tr(c.title)), h('span', { class: 'dim' }, ` · ${tr(c.text)}`))))));
    },
  };
}
