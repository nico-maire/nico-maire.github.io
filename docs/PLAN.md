# NicOS: plan del nuevo portfolio retro

> Documento de trabajo. Recoge el análisis del sitio actual, la propuesta de concepto, la arquitectura,
> las preguntas abiertas y las fases de trabajo. Se irá actualizando según se tomen decisiones.

---

## 0. Visión en una frase

Al entrar, el visitante ve un **despacho de los 90 con un PC beige** encima de la mesa. Pulsa el botón de
encendido, la cámara se acerca al monitor, arranca la BIOS y aparece **NicOS**, un sistema operativo de
fósforo verde con escritorio, carpetas y ventanas donde están tus proyectos, habilidades, formación y
contacto, en español e inglés. En el móvil, la misma información vive en la **pantalla verde de un Nokia**.

---

## 1. Diagnóstico del sitio actual

**Stack**: un único `index.html` (586 líneas) + `style.css` (734 líneas), AOS por CDN, Roboto Mono, sin
JavaScript propio salvo el menú hamburguesa. Todo el contenido está escrito a mano dentro del HTML.

**Problemas encontrados**

| Tipo | Detalle |
|---|---|
| Bug | `assets/projects/citasalon.jpg` no existe (ni la carpeta): la tarjeta de CitaSalon muestra una imagen rota en producción. |
| Contenido | Todo está en inglés aunque `<html lang="es">`; no hay cambio de idioma. |
| Contenido | Falta información que sí está en el CV: **formación** (UC3M, UniBO, UADE, Beca Santander), **experiencia** (CitaSalon, VIA), **idiomas** (ES, EN C1, IT, FR, ZH HSK3) y el "About me". Los logos `uc3m.png`, `bologna.png`, `email.png` y las 5 banderas existen pero no se usan. |
| Contenido | LinkedIn distinto en web (`/in/nicolás-maire-bravo`) y en CV (`/in/nicolas-maire-bravo`). |
| Contenido | Erratas: "proyect", "Optimizacion", "Binairo… Engine." (punto final), "Universitá" en el CV (es "Università"). Copyright 2025. |
| Contenido | Habilidades del CV que no aparecen en la web: SQL, R, Transformers, sockets TCP/UDP, POSIX, protocolos de seguridad. Tienes repos de Spring Boot/Java (UADE) que no se reflejan. |
| Contenido | El CV dice UADE "Upcoming", pero tus repos de UADE tienen actividad de sep-oct 2026, así que parece que ya estás allí. |
| Proyectos | Los 14 enlaces a GitHub apuntan a repos públicos que existen. Hay duplicados: `DS--Distributed-Minesweeper` / `distributed-minesweeper`; ray tracing en tu repo y en `Toriomg/ray-tracing-renderer` (actualizado el 4 oct 2026). |
| Proyectos | Ningún proyecto tiene imagen, vídeo ni demo. Los recuadros grises de 200 px están vacíos. |
| Reputación | "AI Detector Bypass Tool" (herramienta para que un texto de IA no se detecte) puede generar rechazo en un reclutador o en la universidad. Propongo reenfocarlo (ver P13). |
| Assets | Logos heterogéneos: unos con fondo blanco (bologna, celonis, huggingface, javascript, jupyter, raspberrypi, uc3m), otros son wordmarks anchos (pytorch, mqtt, huggingface), y algunos son enormes para mostrarse a 50 px (css.png 3840×2160, linkedin.png 4128×2322, mysql.png 3000×2000). Sobre una pantalla verde monocroma no van a quedar bien tal cual. |
| Técnico | Sin `.nojekyll` (GitHub Pages pasa el sitio por Jekyll innecesariamente). Sin meta description, Open Graph, favicon ni datos estructurados. |

**Qué se conserva**: los textos (como base para reescribir), los enlaces, el CV en PDF, la frase
*"Your idea. Your code. Your reality"* (que pasará a ser el mensaje de arranque) y el correo de contacto.

> La imagen del ordenador que adjuntaste es de Pngtree y lleva marca de agua, así que **no se puede usar**.
> Sirve como referencia de estilo: PC beige frontal, CRT, torre horizontal, teclado y ratón.

---

## 2. Concepto propuesto

### 2.1 Tres modos según el dispositivo

