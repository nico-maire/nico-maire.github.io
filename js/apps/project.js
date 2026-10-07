// Project sheet: header, media, summary, highlights, technologies and links. Confidential files open with an "access" sequence.
import { h, sleep, reducedMotion } from '../core/dom.js';
import { t, tr } from '../core/i18n.js';
import { db } from '../core/data.js';
import { pathOf } from '../core/fs.js';
import { sfx } from '../core/sound.js';
import { pxIcon, extLink, skillChip, contextLabel, visibilityBadge, mediaViewer } from './ui.js';

const unlocked = new Set();

export default function project(node, os) {
  const p = db.projectById.get(node.args.project);
  const locked = p.visibility === 'confidential' && !unlocked.has(p.id);

  function renderSheet(body) {
    const links = p.links.map((l) => extLink(l.type, l.url));
    const note = p.visibility === 'confidential'
      ? h('p', { class: 'note note-warn' }, pxIcon('warning'), t('proj.note.confidential'))
      : p.visibility === 'private'
        ? h('p', { class: 'note' }, pxIcon('lock'), t('proj.note.private'))
        : p.visibility === 'product'
          ? h('p', { class: 'note' }, pxIcon('lock'), t('proj.note.product'))
          : null;

    body.append(h('article', { class: 'sheet' },
      h('header', { class: 'sheet-head' },
        h('div', { class: 'sheet-title-row' }, h('h1', { class: 'sheet-title' }, tr(p.title)), visibilityBadge(p)),
        h('p', { class: 'sheet-meta' }, contextLabel(p)),
        p.role || p.team ? h('p', { class: 'sheet-meta dim' }, [p.role && tr(p.role), p.team && tr(p.team)].filter(Boolean).join(' · ')) : null),
      mediaViewer(p.media, { os, title: tr(p.title) }) || (p.visibility === 'confidential' || p.visibility === 'private' ? classifiedCover() : null),
      h('p', { class: 'sheet-summary' }, tr(p.summary)),
      h('h2', { class: 'sheet-h' }, t('proj.highlights')),
      h('ul', { class: 'sheet-list' }, tr(p.highlights).map((x) => h('li', {}, x))),
      h('h2', { class: 'sheet-h' }, t('proj.stack')),
      h('div', { class: 'chips' }, p.skills.map((s) => skillChip(s, os))),
      note,
      links.length ? h('div', { class: 'sheet-links' }, links) : null,
    ));
  }

  function classifiedCover() {
    return h('div', { class: 'classified', 'aria-hidden': 'true' },
      h('div', { class: 'classified-stamp' }, t('proj.stamp')),
      h('div', { class: 'redacted' }, Array.from({ length: 6 }, (_, i) => h('span', { style: { width: `${55 + ((i * 37) % 40)}%` } }))));
  }

  async function accessSequence(body, win) {
    const log = h('pre', { class: 'access-log' });
    const skip = h('button', { class: 'btn btn-sm', type: 'button' }, t('proj.access.skip'));
    body.append(h('div', { class: 'access' }, pxIcon('lock', 'access-ico'), h('h1', { class: 'access-title' }, t('proj.access.title')), log, skip));
    let skipped = reducedMotion();
    skip.onclick = () => { skipped = true; };
    const lines = [
      `> ${t('proj.access.file')}: ${node.name()}`,
      `> ${t('proj.access.level')}: ${t('vis.confidential').toUpperCase()}`,
      `> ${t('proj.access.password')}: `,
    ];
    for (const line of lines) {
      if (skipped) break;
      log.textContent += `${line}\n`;
      await sleep(260);
    }
    if (!skipped) {
      log.textContent = log.textContent.trimEnd() + ' ';
      for (let i = 0; i < 8 && !skipped; i++) {
        log.textContent += '*';
        sfx.key();
        await sleep(70);
      }
      log.textContent += `\n> ${t('proj.access.denied')}\n> ${t('proj.access.public')}\n`;
      sfx.error();
      await sleep(skipped ? 0 : 900);
    }
    unlocked.add(p.id);
    if (win.body.isConnected) win.rerender();
  }

  return {
    title: () => tr(p.title),
    icon: node.icon,
    size: [720, 560],
    status: () => pathOf(node.id),
    mount(body, win) {
      if (p.visibility === 'confidential' && !unlocked.has(p.id) && locked) {
        accessSequence(body, win);
        return;
      }
      renderSheet(body);
    },
  };
}
