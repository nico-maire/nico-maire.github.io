#!/usr/bin/env python3
"""Generates the illustrated office scene used until a photographic/AI image replaces it.

Writes assets/scene/office-back.svg (wall layer) and assets/scene/office-front.svg (desk layer).
Coordinates are in a 1920x1080 stage; data/scene.json holds the matching hotspot rectangles.
Run: python3 scripts/build-scene.py
"""
from pathlib import Path
import random

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'assets' / 'scene'
OUT.mkdir(parents=True, exist_ok=True)
random.seed(7)

W, H = 1920, 1080

# Screen glass rectangle (4:3). Must match data/scene.json -> screen.
SX, SY, SW, SH = 750, 250, 420, 315


def f(v):
    return f'{v:.1f}'.rstrip('0').rstrip('.')


# --------------------------------------------------------------------------- world map
MAP_X, MAP_Y, MAP_W, MAP_H = 1268, 158, 344, 194

CONTINENTS = {
    'na': [(-165, 65), (-150, 70), (-125, 72), (-95, 72), (-80, 65), (-62, 58), (-55, 50), (-65, 45), (-75, 38),
           (-80, 30), (-82, 25), (-90, 29), (-97, 26), (-97, 20), (-90, 16), (-83, 10), (-79, 8), (-85, 12),
           (-95, 16), (-105, 20), (-110, 24), (-117, 32), (-124, 40), (-124, 48), (-135, 58), (-150, 60), (-165, 60)],
    'gl': [(-55, 60), (-45, 60), (-20, 70), (-20, 80), (-40, 83), (-60, 80), (-70, 77), (-55, 70)],
    'sa': [(-80, 8), (-75, 11), (-62, 10), (-50, 2), (-35, -5), (-38, -13), (-40, -22), (-48, -28), (-53, -34),
           (-58, -38), (-63, -41), (-65, -46), (-68, -52), (-72, -53), (-74, -45), (-73, -37), (-71, -28), (-70, -18),
           (-76, -14), (-81, -5), (-80, 0)],
    'eu': [(-10, 36), (-9, 43), (-2, 44), (-5, 48), (0, 50), (5, 53), (8, 57), (5, 62), (15, 69), (28, 71), (40, 67),
           (42, 60), (30, 55), (28, 46), (22, 40), (26, 38), (23, 36), (16, 38), (12, 44), (8, 44), (3, 42), (-1, 37)],
    'uk': [(-5, 50), (1, 51), (1, 53), (-3, 56), (-6, 58), (-5, 55), (-3, 54)],
    'af': [(-17, 21), (-16, 28), (-9, 34), (0, 36), (10, 37), (20, 32), (32, 31), (35, 28), (43, 12), (51, 11), (48, 4),
           (41, -2), (40, -11), (35, -22), (32, -28), (27, -34), (20, -35), (17, -29), (13, -17), (13, -6), (9, 0),
           (9, 4), (4, 6), (-8, 4), (-13, 8), (-17, 14)],
    'as': [(28, 46), (30, 55), (42, 60), (40, 67), (60, 70), (80, 73), (100, 77), (130, 72), (160, 70), (180, 67),
           (178, 62), (160, 58), (142, 52), (140, 42), (130, 35), (122, 30), (120, 22), (110, 20), (105, 10), (103, 2),
           (98, 8), (97, 17), (90, 22), (80, 15), (77, 8), (72, 20), (66, 25), (57, 25), (52, 28), (48, 30), (44, 13),
           (43, 12), (35, 28), (36, 36)],
    'jp': [(130, 31), (135, 34), (140, 36), (142, 40), (141, 43), (140, 41), (136, 36), (131, 34)],
    'au': [(114, -22), (122, -17), (131, -12), (137, -12), (142, -11), (146, -19), (153, -25), (151, -34), (146, -39),
           (138, -35), (130, -32), (118, -35), (115, -33)],
}


def geo(lon, lat):
    return MAP_X + (lon + 180) / 360 * MAP_W, MAP_Y + (90 - lat) / 180 * MAP_H


def poly(points):
    pts = [geo(lon, lat) for lon, lat in points]
    return 'M' + ' L'.join(f'{f(x)} {f(y)}' for x, y in pts) + 'Z'


PINS = {'madrid': (-3.7, 40.4), 'bologna': (11.3, 44.5), 'buenosaires': (-58.4, -34.6)}


