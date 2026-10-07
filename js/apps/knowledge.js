// Knowledge area document: summary, concepts and related projects.
import { h } from '../core/dom.js';
import { t, tr } from '../core/i18n.js';
import { db } from '../core/data.js';
import { pathOf } from '../core/fs.js';

export default function knowledge(node, os) {
  const k = db.knowledgeById.get(node.args.knowledge);
  return {
    title: () => tr(k.title),
    icon: 'book',
    size: [600, 470],
    status: () => pathOf(node.id),
    mount(body) {
      body.append(h('article', { class: 'sheet' },
        h('h1', { class: 'sheet-title' }, tr(k.title)),
        h('p', { class: 'sheet-summary' }, tr(k.summary)),
        h('h2', { class: 'sheet-h' }, t('know.concepts')),
        h('div', { class: 'chips' }, k.concepts.map((c) => h('span', { class: 'chip-tag' }, tr(c)))),
        h('h2', { class: 'sheet-h' }, t('know.projects')),
        h('ul', { class: 'link-list' }, k.projects.map((id) => db.projectById.get(id)).filter(Boolean).map((p) => h('li', {},
          h('button', { class: 'link', type: 'button', onClick: () => os.open(`p/${p.id}`) }, `> ${tr(p.title)}`))))));
    },
  };
}
