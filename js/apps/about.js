// README / About me: photo, status, presentation and quick actions.
import { h } from '../core/dom.js';
import { t, tr } from '../core/i18n.js';
import { db } from '../core/data.js';
import { extLink, button } from './ui.js';

export default function about(node, os) {
  const p = db.profile;
  return {
    title: () => node.name(),
    icon: 'id',
    size: [760, 560],
    mount(body) {
      body.append(h('article', { class: 'about' },
        h('div', { class: 'about-side' },
          h('figure', { class: 'about-photo' },
            h('div', { class: 'photo-frame' }, h('div', { class: 'photo-dither', role: 'img', 'aria-label': p.name, style: { '--photo': `url(${p.photo})` } })),
            h('figcaption', { class: 'dim' }, 'NICOLAS.BMP')),
          h('div', { class: 'status-box' },
            h('p', { class: 'w-status' }, h('span', { class: 'w-dot', 'aria-hidden': 'true' }), tr(p.status).toUpperCase()),
            h('p', { class: 'dim' }, tr(p.location))),
          h('div', { class: 'about-actions' },
            button(t('w.cv'), () => os.open('cv'), { icon: 'disk', primary: true }),
            button(t('w.contact'), () => os.open('contact'), { icon: 'mail' }),
            extLink('linkedin', p.links.linkedin, 'LinkedIn'),
            extLink('github', p.links.github, 'GitHub'))),
        h('div', { class: 'about-main' },
          h('p', { class: 'dim' }, 'C:\\> TYPE ' + node.name()),
          h('h1', { class: 'about-name' }, p.name),
          h('p', { class: 'about-role' }, tr(p.role)),
          tr(p.about).map((par) => h('p', { class: 'about-p' }, par)),
          h('p', { class: 'about-quote' }, `"${p.quote}"`))));
    },
  };
}