# --------------------------------------------------------------------------- back layer
def back_svg():
    s = []
    s.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">')
    s.append('''<defs>
  <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#15120f"/><stop offset=".5" stop-color="#241c15"/><stop offset="1" stop-color="#1a140f"/>
  </linearGradient>
  <pattern id="paper" width="64" height="64" patternUnits="userSpaceOnUse">
    <rect width="32" height="64" fill="#fff" opacity=".022"/>
    <rect x="31" width="2" height="64" fill="#000" opacity=".05"/>
  </pattern>
  <radialGradient id="lampWall" cx="420" cy="520" r="980" gradientUnits="userSpaceOnUse">
    <stop offset="0" stop-color="#ffbb6b" stop-opacity=".46"/>
    <stop offset=".35" stop-color="#ff9a45" stop-opacity=".16"/>
    <stop offset="1" stop-color="#ff9a45" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="night" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#03070f"/><stop offset=".6" stop-color="#0b1730"/><stop offset="1" stop-color="#1d2c4c"/>
  </linearGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4a3220"/><stop offset="1" stop-color="#2c1d12"/>
  </linearGradient>
  <linearGradient id="frameGold" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#8a6a33"/><stop offset=".5" stop-color="#c49a4c"/><stop offset="1" stop-color="#6b4f22"/>
  </linearGradient>
  <linearGradient id="parchment" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#efe3c4"/><stop offset="1" stop-color="#d9c79d"/>
  </linearGradient>
  <linearGradient id="ocean" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2f4d55"/><stop offset="1" stop-color="#22383f"/>
  </linearGradient>
  <linearGradient id="deskShadow" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/>
  </linearGradient>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.2"/></filter>
</defs>''')
    s.append(f'<rect width="{W}" height="{H}" fill="url(#wall)"/>')
    s.append(f'<rect width="{W}" height="{H}" fill="url(#paper)"/>')

    # Wainscot / chair rail
    s.append('<rect x="0" y="600" width="1920" height="10" fill="#2f2419"/><rect x="0" y="610" width="1920" height="3" fill="#000" opacity=".35"/>')

    # ---- Bookshelf above the monitor
    s.append('<g id="shelf">')
    s.append('<rect x="560" y="150" width="660" height="16" rx="2" fill="url(#wood)"/>')
    s.append('<rect x="560" y="166" width="660" height="10" fill="#000" opacity=".35" filter="url(#soft)"/>')
    s.append('<rect x="590" y="166" width="14" height="30" fill="#2a1c11"/><rect x="1186" y="166" width="14" height="30" fill="#2a1c11"/>')
    x = 590
    colours = ['#5b1f1b', '#1f2f4d', '#4a4a24', '#7a5a1e', '#3b2a1e', '#2d3b2d', '#6b2d2d', '#24384a', '#5a4630']
    while x < 880:
        w = random.randint(14, 26)
        h = random.randint(70, 104)
        c = random.choice(colours)
        tilt = ''
        if random.random() < 0.12:
            tilt = f' transform="rotate(-8 {x + w} 150)"'
        s.append(f'<rect x="{x}" y="{150 - h}" width="{w}" height="{h}" rx="1.5" fill="{c}"{tilt}/>')
        s.append(f'<rect x="{x + 3}" y="{150 - h + 10}" width="{w - 6}" height="3" fill="#d8c08a" opacity=".35"{tilt}/>')
        s.append(f'<rect x="{x + 3}" y="{150 - 22}" width="{w - 6}" height="2" fill="#d8c08a" opacity=".25"{tilt}/>')
        x += w + random.randint(0, 2)
    # Binders and a little robot on the right half
    for i, c in enumerate(['#3a3f46', '#2f3a33', '#4b3b2b']):
        bx = 1000 + i * 44
        s.append(f'<rect x="{bx}" y="56" width="38" height="94" rx="3" fill="{c}"/>')
        s.append(f'<rect x="{bx + 8}" y="72" width="22" height="30" rx="2" fill="#e8dcc0" opacity=".55"/>')
        s.append(f'<circle cx="{bx + 19}" cy="128" r="6" fill="#000" opacity=".45"/>')
    s.append('''<g transform="translate(1146 86)">
    <rect x="6" y="0" width="38" height="30" rx="4" fill="#9aa0a6"/>
    <rect x="12" y="8" width="10" height="8" rx="2" fill="#3cff7a" opacity=".85"/><rect x="28" y="8" width="10" height="8" rx="2" fill="#3cff7a" opacity=".85"/>
    <rect x="22" y="-10" width="6" height="10" fill="#7d838a"/><circle cx="25" cy="-12" r="4" fill="#ff5a4a"/>
    <rect x="0" y="32" width="50" height="32" rx="4" fill="#80868d"/>
    <rect x="14" y="40" width="22" height="14" rx="2" fill="#3a4047"/>
  </g>''')
    s.append('</g>')

    # ---- Diploma (left wall)
    s.append('''<g id="diploma" transform="translate(196 154) rotate(-1.2 125 92)">
    <rect x="6" y="10" width="250" height="186" fill="#000" opacity=".45" filter="url(#soft)"/>
    <rect x="0" y="0" width="250" height="184" rx="3" fill="url(#frameGold)"/>
    <rect x="10" y="10" width="230" height="164" fill="#3a2a17"/>
    <rect x="16" y="16" width="218" height="152" fill="url(#parchment)"/>
    <rect x="22" y="22" width="206" height="140" fill="none" stroke="#9b7d45" stroke-width="1.5"/>
    <rect x="70" y="34" width="110" height="9" rx="2" fill="#4a3a22"/>
    <rect x="52" y="54" width="146" height="4" rx="2" fill="#7a6640"/>
    <rect x="86" y="72" width="78" height="12" rx="2" fill="#3a2c18"/>
    <rect x="44" y="94" width="162" height="3" rx="1.5" fill="#8a7650"/>
    <rect x="44" y="104" width="140" height="3" rx="1.5" fill="#8a7650"/>
    <rect x="44" y="114" width="150" height="3" rx="1.5" fill="#8a7650"/>
    <path d="M54 146 q10 -10 20 0 t20 0 t20 0" stroke="#2b2b5a" stroke-width="2" fill="none"/>
    <rect x="44" y="150" width="70" height="1.5" fill="#6b5a3a"/>
    <path d="M178 150 l-8 22 l10 -6 l6 8 z" fill="#8f1f1a"/><path d="M196 150 l8 22 l-10 -6 l-6 8 z" fill="#7a1915"/>
    <circle cx="187" cy="142" r="17" fill="#a3281f"/><circle cx="187" cy="142" r="12" fill="none" stroke="#e0a58f" stroke-width="1.5" opacity=".7"/>
    <circle cx="187" cy="142" r="5" fill="#d58a6f" opacity=".6"/>
  </g>''')

    # ---- World map with pins (right wall)
    s.append('<g id="map">')
    s.append(f'<rect x="{MAP_X - 18 + 8}" y="{MAP_Y - 18 + 10}" width="{MAP_W + 36}" height="{MAP_H + 36}" fill="#000" opacity=".45" filter="url(#soft)"/>')
    s.append(f'<rect x="{MAP_X - 18}" y="{MAP_Y - 18}" width="{MAP_W + 36}" height="{MAP_H + 36}" rx="3" fill="url(#wood)"/>')
    s.append(f'<rect x="{MAP_X - 8}" y="{MAP_Y - 8}" width="{MAP_W + 16}" height="{MAP_H + 16}" fill="#d9c9a0"/>')
    s.append(f'<rect x="{MAP_X}" y="{MAP_Y}" width="{MAP_W}" height="{MAP_H}" fill="url(#ocean)"/>')
    # graticule
    for lon in range(-150, 181, 30):
        x0, _ = geo(lon, 0)
        s.append(f'<line x1="{f(x0)}" y1="{MAP_Y}" x2="{f(x0)}" y2="{MAP_Y + MAP_H}" stroke="#a9c1c3" stroke-width=".6" opacity=".22"/>')
    for lat in range(-60, 61, 30):
        _, y0 = geo(0, lat)
        s.append(f'<line x1="{MAP_X}" y1="{f(y0)}" x2="{MAP_X + MAP_W}" y2="{f(y0)}" stroke="#a9c1c3" stroke-width=".6" opacity=".22"/>')
    for pts in CONTINENTS.values():
        s.append(f'<path d="{poly(pts)}" fill="#cdbb8c" stroke="#8d7a4f" stroke-width=".8" stroke-linejoin="round"/>')
    s.append(f'<rect x="{MAP_X}" y="{MAP_Y + MAP_H - 10}" width="{MAP_W}" height="10" fill="#e9e2cf" opacity=".85"/>')
    # route between the three cities
    mx, my = geo(*PINS['madrid'])
    bx, by = geo(*PINS['bologna'])
    ax, ay = geo(*PINS['buenosaires'])
    s.append(f'<path d="M{f(mx)} {f(my)} Q{f((mx + ax) / 2 - 40)} {f((my + ay) / 2 - 30)} {f(ax)} {f(ay)}" fill="none" stroke="#ff4a3d" stroke-width="1.4" stroke-dasharray="4 3" opacity=".9"/>')
    s.append(f'<path d="M{f(mx)} {f(my)} Q{f((mx + bx) / 2)} {f(my - 14)} {f(bx)} {f(by)}" fill="none" stroke="#ff4a3d" stroke-width="1.4" stroke-dasharray="3 2" opacity=".9"/>')
    for name, (lon, lat) in PINS.items():
        px, py = geo(lon, lat)
        s.append(f'<g id="pin-{name}"><line x1="{f(px)}" y1="{f(py)}" x2="{f(px + 4)}" y2="{f(py - 12)}" stroke="#d6d6d6" stroke-width="1.4"/>'
                 f'<circle cx="{f(px + 4)}" cy="{f(py - 13)}" r="4.6" fill="#e3262a"/><circle cx="{f(px + 2.6)}" cy="{f(py - 14.5)}" r="1.4" fill="#fff" opacity=".8"/></g>')
    s.append('</g>')

    # ---- Window with blinds and city lights (far right, partly cut)
    s.append('<g id="window">')
    s.append('<rect x="1700" y="88" width="300" height="470" fill="#1c140d"/>')
    s.append('<rect x="1716" y="104" width="280" height="440" fill="url(#night)"/>')
    # skyline
    bx = 1716
    while bx < 1996:
        bw = random.randint(22, 46)
        bh = random.randint(90, 230)
        s.append(f'<rect x="{bx}" y="{544 - bh}" width="{bw}" height="{bh}" fill="#070b14"/>')
        for wy in range(544 - bh + 10, 540, 12):
            for wx in range(bx + 4, bx + bw - 4, 8):
                if random.random() < 0.28:
                    c = random.choice(['#ffd27a', '#ffc35a', '#f6e7b0', '#9fc7ff'])
                    s.append(f'<rect x="{wx}" y="{wy}" width="3" height="4" fill="{c}" opacity="{random.uniform(.5, .95):.2f}"/>')
        bx += bw + random.randint(2, 8)
    s.append('<circle cx="1930" cy="170" r="16" fill="#f3efd8" opacity=".75"/><circle cx="1930" cy="170" r="36" fill="#f3efd8" opacity=".08"/>')
    # blinds
    for i, y in enumerate(range(104, 400, 14)):
        s.append(f'<rect x="1716" y="{y}" width="280" height="9" fill="#cbbd9f" opacity=".86"/>')
        s.append(f'<rect x="1716" y="{y + 7}" width="280" height="2" fill="#000" opacity=".25"/>')
    s.append('<rect x="1716" y="396" width="280" height="10" fill="#b8aa8b"/>')
    s.append('<line x1="1850" y1="104" x2="1850" y2="430" stroke="#9a8d70" stroke-width="1.5"/>')
    s.append('<rect x="1700" y="544" width="300" height="20" fill="#2b2016"/>')
    s.append('</g>')

    # ---- Lamp light washing the wall
    s.append(f'<rect width="{W}" height="{H}" fill="url(#lampWall)"/>')
    # Desk shadow on the wall
    s.append('<rect x="0" y="640" width="1920" height="80" fill="url(#deskShadow)"/>')
    s.append('</svg>')
    return '\n'.join(s)


