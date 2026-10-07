// Contact: e-mail (copy / mailto), LinkedIn, GitHub and a retro "compose" form that opens the mail client.
import { h } from '../core/dom.js';
import { t, tr } from '../core/i18n.js';
import { db } from '../core/data.js';
import { extLink, pxIcon } from './ui.js';
import { sfx } from '../core/sound.js';

export default function contact(node) {
  const p = db.profile;
  return {
    title: () => node.label(),
    icon: 'mail',
    size: [620, 560],
    mount(body) {
      const copied = h('span', { class: 'copied', 'aria-live': 'polite' });
      const subject = h('input', { class: 'field', type: 'text', id: 'mail-subject', maxlength: '120', placeholder: t('contact.subject.ph') });
      const message = h('textarea', { class: 'field', id: 'mail-body', rows: '5', placeholder: t('contact.body.ph') });
      body.append(h('article', { class: 'sheet contact' },
        h('h1', { class: 'sheet-title' }, t('contact.title')),
        h('p', {}, t('contact.intro')),
        h('p', { class: 'w-status' }, h('span', { class: 'w-dot', 'aria-hidden': 'true' }), `${tr(p.status).toUpperCase()} · ${tr(p.location)}`),
        h('div', { class: 'contact-row' },
          pxIcon('mail'),
          h('a', { class: 'mono-link', href: `mailto:${p.email}` }, p.email),
          h('button', { class: 'btn btn-sm', type: 'button', onClick: async () => {
            try {
              await navigator.clipboard.writeText(p.email);
              copied.textContent = t('contact.copied');
            } catch {
              copied.textContent = p.email;
            }
            sfx.beep();
          } }, t('contact.copy')), copied),
        h('div', { class: 'sheet-links' },
          extLink('mail', `mailto:${p.email}`, t('contact.mail')),
          extLink('linkedin', p.links.linkedin, 'LinkedIn'),
          extLink('github', p.links.github, 'GitHub')),
        h('form', { class: 'compose', onSubmit: (e) => {
          e.preventDefault();
          const url = `mailto:${p.email}?subject=${encodeURIComponent(subject.value || t('contact.subject.default'))}&body=${encodeURIComponent(message.value)}`;
          window.location.href = url;
        } },
          h('h2', { class: 'sheet-h' }, t('contact.compose')),
          h('label', { for: 'mail-subject' }, t('contact.subject')), subject,
          h('label', { for: 'mail-body' }, t('contact.body')), message,
          h('div', { class: 'form-actions' }, h('button', { class: 'btn btn-primary', type: 'submit' }, pxIcon('mail'), h('span', {}, t('contact.send')))),
          h('p', { class: 'dim small' }, t('contact.hint')))));
    },
  };
}