| Modo | Cuándo | Qué se ve |
|---|---|---|
| **Escena** | Pantallas ≥ 1200 px de ancho con ratón | Despacho completo + PC. Al encender, zoom al monitor (la pantalla ocupa ~85-90 % del alto). Se puede volver a alejar. |
| **Monitor** | 768–1199 px (tablets, portátiles pequeños) | Solo el monitor con su marco beige ocupando la pantalla. Sin despacho. Mismo SO. |
| **Móvil** | < 768 px o pantalla táctil vertical | Pantalla completa estilo Nokia: barra de estado, menús, teclas de función ("Seleccionar" / "Atrás"). Sin fondos ni despacho. |

El modo se decide por tamaño y tipo de puntero (`matchMedia`), no por user-agent, y cambia en vivo al
girar o redimensionar.

### 2.2 Flujo de entrada (escritorio)

1. **Escena apagada**: despacho con luz de lámpara y el monitor apagado con un leve reflejo. El LED del
   botón de encendido parpadea y aparece el aviso "Pulsa para encender / Press to power on".
2. **Encendido**: clic en el botón (o cualquier tecla). Fogonazo del CRT, sonido de ventilador (si el
   sonido está activo) y la cámara hace zoom al monitor.
3. **POST/BIOS** (≈1,5 s): `NicBIOS v1.0 … Memory test 640K OK … Detecting UC3M … UniBO … OK`.
4. **Arranque** (≈1,5 s): logo ASCII de NicOS y *"Your idea. Your code. Your reality"* escribiéndose.
5. **Login automático**: `USER: GUEST` / `PASSWORD: ******` → **escritorio**.

Reglas: todo es **saltable** (clic, `Esc` o el botón "Saltar"); en visitas posteriores se va directo al
escritorio (con opción "Reiniciar" en el menú Inicio para volver a verlo); con `prefers-reduced-motion`
no hay animaciones; y un enlace directo a un proyecto (`#/projects/…`) abre esa ventana sin pasar por el
arranque.

### 2.3 El sistema operativo: NicOS

Estilo: **DOS + Windows 3.1 en monocromo verde fósforo** (ventanas con barra de título, iconos pixelados,
barra de tareas). Resolución lógica fija **1024×768 (4:3)** escalada al monitor con `transform: scale()`.
Así las posiciones son predecibles, el arrastre de ventanas es exacto y el aspecto es idéntico en
cualquier pantalla.

