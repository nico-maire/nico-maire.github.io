// Visual CV of Nicolás Maire Bravo — two columns, photo and colour, published on the portfolio.
// One source, five languages. Build every PDF with: python3 scripts/build-cv.py
// A single language: typst compile cv/cv.typ out.pdf --input lang=es

#let lang = sys.inputs.at("lang", default: "en")

#set page(paper: "a4", margin: 1.35cm)
#set text(
  // Inter for Latin scripts; CJK falls back to a system font. All real, selectable text.
  font: ("Inter", "Libertinus Serif", "Noto Sans CJK SC", "Noto Serif CJK SC", "WenQuanYi Zen Hei"),
  fallback: true,
  size: 8.9pt,
  lang: if lang == "zh" { "zh" } else { lang },
)
#set par(justify: true, leading: 0.47em)
#set list(indent: 0.6em, body-indent: 0.4em, spacing: 0.4em)

// ---------------------------------------------------------------- texts
#let T = (
  en: (
    title: "Computer Science Student · Software Developer · AI & Cybersecurity",
    location: "Madrid, Spain — open to on-site or hybrid in Madrid, or fully remote worldwide.",
    summary-h: "Professional summary",
    summary: [Computer Science student at UC3M with exchange semesters at the Università di Bologna (Italy) and UADE (Argentina), focused on Artificial Intelligence, Cybersecurity and full-stack/backend development. I ship end-to-end products, from machine-learning models and secure APIs to distributed systems and automation. Fast learner, strong team player and most at home solving low-level or complex architectural problems.],
    skills-h: "Technical skills",
    sk-lang: "Languages", sk-ai: "AI & Data", sk-web: "Backend & Web", sk-sec: "Cybersecurity", sk-sys: "Systems & DevOps",
    exp-h: "Experience",
    cs-role: "Founder & Full-Stack Developer", present: "Present",
    cs-1: [Founded and built a multi-tenant B2B SaaS platform (Next.js, FastAPI, Supabase/PostgreSQL) that digitises salons and local businesses: online booking, appointment management and automated notifications.],
    via-role: "Founder, Full-Stack Developer & Automation Architect",
    via-1: [Founded and built a full-stack "VIA" automation platform (React/FastAPI) and backend services that connect n8n workflows with custom Python scripts and Hugging Face models.],
    agb-role: "Personal project — Python, AI agents",
    agb-1: [Built a tool that uses interconnected AI agents to analyse business logic and auto-generate complex automation workflows.],
    proj-h: "Selected projects",
    more: [More projects — hybrid cryptography, CSP solvers, operating-systems concurrency, linear-programming optimisation and computer vision — on #link("https://github.com/nico-maire")[github.com/nico-maire] and the interactive portfolio #link("https://nico-maire.github.io/")[nico-maire.github.io].],
    p-ml: "Neural Calculator & Generalisation Engine",
    p-ml-1: [Trained Seq2Seq and Transformer models at UniBO and measured in-distribution vs. out-of-distribution and length generalisation.],
    p-sec: "LLM Security & RAG Encryption",
    p-sec-1: [Researched LLM vulnerabilities with proof-of-concepts, mitigated prompt injection with ML-based guardrails, and built envelope encryption (KMS/DEK/KEK) for RAG databases.],
    p-ds: "Distributed Minesweeper — Fault-Tolerant SMR",
    p-ds-1: [Fault-tolerant multiplayer game on a replicated state machine (SMR) with Leader–Follower topology and two-phase commit.],
    p-iot: "Atlas IoT IDE & Smart-Space Orchestration",
    p-iot-1: [Web-based visual IDE that discovers IoT devices over UDP multicast and programs them through a node-based interface.],
    p-rt: "Performance-Oriented Ray Tracing",
    p-rt-1: [Optimised a 3D ray tracer in C++23 with Intel TBB, comparing memory-layout strategies (SoA vs. AoS).],
    p-astar: "Heuristic Search (A*)",
    p-astar-1: [Route planner for a spy plane using A\* and admissible heuristics over a cost map from Gaussian radar models.],
    edu-h: "Education & certifications",
    degree: "B.Sc. in Computer Science (Bilingual Programme)",
    edu-1: [*Erasmus+ exchange:* Università di Bologna (UniBO), Italy — Feb–Jun 2026.],
    edu-2: [*International mobility:* UADE (Buenos Aires, Argentina) — Jul–Dec 2026.],
    edu-3: [Santander Grant for academic record · Cambridge C1 Advanced (English).],
    langs-h: "Languages", contact-h: "Contact",
    langs: "Spanish — native · English — C1 Advanced (Cambridge) · Italian — advanced · French — intermediate · Chinese — HSK3→HSK5",
  ),
  es: (
    title: "Estudiante de Ingeniería Informática · Desarrollador de software · IA y Ciberseguridad",
    location: "Madrid, España — disponible presencial o híbrido en Madrid, o en remoto total en cualquier país.",
    summary-h: "Resumen profesional",
    summary: [Estudiante de Ingeniería Informática en la UC3M, con estancias de intercambio en la Università di Bologna (Italia) y en la UADE (Argentina), centrado en Inteligencia Artificial, Ciberseguridad y desarrollo full-stack/backend. Construyo productos de principio a fin: desde modelos de machine learning y APIs seguras hasta sistemas distribuidos y automatización. Aprendo rápido, trabajo muy bien en equipo y disfruto resolviendo problemas de bajo nivel o de arquitectura compleja.],
    skills-h: "Habilidades técnicas",
    sk-lang: "Lenguajes", sk-ai: "IA y datos", sk-web: "Backend y Web", sk-sec: "Ciberseguridad", sk-sys: "Sistemas y DevOps",
    exp-h: "Experiencia",
    cs-role: "Fundador y desarrollador full-stack", present: "Actualidad",
    cs-1: [Fundé y desarrollé una plataforma SaaS B2B multitenant (Next.js, FastAPI, Supabase/PostgreSQL) que digitaliza peluquerías y negocios locales: reservas online, gestión de citas y notificaciones automáticas.],
    via-role: "Fundador, desarrollador full-stack y arquitecto de automatización",
    via-1: [Fundé y desarrollé la plataforma de automatización full-stack "VIA" (React/FastAPI) y los servicios de backend que conectan flujos de n8n con scripts propios en Python y modelos de Hugging Face.],
    agb-role: "Proyecto personal — Python, agentes de IA",
    agb-1: [Desarrollé una herramienta con agentes de IA interconectados que analiza la lógica de un negocio y genera automáticamente flujos de automatización complejos.],
    proj-h: "Proyectos destacados",
    more: [Más proyectos — criptografía híbrida, solvers de CSP, concurrencia de sistemas operativos, optimización con programación lineal y visión por computador — en #link("https://github.com/nico-maire")[github.com/nico-maire] y en el portfolio interactivo #link("https://nico-maire.github.io/")[nico-maire.github.io].],
    p-ml: "Calculadora neuronal y motor de generalización",
    p-ml-1: [Entrené modelos Seq2Seq y Transformer en la UniBO y medí la generalización dentro y fuera de distribución (OOD) y en longitud.],
    p-sec: "Seguridad en LLM y cifrado RAG",
    p-sec-1: [Investigué vulnerabilidades de LLM con pruebas de concepto, mitigué la inyección de prompts con guardarraíles basados en ML y construí cifrado de sobre (KMS/DEK/KEK) para bases RAG.],
    p-ds: "Buscaminas distribuido — SMR tolerante a fallos",
    p-ds-1: [Juego multijugador tolerante a fallos con una máquina de estados replicada (SMR), topología Líder-Seguidor y commit en dos fases.],
    p-iot: "Atlas IoT IDE y orquestación de Smart Spaces",
    p-iot-1: [IDE visual web que descubre dispositivos IoT por UDP multicast y los programa con una interfaz de nodos.],
    p-rt: "Ray tracing orientado al rendimiento",
    p-rt-1: [Optimicé un ray tracer 3D en C++23 con Intel TBB, comparando estrategias de representación en memoria (SoA frente a AoS).],
    p-astar: "Búsqueda heurística (A*)",
    p-astar-1: [Planificador de rutas para un avión espía con A\* y heurísticas admisibles sobre un mapa de costes de modelos gaussianos de radar.],
    edu-h: "Formación y certificados",
    degree: "Grado en Ingeniería Informática (programa bilingüe)",
    edu-1: [*Intercambio Erasmus+:* Università di Bologna (UniBO), Italia — feb-jun 2026.],
    edu-2: [*Movilidad internacional:* UADE (Buenos Aires, Argentina) — jul-dic 2026.],
    edu-3: [Beca Santander por expediente académico · Cambridge C1 Advanced (inglés).],
    langs-h: "Idiomas", contact-h: "Contacto",
    langs: "Español — nativo · Inglés — C1 Advanced (Cambridge) · Italiano — alto · Francés — intermedio · Chino — HSK3→HSK5",
  ),
  it: (
    title: "Studente di Ingegneria Informatica · Sviluppatore software · IA e Cybersecurity",
    location: "Madrid, Spagna — disponibile in sede o ibrido a Madrid, o in full remote ovunque.",
    summary-h: "Profilo professionale",
    summary: [Studente di Ingegneria Informatica all'UC3M, con periodi di scambio all'Università di Bologna (Italia) e all'UADE (Argentina), orientato a Intelligenza Artificiale, Cybersecurity e sviluppo full-stack/backend. Realizzo prodotti end-to-end: dai modelli di machine learning e API sicure fino a sistemi distribuiti e automazione. Imparo in fretta, lavoro bene in squadra e do il meglio con problemi di basso livello o di architettura complessa.],
    skills-h: "Competenze tecniche",
    sk-lang: "Linguaggi", sk-ai: "IA e dati", sk-web: "Backend e Web", sk-sec: "Cybersecurity", sk-sys: "Sistemi e DevOps",
    exp-h: "Esperienza",
    cs-role: "Fondatore e sviluppatore full-stack", present: "Oggi",
    cs-1: [Ho fondato e sviluppato una piattaforma SaaS B2B multi-tenant (Next.js, FastAPI, Supabase/PostgreSQL) che digitalizza parrucchieri e attività locali: prenotazioni online, gestione appuntamenti e notifiche automatiche.],
    via-role: "Fondatore, sviluppatore full-stack e architetto dell'automazione",
    via-1: [Ho fondato e sviluppato la piattaforma di automazione full-stack "VIA" (React/FastAPI) e i servizi backend che collegano flussi n8n con script Python personalizzati e modelli Hugging Face.],
    agb-role: "Progetto personale — Python, agenti IA",
    agb-1: [Ho sviluppato uno strumento con agenti IA interconnessi che analizza la logica di business e genera automaticamente flussi di automazione complessi.],
    proj-h: "Progetti selezionati",
    more: [Altri progetti — crittografia ibrida, solver CSP, concorrenza nei sistemi operativi, ottimizzazione con programmazione lineare e computer vision — su #link("https://github.com/nico-maire")[github.com/nico-maire] e nel portfolio interattivo #link("https://nico-maire.github.io/")[nico-maire.github.io].],
    p-ml: "Calcolatrice neurale e generalizzazione",
    p-ml-1: [Ho addestrato modelli Seq2Seq e Transformer all'UniBO misurando la generalizzazione in e fuori distribuzione (OOD) e sulla lunghezza.],
    p-sec: "Sicurezza LLM e cifratura RAG",
    p-sec-1: [Ho studiato vulnerabilità degli LLM con proof of concept, mitigato la prompt injection con guardrail basati su ML e costruito envelope encryption (KMS/DEK/KEK) per database RAG.],
    p-ds: "Campo minato distribuito — SMR tollerante ai guasti",
    p-ds-1: [Gioco multigiocatore tollerante ai guasti su macchina a stati replicata (SMR), topologia Leader–Follower e commit a due fasi.],
    p-iot: "Atlas IoT IDE e orchestrazione di Smart Space",
    p-iot-1: [IDE visuale web che scopre dispositivi IoT via UDP multicast e li programma con un'interfaccia a nodi.],
    p-rt: "Ray tracing orientato alle prestazioni",
    p-rt-1: [Ho ottimizzato un ray tracer 3D in C++23 con Intel TBB, confrontando strategie di rappresentazione in memoria (SoA e AoS).],
    p-astar: "Ricerca euristica (A*)",
    p-astar-1: [Pianificatore di rotte per un aereo spia con A\* ed euristiche ammissibili su una mappa dei costi da modelli radar gaussiani.],
    edu-h: "Formazione e certificati",
    degree: "Laurea in Ingegneria Informatica (corso bilingue)",
    edu-1: [*Scambio Erasmus+:* Università di Bologna (UniBO), Italia — feb-giu 2026.],
    edu-2: [*Mobilità internazionale:* UADE (Buenos Aires, Argentina) — lug-dic 2026.],
    edu-3: [Borsa Santander per merito accademico · Cambridge C1 Advanced (inglese).],
    langs-h: "Lingue", contact-h: "Contatti",
    langs: "Spagnolo — madrelingua · Inglese — C1 Advanced (Cambridge) · Italiano — avanzato · Francese — intermedio · Cinese — HSK3→HSK5",
  ),
  fr: (
    title: "Étudiant en informatique · Développeur logiciel · IA et cybersécurité",
    location: "Madrid, Espagne — disponible sur site ou hybride à Madrid, ou en télétravail complet partout.",
    summary-h: "Profil professionnel",
    summary: [Étudiant en informatique à l'UC3M, avec des échanges à l'Università di Bologna (Italie) et à l'UADE (Argentine), orienté IA, cybersécurité et développement full-stack/backend. Je livre des produits de bout en bout : des modèles de machine learning et des API sécurisées jusqu'aux systèmes distribués et à l'automatisation. J'apprends vite, je travaille très bien en équipe et je donne le meilleur face aux problèmes bas niveau ou d'architecture complexe.],
    skills-h: "Compétences techniques",
    sk-lang: "Langages", sk-ai: "IA et données", sk-web: "Backend et Web", sk-sec: "Cybersécurité", sk-sys: "Systèmes et DevOps",
    exp-h: "Expérience",
    cs-role: "Fondateur et développeur full-stack", present: "Aujourd'hui",
    cs-1: [J'ai fondé et développé une plateforme SaaS B2B multi-tenant (Next.js, FastAPI, Supabase/PostgreSQL) qui numérise salons et commerces de proximité : réservation en ligne, gestion des rendez-vous et notifications automatiques.],
    via-role: "Fondateur, développeur full-stack et architecte d'automatisation",
    via-1: [J'ai fondé et développé la plateforme d'automatisation full-stack « VIA » (React/FastAPI) et les services backend reliant des workflows n8n à des scripts Python sur mesure et à des modèles Hugging Face.],
    agb-role: "Projet personnel — Python, agents IA",
    agb-1: [J'ai développé un outil à base d'agents IA interconnectés qui analyse la logique métier et génère automatiquement des workflows d'automatisation complexes.],
    proj-h: "Projets sélectionnés",
    more: [Autres projets — cryptographie hybride, solveurs CSP, concurrence système, optimisation en programmation linéaire et vision par ordinateur — sur #link("https://github.com/nico-maire")[github.com/nico-maire] et le portfolio interactif #link("https://nico-maire.github.io/")[nico-maire.github.io].],
    p-ml: "Calculatrice neuronale et généralisation",
    p-ml-1: [J'ai entraîné des modèles Seq2Seq et Transformer à l'UniBO et mesuré la généralisation en et hors distribution (OOD) et en longueur.],
    p-sec: "Sécurité des LLM et chiffrement RAG",
    p-sec-1: [J'ai étudié les vulnérabilités des LLM par des preuves de concept, atténué l'injection de prompt avec des garde-fous ML et bâti un chiffrement d'enveloppe (KMS/DEK/KEK) pour bases RAG.],
    p-ds: "Démineur distribué — SMR tolérante aux pannes",
    p-ds-1: [Jeu multijoueur tolérant aux pannes sur machine à états répliquée (SMR), topologie Leader–Follower et commit en deux phases.],
    p-iot: "Atlas IoT IDE et orchestration de Smart Spaces",
    p-iot-1: [IDE visuel web qui découvre des objets IoT par UDP multicast et les programme via une interface à nœuds.],
    p-rt: "Ray tracing orienté performance",
    p-rt-1: [J'ai optimisé un ray tracer 3D en C++23 avec Intel TBB, en comparant des stratégies de représentation mémoire (SoA et AoS).],
    p-astar: "Recherche heuristique (A*)",
    p-astar-1: [Planificateur d'itinéraires pour un avion espion avec A\* et des heuristiques admissibles sur une carte de coûts issue de modèles radar gaussiens.],
    edu-h: "Formation et certificats",
    degree: "Licence en informatique (cursus bilingue)",
    edu-1: [*Échange Erasmus+ :* Università di Bologna (UniBO), Italie — févr.-juin 2026.],
    edu-2: [*Mobilité internationale :* UADE (Buenos Aires, Argentine) — juil.-déc. 2026.],
    edu-3: [Bourse Santander pour le dossier académique · Cambridge C1 Advanced (anglais).],
    langs-h: "Langues", contact-h: "Contact",
    langs: "Espagnol — langue maternelle · Anglais — C1 Advanced (Cambridge) · Italien — avancé · Français — intermédiaire · Chinois — HSK3→HSK5",
  ),
  zh: (
    title: "计算机科学学生 · 软件开发者 · 人工智能与网络安全",
    location: "西班牙马德里 — 可在马德里现场或混合办公，或在全球范围内完全远程工作。",
    summary-h: "个人简介",
    summary: [马德里卡洛斯三世大学（UC3M）计算机科学专业学生，曾在博洛尼亚大学（意大利）和 UADE（阿根廷）交换，专注于人工智能、网络安全以及全栈/后端开发。我能从头到尾交付产品：从机器学习模型、安全 API，到分布式系统与自动化。学习能力强，善于团队协作，尤其擅长解决底层或复杂架构问题。],
    skills-h: "专业技能",
    sk-lang: "编程语言", sk-ai: "人工智能与数据", sk-web: "后端与 Web", sk-sec: "网络安全", sk-sys: "系统与 DevOps",
    exp-h: "工作经历",
    cs-role: "创始人兼全栈开发者", present: "至今",
    cs-1: [创办并开发了一个多租户 B2B SaaS 平台（Next.js、FastAPI、Supabase/PostgreSQL），帮助美发店和本地商家数字化：在线预约、预约管理和自动通知。],
    via-role: "创始人、全栈开发者兼自动化架构师",
    via-1: [创办并开发了全栈自动化平台“VIA”（React/FastAPI）及其后端服务，将 n8n 工作流与自定义 Python 脚本和 Hugging Face 模型连接起来。],
    agb-role: "个人项目 — Python、AI 智能体",
    agb-1: [开发了一款工具，利用多个互联的 AI 智能体分析业务逻辑并自动生成复杂的自动化工作流。],
    proj-h: "精选项目",
    more: [更多项目 —— 混合加密、CSP 求解器、操作系统并发、线性规划优化和计算机视觉 —— 见 #link("https://github.com/nico-maire")[github.com/nico-maire] 和交互式作品集 #link("https://nico-maire.github.io/")[nico-maire.github.io]。],
    p-ml: "神经计算器与泛化研究",
    p-ml-1: [在博洛尼亚大学训练 Seq2Seq 和 Transformer 模型，评估分布内、分布外（OOD）及长度泛化能力。],
    p-sec: "大语言模型安全与 RAG 加密",
    p-sec-1: [通过概念验证研究 LLM 漏洞，用基于机器学习的防护栏缓解提示注入，并为 RAG 数据库构建信封加密（KMS/DEK/KEK）。],
    p-ds: "分布式扫雷 —— 容错状态机复制",
    p-ds-1: [基于复制状态机（SMR）、主从拓扑和两阶段提交构建的容错多人游戏。],
    p-iot: "Atlas IoT IDE 与智能空间编排",
    p-iot-1: [基于 Web 的可视化 IDE，通过 UDP 组播发现物联网设备并以节点界面进行编程。],
    p-rt: "面向性能的光线追踪",
    p-rt-1: [用 C++23 和 Intel TBB 优化 3D 光线追踪器，比较内存布局策略（SoA 与 AoS）。],
    p-astar: "启发式搜索（A*）",
    p-astar-1: [使用 A\* 算法和可采纳启发函数，在由高斯雷达模型生成的代价地图上为侦察机规划航线。],
    edu-h: "教育背景与证书",
    degree: "计算机科学学士（双语项目）",
    edu-1: [*伊拉斯谟+ 交换：* 博洛尼亚大学（UniBO），意大利 —— 2026 年 2 月至 6 月。],
    edu-2: [*国际交换：* UADE（阿根廷布宜诺斯艾利斯）—— 2026 年 7 月至 12 月。],
    edu-3: [因学业成绩获桑坦德奖学金 · 剑桥 C1 Advanced（英语）。],
    langs-h: "语言能力", contact-h: "联系方式",
    langs: "西班牙语（母语）· 英语（C1 Advanced，剑桥）· 意大利语（高级）· 法语（中级）· 汉语（HSK3，学习至 HSK5）",
  ),
).at(lang)

// Technical-skill lists are shared across languages (technology names are universal).
#let SK = (
  lang: "Python, C, C++, JavaScript, TypeScript, SQL, R, HTML/CSS",
  ai: "PyTorch, Transformers, Hugging Face, LLMs, RAG, Deep Learning, NumPy/Pandas, Jupyter",
  web: "FastAPI, React, Next.js, Supabase, PostgreSQL, REST APIs, n8n",
  sec: "Prompt-injection mitigation, AES-GCM, envelope encryption (KMS/DEK/KEK), network security",
  sys: "Linux, Docker, Git, distributed systems, TCP/UDP sockets, POSIX, MQTT, Raspberry Pi",
)

// ---------------------------------------------------------------- helpers
#let accent = rgb("#1f6feb")
#let ink = luma(55)

#let section_title(title) = {
  v(0.15em)
  text(size: 11.5pt, weight: "bold", fill: accent)[#title]
  v(-0.4em)
  line(length: 100%, stroke: 0.6pt + accent)
  v(0.3em)
}

#let entry(title, role, date, body) = {
  grid(
    columns: (1fr, auto), align: (left, right + horizon), column-gutter: 0.5em,
    [#text(weight: "bold")[#title]#if role != none [ \ #text(style: "italic", size: 8.6pt, fill: ink)[#role]]],
    text(style: "italic", size: 8.4pt, fill: luma(110))[#date],
  )
  v(0.22em)
  body
  v(0.5em)
}

#let proj(name, stack, desc) = {
  block(below: 0.5em, [
    #text(weight: "bold")[#name] #text(size: 8pt, fill: luma(120))[· #stack] \
    #desc
  ])
}

#let contact_link_img(icon, label, href) = {
  v(0.26em)
  grid(
    columns: (14pt, 1fr), column-gutter: 0.45em, align: (center + horizon, left + horizon),
    image(icon, width: 12pt), link(href)[#text(size: 8.4pt)[#label]],
  )
}

#let sidebar = [
  #set text(size: 8.4pt, hyphenate: false)
  #set par(justify: false)
  #align(center)[#text(size: 15.5pt, weight: "bold")[Nicolás Maire Bravo]]
  #v(0.4em)
  #align(center)[#box(clip: true, radius: 50%, width: 78pt, image("assets/profile.jpg", width: 100%))]
  #v(0.45em)
  #align(center)[#text(size: 9.6pt, fill: accent)[#T.title]]
  #v(0.2em)
  #align(center)[#text(size: 8.2pt, fill: ink)[#T.location]]
  #v(0.6em)

  #section_title(T.summary-h)
  #T.summary
  #v(0.32em)

  #section_title(T.skills-h)
  #block(below: 0.38em)[#text(weight: "bold")[#T.sk-lang:] #SK.lang]
  #block(below: 0.38em)[#text(weight: "bold")[#T.sk-ai:] #SK.ai]
  #block(below: 0.38em)[#text(weight: "bold")[#T.sk-web:] #SK.web]
  #block(below: 0.38em)[#text(weight: "bold")[#T.sk-sec:] #SK.sec]
  #block(below: 0.38em)[#text(weight: "bold")[#T.sk-sys:] #SK.sys]
  #v(0.3em)

  #section_title(T.langs-h)
  #for l in T.langs.split(" · ") [ #text[#l] \ ]
  #v(0.3em)

  #section_title(T.contact-h)
  #contact_link_img("assets/email.png", "nico.maibra@gmail.com", "mailto:nico.maibra@gmail.com")
  #contact_link_img("assets/linkedin.png", "linkedin.com/in/nicolás-maire-bravo", "https://www.linkedin.com/in/nicol%C3%A1s-maire-bravo/")
  #contact_link_img("assets/github.png", "github.com/nico-maire", "https://github.com/nico-maire")
  #v(0.22em)
  #text(size: 8.4pt)[#link("https://nico-maire.github.io/")[nico-maire.github.io]]
]

#let main = [
  #section_title(T.exp-h)
  #entry("CitaSalon.online — B2B SaaS", T.cs-role, [2026 – #T.present], [- #T.cs-1])
  #entry("VIA · VisiónIAutomatización", T.via-role, "2025 – 2026", [- #T.via-1])
  #entry("AI Agent Automation Builder", T.agb-role, "2025", [- #T.agb-1])

  #section_title(T.proj-h)
  #proj(T.p-ml, "Python, PyTorch, Transformers, Deep Learning", T.p-ml-1)
  #proj(T.p-sec, "Python, LLM security, prompt injection, AES-GCM", T.p-sec-1)
  #proj(T.p-ds, "Python, distributed systems, TCP sockets, Docker", T.p-ds-1)
  #proj(T.p-iot, "Python, JavaScript, WebSockets, UDP/TCP, IoT", T.p-iot-1)
  #proj(T.p-rt, "C++23, Intel TBB, performance, SoA/AoS", T.p-rt-1)
  #proj(T.p-astar, "Python, A*, admissible heuristics, AI", T.p-astar-1)
  #text(size: 8.2pt, fill: ink)[#T.more]

  #section_title(T.edu-h)
  #entry(T.degree, "Universidad Carlos III de Madrid (UC3M)", [2023 – #T.present], [
    - #T.edu-1
    - #T.edu-2
    - #T.edu-3
  ])
]

// ---------------------------------------------------------------- CV (narrow sidebar + wide main)
#grid(columns: (33%, 1fr), column-gutter: 0.75cm, align: top, sidebar, main)
