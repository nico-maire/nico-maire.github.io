// NicOS command line: navigate the virtual file system and open anything from the keyboard.
import { h } from '../core/dom.js';
import { t, tr, getLang, setLang, isLang, LANGS } from '../core/i18n.js';
import { db } from '../core/data.js';
import { getNode, childrenOf, pathOf, resolvePath } from '../core/fs.js';
import { prefs, setPref, THEMES } from '../core/store.js';
import { go } from '../core/router.js';
import { sfx } from '../core/sound.js';
import { cvUrl } from './cv.js';

const COMMANDS = ['help', 'dir', 'ls', 'cd', 'pwd', 'type', 'cat', 'open', 'start', 'cls', 'clear', 'lang', 'theme', 'whoami',
  'neofetch', 'projects', 'skills', 'contact', 'cv', 'guide', 'quick', 'settings', 'date', 'echo', 'history', 'sudo', 'hire', 'exit', 'ver'];

const NEO = [
  '   .--------.   ',
  '   | NicOS  |   ',
  '   |  >_    |   ',
  "   '--------'   ",
  '  /__________\\  ',
];

export default function terminal(node, os) {
  // State survives re-renders (language changes) of the window
  const state = { cwd: 'root', lines: null, history: [], hIndex: -1 };

  return {
    title: () => `${node.name()} — ${pathOf(state.cwd)}`,
    icon: 'terminal',
    size: [720, 470],
    bodyClass: 'term',
    mount(body, win) {
      const out = h('div', { class: 'term-lines', role: 'log', 'aria-live': 'polite' });
      const promptEl = h('span', { class: 'term-prompt' });
      const input = h('input', {
        class: 'term-input', type: 'text', spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off',
        'aria-label': t('term.input'),
      });
      const form = h('form', { class: 'term-form' }, promptEl, input);
      body.append(out, form);
      body.addEventListener('click', () => input.focus());

      const prompt = () => `${pathOf(state.cwd)}>`;
      const print = (text = '', cls) => {
        const line = h('div', { class: ['term-line', cls] }, text);
        out.append(line);
        state.lines.push([text, cls]);
        body.scrollTop = body.scrollHeight;
      };

      if (!state.lines) {
        state.lines = [];
        print(`NicOS ${t('term.version')} 2.6`);
        print(t('term.welcome'), 'dim');
        print('');
      } else {
        const saved = state.lines;
        state.lines = [];
        for (const [text, cls] of saved) print(text, cls);
      }
      promptEl.textContent = prompt();

      function listing(id) {
        const items = childrenOf(id);
        for (const n of items) {
          const isDir = n.kind === 'folder';
          print(`${isDir ? '<DIR>   ' : '        '}${n.name().padEnd(16)} ${n.label()}`);
        }
        print(t('term.count', { n: items.length }), 'dim');
      }

      function typeNode(n) {
        if (n.app === 'project') {
          const p = db.projectById.get(n.args.project);
          print(tr(p.title), 'hi');
          print(`${tr(p.year) || ''} · ${t(`ctx.${p.context}`)} · ${t(`vis.${p.visibility}`)}`, 'dim');
          print(tr(p.summary));
          for (const x of tr(p.highlights)) print(`  - ${x}`);
          for (const l of p.links) print(`  ${l.type.toUpperCase()}: ${l.url}`, 'dim');
          print(t('term.opentip', { name: n.name() }), 'dim');
        } else if (n.app === 'about') {
          print(db.profile.name, 'hi');
          print(tr(db.profile.role));
          for (const par of tr(db.profile.about)) print(par);
        } else {
          os.open(n.id);
          print(t('term.opening', { name: n.name() }), 'dim');
        }
      }

      const run = (raw) => {
        const line = raw.trim();
        print(`${prompt()} ${line}`, 'cmd');
        if (!line) return;
        state.history.push(line);
        state.hIndex = state.history.length;
        const [cmdRaw, ...args] = line.split(/\s+/);
        const cmd = cmdRaw.toLowerCase();
        const arg = args.join(' ');
        switch (cmd) {
          case 'help':
            t('term.help').split('|').forEach((l) => print(l));
            break;
          case 'dir':
          case 'ls': {
            const target = arg ? resolvePath(state.cwd, arg) : state.cwd;
            if (!target) print(t('term.notfound', { name: arg }), 'err');
            else if (getNode(target).kind !== 'folder') print(getNode(target).name());
            else listing(target);
            break;
          }
          case 'cd': {
            if (!arg) { print(pathOf(state.cwd)); break; }
            const target = resolvePath(state.cwd, arg);
            if (!target) print(t('term.notfound', { name: arg }), 'err');
            else if (getNode(target).kind !== 'folder') print(t('term.notdir', { name: arg }), 'err');
            else { state.cwd = target; win.setTitle(); }
            break;
          }
          case 'pwd':
            print(pathOf(state.cwd));
            break;
          case 'type':
          case 'cat': {
            const target = resolvePath(state.cwd, arg);
            if (!arg || !target) print(t('term.notfound', { name: arg }), 'err');
            else typeNode(getNode(target));
            break;
          }
          case 'open':
          case 'start': {
            const target = resolvePath(state.cwd, arg);
            if (!arg || !target) print(t('term.notfound', { name: arg }), 'err');
            else { os.open(target); print(t('term.opening', { name: getNode(target).name() }), 'dim'); }
            break;
          }
          case 'cls':
          case 'clear':
            out.replaceChildren();
            state.lines = [];
            break;
          case 'lang':
            if (!arg) print(`${getLang()} — ${LANGS.map((l) => l.code).join(' | ')}`);
            else if (isLang(arg.toLowerCase())) setLang(arg.toLowerCase());
            else print(t('term.badarg', { arg }), 'err');
            break;
          case 'theme':
            if (!arg) print(`${prefs.theme} — ${THEMES.join(' | ')}`);
            else if (THEMES.includes(arg.toLowerCase())) setPref('theme', arg.toLowerCase());
            else print(t('term.badarg', { arg }), 'err');
            break;
          case 'whoami':
            print(`${db.profile.name} — ${tr(db.profile.role)}`);
            break;
          case 'ver':
            print('NicOS 2.6 (build 2026.10)');
            break;
          case 'neofetch': {
            const info = [
              `${db.profile.name}`,
              '----------------------------',
              `OS: NicOS 2.6`,
              `${t('term.neo.role')}: ${tr(db.profile.role)}`,
              `${t('term.neo.status')}: ${tr(db.profile.status)}`,
              `${t('term.neo.where')}: ${tr(db.profile.location)}`,
              `${t('term.neo.langs')}: ES EN IT FR ZH`,
              `${t('term.neo.projects')}: ${db.projects.length}`,
              `${t('term.neo.mail')}: ${db.profile.email}`,
            ];
            info.forEach((l, i) => print(`${NEO[i] || ' '.repeat(16)}  ${l}`, i === 0 ? 'hi' : null));
            break;
          }
          case 'projects':
            for (const p of db.projects) print(`${p.file.padEnd(10)} ${String(tr(p.year) || '').padEnd(14)} ${tr(p.title)}`);
            print(t('term.projtip'), 'dim');
            break;
          case 'skills':
            for (const c of db.skillCats) print(`${tr(c.title)}: ${db.skillList.filter((s) => s.cat === c.id).map((s) => s.name).join(', ')}`);
            break;
          case 'contact':
          case 'guide':
          case 'settings':
            os.open(cmd);
            break;
          case 'quick':
            go('quick');
            break;
          case 'cv': {
            const code = (arg || getLang()).toLowerCase();
            if (!isLang(code)) { print(t('term.badarg', { arg }), 'err'); break; }
            print(t('term.download', { file: cvUrl(code).split('/').pop() }), 'dim');
            window.open(cvUrl(code), '_blank', 'noopener');
            break;
          }
          case 'date':
            print(new Date().toLocaleString(getLang() === 'zh' ? 'zh-CN' : getLang()));
            break;
          case 'echo':
            print(arg);
            break;
          case 'history':
            state.history.forEach((l, i) => print(`${String(i + 1).padStart(3)}  ${l}`));
            break;
          case 'hire':
          case 'sudo':
            if (/hire/i.test(line)) {
              print(t('term.hire'), 'hi');
              setTimeout(() => os.open('contact'), 700);
            } else {
              print(t('term.sudo'), 'err');
              sfx.error();
            }
            break;
          case 'exit':
            win.close();
            break;
          default: {
            const target = resolvePath(state.cwd, line);
            if (target && getNode(target)) {
              os.open(target);
              print(t('term.opening', { name: getNode(target).name() }), 'dim');
            } else {
              print(t('term.unknown', { cmd: cmdRaw }), 'err');
              sfx.error();
            }
          }
        }
        promptEl.textContent = prompt();
      };

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        run(input.value);
        input.value = '';
      });
      input.addEventListener('keydown', (e) => {
        sfx.key();
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          state.hIndex = Math.max(0, Math.min(state.history.length, state.hIndex + (e.key === 'ArrowUp' ? -1 : 1)));
          input.value = state.history[state.hIndex] || '';
        } else if (e.key === 'Tab') {
          e.preventDefault();
          const parts = input.value.split(/\s+/);
          const last = (parts.pop() || '').toLowerCase();
          const pool = parts.length ? childrenOf(state.cwd).map((n) => n.name()) : [...COMMANDS, ...childrenOf(state.cwd).map((n) => n.name())];
          const hits = pool.filter((n) => n.toLowerCase().startsWith(last));
          if (hits.length === 1) input.value = [...parts, hits[0]].join(' ');
          else if (hits.length > 1) print(hits.join('  '), 'dim');
        } else if (e.key === 'Escape') {
          e.stopPropagation();
          input.blur();
        }
      });
      setTimeout(() => input.focus({ preventScroll: true }), 30);
    },
  };
}
