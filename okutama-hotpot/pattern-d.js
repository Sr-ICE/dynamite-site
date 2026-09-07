/* =========================================================
   OKUTAMA HOTPOT CLASH 2026 — D案
   ① 言語切替（日本語 / Tiếng Việt / English）
   ② ヘッダーの背景をスクロールで出す
   ③ スクロールで要素をふわっと出す
   ========================================================= */
(function () {
  'use strict';

  /* -------------------------------------------------------
     ① 言語切替
     <html data-lang="ja"> を書き換えるだけ。表示の出し分けは
     CSS 側（html[data-lang="○○"] [lang]:not(...)）が担当する。
     選んだ言語は localStorage に覚えておき、次回も同じ言語で開く。
     ------------------------------------------------------- */
  var LANGS = ['ja', 'vi', 'en'];
  var STORE_KEY = 'ohc-lang';
  var root = document.documentElement;
  var buttons = document.querySelectorAll('.lang button');

  function setLang(lang) {
    if (LANGS.indexOf(lang) === -1) { lang = 'ja'; }

    // ページ全体の表示言語を切り替える
    root.setAttribute('data-lang', lang);
    // 読み上げソフト・翻訳ツール向けにページの言語も合わせる
    root.setAttribute('lang', lang);

    // ボタンの選択状態を更新
    for (var i = 0; i < buttons.length; i++) {
      var on = buttons[i].getAttribute('data-lang') === lang;
      buttons[i].setAttribute('aria-current', on ? 'true' : 'false');
    }

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* 保存できなくても動作に影響なし */ }
  }

  // ボタンのクリック
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      setLang(this.getAttribute('data-lang'));
    });
  }

  // 初期表示の言語を決める
  // 優先順： URLの ?lang= → 前回選んだ言語 → ブラウザの言語 → 日本語
  (function initLang() {
    var fromUrl = new URLSearchParams(location.search).get('lang');
    if (fromUrl && LANGS.indexOf(fromUrl) !== -1) { setLang(fromUrl); return; }

    var saved = null;
    try { saved = localStorage.getItem(STORE_KEY); } catch (e) {}
    if (saved && LANGS.indexOf(saved) !== -1) { setLang(saved); return; }

    var nav = (navigator.language || '').toLowerCase();
    if (nav.indexOf('vi') === 0) { setLang('vi'); return; }
    if (nav.indexOf('ja') === 0) { setLang('ja'); return; }
    if (nav.indexOf('en') === 0) { setLang('en'); return; }

    setLang('ja');
  })();

  /* -------------------------------------------------------
     ② ヘッダー：少しスクロールしたら背景を出す
     ------------------------------------------------------- */
  var hd = document.getElementById('hd');
  function onScroll() {
    if (window.scrollY > 40) { hd.classList.add('is-on'); }
    else { hd.classList.remove('is-on'); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* -------------------------------------------------------
     ③ スクロールで要素をふわっと出す
     ------------------------------------------------------- */
  var targets = document.querySelectorAll('[data-rv]');

  if (!('IntersectionObserver' in window)) {
    // 未対応ブラウザでは、隠したままにせず最初から表示する
    for (var j = 0; j < targets.length; j++) { targets[j].classList.add('in'); }
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  for (var k = 0; k < targets.length; k++) { io.observe(targets[k]); }
})();

/* =========================================================
   確認用｜Before / After の切り替え
   いま見ているセクションを保ったまま、もう片方の版へ移る。
   位置合わせはブラウザ標準のアンカー（#schedule など）に任せる。
   公開前にここから下をブロックごと削除。
   ========================================================= */
(function () {
  'use strict';
  var links = document.querySelectorAll('.ba a[data-ba]');
  if (!links.length) { return; }
  var ids = ['entry', 'info', 'venue', 'schedule', 'main'];
  function currentSection() {
    var mid = window.innerHeight * 0.4;
    for (var i = 0; i < ids.length; i++) {
      var el = document.getElementById(ids[i]);
      if (el && el.getBoundingClientRect().top <= mid) { return ids[i]; }
    }
    return '';
  }
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener('click', function (e) {
      e.preventDefault();
      var sec = currentSection();
      location.href = this.getAttribute('href') + (sec ? '#' + sec : '');
    });
  }
})();

/* =========================================================
   確認用｜変更点ハイライト＋内訳のサイドカラム
   ---------------------------------------------------------
   ・data-chg="…" が付いた要素を拾って、右のカラムに内訳を並べる
   ・カラムの項目を押すと、その場所（#chg-N）へ移動して枠を点滅させる
   ・changes.html から #chg-12 で来ると、自動でカラムを開いて12番を選ぶ
   ・位置移動はブラウザ標準のアンカーに任せる（スクリプトの実行タイミングに依存しない）
   ========================================================= */
