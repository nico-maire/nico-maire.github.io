# Guía de contenido

Todo el contenido vive en `data/`. No hace falta tocar JavaScript para añadir o cambiar textos.
Después de cualquier cambio, ejecuta `node scripts/check.mjs`: avisa si falta una traducción o un archivo.

## Campos multidioma

Cualquier texto puede ser una cadena (igual en todos los idiomas) o un objeto con los 5 idiomas:

```json
"summary": { "es": "…", "en": "…", "it": "…", "fr": "…", "zh": "…" }
```

Las listas (por ejemplo `highlights`) deben tener el mismo número de elementos en cada idioma.

## Añadir un proyecto

1. Añade un objeto a `data/projects.json` (el orden en la web lo marca `sort`, de mayor a menor):

```json
{
  "id": "mi-proyecto",               // identificador único (se usa en la URL #/open/p/mi-proyecto)
  "file": "MIPROYEC",                // nombre "8.3" que se ve en el explorador y la terminal
  "title": "Mi proyecto",            // o { "es": "...", "en": "...", ... }
  "year": "2026",
  "sort": 2026.6,
  "context": "uade",                 // startup | personal | uc3m | unibo (añade ctx.<x> en data/i18n si creas otro)
  "course": { "es": "...", ... },    // opcional
  "team": { "es": "...", ... },      // opcional
  "role": { "es": "...", ... },      // opcional
  "visibility": "public",            // public | product | private | confidential
  "featured": false,                 // true = aparece en el panel de destacados
  "categories": ["ai"],              // startup, ai, security, systems, algorithms, iot, web, games
  "skills": ["python", "pytorch"],   // ids de data/skills.json
  "summary": { "es": "...", "en": "...", "it": "...", "fr": "...", "zh": "..." },
  "highlights": { "es": ["...", "..."], "en": ["...", "..."], "it": [], "fr": [], "zh": [] },
  "links": [ { "type": "github", "url": "https://github.com/..." } ],   // github | web | youtube
  "media": [
    { "type": "image", "src": "assets/media/mi-proyecto/captura.jpg", "tint": true },
    { "type": "video", "src": "assets/media/mi-proyecto/demo.mp4", "poster": "assets/media/mi-proyecto/poster.jpg" },
    { "type": "terminal", "src": "assets/media/mi-proyecto/run.txt" }
  ]
}
```

2. Copia los medios a `assets/media/<id>/`.
   - Imágenes: JPG/PNG de máximo ~1200 px de ancho. `"tint": true` las muestra en el color del fósforo
     (ideal para gráficas y diagramas); el visitante puede pulsar «Color» para verlas en color real.
   - Vídeos: MP4 H.264 corto (15–40 s), sin audio si no aporta. Por ejemplo:
     `ffmpeg -ss 5 -t 25 -i entrada.mp4 -an -vf scale=-2:720 -crf 30 -movflags +faststart demo.mp4`
   - Terminal: un `.txt` con la salida real de un comando; las líneas que empiezan por `$` se «teclean» más
     despacio.
3. El proyecto aparece solo en todas las carpetas de sus `categories`, en «Todos», en el móvil, en la
   terminal y en la vista rápida.

## Otras piezas

| Quiero cambiar… | Archivo |
|---|---|
| Presentación, estado («Buscando empleo»), ubicación, foto | `data/profile.json` |
| Habilidades y sus categorías | `data/skills.json` (`icon` = id de `js/core/brands.js`, o `null`) |
| Áreas de conocimiento | `data/knowledge.json` |
| Experiencia, formación y certificados | `data/timeline.json` |
| Idiomas | `data/languages.json` |
| Textos de la interfaz | `data/i18n/<idioma>.json` |
| CV | `cv/cv.typ` y después `python3 scripts/build-cv.py` |

## Sustituir el despacho dibujado por una imagen (IA o foto)

1. Guarda la imagen (16:9, 3840×2160 idealmente) en `assets/scene/office.jpg`.
2. En `data/scene.json`:
   - `layers`: `[{ "src": "assets/scene/office.jpg", "depth": 0 }]` (una sola capa, sin parallax).
   - `width` / `height`: tamaño de referencia (puedes dejar 1920×1080 y medir las coordenadas a esa escala).
   - `screen`: rectángulo del cristal del monitor (`x`, `y`, `w`, `h`, `radius`). Mejor si es 4:3.
   - `power`: rectángulo del botón de encendido; `leds`: posición de los LED; `callout`: dónde apunta el
     aviso «¡Pulsa aquí!».
   - `hotspots`: rectángulos de los objetos clicables (diploma, mapa, Nokia, disquetes, CV…). Cada uno abre
     un nodo (`open`) o un enlace (`url`: `github` / `linkedin`).
3. Abre la web y comprueba que el escritorio de NicOS encaja en el cristal. Si la imagen tiene la pantalla
   en verde liso (#00FF00), las esquinas se miden al píxel.
