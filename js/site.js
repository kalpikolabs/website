/* Kalpiko Labs — site.js
   Scope: mobile menu (focus-trapped overlay) + orbit animation only. */
(function () {
  'use strict';

  /* ---- Mobile menu -------------------------------------------------- */
  var toggle = document.querySelector('[data-nav-toggle]');
  var overlay = document.querySelector('[data-nav-overlay]');
  var closeBtn = document.querySelector('[data-nav-close]');

  if (toggle && overlay) {
    var lastFocused = null;

    var focusable = function () {
      return overlay.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
    };

    var open = function () {
      lastFocused = document.activeElement;
      overlay.classList.add('is-open');
      overlay.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      var items = focusable();
      if (items.length) items[0].focus();
      document.addEventListener('keydown', onKeydown);
    };

    var close = function () {
      overlay.classList.remove('is-open');
      overlay.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeydown);
      if (lastFocused) lastFocused.focus();
    };

    var onKeydown = function (e) {
      if (e.key === 'Escape') { close(); return; }
      if (e.key !== 'Tab') return;
      var items = focusable();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    toggle.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target.matches('[data-nav-overlay] a')) close();
    });
  }

  /* ---- Header scroll state (transparent over hero -> solid) --------- */
  var header = document.querySelector('[data-header]');
  if (header && document.body.classList.contains('has-hero')) {
    var threshold = function () { return window.innerHeight * 0.6; };
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > threshold());
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---- Data-driven app content (data/apps.json) --------------------- *
   * Renders the landing grid, footer Apps/Legal columns, the support
   * app-links row, and each app detail page — all from one JSON file.
   * NOTE: privacy/terms BODIES are static HTML and are never touched here;
   * those pages carry no data-* render hooks, so nothing is JS-rendered
   * on them beyond the shared footer nav (which has a static fallback). */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var hooks = '[data-apps-grid],[data-footer-apps],[data-footer-legal],' +
              '[data-support-applinks],[data-app-detail]';
  if (document.querySelector(hooks)) {
    fetch('/data/apps.json')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        var apps = (data && data.apps) || [];
        renderFooter(apps);
        renderGrid(apps);
        renderSupport(apps);
        renderDetail(apps);
        renderAppSelect(apps);
      })
      .catch(function () { /* network/parse error: static fallbacks remain */ });
  }

  function renderAppSelect(apps) {
    var sel = document.querySelector('[data-app-select]');
    if (!sel) return;
    apps.forEach(function (p) {
      var o = document.createElement('option');
      o.value = p.name;       // textContent/value set via DOM API = auto-escaped
      o.textContent = p.name;
      sel.appendChild(o);
    });
  }

  function actionsInner(p) {
    if (p.status === 'live') {
      var h = '';
      if (p.appstore_url) {
        h += '<a href="' + esc(p.appstore_url) + '"><img src="/assets/badge-app-store.svg" alt="Download ' +
             esc(p.name) + ' on the App Store" width="160" height="52" loading="lazy"></a>';
      }
      if (p.playstore_url) {
        h += '<a href="' + esc(p.playstore_url) + '"><img src="/assets/badge-google-play.svg" alt="Get ' +
             esc(p.name) + ' on Google Play" width="180" height="52" loading="lazy"></a>';
      }
      return h;
    }
    var eta = p.eta ? ' <span class="app-eta">' + esc(p.eta) + '</span>' : '';
    return '<span class="pill pill--soon">Coming soon</span>' + eta;
  }

  function renderFooter(apps) {
    var a = document.querySelector('[data-footer-apps]');
    if (a) {
      a.innerHTML = apps.map(function (p) {
        return '<li><a href="/apps/' + esc(p.slug) + '/">' + esc(p.name) + '</a></li>';
      }).join('');
    }
    var l = document.querySelector('[data-footer-legal]');
    if (l) {
      l.innerHTML = apps.map(function (p) {
        var base = '/apps/' + esc(p.slug) + '/';
        return '<li><a href="' + base + 'privacy/">' + esc(p.name) + ' — Privacy</a></li>' +
               '<li><a href="' + base + 'terms/">' + esc(p.name) + ' — Terms</a></li>';
      }).join('');
    }
  }

  function renderGrid(apps) {
    var g = document.querySelector('[data-apps-grid]');
    if (!g) return;
    g.innerHTML = apps.map(function (p) {
      return '<article class="card app-card">' +
        '<img class="app-card__icon" src="' + esc(p.icon) + '" alt="" width="64" height="64" ' +
        'onerror="this.onerror=null;this.src=\'/assets/app-placeholder-icon.svg\'">' +
        '<h4 class="app-card__name"><a href="/apps/' + esc(p.slug) + '/">' + esc(p.name) + '</a></h4>' +
        '<p class="app-card__desc">' + esc(p.description) + '</p>' +
        '<div class="app-card__actions">' + actionsInner(p) + '</div>' +
        '</article>';
    }).join('');
  }

  function renderSupport(apps) {
    var s = document.querySelector('[data-support-applinks]');
    if (!s) return;
    if (!apps.length) {
      s.innerHTML = '<p class="legal-links__empty">No apps have shipped yet. Privacy policies and ' +
        'terms will be listed here as each app launches — and are always linked inside the app itself.</p>';
      return;
    }
    s.innerHTML = apps.map(function (p) {
      var base = '/apps/' + esc(p.slug) + '/';
      return '<div class="legal-links__app">' +
        '<span class="legal-links__name">' + esc(p.name) + '</span>' +
        '<a href="' + base + 'privacy/">Privacy Policy</a>' +
        '<a href="' + base + 'terms/">Terms of Use</a></div>';
    }).join('');
  }

  /* ---- Contact form (no backend — relays via Web3Forms) ------------- */
  var cform = document.querySelector('[data-contact-form]');
  if (cform) {
    var submitBtn = cform.querySelector('[data-cform-submit]');
    var errorEl = cform.querySelector('[data-cform-error]');
    var successEl = document.querySelector('[data-cform-success]');

    var showError = function () {
      if (errorEl) errorEl.hidden = false;
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Send message'; }
    };
    var showSuccess = function () {
      cform.hidden = true;
      if (successEl) { successEl.hidden = false; successEl.focus(); }
    };

    cform.addEventListener('submit', function (e) {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;

      // Honeypot: a real person never checks this. Pretend success, send nothing.
      if (cform.botcheck && cform.botcheck.checked) { showSuccess(); return; }

      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending…'; }

      var payload = {};
      new FormData(cform).forEach(function (v, k) { payload[k] = v; });

      fetch(cform.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) { if (data && data.success) showSuccess(); else showError(); })
        .catch(showError);
    });
  }

  function renderDetail(apps) {
    var root = document.querySelector('[data-app-detail]');
    if (!root) return;
    var slug = root.getAttribute('data-slug');
    var p = null;
    for (var i = 0; i < apps.length; i++) { if (apps[i].slug === slug) { p = apps[i]; break; } }
    if (!p) return;

    var icon = root.querySelector('[data-app-icon]');
    if (icon) { icon.src = p.icon; }
    var name = root.querySelector('[data-app-name]');
    if (name) { name.textContent = p.name; }
    var tag = root.querySelector('[data-app-tagline]');
    if (tag) { tag.textContent = p.tagline; }
    var act = root.querySelector('[data-app-actions]');
    if (act) { act.innerHTML = actionsInner(p); }

    var feats = root.querySelector('[data-app-features]');
    if (feats) {
      feats.innerHTML = (p.features || []).map(function (f) {
        return '<article class="card feature">' +
          '<span class="feature__icon" aria-hidden="true">' + esc(f.icon) + '</span>' +
          '<h5>' + esc(f.title) + '</h5><p>' + esc(f.text) + '</p></article>';
      }).join('');
    }
    var shots = root.querySelector('[data-app-shots]');
    if (shots) {
      shots.innerHTML = (p.screenshots || []).map(function (src, i) {
        return '<img class="shot" src="' + esc(src) + '" alt="' + esc(p.name) +
          ' screenshot ' + (i + 1) + '" width="270" height="585" loading="lazy">';
      }).join('');
    }
  }
})();
