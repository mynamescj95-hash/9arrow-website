/* 9 Arrow Land Service, site behavior. No dependencies. Every block is guarded by the element it needs. */
(function () {
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var scrollers = [];
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
  function c01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ---------- every page opens at the top (unless the link points at a section) ---------- */
  var fromDrawer = false;
  try { fromDrawer = sessionStorage.getItem('9a_go_form') === '1'; sessionStorage.removeItem('9a_go_form'); } catch (e) {}
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  function realAnchor() { var h = location.hash.slice(1); return h && h.indexOf('need-') !== 0 && d.getElementById(h); }
  function toTop() { if (!realAnchor() && !fromDrawer) scrollTo(0, 0); }
  toTop();
  d.addEventListener('DOMContentLoaded', toTop);
  addEventListener('pageshow', function (e) { if (!e.persisted) toTop(); });

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
    var saved = ''; try { saved = sessionStorage.getItem('9a_email') || ''; } catch (e) {}
    var fe = $('#f-email', form);
    if (saved && fe && !fe.value) {
      fe.value = saved;
      var hello = d.createElement('p'); hello.className = 'est-hello';
      hello.appendChild(d.createTextNode('Thanks. We will send your estimate to '));
      var bEl = d.createElement('b'); bEl.textContent = saved; hello.appendChild(bEl);
      var ch = d.createElement('button'); ch.type = 'button'; ch.textContent = 'Change';
      ch.addEventListener('click', function () { show(total - 1, true); fe.focus(); fe.select(); });
      hello.appendChild(ch);
      var fw = $('.fwrap', form); if (fw) fw.insertBefore(hello, fw.firstChild);
    }
    show(0, false);
    if (fromDrawer) setTimeout(function () { var y = form.getBoundingClientRect().top + scrollY - (($('.hdr') || {}).offsetHeight || 70) - 16; scrollTo(0, Math.max(0, y)); }, 30);
  }

  /* ---------- copy-to-clipboard for phone numbers on preview hosts ---------- */

  /* ---------- home: the 9 Arrow emblem rolls in like a wheel, then rolls away as you scroll ---------- */
  var hh = $('#hero-home');
  if (hh) {
    var roll = $('#em-roll'), intro = $('#em-intro');
    var radius = function () { return Math.max(40, roll.offsetWidth * 0.4); }; // the ring of the mark is 80% of the box
    if (!reduce && intro.animate) {
      var D = Math.min(innerWidth * 0.42, 620), A = D / radius() * 180 / Math.PI;
      intro.animate([{ transform: 'translateX(' + D + 'px) rotate(' + A + 'deg)', opacity: 0 }, { opacity: 1, offset: 0.25 }, { transform: 'translateX(0) rotate(0deg)', opacity: 1 }],
        { duration: 1700, easing: 'cubic-bezier(.17,.84,.26,1)', fill: 'both' });
      scrollers.push(function () {
        var y = Math.max(0, scrollY), h = hh.offsetHeight; if (y > h * 1.3) return;
        var dx = y * (innerWidth < 900 ? 0.75 : 0.6), ang = dx / radius() * 180 / Math.PI;
        roll.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + (y * 0.18).toFixed(1) + 'px) rotate(' + ang.toFixed(2) + 'deg)';
        roll.style.setProperty('--a', ang.toFixed(2) + 'deg');
      });
    }
  }

  /* ---------- photo band drifts slower than the page ---------- */
  var pars = $$('[data-par]');
  if (pars.length && !reduce) scrollers.push(function () {
    pars.forEach(function (el) { var r = el.parentNode.getBoundingClientRect(); if (r.bottom < -100 || r.top > innerHeight + 100) return; el.style.transform = 'translate3d(0,' + ((r.top + r.height / 2 - innerHeight / 2) * -0.12).toFixed(1) + 'px,0)'; });
  });

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

  /* ---------- header: clear over the photo, solid once you scroll past it ---------- */
  var hdr = $('.hdr'), heroEl = $('.hero-photo') || $('#hero-home');
  scrollers.push(function () {
    if (!hdr) return;
    var lim = 8;
    if (heroEl && d.body.classList.contains('over-hero')) lim = heroEl.offsetTop + heroEl.offsetHeight - hdr.offsetHeight - 4;
    hdr.classList.toggle('is-scrolled', scrollY > lim);
    hdr.classList.toggle('is-tinted', scrollY > 8 && scrollY <= lim);
    if (mbar) mbar.classList.toggle('is-top', !!heroEl && d.body.classList.contains('over-hero') && scrollY < innerHeight * 0.55);
  });

  /* ---------- photo heroes push in slowly as you scroll ---------- */
  var zoomers = $$('[data-zoom]');
  if (zoomers.length && !reduce) scrollers.push(function () {
    zoomers.forEach(function (el) { var r = el.getBoundingClientRect(); if (r.bottom < 0) return; el.style.setProperty('--z', (1.06 + 0.14 * c01(-r.top / Math.max(1, r.height))).toFixed(4)); });
  });

  /* ---------- "Get an estimate": email first, then the step-by-step form ---------- */
  var drawerEl = $('#drawer');
  if (drawerEl) {
    var dForm = $('#start-form', drawerEl), dEmail = $('#dr-email', drawerEl), dNeed = $('[name="need"]', dForm);
    var dPanel = $('.drawer-panel', drawerEl), lastFocus = null, dHref = '', dNeedDefault = dNeed.value;
    function openDrawer(href) {
      lastFocus = d.activeElement; dHref = href || 'get-an-estimate';
      var m = dHref.match(/#need-([a-z]+)/); dNeed.value = m ? m[1] : dNeedDefault; dForm.setAttribute('data-dest', dHref);
      try { var sv = sessionStorage.getItem('9a_email'); if (sv && !dEmail.value) dEmail.value = sv; } catch (e) {}
      drawerEl.removeAttribute('inert'); drawerEl.classList.add('is-open'); d.body.style.overflow = 'hidden';
      setTimeout(function () { dEmail.focus({ preventScroll: true }); }, reduce ? 0 : 320);
      window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'estimate_drawer_open', need: dNeed.value });
    }
    function closeDrawer() {
      if (!drawerEl.classList.contains('is-open')) return;
      drawerEl.classList.remove('is-open'); drawerEl.setAttribute('inert', ''); d.body.style.overflow = '';
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    }
    d.addEventListener('click', function (e) {
      var a = e.target.closest('[data-drawer]'); if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button > 0) return;
      e.preventDefault(); if (sheet && sheet.classList.contains('is-open')) closeSheet(); closeAll(); openDrawer(a.getAttribute('href'));
    });
    $$('[data-close]', drawerEl).forEach(function (b) { b.addEventListener('click', closeDrawer); });
    drawerEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeDrawer(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href],button,input:not([type=hidden]):not([tabindex="-1"])', dPanel).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return; var first = f[0], lastEl = f[f.length - 1];
      if (e.shiftKey && d.activeElement === first) { e.preventDefault(); lastEl.focus(); } else if (!e.shiftKey && d.activeElement === lastEl) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- email-first start forms (pull-out and home hero) -> step-by-step form ---------- */
  $$('.start-form').forEach(function (sf) {
    var em = $('[name="email"]', sf), er = $('.ferr', sf), nd = $('[name="need"]', sf);
    em.addEventListener('input', function () { er.hidden = true; em.removeAttribute('aria-invalid'); });
    sf.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = em.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { er.textContent = 'Add a valid email address so we can send your estimate.'; er.hidden = false; em.setAttribute('aria-invalid', 'true'); em.focus(); return; }
      var q = new URLSearchParams(location.search);
      $('[name="landing_page"]', sf).value = location.pathname; $('[name="referrer"]', sf).value = d.referrer || '';
      ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'].forEach(function (k) {
        var u = q.get(k); try { if (u) sessionStorage.setItem('9a_' + k, u); u = u || sessionStorage.getItem('9a_' + k); } catch (x) {}
        var el = $('[name="' + k + '"]', sf); if (el && u) el.value = u;
      });
      try { sessionStorage.setItem('9a_email', v); sessionStorage.setItem('9a_go_form', '1'); } catch (x) {}
      window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'estimate_start', need: nd.value, placement: sf.id });
      var base = (sf.getAttribute('data-dest') || 'get-an-estimate').split('#')[0];
      var dest = base + (nd.value ? '#need-' + nd.value : '');
      var btn = $('[type=submit]', sf), label = btn.textContent; btn.disabled = true; btn.textContent = 'One moment...';
      addEventListener('pageshow', function () { btn.disabled = false; btn.textContent = label; });
      var live = /(^|\.)9arrow\.com$|netlify\.app$/.test(location.hostname);
      if (!live) { location.href = dest; return; }
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(sf)).toString() })
        .catch(function () {}).then(function () { location.href = dest; });
    });
  });
  /* ---------- numbers count up when they come into view ---------- */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !reduce) {
    counters.forEach(function (el) { el.textContent = '0'; });
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; cio.unobserve(e.target);
        var el = e.target, to = +el.getAttribute('data-count'), t0 = performance.now(), dur = 1100;
        (function tick(t) { var k = c01((t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); })(t0);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- nine values: pick an arrow ---------- */
  $$('[data-quiver]').forEach(function (sec) {
    var tabs = $$('.q-tab', sec), panels = $$('.q-panel', sec), auto = null, touched = false;
    tabs.forEach(function (t, i) { var ar = $('.q-arrow', t); if (ar) ar.style.setProperty('--d', (i * 0.07) + 's'); });
    function pick(i, focus) {
      tabs.forEach(function (t, j) { var on = j === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
      panels.forEach(function (p, j) { p.hidden = j !== i; });
      if (focus) tabs[i].focus();
    }
    function stop() { touched = true; if (auto) { clearInterval(auto); auto = null; } }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { stop(); pick(i); });
      t.addEventListener('keydown', function (e) {
        var cur = tabs.indexOf(t), n = tabs.length, to = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (cur + 1) % n; else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (cur - 1 + n) % n; else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = n - 1;
        if (to !== null) { e.preventDefault(); stop(); pick(to, true); }
      });
    });
    sec.addEventListener('pointerenter', function () { if (auto) { clearInterval(auto); auto = null; } });
    sec.addEventListener('focusin', function () { if (auto) { clearInterval(auto); auto = null; } });
    if (!('IntersectionObserver' in window) || reduce) { sec.classList.add('is-in', 'is-set'); return; }
    var qio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          if (!sec.classList.contains('is-in')) { sec.classList.add('is-in'); setTimeout(function () { sec.classList.add('is-set'); }, 1400); }
          if (!touched && !auto) auto = setInterval(function () { var cur = tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; }); pick((cur + 1) % tabs.length); }, 4200);
        } else if (auto) { clearInterval(auto); auto = null; }
      });
    }, { threshold: 0.35 });
    qio.observe(sec);
  });

  /* ---------- process steps fill in as you read down ---------- */
  var stepLists = $$('.steps');
  if (stepLists.length) scrollers.push(function () {
    stepLists.forEach(function (ol) {
      var r = ol.getBoundingClientRect(), p = reduce ? 1 : c01((innerHeight * 0.8 - r.top) / Math.max(1, r.height + innerHeight * 0.25));
      ol.style.setProperty('--sp', p.toFixed(3));
      var lis = ol.children, n = lis.length;
      for (var i = 0; i < n; i++) lis[i].classList.toggle('is-on', p >= (n > 1 ? i / (n - 1) : 0) - 0.001);
    });
  });

  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; scrollers.forEach(function (f) { f(); }); }); } }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
