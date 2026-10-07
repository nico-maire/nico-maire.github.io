// Hash router. Routes: #/ (home), #/open/<nodeId>, #/quick
import { bus } from './bus.js';

export function parseRoute() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [name, ...rest] = raw.split('/');
  return { name: name || 'home', arg: rest.length ? decodeURIComponent(rest.join('/')) : '' };
}

export function go(path, { replace = false, silent = false } = {}) {
  const url = path ? `#/${path}` : location.pathname + location.search;
  if (path ? url === location.hash : !location.hash) return;
  try {
    if (replace) history.replaceState(null, '', url);
    else history.pushState(null, '', url);
  } catch { location.hash = path ? `/${path}` : ''; }
  if (!silent) bus.emit('route', parseRoute());
}

export function openPath(nodeId) {
  return `open/${nodeId.split('/').map(encodeURIComponent).join('/')}`;
}

window.addEventListener('hashchange', () => bus.emit('route', parseRoute()));
