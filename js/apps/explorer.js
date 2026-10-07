// Folder browser with icon, list and grouped views. Navigates in place and keeps a back history.
import { h } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { getNode, childrenOf, parentOf, pathOf } from '../core/fs.js';
import { pxIcon, brandIcon } from './ui.js';
import { pixelSvg } from '../core/icons.js';
import { sfx } from '../core/sound.js';

export default function explorer(node, os) {
  let current = node.id;
  const history = [];
  let viewMode = null;
  let selected = null;
  let win = null;

  function navigate(id, push = true) {
    if (!win || id === current) return;
    if (!os.wm.rekey(win, id)) return;
    if (push) history.push(current);
    current = id;
    viewMode = null;
    selected = null;
    win.rerender();
  }

  function openItem(item) {
    if (item.kind === 'folder' && item.app === 'explorer') navigate(item.id);
    else os.open(item.id);
  }

  function itemIcon(item) {
    if (item.brand !== undefined) return brandIcon(item.brand, 'fs-ico');
    return pxIcon(item.kind === 'folder' && item.app === 'explorer' ? (item.id === 'trash' ? 'trash' : 'folder') : item.icon, 'fs-ico');
  }

  function itemButton(item, list) {
    const props = {
      class: ['fs-item', selected === item.id && 'is-selected'],
      type: 'button',
      title: item.label(),
      onClick: (e) => {
        selected = item.id;
        e.currentTarget.parentElement.querySelectorAll('.fs-item').forEach((el) => el.classList.remove('is-selected'));
        e.currentTarget.classList.add('is-selected');
        sfx.click();
        if (e.pointerType === 'touch' || e.detail === 0) openItem(item);
      },
      onDblclick: () => openItem(item),
    };
    if (list) {
      return h('button', props, itemIcon(item),
        h('span', { class: 'fs-name' }, item.name()),
        h('span', { class: 'fs-desc' }, item.kind === 'folder' ? `<${t('fs.dir')}>` : item.label()),
        h('span', { class: 'fs-meta' }, item.meta?.() || ''));
    }
    return h('button', props, itemIcon(item), h('span', { class: 'fs-label' }, item.label()));
  }

  return {
    title: () => getNode(current).label(),
    icon: node.icon === 'computer' ? 'computer' : 'folder',
    size: [680, 470],
    bodyClass: 'explorer',
    status: () => t('fs.count', { n: childrenOf(current).length }),
    mount(body, w) {
      win = w;
      const folder = getNode(current);
      const mode = viewMode || folder.view || 'grid';
      const up = parentOf(current);
      const toolbar = h('div', { class: 'toolbar' },
        h('button', { class: 'btn btn-icon', type: 'button', title: t('fs.back'), 'aria-label': t('fs.back'), disabled: !history.length, onClick: () => navigate(history.pop(), false) }, pxIcon('back')),
        h('button', { class: 'btn btn-icon', type: 'button', title: t('fs.up'), 'aria-label': t('fs.up'), disabled: !up || up === 'root', onClick: () => navigate(up) }, pxIcon('up')),
        h('div', { class: 'addr', role: 'textbox', 'aria-readonly': 'true', 'aria-label': t('fs.path') }, pathOf(current)),
        mode !== 'groups' ? h('div', { class: 'seg' },
          h('button', { class: 'btn btn-icon', type: 'button', 'aria-pressed': String(mode === 'grid'), title: t('fs.icons'), 'aria-label': t('fs.icons'), onClick: () => { viewMode = 'grid'; w.rerender(); } }, pxIcon('grid')),
          h('button', { class: 'btn btn-icon', type: 'button', 'aria-pressed': String(mode === 'list'), title: t('fs.list'), 'aria-label': t('fs.list'), onClick: () => { viewMode = 'list'; w.rerender(); } }, pxIcon('list'))) : null);

      let content;
      if (mode === 'groups') {
        content = h('div', { class: 'fs-groups' }, childrenOf(current).map((group) => h('section', { class: 'fs-group' },
          h('h3', { class: 'fs-group-title' }, h('button', { class: 'link', type: 'button', onClick: () => navigate(group.id) }, `${group.label()}`), h('span', { class: 'dim' }, ` [${childrenOf(group.id).length}]`)),
          h('div', { class: 'fs-grid fs-grid-sm' }, childrenOf(group.id).map((it) => itemButton(it, false))))));
      } else if (mode === 'list') {
        content = h('div', { class: 'fs-list' },
          h('div', { class: 'fs-list-head', 'aria-hidden': 'true' }, h('span'), h('span', {}, t('fs.col.name')), h('span', {}, t('fs.col.desc')), h('span', {}, t('fs.col.year'))),
          childrenOf(current).map((it) => itemButton(it, true)));
      } else {
        content = h('div', { class: 'fs-grid' }, childrenOf(current).map((it) => itemButton(it, false)));
      }
      body.append(toolbar, h('div', { class: 'fs-view' }, content));
      w.statusEl.hidden = false;
      w.statusEl.textContent = t('fs.count', { n: childrenOf(current).length });
      w.icoEl.innerHTML = pixelSvg(folder.icon === 'computer' ? 'computer' : 'folder');
      w.titleEl.textContent = folder.label();
    },
  };
}