**Escritorio y sistema de archivos virtual** (`C:\`):

```
C:\
├── LEEME.TXT            Sobre mí (texto con efecto máquina de escribir)
├── PROYECTOS\           Carpetas por área, generadas desde los datos:
│   ├── EMPRENDIMIENTO\    CitaSalon, VIA 🔒, AI Agent Builder 🔒, AI Auditor 🔒
│   ├── IA_ML\             Neural Calculator, Radar A*, …
│   ├── CIBERSEGURIDAD\    Hybrid Crypto, LLM Security, RAG Encryption
│   ├── SISTEMAS\          Factory Simulator, Script Interpreter, Minesweeper distribuido, Ray Tracing
│   ├── ALGORITMOS\        Binairo CSP, Fleet ILP, Radar A*
│   ├── IOT\               Atlas IoT IDE
│   └── WEB_JUEGOS\        Travel Website, Mario Bros
├── HABILIDADES\         Una subcarpeta por categoría; cada tecnología es un ".EXE"
├── CONOCIMIENTOS\       Áreas (Criptografía, Concurrencia, Sistemas distribuidos, ML, Optimización, IoT…)
├── EXPERIENCIA.LOG      Línea temporal (CitaSalon, VIA, …)
├── FORMACION\           UC3M, UniBO (Erasmus), UADE, Beca Santander
├── IDIOMAS.CFG          ES nativo · EN C1 · IT alto · FR intermedio · ZH HSK3 (barras ASCII)
├── CONTACTO.EXE         Cliente de correo + LinkedIn + GitHub
├── CV.PDF               Ver o descargar (en el idioma activo si hay versión ES)
├── TERMINAL.EXE         (extra) consola con comandos
├── JUEGOS\              (extra) BUSCAMINAS.EXE
├── PANEL_CONTROL        Idioma, color de fósforo, efectos CRT, sonido
└── PAPELERA             (extra) guiño/easter egg
```

Un proyecto puede aparecer en varias carpetas: las carpetas se generan a partir de las etiquetas, no se
duplican datos.

**Gestor de ventanas**: abrir (doble clic con ratón, un clic en táctil, `Enter` con teclado), arrastrar,
redimensionar, minimizar a la barra de tareas, maximizar, cerrar, traer al frente y abrir en cascada.
Barra de tareas con **[INICIO]**, ventanas abiertas, selector **ES | EN**, 🔊 y reloj. Menú Inicio con
accesos directos, Reiniciar y Apagar (que vuelve a la escena con el monitor apagándose).

**Tipos de ventana (aplicaciones)**

| App | Para qué |
|---|---|
| Explorador | Carpetas con vista de iconos o de lista y ruta tipo `C:\PROYECTOS\IA_ML\` con migas clicables. |
| Visor de proyecto | Título, año, contexto (UC3M/UniBO/UADE/personal), stack, descripción, logros y botones **[ABRIR EN GITHUB]**, **[VER WEB]** y **[VER VÍDEO]**. Captura tratada en verde. Las habilidades enlazan a sus proyectos. |
| Archivo clasificado | Proyectos privados o confidenciales: animación de `ACCESS DENIED / ARCHIVO CLASIFICADO` y luego la descripción pública, sin enlace. Convierte el "[CONFIDENTIAL]" en algo divertido. |
| Reproductor | Vídeo con controles retro y filtro verde opcional (desactivable para ver el color real). |
| Visor de texto | LEEME.TXT, conocimientos, etc. |
| Habilidades | Propiedades de cada tecnología: dónde la has usado y lista de proyectos. Sin barras de "nivel %", que suelen restar credibilidad. |
| Línea temporal | Experiencia y formación. |
| Contacto | Formulario retro que compone un `mailto:` (o Formspree, ver P20), con copiar correo, LinkedIn y GitHub. |
| Panel de control | Idioma, paleta (verde / ámbar / blanco), intensidad de efectos CRT, sonido. |

### 2.4 Efectos CRT, cursores y sonido

- **CRT** (todo con CSS, superpuesto con `pointer-events: none`): scanlines, brillo de fósforo
  (`text-shadow`), viñeta y esquinas redondeadas, reflejo del cristal y parpadeo muy sutil (< 3 Hz, seguro
  para fotosensibilidad). La curvatura es simulada: deformar el HTML de verdad lo vuelve borroso y lento.
  La intensidad se regula en el Panel de control.
- **Cursores pixel-art propios**: flecha normal, **mano** sobre elementos clicables, reloj de arena
  mientras algo carga y "mover" al arrastrar ventanas. Dentro del monitor van en verde; fuera, en el
  despacho, son la flecha y la mano clásicas en blanco y negro. En táctil no hay cursor.
- **Sonido** (opcional): clic de encendido, zumbido del CRT, disco duro durante el arranque, teclas y
  "beep". Va con Web Audio y archivos muy ligeros.
- **Tipografía**: VT323 (Google Fonts) para el texto general, muy legible, y opcionalmente *Px437 IBM VGA*
  (CC BY-SA, autoalojada) para BIOS y terminal, por autenticidad.
- **Iconos de tecnologías**: se sustituyen los PNG por **Simple Icons** (SVG monocromo, licencia CC0)
  pintados con el color del fósforo mediante `mask-image`, y opcionalmente pixelados (rasterizados a
  24×24 y escalados con `image-rendering: pixelated`). Así todos quedan coherentes, nítidos y pesan muy
  poco.

### 2.5 Móvil: NicOS Mobile (estilo Nokia)

```
┌────────────────────────┐
│ ▂▄▆█  NICOLÁS MAIRE  ▮▮▮│  ← barra de estado (cobertura, título, batería)
│                        │
│      [icono grande]    │
│        PROYECTOS       │  ← menú tipo Nokia: un apartado por pantalla o en lista
│          2/11          │
│                        │
│ Opciones  Selecc.  Atrás│  ← teclas de función táctiles
└────────────────────────┘
```

- **Pantalla de inicio**: "operador" `NICOLÁS MAIRE`, hora y la frase. Botón **Menú**.
- **Menú**: Sobre mí · Proyectos · Habilidades · Conocimientos · Experiencia · Formación · Idiomas ·
  Contacto · CV · Juegos (Snake 🐍) · Ajustes. Navegación con toques, deslizamientos y "Atrás" (también el
  botón atrás del navegador, gracias al router).
- **Detalle de proyecto**: texto con scroll, botón GitHub/web y el vídeo se reproduce a pantalla completa
  nativa.
- **Ajustes > Idioma del teléfono**, como en los Nokia de verdad.
- Sin fondos, sin despacho, sin efectos pesados (como mucho una rejilla LCD muy sutil). Objetivos táctiles
  ≥ 44 px.
- La paleta se decide en la P5: LCD Nokia (píxeles oscuros sobre verde claro) o fósforo sobre negro.

### 2.6 Idiomas

- Toda la interfaz sale de diccionarios (`data/i18n/es.json`, `en.json`) y todo el contenido tiene campos
  por idioma (`{ "es": "…", "en": "…" }`).
- Idioma inicial: el del navegador, con inglés por defecto. Se guarda la elección y también se puede
  forzar por URL (`?lang=en`) para enviar enlaces a reclutadores extranjeros.
- Al cambiar de idioma todo se re-renderiza al instante, incluidas las ventanas abiertas; también
  `<html lang>` y las metaetiquetas.
- Un script de comprobación avisa si falta alguna clave de traducción.
- La arquitectura admite más idiomas (IT, FR, ZH) sin tocar código: basta con añadir un JSON.

### 2.7 Accesibilidad, reclutadores y SEO

- **Vista rápida** (botón visible en la escena y en el menú Inicio): una página limpia, imprimible y en el
  idioma activo con todo el contenido, generada desde los mismos datos. Para el reclutador con 30 segundos.
- Navegación completa con teclado (Tab, flechas, Enter, Esc), foco visible, roles ARIA en ventanas y
  menús, y opción de desactivar efectos.
- SEO: title y description por idioma, Open Graph con captura de la escena, favicon pixelado, JSON-LD
  `Person` y un `<noscript>` con el resumen y los enlaces.
- Enlaces profundos: `#/projects/distributed-minesweeper` abre directamente ese proyecto (útil para
  pegar en una candidatura).

