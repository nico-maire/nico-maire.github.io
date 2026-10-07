// Retro sound effects synthesised with Web Audio (no audio files). Muted unless prefs.sound is on.
import { prefs } from './store.js';

let ctx = null;
let hum = null;

function audio() {
  if (!prefs.sound) return null;
  try {
    ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone({ freq = 880, type = 'square', dur = 0.08, vol = 0.05, at = 0, slide = 0 }) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

function noise({ dur = 0.03, vol = 0.04, at = 0, filter = 2000 }) {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + at;
  const len = Math.max(1, Math.floor(ac.sampleRate * dur));
  const buffer = ac.createBuffer(1, len, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = ac.createBufferSource();
  const bp = ac.createBiquadFilter();
  const gain = ac.createGain();
  bp.type = 'bandpass';
  bp.frequency.value = filter;
  gain.gain.value = vol;
  src.buffer = buffer;
  src.connect(bp).connect(gain).connect(ac.destination);
  src.start(t0);
}

export const sfx = {
  click: () => noise({ dur: 0.02, vol: 0.06, filter: 3500 }),
  key: () => noise({ dur: 0.015, vol: 0.035, filter: 5000 }),
  open: () => { tone({ freq: 660, dur: 0.05, vol: 0.03 }); tone({ freq: 990, dur: 0.06, vol: 0.03, at: 0.05 }); },
  close: () => { tone({ freq: 880, dur: 0.05, vol: 0.03 }); tone({ freq: 520, dur: 0.07, vol: 0.03, at: 0.05 }); },
  error: () => tone({ freq: 180, type: 'sawtooth', dur: 0.25, vol: 0.04 }),
  beep: () => tone({ freq: 1000, dur: 0.12, vol: 0.04 }),
  power: () => {
    noise({ dur: 0.05, vol: 0.12, filter: 900 });
    tone({ freq: 60, type: 'sine', dur: 0.6, vol: 0.06, slide: 40 });
    tone({ freq: 15000, type: 'sine', dur: 1.2, vol: 0.006, at: 0.1 });
  },
  hdd: (n = 8) => {
    for (let i = 0; i < n; i++) noise({ dur: 0.012, vol: 0.05, filter: 1400 + Math.random() * 1600, at: i * 0.07 + Math.random() * 0.05 });
  },
  boot: () => { tone({ freq: 523, dur: 0.1, vol: 0.035 }); tone({ freq: 659, dur: 0.1, vol: 0.035, at: 0.1 }); tone({ freq: 784, dur: 0.18, vol: 0.035, at: 0.2 }); },
  nokia: () => tone({ freq: 1760, dur: 0.04, vol: 0.03 }),
};

export function startHum() {
  const ac = audio();
  if (!ac || hum) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = 'sine';
  osc.frequency.value = 50;
  gain.gain.value = 0.012;
  osc.connect(gain).connect(ac.destination);
  osc.start();
  hum = { osc, gain };
}

export function stopHum() {
  if (!hum) return;
  try { hum.osc.stop(); } catch { /* ignore */ }
  hum = null;
}
