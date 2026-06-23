/* Dynamite — 最小バニラJS（ランタイム非依存）
   ① ヘッダーのスクロール状態  ② モバイルメニュー  ③ スクロールでフェードイン */
(function () {
  // ① ヘッダー（スクロールで .is-scrolled。ロゴ色は CSS の currentColor 連動）
  var header = document.getElementById('site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ② モバイルメニュー
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('nav-open');
      burger.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { document.body.classList.remove('nav-open'); });
    });
  }

  // ③ スクロールで穏やかにフェードイン
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var items = document.querySelectorAll('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  // ④ ヒーローの写真カルーセル（MURACO風・自動回転）
  var slides = document.querySelectorAll('.hero__slide');
  if (slides.length > 1 && !reduce) {
    var ci = 0;
    setInterval(function () {
      slides[ci].classList.remove('is-active');
      ci = (ci + 1) % slides.length;
      slides[ci].classList.add('is-active');
    }, 5000);
  }
})();
