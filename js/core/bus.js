// Minimal event bus shared by every module.
const listeners = new Map();

export const bus = {
  on(event, fn) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(fn);
    return () => listeners.get(event)?.delete(fn);
  },
  emit(event, payload) {
    for (const fn of listeners.get(event) || []) {
      try { fn(payload); } catch (err) { console.error(`[bus:${event}]`, err); }
    }
  },
};
