// Plain text document (trash files, coffee easter egg).
import { h } from '../core/dom.js';
import { t } from '../core/i18n.js';

export default function text(node) {
  return {
    title: () => t(node.args.title),
    icon: 'doc',
    size: [520, 320],
    mount(body) {
      body.append(h('pre', { class: 'textdoc' }, t(node.args.text)));
    },
  };
}
