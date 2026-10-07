// Image viewer window (enlarged project media).
import { h } from '../core/dom.js';
import { t, tr } from '../core/i18n.js';

export default function viewer({ media, title }) {
  return {
    title: () => `${t('viewer.title')}: ${title || ''}`,
    icon: 'image',
    size: [900, 640],
    bodyClass: 'viewer',
    mount(body) {
      body.append(h('div', { class: ['viewer-frame', media.tint && 'media-frame is-tinted'] },
        h('img', { src: media.src, alt: media.caption ? tr(media.caption) : title || '' })));
    },
  };
}
