// Virtual file system: one tree, built from the data, shared by the desktop, the phone menus and the terminal.
import { db, PROJECT_CATEGORIES, projectsIn } from './data.js';
import { t, tr } from './i18n.js';

const nodes = new Map();
const parents = new Map();

const EXT = { product: 'EXE', public: 'PRJ', private: 'PRV', confidential: 'SEC' };
const PROJECT_ICON = { product: 'globe', public: 'disk', private: 'lock', confidential: 'warning' };

// Desktop order (also the order of the phone menu)
export const DESKTOP = [
  'about', 'projects', 'skills', 'knowledge', 'experience', 'education',
  'languages', 'contact', 'cv', 'terminal', 'quick', 'guide', 'settings', 'trash',
];

function add(def) {
  nodes.set(def.id, def);
  return def;
}

export function getNode(id) {
  return nodes.get(id);
}

export function childrenOf(id) {
  const n = nodes.get(id);
  return n?.children ? n.children().map((c) => nodes.get(c)).filter(Boolean) : [];
}

export function buildFs() {
  nodes.clear();
  parents.clear();

  // ---- Projects
  for (const p of db.projects) {
    add({
      id: `p/${p.id}`, kind: 'file', app: 'project', icon: PROJECT_ICON[p.visibility],
      name: () => `${p.file}.${EXT[p.visibility]}`,
      label: () => tr(p.title),
      meta: () => p.year,
      args: { project: p.id },
    });
  }
  for (const c of PROJECT_CATEGORIES) {
    add({
      id: `projects/${c}`, kind: 'folder', app: 'explorer', icon: 'folder',
      name: () => t(`dir.${c}`), label: () => t(`cat.${c}`),
      children: () => projectsIn(c).map((p) => `p/${p.id}`),
    });
  }
  add({
    id: 'projects/all', kind: 'folder', app: 'explorer', icon: 'folder', view: 'list',
    name: () => t('dir.all'), label: () => t('cat.all'),
    children: () => db.projects.map((p) => `p/${p.id}`),
  });
  add({ id: 'wip', kind: 'file', app: 'wip', icon: 'hourglass', name: () => t('file.wip'), label: () => t('wip.title') });
  add({
    id: 'projects', kind: 'folder', app: 'explorer', icon: 'folder',
    name: () => t('dir.projects'), label: () => t('desk.projects'),
    children: () => ['projects/all', ...PROJECT_CATEGORIES.map((c) => `projects/${c}`), 'wip'],
  });

  // ---- Skills
  for (const s of db.skillList) {
    add({ id: `s/${s.id}`, kind: 'file', app: 'skill', icon: 'chip', brand: s.icon, name: () => s.name, label: () => s.name, args: { skill: s.id } });
  }
  for (const c of db.skillCats) {
    add({
      id: `skills/${c.id}`, kind: 'folder', app: 'explorer', icon: 'folder',
      name: () => c.file, label: () => tr(c.title),
      children: () => db.skillList.filter((s) => s.cat === c.id).map((s) => `s/${s.id}`),
    });
  }
  add({
    id: 'skills', kind: 'folder', app: 'explorer', icon: 'chip', view: 'groups',
    name: () => t('dir.skills'), label: () => t('desk.skills'),
    children: () => db.skillCats.map((c) => `skills/${c.id}`),
  });

  // ---- Knowledge
  for (const k of db.knowledge) {
    add({ id: `k/${k.id}`, kind: 'file', app: 'knowledge', icon: 'book', name: () => `${k.file}.DOC`, label: () => tr(k.title), args: { knowledge: k.id } });
  }
  add({
    id: 'knowledge', kind: 'folder', app: 'explorer', icon: 'book',
    name: () => t('dir.knowledge'), label: () => t('desk.knowledge'),
    children: () => db.knowledge.map((k) => `k/${k.id}`),
  });

  // ---- Single-window apps
  const apps = [
    ['about', 'about', 'id'],
    ['experience', 'experience', 'briefcase'],
    ['education', 'education', 'cap'],
    ['languages', 'languages', 'globe'],
    ['contact', 'contact', 'mail'],
    ['cv', 'cv', 'disk'],
    ['terminal', 'terminal', 'terminal'],
    ['quick', 'quick', 'printer'],
    ['guide', 'guide', 'help'],
    ['settings', 'settings', 'gear'],
  ];
  for (const [id, app, icon] of apps) {
    add({ id, kind: 'file', app, icon, name: () => t(`file.${id}`), label: () => t(`desk.${id}`) });
  }

  // ---- Trash and the coffee mug easter egg
  add({ id: 'trash/excuses', kind: 'file', app: 'text', icon: 'doc', name: () => t('file.excuses'), label: () => t('file.excuses'), args: { title: 'file.excuses', text: 'trash.excuses' } });
  add({ id: 'trash/bugs', kind: 'file', app: 'text', icon: 'doc', name: () => t('file.bugs'), label: () => t('file.bugs'), args: { title: 'file.bugs', text: 'trash.bugs' } });
  add({ id: 'trash', kind: 'folder', app: 'explorer', icon: 'trash', name: () => t('dir.trash'), label: () => t('desk.trash'), children: () => ['trash/excuses', 'trash/bugs'] });
  add({ id: 'coffee', kind: 'file', app: 'text', icon: 'doc', name: () => 'CAFE.TXT', label: () => t('coffee.title'), args: { title: 'coffee.title', text: 'coffee.text' } });

  add({ id: 'root', kind: 'folder', app: 'explorer', icon: 'computer', name: () => 'C:', label: () => 'NicOS', children: () => DESKTOP });

  // Parent index (first parent wins for nodes listed in several folders)
  const queue = ['root'];
  while (queue.length) {
    const id = queue.shift();
    for (const child of nodes.get(id)?.children?.() || []) {
      if (!parents.has(child)) {
        parents.set(child, id);
        queue.push(child);
      }
    }
  }
}

export function parentOf(id) {
  return parents.get(id);
}

// DOS-style path, e.g. C:\PROYECTOS\IA_ML\NEURCALC.PRJ
export function pathOf(id) {
  const parts = [];
  let cur = id;
  while (cur && cur !== 'root') {
    parts.unshift(nodes.get(cur)?.name() ?? cur);
    cur = parents.get(cur);
  }
  return `C:\\${parts.join('\\')}`;
}

// Terminal path resolution: absolute (C:\..., \...) or relative, '..' and '.', case-insensitive names.
export function resolvePath(cwd, input) {
  if (!input) return cwd;
  let path = input.trim().replace(/\//g, '\\');
  let cur = cwd;
  if (/^c:/i.test(path)) { cur = 'root'; path = path.slice(2); }
  if (path.startsWith('\\')) { cur = 'root'; }
  for (const part of path.split('\\').filter(Boolean)) {
    if (part === '.') continue;
    if (part === '..') { cur = parents.get(cur) || 'root'; continue; }
    const wanted = part.toLowerCase();
    const match = childrenOf(cur).find((n) => n.name().toLowerCase() === wanted || n.label().toLowerCase() === wanted)
      || childrenOf(cur).find((n) => n.name().toLowerCase().split('.')[0] === wanted);
    if (!match) return null;
    cur = match.id;
  }
  return cur;
}
