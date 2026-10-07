// Phone experience: a full-screen Nokia-style LCD with an idle screen, a carousel menu, lists and detail pages.
import { h } from '../core/dom.js';
import { t, tr, LANGS, getLang, setLang } from '../core/i18n.js';
import { db } from '../core/data.js';
import { getNode, childrenOf, parentOf } from '../core/fs.js';
import { prefs, setPref, THEMES } from '../core/store.js';
import { bus } from '../core/bus.js';
import { go, openPath, parseRoute } from '../core/router.js';
import { pixelSvg } from '../core/icons.js';
import { brandSvg } from '../core/brands.js';
import { sfx } from '../core/sound.js';
import { cvUrl } from '../apps/cv.js';

const MENU = ['about', 'projects', 'skills', 'knowledge', 'experience', 'education', 'languages', 'contact', 'cv', 'quick', 'settings'];

export function mountPhone(app, { deepLink } = {}) {
  let screen = { type: 'home' };
  const trail = []; // screens visited, for the Back soft key
  let menuIndex = 0;
  let clockTimer = null;

  const title = h('span', { class: 'ph-title' });
  const status = h('header', { class: 'ph-status' },
    h('span', { class: 'ph-signal', 'aria-hidden': 'true' }, h('i'), h('i'), h('i'), h('i'), h('i')),
    title,
    h('span', { class: 'ph-battery', 'aria-hidden': 'true' }, h('i'), h('i'), h('i')));
  const body = h('main', { class: 'ph-body', tabindex: '-1' });
  const keyLeft = h('button', { class: 'ph-key ph-key-l', type: 'button' });
  const keyMid = h('button', { class: 'ph-key ph-key-m', type: 'button' });
  const keyRight = h('button', { class: 'ph-key ph-key-r', type: 'button' });
  const keys = h('footer', { class: 'ph-keys' }, keyLeft, keyMid, keyRight);
  const root = h('div', { class: 'phone' }, h('div', { class: 'ph-screen' }, status, body, keys));
  app.replaceChildren(root);

  // ------------------------------------------------------------------ navigation
  function show(next, { push = true, remember = true } = {}) {
    if (next.type === 'home') trail.length = 0;
    else if (remember && !(screen.type === next.type && screen.id === next.id)) trail.push(screen);
    if (trail.length > 50) trail.shift();
    screen = next;
    if (push) {
      const path = next.type === 'node' ? openPath(next.id) : next.type === 'menu' ? 'menu' : '';
      go(path, { silent: true });
    }
    render();
  }

  function back() {
    sfx.nokia();
    if (screen.type === 'home') return;
    if (screen.type === 'menu') { show({ type: 'home' }); return; }
    const prev = trail.pop();
    if (prev && prev.type !== 'home') { show(prev, { remember: false }); return; }
    const parent = parentOf(screen.id);
    if (!parent || parent === 'root') { show({ type: 'menu' }, { remember: false }); return; }
    show({ type: 'node', id: parent }, { remember: false });
  }

  function openNode(id) {
    const node = getNode(id);
    if (!node) return;
    if (node.app === 'quick') { go('quick'); return; }
    sfx.nokia();
    show({ type: 'node', id });
  }

  function fromRoute(route) {
    trail.length = 0;
    if (route.name === 'open' && getNode(route.arg)) { screen = { type: 'node', id: route.arg }; render(); }
    else if (route.name === 'menu') { screen = { type: 'menu' }; render(); }
    else if (route.name === 'home') { screen = { type: 'home' }; render(); }
  }

  // ------------------------------------------------------------------ helpers
  const px = (name, cls = '') => h('span', { class: `px-ico ${cls}`, html: pixelSvg(name), 'aria-hidden': 'true' });
  const brand = (id, cls = '') => (id ? h('span', { class: `brand-ico ${cls}`, html: brandSvg(id), 'aria-hidden': 'true' }) : px('chip', cls));

  function list(items) {
    return h('ul', { class: 'ph-list', role: 'list' }, items.filter(Boolean).map((it) => h('li', {},
      it.href
        ? h('a', { class: 'ph-item', href: it.href, target: it.href.startsWith('mailto:') ? null : '_blank', rel: 'noopener', download: it.download ? '' : null },
          it.icon || h('span'), h('span', { class: 'ph-item-label' }, it.label, it.note ? h('small', { class: 'ph-item-note' }, it.note) : null), it.sub ? h('span', { class: 'ph-item-sub' }, it.sub) : h('span'), h('span', { class: 'ph-chev', 'aria-hidden': 'true' }, '>'))
        : h('button', { class: ['ph-item', it.checked && 'is-checked'], type: 'button', role: it.radio ? 'radio' : null, 'aria-checked': it.radio ? String(Boolean(it.checked)) : null, onClick: it.onClick },
          it.icon || h('span'), h('span', { class: 'ph-item-label' }, it.label, it.note ? h('small', { class: 'ph-item-note' }, it.note) : null), it.sub ? h('span', { class: 'ph-item-sub' }, it.sub) : h('span'),
          h('span', { class: 'ph-chev', 'aria-hidden': 'true' }, it.radio ? (it.checked ? '(*)' : '( )') : '>')))));
  }

  function section(label, ...children) {
    return h('section', { class: 'ph-sec' }, label ? h('h2', { class: 'ph-h' }, label) : null, children);
  }

  function media(items) {
    if (!items?.length) return null;
    return h('div', { class: 'ph-media' }, items.map((m) => {
      if (m.type === 'image') return h('figure', { class: 'ph-fig' }, h('img', { src: m.src, alt: m.caption ? tr(m.caption) : '', loading: 'lazy' }), m.caption ? h('figcaption', {}, tr(m.caption)) : null);
      if (m.type === 'video') return h('figure', { class: 'ph-fig' }, h('video', { src: m.src, poster: m.poster, controls: true, playsinline: true, preload: 'none', muted: true }), m.caption ? h('figcaption', {}, tr(m.caption)) : null);
      if (m.type === 'terminal') {
        const pre = h('pre', { class: 'ph-term' }, '...');
        fetch(m.src).then((r) => r.text()).then((txt) => { pre.textContent = txt.trimEnd(); }).catch(() => {});
        return pre;
      }
      return null;
    }));
  }

  // ------------------------------------------------------------------ screens
  function renderHome() {
    const p = db.profile;
    const d = new Date();
    const clock = h('p', { class: 'ph-clock' }, `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`);
    clearInterval(clockTimer);
    clockTimer = setInterval(() => {
      const n = new Date();
      clock.textContent = `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
    }, 15000);
    title.textContent = t('phone.network');
    title.style.textTransform = 'none';
    body.replaceChildren(h('div', { class: 'ph-home' },
      h('p', { class: 'ph-operator' }, p.shortName.toUpperCase()),
      clock,
      h('p', { class: 'ph-date' }, d.toLocaleDateString(getLang() === 'zh' ? 'zh-CN' : getLang(), { weekday: 'short', day: 'numeric', month: 'short' })),
      h('p', { class: 'ph-role' }, tr(p.role)),
      h('p', { class: 'ph-statusline' }, h('span', { class: 'ph-dot', 'aria-hidden': 'true' }), tr(p.status).toUpperCase()),
      h('p', { class: 'ph-small' }, tr(p.location)),
      h('button', { class: 'ph-big-btn', type: 'button', onClick: () => show({ type: 'menu' }) }, px('computer'), t('phone.menu')),
      h('p', { class: 'ph-quote' }, `"${p.quote}"`),
      h('p', { class: 'ph-small ph-dim' }, t('phone.desktop'))));
    setKeys([t('w.contact'), () => openNode('contact')], [t('phone.menu'), () => show({ type: 'menu' })], [t('w.cv'), () => openNode('cv')]);
  }

  function renderMenu() {
    const id = MENU[menuIndex];
    const node = getNode(id);
    title.style.textTransform = '';
    title.textContent = t('phone.menu');
    const card = h('button', { class: 'ph-menu-card', type: 'button', onClick: () => openNode(id), 'aria-label': node.label() },
      px(node.icon, 'ph-menu-ico'),
      h('span', { class: 'ph-menu-label' }, node.label()));
    const bar = h('div', { class: 'ph-scroll', 'aria-hidden': 'true' }, h('i', { style: { top: `${(menuIndex / (MENU.length - 1)) * 86}%` } }));
    body.replaceChildren(h('div', { class: 'ph-menu' },
      h('p', { class: 'ph-menu-count' }, `${menuIndex + 1}/${MENU.length}`),
      h('div', { class: 'ph-menu-row' },
        h('button', { class: 'ph-arrow', type: 'button', 'aria-label': '<', onClick: () => moveMenu(-1) }, '<'),
        card,
        h('button', { class: 'ph-arrow', type: 'button', 'aria-label': '>', onClick: () => moveMenu(1) }, '>')),
      h('ol', { class: 'ph-menu-dots', 'aria-hidden': 'true' }, MENU.map((_, i) => h('li', { class: i === menuIndex ? 'on' : '' }))),
      list(MENU.map((mid) => {
        const n = getNode(mid);
        return { icon: px(n.icon), label: n.label(), onClick: () => openNode(mid) };
      }))),
    bar);
    setKeys([t('phone.back'), back], [t('phone.select'), () => openNode(id)], [t('phone.exit'), () => show({ type: 'home' })]);
  }

  function moveMenu(delta) {
    menuIndex = (menuIndex + delta + MENU.length) % MENU.length;
    sfx.nokia();
    renderMenu();
  }

  function renderNode(id) {
    const node = getNode(id);
    title.style.textTransform = '';
    title.textContent = node.label();
    let content;
    switch (node.app) {
      case 'explorer': content = folderScreen(node); break;
      case 'project': content = projectScreen(db.projectById.get(node.args.project)); break;
      case 'skill': content = skillScreen(db.skillById.get(node.args.skill)); break;
      case 'knowledge': content = knowledgeScreen(db.knowledgeById.get(node.args.knowledge)); break;
      case 'about': content = aboutScreen(); break;
      case 'experience': content = timelineScreen(db.timeline.experience); break;
      case 'education': content = timelineScreen(db.timeline.education, true); break;
      case 'languages': content = languagesScreen(); break;
      case 'contact': content = contactScreen(); break;
      case 'cv': content = cvScreen(); break;
      case 'settings': content = settingsScreen(); break;
      case 'wip': content = section(t('wip.title'), h('p', {}, t('wip.text')), h('p', { class: 'ph-small' }, t('wip.note'))); break;
      case 'text': content = h('pre', { class: 'ph-pre' }, t(node.args.text)); break;
      default: content = list(childrenOf('root').map((n) => ({ icon: px(n.icon), label: n.label(), onClick: () => openNode(n.id) })));
    }
    body.replaceChildren(content);
    setKeys([t('phone.back'), back], [t('phone.menu'), () => show({ type: 'menu' })], [t('phone.exit'), () => show({ type: 'home' })]);
  }

  function folderScreen(node) {
    if (node.id === 'skills') {
      return h('div', {}, db.skillCats.map((c) => section(tr(c.title), list(db.skillList.filter((s) => s.cat === c.id).map((s) => ({
        icon: brand(s.icon), label: s.name, sub: String((db.projectsBySkill.get(s.id) || []).length || ''), onClick: () => openNode(`s/${s.id}`),
      }))))));
    }
    return list(childrenOf(node.id).map((n) => ({
      icon: n.brand !== undefined ? brand(n.brand) : px(n.kind === 'folder' ? 'folder' : n.icon),
      label: n.label(),
      note: n.meta?.() || '',
      sub: n.kind === 'folder' ? String(childrenOf(n.id).length) : '',
      onClick: () => openNode(n.id),
    })));
  }

  function projectScreen(p) {
    const meta = [tr(p.year), t(`ctx.${p.context}`), p.course && tr(p.course)].filter(Boolean).join(' · ');
    return h('article', { class: 'ph-article' },
      h('h1', { class: 'ph-title-big' }, tr(p.title)),
      h('p', { class: 'ph-small' }, meta),
      h('p', { class: 'ph-badge' }, t(`vis.${p.visibility}`)),
      p.role || p.team ? h('p', { class: 'ph-small' }, [p.role && tr(p.role), p.team && tr(p.team)].filter(Boolean).join(' · ')) : null,
      media(p.media),
      h('p', {}, tr(p.summary)),
      section(t('proj.highlights'), h('ul', { class: 'ph-bullets' }, tr(p.highlights).map((x) => h('li', {}, x)))),
      section(t('proj.stack'), h('p', { class: 'ph-tags' }, p.skills.map((s) => db.skillById.get(s)?.name).filter(Boolean).join(' / '))),
      p.links.length
        ? list(p.links.map((l) => ({ href: l.url, icon: l.type === 'github' || l.type === 'youtube' ? brand(l.type) : px('globe'), label: t(`link.${l.type}`) })))
        : h('p', { class: 'ph-small ph-note' }, t(p.visibility === 'confidential' ? 'proj.note.confidential' : 'proj.note.private')));
  }

  function skillScreen(s) {
    const projects = db.projectsBySkill.get(s.id) || [];
    return h('article', { class: 'ph-article' },
      h('div', { class: 'ph-skill-head' }, brand(s.icon, 'ph-skill-ico'), h('h1', { class: 'ph-title-big' }, s.name)),
      section(t('skill.used', { n: projects.length }),
        projects.length ? list(projects.map((p) => ({ icon: px('disk'), label: tr(p.title), note: tr(p.year), onClick: () => openNode(`p/${p.id}`) }))) : h('p', {}, t('skill.none'))));
  }

  function knowledgeScreen(k) {
    return h('article', { class: 'ph-article' },
      h('h1', { class: 'ph-title-big' }, tr(k.title)),
      h('p', {}, tr(k.summary)),
      section(t('know.concepts'), h('p', { class: 'ph-tags' }, k.concepts.map(tr).join(' / '))),
      section(t('know.projects'), list(k.projects.map((id) => db.projectById.get(id)).filter(Boolean).map((p) => ({ icon: px('disk'), label: tr(p.title), onClick: () => openNode(`p/${p.id}`) })))));
  }

  function aboutScreen() {
    const p = db.profile;
    return h('article', { class: 'ph-article' },
      h('div', { class: 'ph-about-head' },
        h('div', { class: 'ph-photo', role: 'img', 'aria-label': p.name, style: { '--photo': `url("${new URL(p.photo, location.href)}")` } }),
        h('div', {}, h('h1', { class: 'ph-title-big' }, p.name), h('p', { class: 'ph-small' }, tr(p.role)))),
      h('p', { class: 'ph-statusline' }, h('span', { class: 'ph-dot', 'aria-hidden': 'true' }), tr(p.status).toUpperCase()),
      h('p', { class: 'ph-small' }, tr(p.location)),
      tr(p.about).map((x) => h('p', {}, x)),
      h('p', { class: 'ph-quote' }, `"${p.quote}"`),
      list([
        { icon: px('mail'), label: t('w.contact'), onClick: () => openNode('contact') },
        { icon: px('disk'), label: t('w.cv'), onClick: () => openNode('cv') },
      ]));
  }

  function timelineScreen(entries, withCerts = false) {
    return h('div', {},
      entries.map((e) => section(null, h('article', { class: 'ph-entry' },
        h('p', { class: 'ph-small' }, tr(e.period)),
        h('h2', { class: 'ph-h ph-h-entry' }, tr(e.title)),
        h('p', { class: 'ph-small' }, [tr(e.role), e.place && tr(e.place)].filter(Boolean).join(' · ')),
        h('p', {}, tr(e.text)),
        e.project ? list([{ icon: px('disk'), label: t('tl.open'), onClick: () => openNode(`p/${e.project}`) }]) : null))),
      withCerts ? section(t('tl.certs'), h('ul', { class: 'ph-bullets' }, db.timeline.certificates.map((c) => h('li', {}, `${tr(c.title)} · ${tr(c.text)}`)))) : null);
  }

  function languagesScreen() {
    return h('div', {}, db.languages.map((l) => h('div', { class: 'ph-lang' },
      h('p', { class: 'ph-lang-name' }, tr(l.name)),
      h('span', { class: 'ph-meter', role: 'meter', 'aria-valuemin': '0', 'aria-valuemax': '10', 'aria-valuenow': String(l.score), 'aria-label': tr(l.name) },
        Array.from({ length: 10 }, (_, i) => h('i', { class: i < l.score ? 'on' : '' }))),
      h('p', { class: 'ph-small' }, tr(l.level)))), h('p', { class: 'ph-small' }, t('lang.note')));
  }

  function contactScreen() {
    const p = db.profile;
    return h('div', {},
      h('p', {}, t('contact.intro')),
      list([
        { href: `mailto:${p.email}`, icon: px('mail'), label: p.email },
        { href: p.links.linkedin, icon: px('linkedin'), label: 'LinkedIn' },
        { href: p.links.github, icon: brand('github'), label: 'GitHub' },
      ]),
      h('p', { class: 'ph-small ph-dim' }, t('phone.call')));
  }

  function cvScreen() {
    return h('div', {}, h('p', {}, t('cv.intro')),
      list(LANGS.map((l) => ({ href: cvUrl(l.code), download: true, icon: px('download'), label: `${l.label} · ${l.name}`, sub: l.code === getLang() ? '*' : '' }))));
  }

  function settingsScreen() {
    const screens = [['lcd', null, t('phone.set.lcd')], ...THEMES.map((th) => ['phosphor', th, `${t('phone.set.phosphor')} · ${t(`theme.${th}`)}`])];
    return h('div', {},
      section(t('phone.set.lang'), list(LANGS.map((l) => ({ radio: true, checked: l.code === getLang(), label: `${l.label} · ${l.name}`, onClick: () => setLang(l.code) })))),
      section(t('phone.set.screen'), list(screens.map(([mode, theme, label]) => ({
        radio: true,
        checked: prefs.lcd === mode && (!theme || prefs.theme === theme),
        label,
        onClick: () => { setPref('lcd', mode); if (theme) setPref('theme', theme); render(); },
      })))),
      section(t('phone.set.sound'), list([[true, t('set.on')], [false, t('set.off')]].map(([v, label]) => ({
        radio: true, checked: prefs.sound === v, label, onClick: () => { setPref('sound', v); sfx.nokia(); render(); },
      })))));
  }

  // ------------------------------------------------------------------ keys and render
  function setKeys(left, mid, right) {
    for (const [btn, def] of [[keyLeft, left], [keyMid, mid], [keyRight, right]]) {
      btn.textContent = def ? def[0] : '';
      btn.onclick = def ? () => { sfx.nokia(); def[1](); } : null;
      btn.disabled = !def;
    }
  }

  function render() {
    root.dataset.screen = screen.type;
    if (screen.type === 'home') renderHome();
    else if (screen.type === 'menu') renderMenu();
    else renderNode(screen.id);
    body.scrollTop = 0;
  }

  // Swipes on the menu carousel
  let touch = null;
  body.addEventListener('touchstart', (e) => { touch = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }, { passive: true });
  body.addEventListener('touchend', (e) => {
    if (!touch || screen.type !== 'menu') return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) && !e.target.closest('.ph-list')) moveMenu(dx < 0 ? 1 : -1);
    touch = null;
  });

  const onKey = (e) => {
    if (document.querySelector('.quick')) return;
    if (screen.type === 'menu' && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { e.preventDefault(); moveMenu(e.key === 'ArrowRight' ? 1 : -1); }
    if (e.key === 'Escape' || (e.key === 'Backspace' && !e.target.closest('input, textarea'))) { e.preventDefault(); back(); }
  };
  document.addEventListener('keydown', onKey);
  const offLang = bus.on('lang', render);
  const offPrefs = bus.on('prefs', ({ key }) => { if (key !== 'sound') render(); });

  const initial = parseRoute();
  if (initial.name === 'menu') screen = { type: 'menu' };
  if (deepLink) screen = { type: 'node', id: deepLink };
  render();

  return {
    openNode(id) { if (getNode(id)) { screen = { type: 'node', id }; render(); } },
    home() { screen = { type: 'home' }; render(); },
    route: fromRoute,
    destroy() {
      clearInterval(clockTimer);
      document.removeEventListener('keydown', onKey);
      offLang();
      offPrefs();
      app.replaceChildren();
    },
  };
}