### 2.8 Ideas "wow" opcionales (fase de extras)

1. **Objetos clicables en el despacho**: diploma en la pared → Formación; **el Nokia encima de la mesa** →
   Contacto (y guiño a la versión móvil); mapa con chinchetas Madrid · Bolonia · Buenos Aires →
   Formación/Idiomas; el CV impreso sobre la mesa → descarga; pósits con GitHub/LinkedIn.
2. **Terminal** con comandos: `help`, `ls`, `cd`, `cat`, `open`, `lang en`, `neofetch` (tu ficha en ASCII
   art), `whoami`, `sudo hire nico`, `matrix`…
3. **Buscaminas jugable**, guiño a tu Buscaminas distribuido.
4. **Snake** en el móvil Nokia.
5. **Demos de terminal grabadas** (formato asciinema) que se reproducen dentro de una ventana verde para
   los proyectos de consola (criptografía, intérprete, fábrica multihilo). Encajan perfectamente con la
   estética.
6. Parallax suave del despacho al mover el ratón (si la imagen se entrega en capas).
7. Temas de fósforo: verde P1, ámbar, blanco.

---

## 3. Arquitectura técnica (propuesta)

### 3.1 Stack

**HTML + CSS + JavaScript puro con módulos ES, sin framework y sin paso de build.** GitHub Pages lo sirve
tal cual.

- Cero dependencias que mantener y carga muy rápida.
- El contenido vive en **JSON**: añadir un proyecto es editar un archivo y soltar sus imágenes.
- El propio código del repo sirve de muestra de arquitectura limpia (gestor de ventanas, router, i18n y
  sistema de archivos virtual hechos a mano).
- Alternativa (P6): Vite + TypeScript con despliegue por GitHub Actions. Ofrece más tooling, pero añade
  build y CI.

### 3.2 Estructura de carpetas

