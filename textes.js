/* Filante — textes de l'interface en six langues. Le plateau lui-même ne contient aucun mot. */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else racine.FilanteTextes = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const NOMS = { fr: 'Français', en: 'English', nl: 'Nederlands', es: 'Español', de: 'Deutsch', ar: 'العربية' };
  const T = {
    fr: {
      jour: 'Ciel du jour n° {n}', libre: 'Entraînement', coups: 'Glissades {c} · idéal {i}',
      astuce: 'Glisse : la comète file jusqu’au rocher. Attrape toutes les étoiles.',
      finCiel: '{c} glissades · idéal {i}', suivant: 'Ciel suivant', voir: 'Voir mon résultat',
      resTitre: 'Ciel du jour n° {n}', resTitreLibre: 'Entraînement terminé', parfait: 'Parcours parfait !',
      bien: 'Bien joué !', score: '{c} glissades · idéal {i}', partager: 'Partager', copie: 'Résultat copié. Colle-le où tu veux.',
      copieManuelle: 'Copie ce texte :', entrainer: 'S’entraîner', fermer: 'Fermer', serie: 'Série de jours', record: 'Record',
      joues: 'Jours joués', parfaits: 'Jours parfaits', prochain: 'Prochain ciel dans {t}', aide: 'Comment jouer',
      regle1: 'Glisse le doigt (ou utilise les flèches) : la comète file tout droit jusqu’au prochain rocher ou au bord.',
      regle2: 'Attrape toutes les étoiles en un minimum de glissades.',
      regle3: 'Trois ciels par jour, les mêmes pour le monde entier. Reviens demain pour garder ta série.',
      leg0: 'parcours idéal', leg1: 'une ou deux glissades de trop', leg2: 'trois glissades de trop ou plus',
      prive: 'Gratuit, sans publicité, sans compte. Rien ne quitte ton appareil : aucun traceur, aucune collecte.',
      compris: 'Jouer', son: 'Son', stats: 'Mes résultats', langue: 'Langue', annuler: 'Annuler', nouveau: 'Nouveaux ciels',
      retour: 'Ciel du jour', haut: 'Haut', bas: 'Bas', gauche: 'Gauche', droite: 'Droite',
      plateau: 'Ciel {e} sur 3. Comète ligne {y}, colonne {x}. Étoiles restantes : {r}.', pris: 'Étoile attrapée. Reste {r}.',
      legal: 'Mentions légales et confidentialité', bloque: 'Bloqué.', dejaJoue: 'Déjà joué aujourd’hui',
    },
    en: {
      jour: 'Daily sky #{n}', libre: 'Practice', coups: 'Swipes {c} · best {i}',
      astuce: 'Swipe: the comet flies until it hits a rock. Catch every star.',
      finCiel: '{c} swipes · best {i}', suivant: 'Next sky', voir: 'See my result',
      resTitre: 'Daily sky #{n}', resTitreLibre: 'Practice complete', parfait: 'Perfect run!',
      bien: 'Well played!', score: '{c} swipes · best {i}', partager: 'Share', copie: 'Result copied. Paste it anywhere.',
      copieManuelle: 'Copy this text:', entrainer: 'Practice', fermer: 'Close', serie: 'Day streak', record: 'Best streak',
      joues: 'Days played', parfaits: 'Perfect days', prochain: 'Next sky in {t}', aide: 'How to play',
      regle1: 'Swipe (or use the arrows): the comet flies straight until the next rock or the edge.',
      regle2: 'Catch every star in as few swipes as you can.',
      regle3: 'Three skies a day, the same for everyone in the world. Come back tomorrow to keep your streak.',
      leg0: 'best possible path', leg1: 'one or two extra swipes', leg2: 'three or more extra swipes',
      prive: 'Free, no ads, no account. Nothing leaves your device: no trackers, no data collection.',
      compris: 'Play', son: 'Sound', stats: 'My results', langue: 'Language', annuler: 'Undo', nouveau: 'New skies',
      retour: 'Daily sky', haut: 'Up', bas: 'Down', gauche: 'Left', droite: 'Right',
      plateau: 'Sky {e} of 3. Comet at row {y}, column {x}. Stars left: {r}.', pris: 'Star caught. {r} left.',
      legal: 'Legal notice and privacy', bloque: 'Blocked.', dejaJoue: 'Already played today',
    },
    nl: {
      jour: 'Hemel van de dag nr. {n}', libre: 'Oefenen', coups: 'Vegen {c} · ideaal {i}',
      astuce: 'Veeg: de komeet vliegt door tot aan een rots. Vang alle sterren.',
      finCiel: '{c} vegen · ideaal {i}', suivant: 'Volgende hemel', voir: 'Mijn resultaat',
      resTitre: 'Hemel van de dag nr. {n}', resTitreLibre: 'Oefening klaar', parfait: 'Perfecte route!',
      bien: 'Goed gespeeld!', score: '{c} vegen · ideaal {i}', partager: 'Delen', copie: 'Resultaat gekopieerd. Plak het waar je wilt.',
      copieManuelle: 'Kopieer deze tekst:', entrainer: 'Oefenen', fermer: 'Sluiten', serie: 'Dagen op rij', record: 'Record',
      joues: 'Dagen gespeeld', parfaits: 'Perfecte dagen', prochain: 'Volgende hemel over {t}', aide: 'Zo speel je',
      regle1: 'Veeg met je vinger (of gebruik de pijlen): de komeet vliegt rechtdoor tot de volgende rots of de rand.',
      regle2: 'Vang alle sterren in zo weinig mogelijk vegen.',
      regle3: 'Drie hemels per dag, dezelfde voor de hele wereld. Kom morgen terug om je reeks te houden.',
      leg0: 'ideale route', leg1: 'één of twee vegen te veel', leg2: 'drie of meer vegen te veel',
      prive: 'Gratis, zonder reclame, zonder account. Niets verlaat je toestel: geen trackers, geen gegevens.',
      compris: 'Spelen', son: 'Geluid', stats: 'Mijn resultaten', langue: 'Taal', annuler: 'Ongedaan maken', nouveau: 'Nieuwe hemels',
      retour: 'Hemel van de dag', haut: 'Omhoog', bas: 'Omlaag', gauche: 'Links', droite: 'Rechts',
      plateau: 'Hemel {e} van 3. Komeet op rij {y}, kolom {x}. Sterren over: {r}.', pris: 'Ster gevangen. Nog {r}.',
      legal: 'Wettelijke vermeldingen en privacy', bloque: 'Geblokkeerd.', dejaJoue: 'Vandaag al gespeeld',
    },
    es: {
      jour: 'Cielo del día n.º {n}', libre: 'Práctica', coups: 'Deslices {c} · ideal {i}',
      astuce: 'Desliza: el cometa vuela hasta chocar con una roca. Atrapa todas las estrellas.',
      finCiel: '{c} deslices · ideal {i}', suivant: 'Siguiente cielo', voir: 'Ver mi resultado',
      resTitre: 'Cielo del día n.º {n}', resTitreLibre: 'Práctica terminada', parfait: '¡Recorrido perfecto!',
      bien: '¡Bien jugado!', score: '{c} deslices · ideal {i}', partager: 'Compartir', copie: 'Resultado copiado. Pégalo donde quieras.',
      copieManuelle: 'Copia este texto:', entrainer: 'Practicar', fermer: 'Cerrar', serie: 'Racha de días', record: 'Récord',
      joues: 'Días jugados', parfaits: 'Días perfectos', prochain: 'Próximo cielo en {t}', aide: 'Cómo jugar',
      regle1: 'Desliza el dedo (o usa las flechas): el cometa vuela en línea recta hasta la siguiente roca o el borde.',
      regle2: 'Atrapa todas las estrellas con el menor número de deslices.',
      regle3: 'Tres cielos al día, los mismos para todo el mundo. Vuelve mañana para mantener tu racha.',
      leg0: 'recorrido ideal', leg1: 'uno o dos deslices de más', leg2: 'tres o más deslices de más',
      prive: 'Gratis, sin anuncios, sin cuenta. Nada sale de tu dispositivo: sin rastreadores, sin recogida de datos.',
      compris: 'Jugar', son: 'Sonido', stats: 'Mis resultados', langue: 'Idioma', annuler: 'Deshacer', nouveau: 'Nuevos cielos',
      retour: 'Cielo del día', haut: 'Arriba', bas: 'Abajo', gauche: 'Izquierda', droite: 'Derecha',
      plateau: 'Cielo {e} de 3. Cometa en fila {y}, columna {x}. Estrellas restantes: {r}.', pris: 'Estrella atrapada. Quedan {r}.',
      legal: 'Aviso legal y privacidad', bloque: 'Bloqueado.', dejaJoue: 'Ya jugado hoy',
    },
    de: {
      jour: 'Himmel des Tages Nr. {n}', libre: 'Üben', coups: 'Züge {c} · ideal {i}',
      astuce: 'Wische: Der Komet fliegt bis zum nächsten Felsen. Fang alle Sterne.',
      finCiel: '{c} Züge · ideal {i}', suivant: 'Nächster Himmel', voir: 'Mein Ergebnis',
      resTitre: 'Himmel des Tages Nr. {n}', resTitreLibre: 'Übung beendet', parfait: 'Perfekter Weg!',
      bien: 'Gut gespielt!', score: '{c} Züge · ideal {i}', partager: 'Teilen', copie: 'Ergebnis kopiert. Füge es ein, wo du willst.',
      copieManuelle: 'Kopiere diesen Text:', entrainer: 'Üben', fermer: 'Schließen', serie: 'Tage in Folge', record: 'Rekord',
      joues: 'Gespielte Tage', parfaits: 'Perfekte Tage', prochain: 'Nächster Himmel in {t}', aide: 'So wird gespielt',
      regle1: 'Wische mit dem Finger (oder nutze die Pfeile): Der Komet fliegt geradeaus bis zum nächsten Felsen oder zum Rand.',
      regle2: 'Fang alle Sterne mit möglichst wenigen Zügen.',
      regle3: 'Drei Himmel pro Tag, für die ganze Welt dieselben. Komm morgen wieder, um deine Serie zu halten.',
      leg0: 'idealer Weg', leg1: 'ein oder zwei Züge zu viel', leg2: 'drei oder mehr Züge zu viel',
      prive: 'Kostenlos, ohne Werbung, ohne Konto. Nichts verlässt dein Gerät: keine Tracker, keine Datenerfassung.',
      compris: 'Spielen', son: 'Ton', stats: 'Meine Ergebnisse', langue: 'Sprache', annuler: 'Rückgängig', nouveau: 'Neue Himmel',
      retour: 'Himmel des Tages', haut: 'Hoch', bas: 'Runter', gauche: 'Links', droite: 'Rechts',
      plateau: 'Himmel {e} von 3. Komet in Zeile {y}, Spalte {x}. Verbleibende Sterne: {r}.', pris: 'Stern gefangen. Noch {r}.',
      legal: 'Impressum und Datenschutz', bloque: 'Blockiert.', dejaJoue: 'Heute schon gespielt',
    },
    ar: {
      jour: 'سماء اليوم رقم {n}', libre: 'تدريب', coups: 'الحركات {c} · الأمثل {i}',
      astuce: 'اسحب: ينطلق المذنّب حتى يصطدم بصخرة. اجمع كل النجوم.',
      finCiel: '{c} حركات · الأمثل {i}', suivant: 'السماء التالية', voir: 'عرض نتيجتي',
      resTitre: 'سماء اليوم رقم {n}', resTitreLibre: 'انتهى التدريب', parfait: 'مسار مثالي!',
      bien: 'أحسنت!', score: '{c} حركات · الأمثل {i}', partager: 'مشاركة', copie: 'تم نسخ النتيجة. الصقها أينما تريد.',
      copieManuelle: 'انسخ هذا النص:', entrainer: 'تدرّب', fermer: 'إغلاق', serie: 'أيام متتالية', record: 'أفضل سلسلة',
      joues: 'أيام اللعب', parfaits: 'أيام مثالية', prochain: 'السماء القادمة بعد {t}', aide: 'طريقة اللعب',
      regle1: 'اسحب بإصبعك (أو استعمل الأسهم): ينطلق المذنّب في خط مستقيم حتى الصخرة التالية أو الحافة.',
      regle2: 'اجمع كل النجوم بأقل عدد ممكن من الحركات.',
      regle3: 'ثلاث سماوات كل يوم، وهي نفسها للعالم كله. عُد غدًا لتحافظ على سلسلتك.',
      leg0: 'المسار الأمثل', leg1: 'حركة أو حركتان زائدتان', leg2: 'ثلاث حركات زائدة أو أكثر',
      prive: 'مجاني، بلا إعلانات، بلا حساب. لا شيء يغادر جهازك: لا تتبّع ولا جمع بيانات.',
      compris: 'العب', son: 'الصوت', stats: 'نتائجي', langue: 'اللغة', annuler: 'تراجع', nouveau: 'سماوات جديدة',
      retour: 'سماء اليوم', haut: 'أعلى', bas: 'أسفل', gauche: 'يسار', droite: 'يمين',
      plateau: 'السماء {e} من 3. المذنّب في الصف {y}، العمود {x}. النجوم المتبقية: {r}.', pris: 'التقطت نجمة. بقي {r}.',
      legal: 'البيانات القانونية والخصوصية', bloque: 'مسدود.', dejaJoue: 'لعبت اليوم',
    },
  };
  function choisir(preferees) {
    for (const l of preferees || []) {
      const c = String(l).toLowerCase().slice(0, 2);
      if (T[c]) return c;
    }
    return 'en';
  }
  function texte(langue, cle, valeurs) {
    let s = (T[langue] && T[langue][cle]) || T.en[cle] || cle;
    for (const k in valeurs || {}) s = s.split('{' + k + '}').join(valeurs[k]);
    return s;
  }
  return { NOMS, T, choisir, texte };
});