# --------------------------------------------------------------------------- front layer
def keyboard():
    """Keyboard drawn in light perspective: back edge narrower than the front edge."""
    out = []
    back_y, front_y = 822, 918
    back_l, back_r = 704, 1216
    front_l, front_r = 676, 1244
    out.append(f'<path d="M{back_l} {back_y} L{back_r} {back_y} L{front_r} {front_y} L{front_l} {front_y} Z" fill="url(#beigeKb)" stroke="#8f8670" stroke-width="1.5"/>')
    out.append(f'<path d="M{front_l} {front_y} L{front_r} {front_y} L{front_r - 4} {front_y + 14} L{front_l + 4} {front_y + 14} Z" fill="#9d937a"/>')
    rows = 6
    for r in range(rows):
        t0 = (r + 0.18) / rows
        t1 = (r + 0.86) / rows
        y0 = back_y + 8 + (front_y - back_y - 14) * t0
        y1 = back_y + 8 + (front_y - back_y - 14) * t1
        l0 = back_l + (front_l - back_l) * t0 + 14
        r0 = back_r + (front_r - back_r) * t0 - 14
        l1 = back_l + (front_l - back_l) * t1 + 14
        r1 = back_r + (front_r - back_r) * t1 - 14
        # three blocks: main, navigation, numpad
        blocks = [(0.0, 0.66, 14 if r else 13), (0.69, 0.80, 3), (0.83, 1.0, 4)]
        for b0, b1, n in blocks:
            if r == 0 and b0 > 0.6 and b0 < 0.7:
                continue
            for k in range(n):
                k0 = b0 + (b1 - b0) * k / n
                k1 = b0 + (b1 - b0) * (k + 0.82) / n
                if r == rows - 1 and b0 == 0.0:
                    if k in (4, 5, 6, 7, 8):
                        if k != 4:
                            continue
                        k1 = b0 + (b1 - b0) * (8.82) / n  # space bar
                x00 = l0 + (r0 - l0) * k0
                x01 = l0 + (r0 - l0) * k1
                x10 = l1 + (r1 - l1) * k0
                x11 = l1 + (r1 - l1) * k1
                shade = '#ece5d2' if b0 == 0.0 and 0 < r < rows - 1 and 0 < k < n - 1 else '#cfc6ae'
                out.append(f'<path d="M{f(x00)} {f(y0)} L{f(x01)} {f(y0)} L{f(x11)} {f(y1)} L{f(x10)} {f(y1)} Z" fill="{shade}" stroke="#a69c82" stroke-width=".8"/>')
    return '\n'.join(out)


