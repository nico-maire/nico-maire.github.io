// Skill properties: where it has been used.
import { h } from '../core/dom.js';
import { t, tr } from '../core/i18n.js';
import { db } from '../core/data.js';
import { brandIcon } from './ui.js';

export default function skill(node, os) {
  const s = db.skillById.get(node.args.skill);
  const cat = db.skillCats.find((c) => c.id === s.cat);
  return {
    title: () => t('skill.title', { name: s.name }),
    icon: 'chip',
    size: [460, 380],
    mount(body) {
      const projects = db.projectsBySkill.get(s.id) || [];
      body.append(h('div', { class: 'props' },
        h('div', { class: 'props-head' }, brandIcon(s.icon, 'props-ico'),
          h('div', {}, h('h1', { class: 'sheet-title' }, s.name), h('p', { class: 'dim' }, tr(cat.title)))),
        h('h2', { class: 'sheet-h' }, t('skill.used', { n: projects.length })),
        projects.length
          ? h('ul', { class: 'link-list' }, projects.map((p) => h('li', {},
            h('button', { class: 'link', type: 'button', onClick: () => os.open(`p/${p.id}`) }, `> ${tr(p.title)}`),
            h('span', { class: 'dim' }, ` ${p.year}`))))
          : h('p', { class: 'dim' }, t('skill.none'))));
    },
  };
}
