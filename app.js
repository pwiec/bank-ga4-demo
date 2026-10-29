(function () {
  var ID = window.GA_ID || '';
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;

  // Consent Mode v2: domyślnie wszystko zablokowane do czasu decyzji
  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' });
  var saved = null;
  try { saved = localStorage.getItem('consent'); } catch (e) {}
  function grant(v) {
    var s = v ? 'granted' : 'denied';
    gtag('consent', 'update', { ad_storage: s, ad_user_data: s, ad_personalization: s, analytics_storage: s });
  }
  if (saved) grant(saved === 'yes');

  gtag('js', new Date());
  gtag('config', ID, { debug_mode: /[?&]debug/.test(location.search) });
  if (ID && ID.indexOf('XXXX') === -1) {
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  } else { console.warn('Uzupełnij docs/config.js swoim Measurement ID'); }

  var band = function (a) { return a < 20000 ? 'do 20k' : a < 50000 ? '20-50k' : a < 100000 ? '50-100k' : '100k+'; };
  var $ = function (q) { return document.querySelector(q); };

  document.addEventListener('DOMContentLoaded', function () {
    if (!saved) {
      var b = document.createElement('div'); b.id = 'consent';
      b.innerHTML = 'Używamy plików cookies do analityki. <button id="consent-yes">Akceptuję</button> <button id="consent-no">Odrzucam</button>';
      document.body.appendChild(b);
      var set = function (v) { try { localStorage.setItem('consent', v ? 'yes' : 'no'); } catch (e) {} grant(v); b.remove(); };
      $('#consent-yes').onclick = function () { set(true); };
      $('#consent-no').onclick = function () { set(false); };
    }
    document.addEventListener('click', function (e) {
      if (e.target.closest('a[href^="tel:"]')) { e.preventDefault(); gtag('event', 'click_phone'); }
      if (e.target.closest('#login')) gtag('event', 'login_click');
    });

    var calc = $('#calc');
    if (calc) calc.onclick = function () {
      var a = +$('#amount').value, m = +$('#months').value;
      $('#rata').textContent = Math.round(a * (1 + 0.09 * m / 12) / m) + ' zł';
      gtag('event', 'calculator_use', { product_type: 'kredyt_gotowkowy', loan_amount_band: band(a), months: m });
    };

    var loan = $('#loan');
    if (loan) {
      var started = false, step = 0, steps = [].slice.call(loan.querySelectorAll('.step'));
      var show = function (i) { steps.forEach(function (s, j) { s.hidden = j !== i; }); };
      show(0);
      loan.addEventListener('focusin', function () {
        if (!started) { started = true; gtag('event', 'begin_application', { product_type: 'kredyt_gotowkowy' }); }
      });
      loan.querySelectorAll('.next').forEach(function (btn) {
        btn.onclick = function () { step++; show(step); gtag('event', 'application_step', { product_type: 'kredyt_gotowkowy', step_number: step + 1 }); };
      });
      loan.onsubmit = function (e) {
        e.preventDefault();
        var p = { product_type: 'kredyt_gotowkowy', loan_amount_band: band(+$('#amount').value) };
        gtag('event', 'generate_lead', p); gtag('event', 'application_submit', p);
        loan.innerHTML = '<p>Dziękujemy! Doradca skontaktuje się z Tobą.</p>';
      };
    }

    var acc = $('#acc');
    if (acc) {
      var st = false;
      acc.addEventListener('focusin', function () { if (!st) { st = true; gtag('event', 'begin_application', { product_type: 'konto' }); } });
      acc.onsubmit = function (e) {
        e.preventDefault();
        var p = { product_type: $('#acctype').value };
        gtag('event', 'generate_lead', p); gtag('event', 'application_submit', p);
        acc.innerHTML = '<p>Dziękujemy! Wniosek o konto został przyjęty.</p>';
      };
    }
  });
})();
