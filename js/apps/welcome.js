// First-boot welcome dialog: guided tour, explore freely or quick view.
import { h } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { go } from '../core/router.js';
import { pxIcon } from './ui.js';
import { startGuide } from '../os/guide.js';

export default function welcome(_node, os) {
  return {
    title: () => t('welcome.title'),
    icon: 'help',
    size: [560, 400],
    className: 'win-dialog',
    mount(body, win) {
      body.append(h('div', { class: 'welcome' },
        h('pre', { class: 'welcome-art', 'aria-hidden': 'true' }, '  .---------.\n  | NicOS   |\n  |  > _    |\n  \'---------\'\n  /_________\\'),
        h('div', {},
          h('h1', { class: 'sheet-title' }, t('welcome.heading')),
          h('p', {}, t('welcome.text')),
          h('div', { class: 'welcome-actions' },
            h('button', { class: 'btn btn-primary', type: 'button', onClick: () => { win.close(); startGuide(os); } }, pxIcon('help'), h('span', {}, t('welcome.tour'))),
            h('button', { class: 'btn', type: 'button', onClick: () => win.close() }, pxIcon('computer'), h('span', {}, t('welcome.explore'))),
            h('button', { class: 'btn', type: 'button', onClick: () => { win.close(); go('quick'); } }, pxIcon('printer'), h('span', {}, t('welcome.quick')))))));
    },
  };
}
