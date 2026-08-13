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