```
/
├── index.html              Shell único: escena + SO + móvil + noscript + SEO
├── .nojekyll
├── css/
│   ├── tokens.css          Paletas, tipografías y tamaños (variables CSS)
│   ├── scene.css           Despacho, monitor, zoom
│   ├── crt.css             Scanlines, glow, viñeta, flicker
│   ├── os.css              Escritorio, ventanas, barra de tareas, menú Inicio
│   ├── apps.css            Estilos de cada app
│   └── mobile.css          Interfaz Nokia
├── js/
│   ├── main.js             Arranque y detección de modo
│   ├── core/               i18n.js · router.js · store.js (preferencias) · fs.js (sistema de archivos virtual) · bus.js
│   ├── desktop/            scene.js · boot.js · wm.js (gestor de ventanas) · taskbar.js · startmenu.js · icons.js
│   ├── apps/               explorer · project · classified · media · text · skills · timeline · contact · settings · (terminal · minesweeper)
│   └── mobile/             phone.js · menu.js · (snake.js)
├── data/
│   ├── profile.json  projects.json  skills.json  knowledge.json  education.json  experience.json  languages.json
│   └── i18n/ es.json  en.json
├── assets/
│   ├── scene/              Despacho y monitor (AVIF/WebP + srcset)
│   ├── icons/              SVG monocromos
│   ├── cursors/  fonts/  sounds/
│   ├── media/<proyecto>/   Capturas y clips
│   └── cv/                 CV-EN.pdf, CV-ES.pdf
├── scripts/                Comprobación de traducciones y enlaces, optimización de imágenes
└── docs/                   PLAN.md · CONTENIDO.md (cómo añadir proyectos)
```

### 3.3 Una sola fuente de verdad

```
data/*.json ──► fs.js (árbol C:\ virtual) ──┬──► Escritorio / Explorador / ventanas
                                            ├──► Menús del móvil Nokia
                                            ├──► Terminal (ls, cd, cat, open)
                                            └──► Vista rápida y <noscript>
```

Ejemplo de proyecto:

```json
{
  "id": "distributed-minesweeper",
  "year": 2026,
  "context": "unibo",
  "categories": ["systems", "distributed"],
  "skills": ["python", "docker", "sockets"],
  "visibility": "public",
  "featured": true,
  "links": { "github": "https://github.com/nico-maire/DS--Distributed-Minesweeper", "demo": null },
  "media": [{ "type": "video", "src": "assets/media/minesweeper/demo.webm", "poster": "assets/media/minesweeper/poster.webp" }],
  "title":      { "es": "Buscaminas distribuido", "en": "Distributed Minesweeper" },
  "summary":    { "es": "…", "en": "…" },
  "highlights": { "es": ["…", "…"], "en": ["…", "…"] }
}
```

`visibility`: `public` (enlace a GitHub), `private` (sin repo, descripción) o `confidential` (ventana
"ARCHIVO CLASIFICADO").

### 3.4 Detalles técnicos clave

- **Escena responsive**: un "escenario" 16:9 que cubre la ventana (como `object-fit: cover`) con el
  monitor anclado al centro. La posición de la pantalla se define en coordenadas de la imagen y el SO se
  coloca y escala encima. Si la imagen tiene algo de perspectiva, el HTML se mapea a las 4 esquinas con
  `matrix3d` (homografía).
- **Zoom**: transición CSS `transform` sobre el escenario (GPU), de vista general a primer plano del
  monitor.
- **Arrastre de ventanas con escala**: las coordenadas del ratón se dividen por el factor de escala.
- **Rendimiento**: animaciones solo con `transform` y `opacity`, efectos pausados con la pestaña oculta,
  imágenes en AVIF/WebP con `srcset`, vídeos con `preload="none"` y lazy loading. Objetivo de peso
  inicial < 1,5 MB sin contar vídeos.
- **Router hash** (`#/…`): botón atrás, enlaces profundos e historial (también en móvil).
- **Preferencias** en `localStorage` (idioma, sonido, efectos, arranque visto) envueltas en `try/catch`.

---

## 4. Inventario de contenido

(*~ = año deducido de la actividad de los repos; ? = por confirmar. El contexto "UC3M" de los proyectos 6–14 también es deducido.*)

