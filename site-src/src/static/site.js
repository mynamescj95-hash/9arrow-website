/* 9 Arrow Land Service, site behavior. No dependencies. Every block is guarded by the element it needs. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollers = [];
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
  function c01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ---------- desktop dropdowns ---------- */
  var items = $$('.nav-item[data-drop]'), closeT;
  function closeAll(except) { items.forEach(function (it) { if (it !== except) { it.classList.remove('is-open'); var b = $('.nav-top', it); if (b) b.setAttribute('aria-expanded', 'false'); } }); }
  items.forEach(function (it) {
    var btn = $('.nav-top', it);
    btn.addEventListener('click', function (e) { e.preventDefault(); var open = !it.classList.contains('is-open'); closeAll(); it.classList.toggle('is-open', open); btn.setAttribute('aria-expanded', open); });
    it.addEventListener('mouseenter', function () { if (matchMedia('(hover:hover)').matches) { clearTimeout(closeT); closeAll(it); it.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); } });
    it.addEventListener('mouseleave', function () { if (matchMedia('(hover:hover)').matches) { closeT = setTimeout(function () { it.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }, 160); } });
  });
  d.addEventListener('click', function (e) { if (!e.target.closest('.nav-item')) closeAll(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeAll(); closeSheet(); } });

  /* ---------- mobile menu sheet ---------- */
  var sheet = $('#sheet'), menuBtn = $('#menu-btn');
  function openSheet() { if (!sheet) return; sheet.classList.add('is-open'); sheet.removeAttribute('inert'); menuBtn.setAttribute('aria-expanded', 'true'); d.body.style.overflow = 'hidden'; var f = $('summary,a,button', sheet); if (f) f.focus(); }
  function closeSheet() { if (!sheet || !sheet.classList.contains('is-open')) return; sheet.classList.remove('is-open'); sheet.setAttribute('inert', ''); menuBtn.setAttribute('aria-expanded', 'false'); d.body.style.overflow = ''; menuBtn.focus(); }
  if (menuBtn) menuBtn.addEventListener('click', openSheet);
  var sc = $('#sheet-close'); if (sc) sc.addEventListener('click', closeSheet);
  if (sheet) $$('a', sheet).forEach(function (a) { a.addEventListener('click', closeSheet); });

  /* ---------- mobile action bar hides over the estimate form and footer ---------- */
  var mbar = $('.mbar');
  if (mbar && 'IntersectionObserver' in window) {
    var hideOn = $$('.est-form, .ft'), vis = new Set();
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? vis.add(e.target) : vis.delete(e.target); }); mbar.classList.toggle('is-hidden', vis.size > 0); }, { threshold: 0.05 });
    hideOn.forEach(function (el) { io.observe(el); });
  }

  /* ---------- estimate form ---------- */
  var form = $('#estimate-form');
  if (form) {
    var steps = $$('.fs', form), cur = 0, total = steps.length;
    var bar = $('.fprog-fill', form), mark = $('.fprog-mark', form), label = $('.fprog-n', form), stepName = $('.fprog-name', form);
    var q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) {
      var v = q.get(k); try { if (v) sessionStorage.setItem('9a_' + k, v); v = v || sessionStorage.getItem('9a_' + k); } catch (e) {}
      var el = $('[name="' + k + '"]', form); if (el && v) el.value = v;
    });
    $('[name="landing_page"]', form).value = location.pathname;
    $('[name="referrer"]', form).value = d.referrer || '';
    function syncServices() { $('[name="services"]', form).value = $$('[data-need]:checked', form).map(function (c) { return c.value; }).join(', '); }
    var m = location.hash.match(/^#need-([a-z]+)/);
    if (m) { var pre = $('[data-need="' + m[1] + '"]', form); if (pre) { pre.checked = true; syncServices(); } }
    function show(i, focus) {
      cur = i;
      steps.forEach(function (s, j) { s.classList.toggle('is-active', j === i); s.setAttribute('aria-hidden', j === i ? 'false' : 'true'); });
      var p = (i + 1) / total;
      if (bar) bar.style.width = (p * 100) + '%';
      if (mark) mark.style.left = (p * 100) + '%';
      if (label) label.textContent = 'Step ' + (i + 1) + ' of ' + total;
      if (stepName) stepName.textContent = steps[i].getAttribute('data-name');
      if (focus) {
        var t = $('.fs-q', steps[i]); if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
        var top = form.getBoundingClientRect().top; if (top < 70 || top > innerHeight * 0.6) form.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      }
    }
    function err(i, msg) { var e = $('.ferr', steps[i]); if (!e) return; e.textContent = msg || ''; e.hidden = !msg; }
    function valid(i) {
      var s = steps[i], k = s.getAttribute('data-step');
      if (k === 'need' && !$('[data-need]:checked', form)) { err(i, 'Pick at least one, or choose "Not sure yet".'); return false; }
      if (k === 'land' && !$('[name="acreage"]:checked', form)) { err(i, 'Choose the closest size. A rough guess is fine.'); return false; }
      if (k === 'where' && !$('[name="property_location"]', form).value.trim()) { err(i, 'Add the town or county where the property is.'); return false; }
      if (k === 'you') {
        var n = $('[name="name"]', form).value.trim(), ph = $('[name="phone"]', form).value.replace(/\D/g, ''), em = $('[name="email"]', form).value.trim();
        if (!n) { err(i, 'Add your name.'); return false; }
        if (ph.length < 10) { err(i, 'Add a 10-digit phone number so we can reach you.'); return false; }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { err(i, 'Add a valid email address.'); return false; }
      }
      err(i, ''); return true;
    }
    form.addEventListener('change', function (e) {
      if (e.target.matches('[data-need]')) { syncServices(); err(cur, ''); }
      if (e.target.matches('[name="acreage"]')) { err(cur, ''); setTimeout(function () { if (cur === 1) show(2, true); }, reduce ? 0 : 220); }
    });
    form.addEventListener('click', function (e) {
      if (e.target.closest('[data-next]')) { if (valid(cur)) show(cur + 1, true); }
      if (e.target.closest('[data-back]')) show(cur - 1, true);
    });
    form.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.matches('input:not([type=checkbox]):not([type=radio])') && cur < total - 1) { e.preventDefault(); if (valid(cur)) show(cur + 1, true); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); if (!valid(cur)) return;
      var btn = $('[type=submit]', form);
      function done() {
        var sum = $('.fdone-sum', form);
        if (sum) {
          var rows = [['Work', $('[name="services"]', form).value], ['Land', ($('[name="acreage"]:checked', form) || {}).value], ['Where', $('[name="property_location"]', form).value], ['We will reach you by', ($('[name="contact_preference"]:checked', form) || {}).value]];
          sum.innerHTML = rows.filter(function (r) { return r[1]; }).map(function (r) { var dt = d.createElement('div'); dt.innerHTML = '<dt></dt><dd></dd>'; dt.firstChild.textContent = r[0]; dt.lastChild.textContent = r[1]; return dt.innerHTML; }).join('');
        }
        $('.fwrap', form).hidden = true; var dn = $('.fdone', form); dn.hidden = false; dn.focus();
        window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'generate_lead', form_name: 'estimate-request', services: $('[name="services"]', form).value });
      }
      var live = /(^|\.)9arrow\.com$|netlify\.app$/.test(location.hostname);
      if (!live) { done(); return; }
      btn.disabled = true; btn.textContent = 'Sending...';
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(form)).toString() })
        .then(function (r) { if (!r.ok) throw 0; done(); })
        .catch(function () { btn.disabled = false; btn.textContent = 'Request my estimate'; err(cur, 'That did not send. Check your connection and try again, or call (210) 247-8410.'); });
    });
    show(0, false);
  }

  /* ---------- copy-to-clipboard for phone numbers on preview hosts ---------- */

  /* ---------- home: fly through the bowl of the 9 ---------- */
  var portal = $('#portal');
  if (portal && !reduce) {
    var pv = $('#pv'), pm = $('#pm'), pmWrap = $('#pm-wrap'), hTop = $('#hero-top'), hBot = $('#hero-bot'), stage = $('#stage'), video = $('#hero-video');
    var C, B, rin, vh;
    if (video) { video.muted = true; var pp = video.play(); if (pp && pp.catch) pp.catch(function () {}); }
    function pmeasure() { vh = innerHeight; var r = pmWrap.getBoundingClientRect(); C = { x: r.left + r.width / 2, y: r.top + r.height / 2 }; B = { x: r.left + r.width * 0.5308, y: r.top + r.height * 0.2886 }; rin = r.width * 134.74 / 320; pframe(); }
    function pframe() {
      var pr = portal.getBoundingClientRect(), p = c01(-pr.top / Math.max(1, portal.offsetHeight - vh));
      var k = c01(p / 0.68), sc = 1 + 23 * k * k * k;
      pm.style.transform = 'scale(' + sc.toFixed(4) + ')';
      pm.style.opacity = (1 - c01((sc - 5) / 6)).toFixed(3);
      var cx = B.x + (C.x - B.x) * sc, cy = B.y + (C.y - B.y) * sc, R = rin * sc;
      pv.style.clipPath = 'circle(' + R.toFixed(1) + 'px at ' + cx.toFixed(1) + 'px ' + cy.toFixed(1) + 'px)';
      pv.style.setProperty('--dim', (1 - 0.75 * k).toFixed(3));
      var ho = 1 - c01(p / 0.14);
      hTop.style.opacity = ho.toFixed(3); hBot.style.opacity = ho.toFixed(3);
      hTop.style.transform = 'translateY(' + (-50 * (1 - ho)).toFixed(1) + 'px)'; hBot.style.transform = 'translateY(' + (36 * (1 - ho)).toFixed(1) + 'px)';
      hBot.style.visibility = ho < 0.02 ? 'hidden' : 'visible';
      var so = c01((p - 0.7) / 0.15); stage.style.opacity = so.toFixed(3); stage.classList.toggle('is-on', so > 0.5);
      stage.style.transform = 'translateY(' + (26 * (1 - so)).toFixed(1) + 'px)';
    }
    portal.classList.add('is-live');
    addEventListener('resize', pmeasure); addEventListener('load', pmeasure); pmeasure();
    scrollers.push(pframe);
  }

  /* ---------- home: services track scrolls sideways on desktop ---------- */
  var svc = $('#svc-track-sec');
  if (svc) {
    var track = $('#track'), railDone = $('#rail-done'), railArrow = $('#rail-arrow'), dist = 0, pinned = false;
    function smeasure() {
      pinned = innerWidth >= 961 && !reduce;
      svc.classList.toggle('is-pinned', pinned); track.style.transform = '';
      if (pinned) { dist = Math.max(0, track.scrollWidth - track.parentNode.clientWidth); svc.style.setProperty('--svc-h', (innerHeight + dist) + 'px'); }
      sframe();
    }
    function sframe() {
      if (!pinned) return;
      var r = svc.getBoundingClientRect(), q = c01(-r.top / Math.max(1, svc.offsetHeight - innerHeight));
      track.style.transform = 'translate3d(' + (-q * dist).toFixed(1) + 'px,0,0)';
      var rw = railArrow.parentNode.clientWidth - 64;
      railArrow.style.transform = 'translateX(' + (q * rw).toFixed(1) + 'px)'; railDone.style.width = (q * rw + 8).toFixed(1) + 'px';
    }
    addEventListener('resize', smeasure); addEventListener('load', smeasure); smeasure();
    scrollers.push(sframe);
  }

  /* ---------- iris reveal ---------- */
  var irises = $$('[data-iris]');
  if (irises.length) scrollers.push(function () {
    irises.forEach(function (el) { var r = el.getBoundingClientRect(); el.style.setProperty('--p', reduce ? 1 : c01((innerHeight - r.top) / (innerHeight * 0.85)).toFixed(4)); });
  });

  /* ---------- look through the ring: scroll walks the ring across the photo and opens it ---------- */
  $$('[data-lens]').forEach(function (sec) {
    var stageEl = $('.lens-stage', sec), after = $('.lens-after', sec), before = $('.lens-before', sec), ring = $('.lens-ring', sec);
    var tb = $('.lens-tag.b', sec), ta = $('.lens-tag.a', sec), cap = $('.lens-cap', sec), drag = null;
    function place(p) {
      var w = stageEl.clientWidth, h = stageEl.clientHeight, diag = Math.hypot(w, h);
      // path: enter low-left, travel along the frame, then open up to fill it
      var t = c01(p / 0.62), o = c01((p - 0.62) / 0.33);
      var x = drag ? drag.x : w * (0.16 + 0.68 * t), y = drag ? drag.y : h * (0.62 - 0.18 * Math.sin(t * Math.PI));
      var r0 = Math.min(w, h) * 0.24, r = r0 + (diag - r0) * (o * o);
      if (drag) { x += (w / 2 - x) * o; y += (h / 2 - y) * o; }
      after.style.clipPath = 'circle(' + r.toFixed(1) + 'px at ' + x.toFixed(1) + 'px ' + y.toFixed(1) + 'px)';
      ring.style.transform = 'translate(' + (x - r).toFixed(1) + 'px,' + (y - r).toFixed(1) + 'px)';
      ring.style.width = ring.style.height = (2 * r).toFixed(1) + 'px';
      ring.style.opacity = (1 - c01((o - 0.55) / 0.35)).toFixed(3);
      tb.style.opacity = (1 - c01(o / 0.5)).toFixed(3); ta.style.opacity = c01((o - 0.3) / 0.5).toFixed(3);
      if (cap) cap.textContent = o > 0.6 ? cap.getAttribute('data-after') : cap.getAttribute('data-before');
    }
    var last = 0;
    function lframe() { var r = sec.getBoundingClientRect(), span = Math.max(1, sec.offsetHeight - innerHeight); last = reduce ? 0.4 : c01(-r.top / span); place(last); }
    stageEl.addEventListener('pointermove', function (e) { if (e.pointerType !== 'mouse' && !drag) return; var b = stageEl.getBoundingClientRect(); drag = { x: e.clientX - b.left, y: e.clientY - b.top }; place(last); });
    stageEl.addEventListener('pointerdown', function (e) { var b = stageEl.getBoundingClientRect(); drag = { x: e.clientX - b.left, y: e.clientY - b.top }; place(last); });
    stageEl.addEventListener('pointerleave', function () { drag = null; place(last); });
    stageEl.addEventListener('keydown', function (e) {
      var b = { x: stageEl.clientWidth / 2, y: stageEl.clientHeight / 2 }; drag = drag || b; var s = 30;
      if (e.key === 'ArrowLeft') drag.x -= s; else if (e.key === 'ArrowRight') drag.x += s; else if (e.key === 'ArrowUp') drag.y -= s; else if (e.key === 'ArrowDown') drag.y += s; else return;
      e.preventDefault(); place(last);
    });
    $$('[data-pair]', sec).forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('[data-pair]', sec).forEach(function (o) { o.setAttribute('aria-pressed', o === btn ? 'true' : 'false'); });
        before.src = btn.dataset.before; before.srcset = btn.dataset.beforeSet || ''; after.src = btn.dataset.after; after.srcset = btn.dataset.afterSet || '';
        before.alt = btn.dataset.beforeAlt; after.alt = btn.dataset.afterAlt;
        if (cap) { cap.setAttribute('data-before', btn.dataset.capB); cap.setAttribute('data-after', btn.dataset.capA); }
        place(last);
      });
    });
    if (sec.classList.contains('lens-static')) { sec.classList.add('is-live'); place(0.55); addEventListener('resize', function () { place(0.55); }); return; }
    sec.classList.add('is-live');
    addEventListener('resize', lframe); addEventListener('load', lframe); lframe();
    scrollers.push(lframe);
  });

  /* ---------- header shadow ---------- */
  var hdr = $('.hdr');
  scrollers.push(function () { if (hdr) hdr.classList.toggle('is-scrolled', scrollY > 8); });

  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; scrollers.forEach(function (f) { f(); }); }); } }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
