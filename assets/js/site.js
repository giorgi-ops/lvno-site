/* ==========================================================================
   LVNO — comportements communs aux trois directions
   Pilotage par attributs data-* pour rester indépendant du balisage.
   Aucune dépendance externe.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ------------------------------------------------------------- Année */
  $$('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ------------------------------------------ Choix de langue mémorisé */
  // Enregistré au clic seulement, et pour la durée de la session. Il n'y a
  // aucune détection de la langue du navigateur dans ce site : la racine est
  // anglaise pour tout le monde, et seul un clic explicite sur FR fait
  // basculer les pages consultées ensuite pendant la visite.
  $$('[data-lang]').forEach(function (el) {
    el.addEventListener('click', function () {
      try {
        sessionStorage.setItem('lvno-lang', el.getAttribute('data-lang'));
      } catch (e) { /* stockage indisponible : sans effet */ }
    });
  });

  /* -------------------------------------------- En-tête au défilement */
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------- Barre de progression de lecture */
  var progress = $('[data-progress]');
  if (progress) {
    var onProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.setProperty('--p', max > 0 ? (window.scrollY / max) : 0);
    };
    onProgress();
    window.addEventListener('scroll', onProgress, { passive: true });
    window.addEventListener('resize', onProgress);
  }

  /* --------------------------------------------------- Bouton remontée */
  var toTop = $('[data-to-top]');
  if (toTop) {
    var onToTop = function () {
      toTop.classList.toggle('is-shown', window.scrollY > window.innerHeight * 0.8);
    };
    onToTop();
    window.addEventListener('scroll', onToTop, { passive: true });
    window.addEventListener('resize', onToTop);

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      // Ramener le focus en tête de document, sinon la tabulation reprendrait
      // en bas de page après la remontée.
      var brand = document.querySelector('.wordmark');
      if (brand) { brand.focus({ preventScroll: true }); }
    });
  }

  /* ------------------------------------------------------- Menu mobile */
  var toggle = $('[data-nav-toggle]');
  var nav = $('[data-nav]');

  if (toggle && nav) {
    var labelOpen = toggle.getAttribute('data-label-open') || 'Menu';
    var labelClose = toggle.getAttribute('data-label-close') || labelOpen;

    var setMenu = function (open) {
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? labelClose : labelOpen);
    };

    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { setMenu(false); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { setMenu(false); }
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 900) { setMenu(false); }
    });
  }

  /* ----------------------------------------- Apparition au défilement */
  var revealables = $$('.reveal');
  revealables.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) { el.style.setProperty('--d', d); }
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.06 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------ Section active dans la navigation */
  var navLinks = $$('[data-nav] a[href^="#"]');
  var sections = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) { return; }
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* -------------------------------------------- Compteurs au défilement */
  var counters = $$('[data-count-to]');
  if (counters.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = el.getAttribute('data-count-to'); });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          cio.unobserve(entry.target);
          var el = entry.target;
          var target = parseFloat(el.getAttribute('data-count-to'));
          var t0 = null;
          var tick = function (ts) {
            if (!t0) { t0 = ts; }
            var k = Math.min(1, (ts - t0) / 1100);
            var eased = 1 - Math.pow(1 - k, 3);
            el.textContent = Math.round(target * eased);
            if (k < 1) { requestAnimationFrame(tick); }
          };
          requestAnimationFrame(tick);
        });
      }, { threshold: 0.6 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* --------------------------------------------- Formulaire de contact */
  var form = $('[data-form]');
  if (!form) { return; }

  var status = $('[data-status]', form);
  var submit = $('[data-submit]', form);
  var label = submit ? $('.btn-label', submit) : null;
  var labelText = label ? label.textContent : '';

  // Les libellés viennent du balisage : le script reste indépendant de la langue.
  var msg = function (name) { return form.getAttribute('data-msg-' + name) || ''; };

  var say = function (message, kind) {
    if (!status) { return; }
    status.textContent = message;
    status.className = 'form-status' + (kind ? ' is-' + kind : '');
  };

  var isConfigured = function () {
    return form.action.indexOf('formspree.io/f/') !== -1 &&
           form.action.indexOf('REMPLACER_PAR_VOTRE_ID') === -1;
  };

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.checkValidity()) {
      e.target.removeAttribute('aria-invalid');
    }
  });

  var validate = function () {
    var first = null;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.type === 'hidden' || el.type === 'submit') { return; }
      if (el.checkValidity()) {
        el.removeAttribute('aria-invalid');
      } else {
        el.setAttribute('aria-invalid', 'true');
        if (!first) { first = el; }
      }
    });
    return first;
  };

  var fail = function (data, status) {
    var err = new Error('form submission failed');
    err.fieldErrors = (data && data.errors) || [];
    err.detail = (data && data.error) || '';
    err.status = status || 0;
    return err;
  };

  // Retour après un envoi classique — bascule captcha, ou visiteur dont le
  // JavaScript n'était pas actif au moment de l'envoi. Formspree renvoie ici
  // avec ?sent=1#contact grâce au champ _next.
  if (/[?&]sent=1(&|$)/.test(window.location.search)) {
    form.classList.add('form-sent');
    say(msg('ok'), 'ok');
    if (window.history && window.history.replaceState) {
      // On nettoie l'URL : rechargée telle quelle, elle rejouerait le message.
      window.history.replaceState(null, '', window.location.pathname + window.location.hash);
    }
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var invalid = validate();
    if (invalid) {
      say(msg('invalid'), 'error');
      invalid.focus();
      return;
    }

    if (!isConfigured()) {
      say(msg('unset'), 'error');
      return;
    }

    if (submit) {
      submit.disabled = true;
      if (label && msg('sending')) { label.textContent = msg('sending'); }
    }
    say('');

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (res.ok) { return res.json().catch(function () { return {}; }); }
        return res.json().then(
          function (data) { throw fail(data, res.status); },
          function () { throw fail(null, res.status); }
        );
      })
      .then(function () {
        form.classList.add('form-sent');
        say(msg('ok'), 'ok');
      })
      .catch(function (err) {
        // Formspree renvoie 403 quand un captcha est actif sans clé
        // personnalisée : l'AJAX est alors refusé par principe. Plutôt que de
        // perdre le message, on repasse en envoi de formulaire classique. Le
        // visiteur voit la vérification anti-spam de Formspree, puis revient
        // ici grâce au champ _next. form.submit() ne redéclenche pas cet
        // écouteur, il n'y a donc pas de boucle.
        if (err && err.status === 403 && /AJAX/i.test(err.detail || '')) {
          if (window.console) {
            console.warn('Formspree : ' + err.detail + ' — bascule en envoi classique.');
          }
          say(msg('sending'), '');
          form.submit();
          return;
        }

        var list = (err && err.fieldErrors) || [];

        // Formspree renvoie ses libellés de validation en anglais quel que soit
        // _language : on affiche donc notre message localisé et on garde le
        // détail technique pour la console.
        list.forEach(function (e) {
          var el = e.field && form.elements[e.field];
          if (el && el.setAttribute) { el.setAttribute('aria-invalid', 'true'); }
        });
        if (list.length && window.console) {
          console.warn('Formspree : ' + list.map(function (e) {
            return (e.field || '?') + ' — ' + e.message;
          }).join(' | '));
        }

        say(msg('error'), 'error');
        if (submit) {
          submit.disabled = false;
          if (label) { label.textContent = labelText; }
        }
      });
  });
})();