(function () {
  'use strict';

  var btn   = document.getElementById('rvBtn');
  var col   = document.getElementById('rvCol');
  var list  = document.getElementById('rvList');
  var nEl   = document.getElementById('rvN');
  var n2El  = document.getElementById('rvN2');
  var xBtn  = document.getElementById('rvClose');
  var label = btn && btn.querySelector('.rv__lb');
  if (!btn || !col || !list) { return; }

  var targets = Array.prototype.slice.call(document.querySelectorAll('[data-chg]'));
  nEl.textContent  = targets.length;
  n2El.textContent = targets.length + '件';

  /* どのセクションの変更かを、要素の親をたどって判定する */
  var SEC = {
    hd: 'ヘッダー', hero: 'ヒーロー', facts: '開催概要バー',
    main: '01　Highlights', schedule: '02　当日の流れ',
    venue: '03　会場', info: '04　参加にあたって', entry: '申し込み'
  };
  function sectionOf(el) {
    var p = el;
    while (p && p !== document.body) {
      if (p.tagName === 'SECTION' || p.tagName === 'HEADER') {
        if (SEC[p.id]) { return SEC[p.id]; }
        for (var k in SEC) {
          if (p.classList && p.classList.contains(k)) { return SEC[k]; }
        }
      }
      p = p.parentElement;
    }
    return 'その他';
  }

  /* 番号バッジのレイヤー。本文のレイアウトには一切さわらない */
  var layer = document.createElement('div');
  layer.className = 'rv-layer';
  layer.hidden = true;
  document.body.appendChild(layer);

  var marks = [], rows = [], lastGroup = null, group = null;

  targets.forEach(function (el, i) {
    var m = document.createElement('span');
    m.className = 'rv-mk';
    m.textContent = String(i + 1);
    layer.appendChild(m);
    marks.push(m);

    var sec = sectionOf(el);
    if (sec !== lastGroup) {
      lastGroup = sec;
      group = document.createElement('div');
      group.className = 'rv-g';
      var t = document.createElement('p');
      t.className = 'rv-g__t';
      t.innerHTML = '<span></span><span class="rv-g__n"></span>';
      t.firstChild.textContent = sec;
      group.appendChild(t);
      list.appendChild(group);
      group._count = t.lastChild;
      group._n = 0;
    }
    group._n += 1;
    group._count.textContent = group._n + '件';

    var row = document.createElement('div');
    row.className = 'rv-i';
    var b = document.createElement('button');
    var num = document.createElement('b');
    var txt = document.createElement('span');
    b.type = 'button';
    num.textContent = String(i + 1);
    txt.textContent = el.getAttribute('data-chg') || '';
    b.appendChild(num); b.appendChild(txt);
    b.addEventListener('click', function () { jumpTo(i); });
    row.appendChild(b);
    group.appendChild(row);
    rows.push(row);
  });

  function place() {
    var sx = window.pageXOffset, sy = window.pageYOffset;
    for (var i = 0; i < targets.length; i++) {
      var r = targets[i].getBoundingClientRect();
      marks[i].style.left = (r.left + sx) + 'px';
      marks[i].style.top  = (r.top + sy) + 'px';
    }
  }
  var ticking = false;
  function onMove() {
    if (!on || ticking) { return; }
    ticking = true;
    requestAnimationFrame(function () { place(); ticking = false; });
  }

  var on = false;
  function setOn(v) {
    on = v;
    document.body.classList.toggle('rv-on', on);
    document.body.classList.toggle('rv-open', on);
    layer.hidden = !on;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (label) { label.textContent = on ? '変更点を隠す' : '変更点を表示'; }
    // 本文の幅が変わるので、少し置いてから測り直す（非表示タブでは rAF が止まるためタイマー）
    if (on) { setTimeout(place, 0); setTimeout(place, 260); }
  }

  var current = -1;
  function mark(i) {
    if (current >= 0) {
      if (rows[current])  { rows[current].classList.remove('is-on'); }
      if (marks[current]) { marks[current].classList.remove('is-target'); }
    }
    current = i;
    if (i < 0) { return; }
    rows[i].classList.add('is-on');
    marks[i].classList.add('is-target');
    rows[i].scrollIntoView({ block: 'nearest' });
    var el = targets[i];
    el.classList.remove('rv-flash');
    void el.offsetWidth;          // アニメーションを再生し直すため
    el.classList.add('rv-flash');
    setTimeout(function () { el.classList.remove('rv-flash'); }, 4200);
  }
  function jumpTo(i) {
    if (!targets[i]) { return; }
    if (!on) { setOn(true); }
    location.hash = 'chg-' + (i + 1);   // 移動はブラウザが行う
    mark(i);
    setTimeout(place, 0);
  }

  btn.addEventListener('click', function () { setOn(!on); });
  if (xBtn) { xBtn.addEventListener('click', function () { setOn(false); }); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && on) { setOn(false); } });
  window.addEventListener('scroll', onMove, { passive: true });
  window.addEventListener('resize', onMove);
  window.addEventListener('load', function () { if (on) { place(); } });
  setOn(false);

  /* changes.html から #chg-12 で来た場合：カラムを開いてその番号を選ぶ */
  function fromUrl() {
    var i = parseInt((location.hash || '').replace('#chg-', ''), 10) - 1;
    if (i >= 0 && i < targets.length) {
      setOn(true);
      mark(i);
      var fix = function () {
        var r = targets[i].getBoundingClientRect();
        if (r.top < 60 || r.bottom > window.innerHeight - 20) { targets[i].scrollIntoView({ block: 'center' }); }
        place();
      };
      if (document.readyState === 'complete') { setTimeout(fix, 80); }
      else { window.addEventListener('load', function () { setTimeout(fix, 80); }); }
    }
  }
  fromUrl();
  window.addEventListener('hashchange', function () {
    var i = parseInt((location.hash || '').replace('#chg-', ''), 10) - 1;
    if (i >= 0 && i < targets.length) { if (!on) { setOn(true); } mark(i); }
  });
})();
