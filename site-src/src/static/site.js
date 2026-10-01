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
    var m = location.hash.match(/^#need-([a-z]+)/), want = m ? m[1] : '';
    try { want = want || sessionStorage.getItem('9a_need') || ''; sessionStorage.removeItem('9a_need'); } catch (e) {}
    if (want) { var pre = $('input[data-need="' + want + '"]', form); if (pre) pre.checked = true; }
    syncServices();
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
    function openDrawer(href, needFor) {
      lastFocus = d.activeElement; dHref = href || 'get-an-estimate';
      dNeed.value = needFor || dNeedDefault; dForm.setAttribute('data-dest', dHref);
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
      e.preventDefault(); if (sheet && sheet.classList.contains('is-open')) closeSheet(); closeAll(); openDrawer(a.getAttribute('href'), a.getAttribute('data-need'));
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

  /* ---------- clean addresses: estimate links remember the service, in-page links never add #… ---------- */
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-need]');
    if (a) { try { sessionStorage.setItem('9a_need', a.getAttribute('data-need')); } catch (x) {} }
  }, true);
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]'); if (!a || e.defaultPrevented || a.hasAttribute('data-drawer')) return;
    var id = a.getAttribute('href').slice(1), t = id && d.getElementById(id); if (!t) return;
    e.preventDefault();
    var y = t.getBoundingClientRect().top + scrollY - ((hdr && hdr.offsetHeight) || 0) - 12;
    scrollTo({ top: Math.max(0, y), behavior: reduce ? 'auto' : 'smooth' });
    if (!t.hasAttribute('tabindex') && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(t.tagName)) t.setAttribute('tabindex', '-1');
    t.focus({ preventScroll: true });
  });
  if (location.hash && history.replaceState) setTimeout(function () { history.replaceState(null, '', location.pathname + location.search); }, 600);

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
      var dest = base;
      try { if (nd.value) sessionStorage.setItem('9a_need', nd.value); } catch (x) {}
      var btn = $('[type=submit]', sf), label = btn.textContent; btn.disabled = true; btn.textContent = 'One moment...';
      addEventListener('pageshow', function () { btn.disabled = false; btn.textContent = label; });
      var live = /(^|\.)9arrow\.com$|netlify\.app$/.test(location.hostname);
      if (!live) { location.href = dest; return; }
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(sf)).toString() })
        .catch(function () {}).then(function () { location.href = dest; });
    });
  });
  /* ---------- home: services explorer (pick a service, the panel updates) ---------- */
  $$('[data-svx]').forEach(function (box) {
    var tabs = $$('.svx-tab', box), panels = $$('.svx-panel', box), row = $('.svx-tabs', box);
    function pick(i, focus) {
      tabs.forEach(function (t, j) { var on = j === i; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1; });
      panels.forEach(function (p, j) { p.hidden = j !== i; if (j === i) $$('img[loading=lazy]', p).forEach(function (im) { im.loading = 'eager'; }); });
      if (row.scrollWidth > row.clientWidth + 4) { var t = tabs[i]; row.scrollTo({ left: t.offsetLeft - (row.clientWidth - t.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); }
      if (focus) tabs[i].focus({ preventScroll: true });
      if (innerWidth <= 960) { var pr = $('.svx-panels', box).getBoundingClientRect(); if (pr.top < 60 || pr.top > innerHeight * 0.7) scrollTo({ top: scrollY + pr.top - ((hdr && hdr.offsetHeight) || 60) - row.offsetHeight - 24, behavior: reduce ? 'auto' : 'smooth' }); }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { pick(i); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, to = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') to = (i + 1) % n; else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') to = (i - 1 + n) % n; else if (e.key === 'Home') to = 0; else if (e.key === 'End') to = n - 1;
        if (to !== null) { e.preventDefault(); pick(to, true); }
      });
    });
  });

  /* ---------- remember the last town page a visitor looked at (home page uses it to pick their area) ---------- */
  var townPage = location.pathname.match(/(?:land-clearing|forestry-mulching|cedar-removal)-([a-z-]+-tx)(?:\.html)?$/);
  if (townPage) { try { sessionStorage.setItem('9a_area', townPage[1]); } catch (e) {} }

  /* ---------- home: service areas. Links light up their pins, and the spotlight card picks the visitor's area ---------- */
  $$('.areas-sec').forEach(function (sec) {
    var wrap = $('[data-txm]', sec), pins = $$('.txm-pin', sec), links = $$('.town-list [data-areas]', sec), spot = $('[data-spot]', sec);
    var towns = []; try { towns = JSON.parse(sec.getAttribute('data-towns')) || []; } catch (e) {}
    var HQ = towns.filter(function (t) { return t.s === 'spring-branch-tx'; })[0];
    function hot(list) {
      pins.forEach(function (p) { p.classList.toggle('is-hot', list.indexOf(p.getAttribute('data-area')) > -1); });
      links.forEach(function (l) { var a = l.getAttribute('data-areas').split(' '); l.classList.toggle('is-hot', list.length === 1 && a.length === 1 && a[0] === list[0]); });
      wrap.classList.toggle('has-hot', list.length > 0);
    }
    links.concat(pins).forEach(function (el) {
      var a = (el.getAttribute('data-areas') || el.getAttribute('data-area') || '').split(' ').filter(Boolean);
      ['mouseenter', 'focus'].forEach(function (ev) { el.addEventListener(ev, function () { hot(a); }); });
      ['mouseleave', 'blur'].forEach(function (ev) { el.addEventListener(ev, function () { hot([]); }); });
    });
    if (!spot || !HQ) return;

    function miles(a, b, c, d) {
      var R = 3958.8, r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2);
      return 2 * R * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y));
    }
    function about(m) { return m < 20 ? Math.max(1, Math.round(m)) : Math.round(m / 5) * 5; }
    function el(tag, attrs, text) { var n = d.createElementNS('http://www.w3.org/2000/svg', tag); for (var k in attrs) n.setAttribute(k, attrs[k]); if (text) n.textContent = text; return n; }
    function inTexas(g) { return g.region === 'TX' || (g.region == null && g.lat > 25.8 && g.lat < 36.5 && g.lng > -106.7 && g.lng < -93.5); }
    function youPin(g) {
      $$('.txm-you', sec).forEach(function (grp) {
        var svg = grp.ownerSVGElement, s = +grp.getAttribute('data-scale') || 1;
        var x = (g.lng - +svg.getAttribute('data-lng0')) * +svg.getAttribute('data-c') * +svg.getAttribute('data-k'), y = (+svg.getAttribute('data-lat1') - g.lat) * +svg.getAttribute('data-k');
        var hx = +svg.getAttribute('data-hx'), hy = +svg.getAttribute('data-hy');
        grp.textContent = '';
        if (Math.hypot(x - hx, y - hy) > 12 * s) grp.appendChild(el('line', { x1: x, y1: y, x2: hx, y2: hy }));
        grp.appendChild(el('circle', { 'class': 'you-pulse', cx: x, cy: y, r: 12 * s }));
        grp.appendChild(el('circle', { 'class': 'you-dot', cx: x, cy: y, r: 6 * s }));
        if (s === 1 && g.city) { var left = x > 380; grp.appendChild(el('text', { x: x + (left ? -12 : 12), y: y - 10, 'text-anchor': left ? 'end' : 'start' }, g.city)); }
      });
      var key = $('.k-you-li', sec); if (key) key.hidden = false;
    }
    function setSpot(k, h, sub, p, primary, matched) {
      $('.spot-k', spot).textContent = k; $('.spot-h', spot).textContent = h; $('.spot-sub', spot).textContent = sub; $('.spot-p', spot).textContent = p;
      var go = $('.spot-go', spot);
      if (primary.href) { go.href = primary.href; go.removeAttribute('data-drawer'); } else { go.href = $('.spot-est', spot).getAttribute('href'); go.setAttribute('data-drawer', ''); }
      go.textContent = primary.label; $('.spot-est', spot).hidden = !primary.href;
      spot.classList.toggle('is-matched', !!matched); spot.classList.remove('is-swap'); void spot.offsetWidth; spot.classList.add('is-swap');
    }
    function showTown(t, kicker) {
      var far = t.s === HQ.s ? 0 : about(miles(HQ.lat, HQ.lng, t.lat, t.lng));
      setSpot(kicker, t.n + ', TX', t.c + (far ? ' · about ' + far + ' miles from our Spring Branch base' : ' · our home base'),
        'We clear land in and around ' + t.n + ', from cedar and brush to roads and building sites. See local details, or tell us about your property.',
        { href: t.u, label: 'Land clearing in ' + t.n }, true);
      pins.forEach(function (p) { p.classList.toggle('is-near', p.getAttribute('data-area') === t.s); });
      links.forEach(function (l) { l.classList.toggle('is-near', l.getAttribute('data-areas') === t.s); });
      window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'service_area_match', area: t.s });
    }
    function showGeo(g) {
      if (g == null || typeof g.lat !== 'number' || typeof g.lng !== 'number' || !inTexas(g)) return;
      var best = null, bd = 1e9;
      towns.forEach(function (t) { var m = miles(g.lat, g.lng, t.lat, t.lng); if (m < bd) { bd = m; best = t; } });
      youPin(g);
      if (best && bd <= 30) { showTown(best, 'Closest to you'); return; }
      setSpot(g.city ? 'Near ' + g.city + '?' : 'Elsewhere in Texas?', "We'll come to you.",
        'About ' + about(miles(HQ.lat, HQ.lng, g.lat, g.lng)) + ' miles from our Spring Branch base',
        'We take right-of-way, utility, solar and large-acreage projects across Texas. Tell us where the land is and what it needs.',
        { label: 'Tell us about your project' }, true);
      sec.classList.add('is-far');
      window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'service_area_match', area: 'texas' });
    }
    var byName = function (q) { q = q.toLowerCase().replace(/[^a-z]/g, ''); return towns.filter(function (t) { return t.n.toLowerCase().replace(/[^a-z]/g, '') === q || t.s.replace(/-tx$/, '').replace(/-/g, '') === q; })[0]; };
    var near = new URLSearchParams(location.search).get('near'), seen = null;
    try { seen = sessionStorage.getItem('9a_area'); } catch (e) {}
    if (near) {   // for testing and demos: ?near=boerne or ?near=31.55,-97.15
      var ll = near.split(','), nt = byName(near);
      if (nt) showTown(nt, 'Your area'); else if (ll.length === 2) showGeo({ lat: +ll[0], lng: +ll[1], region: 'TX', city: '' });
      return;
    }
    var seenTown = seen && towns.filter(function (t) { return t.s === seen; })[0];
    if (seenTown) { showTown(seenTown, 'Your area'); return; }
    if (!/(^|\.)9arrow\.com$|netlify\.app$/.test(location.hostname) || !window.fetch) return;
    var ctl = window.AbortController ? new AbortController() : null; if (ctl) setTimeout(function () { ctl.abort(); }, 2500);
    fetch('/api/geo', { signal: ctl ? ctl.signal : undefined, credentials: 'omit' }).then(function (r) { return r.ok ? r.json() : null; }).then(showGeo).catch(function () {});
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

  /* ---------- nine values: point at an arrow to read it, click to keep it ---------- */
  $$('[data-quiver]').forEach(function (sec) {
    var rows = $$('.q-row', sec), stage = $('.q-stage', sec), panels = $$('.q-panel', stage), rack = $('.q-rack', sec), home = stage.parentNode;
    var hoverable = matchMedia('(hover: hover) and (pointer: fine)').matches, locked = -1, shown = null;
    sec.classList.toggle('can-hover', hoverable);
    rows.forEach(function (r, i) { var ar = $('.q-arrow', r); if (ar) r.style.setProperty('--d', (i * 0.06) + 's'); });
    function place() {
      if (innerWidth <= 760 && locked > -1) { var li = rows[locked].parentNode; if (stage.parentNode !== li) li.appendChild(stage); }
      else if (stage.parentNode !== home) home.appendChild(stage);
    }
    function show(i) {
      if (i === shown) return; shown = i;
      panels.forEach(function (p) { var k = p.getAttribute('data-panel'); p.hidden = i < 0 ? k !== 'intro' : k !== String(i); });
      rows.forEach(function (r, j) { r.classList.toggle('is-on', j === i); });
      stage.classList.toggle('is-idle', i < 0);
    }
    function lock(i) {
      locked = (!hoverable && locked === i) ? -1 : i;
      rows.forEach(function (r, j) { r.setAttribute('aria-pressed', j === locked ? 'true' : 'false'); });
      place(); shown = null; show(locked);
    }
    rows.forEach(function (r, i) {
      r.addEventListener('mouseenter', function () { if (hoverable) show(i); });
      r.addEventListener('focus', function () { if (hoverable) show(i); });
      r.addEventListener('click', function () { lock(i); });
    });
    rack.addEventListener('mouseleave', function () { if (hoverable) show(locked); });
    rack.addEventListener('focusout', function (e) { if (hoverable && !rack.contains(e.relatedTarget)) show(locked); });
    addEventListener('resize', place);
    show(-1);
    if (!('IntersectionObserver' in window) || reduce) { sec.classList.add('is-in', 'is-set'); return; }
    var qio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; qio.disconnect();
      sec.classList.add('is-in'); setTimeout(function () { sec.classList.add('is-set'); }, 1400);
    }, { threshold: 0.25 });
    qio.observe(sec);
  });

  /* ---------- founders photos: wait until both are loaded, then bring them in together ---------- */
  $$('.founders').forEach(function (sec) {
    if (!('IntersectionObserver' in window) || reduce) { sec.classList.add('is-in'); return; }
    var imgs = $$('img', sec);
    var pre = new IntersectionObserver(function (es) {   // start loading a screen early
      if (!es[0].isIntersecting) return; pre.disconnect(); imgs.forEach(function (im) { im.loading = 'eager'; });
    }, { rootMargin: '600px 0px' });
    pre.observe(sec);
    var fio = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; fio.disconnect();
      var done = false; function go() { if (!done) { done = true; sec.classList.add('is-in'); } }
      Promise.all(imgs.map(function (im) { return im.decode ? im.decode().catch(function () {}) : Promise.resolve(); })).then(go);
      setTimeout(go, 1200);
    }, { threshold: 0.2 });
    fio.observe(sec);
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
