/**
 * ==== MAIN ====
 * Arranque de la aplicación y pantalla principal rediseñada (estilo boceto):
 *  · Perfil del jugador arriba-izquierda (foto circular + nombre).
 *  · Oro y Gemas arriba-derecha.
 *  · «Mi Equipo» (hasta 5 cartas) en el centro, sobre el fondo ilustrado.
 *  · «Marketplace» a la izquierda, «Campaña» a la derecha.
 *  · Libro flotante del «Índice» abajo-izquierda.
 *  · Barra inferior con Historia · Lenguajes · Noticias · Recompensas.
 * Incluye el onboarding de primer uso (nombre + foto local vía FileReader),
 * el perfil editable y las vistas de Recompensas, Historia y Noticias.
 * @module main
 */
(function () {
  'use strict';
  var OU = window.OU = window.OU || {};
  var U = OU.UTIL, I = OU.UI;

  var currentTab = 'home';

  /* =============== REGISTRO DE PANTALLAS =============== */
  /* Cualquier sección distinta de «home» se envuelve con un botón
     «← Volver al Inicio» para regresar a la pantalla principal. */

  var SCREENS = {};
  function screen(name, title, view, bind) {
    SCREENS[name] = { title: title, view: view, bind: bind || null };
  }
  screen('campaign', '⚔️ Campaña', function () { return OU.BATTLE.viewHome(); }, function (root) { OU.BATTLE.bindHome(root); });
  screen('shop', '🛍️ Marketplace', function () { return OU.SHOP.viewShop(); }, function (root) { OU.SHOP.bindShop(root); });
  screen('index', '📖 Índice de Leyendas', function () { return OU.INDEX.viewIndex(); }, function (root) { OU.INDEX.bindIndex(root); });
  screen('collection', '🃏 Lenguajes', function () { return OU.COLLECTION.viewCollection(); }, function (root) { OU.COLLECTION.bindCollection(root); });
  screen('training', '🏋️ Entrenamiento', function () { return OU.TRAIN.viewTraining(); }, function (root) { OU.TRAIN.bindTraining(root); });
  screen('team', '🛡️ Mi Equipo', function () { return OU.TEAM.viewTeam(); }, function (root) { OU.TEAM.bindTeam(root); });
  screen('games', '🎪 Minijuegos', function () { return OU.GAMES.viewGames(); }, function (root) { OU.GAMES.bindGames(root); });
  screen('daily', '🎁 Recompensas', viewDaily, bindDaily);
  screen('story', '💡 Datos', viewStory, null);
  screen('news', '📰 Noticias', viewNews, null);

  // El menú inferior (tabs) solo existe en la pantalla de inicio;
  // al entrar a cualquier sección se oculta y en su lugar queda «Volver al Inicio».
  function syncMenu() {
    var tabs = U.$('#tabs');
    if (!tabs) return;
    tabs.classList.toggle('menu-hidden', currentTab !== 'home');
  }

  function setTab(name) {
    if (OU.BATTLE.running) OU.BATTLE.running = false;
    currentTab = name;
    U.$$('#tabs .tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.tab === name);
    });
    render();
  }

  function render() {
    syncMenu();
    OU.STATE.tickIncome();
    I.updateTopRes();
    updateUserHUD();
    var v = U.$('#view');
    if (!v) return;
    if (currentTab === 'battle') return; // la arena de combate se dibuja sola
    var sc = SCREENS[currentTab];
    if (currentTab === 'home' || !sc) {
      v.innerHTML = viewHome();
      bindHome(v);
      return;
    }
    v.innerHTML =
      '<div class="page">' +
      '<div class="sub-head">' +
      '<button class="btn btn-ghost btn-sm jsBack">← Volver al Inicio</button>' +
      '<div class="sub-title">' + sc.title + '</div>' +
      '<span class="sub-sp"></span>' +
      '</div>' +
      sc.view() +
      '</div>';
    var bk = U.$('.jsBack', v);
    if (bk) bk.addEventListener('click', function () { setTab('home'); });
    if (sc.bind) sc.bind(v);
  }

  /* =============== PERFIL DE JUGADOR (primera partida) =============== */

  var PROF_KEY = 'ou_profile';

  function loadProfile() {
    try { return JSON.parse(localStorage.getItem(PROF_KEY) || '{}') || {}; } catch (e) { return {}; }
  }

  function saveProfile(name, avatar) {
    var p = { name: name || '', avatar: avatar || '' };
    try { localStorage.setItem(PROF_KEY, JSON.stringify(p)); } catch (e) { /* cuota superada */ }
    updateUserHUD();
    return p;
  }

  function isNewUser() { return !loadProfile().name; }

  function updateUserHUD() {
    var p = loadProfile();
    var a = U.$('#uhAvatar'), n = U.$('#uhName');
    if (a) a.innerHTML = p.avatar ? '<img class="uh-img" src="' + p.avatar + '" alt="Foto de perfil">' : '👤';
    if (n) n.textContent = p.name || 'Dev';
  }

  /** Lee una imagen local y la devuelve en Base64 (recortada y comprimida). */
  function readProfileImage(file, cb) {
    function done(url) { if (cb) cb(url || ''); }
    if (typeof FileReader === 'undefined' || typeof Image === 'undefined' || !file) { done(''); return; }
    var fr = new FileReader();
    fr.onload = function () {
      var img = new Image();
      img.onload = function () {
        try {
          var size = 128;
          var cv = document.createElement('canvas');
          var cx = cv.getContext('2d');
          if (!cx) { done(fr.result); return; }
          cv.width = cv.height = size;
          var s = Math.min(img.width, img.height);
          var sx = (img.width - s) / 2, sy = (img.height - s) / 2;
          cx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
          done(cv.toDataURL('image/jpeg', 0.85));
        } catch (e) { done(fr.result); }
      };
      img.onerror = function () { done(fr.result); };
      img.src = fr.result;
    };
    fr.onerror = function () { done(''); };
    fr.readAsDataURL(file);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (m) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
    });
  }

  function welcomeHTML() {
    return '<div class="ob-wrap">' +
      '<div class="ob-herald">⚡</div>' +
      '<div class="ob-t">Bienvenido al Repositorio</div>' +
      '<div class="ob-d">Antes de escribir tu leyenda, dinos quién eres, dev.</div>' +
      '<div class="ob-avatar" id="obAvatar">👤</div>' +
      '<label class="btn btn-ghost btn-sm ob-file">🖼️ Elegir foto de perfil' +
      '<input type="file" class="ob-file-in" id="obFile" accept="image/*"></label>' +
      '<input type="text" id="obName" class="ob-input" maxlength="20" placeholder="Tu nombre de dev" autocomplete="off">' +
      '<button class="btn btn-gold btn-block" id="obStart" disabled>⚡ Empezar</button>' +
      '<div class="ob-foot">Tu nombre y tu foto se guardan solo en este dispositivo.</div>' +
      '</div>';
  }

  /** Onboarding: se muestra la primera vez que no hay perfil guardado. */
  function showOnboarding() {
    I.openModal(welcomeHTML(), false);
    var nameEl = U.$('#obName'), start = U.$('#obStart'), av = U.$('#obAvatar');
    var tmpAvatar = '';
    function enable() { if (start) start.disabled = !(nameEl && nameEl.value.trim()); }
    if (nameEl) nameEl.addEventListener('input', enable);
    if (av) {
      var fileIn = U.$('#obFile');
      if (fileIn) fileIn.addEventListener('change', function () {
        var f = fileIn.files && fileIn.files[0];
        if (!f) return;
        readProfileImage(f, function (url) {
          if (!url) return;
          tmpAvatar = url;
          if (av) av.innerHTML = '<img src="' + url + '" alt="Foto de perfil">';
        });
      });
    }
    if (start) start.addEventListener('click', function () {
      var nm = nameEl ? nameEl.value.trim() : '';
      if (!nm) { enable(); return; }
      saveProfile(nm, tmpAvatar);
      I.closeModal();
      I.toast('⚡ ¡' + nm + ', Syntax Legends te espera!');
      OU.STATE.save();
      startTutorialOnce();
    });
  }

  /** Modal para editar el perfil (título y foto) desde el HUD. */
  function openProfileModal() {
    var p = loadProfile();
    I.openModal(
      '<div class="ob-wrap">' +
      '<div class="ob-t">Tu perfil</div>' +
      '<div class="ob-d">Edita tu nombre y tu foto de dev.</div>' +
      '<div class="ob-avatar" id="obAvatar">' + (p.avatar ? '<img src="' + p.avatar + '" alt="Foto de perfil">' : '👤') + '</div>' +
      '<label class="btn btn-ghost btn-sm ob-file">🖼️ Cambiar foto' +
      '<input type="file" class="ob-file-in" id="obFile" accept="image/*"></label>' +
      '<input type="text" id="obName" class="ob-input" maxlength="20" value="' + esc(p.name) + '" placeholder="Tu nombre de dev" autocomplete="off">' +
      '<button class="btn btn-gold btn-block" id="obSave">Guardar</button>' +
      '<button class="btn btn-ghost btn-block ob-clear" id="obClear">🗑️ Quitar foto</button>' +
      '</div>', true);
    var nameEl = U.$('#obName'), av = U.$('#obAvatar'), save = U.$('#obSave');
    var tmp = p.avatar || '';
    var fileIn = U.$('#obFile');
    if (fileIn) fileIn.addEventListener('change', function () {
      var f = fileIn.files && fileIn.files[0];
      if (!f) return;
      readProfileImage(f, function (url) {
        if (!url) return;
        tmp = url;
        if (av) av.innerHTML = '<img src="' + url + '" alt="Foto de perfil">';
      });
    });
    var clr = U.$('#obClear');
    if (clr) clr.addEventListener('click', function () {
      tmp = '';
      if (av) av.innerHTML = '👤';
    });
    if (save) save.addEventListener('click', function () {
      var nm = nameEl ? nameEl.value.trim() : '';
      saveProfile(nm || 'Dev', tmp);
      I.closeModal();
      I.toast('✅ Perfil actualizado');
    });
  }

  /* =============== PANTALLA PRINCIPAL (boceto) =============== */

  function viewHome() {
    var st = OU.STATE.state;
    var stag = Math.min(st.stage, OU.STAGES.length - 1);
    return '<div class="home" id="homeView">' +
      '<div class="home-bg" aria-hidden="true"></div>' +
      '<div class="home-shade" aria-hidden="true"></div>' +
      '<div class="home-body">' +
      '<section class="home-cell home-team">' +
      '<div class="home-team-head">' +
      '<div class="home-team-title">Mi Equipo</div>' +
      '<button class="home-team-edit" id="editTeamBtn" title="Cambiar a tus lenguajes">✏️ Editar</button>' +
      '</div>' +
      '<div class="hub-squad">' + OU.TEAM.teamHubHTML() + '</div>' +
      '</section>' +
      '<button class="home-cell home-card home-merk" data-go="shop" title="Abrir el Marketplace">' +
      '<span class="hc-ic"><img class="hc-img" src="img/extras/icons/mercadeo.png" alt="Marketplace"></span>' +
      '<span class="hc-t">Marketplace</span>' +
      '<span class="hc-d">Sobres · ofertas · maravillas</span>' +
      '</button>' +
      '<button class="home-cell home-card home-camp" data-go="campaign" title="Ir a la Campaña">' +
      '<span class="hc-ic"><img class="hc-img" src="img/extras/icons/campaña.png" alt="Campaña"></span>' +
      '<span class="hc-t">Campaña</span>' +
      '<span class="hc-d">Fase ' + (stag + 1) + ' · ' + OU.STAGES[stag].n + '</span>' +
      '</button>' +
      '<button class="home-cell home-idx" data-go="index" title="Índice de Leyendas">' +
      '<span class="idx-book"><img class="idx-img" src="img/extras/icons/indnice.png" alt="Índice"></span>' +
      '<span class="idx-lb">Índice</span>' +
      '</button>' +
      '</div>' +
      '<div class="home-foot">' + OU.TRAIN.incomeBannerHTML() + '</div>' +
      '</div>';
  }

  function bindHome(root) {
    U.$$('[data-go]', root).forEach(function (b) {
      b.addEventListener('click', function () { setTab(b.dataset.go); });
    });
    U.$$('[data-gotab]', root).forEach(function (b) {
      b.addEventListener('click', function () { setTab(b.dataset.gotab); });
    });
    U.$$('[data-hero]', root).forEach(function (h) {
      h.addEventListener('click', function () { OU.COLLECTION.openCardDetail(h.dataset.hero); });
    });
    var editBtn = U.$('#editTeamBtn', root);
    if (editBtn) editBtn.addEventListener('click', function () { OU.TEAM.openTeamEditorModal(); });
    OU.TRAIN.bindIncome(root);
    I.spriteHub(root);
  }

  /* =============== RECOMPENSAS DIARIAS =============== */

  var MISSIONS = [
    { k: 'campaign', ic: '⚔️', t: 'Conquistador', d: 'Supera la fase de campaña en la que estás hoy.', gold: 400 },
    { k: 'games', ic: '🎪', t: 'Gloria en la arena', d: 'Gana una partida en cualquier minijuego hoy.', gems: 3 },
    { k: 'bazaar', ic: '🛒', t: 'Cazador de tesoros', d: 'Abre un sobre en el Marketplace hoy.', gold: 300 }
  ];

  function winsTotal() {
    var mg = OU.STATE.state.mgStats || {};
    return ['oracle', 'ppt', 'wheel', 'dice', 'mem'].reduce(function (s, k) {
      var x = mg[k];
      return s + ((x && x.wins) || 0);
    }, 0);
  }

  /** Snapshot diario para saber si hoy se progresó (sin tocar el motor). */
  function ensureMissions() {
    var st = OU.STATE.state;
    var rec = st.missions = st.missions || {};
    var today = OU.STATE.todayStr(0);
    if (rec.day !== today) {
      rec.day = today;
      rec.snapStage = st.stage;
      rec.snapWins = winsTotal();
      rec.snapCards = Object.keys(st.cards).length;
      rec.claimed = [];
    }
    return rec;
  }

  function missionMet(k, rec) {
    var st = OU.STATE.state;
    if (k === 'campaign') return st.stage > rec.snapStage;
    if (k === 'games') return winsTotal() > rec.snapWins;
    if (k === 'bazaar') return Object.keys(st.cards).length > rec.snapCards;
    return false;
  }

  function claimMission(k) {
    var st = OU.STATE.state;
    var rec = ensureMissions();
    if (rec.claimed.indexOf(k) !== -1) return;
    var m = null;
    MISSIONS.forEach(function (x) { if (x.k === k) m = x; });
    if (!m) return;
    if (!missionMet(k, rec)) { I.toast('Misión «' + m.t + '» aún no completada'); return; }
    rec.claimed.push(k);
    if (m.gold) st.gold += m.gold;
    if (m.gems) st.gems += m.gems;
    OU.STATE.save();
    I.updateTopRes();
    I.toast('✅ Misión «' + m.t + '» cumplida: ' + (m.gold ? '+' + U.fmt(m.gold) + ' 🪙' : '') + (m.gems ? '+' + m.gems + ' 💎' : ''));
    render();
  }

  function missionRows() {
    var rec = ensureMissions();
    return MISSIONS.map(function (m) {
      var claimed = rec.claimed.indexOf(m.k) !== -1;
      var met = missionMet(m.k, rec);
      var chip = claimed
        ? '<span class="m-st ok">✔ Reclamada</span>'
        : (met ? '<span class="m-st met">✓ ¡Cumplida!</span>' : '<span class="m-st lock">En curso…</span>');
      var btn = claimed
        ? ''
        : (met
          ? '<button class="btn btn-gold btn-sm" data-mission="' + m.k + '">Reclamar</button>'
          : '<button class="btn btn-ghost btn-sm" disabled>Pendiente</button>');
      return '<div class="mission-row ' + (claimed ? 'claimed' : (met ? 'ready' : '')) + '">' +
        '<div class="m-ic">' + m.ic + '</div>' +
        '<div class="m-info"><div class="m-t">' + m.t + '</div><div class="m-d">' + m.d + '</div></div>' +
        '<div class="m-re">' + (m.gold ? U.fmt(m.gold) + ' 🪙' : '') + (m.gems ? ' +' + m.gems + ' 💎' : '') + '</div>' +
        '<div class="m-side">' + chip + btn + '</div>' +
        '</div>';
    }).join('');
  }

  function viewDaily() {
    var di = I.dailyInfo();
    var prev = OU.STATE.state.daily.streak || 0;
    var lit = di.claimed ? di.streak : prev;
    var cand = [];
    for (var i = 0; i < 7; i++) {
      var rw = Math.min(OU.CONST.DAILY_GEMS_BASE + (i + 1), OU.CONST.DAILY_GEMS_CAP);
      var cls = i < lit ? 'lit' : (i === lit ? 'now' : '');
      cand.push('<div class="cand ' + cls + '">' +
        '<div class="cand-re">+' + rw + ' 💎</div>' +
        '<div class="cand-ic">' + (i < lit ? '✔' : (i === lit ? '🎯' : '·')) + '</div>' +
        '</div>');
    }
    return '<div class="sec-title">🎁 Recompensas Diarias</div>' +
      '<div class="daily-panel ' + (di.claimed ? 'done' : '') + '">' +
      '<div class="dp-row">' +
      '<div class="dp-icon">' + (di.claimed ? '🔥' : '📅') + '</div>' +
      '<div class="dp-info">' +
      '<div class="dp-t">Racha de <b>' + di.streak + '</b> día' + (di.streak === 1 ? '' : 's') + '</div>' +
      '<div class="dp-d">Cada día reclamado suma más gemas, hasta +' + OU.CONST.DAILY_GEMS_CAP + ' 💎.</div>' +
      '</div>' +
      '<div class="dp-cta">' +
      (di.claimed
        ? '<div class="dp-claimed">✔ Reclamado hoy</div><div class="dp-next">Mañana: +' + di.nextReward + ' 💎</div>'
        : '<button class="btn btn-gold" id="claimDaily">Reclamar +' + di.reward + ' 💎</button>') +
      '</div>' +
      '</div>' +
      '<div class="dp-cal">' + cand.join('') + '</div>' +
      '</div>' +
      '<div class="sec-title">Misiones del día</div>' +
      '<p class="battle-hint" style="text-align:left;margin-top:0">Completa objetivos jugando. Las misiones se renuevan cada día al abrir esta pestaña.</p>' +
      missionRows() +
      '<div class="sec-title">Más acciones</div>' +
      '<div class="quick-row">' +
      '<button class="qbtn" data-go="games">🎪 Minijuegos</button>' +
      '<button class="qbtn" data-go="training">🏋️ Entrenar</button>' +
      '<button class="qbtn" data-go="team">🛡️ Gestionar equipo</button>' +
      '</div>';
  }

  function bindDaily(root) {
    var cd = U.$('#claimDaily', root);
    if (cd) cd.addEventListener('click', function () {
      var r = OU.STATE.checkDaily();
      if (r.reward > 0) {
        I.updateTopRes();
        I.toast('🎁 Reclamada: +' + r.reward + ' 💎 · racha de ' + r.streak + ' día' + (r.streak === 1 ? '' : 's'));
        render();
      } else {
        I.toast('Ya reclamaste la recompensa de hoy');
      }
    });
    U.$$('[data-mission]', root).forEach(function (b) {
      b.addEventListener('click', function () { claimMission(b.dataset.mission); });
    });
    U.$$('[data-go]', root).forEach(function (b) {
      b.addEventListener('click', function () { setTab(b.dataset.go); });
    });
  }

  /* =============== DATOS (curiosidades de programación) =============== */

  var MYTHS = [
    { ic: '🐍', i: '', t: 'El nombre de Python', d: 'Guido van Rossum nombró a Python por el grupo de humor británico Monty Python, no por la serpiente.' },
    { ic: '☕', i: '', t: 'Java y el café', d: 'Java se bautizó por el café de la isla de Java, pero su logo (una taza humeante) se añadió más tarde.' },
    { ic: '🎇', i: '', t: 'JavaScript no es Java', d: 'JavaScript se llamaba Mocha y luego LiveScript; se nombró «Java» por marketing, aunque no comparte tecnología con Java.' },
    { ic: '💾', i: '', t: 'El error del año 2000', d: 'Para ahorrar memoria, muchos sistemas guardaban la fecha con 2 dígitos. Al llegar el 2000, el plan Y2K se corrigió por todo el mundo.' },
    { ic: '🪵', i: '', t: 'El primer bug', d: 'En 1947, Grace Hopper documentó un «bug» real: una polilla atrapada en un relé del ordenador Mark II.' },
    { ic: '⌨️', i: '', t: 'QWERTY es un freno', d: 'El teclado QWERTY fue diseñado para que las palancas de las máquinas de escribir no se atascaran, no para ser rápido.' },
    { ic: '🧮', i: '', t: 'Ada, el primer programa', d: 'Ada Lovelace escribió en 1843 el primer algoritmo pensado para una máquina (la máquina analítica de Babbage).' },
    { ic: '🤖', i: '', t: 'El primer buscador', d: 'Archie (1990) fue el primer buscador de internet; indexaba archivos FTP con un script en Perl.' },
    { ic: '🚀', i: '', t: 'Cómo nació COBOL', d: 'COBOL (1959) fue de los primeros lenguajes «de negocios»; hoy gestiona todavía gran parte de la banca mundial.' },
    { ic: '🕸️', i: '', t: 'HTML no es un lenguaje de programación', d: 'HTML es de marcas: describe estructura. La lógica corre en lenguajes como Python, Java o JavaScript.' },
    { ic: '🔠', i: '', t: 'ASCII cumple 60 años', d: 'ASCII (1963) fija letras con 7 bits: 128 caracteres. Antes, cada fabricante tenía su propio «alfabeto».' },
    { ic: '🐚', i: '', t: 'Los «shells» son conchas', d: 'El shell de GNU/Linux se llama «shell» (concha) porque envuelve al kernel y te habla por línea de comandos.' },
    { ic: '📜', i: '', t: 'Nadie ha leído todo el código', d: 'Se calcula que hay cientos de miles de millones de líneas de código en el mundo; ninguna persona las leerá nunca.' },
    { ic: '🖨️', i: '', t: 'La primera impresora era una telaraña', d: 'En 1425, el «tallador de letras» ofrecía bloques tallados; la imprenta de Gutenberg (1440) lo aceleró a máquinas.' },
    { ic: '🏰', i: '', t: 'El origen de C', d: 'C nació en los Bell Labs (1972) para reescribir UNIX; su nombre viene de un lenguaje anterior llamado B.' },
    { ic: '🎲', i: '', t: 'El aleatorio no es aleatorio', d: 'Las computadoras usan «pseudoaleatorios»: secuencias muy largas que parecen al azar, pero parten de una semilla.' },
    { ic: '🌐', i: '', t: 'La primera página web', d: 'El primer sitio (1991) explicaba qué era la World Wide Web y corría sobre Python, el lenguaje de Tim Berners-Lee.' },
    { ic: '🧺', i: '', t: 'El «goto» y la guerra de los 60', d: 'La carta de Dijkstra (1968) contra el «goto» encendió el debate de la programación estructurada.' },
    { ic: '🍝', i: '', t: 'El código espagueti', d: 'Se llama así a un código enredado, con saltos y dependencias imposibles de seguir: hay que cocerlo y refactorizarlo.' },
    { ic: '🔌', i: '', t: 'APIs: puentes entre programas', d: 'Una API (interfaz de programación) es el «enchufe» estándar por el que una app pide datos y servicios a otra.' },
    { ic: '💡', i: '', t: 'La depuración con persecución', d: 'A la caza de fallos se le llama «debugging»: imprimir, trazar y hasta usar lámparas para ver estados internos.' },
    { ic: '🏗️', i: '', t: 'Los primeros «frameworks»', d: 'Los frameworks nacen para no reinventar la rueda: reutilizan patrones y estructuras ya probadas por la comunidad.' },
    { ic: '🦾', i: '', t: 'Git nació en dos semanas', d: 'Linus Torvalds creó la primera versión de Git en 2005, en unas dos semanas, para gestionar el kernel de Linux.' },
    { ic: '🧽', i: '', t: 'El lenguaje cambia diez veces al año', d: 'JavaScript publica nuevas características cada año; Python lo hace con nuevas versiones y PEPs detalladas.' },
    { ic: '🛰️', i: '', t: 'Los satélites también programan', d: 'Muchos satélites usan C y C++: lenguajes eficientes, conocidos y muy depurados para el espacio.' },
    { ic: '⏱️', i: '', t: 'El reloj del sistema', d: 'Las computadoras miden el tiempo con cristales de cuarzo y ticks; un tick puede ser de microsegundos.' },
    { ic: '📺', i: '', t: 'Los primeros videojuegos eran texto', d: 'Antes de los gráficos, los juegos eran ASCII y avatares de letras: Zork y colosos de la aventura textual.' },
    { ic: '🧷', i: '', t: 'El intercambio de datos JSON', d: 'JSON nació en 2001 como alternativa ligera a XML; hoy es el idioma por defecto de casi todas las APIs.' },
    { ic: '🏁', i: '', t: 'El primer compilador', d: 'Grace Hopper creó en 1952 el primer compilador, que traducía el código a lo que la máquina podía ejecutar.' },
    { ic: '🗂️', i: '', t: 'De los ficheros al cloud', d: 'Guardar datos pasó de tarjetas perforadas y discos duros a repositorios remotos: el «cloud» es, en realidad, otra máquina.' }
  ];

  function storyIndex() {
    var m = new Date();
    var start = new Date(m.getFullYear(), 0, 0);
    var day = Math.floor((m - start) / 86400000);
    return day % MYTHS.length;
  }

  function viewStory() {
    var si = storyIndex();
    var cur = MYTHS[si];
    var img = cur.i
      ? '<img class="st-img" src="img/historia/' + cur.i + '" alt="' + esc(cur.t) +
        '" loading="lazy" decoding="async" onerror="this.style.display=\'none\'">'
      : '<div class="st-emoji">' + cur.ic + '</div>';
    return '<div class="story-today">' +
      '<div class="st-head"><span class="st-line"></span>' +
      '<span class="st-eyebrow">El dato de hoy</span>' +
      '<span class="st-line"></span></div>' +
      '<div class="st-frame" data-t="' + esc(cur.t) + '">' + img + '</div>' +
      '<div class="st-t">' + cur.t + '</div>' +
      '<div class="st-div"></div>' +
      '<div class="st-d">' + cur.d + '</div>' +
      '<div class="st-sub">Dato <b>' + (si + 1) + '</b> de ' + MYTHS.length +
      '<span class="st-dot"></span>Vuelve mañana por uno nuevo</div>' +
      '</div>';
  }

  /* =============== NOTICIAS (novedades y cambios) =============== */

  var NEWS = [
    { d: 'Hoy', ic: '🖥️', t: 'Tu laboratorio ha amanecido', x: 'Pantalla principal rediseñada: tu «Mi Equipo» luce en el centro, con el Marketplace a la izquierda y la Campaña a la derecha. Toca el libro flotante para abrir el Índice de Leyendas.' },
    { d: 'Hoy', ic: '👤', t: 'Ponle cara a tu dev', x: 'Elige tu nombre y una foto de perfil al empezar (o toca tu nombre arriba para editarlo). Todo se guarda solo en tu dispositivo, sin subir nada a ningún servidor.' },
    { d: 'Semana', ic: '⚔️', t: '100 fases de la gran migración', x: 'Desde el primer Script hasta los Legados compilados. Derrota a los 10 jefes de acto y reclama gemas extra.' },
    { d: 'Semana', ic: '🎁', t: 'Racha diaria de gemas', x: 'Reclama cada día para sumar gemas: +2, +3… hasta +10 💎. Si fallas un día, la racha se reinicia.' },
    { d: 'Semana', ic: '🎮', t: 'El Repositorio ya tiene minijuegos', x: 'El Compilador, Piedra-Papel-Tijera, la Ruleta de la Suerte, el Dado Binario y la Memoria de Caché te esperan en Minijuegos.' },
    { d: 'Próximamente', ic: '🗓️', t: 'Eventos de doble oro', x: 'Se acercan fines de semana con oro duplicado, jefes semanales y nuevas cartas Legado. Vuelve a esta sección para no perdértelo.' }
  ];

  function viewNews() {
    var rows = NEWS.map(function (n) {
      return '<div class="news-row">' +
        '<div class="news-ic">' + n.ic + '</div>' +
        '<div class="news-body">' +
        '<div class="news-t">' + n.t + '</div>' +
        '<div class="news-x">' + n.x + '</div>' +
        '<div class="news-d">' + n.d + '</div>' +
        '</div>' +
        '</div>';
    }).join('');
    return '<div class="sec-title">📰 Noticias del Repositorio</div>' +
      '<p class="battle-hint" style="text-align:left;margin-top:0">Aquí encontrarás todas las novedades y cambios del juego.</p>' +
      '<div class="news-list">' + rows + '</div>';
  }

  /* =============== INICIO =============== */

  function startTutorialOnce() {
    var st = OU.STATE.state;
    if (!st._tutorial) {
      st._tutorial = true;
      OU.STATE.save();
      setTimeout(showTutorial, 400);
    }
  }

  function init() {
    OU.STATE.load();
    updateUserHUD();
    U.$$('#tabs .tab').forEach(function (t) {
      t.addEventListener('click', function () { setTab(t.dataset.tab); });
    });
    window.addEventListener('beforeunload', OU.STATE.save);
    var uh = U.$('#userHud');
    if (uh) uh.addEventListener('click', openProfileModal);
    U.$$('#resRow .chip').forEach(function (c) {
      c.addEventListener('click', function (e) {
        e.stopPropagation();
        setTab(c.dataset.goto || 'shop');
      });
    });
    OU.TRAIN.startTimer();
    OU.SHOP.startShopTimer();
    setInterval(function () {
      OU.STATE.tickIncome();
    }, 30000); // guardado periódico del ingreso pasivo
    setTab('home');
    if (isNewUser()) {
      setTimeout(showOnboarding, 600);
      return;
    }
    var hasLoader = !!(document.getElementById && document.getElementById('loader'));
    if (hasLoader) {
      var di = I.dailyInfo();
      if (!di.claimed && di.reward > 0) {
        setTimeout(function () { I.toast('🎁 ¡+' + di.reward + ' 💎 te esperan en «Recompensas»!'); }, 900);
      }
    }
    startTutorialOnce();
  }

  /* ---------- PANTALLA DE CARGA ---------- */

  /** Recopila todas las imágenes del juego (cartas, sobres, minijuegos, extras). */
  function loaderAssets() {
    var urls = [];
    function add(u) { if (u && urls.indexOf(u) === -1) urls.push(u); }
    if (OU.CARDS) OU.CARDS.forEach(function (c) {
      var cand = OU.IMG && OU.IMG[c.id];
      if (cand && cand.length) add(cand[0]);
    });
    [
      'img/extras/fondos/fondo.jpg',
      'img/extras/logo/syntaxis-fondo.png',
      'img/extras/icons/mercadeo.png',
      'img/extras/icons/campaña.png',
      'img/extras/icons/indnice.png',
      'img/sobres/sobre_bronce.jpg', 'img/sobres/sobre_plata.jpg', 'img/sobres/sobre_oro.jpg',
      'img/sobres/sobre_epico.jpg', 'img/sobres/sobre_olimpo.png', 'img/sobres/sobre_divino.png',
      'img/sobres/sobre_cosmico.png',
      'img/minijuegos/oraculo.png', 'img/minijuegos/desafio-dios.png',
      'img/minijuegos/ruleta-destino.png', 'img/minijuegos/dado-zeus.png',
      'img/minijuegos/memoria-orfeo.png'
    ].forEach(add);
    return urls;
  }

  /** Carga REAL: pre-carga las imágenes del juego y solo habilita «Jugar»
      cuando todas están listas (la barra refleja el progreso real). */
  function animateLoader() {
    var fill = U.$('#ldFill'), pct = U.$('#ldPct'), play = U.$('#ldPlay'), sub = U.$('#ldSub');
    if (!play) return null;
    play.disabled = true;
    play.classList.remove('ld-ready');
    function setPct(p) {
      p = Math.max(0, Math.min(100, Math.round(p)));
      if (fill) fill.style.width = p + '%';
      if (pct) pct.textContent = p + '%';
    }
    function ready() {
      setPct(100);
      if (sub) sub.textContent = 'El Repositorio te espera';
      play.disabled = false;
      play.classList.add('ld-ready');
    }
    if (typeof Image !== 'function') {
      var tv = 0, tiv = setInterval(function () {
        tv = Math.min(100, tv + 7 + Math.random() * 9);
        setPct(tv);
        if (tv >= 100) { clearInterval(tiv); ready(); }
      }, 150);
      return play;
    }
    var urls = loaderAssets();
    var total = urls.length, done = 0, iv = null;
    function maybeFinish() {
      if (done >= total) { if (iv) clearInterval(iv); ready(); }
    }
    urls.forEach(function (u) {
      var im;
      try { im = new Image(); } catch (e) { done++; maybeFinish(); return; }
      var fin = function () { if (!im._d) { im._d = true; done++; maybeFinish(); } };
      im.onload = fin;
      im.onerror = fin;
      try { im.src = u; } catch (e) { done++; maybeFinish(); }
    });
    iv = setInterval(function () {
      maybeFinish();
      if (done >= total) return;
      var base = total ? Math.floor((done / total) * 88) : 0;
      setPct(Math.min(92, base + 2 + Math.random() * 6));
      if (done / total > 0.6) { if (sub && sub.textContent !== 'Forjando leyendas…') sub.textContent = 'Forjando leyendas…'; }
      else if (sub && sub.textContent !== 'Cargando el Repositorio…') sub.textContent = 'Cargando el Repositorio…';
    }, 150);
    return play;
  }

  /* ---------- GUÍA DE BIENVENIDA ---------- */

  var TUT_STEPS = [
    { ic: '🖥️', t: 'Tu Repositorio', d: 'Esta es tu pantalla principal. Tu <b>«Mi Equipo»</b> brilla en el centro: toca cualquier carta para verla en Lenguajes.' },
    { ic: '🛍️', t: 'Marketplace', d: 'El módulo de la <b>izquierda</b> abre el Marketplace: sobres, ofertas y maravillas. Ábrelo cuando quieras conseguir cartas nuevas.' },
    { ic: '⚔️', t: 'Campaña', d: 'A la <b>derecha</b> tienes la Campaña: vence sus 100 fases para ganar oro, XP y gemas. Tu equipo de 5 lenguajes pelea solo.' },
    { ic: '📖', t: 'Índice', d: 'El <b>libro flotante</b> abajo a la izquierda abre el Índice de Leyendas: todas las cartas, desbloqueadas y por descubrir.' },
    { ic: '🃏', t: 'Lenguajes', d: 'En el menú inferior, <b>Lenguajes</b> guarda tus cartas: mejóralas con duplicados y oro, entrénalas y gestiona tu equipo.' },
    { ic: '🎁', t: 'Recompensas', d: '<b>Recompensas</b> te da una racha diaria de gemas 💎 y misiones que se renuevan cada día. También encontrarás los minijuegos.' },
    { ic: '📰', t: 'Noticias', d: 'En <b>Noticias</b> seguiremos contándote novedades, eventos y cambios del juego.' }
  ];

  function showTutorial() {
    var i = 0;
    function stepsHTML() {
      var s = TUT_STEPS[i];
      return '<div class="tut">' +
        '<div class="tut-ic">' + s.ic + '</div>' +
        '<div class="tut-t">' + s.t + '</div>' +
        '<div class="tut-d">' + s.d + '</div>' +
        '<div class="tut-dots">' + TUT_STEPS.map(function (x, k) { return '<span class="dot' + (k === i ? ' on' : '') + '"></span>'; }).join('') + '</div>' +
        '<div class="tut-btns">' +
        (i > 0 ? '<button class="btn btn-ghost btn-sm" id="tutBack">← Anterior</button>' : '') +
        (i < TUT_STEPS.length - 1
          ? '<button class="btn btn-gold btn-sm" id="tutNext">Siguiente →</button>'
          : '<button class="btn btn-gold btn-sm" id="tutDone">¡Entendido! ⚔️</button>') +
        '</div>' +
        '</div>';
    }
    function bind() {
      var n = U.$('#tutNext'); if (n) n.addEventListener('click', function () { i++; open(); });
      var b = U.$('#tutBack'); if (b) b.addEventListener('click', function () { i--; open(); });
      var d = U.$('#tutDone'); if (d) d.addEventListener('click', I.closeModal);
    }
    function open() { I.openModal(stepsHTML(), true); bind(); }
    i = 0;
    open();
  }

  OU.MAIN = {
    setTab: setTab,
    render: render,
    init: init,
    get currentTab() { return currentTab; },
    set currentTab(v) { currentTab = v; syncMenu(); }
  };

  function boot() {
    // Con pantalla de carga (#loader en index.html): esperamos a «Jugar».
    if (document.getElementById && document.getElementById('loader')) {
      var play = U.$('#ldPlay');
      if (play) {
        animateLoader();
        play.addEventListener('click', function () {
          var ld = U.$('#loader');
          if (ld) {
            ld.classList.add('hide');
            setTimeout(function () { if (ld.parentNode) ld.parentNode.removeChild(ld); }, 450);
          }
          init();
        });
      } else {
        init();
      }
    } else {
      init(); // entorno sin cargador (tests, embeds)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();