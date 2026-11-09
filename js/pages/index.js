/* ============================================================
   index.js — 메인 페이지 슬라이더 초기화
   원본 jd38.kr /js/custom.js 의 index(.main) 분기를 옮긴 것.

   매퍼가 슬라이드를 동적으로 만든 뒤 호출되므로 window.initIndexSwipers 로
   내보내고, 매퍼가 없는 상황(데이터 로드 실패)에 대비해 스스로도 한 번 돈다.
   ============================================================ */

(function (global) {
  'use strict';

  function initIndexSwipers() {
    // ── 히어로 (원본: main_visual) ──────────────────────────
    // fade + loop + autoplay 4초. 슬라이드가 1장이면 TplSwiper 가 loop 를 끈다.
    TplSwiper.init('index-hero', '.main_visual .swiper-container', {
      navigation: {
        prevEl: '.main_visual .swiper-button-prev',
        nextEl: '.main_visual .swiper-button-next'
      },
      loop: true,
      spaceBetween: 0,
      effect: 'fade',
      autoplay: { delay: 4000, disableOnInteraction: false },
      // 히어로가 1장이면 넘길 게 없으므로 화살표를 숨긴다
      lockHide: '.main_visual .arw_box'
    });

    // ── 부대시설 (원본: sld_opt1) ───────────────────────────
    // 2열 기준에 브레이크포인트마다 소수점 열수(1.2 / 2.2 / 2.3)를 써서
    // 다음 카드가 살짝 걸쳐 보이게 한 원본 값을 그대로 따른다.
    TplSwiper.init('index-special', '.main_special .swiper-container', {
      slidesPerView: 2,
      spaceBetween: 0,
      navigation: {
        nextEl: '.main_special .swiper-button-next',
        prevEl: '.main_special .swiper-button-prev'
      },
      breakpoints: {
        200: { slidesPerView: 1.2 },
        641: { slidesPerView: 2.2 },
        1201: { slidesPerView: 2.3 },
        1401: { slidesPerView: 2 }
      },
      lockHide: '.main_special .arw_box'
    });

    // ── 객실 (원본: sld_opt3) ───────────────────────────────
    // ⚠️ index 의 객실 목록은 3열 그리드가 아니다. fade + loop 로 한 장씩 넘긴다.
    //    (layout-map / room 하단은 TplSwiper.initRoomList 의 3열 규격을 쓴다)
    TplSwiper.init('index-room', '.main_room .swiper-container', {
      spaceBetween: 0,
      loop: true,
      effect: 'fade',
      navigation: {
        nextEl: '.main_room .swiper-button-next',
        prevEl: '.main_room .swiper-button-prev'
      },
      lockHide: '.main_room .arw_box'
    });
  }

  global.initIndexSwipers = initIndexSwipers;

  // ── 히어로 영문 숙소명 글자 크기 맞춤 ────────────────────
  // 원본 숙소명(JD38)은 짧아 고정 크기(83 / 75 / 60 / 50px)로 충분했지만
  // `Boryeong Daeno Pension` 처럼 긴 이름은 모바일에서 두 줄로 꺾이고, 둘째 줄이
  // 히어로 사진 아래 밝은 띠로 내려가 흰 글자가 잘린 것처럼 보였다.
  // 한 줄(white-space:nowrap — style.css)로 두고, 넘치면 폭에 맞을 때까지만 줄인다.
  // 짧은 이름은 CSS 크기 그대로다.
  //
  // PC 에서는 가운데 아래 스크롤 화살표(.scroll_down)와 이름 첫 글자가 겹쳤다(대노 1000px).
  // 이름은 오른쪽 정렬이라, 화살표가 보이면 화살표 오른쪽 끝 + 여백부터 판 오른쪽 끝까지를
  // 쓸 수 있는 폭으로 본다.
  var HERO_NAME_ARROW_GAP = 30;

  function fitHeroName() {
    var arrow = document.querySelector('.main_visual .scroll_down img');
    document.querySelectorAll('.main_visual .visual_txt strong em').forEach(function (em) {
      em.style.fontSize = '';
      var box = em.getBoundingClientRect();
      var available = box.width;
      if (arrow && arrow.offsetWidth) {
        var limit = box.right - arrow.getBoundingClientRect().right - HERO_NAME_ARROW_GAP;
        if (limit > 0) available = Math.min(available, limit);
      }
      // em 은 block 이라 폭이 판 전체다 — 글자 자체의 폭은 Range 로 잰다
      var range = document.createRange();
      range.selectNodeContents(em);
      var needed = range.getBoundingClientRect().width;
      if (!available || !needed || needed <= available) return;
      var size = parseFloat(window.getComputedStyle(em).fontSize);
      em.style.fontSize = Math.floor((size * available) / needed) + 'px';
    });
  }

  global.fitIndexHeroName = fitHeroName;

  window.addEventListener('resize', fitHeroName);
  // 웹폰트가 늦게 오면 글자 폭이 달라지므로 다시 잰다
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeroName);

  // 매퍼가 돌지 않는 경우(데이터 로드 실패 등)에도 원본 마크업이 있으면 초기화한다
  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (!TplSwiper.instances['index-hero']) initIndexSwipers();
    }, 3000);
  });
})(window);
