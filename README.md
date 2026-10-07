# NicOS · nico-maire.github.io

Portfolio of **Nicolás Maire Bravo**, built as an explorable 1980s computer.

- **Desktop**: an illustrated office with a beige PC. Press the power button, the camera zooms into the CRT,
  the BIOS boots and **NicOS** starts: windows, folders, a taskbar, a terminal and a guided tour.
- **Phone**: a full-screen Nokia-style green LCD with menus and soft keys.
- **Quick view**: everything on one printable page, styled as a dot-matrix printout (`#/quick`).
- **5 languages**: Español, English, Italiano, Français and 中文, plus a CV PDF in each one.

No framework and no build step: HTML, CSS and JavaScript modules served as-is by GitHub Pages.

## Run locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

ES modules and `fetch()` need a local server; opening `index.html` from disk does not work.

## Structure

```
index.html            Shell + SEO + <noscript> fallback
css/                  base · scene · crt · os · apps · phone · quick
js/main.js            Entry point: picks desktop (scene/monitor) or phone mode, routing
js/core/              i18n, router, prefs store, data loader, virtual file system, icons, cursors, sound
js/scene/             Office scene, power on/off, zoom, BIOS boot
js/os/                Window manager, desktop/taskbar/start menu, guided tour
js/apps/              Explorer, project sheet, terminal, contact, CV, settings…
js/phone/             Nokia-style interface
js/quick/             Printable quick view
data/                 Content (JSON, every text in 5 languages) and UI strings (data/i18n)
assets/               Fonts, scene SVGs, media per project, CV PDFs, images
cv/                   Typst source of the CV (one layout, five languages)
scripts/              Checks and generators (see below)
docs/                 Plan and content guide
```

## Scripts

| Command | What it does |
|---|---|
| `node scripts/check.mjs` | Checks translations (UI and content), keys used in the code and that every asset exists |
| `python3 scripts/build-cv.py` | Builds the five CV PDFs from `cv/cv.typ` (needs `pip install typst`) |
| `python3 scripts/build-scene.py` | Regenerates the illustrated office (`assets/scene/*.svg`) |
| `node scripts/build-brands.mjs` | Regenerates the monochrome brand logos from Simple Icons |

## Editing content

See [docs/CONTENIDO.md](docs/CONTENIDO.md) for how to add a project, change texts or swap the office
image for a photo.

Credits: VT323 font (SIL OFL), brand logos from [Simple Icons](https://simpleicons.org) (CC0).
