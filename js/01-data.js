/**
 * ==== DATOS DEL JUEGO ====
 * Definiciones puras: cartas, rangos, paquetes, fases, entrenamiento, ingresos
 * y tecnologías. Los rangos SIGUEN al ecosistema de la programación: los
 * Scripts nunca superan a los Lenguajes, los Lenguajes a los Frameworks, los
 * Frameworks a los Sistemas y los Legados son la cúspide absoluta del código.
 * @module data
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};

  OU.CONST = {
    SAVE_KEY: 'syntax_legends_v3',
    MAX_LEVEL: 100,
    MAX_TEAM: 6,
    MAX_TRAIN: 3,
    INITIAL_GOLD: 3000,
    INITIAL_GEMS: 50,
    START_CARDS: ['html', 'css', 'sql'],
    TRAIN_XP_NEED: 160,
    INCOME_BASE: 60,
    INCOME_PER_STAGE: 25,
    INCOME_CAP: 500000,
    SHOP_REFRESH_MS: 12 * 60 * 60 * 1000,
    SHOP_REFRESH_GEMS: 8,
    BOOST_MULT: 1.5,
    BOOST_MS: 12 * 60 * 60 * 1000,
    // Entrenamiento: ciclo de 12 h con stock y tope de mejoras por carta.
    TRAIN_CYCLE_MS: 12 * 60 * 60 * 1000,
    TRAIN_STOCK: 5,           // sesiones de entrenamiento por carta y ciclo
    TRAIN_MAX_SAME: 3,        // veces que puedes entrenar la misma carta a la vez
    TRAIN_MAX_UPS: 10,        // niveles máx. ganados por entrenamiento en 12 h
    TRAIN_UPS_CONSEC: 3,      // niveles máx. que saltan de una sola recogida
    // Recompensa diaria: gemas al entrar al juego (2 + racha, hasta 10).
    DAILY_GEMS_BASE: 2,
    DAILY_GEMS_CAP: 10,
    // Equipo de 6 en formación 1-2-2-1: la Infraestructura al frente, los 2
    // Backends a los lados, los 2 Data detrás y el DevOps al final. Cada ranura
    // exige un rol fijo y ningún rol supera su tope.
    TEAM_SLOT_ROLES: ['tanque', 'guerrero', 'guerrero', 'mago', 'mago', 'soporte'],
    ROLE_CAPS: { tanque: 1, guerrero: 2, mago: 2, soporte: 1 }
  };

  OU.RAR = {
    // Colores vivos por rango: legibles sobre las superficies oscuras del juego.
    normal:     { name: 'Script',     color: '#41e0c4', glow: 'rgba(65,224,196,0.55)',     order: 0 },
    hero:       { name: 'Lenguaje',   color: '#5cc2ff', glow: 'rgba(92,194,255,0.6)',      order: 1 },
    god:        { name: 'Framework',  color: '#ffd257', glow: 'rgba(255,210,87,0.6)',      order: 2 },
    titan:      { name: 'Sistema',    color: '#b14dff', glow: 'rgba(177,77,255,0.7)',      order: 3 },
    primordial: { name: 'Legado',     color: '#f2f7ff', glow: 'rgba(240,247,255,0.9)',     order: 4 }
  };

  OU.ROLES = { tanque: 'Infra', guerrero: 'Backend', mago: 'Data', soporte: 'DevOps' };

  // Jerarquía del ecosistema: cada rango está SIEMPRE por encima del anterior.
  OU.RARITY_FACTOR = { normal: 1, hero: 1.5, god: 2.0, titan: 2.6, primordial: 3.2 };

  /**
   * Mejoras del Centro de Recursos: tecnologías globales permanentes.
   * `id` referencia el campo `state.techs[id]`; `max` es el nivel máximo.
   * `base` es el oro base de investigación del primer nivel.
   */
  OU.TECHS = [
    { id: 'comercio',  n: 'Deploy Automático',  ic: '🚀', base: 1200, max: 20, desc: '+5% de ingreso del Repositorio por nivel' },
    { id: 'tactica',   n: 'Overclock',          ic: '⚡', base: 1500, max: 20, desc: '+3% de ATK de todas tus cartas por nivel' },
    { id: 'fortaleza', n: 'Firewall',           ic: '🛡️', base: 1500, max: 20, desc: '+3% de DEF de todas tus cartas por nivel' },
    { id: 'vitalidad', n: 'Heap Memory',        ic: '🧠', base: 1500, max: 20, desc: '+3% de HP de todas tus cartas por nivel' },
    { id: 'alquimia',  n: 'Cache',              ic: '💾', base: 1700, max: 20, desc: '+4% de oro en recompensas de batalla por nivel' },
    { id: 'sabiduria', n: 'Documentación',      ic: '📚', base: 1600, max: 20, desc: '+4% de XP (batallas y entrenamiento) por nivel' },
    { id: 'augurio',   n: 'Refactor',           ic: '🔧', base: 2500, max: 10, desc: '+1.5% de suerte de rangos altos en paquetes por nivel' }
  ];

  /* ----------------------------------------------------------------------
   * Paquetes de código. `w` es la probabilidad por rango, `guarantee` fuerza
   * al menos `order` de rango. Los paquetes premium se pueden pagar con ORO
   * (mucho) o con gemas; `cost.gold` opcional y `cost.gems` opcional.
   * -------------------------------------------------------------------- */
  OU.PACKS = {
    bronze: {
      cls: 'bronze', name: 'Paquete de Commits', cost: { gold: 200 }, count: 3,
      desc: '3 cartas. Ideal para empezar tu colección.', guarantee: 0,
      odds: [['Script', '86%'], ['Lenguaje', '13.3%'], ['Framework', '0.6%'], ['Sistema', '0.1%']],
      w: { normal: .860, hero: .133, god: .006, titan: .001 }
    },
    silver: {
      cls: 'silver', name: 'Paquete de Branch', cost: { gold: 450 }, count: 4,
      desc: '4 cartas con mejores probabilidades de Lenguaje.', guarantee: 0,
      odds: [['Script', '71%'], ['Lenguaje', '27.8%'], ['Framework', '1.1%'], ['Sistema', '0.1%']],
      w: { normal: .710, hero: .278, god: .011, titan: .001 }
    },
    gold: {
      cls: 'goldc', name: 'Paquete Pull Request', cost: { gold: 900 }, count: 5,
      desc: '5 cartas con alta probabilidad de Lenguajes y Frameworks.', guarantee: 0,
      odds: [['Script', '55%'], ['Lenguaje', '42.4%'], ['Framework', '2.4%'], ['Sistema', '0.2%']],
      w: { normal: .550, hero: .424, god: .024, titan: .002 }
    },
    epic: {
      cls: 'epic', name: 'Paquete Release', cost: { gold: 1800 }, count: 5,
      desc: '5 cartas y al menos 1 Lenguaje garantizado.', guarantee: 1,
      odds: [['Script', '44%'], ['Lenguaje', '50.2%'], ['Framework', '5.5%'], ['Sistema', '0.3%']],
      w: { normal: .440, hero: .502, god: .055, titan: .003 }
    },
    olympus: {
      cls: 'olympus', name: 'Paquete Pipeline', cost: { gems: 40, gold: 25000 }, count: 5,
      desc: '5 cartas. Garantiza al menos 1 Lenguaje. Probabilidad de Frameworks y Sistemas.', guarantee: 1,
      odds: [['Script', '22%'], ['Lenguaje', '64%'], ['Framework', '13.4%'], ['Sistema', '0.6%']],
      w: { normal: .220, hero: .640, god: .134, titan: .006 }
    },
    divine: {
      cls: 'divine', name: 'Paquete Cluster', cost: { gems: 90, gold: 70000 }, count: 6,
      desc: '6 cartas. Garantiza al menos 1 Framework. Las mejores probabilidades de Sistemas.', guarantee: 2,
      odds: [['Script', '12%'], ['Lenguaje', '53.4%'], ['Framework', '32.2%'], ['Sistema', '2.4%']],
      w: { normal: .120, hero: .534, god: .322, titan: .024 }
    },
    cosmic: {
      cls: 'cosmic', name: 'Paquete Kernel', cost: { gems: 500, gold: 1000000 }, count: 6,
      desc: '6 cartas. Garantiza al menos 1 Framework. Máximo 1 Sistema y 1 Legado por paquete.', badge: 'LEGADO', guarantee: 2,
      cap: { titan: 1, primordial: 1 },
      odds: [['Script', '0.5%'], ['Lenguaje', '4.5%'], ['Framework', '25%'], ['Sistema', '30%'], ['Legado', '40%']],
      w: { normal: .005, hero: .045, god: .250, titan: .300, primordial: .400 }
    }
  };

  OU.TRAIN = {
    quick:   { name: 'Sprint Rápido',        mins: 1,   xp: 45,   gold: 90,   gems: 0 },
    normal:  { name: 'Stand-up Activo',      mins: 3,   xp: 150,  gold: 280,  gems: 0 },
    intense: { name: 'Pair Programming',     mins: 8,   xp: 480,  gold: 840,  gems: 2 },
    epic:    { name: 'Code Review',          mins: 20,  xp: 1350, gold: 2400, gems: 5 },
    mythic:  { name: 'Refactor Total',       mins: 60,  xp: 4800, gold: 8000, gems: 12 }
  };

  /* ----------------------------------------------------------------------
   * Cartas. Campo `d` = descripción técnica (leyenda del lenguaje).
   * El poder sigue al ecosistema: los lenguajes más populares con utilidad
   * (Python, Rust, Java) son la cima de su rango, pero NUNCA superan al
   * siguiente escalón (los Legados ancestrales).
   * -------------------------------------------------------------------- */
  OU.CARDS = [
    // ------------------------------------------------ SCRIPTS (12) — Los cimientos
    { id: 'html',  n: 'HTML5',           r: 'normal', role: 'tanque',   ic: '🌐', hp: 460, atk: 60,  def: 40, spd: 40, d: 'El esqueleto semántico de toda la web: sin él, nada se ve.', ab: { n: 'Semántica Blindada', t: 'shield', s: 1 } },
    { id: 'css',   n: 'CSS3',            r: 'normal', role: 'soporte',  ic: '🎨', hp: 400, atk: 70,  def: 24, spd: 60, d: 'El artista que pinta cada píxel y da vida a las interfaces.', ab: { n: 'Reflow de Estilos', t: 'buff', s: 1 } },
    { id: 'sql',   n: 'SQL',             r: 'normal', role: 'mago',     ic: '🗄️', hp: 380, atk: 96,  def: 16, spd: 56, d: 'La consulta que barre millones de filas por segundo.', ab: { n: 'JOIN Letal', t: 'aoe', s: 0.6 } },
    { id: 'bash',  n: 'Bash',            r: 'normal', role: 'guerrero', ic: '🐚', hp: 420, atk: 92,  def: 18, spd: 82, d: 'El comando que duerme poco y automatiza todo.', ab: { n: 'Pipeline Shell', t: 'strike', s: 1.7 } },
    { id: 'json',  n: 'JSON',            r: 'normal', role: 'soporte',  ic: '📦', hp: 390, atk: 74,  def: 20, spd: 58, d: 'El formato de transporte que mueve las API del mundo.', ab: { n: 'Serialización Total', t: 'buff', s: 0.9 } },
    { id: 'regx',  n: 'Regex',           r: 'normal', role: 'mago',     ic: '🧬', hp: 350, atk: 98,  def: 12, spd: 78, d: 'El patrón que encuentra agujas en infinitos pajar.', ab: { n: 'Patrón Voraz', t: 'aoe', s: 0.65 } },
    { id: 'md',    n: 'Markdown',        r: 'normal', role: 'soporte',  ic: '📝', hp: 380, atk: 62,  def: 18, spd: 50, d: 'Documenta todo: del README a las wikis más leídas.', ab: { n: 'Doc al Instante', t: 'heal', s: 1.4 } },
    { id: 'lua',   n: 'Lua',             r: 'normal', role: 'guerrero', ic: '🌙', hp: 400, atk: 96,  def: 16, spd: 86, d: 'Ligero, incrustable y protagonista de los juegos.', ab: { n: 'Script Veloz', t: 'strike', s: 1.8 } },
    { id: 'ps',    n: 'PowerShell',      r: 'normal', role: 'guerrero', ic: '🪟', hp: 430, atk: 90,  def: 20, spd: 74, d: 'El motor de tareas de Windows: objetos y automatismo.', ab: { n: 'Cmdlet Devastador', t: 'strike', s: 1.6 } },
    { id: 'yaml',  n: 'YAML',            r: 'normal', role: 'soporte',  ic: '⚙️', hp: 410, atk: 66,  def: 26, spd: 48, d: 'La configuración invisible que levanta el stack.', ab: { n: 'Configuración Maestra', t: 'shield', s: 1 } },
    { id: 'xml',   n: 'XML',             r: 'normal', role: 'tanque',   ic: '📇', hp: 480, atk: 64,  def: 44, spd: 38, d: 'Estructura robusta: el viejo guardián de los datos.', ab: { n: 'XSD de Hierro', t: 'shield', s: 1 } },
    { id: 'scr',   n: 'Scratch',         r: 'normal', role: 'mago',     ic: '🧩', hp: 340, atk: 90,  def: 12, spd: 70, d: 'Bloques de colores que enseñan a programar jugando.', ab: { n: 'Bloque Explosivo', t: 'aoe', s: 0.55 } },

    // ------------------------------------------------ LENGUAJES (12) — Propósito general
    { id: 'py',    n: 'Python',          r: 'hero', role: 'mago',     ic: '🐍', hp: 560, atk: 150, def: 24, spd: 78, d: 'El generalista todoterreno: desde scripts hasta IA.', ab: { n: 'Django de Fuego', t: 'aoe', s: 0.95 } },
    { id: 'js',    n: 'JavaScript',      r: 'hero', role: 'guerrero', ic: '🟨', hp: 540, atk: 142, def: 22, spd: 92, d: 'El alma del navegador, omnipresente en cada pestaña.', ab: { n: 'Event Loop', t: 'strike', s: 2.4 } },
    { id: 'php',   n: 'PHP',             r: 'hero', role: 'guerrero', ic: '🐘', hp: 600, atk: 138, def: 28, spd: 68, d: 'El veterano que alimenta una buena parte de la web.', ab: { n: 'WordPress Slam', t: 'strike', s: 2.2 } },
    { id: 'rb',    n: 'Ruby',            r: 'hero', role: 'guerrero', ic: '💎', hp: 520, atk: 148, def: 20, spd: 84, d: 'Elegante y humano: la magia de hablar claro al código.', ab: { n: 'Ruby -e Apuñala', t: 'strike', s: 2.5 } },
    { id: 'swift', n: 'Swift',           r: 'hero', role: 'guerrero', ic: '🕊️', hp: 530, atk: 150, def: 22, spd: 90, d: 'Veloz por diseño, el orgullo del mundo Apple.', ab: { n: 'Cupertino Dash', t: 'strike', s: 2.6 } },
    { id: 'kt',    n: 'Kotlin',          r: 'hero', role: 'guerrero', ic: '🅺', hp: 550, atk: 144, def: 24, spd: 80, d: 'El moderno sin nulo miedo que conquistó Android.', ab: { n: 'Null Safety', t: 'strike', s: 2.3 } },
    { id: 'dart',  n: 'Dart',            r: 'hero', role: 'guerrero', ic: '🎯', hp: 510, atk: 146, def: 20, spd: 86, d: 'Compilado y ágil: un solo código, todas las plataformas.', ab: { n: 'Dardo Fugaz', t: 'strike', s: 2.4 } },
    { id: 'rlang', n: 'R',               r: 'hero', role: 'mago',     ic: '📊', hp: 480, atk: 152, def: 16, spd: 70, d: 'La estadística en vena: gráficos, modelos y verdades.', ab: { n: 'Regresión Masiva', t: 'aoe', s: 0.9 } },
    { id: 'perl',  n: 'Perl',            r: 'hero', role: 'mago',     ic: '🦪', hp: 490, atk: 150, def: 18, spd: 74, d: 'La navaja suiza de la línea de comandos y el texto.', ab: { n: 'One-Liner Letal', t: 'aoe', s: 0.85 } },
    { id: 'julia', n: 'Julia',           r: 'hero', role: 'mago',     ic: '🔬', hp: 480, atk: 156, def: 16, spd: 72, d: 'Ciencia computacional con velocidad de lenguaje compilado.', ab: { n: 'Computación Paralela', t: 'aoe', s: 0.95 } },
    { id: 'groovy',n: 'Groovy',          r: 'hero', role: 'soporte',  ic: '🎸', hp: 540, atk: 110, def: 28, spd: 58, d: 'Vive dentro de la JVM y suena como un script certero.', ab: { n: 'Compilación Dinámica', t: 'buff', s: 1 } },
    { id: 'objc',  n: 'Objective-C',     r: 'hero', role: 'tanque',   ic: '🍏', hp: 640, atk: 120, def: 36, spd: 52, d: 'El histórico de Apple: mensajes, punteros y coraje.', ab: { n: 'Marco Cocoa', t: 'shield', s: 1 } },

    // ------------------------------------------------- FRAMEWORKS (12) — Arquitecturas
    { id: 'react', n: 'React',           r: 'god', role: 'guerrero', ic: '⚛️', hp: 620, atk: 180, def: 26, spd: 84, d: 'Componentes que conquistan interfaces en todo el mundo.', ab: { n: 'Re-conciliación', t: 'strike', s: 2.6 } },
    { id: 'ang',   n: 'Angular',         r: 'god', role: 'tanque',   ic: '🅰️', hp: 760, atk: 150, def: 52, spd: 48, d: 'El framework corporativo imponente, todo en uno.', ab: { n: 'Inyección de Di', t: 'shield', s: 1 } },
    { id: 'vue',   n: 'Vue',             r: 'god', role: 'guerrero', ic: '💚', hp: 610, atk: 176, def: 26, spd: 88, d: 'Progresivo y sutil: calma elegante entre SPA y SPA.', ab: { n: 'Composables', t: 'strike', s: 2.5 } },
    { id: 'svelte',n: 'Svelte',          r: 'god', role: 'soporte',  ic: '🔥', hp: 580, atk: 130, def: 30, spd: 66, d: 'El compilador que desaparece en tiempo de ejecución.', ab: { n: 'Store Reactivo', t: 'buff', s: 1 } },
    { id: 'next',  n: 'Next.js',         r: 'god', role: 'guerrero', ic: '▲', hp: 620, atk: 186, def: 26, spd: 86, d: 'SSR, rutas y full-stack: la vanguardia del ecosistema React.', ab: { n: 'Server Component', t: 'strike', s: 2.7 } },
    { id: 'django',n: 'Django',          r: 'god', role: 'mago',     ic: '🎪', hp: 640, atk: 190, def: 30, spd: 62, d: 'Baterías incluidas: admin, ORM y seguridad de serie.', ab: { n: 'ORM Avasallador', t: 'aoe', s: 1.05 } },
    { id: 'rails', n: 'Rails',           r: 'god', role: 'guerrero', ic: '🛤️', hp: 630, atk: 178, def: 28, spd: 74, d: 'Convención sobre configuración, el mantra del founding dev.', ab: { n: 'Scaffold Rápido', t: 'strike', s: 2.5 } },
    { id: 'laravel',n: 'Laravel',        r: 'god', role: 'guerrero', ic: '🧙', hp: 630, atk: 182, def: 28, spd: 76, d: 'Elocuente y elegante: el tándem perfecto con PHP.', ab: { n: 'Eloquent DB', t: 'strike', s: 2.6 } },
    { id: 'spring',n: 'Spring Boot',     r: 'god', role: 'tanque',   ic: '🌱', hp: 800, atk: 150, def: 56, spd: 44, d: 'El titán empresarial de Java: robusto y sin miedo.', ab: { n: 'Bean Fuente', t: 'shield', s: 1 } },
    { id: 'express',n: 'Express',        r: 'god', role: 'guerrero', ic: '🚂', hp: 580, atk: 184, def: 22, spd: 96, d: 'Minimalista y letal: el middleware que mueve Node.', ab: { n: 'Middleware Rush', t: 'strike', s: 2.8 } },
    { id: 'flutter',n: 'Flutter',        r: 'god', role: 'guerrero', ic: '🦋', hp: 620, atk: 180, def: 28, spd: 82, d: 'UI nativa con un solo código y un motor propio.', ab: { n: 'Widgets Constantes', t: 'strike', s: 2.6 } },
    { id: 'dotnet',n: '.NET',            r: 'god', role: 'mago',     ic: '🟣', hp: 660, atk: 192, def: 32, spd: 60, d: 'El ecosistema todo en uno de Microsoft, de web a desktop.', ab: { n: 'CLR Total', t: 'aoe', s: 1.05 } },

    // ------------------------------------------------ SISTEMAS (12) — Núcleos compilados
    { id: 'rust',  n: 'Rust',            r: 'titan', role: 'tanque',   ic: '🦀', hp: 900, atk: 210, def: 62, spd: 52, d: 'Memoria segura sin recolector: el amor del community.', ab: { n: 'Borrow Checker', t: 'shield', s: 1 } },
    { id: 'cpp',   n: 'C++',             r: 'titan', role: 'guerrero', ic: '⚡', hp: 850, atk: 245, def: 52, spd: 74, d: 'El poder detrás de los motores gráficos y los juegos.', ab: { n: 'RAII Devastador', t: 'strike', s: 2.9 } },
    { id: 'c',     n: 'C',               r: 'titan', role: 'tanque',   ic: '📟', hp: 920, atk: 205, def: 66, spd: 46, d: 'El padre de todo sistema operativo moderno.', ab: { n: 'Puntero Crítico', t: 'shield', s: 1 } },
    { id: 'java',  n: 'Java',            r: 'titan', role: 'mago',     ic: '☕', hp: 820, atk: 230, def: 44, spd: 60, d: 'Escribe una vez, corre donde sea: el eterno laboral.', ab: { n: 'JVM Storm', t: 'aoe', s: 1.1 } },
    { id: 'csh',   n: 'C#',              r: 'titan', role: 'guerrero', ic: '🎮', hp: 840, atk: 240, def: 48, spd: 70, d: 'El lenguaje del universo .NET y de los videojuegos.', ab: { n: 'Unity Blast', t: 'strike', s: 2.8 } },
    { id: 'go',    n: 'Go',              r: 'titan', role: 'guerrero', ic: '🐹', hp: 830, atk: 235, def: 46, spd: 86, d: 'Concurrencia nativa de Google: goroutines al ataque.', ab: { n: 'Goroutine Swarm', t: 'strike', s: 2.7 } },
    { id: 'zig',   n: 'Zig',             r: 'titan', role: 'guerrero', ic: '⚡', hp: 810, atk: 238, def: 44, spd: 82, d: 'El sucesor sin mantos: simple, seguro y al metal.', ab: { n: 'Compile-Time Slam', t: 'strike', s: 2.8 } },
    { id: 'asm',   n: 'Assembly',        r: 'titan', role: 'guerrero', ic: '🔣', hp: 780, atk: 250, def: 40, spd: 92, d: 'La máquina habla por sí misma: el lenguaje más crudo.', ab: { n: 'Instrucción Directa', t: 'strike', s: 3.0 } },
    { id: 'elix',  n: 'Elixir',          r: 'titan', role: 'guerrero', ic: '💧', hp: 820, atk: 232, def: 46, spd: 76, d: 'La BEAM moderna: tolerancia a fallos en cada proceso.', ab: { n: 'Fénix Resucita', t: 'strike', s: 2.6 } },
    { id: 'erl',   n: 'Erlang',          r: 'titan', role: 'mago',     ic: '☎️', hp: 800, atk: 244, def: 42, spd: 64, d: 'Nueve nueves de disponibilidad: las telecoms lo juran.', ab: { n: 'OTP Cascade', t: 'aoe', s: 1.15 } },
    { id: 'haskell',n: 'Haskell',        r: 'titan', role: 'mago',     ic: '🏹', hp: 790, atk: 250, def: 40, spd: 66, d: 'Funcional puro: lo que la matemática soñó compilar.', ab: { n: 'Monad Apocalíptica', t: 'aoe', s: 1.15 } },
    { id: 'scala', n: 'Scala',           r: 'titan', role: 'mago',     ic: '🌀', hp: 810, atk: 242, def: 42, spd: 68, d: 'Fusiona orientación a objetos y programación funcional.', ab: { n: 'Typeclass Burst', t: 'aoe', s: 1.1 } },

    // ------------------------------------------------- LEGADOS (12) — Los Fundadores
    { id: 'cobol', n: 'COBOL',           r: 'primordial', role: 'tanque',   ic: '📠', hp: 1100, atk: 230, def: 78, spd: 40, d: 'El coloso bancario de los años 60: sigue moviendo el dinero.', ab: { n: 'Mainframe Blindaje', t: 'shield', s: 1 } },
    { id: 'fort',  n: 'FORTRAN',         r: 'primordial', role: 'mago',     ic: '🧮', hp: 980, atk: 285, def: 50, spd: 60, d: 'El primer lenguaje de alto nivel: la ciencia del inicio.', ab: { n: 'Ciclo DO Masivo', t: 'aoe', s: 1.25 } },
    { id: 'lisp',  n: 'LISP',            r: 'primordial', role: 'mago',     ic: '🧠', hp: 960, atk: 290, def: 48, spd: 70, d: 'El ancestro de la IA: paréntesis que piensan.', ab: { n: 'S-expr Cósmico', t: 'aoe', s: 1.3 } },
    { id: 'apl',   n: 'APL',             r: 'primordial', role: 'mago',     ic: '🔠', hp: 940, atk: 295, def: 46, spd: 72, d: 'Una notación completa por símbolo: array processing puro.', ab: { n: 'Símbolo Primordial', t: 'aoe', s: 1.35 } },
    { id: 'ada',   n: 'Ada',             r: 'primordial', role: 'tanque',   ic: '🛰️', hp: 1120, atk: 225, def: 80, spd: 42, d: 'Riguroso y seguro: el estándar militar y aeroespacial.', ab: { n: 'Ada RAII Blindada', t: 'shield', s: 1 } },
    { id: 'pascal',n: 'Pascal',          r: 'primordial', role: 'soporte',  ic: '🎓', hp: 980, atk: 210, def: 56, spd: 56, d: 'El maestro de la enseñanza: claridad y disciplina.', ab: { n: 'Turbo Heal', t: 'heal', s: 2.2 } },
    { id: 'basic', n: 'BASIC',           r: 'primordial', role: 'mago',     ic: '💾', hp: 930, atk: 280, def: 44, spd: 66, d: 'El comienzo de todo: la puerta de entrada a programar.', ab: { n: 'GOTO ¡10!', t: 'aoe', s: 1.2 } },
    { id: 'smtalk',n: 'Smalltalk',       r: 'primordial', role: 'soporte',  ic: '💬', hp: 1020, atk: 215, def: 58, spd: 54, d: 'La cuna de la programación orientada a objetos.', ab: { n: 'Mensajes Puros', t: 'buff', s: 1.2 } },
    { id: 'scheme',n: 'Scheme',          r: 'primordial', role: 'mago',     ic: '🥥', hp: 950, atk: 292, def: 48, spd: 68, d: 'Funcional minimalista, el orgullo del MIT.', ab: { n: 'Recursión Sin Fondo', t: 'aoe', s: 1.3 } },
    { id: 'prolog',n: 'Prolog',          r: 'primordial', role: 'mago',     ic: '🔗', hp: 940, atk: 288, def: 46, spd: 62, d: 'La lógica como flujo: dices qué, no cómo.', ab: { n: 'Unificación Total', t: 'aoe', s: 1.28 } },
    { id: 'simula',n: 'Simula',          r: 'primordial', role: 'soporte',  ic: '📡', hp: 1000, atk: 220, def: 56, spd: 52, d: 'El padre de la simulación y de la orientación a objetos.', ab: { n: 'Simula Proceso', t: 'heal', s: 2.1 } },
    { id: 'algol', n: 'ALGOL',           r: 'primordial', role: 'tanque',   ic: '🏛️', hp: 1150, atk: 235, def: 82, spd: 44, d: 'La influencia absoluta: bisabuelo de casi todo el código.', ab: { n: 'Bloque Algorítmico', t: 'shield', s: 1 } }
  ];

  /* ----------------------------------------------------------------------
   * EQUILIBRIO DEL ECOSISTEMA.
   * Reajusta las estadísticas en bruto para que cada rango ocupe SIEMPRE
   * su propio escalón de poder, sin superposiciones (scripts < lenguajes <
   * frameworks < sistemas < legados). El rango más alto de una etapa jamás
   * alcanza al más débil de la siguiente. Se preserva la identidad de cada
   * carta (infra altos en HP/DEF, data en ATK, etc.).
   * -------------------------------------------------------------------- */
  OU.BRACKETS = {
    normal:     { lo: 215, hi: 285 },
    hero:       { lo: 330, hi: 435 },
    god:        { lo: 490, hi: 625 },
    titan:      { lo: 690, hi: 850 },
    primordial: { lo: 940, hi: 1120 }
  };

  (function normalizeStats() {
    function rawPower(c) { return c.hp * 0.2 + c.atk + c.def * 1.2; }
    Object.keys(OU.BRACKETS).forEach(function (r) {
      var list = OU.CARDS.filter(function (c) { return c.r === r; })
        .sort(function (a, b) { return rawPower(b) - rawPower(a); });
      var n = Math.max(1, list.length - 1);
      list.forEach(function (c, i) {
        var t = OU.BRACKETS[r].lo + (OU.BRACKETS[r].hi - OU.BRACKETS[r].lo) * (i / n);
        var k = t / Math.max(1, rawPower(c));
        c.hp = Math.max(1, Math.round(c.hp * k));
        c.atk = Math.max(1, Math.round(c.atk * k));
        c.def = Math.max(1, Math.round(c.def * k));
      });
    });
  })();

  OU.CARD_BY_ID = {};
  OU.CARDS.forEach(function (c) { OU.CARD_BY_ID[c.id] = c; });

  OU.CARDS_BY_RAR = {};
  OU.CARDS.forEach(function (c) {
    (OU.CARDS_BY_RAR[c.r] = OU.CARDS_BY_RAR[c.r] || []).push(c);
  });

  /* ----------------------------------------------------------------------
   * CAMPAÑA: 100 fases en 10 actos, cada una con su propia historia.
   * La dificultad se genera por índice (nivel = fase; escala +12% al final)
   * para que el jugador NUNCA se quede contra una pared infinita: subiendo
   * cartas y tecnologías siempre hay camino hacia delante.
   * -------------------------------------------------------------------- */
  OU.STAGE_ROWS = [
    // --- ACTO I · El Onboarding (1-10) ---
    ['Hola Mundo', 'Tu primer commit: unos scripts desordenados exigen compilar sin descanso.', ['html', 'css', 'sql', 'bash', 'json']],
    ['Etiqueta Perdida', 'El HTML abre una etiqueta que jamás cierra: la página entera parpadea.', ['html', 'json', 'css', 'sql', 'xml']],
    ['Estilo Roto', 'El CSS perdió su llave y los colores se tiñen de rojo de la rabia.', ['css', 'html', 'yaml', 'md', 'xml']],
    ['Consulta Sin Filtro', 'El SQL olvidó el WHERE y arrasó la tabla completa de los clientes.', ['sql', 'sql', 'bash', 'json', 'html']],
    ['Comando Errante', 'Un Bash sin dormir ejecuta scripts en bucle por el directorio del sistema.', ['bash', 'ps', 'regx', 'yaml', 'md']],
    ['Formato Inadecuado', 'El JSON entrega comillas que invitan a ParseError toda la noche.', ['json', 'yaml', 'sql', 'css', 'scr']],
    ['El Patrón No Encaja', 'Una Regex furiosa consume cada cadena con su cuantificador voraz.', ['regx', 'regx', 'sql', 'lua', 'json']],
    ['Docs en Blanco', 'Markdown documenta el caos: todos los README dicen lo mismo.', ['md', 'yaml', 'ps', 'css', 'regx']],
    ['Bloques Sueltos', 'Un Scratch desatado encadena bloques que no hacen nada útil (o todo).', ['scr', 'scr', 'lua', 'xml', 'yaml']],
    ['El Shell del Lunes', 'PowerShell abre mil terminales: el primer jefe de acto, implacable.', ['ps', 'ps', 'bash', 'yaml', 'lua']],

    // --- ACTO II · Syntax Rota (11-20) ---
    ['Semicolon Error', 'JavaScript olvida un corro y el orden del mundo se tambalea.', ['js', 'html', 'css', 'sql', 'bash']],
    ['Indentación Perdida', 'Python llora por una sangría: su bloque no encuentra refugio.', ['py', 'yaml', 'js', 'json', 'sql']],
    ['La Comilla Escapada', 'Un PHP suelto mezcla comillas y la página estalla en warnings.', ['php', 'html', 'js', 'css', 'md']],
    ['Fuga de Memoria', 'Un ObjC nostálgico retiene referencias que nadie suelta jamás.', ['objc', 'swift', 'lua', 'js', 'ps']],
    ['Hilos Sueltos', 'Dos goroutines sin sincronizar compiten por el mismo recurso.', ['go', 'py', 'js', 'sql', 'bash']],
    ['La Tabla Fantasma', 'SQL diseña una clave foránea que apunta a una tabla inexistente.', ['sql', 'sql', 'json', 'md', 'xml']],
    ['Tupla Imaginaria', 'Python espera una tupla y recibe None: Karma constante.', ['py', 'py', 'php', 'groovy', 'rb']],
    ['El Array Rezagado', 'JavaScript desfasa índices y todo el front figura fuera de lugar.', ['js', 'js', 'php', 'sql', 'css']],
    ['README Enigmático', 'Markdown escribe la guía en un idioma que nadie entiende.', ['md', 'md', 'yaml', 'xml', 'scr']],
    ['El Compilador Terco', 'Un Rust joven se niega a compilar sin cerrar cada garantía.', ['rust', 'c', 'go', 'cpp', 'js']],

    // --- ACTO III · El Boom del Backend (21-30) ---
    ['La Nube Prendida', 'Servidores Python se agrupan y exigen escalar a toda costa.', ['py', 'py', 'rb', 'go', 'julia']],
    ['El Loop de la Medianoche', 'Un evento JS de medianoche vuelve a dispararse solo.', ['js', 'js', 'php', 'dart', 'swift']],
    ['El Verbo Elegante', 'Ruby con su sintaxis hipnótica recita código que no planea parar.', ['rb', 'rb', 'py', 'perl', 'groovy']],
    ['Cupertino al Ataque', 'Swift y Objective-C disputan la misma app en silencio.', ['swift', 'objc', 'swift', 'kt', 'dart']],
    ['El Ecosistema JVM', 'Kotlin invoca Groovy y Scala lo observa todo desde la JVM.', ['kt', 'groovy', 'scala', 'java', 'kt']],
    ['R de la Estadística', 'Un R enfurecido regresa cada columna hasta el infinito.', ['rlang', 'julia', 'py', 'perl', 'sql']],
    ['Perl One-Liner', 'Perl destruye el texto de tres épocas con una sola línea.', ['perl', 'perl', 'bash', 'regx', 'lua']],
    ['El Círculo Científico', 'Julia y R compiten en cómputo con una paciencia infinita.', ['julia', 'rlang', 'julia', 'py', 'scala']],
    ['Groovy en la JVM', 'Groovy improvisa un script que compila en caliente sobre el fuego.', ['groovy', 'groovy', 'kt', 'java', 'json']],
    ['El Frente de los Lenguajes', 'Los cinco grandes del propósito general bloquean el camino.', ['py', 'js', 'php', 'rb', 'swift']],

    // --- ACTO IV · Agile & Frameworks (31-40) ---
    ['La Oleada de Componentes', 'React clona sus componentes y duplica la interfaz entera.', ['react', 'vue', 'vue', 'js', 'css']],
    ['El Bazar de Widgets', 'Flutter despliega widgets que se reordenan solos.', ['flutter', 'dart', 'flutter', 'svelte', 'react']],
    ['El Servidor Impaciente', 'Next.js prerenderiza cada ruta antes de que la pidas.', ['next', 'react', 'express', 'js', 'md']],
    ['La Marea Estilizada', 'Svelte borra su runtime y deja una estela de valores reactivos.', ['svelte', 'vue', 'svelte', 'css', 'js']],
    ['Angular Corporativo', 'Angular despliega su inyección de dependencias y bloquea la entrada.', ['ang', 'ang', 'react', 'flutter', 'express']],
    ['El Framework Dual', 'Vue y React discuten por la propiedad de cada bind.', ['vue', 'react', 'vue', 'ang', 'next']],
    ['El Paseo del Carbón', 'Django quiere el 80% del stack y el ORM no cede.', ['django', 'py', 'django', 'rails', 'laravel']],
    ['La Balanza del CRUD', 'Rails genera scaffolds infinitos que no terminan de forjar.', ['rails', 'rails', 'django', 'laravel', 'sql']],
    ['El Espíritu de Laravel', 'Laravel hace magia con Artisan y se ríe del tiempo de espera.', ['laravel', 'laravel', 'php', 'rails', 'vue']],
    ['La Arquitectura Viva', 'Los grandes frameworks se alinean en la batalla final del acto.', ['django', 'rails', 'ang', 'react', 'spring']],

    // --- ACTO V · Deploy a Producción (41-50) ---
    ['El Servidor de Hierro', 'Spring Boot levanta su contenedor de beans y aguanta el embate.', ['spring', 'ang', 'spring', 'dotnet', 'java']],
    ['El CLR Encendido', '.NET compila en tiempo real y cada ensamblado pesa como un bloque.', ['dotnet', 'csh', 'dotnet', 'spring', 'go']],
    ['La API Minimalista', 'Express mueve cada ruta con un middleware que no pide permiso.', ['express', 'express', 'next', 'js', 'rust']],
    ['La Nube del Cluster', 'Un clúster de Go despliega contenedores que jamás se duermen.', ['go', 'go', 'rust', 'c', 'cpp']],
    ['El Despliegue en Rojo', 'Un pipeline furioso rompe la build y vuelve a empezar sola.', ['go', 'cpp', 'java', 'rust', 'csh']],
    ['La Ruta 404', 'Una API regresa 404 a todo: no encuentra ninguna ruta viva.', ['express', 'spring', 'next', 'django', 'py']],
    ['El Contenedor Vacío', 'Un contenedor sin imagen flota en la red: nadie sabe qué contiene.', ['rust', 'go', 'csh', 'java', 'dotnet']],
    ['La Máquina Virtual', 'Cada lenguaje exige su VM y todas compiten por la misma RAM.', ['java', 'kt', 'groovy', 'scala', 'go']],
    ['El Kubernetes Salvaje', 'Orquestas de pods escalan sin control por todo el cluster.', ['go', 'java', 'cpp', 'rust', 'csh']],
    ['La Producción Saturada', 'Los sistemas compilados defienden el tráfico de producción.', ['rust', 'java', 'go', 'cpp', 'csh']],

    // --- ACTO VI · Legacy Code Plague (51-60) ---
    ['El Código de las Sombras', 'Trozo de código sin test se multiplica en cada refactor.', ['cpp', 'c', 'cobol', 'fort', 'asm']],
    ['La Deuda Bancaria', 'COBOL reclama flotantes redondeados que nadie puede ajustar.', ['cobol', 'cobol', 'fort', 'basic', 'c']],
    ['La Ruleta de GOTO', 'Un BASIC esparce GOTO por todo el flujo y nadie encuentra la salida.', ['basic', 'basic', 'cobol', 'simula', 'algol']],
    ['El Arcano Militar', 'Ada despliega contratos y precondiciones; el código se cierra en silencio.', ['ada', 'ada', 'cobol', 'c', 'fort']],
    ['La Notación Extraña', 'APL dibuja símbolos que ejecutan operaciones vedadas a mortales.', ['apl', 'apl', 'lisp', 'scheme', 'asm']],
    ['La Lista Infinita', 'Un LISP anida listas dentro de listas hasta perder su propia raíz.', ['lisp', 'lisp', 'scheme', 'prolog', 'apl']],
    ['El Sistema Manchado', 'C hereda punteros salvajes y la memoria llora sin liberar.', ['c', 'c', 'cpp', 'asm', 'zig']],
    ['El Legacy Call', 'COBOL y FORTRAN llaman rutinas que ya nadie recuerda por qué existen.', ['cobol', 'fort', 'cobol', 'algol', 'simula']],
    ['El Caos de Pontevedra', 'Assembly ocupa el bajo nivel y nadie puede traducir sus movimientos.', ['asm', 'asm', 'c', 'cpp', 'ada']],
    ['La Plaga del Mainframe', 'Los bancarios de los 60 protegen el núcleo con blindaje de hierro.', ['cobol', 'cobol', 'fort', 'ada', 'pascal']],

    // --- ACTO VII · Compilación en Frío (61-70) ---
    ['Cero Coste de Abstracción', 'C++ optimiza cada bucle hasta dejar la máquina temblando.', ['cpp', 'cpp', 'c', 'rust', 'asm']],
    ['El Guardián del Heap', 'Rust comprueba cada préstamo: el borrow checker no perdona.', ['rust', 'rust', 'cpp', 'zig', 'c']],
    ['La Concurrencia Total', 'Erlang reparte procesos por mil nodos sin perder ni uno.', ['erl', 'elix', 'erl', 'go', 'scala']],
    ['La BEAM Inmortal', 'Elixir cae y resucita; su supervisor vuelve a levantarla al instante.', ['elix', 'elix', 'erl', 'erl', 'go']],
    ['La Macla Categórica', 'Haskell transforma estado en puro: la función no mira atrás.', ['haskell', 'haskell', 'scala', 'elix', 'lisp']],
    ['La JVM del Overclock', 'Java calienta motores y compila just-in-time a toda velocidad.', ['java', 'java', 'scala', 'kt', 'groovy']],
    ['El Runtime Del .NET', 'C# dispara sus hilos sobre el CLR y cada uno lleva su propia misión.', ['csh', 'csh', 'dotnet', 'java', 'cpp']],
    ['La Metal de Los NUdos', 'Zig y Rust disputan el rendimiento del hardware desnudo.', ['zig', 'rust', 'zig', 'c', 'asm']],
    ['El Sistema que Habla', 'Assembly responde a la CPU antes que ningún otro lenguaje.', ['asm', 'asm', 'c', 'zig', 'cpp']],
    ['La Batalla de los Compilados', 'Los grandes sistemas traban la batalla en el metal.', ['rust', 'cpp', 'java', 'go', 'csh']],

    // --- ACTO VIII · La Guerra de los Paradigmas (71-80) ---
    ['Funcional contra OO', 'Haskell y Smalltalk se miden en un duelo de paradigmas.', ['haskell', 'smtalk', 'haskell', 'scala', 'simula']],
    ['La Cuna de las Clases', 'Simula enseña sus clases y Smalltalk responde con mensajes.', ['simula', 'smtalk', 'simula', 'algol', 'pascal']],
    ['El Ataúd de ALGOL', 'ALGOL desciende sobre el resto con la autoridad de un abuelo.', ['algol', 'algol', 'pascal', 'simula', 'cobol']],
    ['El Mago del Parse', 'Prolog unifica hechos hasta que la lógica misma se rinde.', ['prolog', 'prolog', 'lisp', 'scheme', 'apl']],
    ['La Torre de Lisp', 'Lisp y Scheme levantan una torre de macros que se repliega sola.', ['lisp', 'scheme', 'lisp', 'prolog', 'apl']],
    ['El Fort de la Ciencia', 'FORTRAN ejecuta cálculo intensivo que desborda cualquier cluster.', ['fort', 'fort', 'julia', 'haskell', 'c']],
    ['La Batalla del Metal', 'Rust y C se disputan el control del sistema operativo.', ['rust', 'c', 'rust', 'cpp', 'asm']],
    ['El Duelo de Concurrencia', 'Go y Erlang miden procesos, goroutines y paciencia.', ['go', 'erl', 'go', 'elix', 'scala']],
    ['El Espejo de VM', 'Java, Kotlin, Groovy y Scala bailan sobre la misma JVM infinita.', ['java', 'kt', 'groovy', 'scala', 'java']],
    ['Los Paradigmas en Guerra', 'Todos los estilos chocan en una batalla sin estándar.', ['haskell', 'java', 'rust', 'fort', 'prolog']],

    // --- ACTO IX · El Reinado Ancestral (81-90) ---
    ['El Oráculo Bancario', 'COBOL tatúa intereses en cada cuenta desde hace seis décadas.', ['cobol', 'cobol', 'cobol', 'fort', 'algol']],
    ['El Alge de los 60', 'FORTRAN y ALGOL cuentan la creación de la era dorada.', ['fort', 'algol', 'fort', 'cobol', 'basic']],
    ['La Carcasa de Todo', 'BASIC abre la puerta que millones cruzaron para programar.', ['basic', 'basic', 'cobol', 'pascal', 'algol']],
    ['El Templo Educativo', 'Pascal enseña estructura a cada generación de estudiantes.', ['pascal', 'pascal', 'basic', 'simula', 'ada']],
    ['La Simulación Eterna', 'Simula modela el mundo y sus procesos se encadenan sin fin.', ['simula', 'simula', 'smtalk', 'pascal', 'algol']],
    ['El Mensajero Objeto', 'Smalltalk envía mensajes que viajan por una malla de objetos.', ['smtalk', 'smtalk', 'simula', 'java', 'swift']],
    ['El Nombre Prohibido', 'Ada desarma cualquier violación de contrato con precisión militar.', ['ada', 'ada', 'cobol', 'algol', 'pascal']],
    ['La Cuentas del Mundo', 'Los abuelos del código custodian el dinero del planeta.', ['cobol', 'cobol', 'fort', 'ada', 'simula']],
    ['El Corazón del Ordenador', 'ALGOL y LISP tejen la lógica que desató la era digital.', ['algol', 'lisp', 'algol', 'scheme', 'fort']],
    ['El Consejo de los Fundadores', 'Los diez lenguajes madre se sientan a gobernar el reino.', ['cobol', 'fort', 'lisp', 'ada', 'algol']],

    // --- ACTO X · El Kernel Final (91-100) ---
    ['El Núcleo del Sistema', 'El kernel respira: cada capa del stack se muestra en su forma pura.', ['c', 'asm', 'rust', 'cobol', 'fort']],
    ['La Pila Infinita', 'Una call stack desbordada invoca a los ancestros para que respondan.', ['cobol', 'fort', 'lisp', 'prolog', 'haskell']],
    ['El Último Mainframe', 'COBOL despierta respaldos de 1970 que jamás debieron activarse.', ['cobol', 'cobol', 'fort', 'ada', 'basic']],
    ['El Amotinamiento de las VMs', 'JVM y CLR se rebelan y compiten por el silicio restante.', ['java', 'csh', 'rust', 'cpp', 'go']],
    ['El Cuerpo del Abuelo', 'ALGOL se levanta y su gramática empuja a todo el lenguaje vivo.', ['algol', 'cobol', 'fort', 'pascal', 'simula']],
    ['La Noche del Machine Code', 'Assembly habla en silencio y la CPU obedece sin pestañear.', ['asm', 'asm', 'c', 'rust', 'cpp']],
    ['La Deuda Técnica Total', 'El código sin test grita desde el fondo y exige su refactor.', ['cobol', 'fort', 'basic', 'lisp', 'prolog']],
    ['El Oráculo del Código', 'LISP predice el futuro con una función que la define a sí misma.', ['lisp', 'scheme', 'prolog', 'lisp', 'haskell']],
    ['Última Compilación', 'El mundo funciona con un ensamblado perfecto… hasta que tocan el interruptor.', ['java', 'rust', 'csh', 'sql', 'asm']],
    ['La Deuda Técnica', 'La prueba final: el stack entero devuelve su propio origen en una sola carga.', ['cobol', 'fort', 'lisp', 'asm', 'java']]
  ];

  // Sexto rival de cada fase (100 en orden): la campaña se libra 6v6.
  OU.STAGE_6TH = [
    'scr', 'sql', 'ps', 'bash', 'regx', 'md', 'lua', 'yaml', 'xml', 'css',
    'js', 'py', 'php', 'rb', 'go', 'regx', 'py', 'js', 'yaml', 'rust',
    'py', 'js', 'rb', 'swift', 'kt', 'rlang', 'perl', 'julia', 'groovy', 'php',
    'vue', 'dart', 'react', 'svelte', 'flutter', 'ang', 'django', 'rails', 'laravel', 'next',
    'spring', 'dotnet', 'express', 'go', 'rust', 'csh', 'cpp', 'java', 'go', 'c',
    'cpp', 'cobol', 'basic', 'ada', 'apl', 'lisp', 'c', 'fort', 'asm', 'pascal',
    'cpp', 'rust', 'erl', 'elix', 'haskell', 'java', 'csh', 'zig', 'asm', 'go',
    'haskell', 'smtalk', 'simula', 'algol', 'prolog', 'fort', 'rust', 'go', 'java', 'scala',
    'fort', 'algol', 'basic', 'pascal', 'simula', 'smtalk', 'ada', 'cobol', 'scheme', 'algol',
    'algol', 'cobol', 'haskell', 'cpp', 'asm', 'c', 'lisp', 'scheme', 'csh', 'java'
  ];

  OU.STAGES = OU.STAGE_ROWS.map(function (row, i) {
    var idx = i + 1;
    var scale = 1 + i * 0.0012;
    if (idx % 10 === 0) scale *= 1.05;   // jefes de acto, más duros
    if (i === OU.STAGE_ROWS.length - 1) scale *= 1.02; // jefe final
    return {
      n: row[0],
      story: row[1],
      roster: row[2].concat(OU.STAGE_6TH[i] ? [OU.STAGE_6TH[i]] : []),
      level: Math.min(OU.CONST.MAX_LEVEL, idx),
      scale: Math.round(scale * 1000) / 1000
    };
  });
})();