| # | Proyecto | Contexto | Año | Enlace | Media sugerida |
|---|---|---|---|---|---|
| 1 | CitaSalon.online | Emprendimiento (fundador) | 2026– | citasalon.online (repo privado) | Capturas/vídeo de la web (puedo capturarla automáticamente) |
| 2 | VIA Platform | Emprendimiento (lead dev) | 2025–26 | Confidencial | Archivo clasificado |
| 3 | AI Agent Automation Builder | Personal | 2025 | Privado | Captura de la interfaz si es posible |
| 4 | AI Agent Auditor Framework | ? | ? | Confidencial | Archivo clasificado. ¿Contexto? |
| 5 | AI Detector Bypass Tool | Personal | ? | Privado | ⚠ ver P13 |
| 6 | Hybrid Cryptography App | UC3M | ~2025 | Público | Demo de terminal |
| 7 | Multi-threaded Factory Simulator | UC3M | ? | Público | Demo de terminal |
| 8 | C-Based Script Interpreter | UC3M | ? | Público | Demo de terminal |
| 9 | Performance-Oriented Ray Tracing | UC3M | 2025 | Público (¿o Toriomg?) | **Renders**: muy visual |
| 10 | Binairo CSP & US Pathfinding | UC3M | ~2025 | Público | Tablero / ruta en mapa |
| 11 | Linear Programming (Fleet) | UC3M | ~2025 | Público | — |
| 12 | Heuristic Search A* (Radar) | UC3M | 2024 | Público | Mapa de costes + ruta |
| 13 | Mario Bros. Arcade Clone | UC3M | 2023 | Público | **Vídeo gameplay** |
| 14 | Responsive Travel Website | UC3M | ~2025 | Público | Capturas; se puede publicar en Pages como demo |
| 15 | ML Neural Calculator | UniBO | 2026 | Público | Gráficas de resultados |
| 16 | Distributed Minesweeper | UniBO | 2026 | Público (duplicado) | **Vídeo**: varios clientes y caída del líder |
| 17 | LLM Security Framework | UniBO | 2026 | Público | Demo del ataque frente a la mitigación |
| 18 | RAG Database Encryption Engine | UniBO | 2026 | Público | Diagrama de la arquitectura |
| 19 | IoT Projects / Atlas IDE | UniBO | 2026 | Público | **Vídeo del IDE** |

**Candidatos que no están en la web** (repos detectados): UADE TP1 Machine Learning, TP2 Búsqueda, TP3
Algoritmos Genéticos, TP07 IA, Marketplace API UADE (grupo 6), API Spring Boot, Fudus, app_match,
dpp-sd-benchmark, `Toriomg/ray-tracing-renderer`.

**Otros bloques**: Sobre mí (CV), Experiencia (CitaSalon 2026–, VIA 2025–26), Formación (UC3M 2023–,
UniBO feb-jun 2026, UADE, Beca Santander), Idiomas (5), Contacto.

---

## 5. Riesgos y cómo los mitigamos

| Riesgo | Mitigación |
|---|---|
| Calidad de la imagen del despacho (es lo que más impacto visual tiene) | Composición frontal con prompt detallado (anexo A). El código se prepara para cambiar la imagen sin tocar nada más. |
| Un reclutador con prisa no quiere "encender un ordenador" | Arranque < 5 s y saltable, se recuerda, enlaces profundos y **Vista rápida**. |
| Los efectos CRT cansan o se leen mal | Intensidad moderada por defecto, regulable y desactivable, y `prefers-reduced-motion`. |
| Rendimiento en portátiles modestos y móviles | Solo CSS acelerado por GPU, nada de filtros SVG pesados y móvil sin efectos. |
| Crecimiento sin fin del alcance | **MVP primero** (fases 1-5 + vista rápida) y los extras después. |
| Safari/iOS (cursores, transforms, vídeo) | Pruebas específicas y alternativas de respaldo. |
| Mantenimiento futuro | Todo basado en datos y guía `docs/CONTENIDO.md`. |

---

## 6. Preguntas abiertas

⭐ = mi recomendación. Las de la sección A bloquean el inicio; las de la B pueden llegar durante las
fases 1-4.

### A. Diseño (bloqueantes)

- **P1. Estilo visual de la escena**
  A) ⭐ Realista: foto/render de despacho de los 90 con el PC beige frontal y la pantalla "viva" encima ·
  B) Pixel-art ilustrado (tipo videojuego 16 bits) · C) 3D real con Three.js (lo más espectacular, pero
  mucho más pesado y costoso) · D) Todo dibujado en CSS/SVG (estilo ilustración plana, sin imágenes).
- **P2. ¿Quién consigue la imagen?**
  A) ⭐ Tú la generas con IA (ChatGPT, Midjourney…) con mi prompt (anexo A) · B) Busco una foto libre
  (Unsplash/Pexels) y dibujo el PC en SVG · C) Intento generarla yo con las herramientas que tengo
  disponibles (resultado no garantizado).
- **P3. Estilo del SO**
  A) ⭐ DOS + Windows 3.1 en verde · B) Mac clásico (System 7) en verde · C) Terminal puro tipo
  Fallout/RobCo (solo menús de texto, sin ventanas).
