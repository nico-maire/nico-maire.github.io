// Shared UI pieces for NicOS apps (and reused by the phone and the quick view where it makes sense).
import { h } from '../core/dom.js';
import { t, tr } from '../core/i18n.js';
import { pixelSvg } from '../core/icons.js';
import { brandSvg } from '../core/brands.js';
import { db } from '../core/data.js';

export function pxIcon(name, cls = '') {
  return h('span', { class: `px-ico ${cls}`, html: pixelSvg(name), 'aria-hidden': 'true' });
}

export function brandIcon(id, cls = '') {
  if (!id) return pxIcon('chip', cls);
  return h('span', { class: `brand-ico ${cls}`, html: brandSvg(id), 'aria-hidden': 'true' });
}

export function button(label, onClick, { icon, primary, small, title } = {}) {
  return h('button', {
    class: ['btn', primary && 'btn-primary', small && 'btn-sm'],
    type: 'button',
    title,
    onClick,
  }, icon && pxIcon(icon), h('span', {}, label));
}

const LINK_META = {
  github: { icon: 'github', brand: true, key: 'link.github' },
  web: { icon: 'globe', key: 'link.web' },
  youtube: { icon: 'youtube', brand: true, key: 'link.youtube' },
  linkedin: { icon: 'linkedin', key: 'link.linkedin' },
  mail: { icon: 'mail', key: 'link.mail' },
  pdf: { icon: 'download', key: 'link.pdf' },
};

export function extLink(type, url, label) {
  const meta = LINK_META[type] || { icon: 'external', key: 'link.open' };
  const isMail = url.startsWith('mailto:');
  return h('a', {
    class: 'btn btn-link',
    href: url,
    target: isMail ? null : '_blank',
    rel: isMail ? null : 'noopener noreferrer',
  },
  meta.brand ? brandIcon(meta.icon) : pxIcon(meta.icon),
  h('span', {}, label || t(meta.key)),
  isMail ? null : pxIcon('external', 'ext-mark'));
}

export function skillChip(skillId, os) {
  const skill = db.skillById.get(skillId);
  if (!skill) return null;
  return h('button', {
    class: 'chip-skill',
    type: 'button',
    title: t('skill.open', { name: skill.name }),
    onClick: () => os?.open(`s/${skill.id}`),
  }, brandIcon(skill.icon), skill.name);
}

export function contextLabel(project) {
  const parts = [];
  if (project.year) parts.push(project.year);
  parts.push(t(`ctx.${project.context}`));
  if (project.course) parts.push(tr(project.course));
  return parts.join(' · ');
}

export function visibilityBadge(project) {
  return h('span', { class: `badge badge-${project.visibility}` }, t(`vis.${project.visibility}`));
}

// Media viewer: images (tinted or colour), videos with retro controls, and recorded terminal output.
export function mediaViewer(items, { os, title, compact = false } = {}) {
  if (!items?.length) return null;
  let index = 0;
  const stage = h('div', { class: 'media-stage' });
  const caption = h('p', { class: 'media-caption' });
  const thumbs = h('div', { class: 'media-thumbs' });
  const tools = h('div', { class: 'media-tools' });
  const root = h('figure', { class: ['media', compact && 'media-compact'] }, stage, h('figcaption', { class: 'media-bar' }, caption, tools), items.length > 1 ? thumbs : null);
  let tinted = false;

  function show(i) {
    index = i;
    const item = items[i];
    tinted = Boolean(item.tint);
    stage.replaceChildren();
    tools.replaceChildren();
    caption.textContent = item.caption ? tr(item.caption) : `${i + 1}/${items.length}`;
    if (item.type === 'image') {
      const img = h('img', { src: item.src, alt: item.caption ? tr(item.caption) : title || '', loading: 'lazy', decoding: 'async' });
      const frame = h('div', { class: ['media-frame', tinted && 'is-tinted'] }, h('span', { class: 'tint' }, img));
      stage.append(frame);
      tools.append(
        h('button', { class: 'btn btn-sm', type: 'button', 'aria-pressed': String(!tinted), onClick: (e) => {
          tinted = !tinted;
          frame.classList.toggle('is-tinted', tinted);
          e.currentTarget.setAttribute('aria-pressed', String(!tinted));
        } }, t('media.color')),
        os ? h('button', { class: 'btn btn-sm', type: 'button', onClick: () => os.openViewer(item, title) }, t('media.zoom')) : null,
      );
    } else if (item.type === 'video') {
      stage.append(videoPlayer(item, { tools }));
    } else if (item.type === 'terminal') {
      stage.append(terminalPlayback(item.src));
    }
    for (const [k, el] of [...thumbs.children].entries()) el.classList.toggle('is-active', k === i);
  }

  items.forEach((item, i) => {
    thumbs.append(h('button', {
      class: 'media-thumb',
      type: 'button',
      'aria-label': t('media.item', { n: i + 1 }),
      onClick: () => show(i),
    }, item.type === 'video' ? pxIcon('film') : item.type === 'terminal' ? pxIcon('terminal') : h('img', { src: item.src, alt: '', loading: 'lazy' })));
  });
  show(0);
  return root;
}