def lamp():
    """Angle-poise lamp: base, two arms and a cone shade pointing at the desk."""
    import math
    base = (300, 790)
    joint = (250, 566)
    pivot = (418, 452)
    d = (0.55, 0.835)
    n = (0.835, -0.55)
    length, back_w, front_w = 124, 15, 58
    p = pivot
    b1 = (p[0] + n[0] * back_w, p[1] + n[1] * back_w)
    b2 = (p[0] - n[0] * back_w, p[1] - n[1] * back_w)
    fc = (p[0] + d[0] * length, p[1] + d[1] * length)
    f1 = (fc[0] + n[0] * front_w, fc[1] + n[1] * front_w)
    f2 = (fc[0] - n[0] * front_w, fc[1] - n[1] * front_w)
    bulge = (fc[0] + d[0] * 14, fc[1] + d[1] * 14)
    ang = math.degrees(math.atan2(n[1], n[0]))
    out = ['<g id="lamp">']
    out.append(f'<path d="M{f(f1[0])} {f(f1[1])} L{f(f2[0])} {f(f2[1])} L360 840 L840 840 Z" fill="url(#beam)"/>')
    out.append('<ellipse cx="300" cy="812" rx="96" ry="22" fill="#000" opacity=".5" filter="url(#shadowS)"/>')
    out.append('<ellipse cx="300" cy="800" rx="86" ry="20" fill="url(#metal)"/>')
    out.append('<ellipse cx="300" cy="794" rx="70" ry="14" fill="#2a2a29"/>')
    out.append(f'<line x1="{base[0]}" y1="{base[1] - 6}" x2="{joint[0]}" y2="{joint[1]}" stroke="#2f2f2d" stroke-width="13" stroke-linecap="round"/>')
    out.append(f'<line x1="{base[0] - 3}" y1="{base[1] - 6}" x2="{joint[0] - 3}" y2="{joint[1]}" stroke="#5a5a56" stroke-width="3" stroke-linecap="round" opacity=".7"/>')
    out.append(f'<line x1="{joint[0]}" y1="{joint[1]}" x2="{pivot[0]}" y2="{pivot[1]}" stroke="#2f2f2d" stroke-width="12" stroke-linecap="round"/>')
    out.append(f'<line x1="{joint[0]}" y1="{joint[1] - 3}" x2="{pivot[0]}" y2="{pivot[1] - 3}" stroke="#5a5a56" stroke-width="3" stroke-linecap="round" opacity=".7"/>')
    out.append(f'<circle cx="{joint[0]}" cy="{joint[1]}" r="11" fill="#252524" stroke="#5a5a56" stroke-width="2"/>')
    out.append(f'<path d="M{f(b1[0])} {f(b1[1])} L{f(f1[0])} {f(f1[1])} Q{f(bulge[0])} {f(bulge[1])} {f(f2[0])} {f(f2[1])} L{f(b2[0])} {f(b2[1])} Z" fill="url(#lampShade)" stroke="#0e1f14" stroke-width="2"/>')
    out.append(f'<ellipse cx="{f(fc[0] + d[0] * 4)}" cy="{f(fc[1] + d[1] * 4)}" rx="{front_w - 4}" ry="9" fill="#ffe7b0" transform="rotate({f(ang)} {f(fc[0] + d[0] * 4)} {f(fc[1] + d[1] * 4)})"/>')
    out.append(f'<ellipse cx="{f(fc[0] + d[0] * 4)}" cy="{f(fc[1] + d[1] * 4)}" rx="{front_w + 30}" ry="34" fill="#ffd58f" opacity=".16" transform="rotate({f(ang)} {f(fc[0] + d[0] * 4)} {f(fc[1] + d[1] * 4)})"/>')
    out.append(f'<circle cx="{pivot[0]}" cy="{pivot[1]}" r="10" fill="#252524" stroke="#5a5a56" stroke-width="2"/>')
    out.append('</g>')
    return '\n'.join(out)


