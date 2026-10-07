// Pixel cursors generated at runtime from bitmaps, so they follow the active phosphor colour.
// 'X' = outline, 'o' = fill. Exposed as CSS custom properties (--cur-*), used by the stylesheets.
import { bus } from './bus.js';

const CURSORS = {
  arrow: {
    hot: [0, 0],
    rows: [
      'X...........',
      'XX..........',
      'XoX.........',
      'XooX........',
      'XoooX.......',
      'XooooX......',
      'XoooooX.....',
      'XooooooX....',
      'XoooooooX...',
      'XooooooooX..',
      'XoooooXXXXX.',
      'XooXooX.....',
      'XoX.XooX....',
      'XX..XooX....',
      'X....XooX...',
      '.....XooX...',
      '......XX....',
    ],
  },
  hand: {
    hot: [5, 0],
    rows: [
      '.....XX.........',
      '....XooX........',
      '....XooX........',
      '....XooX........',
      '....XooXXX......',
      '....XooXooXXX...',
      '....XooXooXooXX.',
      '.XX.XooXooXooXoX',
      'XooXXoooooooooX.',
      'XoooXooooooooooX',
      '.XooooooooooooX.',
      '..XoooooooooooX.',
      '...XoooooooooX..',
      '....XoooooooX...',
      '.....XoooooX....',
      '.....XXXXXXX....',
    ],
  },
  wait: {
    hot: [6, 8],
    rows: [
      'XXXXXXXXXXXXX',
      'XoooooooooooX',
      '.XoooooooooX.',
      '.XoXoXoXoXoX.',
      '..XoXoXoXoX..',
      '...XoXoXoX...',
      '....XoXoX....',
      '.....XoX.....',
      '.....XoX.....',
      '....XoooX....',
      '...XoooooX...',
      '..XoooXoooX..',
      '.XoooXoXoooX.',
      '.XooXoXoXooX.',
      'XoooooooooooX',
      'XXXXXXXXXXXXX',
    ],
  },
  move: {
    hot: [7, 7],
    rows: [
      '.......X.......',
      '......XoX......',
      '.....XoooX.....',
      '......XoX......',
      '...X..XoX..X...',
      '..XX..XoX..XX..',
      '.XoXXXXoXXXXoX.',
      'XoooooooooooooX',
      '.XoXXXXoXXXXoX.',
      '..XX..XoX..XX..',
      '...X..XoX..X...',
      '......XoX......',
      '.....XoooX.....',
      '......XoX......',
      '.......X.......',
    ],
  },
  text: {
    hot: [3, 8],
    rows: [
      'XXX.XXX',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      '...X...',
      'XXX.XXX',
    ],
  },
};

const FALLBACK = { arrow: 'default', hand: 'pointer', wait: 'wait', move: 'move', text: 'text' };
const SCALE = 2;

function render(rows, outline, fill) {
  const w = Math.max(...rows.map((r) => r.length));
  const canvas = document.createElement('canvas');
  canvas.width = w * SCALE;
  canvas.height = rows.length * SCALE;
  const g = canvas.getContext('2d');
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      if (ch === '.') return;
      g.fillStyle = ch === 'X' ? outline : fill;
      g.fillRect(x * SCALE, y * SCALE, SCALE, SCALE);
    });
  });
  return canvas.toDataURL('image/png');
}

export function installCursors() {
  const root = document.documentElement;
  const style = getComputedStyle(root);
  const ph = style.getPropertyValue('--ph').trim() || '#3cff7a';
  const bg = style.getPropertyValue('--bg').trim() || '#000';
  for (const [name, def] of Object.entries(CURSORS)) {
    const [hx, hy] = def.hot.map((v) => v * SCALE);
    // Inside the CRT: phosphor arrow with dark outline. Outside, in the office: classic black outline + white fill.
    const crt = render(def.rows, bg, ph);
    const classic = render(def.rows, '#000', '#fff');
    root.style.setProperty(`--cur-${name}`, `url(${crt}) ${hx} ${hy}, ${FALLBACK[name]}`);
    root.style.setProperty(`--cur-${name}-classic`, `url(${classic}) ${hx} ${hy}, ${FALLBACK[name]}`);
  }
  root.style.setProperty('--cur-default-classic', root.style.getPropertyValue('--cur-arrow-classic'));
}

bus.on('prefs', ({ key }) => { if (key === 'theme') requestAnimationFrame(installCursors); });