- **P4. Entrada**
  A) ⭐ Escena apagada → botón de encendido → BIOS → escritorio (saltable y recordado) · B) Se enciende
  solo al cargar · C) Directo al escritorio.
- **P5. Paleta del móvil**
  A) ⭐ LCD Nokia clásico (píxeles oscuros sobre verde claro, con fósforo como opción en Ajustes) ·
  B) Fósforo verde sobre negro, igual que el PC.
- **P6. Tecnología**
  A) ⭐ HTML/CSS/JS puro + JSON, sin build · B) Vite + TypeScript + GitHub Actions.
- **P7. Idiomas**
  A) ⭐ ES + EN (ampliable) · B) ES + EN + IT · C) ES + EN + IT + FR + ZH. Idioma por defecto: el del
  navegador y, si no, inglés.
- **P8. Sonido**
  A) ⭐ Sí, apagado por defecto con botón 🔊 · B) Encendido tras el primer clic · C) Sin sonido.
- **P9. Extras** (elige los que quieras): terminal · buscaminas · Snake en el Nokia · objetos clicables del
  despacho · demos de terminal grabadas · temas de color · parallax. ⭐ Todos, en la fase 6, después del
  MVP.
- **P10. Vista rápida** para reclutadores: A) ⭐ Sí · B) No.

### B. Contenido

- **P11.** ¿Cuál es tu URL buena de LinkedIn: `/in/nicolás-maire-bravo` o `/in/nicolas-maire-bravo`?
- **P12.** ¿Añadimos alguno de los proyectos no listados (UADE, Spring Boot, Fudus, app_match,
  dpp-sd-benchmark…)? Pásame 2-3 líneas de cada uno.
- **P13.** "AI Detector Bypass Tool": A) Quitarlo · B) ⭐ Reenfocarlo como investigación (p. ej. "Análisis
  de robustez de detectores de texto IA mediante probabilidad de tokens") · C) Dejarlo igual.
- **P14.** ¿Qué proyectos tienen (o pueden tener) vídeo o capturas? ¿Dónde los alojamos? A) ⭐ Clips cortos
  (15-40 s, < 10 MB, WebM/MP4) en el repo con reproductor propio · B) YouTube oculto embebido. Puedo
  sacar capturas de citasalon.online automáticamente.
- **P15.** ¿Quieres una foto tuya en "Sobre mí" (tratada en verde con *dithering*, tipo ficha de los 90)?
- **P16.** ¿Qué buscas ahora (prácticas/empleo, áreas, ciudad o remoto, desde cuándo)? Para un estado del
  tipo "DISPONIBLE PARA…".
- **P17.** ¿Tienes el CV en español? ¿Actualizamos el CV (UADE ya en curso, "Università")?
- **P18.** ¿Reescribo todos los textos en ES/EN, con tu rol y logros concretos, para que los revises?
  ⭐ Sí. ¿Tienes datos o métricas (clientes de CitaSalon, notas, premios, qué certificado C1 es)?
- **P19.** Duplicados: ¿qué repo enlazo para el Buscaminas y para el Ray Tracing? ¿Contexto del
  "AI Agent Auditor" (¿empresa, Celonis, hackathon?)? ¿Años y contexto (UC3M o no) de los proyectos marcados con "~" o "?"?
- **P20.** Contacto: A) ⭐ `mailto:` + enlaces · B) Formulario real (Formspree, gratis). ¿Estadísticas de
  visitas sin cookies (GoatCounter)? ¿Dominio propio (p. ej. `nicolasmaire.dev`)?

---

## 7. Fases y tareas

Cada fase termina con **capturas automáticas (Playwright) en escritorio, tablet y móvil** para que las
revises antes de seguir. Todo se desarrolla en la rama de trabajo y solo se publica en `main` cuando
lo apruebes.

### Fase 0: Decisiones y material (tú + yo)
- [ ] Responder las preguntas de la sección A
- [ ] Conseguir la imagen del despacho (según P1/P2)
- [ ] Reunir capturas y vídeos de proyectos (P14)
- [ ] Responder la sección B (puede solaparse con las fases 1-4)

### Fase 1: Cimientos
- [ ] Nueva estructura de carpetas, `.nojekyll` y eliminar AOS
- [ ] Modelo de datos y migración de todo el contenido actual a JSON (ES/EN)
- [ ] Motor i18n + script de comprobación de claves
- [ ] Router hash + almacén de preferencias
- [ ] Tokens de diseño (paletas, tipografías) y carga de fuentes
- [ ] Set de iconos monocromos (Simple Icons) y cursores pixel-art
- [ ] Optimización de imágenes

