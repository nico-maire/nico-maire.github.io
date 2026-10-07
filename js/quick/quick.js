// Quick view: everything on one page, styled as a dot-matrix printout. Printable for real.
import { h, reducedMotion } from '../core/dom.js';
import { t, tr, LANGS, getLang, setLang } from '../core/i18n.js';
import { db } from '../core/data.js';
import { bus } from '../core/bus.js';
import { sfx } from '../core/sound.js';
import { cvUrl } from '../apps/cv.js';

let el = null;
let offLang = null;
let lastFocus = null;


function section(title, ...content) {
  return h('section', { class: 'q-sec' }, h('h2', { class: 'q-h' }, title), content);
}

function render(onClose) {
  const p = db.profile;
  const featured = [...db.projects].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.sort - a.sort);
  const toolbar = h('div', { class: 'q-toolbar', role: 'toolbar' },
    h('div', { class: 'q-langs', role: 'group', 'aria-label': t('tb.lang') }, LANGS.map((l) => h('button', {
      class: 'q-btn', type: 'button', 'aria-pressed': String(l.code === getLang()), onClick: () => setLang(l.code),
    }, l.label))),
    h('button', { class: 'q-btn', type: 'button', onClick: () => window.print() }, t('quick.print')),
    h('a', { class: 'q-btn', href: cvUrl(getLang()), download: '' }, t('quick.cv')),
    h('button', { class: 'q-btn q-close', type: 'button', onClick: onClose }, t('quick.back')));

  const paper = h('article', { class: 'q-paper' },
    h('header', { class: 'q-head' },
      h('p', { class: 'q-tiny' }, `NicOS PRINT SPOOLER · LPT1 · ${new Date().toISOString().slice(0, 10)}`),
      h('h1', { class: 'q-name' }, p.name.toUpperCase()),
      h('p', { class: 'q-role' }, tr(p.role)),
      h('p', { class: 'q-status' }, `[*] ${tr(p.status).toUpperCase()} · ${tr(p.location)}`),
      h('p', { class: 'q-contact' },
        h('a', { href: `mailto:${p.email}` }, p.email), ' · ',
        h('a', { href: p.links.linkedin, target: '_blank', rel: 'noopener' }, 'LinkedIn'), ' · ',
        h('a', { href: p.links.github, target: '_blank', rel: 'noopener' }, 'github.com/nico-maire'), ' · ',
        h('a', { href: cvUrl(getLang()), download: '' }, `CV (${getLang().toUpperCase()})`))),
    section(t('quick.about'), tr(p.about).map((x) => h('p', {}, x))),
    section(t('tl.experience'), db.timeline.experience.map((e) => h('div', { class: 'q-entry' },
      h('p', { class: 'q-entry-head' }, h('strong', {}, tr(e.title)), ` — ${tr(e.role)}`, h('span', { class: 'q-date' }, tr(e.period))),
      h('p', {}, tr(e.text))))),
    section(t('tl.education'),
      db.timeline.education.map((e) => h('div', { class: 'q-entry' },
        h('p', { class: 'q-entry-head' }, h('strong', {}, tr(e.title)), ` — ${tr(e.role)}`, h('span', { class: 'q-date' }, tr(e.period))),
        h('p', {}, `${tr(e.place)}. ${tr(e.text)}`))),
      h('p', {}, db.timeline.certificates.map((c) => `${tr(c.title)} (${tr(c.text)})`).join(' · '))),
    section(t('quick.projects'), featured.map((pr) => h('div', { class: 'q-entry q-project' },
      h('p', { class: 'q-entry-head' }, h('strong', {}, tr(pr.title)),
        h('span', { class: 'q-date' }, [pr.year, t(`ctx.${pr.context}`)].filter(Boolean).join(' · '))),
      h('p', {}, tr(pr.summary)),
      h('p', { class: 'q-tags' }, pr.skills.map((s) => db.skillById.get(s)?.name).filter(Boolean).join(' / ')),
      pr.links.length
        ? h('p', { class: 'q-links' }, pr.links.map((l, i) => [i ? ' · ' : '', h('a', { href: l.url, target: '_blank', rel: 'noopener' }, `${t(`link.${l.type}`)}`)]))
        : h('p', { class: 'q-links q-muted' }, t(`vis.${pr.visibility}`))))),
    section(t('desk.skills'), db.skillCats.map((c) => h('p', {}, h('strong', {}, `${tr(c.title)}: `),
      db.skillList.filter((s) => s.cat === c.id).map((s) => s.name).join(', ')))),
    section(t('lang.title'), h('p', {}, db.languages.map((l) => `${tr(l.name)}: ${tr(l.level)}`).join(' · '))),
    h('footer', { class: 'q-foot' }, `-- ${t('quick.end')} --`, h('br'), `"${p.quote}"`));

  el.replaceChildren(toolbar, h('div', { class: 'q-feed' }, paper));
  if (!reducedMotion()) paper.classList.add('is-printing');
}

export function openQuick({ onClose }) {
  if (el) return;
  lastFocus = document.activeElement;
  el = h('div', { class: 'quick', role: 'dialog', 'aria-modal': 'true', 'aria-label': t('quick.title'), tabindex: '-1' });
  document.body.append(el);
  document.documentElement.classList.add('quick-open');
  render(onClose);
  sfx.hdd(16);
  offLang = bus.on('lang', () => render(onClose));
  el.addEventListener('keydown', (e) => { if (e.key === 'Escape') onClose(); });
  el.focus();
}

export function closeQuick() {
  if (!el) return;
  offLang?.();
  el.remove();
  el = null;
  document.documentElement.classList.remove('quick-open');
  lastFocus?.focus?.();
}
