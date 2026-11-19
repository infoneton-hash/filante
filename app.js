/* Filante — interface. Aucune requête réseau, aucun traceur : seule la mémoire locale de l'appareil est utilisée. */
(function () {
  'use strict';
  const F = window.Filante;
  const TX = window.FilanteTextes;
  const CLE = 'filante.v1';
  const NS = 'http://www.w3.org/2000/svg';
  const $ = (id) => document.getElementById(id);
  const reduit = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mémoire locale ---------- */
  let mem = { langue: '', son: true, vu: false, stats: F.statsVides(), jours: {} };
  try {
    const brut = JSON.parse(localStorage.getItem(CLE) || 'null');
    if (brut && typeof brut === 'object') mem = Object.assign(mem, brut);
  } catch (e) { /* mémoire indisponible : on joue quand même */ }
  function sauver() {
    const cles = Object.keys(mem.jours).sort();
    while (cles.length > 40) delete mem.jours[cles.shift()];
    try { localStorage.setItem(CLE, JSON.stringify(mem)); } catch (e) { /* tant pis */ }
  }
  if (!mem.langue) mem.langue = TX.choisir(navigator.languages || [navigator.language]);
  const t = (cle, v) => TX.texte(mem.langue, cle, v);

  function aujourdhui() {
    const forcer = new URLSearchParams(location.search).get('jour'); // pour les essais : ?jour=2026-12-25
    return /^\d{4}-\d{2}-\d{2}$/.test(forcer || '') ? forcer : F.cleDuJour(new Date());
  }

  /* ---------- sons synthétisés ---------- */
  let audio = null;
  function ton(freq, duree, type, volume, vers, retard) {
    if (!mem.son) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === 'suspended') audio.resume();
      const t0 = audio.currentTime + (retard || 0);
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t0);
      if (vers) o.frequency.exponentialRampToValueAtTime(vers, t0 + duree);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(volume || 0.12, t0 + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + duree);
      o.connect(g).connect(audio.destination);
      o.start(t0);
      o.stop(t0 + duree + 0.03);
    } catch (e) { /* pas de son sur cet appareil */ }
  }
  const GAMME = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  const sons = {
    glisse: (n) => ton(240, 0.06 + 0.05 * n, 'sine', 0.05, 520),
    etoile: (i) => ton(GAMME[Math.min(i, GAMME.length - 1)], 0.28, 'triangle', 0.14),
    bute: () => ton(110, 0.09, 'square', 0.05, 70),
    gagne: () => [0, 2, 3, 5].forEach((n, i) => ton(GAMME[n], 0.3, 'triangle', 0.13, 0, i * 0.09)),
  };
  const vibrer = (ms) => { try { if (mem.son && navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* rien */ } };

  /* ---------- la partie ---------- */
  let P = null;

  function rejouerSequence(ciel, seq) {
    let etat = F.etatInitial(ciel);
    const arrets = [ciel.depart];
    let fini = false;
    for (const d of seq) {
      const r = F.jouerCoup(ciel, etat, d);
      etat = { pos: r.pos, masque: r.masque };
      arrets.push(r.pos);
      fini = r.fini;
    }
    return { etat, arrets, fini };
  }

  function demarrerJour() {
    const cle = aujourdhui();
    const ciels = F.cielsDuJour(cle);
    const garde = mem.jours[cle] || { seq: ['', '', ''] };
    mem.jours[cle] = garde;
    P = { mode: 'jour', cle, numero: F.numeroDuJour(cle), ciels, etape: 0, resultats: [], seqs: garde.seq, fini: false };
    for (let i = 0; i < 3; i++) {
      const r = rejouerSequence(ciels[i], garde.seq[i]);
      if (r.fini) { P.resultats[i] = garde.seq[i].length; P.etape = i; } else { P.etape = i; break; }
    }
    P.fini = P.resultats.length === 3 && P.resultats[2] !== undefined;
    ouvrirCiel(P.etape, true);
    if (P.fini) montrerResultat();
  }
  function demarrerLibre() {
    const graine = String(Date.now()) + '-' + Math.floor(Math.random() * 1e9);
    P = { mode: 'libre', cle: '', numero: 0, ciels: F.cielsLibres(graine), etape: 0, resultats: [], seqs: ['', '', ''], fini: false };
    ouvrirCiel(0, true);
  }

  function ouvrirCiel(i) {
    P.etape = i;
    const ciel = P.ciels[i];
    const r = rejouerSequence(ciel, P.seqs[i]);
    P.etat = r.etat;
    P.arrets = r.arrets;
    P.anim = false;
    P.file = null;
    P.cielFini = r.fini;
    dessiner();
    majBandeau();
    $('fin-ciel').hidden = !r.fini;
    if (r.fini) remplirFinCiel();
    $('libre').hidden = P.mode !== 'libre';
    document.body.classList.toggle('mode-libre', P.mode === 'libre');
    decrire();
  }

  /* ---------- dessin du plateau ---------- */
  function el(nom, attrs, parent) {
    const e = document.createElementNS(NS, nom);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  const centre = (ciel, c) => [(c % ciel.n) * 100 + 50, Math.floor(c / ciel.n) * 100 + 50];
  function cheminEtoile(cx, cy, R, r) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const ray = i % 2 ? r : R;
      d += (i ? 'L' : 'M') + (cx + ray * Math.cos(a)).toFixed(1) + ' ' + (cy + ray * Math.sin(a)).toFixed(1);
    }
    return d + 'Z';
  }
  function dessiner() {
    const ciel = P.ciels[P.etape];
    const svg = $('plateau');
    svg.textContent = '';
    svg.setAttribute('viewBox', '0 0 ' + ciel.n * 100 + ' ' + ciel.n * 100);
    for (let c = 0; c < ciel.n * ciel.n; c++) {
      const [x, y] = centre(ciel, c);
      if (ciel.rochers[c]) {
        el('rect', { x: x - 42, y: y - 42, width: 84, height: 84, rx: 22, class: 'rocher' }, svg);
        const h = F.hacher('c' + c + '-' + ciel.n);
        el('circle', { cx: x - 16 + (h % 9), cy: y - 12 + ((h >> 4) % 9), r: 9, class: 'cratere' }, svg);
        el('circle', { cx: x + 14 - ((h >> 8) % 7), cy: y + 16 - ((h >> 12) % 7), r: 5, class: 'cratere' }, svg);
      } else {
        el('circle', { cx: x, cy: y, r: 5, class: 'point' }, svg);
      }
    }
    el('polyline', { id: 'trainee', class: 'trainee', points: P.arrets.map((c) => centre(ciel, c).join(',')).join(' ') }, svg);
    ciel.etoiles.forEach((c, i) => {
      const [x, y] = centre(ciel, c);
      const e = el('path', { d: cheminEtoile(x, y, 30, 13), class: 'etoile', id: 'etoile-' + c }, svg);
      if (P.etat.masque & (1 << i)) e.classList.add('prise');
    });
    const [x, y] = centre(ciel, P.etat.pos);
    const g = el('g', { id: 'comete' }, svg);
    g.style.transitionDuration = '0ms';
    g.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    el('circle', { r: 36, class: 'halo' }, g);
    el('circle', { r: 22, class: 'noyau' }, g);
    // premier contact : une flèche montre le premier geste
    if (!mem.vu && P.mode === 'jour' && P.etape === 0 && !P.seqs[0] && ciel.solution) {
      const d = F.DIRS[ciel.solution[0]];
      const ind = el('g', { id: 'indice' }, svg);
      for (let k = 1; k <= 2; k++) {
        const px = x + d[0] * (30 + 38 * k);
        const py = y + d[1] * (30 + 38 * k);
        const ax = -d[0] * 16;
        const ay = -d[1] * 16;
        el('path', { class: 'indice', d: 'M' + (px + ax - d[1] * 18) + ' ' + (py + ay + d[0] * 18) + 'L' + px + ' ' + py + 'L' + (px + ax + d[1] * 18) + ' ' + (py + ay - d[0] * 18) }, ind);
      }
    }
  }

  function majBandeau() {
    const ciel = P.ciels[P.etape];
    $('t-mode').textContent = P.mode === 'jour' ? t('jour', { n: P.numero }) : t('libre');
    $('t-coups').textContent = t('coups', { c: P.seqs[P.etape].length, i: ciel.ideal });
    const pastilles = $('etapes').children;
    for (let i = 0; i < 3; i++) {
      pastilles[i].className = P.resultats[i] !== undefined ? 'n' + F.note(P.resultats[i], P.ciels[i].ideal) : i === P.etape ? 'ici' : '';
    }
    $('astuce').textContent = !mem.vu && P.mode === 'jour' && P.etape === 0 ? t('astuce') : '';
  }
  function decrire() {
    const ciel = P.ciels[P.etape];
    const reste = ciel.etoiles.length - compter(P.etat.masque);
    $('plateau').setAttribute('aria-label', t('plateau', { e: P.etape + 1, y: Math.floor(P.etat.pos / ciel.n) + 1, x: (P.etat.pos % ciel.n) + 1, r: reste }));
  }
  const compter = (m) => { let n = 0; for (; m; m >>= 1) n += m & 1; return n; };
  const annoncer = (s) => { $('annonce').textContent = ''; setTimeout(() => { $('annonce').textContent = s; }, 30); };

  /* ---------- jouer un coup ---------- */
  function jouer(dir) {
    if (!P || P.cielFini || document.querySelector('dialog[open]')) return;
    if (P.anim) { P.file = dir; return; }
    const ciel = P.ciels[P.etape];
    const avant = P.etat;
    const r = F.jouerCoup(ciel, avant, dir);
    const svg = $('plateau');
    if (!r.bouge) {
      sons.bute();
      annoncer(t('bloque'));
      if (!reduit()) {
        svg.classList.remove('bute-U', 'bute-D', 'bute-L', 'bute-R');
        void svg.getBoundingClientRect();
        svg.classList.add('bute-' + dir);
      }
      return;
    }
    const indice = $('indice');
    if (indice) indice.remove();
    P.etat = { pos: r.pos, masque: r.masque };
    P.seqs[P.etape] += dir;
    P.arrets.push(r.pos);
    if (P.mode === 'jour') sauver();
    const duree = reduit() ? 0 : 45 * r.chemin.length + 50;
    const g = $('comete');
    const [x, y] = centre(ciel, r.pos);
    g.style.transitionDuration = duree + 'ms';
    g.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    sons.glisse(r.chemin.length);
    let dejaPrises = compter(avant.masque);
    r.prises.forEach((c) => {
      const rang = r.chemin.indexOf(c) + 1;
      const numero = dejaPrises++;
      setTimeout(() => {
        const e = $('etoile-' + c);
        if (e) e.classList.add('prise');
        sons.etoile(numero);
        vibrer(15);
      }, (duree * rang) / r.chemin.length);
    });
    P.anim = true;
    setTimeout(() => {
      P.anim = false;
      $('trainee').setAttribute('points', P.arrets.map((c) => centre(ciel, c).join(',')).join(' '));
      majBandeau();
      decrire();
      const reste = ciel.etoiles.length - compter(r.masque);
      if (r.prises.length && !r.fini) annoncer(t('pris', { r: reste }));
      if (r.fini) { finDuCiel(); return; }
      if (P.file) { const d = P.file; P.file = null; jouer(d); }
    }, duree + 15);
  }

  function remplirFinCiel() {
    const ciel = P.ciels[P.etape];
    const coups = P.seqs[P.etape].length;
    const carre = ['\u{1F7E9}', '\u{1F7E8}', '\u{1F7E7}'][F.note(coups, ciel.ideal)];
    $('t-fin-ciel').textContent = carre + ' ' + t('finCiel', { c: coups, i: ciel.ideal });
    $('b-suivant').textContent = P.etape < 2 ? t('suivant') : t('voir');
  }
  function finDuCiel() {
    P.cielFini = true;
    P.file = null;
    P.resultats[P.etape] = P.seqs[P.etape].length;
    if (!mem.vu) mem.vu = true;
    sons.gagne();
    vibrer([20, 40, 30]);
    majBandeau();
    remplirFinCiel();
    $('fin-ciel').hidden = false;
    annoncer($('t-fin-ciel').textContent);
    if (P.etape === 2) {
      P.fini = true;
      if (P.mode === 'jour') {
        const parfait = P.resultats.every((c, i) => c <= P.ciels[i].ideal);
        mem.stats = F.noterJournee(mem.stats, P.cle, parfait);
      }
      sauver();
      setTimeout(montrerResultat, reduit() ? 300 : 900);
    } else {
      sauver();
      $('b-suivant').focus({ preventScroll: true });
    }
  }

  /* ---------- résultat, série, partage ---------- */
  let horloge = null;
  function ouvrir(d) { if (d.open) return; if (d.showModal) d.showModal(); else d.setAttribute('open', ''); }
  function fermer(d) { if (d.close) d.close(); else d.removeAttribute('open'); }
  function montrerResultat() {
    const complet = P.fini;
    const jour = P.mode === 'jour';
    $('t-res-titre').textContent = !complet ? t('stats') : jour ? t('resTitre', { n: P.numero }) : t('resTitreLibre');
    if (complet) {
      const ideaux = P.ciels.map((c) => c.ideal);
      const total = P.resultats.reduce((a, b) => a + b, 0);
      const ideal = ideaux.reduce((a, b) => a + b, 0);
      $('res-carres').textContent = '';
      P.resultats.forEach((c, i) => { const s = document.createElement('span'); s.className = 'n' + F.note(c, ideaux[i]); $('res-carres').appendChild(s); });
      $('res-score').textContent = t('score', { c: total, i: ideal });
      $('res-detail').textContent = total <= ideal ? t('parfait') : t('bien');
    } else {
      $('res-carres').textContent = '';
      $('res-score').textContent = '';
      $('res-detail').textContent = '';
    }
    const s = mem.stats;
    $('v-serie').textContent = F.serieVivante(s, aujourdhui());
    $('v-record').textContent = s.record;
    $('v-joues').textContent = s.joues;
    $('v-parfaits').textContent = s.parfaits;
    $('b-partager').hidden = !(complet && jour);
    $('b-entrainer').textContent = jour ? t('entrainer') : t('nouveau');
    $('zone-partage').hidden = true;
    $('t-copie').textContent = '';
    const tic = () => {
      const m = new Date();
      const minuit = new Date(m.getFullYear(), m.getMonth(), m.getDate() + 1);
      const sec = Math.max(0, Math.floor((minuit - m) / 1000));
      const p = (v) => String(v).padStart(2, '0');
      $('res-prochain').textContent = mem.jours[aujourdhui()] && mem.stats.dernier === aujourdhui()
        ? t('prochain', { t: p(Math.floor(sec / 3600)) + ':' + p(Math.floor((sec % 3600) / 60)) + ':' + p(sec % 60) }) : '';
    };
    tic();
    clearInterval(horloge);
    horloge = setInterval(tic, 1000);
    ouvrir($('d-resultat'));
  }
  $('d-resultat').addEventListener('close', () => clearInterval(horloge));

  function partager() {
    const adresse = /^https?:$/.test(location.protocol) ? location.origin + location.pathname : '';
    const texte = F.textePartage({
      numero: P.numero, coups: P.resultats, ideaux: P.ciels.map((c) => c.ideal),
      serie: F.serieVivante(mem.stats, P.cle), adresse,
    });
    const secours = () => {
      const z = $('zone-partage');
      z.hidden = false;
      z.value = texte;
      z.focus();
      z.select();
      $('t-copie').textContent = t('copieManuelle');
    };
    const copier = () => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texte).then(() => { $('t-copie').textContent = t('copie'); }, secours);
      } else secours();
    };
    const tactile = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (tactile && navigator.share) navigator.share({ text: texte }).catch((e) => { if (!e || e.name !== 'AbortError') copier(); });
    else copier();
  }

  /* ---------- langue ---------- */
  function appliquerLangue() {
    const l = mem.langue;
    document.documentElement.lang = l;
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    const poser = { 't-aide-titre': 'aide', 't-regle1': 'regle1', 't-regle2': 'regle2', 't-regle3': 'regle3', 't-leg0': 'leg0', 't-leg1': 'leg1', 't-leg2': 'leg2',
      't-prive': 'prive', 't-legal': 'legal', 'b-fermer-aide': 'compris', 'b-partager': 'partager', 'b-fermer-res': 'fermer', 'l-serie': 'serie', 'l-record': 'record',
      'l-joues': 'joues', 'l-parfaits': 'parfaits', 'b-annuler': 'annuler', 'b-nouveau': 'nouveau', 'b-retour': 'retour' };
    for (const id in poser) $(id).textContent = t(poser[id]);
    const noms = { 'b-son': 'son', 'b-stats': 'stats', 'b-aide': 'aide', langue: 'langue' };
    for (const id in noms) { $(id).setAttribute('aria-label', t(noms[id])); $(id).title = t(noms[id]); }
    const dirs = { U: 'haut', D: 'bas', L: 'gauche', R: 'droite' };
    document.querySelectorAll('.fleche').forEach((b) => b.setAttribute('aria-label', t(dirs[b.dataset.dir])));
    if (P) { majBandeau(); decrire(); if (P.cielFini) remplirFinCiel(); }
  }

  /* ---------- commandes ---------- */
  const TOUCHES = { ArrowUp: 'U', ArrowDown: 'D', ArrowLeft: 'L', ArrowRight: 'R', w: 'U', s: 'D', a: 'L', d: 'R', z: 'U', q: 'L' };
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
    const d = TOUCHES[e.key] || TOUCHES[e.key.toLowerCase()];
    if (d && !document.querySelector('dialog[open]')) { e.preventDefault(); jouer(d); }
  });
  $('croix').addEventListener('click', (e) => { const b = e.target.closest('.fleche'); if (b) jouer(b.dataset.dir); });

  const cadre = document.querySelector('.plateau-cadre');
  let geste = null;
  cadre.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    geste = { x: e.clientX, y: e.clientY, fait: false };
    try { cadre.setPointerCapture(e.pointerId); } catch (err) { /* sans importance */ }
  });
  // un glissé à la souris ne doit pas sélectionner le texte de la page
  cadre.addEventListener('mousedown', (e) => { if (!e.target.closest('button')) { e.preventDefault(); $('plateau').focus({ preventScroll: true }); } });
  const versDir = (dx, dy) => (Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : dy > 0 ? 'D' : 'U');
  cadre.addEventListener('pointermove', (e) => {
    if (!geste || geste.fait) return;
    const dx = e.clientX - geste.x;
    const dy = e.clientY - geste.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) >= 26) { geste.fait = true; jouer(versDir(dx, dy)); }
  });
  cadre.addEventListener('pointerup', (e) => {
    if (!geste) return;
    const g = geste;
    geste = null;
    if (g.fait || e.target.closest('button')) return;
    // simple toucher : la comète part vers l'endroit touché
    const svg = $('plateau');
    const b = svg.getBoundingClientRect();
    const ciel = P.ciels[P.etape];
    const [cx, cy] = centre(ciel, P.etat.pos);
    const dx = ((e.clientX - b.left) / b.width) * ciel.n * 100 - cx;
    const dy = ((e.clientY - b.top) / b.height) * ciel.n * 100 - cy;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 50) jouer(versDir(dx, dy));
  });
  cadre.addEventListener('pointercancel', () => { geste = null; });

  $('b-suivant').addEventListener('click', () => { if (P.etape < 2) ouvrirCiel(P.etape + 1); else montrerResultat(); });
  $('b-stats').addEventListener('click', montrerResultat);
  $('b-aide').addEventListener('click', () => ouvrir($('d-aide')));
  $('b-fermer-aide').addEventListener('click', () => fermer($('d-aide')));
  $('b-fermer-res').addEventListener('click', () => fermer($('d-resultat')));
  $('b-partager').addEventListener('click', partager);
  $('b-entrainer').addEventListener('click', () => { fermer($('d-resultat')); demarrerLibre(); });
  $('b-nouveau').addEventListener('click', demarrerLibre);
  $('b-retour').addEventListener('click', demarrerJour);
  $('b-annuler').addEventListener('click', () => {
    if (P.mode !== 'libre' || P.anim || !P.seqs[P.etape]) return;
    P.seqs[P.etape] = P.seqs[P.etape].slice(0, -1);
    delete P.resultats[P.etape];
    P.resultats.length = Math.min(P.resultats.length, P.etape);
    P.fini = false;
    ouvrirCiel(P.etape);
  });
  $('b-son').addEventListener('click', () => {
    mem.son = !mem.son;
    $('b-son').setAttribute('aria-pressed', String(mem.son));
    sauver();
    if (mem.son) sons.etoile(2);
  });
  const sel = $('langue');
  for (const code in TX.NOMS) {
    const o = document.createElement('option');
    o.value = code;
    o.textContent = TX.NOMS[code];
    sel.appendChild(o);
  }
  sel.value = mem.langue;
  sel.addEventListener('change', () => { mem.langue = sel.value; sauver(); appliquerLangue(); });

  // à minuit, ou au retour sur l'onglet un autre jour : nouveau ciel
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && P && P.mode === 'jour' && P.cle !== aujourdhui()) { fermer($('d-resultat')); demarrerJour(); }
  });

  $('b-son').setAttribute('aria-pressed', String(mem.son));
  appliquerLangue();
  demarrerJour();
  appliquerLangue();

  // hors ligne : uniquement quand le jeu est servi par un site (pas en double-cliquant le fichier)
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => { /* le jeu marche sans */ });
  }
  window.__filante = { etat: () => P, jouer }; // utile aux contrôles à l'écran, sans effet pour le joueur
})();