### Fase 2: Escena y arranque
- [ ] Escenario responsive (despacho + monitor) con cálculo de la posición de la pantalla
- [ ] Modo "monitor" para tablets
- [ ] Botón de encendido, zoom de cámara y apagado
- [ ] Secuencia BIOS → arranque → login (saltable y recordada)
- [ ] Capa CRT (scanlines, glow, viñeta, flicker) con intensidad regulable

### Fase 3: Núcleo del SO
- [ ] Gestor de ventanas (abrir, cerrar, minimizar, maximizar, arrastrar, redimensionar, foco)
- [ ] Escritorio con iconos (selección, doble clic, teclado)
- [ ] Barra de tareas, menú Inicio y reloj
- [ ] Explorador con migas de pan y vistas de icono y lista
- [ ] Asociación de tipos de archivo con apps

### Fase 4: Apps de contenido
- [ ] Visor de proyecto + archivo clasificado
- [ ] Reproductor de vídeo y visor de imágenes
- [ ] LEEME (Sobre mí), Conocimientos, Experiencia/Formación (línea temporal), Idiomas
- [ ] Habilidades ↔ proyectos enlazados
- [ ] Contacto y CV
- [ ] Panel de control (idioma, paleta, efectos, sonido)

### Fase 5: Móvil Nokia
- [ ] Pantalla de inicio, barra de estado y teclas de función
- [ ] Menús y listas a partir del mismo sistema de archivos
- [ ] Detalle de proyecto y vídeo
- [ ] Gestos y botón atrás
- [ ] Ajustes (idioma, paleta)

### Fase 6: Extras (según P9)
- [ ] Terminal con comandos
- [ ] Buscaminas · Snake
- [ ] Objetos clicables del despacho · parallax
- [ ] Sonidos · demos de terminal grabadas · temas de color · easter eggs

### Fase 7: Calidad y lanzamiento
- [ ] Vista rápida imprimible
- [ ] Accesibilidad (teclado, ARIA, contraste, movimiento reducido)
- [ ] SEO (meta por idioma, Open Graph, favicon, JSON-LD, noscript)
- [ ] Pruebas: Chrome, Firefox, Safari, Edge, iOS Safari y Android Chrome; viewports 360×640, 390×844,
      768×1024, 1366×768, 1920×1080 y 2560×1440
- [ ] Verificación de enlaces y traducciones
- [ ] `docs/CONTENIDO.md` (cómo añadir proyectos)
- [ ] Publicar en `main` y actualizar el README del perfil de GitHub con el enlace

---

## 8. Definición de "terminado"

- Lighthouse: rendimiento ≥ 90 en escritorio y ≥ 85 en móvil; accesibilidad, buenas prácticas y SEO ≥ 95.
- Cero errores en consola y cero enlaces rotos (comprobado con script).
- 100 % de los textos en ES y EN (comprobado con script).
- Todo es usable solo con teclado y respeta `prefers-reduced-motion`.
- Funciona en los navegadores y tamaños de la fase 7.
- Añadir un proyecto nuevo = editar un JSON + soltar sus imágenes.

---

## Anexo A: prompt para generar la imagen del despacho

> Photorealistic late-1980s / early-1990s home office at night. **Straight-on frontal view** of a beige
> IBM-PC-style computer centered on a wooden desk: 14-inch CRT monitor sitting on a horizontal desktop
> case, beige keyboard and a corded mouse in front. **The monitor faces the camera perfectly frontally,
> the screen is completely black and switched off, with no reflections or glare**, and occupies roughly
> the central 30% of the image width. Warm desk-lamp light from the left. Around it: a stack of 3.5"
> floppy disks, a coffee mug, a small grey Nokia mobile phone lying on the desk, a printed CV sheet, a
> potted plant, a cork board with sticky notes, a framed diploma on the wall, a world map with pins,
> bookshelves, and a window with blinds and city lights. Shallow depth of field: the computer is sharp,
> the background softly blurred. Cinematic, cozy, slightly desaturated. 16:9, at least 3840×2160. No
> text, no logos, no watermark.

Si es posible, pide también una **segunda versión idéntica con la pantalla en verde liso (#00FF00)**:
me permite detectar las cuatro esquinas de la pantalla con precisión de píxel.