export function videoPlayer(item, { tools } = {}) {
  const video = h('video', {
    src: item.src,
    poster: item.poster,
    preload: 'none',
    playsinline: true,
    muted: true,
    loop: true,
    class: item.pixel ? 'is-pixel' : null,
  });
  video.muted = true;
  const play = h('button', { class: 'btn btn-sm vp-play', type: 'button', 'aria-label': t('media.play') }, pxIcon('play'));
  const bar = h('div', { class: 'vp-bar' }, h('div', { class: 'vp-fill' }));
  const time = h('span', { class: 'vp-time' }, '0:00');
  const mute = h('button', { class: 'btn btn-sm', type: 'button', 'aria-label': t('media.sound') }, pxIcon('mute'));
  const big = h('button', { class: 'vp-big', type: 'button', 'aria-label': t('media.play') }, pxIcon('play'));
  const frame = h('div', { class: 'media-frame vp' }, h('span', { class: 'tint' }, video), big);
  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

  const toggle = () => {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  };
  play.onclick = toggle;
  big.onclick = toggle;
  video.onclick = toggle;
  video.onplay = () => { play.innerHTML = pixelSvg('pause'); big.hidden = true; };
  video.onpause = () => { play.innerHTML = pixelSvg('play'); };
  video.ontimeupdate = () => {
    bar.firstChild.style.width = `${(video.currentTime / (video.duration || 1)) * 100}%`;
    time.textContent = fmt(video.currentTime);
  };
  bar.onclick = (e) => {
    const r = bar.getBoundingClientRect();
    if (video.duration) video.currentTime = ((e.clientX - r.left) / r.width) * video.duration;
  };
  mute.onclick = () => {
    video.muted = !video.muted;
    mute.innerHTML = pixelSvg(video.muted ? 'mute' : 'speaker');
  };
  const controls = h('div', { class: 'vp-controls' }, play, bar, time, mute);
  if (tools) {
    tools.append(h('button', { class: 'btn btn-sm', type: 'button', 'aria-pressed': 'true', onClick: (e) => {
      const on = frame.classList.toggle('is-tinted');
      e.currentTarget.setAttribute('aria-pressed', String(!on));
    } }, t('media.color')));
    tools.append(h('button', { class: 'btn btn-sm', type: 'button', onClick: () => {
      (video.requestFullscreen || video.webkitEnterFullscreen)?.call(video);
    } }, t('media.full')));
  }
  return h('div', { class: 'vp-wrap' }, frame, controls);
}

export function terminalPlayback(src) {
  const pre = h('pre', { class: 'term-out', tabindex: '0' }, '...');
  fetch(src).then((r) => r.text()).then((text) => {
    const lines = text.replace(/\s+$/, '').split('\n');
    pre.textContent = '';
    let i = 0;
    const tick = () => {
      if (!pre.isConnected && i > 0) return;
      pre.textContent += `${lines[i]}\n`;
      pre.scrollTop = pre.scrollHeight;
      i += 1;
      if (i < lines.length) setTimeout(tick, lines[i - 1].startsWith('$') ? 260 : 28);
    };
    tick();
  }).catch(() => { pre.textContent = '[!] ERROR'; });
  return pre;
}
