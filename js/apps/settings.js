// Control panel: language, phosphor colour, CRT effects, sound and intro.
import { h } from '../core/dom.js';
import { t, LANGS, getLang, setLang } from '../core/i18n.js';
import { prefs, setPref, THEMES, CRT_LEVELS, save } from '../core/store.js';

function group(label, options, current, onPick) {
  return h('fieldset', { class: 'set-group' },
    h('legend', {}, label),
    h('div', { class: 'seg seg-wide', role: 'radiogroup', 'aria-label': label }, options.map(([value, text]) => h('button', {
      class: 'btn', type: 'button', role: 'radio', 'aria-checked': String(value === current), 'aria-pressed': String(value === current),
      onClick: () => onPick(value),
    }, text))));
}

export default function settings(node, os) {
  return {
    title: () => node.label(),
    icon: 'gear',
    size: [600, 540],
    mount(body, win) {
      body.append(h('article', { class: 'sheet settings' },
        h('h1', { class: 'sheet-title' }, t('set.title')),
        group(t('set.lang'), LANGS.map((l) => [l.code, l.label]), getLang(), (v) => setLang(v)),
        group(t('set.theme'), THEMES.map((v) => [v, t(`theme.${v}`)]), prefs.theme, (v) => { setPref('theme', v); win.rerender(); }),
        h('p', { class: 'dim small' }, t('set.theme.hint')),
        group(t('set.crt'), CRT_LEVELS.map((v) => [v, t(`crt.${v}`)]), prefs.crt, (v) => { setPref('crt', v); win.rerender(); }),
        group(t('set.sound'), [[true, t('set.on')], [false, t('set.off')]], prefs.sound, (v) => { setPref('sound', v); win.rerender(); }),
        h('fieldset', { class: 'set-group' },
          h('legend', {}, t('set.intro')),
          h('div', { class: 'seg seg-wide' },
            h('button', { class: 'btn', type: 'button', onClick: () => { save('booted', false); os.host.restart(); } }, t('set.replay')),
            h('button', { class: 'btn', type: 'button', onClick: () => os.open('guide') }, t('set.guide'))))));
    },
  };
}
