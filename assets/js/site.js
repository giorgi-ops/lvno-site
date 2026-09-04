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

  /* ------------------------------------------------------- Menu mobile */
  var toggle = $('[data-nav-toggle]');
  var nav = $('[data-nav]');

  if (toggle && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
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
  var EMAIL = 'contact@lvno.fr';

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

  var readError = function (data) {
    if (data && data.errors && data.errors.length) {
      return data.errors.map(function (x) { return x.message; }).join(' ');
    }
    return '';
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var invalid = validate();
    if (invalid) {
      say('Merci de compléter les champs signalés.', 'error');
      invalid.focus();
      return;
    }

    if (!isConfigured()) {
      say('Formulaire non configuré : renseignez votre URL Formspree dans l’attribut ' +
          'action du formulaire. En attendant, écrivez à ' + EMAIL + '.', 'error');
      return;
    }

    if (submit) {
      submit.disabled = true;
      if (label) { label.textContent = 'Envoi en cours…'; }
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
          function (data) { throw new Error(readError(data)); },
          function () { throw new Error(''); }
        );
      })
      .then(function () {
        form.classList.add('form-sent');
        say('Message envoyé. Réponse sous 24 heures ouvrées.', 'ok');
      })
      .catch(function (err) {
        say(err.message || ('L’envoi a échoué. Merci de réessayer ou d’écrire à ' + EMAIL + '.'), 'error');
        if (submit) {
          submit.disabled = false;
          if (label) { label.textContent = labelText; }
        }
      });
  });
})();
