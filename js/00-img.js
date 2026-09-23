// Arte de las cartas: se usan SOLO las imagenes locales de la carpeta /img
// (creadas a mano), sin referencias externas. Si no hay imagen, se muestra emoji.
// Organización de carpetas: img/personajes/<rango>/<id>.png, img/paquetes/,
// img/extras/. Los ids referencian los lenguajes de la tabla OU.CARDS.
(function () {
  "use strict";
  var OU = window.OU = window.OU || {};
  function chain(rango, id) {
    return ["img/personajes/" + rango + "/" + id + ".png",
            "img/" + id + ".png",
            "img/" + id + ".jpg",
            "img/" + id + ".webp"];
  }
  var R = {
    normal: ["html", "css", "sql", "bash", "json", "regx", "md", "lua", "ps", "yaml", "xml", "scr"],
    hero: ["py", "js", "php", "rb", "swift", "kt", "dart", "rlang", "perl", "julia", "groovy", "objc"],
    god: ["react", "ang", "vue", "svelte", "next", "django", "rails", "laravel", "spring", "express", "flutter", "dotnet"],
    titan: ["rust", "cpp", "c", "java", "csh", "go", "zig", "asm", "elix", "erl", "haskell", "scala"],
    primordial: ["cobol", "fort", "lisp", "apl", "ada", "pascal", "basic", "smtalk", "scheme", "prolog", "simula", "algol"]
  };
  OU.IMG = {};
  Object.keys(R).forEach(function (rar) {
    R[rar].forEach(function (id) { OU.IMG[id] = chain(rar, id); });
  });

  /**
   * Sprites animados de batalla (hoja 6 columnas × 5 filas, PNG transparente).
   * Cada carta con sprite tiene su hoja en img/sprites/<id>/sprite.png.
   * `frames` son los 30 rectángulos [x, y, ancho, alto] de cada celda, en orden
   * de filas: FILA 1 reposo, 2 avance, 3 ataque, 4 daño(1-3)+muerte(4-6), 5 habilidad.
   * Mientras el retrato de la carta sigue en img/, aquí SOLO vive el combate.
   */
  var gridFrames = [
    [22, 13, 48, 91], [112, 13, 48, 78], [205, 13, 48, 91], [296, 13, 48, 78], [387, 13, 48, 91], [478, 13, 48, 78],
    [27, 104, 51, 77], [115, 104, 56, 78], [202, 104, 58, 89], [293, 104, 59, 78], [384, 104, 59, 89], [479, 104, 55, 89],
    [22, 199, 90, 84], [112, 194, 90, 89], [202, 193, 70, 90], [279, 195, 103, 78], [382, 193, 53, 80], [474, 193, 49, 80],
    [22, 283, 90, 88], [112, 283, 49, 88], [205, 283, 48, 88], [283, 289, 99, 71], [382, 312, 91, 51], [473, 296, 64, 68],
    [22, 371, 90, 83], [112, 371, 90, 83], [202, 371, 77, 83], [279, 372, 103, 82], [382, 371, 91, 79], [473, 371, 71, 83]
  ];
  OU.SPRITES = {};
})();