/* Filante — logique pure du jeu (aucun accès à l'écran). Sert au navigateur ET aux essais Node.
   Tout est calculé en entiers pour que le défi du jour soit identique sur tous les appareils. */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else racine.Filante = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const VERSION_CIELS = 1; // changer ce nombre change TOUS les ciels : ne jamais le faire après la mise en ligne
  const JOUR_UN = '2026-11-19'; // le ciel n° 1
  const DIRS = { U: [0, -1], D: [0, 1], L: [-1, 0], R: [1, 0] };
  const ORDRE = ['U', 'D', 'L', 'R'];
  const ETAPES = [
    { n: 5, rochers: [3, 5], etoiles: 2, ideal: [3, 5] },
    { n: 6, rochers: [5, 8], etoiles: 3, ideal: [5, 8] },
    { n: 7, rochers: [7, 11], etoiles: 4, ideal: [8, 12] },
  ];

  /* ---------- hasard reproductible ---------- */
  function hacher(texte) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < texte.length; i++) {
      h ^= texte.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
  }
  function hasard(graine) {
    let a = graine >>> 0;
    const suivant = function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return (t ^ (t >>> 14)) >>> 0;
    };
    return { entier: (max) => suivant() % max, entre: (min, max) => min + (suivant() % (max - min + 1)) };
  }

  /* ---------- déplacement ---------- */
  function glisser(ciel, pos, dir) {
    const n = ciel.n;
    const d = DIRS[dir];
    let x = pos % n;
    let y = (pos - x) / n;
    const chemin = [];
    for (;;) {
      const nx = x + d[0];
      const ny = y + d[1];
      if (nx < 0 || ny < 0 || nx >= n || ny >= n || ciel.rochers[ny * n + nx]) break;
      x = nx;
      y = ny;
      chemin.push(y * n + x);
    }
    return { pos: y * n + x, chemin };
  }
  function jouerCoup(ciel, etat, dir) {
    const g = glisser(ciel, etat.pos, dir);
    let masque = etat.masque;
    const prises = [];
    for (const c of g.chemin) {
      const i = ciel.etoiles.indexOf(c);
      if (i >= 0 && !(masque & (1 << i))) {
        masque |= 1 << i;
        prises.push(c);
      }
    }
    return { pos: g.pos, masque, chemin: g.chemin, prises, bouge: g.chemin.length > 0, fini: masque === (1 << ciel.etoiles.length) - 1 };
  }
  function etatInitial(ciel) {
    return { pos: ciel.depart, masque: 0 };
  }

  /* ---------- résolution : plus court parcours, et aucun cul-de-sac ---------- */
  function resoudre(ciel) {
    const k = ciel.etoiles.length;
    const plein = (1 << k) - 1;
    const taille = ciel.n * ciel.n * (1 << k);
    const dist = new Int16Array(taille).fill(-1);
    const parent = new Int32Array(taille).fill(-1);
    const coup = new Int8Array(taille).fill(-1);
    const inverses = new Map();
    const depart = ciel.depart * (1 << k);
    const file = [depart];
    dist[depart] = 0;
    let but = -1;
    const buts = [];
    for (let t = 0; t < file.length; t++) {
      const s = file[t];
      const masque = s & plein;
      if (masque === plein) {
        if (but < 0) but = s;
        buts.push(s);
        continue; // la partie s'arrête là
      }
      const pos = s >> k;
      for (let i = 0; i < 4; i++) {
        const r = jouerCoup(ciel, { pos, masque }, ORDRE[i]);
        if (!r.bouge) continue;
        const v = r.pos * (1 << k) + r.masque;
        if (!inverses.has(v)) inverses.set(v, []);
        inverses.get(v).push(s);
        if (dist[v] < 0) {
          dist[v] = dist[s] + 1;
          parent[v] = s;
          coup[v] = i;
          file.push(v);
        }
      }
    }
    if (but < 0) return { soluble: false, ideal: -1, sur: false, solution: '' };
    let solution = '';
    for (let s = but; parent[s] >= 0; s = parent[s]) solution = ORDRE[coup[s]] + solution;
    // sûr = depuis n'importe quel état atteignable, on peut encore finir
    const vu = new Set(buts);
    const pile = buts.slice();
    while (pile.length) {
      const s = pile.pop();
      for (const p of inverses.get(s) || []) if (!vu.has(p)) { vu.add(p); pile.push(p); }
    }
    return { soluble: true, ideal: dist[but], sur: vu.size === file.length, solution };
  }

  /* ---------- fabrication d'un ciel ---------- */
  function fabriquer(graineTexte, etape) {
    const conf = typeof etape === 'number' ? ETAPES[etape] : etape;
    const n = conf.n;
    let meilleur = null;
    let meilleurEcart = 1e9;
    for (let essai = 0; essai < 4000; essai++) {
      const h = hasard(hacher(graineTexte + '|' + essai));
      const rochers = new Array(n * n).fill(0);
      let aPoser = h.entre(conf.rochers[0], conf.rochers[1]);
      while (aPoser > 0) {
        const c = h.entier(n * n);
        if (!rochers[c]) { rochers[c] = 1; aPoser--; }
      }
      let depart = h.entier(n * n);
      while (rochers[depart]) depart = (depart + 1) % (n * n);
      // cases que la comète peut traverser depuis le départ
      const ciel = { n, rochers, depart, etoiles: [] };
      const arrets = new Set([depart]);
      const traversees = new Set();
      const pile = [depart];
      while (pile.length) {
        const p = pile.pop();
        for (const d of ORDRE) {
          const g = glisser(ciel, p, d);
          for (const c of g.chemin) traversees.add(c);
          if (!arrets.has(g.pos)) { arrets.add(g.pos); pile.push(g.pos); }
        }
      }
      traversees.delete(depart);
      const libres = Array.from(traversees).sort((a, b) => a - b);
      if (libres.length < conf.etoiles + 2) continue;
      const etoiles = [];
      while (etoiles.length < conf.etoiles) {
        const c = libres.splice(h.entier(libres.length), 1)[0];
        etoiles.push(c);
      }
      etoiles.sort((a, b) => a - b);
      ciel.etoiles = etoiles;
      const r = resoudre(ciel);
      if (!r.soluble || !r.sur) continue;
      ciel.ideal = r.ideal;
      ciel.solution = r.solution;
      if (r.ideal >= conf.ideal[0] && r.ideal <= conf.ideal[1]) return ciel;
      const ecart = r.ideal < conf.ideal[0] ? conf.ideal[0] - r.ideal : r.ideal - conf.ideal[1];
      if (ecart < meilleurEcart) { meilleurEcart = ecart; meilleur = ciel; }
    }
    return meilleur;
  }

  /* ---------- le défi du jour ---------- */
  function cleDuJour(date) {
    const p = (v) => String(v).padStart(2, '0');
    return date.getFullYear() + '-' + p(date.getMonth() + 1) + '-' + p(date.getDate());
  }
  function joursEntre(a, b) {
    const ta = Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10));
    const tb = Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10));
    return Math.round((tb - ta) / 86400000);
  }
  function numeroDuJour(cle) {
    return joursEntre(JOUR_UN, cle) + 1;
  }
  function cielsDuJour(cle) {
    return ETAPES.map((_, i) => fabriquer('filante-v' + VERSION_CIELS + '|' + cle + '|' + i, i));
  }
  function cielsLibres(graine) {
    return ETAPES.map((_, i) => fabriquer('libre|' + graine + '|' + i, i));
  }

  /* ---------- notation et partage ---------- */
  function note(coups, ideal) {
    const plus = coups - ideal;
    return plus <= 0 ? 0 : plus <= 2 ? 1 : 2;
  }
  const CARRES = ['\u{1F7E9}', '\u{1F7E8}', '\u{1F7E7}'];
  function textePartage(r) {
    // Volontairement sans mots : lisible dans toutes les langues, et ne dévoile aucun chemin.
    const carres = r.coups.map((c, i) => CARRES[note(c, r.ideaux[i])]).join('');
    const total = r.coups.reduce((a, b) => a + b, 0);
    const ideal = r.ideaux.reduce((a, b) => a + b, 0);
    let t = 'Filante #' + r.numero + ' ☄️ ' + carres + ' ' + total + '/' + ideal;
    if (r.serie > 1) t += ' \u{1F525}' + r.serie;
    if (r.adresse) t += '\n' + r.adresse;
    return t;
  }

  /* ---------- série de jours ---------- */
  function statsVides() {
    return { serie: 0, record: 0, joues: 0, parfaits: 0, dernier: '' };
  }
  function noterJournee(stats, cle, parfait) {
    const s = Object.assign(statsVides(), stats);
    if (s.dernier === cle) return s; // déjà compté aujourd'hui
    const ecart = s.dernier ? joursEntre(s.dernier, cle) : 0;
    s.serie = ecart === 1 ? s.serie + 1 : 1;
    if (s.serie > s.record) s.record = s.serie;
    s.joues += 1;
    if (parfait) s.parfaits += 1;
    s.dernier = cle;
    return s;
  }
  function serieVivante(stats, cle) {
    if (!stats || !stats.dernier) return 0;
    const e = joursEntre(stats.dernier, cle);
    return e === 0 || e === 1 ? stats.serie : 0;
  }

  return {
    VERSION_CIELS, JOUR_UN, DIRS, ORDRE, ETAPES,
    hacher, hasard, glisser, jouerCoup, etatInitial, resoudre, fabriquer,
    cleDuJour, joursEntre, numeroDuJour, cielsDuJour, cielsLibres,
    note, textePartage, statsVides, noterJournee, serieVivante,
  };
});
