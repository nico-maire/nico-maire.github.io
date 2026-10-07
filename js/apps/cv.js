// CV download: choose the language (defaults to the interface language).
import { h } from '../core/dom.js';
import { t, getLang, LANGS } from '../core/i18n.js';
import { pxIcon } from './ui.js';

export const cvUrl = (code) => `assets/cv/CV-NicolasMaireBravo-${code.toUpperCase()}.pdf`;

export default function cv(node) {
  let chosen = getLang();
  return {
    title: () => node.name(),
    icon: 'disk',
    size: [560, 430],
    mount(body, win) {
      const list = h('div', { class: 'radio-list', role: 'radiogroup', 'aria-label': t('cv.lang') },
        LANGS.map((l) => h('button', {
          class: 'radio', type: 'button', role: 'radio', 'aria-checked': String(l.code === chosen),
          onClick: () => { chosen = l.code; win.rerender(); },
        }, h('span', { class: 'radio-box', 'aria-hidden': 'true' }, l.code === chosen ? '(*)' : '( )'), `${l.label} · ${l.name}`)));
      body.append(h('article', { class: 'sheet' },
        h('h1', { class: 'sheet-title' }, t('cv.title')),
        h('p', {}, t('cv.intro')),
        h('h2', { class: 'sheet-h' }, t('cv.lang')),
        list,
        h('p', { class: 'dim' }, `> ${cvUrl(chosen).split('/').pop()}`),
        h('div', { class: 'sheet-links' },
          h('a', { class: 'btn btn-primary', href: cvUrl(chosen), download: '' }, pxIcon('download'), h('span', {}, t('cv.download'))),
          h('a', { class: 'btn', href: cvUrl(chosen), target: '_blank', rel: 'noopener' }, pxIcon('external'), h('span', {}, t('cv.open'))))));
    },
  };
}
