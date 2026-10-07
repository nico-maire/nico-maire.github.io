// BIOS POST and boot sequence typed into the CRT. Any key or click skips it.
import { h, sleep } from '../core/dom.js';
import { t } from '../core/i18n.js';
import { sfx } from '../core/sound.js';

const LOGO = [
  ' _   _ _       ___  ____  ',
  '| \\ | (_) ___ / _ \\/ ___| ',
  '|  \\| | |/ __| | | \\___ \\ ',
  '| |\\  | | (__| |_| |___) |',
  '|_| \\_|_|\\___|\\___/|____/ ',
].join('\n');

export async function runBoot(root, { fast = false } = {}) {
  root.replaceChildren();
  if (fast) return;

  let skipped = false;
  const skip = () => { skipped = true; };
  window.addEventListener('keydown', skip);
  window.addEventListener('pointerdown', skip);

  const pre = h('pre', { class: 'boot-text' });
  const hint = h('div', { class: 'boot-hint' }, t('boot.skip'));
  const screen = h('div', { class: 'boot' }, pre, hint);
  root.append(screen);

  const wait = (ms) => (skipped ? Promise.resolve() : sleep(ms));
  const line = async (text = '', ms = 90) => {
    pre.textContent += `${text}\n`;
    await wait(ms);
  };

  try {
    await line('NicBIOS (C) 1987-2026  Maire Bravo Technologies, Inc.', 60);
    await line('BIOS Version 2.6  ·  NicOS PC/XT compatible', 220);
    await line('');
    await line(`CPU : ${t('boot.cpu')}`, 120);
    // Memory count-up
    const memLabel = 'Memory Test : ';
    pre.textContent += memLabel;
    for (let k = 64; k <= 640 && !skipped; k += 64) {
      pre.textContent = pre.textContent.replace(/Memory Test : \d*K?$/, `${memLabel}${k}K`);
      sfx.key();
      await wait(45);
    }
    pre.textContent = pre.textContent.replace(/Memory Test : .*$/, `${memLabel}640K OK`);
    await line('', 160);
    await line('');
    await line(t('boot.detect'), 160);
    sfx.hdd(10);
    await line('  C: UC3M ............... Madrid        [ OK ]', 140);
    await line('  D: UniBO .............. Bologna       [ OK ]', 140);
    await line('  E: UADE ............... Buenos Aires  [ OK ]', 140);
    await line(`  F: LANG ............... ES EN IT FR ZH [ OK ]`, 200);
    await line('');
    pre.textContent += `${t('boot.loading')} `;
    for (let i = 0; i < 24 && !skipped; i++) {
      pre.textContent += '#';
      await wait(28);
    }
    await line(' 100%', 260);
    if (!skipped) {
      pre.textContent = '';
      await line(LOGO, 0);
      await line('');
      await line('              "Your idea. Your code. Your reality."', 0);
      await line('');
      sfx.boot();
      await line(`  ${t('boot.welcome')}`, 900);
    }
  } finally {
    window.removeEventListener('keydown', skip);
    window.removeEventListener('pointerdown', skip);
    root.replaceChildren();
  }
}