def front_svg():
    s = []
    s.append(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice">')
    s.append('''<defs>
  <linearGradient id="deskTop" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#5a3c23"/><stop offset=".35" stop-color="#4a301b"/><stop offset="1" stop-color="#2a1a0e"/>
  </linearGradient>
  <linearGradient id="deskEdge" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#7a5232"/><stop offset="1" stop-color="#3a2513"/>
  </linearGradient>
  <radialGradient id="lampPool" cx="560" cy="820" r="520" gradientUnits="userSpaceOnUse" gradientTransform="translate(560 820) scale(1 .34) translate(-560 -820)">
    <stop offset="0" stop-color="#ffcf8a" stop-opacity=".5"/><stop offset=".55" stop-color="#ffb066" stop-opacity=".14"/><stop offset="1" stop-color="#ffb066" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="beige" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#e9e1cb"/><stop offset=".55" stop-color="#d9cfb5"/><stop offset="1" stop-color="#c2b796"/>
  </linearGradient>
  <linearGradient id="beigeSide" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#000" stop-opacity=".16"/><stop offset=".08" stop-color="#000" stop-opacity="0"/>
    <stop offset=".92" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/>
  </linearGradient>
  <linearGradient id="beigeKb" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#d4cab0"/><stop offset="1" stop-color="#bdb293"/>
  </linearGradient>
  <linearGradient id="recess" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#8f8670"/><stop offset=".12" stop-color="#b3a98f"/><stop offset="1" stop-color="#c8bea3"/>
  </linearGradient>
  <radialGradient id="glass" cx=".5" cy=".5" r=".75">
    <stop offset="0" stop-color="#1a211b"/><stop offset=".7" stop-color="#0e130f"/><stop offset="1" stop-color="#050705"/>
  </radialGradient>
  <linearGradient id="glare" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset=".35" stop-color="#fff" stop-opacity=".03"/><stop offset=".36" stop-color="#fff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#1b1b1b"/><stop offset=".5" stop-color="#4a4a48"/><stop offset="1" stop-color="#151515"/>
  </linearGradient>
  <linearGradient id="lampShade" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#2f5a3f"/><stop offset="1" stop-color="#132a1c"/>
  </linearGradient>
  <linearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#ffd59a" stop-opacity=".22"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="mug" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#b9b1a2"/><stop offset=".4" stop-color="#eee8dc"/><stop offset="1" stop-color="#a7a091"/>
  </linearGradient>
  <linearGradient id="nokia" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#3f4954"/><stop offset=".5" stop-color="#6b7785"/><stop offset="1" stop-color="#36404a"/>
  </linearGradient>
  <linearGradient id="pot" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#8a3f22"/><stop offset=".45" stop-color="#b8603a"/><stop offset="1" stop-color="#6f3018"/>
  </linearGradient>
  <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10"/></filter>
  <filter id="shadowS" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
  <style>
    .steam { fill: none; stroke: #fff; stroke-width: 3; stroke-linecap: round; opacity: 0; animation: steam 4.5s ease-in-out infinite; }
    .steam.b { animation-delay: 1.5s; } .steam.c { animation-delay: 3s; }
    @keyframes steam { 0% { opacity: 0; transform: translateY(8px); } 30% { opacity: .18; } 100% { opacity: 0; transform: translateY(-34px); } }
    @media (prefers-reduced-motion: reduce) { .steam { animation: none; } }
  </style>
</defs>''')
    # ---- Desk
    s.append('<path d="M-20 712 L1940 712 L1940 1100 L-20 1100 Z" fill="url(#deskTop)"/>')
    s.append('<rect x="-20" y="708" width="1960" height="8" fill="url(#deskEdge)"/>')
    for i in range(26):
        y = 730 + i * 14 + random.randint(-3, 3)
        a = random.uniform(.04, .1)
        s.append(f'<path d="M-20 {y} C 400 {y + random.randint(-6, 6)}, 1200 {y + random.randint(-8, 8)}, 1940 {y + random.randint(-5, 5)}" stroke="#1a0f06" stroke-width="{random.uniform(1, 2.4):.1f}" fill="none" opacity="{a:.2f}"/>')
    s.append('<rect x="-20" y="712" width="1960" height="380" fill="url(#lampPool)"/>')

    # ---- Lamp (left)
    s.append(lamp())

    # ---- Floppy disks stack
    s.append('<g id="floppies">')
    s.append('<ellipse cx="560" cy="905" rx="90" ry="14" fill="#000" opacity=".45" filter="url(#shadowS)"/>')
    for i, (c, rot) in enumerate([('#1c1c22', -7), ('#1f3a66', 4), ('#7a1d1d', -2)]):
        y = 856 - i * 9
        s.append(f'<g transform="rotate({rot} 560 {y + 30})"><rect x="502" y="{y}" width="116" height="62" rx="3" fill="{c}"/>'
                 f'<rect x="530" y="{y}" width="60" height="18" fill="#9da3aa"/><rect x="560" y="{y + 3}" width="10" height="12" fill="#2d2f33"/>'
                 f'<rect x="514" y="{y + 26}" width="92" height="30" rx="2" fill="#efe9da"/>'
                 f'<rect x="520" y="{y + 32}" width="60" height="3" fill="#2a4fa0" opacity=".7"/><rect x="520" y="{y + 40}" width="44" height="3" fill="#2a4fa0" opacity=".5"/></g>')
    s.append('</g>')

    # ---- Computer case (desktop unit)
    s.append('<g id="pc">')
    s.append('<ellipse cx="960" cy="800" rx="360" ry="26" fill="#000" opacity=".6" filter="url(#shadow)"/>')
    s.append('<rect x="650" y="666" width="620" height="124" rx="10" fill="url(#beige)"/>')
    s.append('<rect x="650" y="666" width="620" height="124" rx="10" fill="url(#beigeSide)"/>')
    s.append('<rect x="650" y="666" width="620" height="6" rx="3" fill="#f3ecd9" opacity=".7"/>')
    s.append('<rect x="650" y="776" width="620" height="14" rx="6" fill="#b1a686"/>')
    # power button recess + label
    s.append('<rect x="684" y="706" width="66" height="44" rx="6" fill="#b4a98b"/><rect x="690" y="711" width="54" height="34" rx="5" fill="#d8cfb6" stroke="#9f9478" stroke-width="1.5"/>')
    s.append('<text x="717" y="766" font-family="Arial, Helvetica, sans-serif" font-size="9" fill="#7b7259" text-anchor="middle" letter-spacing="1">POWER</text>')
    s.append('<circle cx="770" cy="728" r="5" fill="#3a3a32"/>')
    # badge
    s.append('<rect x="800" y="704" width="120" height="26" rx="3" fill="#2e2c28"/><text x="860" y="722" font-family="Courier New, monospace" font-weight="bold" font-size="14" fill="#c9c0a5" text-anchor="middle">NicOS PC</text>')
    for i in range(7):
        s.append(f'<rect x="{804 + i * 16}" y="744" width="10" height="26" rx="2" fill="#a69b7e" opacity=".8"/>')
    # 5.25" drive
    s.append('<rect x="958" y="688" width="276" height="40" rx="3" fill="#cdc3a7" stroke="#a09577" stroke-width="1.5"/>')
    s.append('<rect x="980" y="703" width="200" height="8" rx="2" fill="#1d1b17"/><rect x="1196" y="698" width="26" height="18" rx="2" fill="#b3a88b"/>')
    s.append('<circle cx="972" cy="718" r="3" fill="#6f6a58"/>')
    # 3.5" drive
    s.append('<rect x="1010" y="738" width="200" height="30" rx="3" fill="#cdc3a7" stroke="#a09577" stroke-width="1.5"/>')
    s.append('<rect x="1030" y="749" width="130" height="6" rx="2" fill="#1d1b17"/><rect x="1176" y="747" width="22" height="10" rx="2" fill="#b3a88b"/>')
    s.append('<circle cx="1022" cy="760" r="2.5" fill="#6f6a58"/>')
    s.append('</g>')

    # ---- Monitor
    s.append('<g id="monitor">')
    s.append('<path d="M872 652 L1048 652 L1068 680 L852 680 Z" fill="#b8ad8f"/>')
    s.append('<rect x="700" y="196" width="520" height="466" rx="30" fill="url(#beige)"/>')
    s.append('<rect x="700" y="196" width="520" height="466" rx="30" fill="url(#beigeSide)"/>')
    s.append('<rect x="712" y="200" width="496" height="5" rx="2.5" fill="#f6f0df" opacity=".8"/>')
    s.append('<rect x="726" y="222" width="468" height="368" rx="20" fill="url(#recess)"/>')
    s.append(f'<rect x="{SX - 6}" y="{SY - 6}" width="{SW + 12}" height="{SH + 12}" rx="26" fill="#3b382f"/>')
    s.append(f'<rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" rx="22" fill="url(#glass)"/>')
    s.append(f'<rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" rx="22" fill="url(#glare)"/>')
    # chin
    s.append('<rect x="760" y="608" width="96" height="22" rx="3" fill="#2e2c28"/><text x="808" y="624" font-family="Courier New, monospace" font-weight="bold" font-size="13" fill="#c9c0a5" text-anchor="middle">NicOS</text>')
    s.append('<text x="872" y="624" font-family="Arial, Helvetica, sans-serif" font-size="10" fill="#8d8469" letter-spacing="1">COLOR 14"</text>')
    for cx in (1086, 1116):
        s.append(f'<circle cx="{cx}" cy="619" r="9" fill="#bdb294" stroke="#958a6d" stroke-width="1.5"/><line x1="{cx}" y1="612" x2="{cx}" y2="618" stroke="#7d735a" stroke-width="2"/>')
    s.append('<circle cx="1160" cy="619" r="4.5" fill="#3a3a32"/>')
    for i in range(6):
        s.append(f'<rect x="{1000 - i * 0}" y="{640 + i * 0}" width="0" height="0"/>')
    s.append('</g>')

    # ---- Post-it notes on the bezel
    s.append('''<g id="postits" font-family="'Comic Sans MS', 'Marker Felt', 'Segoe Print', cursive" font-size="15" text-anchor="middle">
    <g transform="rotate(7 1206 252)"><rect x="1176" y="222" width="60" height="58" fill="#000" opacity=".25" transform="translate(3 4)"/><rect x="1176" y="222" width="60" height="58" fill="#f7e36b"/><rect x="1176" y="222" width="60" height="12" fill="#efd650"/><text x="1206" y="260" fill="#2b2b6a">GitHub</text></g>
    <g transform="rotate(-5 1210 330)"><rect x="1180" y="302" width="58" height="56" fill="#000" opacity=".25" transform="translate(3 4)"/><rect x="1180" y="302" width="58" height="56" fill="#9fd6f5"/><rect x="1180" y="302" width="58" height="11" fill="#86c7ea"/><text x="1209" y="338" fill="#1d3d6a" font-size="17">in</text></g>
    <g transform="rotate(-6 712 262)"><rect x="684" y="236" width="58" height="56" fill="#000" opacity=".25" transform="translate(3 4)"/><rect x="684" y="236" width="58" height="56" fill="#ffb3c7"/><rect x="684" y="236" width="58" height="11" fill="#ff9fb9"/><text x="713" y="272" fill="#5a1b2c" font-size="16">@ mail</text></g>
  </g>''')

    # ---- Keyboard + mouse
    s.append('<g id="keyboard"><ellipse cx="960" cy="926" rx="320" ry="16" fill="#000" opacity=".5" filter="url(#shadowS)"/>')
    s.append(keyboard())
    s.append('</g>')
    s.append('''<g id="mouse">
    <path d="M1340 860 C 1330 800, 1300 760, 1240 744" stroke="#6b6553" stroke-width="3" fill="none"/>
    <ellipse cx="1346" cy="905" rx="34" ry="12" fill="#000" opacity=".45" filter="url(#shadowS)"/>
    <rect x="1316" y="852" width="58" height="84" rx="26" fill="url(#beige)" stroke="#a39878" stroke-width="1.5"/>
    <line x1="1345" y1="854" x2="1345" y2="884" stroke="#a39878" stroke-width="1.5"/><line x1="1318" y1="884" x2="1372" y2="884" stroke="#a39878" stroke-width="1.5"/>
  </g>''')

    # ---- Mug with steam
    s.append('''<g id="mug">
    <ellipse cx="1466" cy="842" rx="52" ry="12" fill="#000" opacity=".5" filter="url(#shadowS)"/>
    <path d="M1500 770 q34 4 30 30 q-4 24 -32 22" stroke="#cfc8ba" stroke-width="10" fill="none"/>
    <rect x="1424" y="752" width="80" height="88" rx="8" fill="url(#mug)"/>
    <ellipse cx="1464" cy="754" rx="40" ry="9" fill="#d9d2c4"/><ellipse cx="1464" cy="756" rx="34" ry="6" fill="#3a2414"/>
    <rect x="1424" y="788" width="80" height="12" fill="#2c6b47" opacity=".85"/>
    <path class="steam" d="M1450 742 q-10 -16 0 -30 t0 -30"/><path class="steam b" d="M1468 742 q10 -16 0 -30 t0 -30"/><path class="steam c" d="M1484 744 q-8 -14 0 -26 t0 -26"/>
  </g>''')

    # ---- Nokia phone
    s.append('''<g id="nokia" transform="rotate(14 1590 880)">
    <rect x="1562" y="818" width="58" height="134" rx="18" fill="#000" opacity=".45" filter="url(#shadowS)" transform="translate(6 8)"/>
    <rect x="1562" y="818" width="58" height="134" rx="18" fill="url(#nokia)"/>
    <rect x="1574" y="838" width="34" height="30" rx="4" fill="#8faa6c"/><rect x="1574" y="838" width="34" height="30" rx="4" fill="none" stroke="#2c3a20" stroke-width="2"/>
    <rect x="1578" y="843" width="16" height="2" fill="#2c3a20"/><rect x="1578" y="852" width="24" height="3" fill="#2c3a20"/><rect x="1578" y="859" width="12" height="2" fill="#2c3a20"/>
    <rect x="1576" y="874" width="30" height="10" rx="5" fill="#2b323a"/>
    <g fill="#c7cdd3">
      <rect x="1574" y="890" width="9" height="7" rx="3"/><rect x="1587" y="890" width="9" height="7" rx="3"/><rect x="1600" y="890" width="9" height="7" rx="3"/>
      <rect x="1574" y="901" width="9" height="7" rx="3"/><rect x="1587" y="901" width="9" height="7" rx="3"/><rect x="1600" y="901" width="9" height="7" rx="3"/>
      <rect x="1574" y="912" width="9" height="7" rx="3"/><rect x="1587" y="912" width="9" height="7" rx="3"/><rect x="1600" y="912" width="9" height="7" rx="3"/>
      <rect x="1574" y="923" width="9" height="7" rx="3"/><rect x="1587" y="923" width="9" height="7" rx="3"/><rect x="1600" y="923" width="9" height="7" rx="3"/>
    </g>
    <text x="1591" y="834" font-family="Arial, Helvetica, sans-serif" font-size="6" fill="#c9cfd5" text-anchor="middle" letter-spacing=".5">NOKIA</text>
  </g>''')

    # ---- Printed CV sheet
    s.append('''<g id="cvsheet" transform="rotate(-9 1760 950)">
    <rect x="1664" y="880" width="200" height="150" fill="#000" opacity=".4" filter="url(#shadowS)" transform="translate(6 8)"/>
    <rect x="1664" y="880" width="200" height="150" fill="#efe9dc"/>
    <rect x="1678" y="894" width="30" height="34" fill="#9a9284"/>
    <rect x="1718" y="896" width="96" height="9" fill="#2f2b26"/><rect x="1718" y="912" width="120" height="4" fill="#7e776b"/><rect x="1718" y="921" width="80" height="4" fill="#7e776b"/>
    <rect x="1678" y="940" width="70" height="5" fill="#2f2b26"/>
    <rect x="1678" y="952" width="170" height="3" fill="#9a9284"/><rect x="1678" y="960" width="150" height="3" fill="#9a9284"/><rect x="1678" y="968" width="164" height="3" fill="#9a9284"/>
    <rect x="1678" y="982" width="70" height="5" fill="#2f2b26"/>
    <rect x="1678" y="994" width="160" height="3" fill="#9a9284"/><rect x="1678" y="1002" width="140" height="3" fill="#9a9284"/><rect x="1678" y="1010" width="150" height="3" fill="#9a9284"/>
  </g>''')

    # ---- Plant (far right, in front of the wall)
    s.append('<g id="plant">')
    s.append('<ellipse cx="1810" cy="800" rx="74" ry="14" fill="#000" opacity=".5" filter="url(#shadowS)"/>')
    leaves = []
    for i in range(16):
        ang = -150 + i * 8 + random.uniform(-6, 6)
        length = random.uniform(110, 190)
        leaves.append((ang, length))
    for ang, length in leaves:
        c = random.choice(['#1f4a2a', '#26592f', '#2f6b38', '#1a3d23'])
        s.append(f'<path d="M0 0 C 20 -{f(length * .3)}, 30 -{f(length * .8)}, 0 -{f(length)} C -30 -{f(length * .8)}, -20 -{f(length * .3)}, 0 0 Z" fill="{c}" transform="translate(1810 700) rotate({f(ang + 90)})"/>')
    s.append('<path d="M1748 700 L1872 700 L1858 800 L1762 800 Z" fill="url(#pot)"/><rect x="1740" y="692" width="140" height="18" rx="4" fill="#a24f2c"/>')
    s.append('</g>')

    s.append('</svg>')
    return '\n'.join(s)


(OUT / 'office-back.svg').write_text(back_svg(), encoding='utf-8')
(OUT / 'office-front.svg').write_text(front_svg(), encoding='utf-8')
print('pins (stage coords):', {k: tuple(round(v, 1) for v in geo(*p)) for k, p in PINS.items()})
print('wrote', OUT / 'office-back.svg', OUT / 'office-front.svg')
