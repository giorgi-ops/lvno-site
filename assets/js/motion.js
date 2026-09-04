/* ==========================================================================
   LVNO — couches de mouvement pilotées par script
     · signature de marque à l'ouverture, et atterrissage du sigle dans l'en-tête
     · découpage par mots des titres de section
   La révélation du hero, elle, est entièrement en CSS : ce fichier peut
   échouer sans jamais laisser de contenu invisible.
   ========================================================================== */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  /* ------------------------------------------- Signature à l'ouverture */
  if (root.classList.contains('intro-pending')) {
    // Marqué dès maintenant : un rechargement en cours d'intro ne la rejoue pas.
    try { sessionStorage.setItem('lvno-intro', '1'); } catch (e) { /* mode privé */ }

    var intro = document.createElement('div');
    intro.className = 'intro';
    intro.setAttribute('aria-hidden', 'true');
    intro.innerHTML =
      '<div class="intro-in">' +
        '<span class="intro-mark mark"></span>' +
        '<span class="intro-word">LVNO</span>' +
        '<span class="intro-bar"><i></i></span>' +
      '</div>';
    document.body.appendChild(intro);

    var introMark = intro.querySelector('.intro-mark');
    var headerMark = document.querySelector('.hdr .wordmark .mark');

    var leave = function () {
      // Cible mesurée sur le sigle de l'en-tête : il atterrit exactement à sa
      // place, au lieu d'un décalage approximatif en unités de fenêtre.
      if (introMark && headerMark) {
        var a = introMark.getBoundingClientRect();
        var b = headerMark.getBoundingClientRect();
        if (a.width && b.width) {
          introMark.style.setProperty('--ts', (b.width / a.width).toFixed(4));
          introMark.style.setProperty('--tx',
            Math.round((b.left + b.width / 2) - (a.left + a.width / 2)) + 'px');
          introMark.style.setProperty('--ty',
            Math.round((b.top + b.height / 2) - (a.top + a.height / 2)) + 'px');
        }
      }
      intro.classList.add('is-leaving');
    };

    var finish = function () {
      intro.classList.add('is-done');
      root.classList.remove('intro-pending');
      setTimeout(function () {
        if (intro.parentNode) { intro.parentNode.removeChild(intro); }
      }, 700);
    };

    var tLeave = setTimeout(leave, 1120);
    var tDone = setTimeout(finish, 1560);

    // Le visiteur peut abréger : toute action passe directement à la sortie.
    ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) {
      window.addEventListener(ev, function () {
        clearTimeout(tLeave); clearTimeout(tDone);
        leave(); setTimeout(finish, 280);
      }, { once: true, passive: true });
    });
  }

  /* ------------------------------------ Titres de section, mot par mot */
  var titles = Array.prototype.slice.call(document.querySelectorAll('.h2'));
  if (reduce || !('IntersectionObserver' in window) || !titles.length) { return; }

  // On ne touche qu'aux nœuds texte : la structure, <br> compris, est
  // préservée, et le titre reste lu d'un seul tenant.
  var split = function (node) {
    Array.prototype.slice.call(node.childNodes).forEach(function (n) {
      if (n.nodeType === 3) {
        if (!n.nodeValue.trim()) { return; }
        var frag = document.createDocumentFragment();
        n.nodeValue.split(/(\s+)/).forEach(function (part) {
          if (!part) { return; }
          if (!part.trim()) { frag.appendChild(document.createTextNode(part)); return; }
          var wr = document.createElement('span'); wr.className = 'wr';
          var wi = document.createElement('span'); wi.className = 'wi';
          wi.textContent = part;
          wr.appendChild(wi);
          frag.appendChild(wr);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') {
        split(n);
      }
    });
  };

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) { return; }
      e.target.classList.add('is-lit');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 });

  titles.forEach(function (t) {
    // Un titre déjà à l'écran ne doit pas clignoter : on le laisse tel quel.
    if (t.getBoundingClientRect().top < window.innerHeight) {
      t.classList.add('is-lit');
      return;
    }
    split(t);
    Array.prototype.slice.call(t.querySelectorAll('.wi')).forEach(function (wi, i) {
      wi.style.setProperty('--i', i);
    });
    io.observe(t);
  });
})();
