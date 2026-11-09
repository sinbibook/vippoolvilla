/* ============================================================
   facility.js — 부대시설 상세 페이지 슬라이더 초기화
   원본 jd38.kr /js/custom.js 의 `.sub_visual` + `sub_special_detail` 분기를 옮긴 것.
   ============================================================ */

(function (global) {
  'use strict';

  function initFacilitySwipers() {
    // 서브 히어로 (main / room / facility 공용 규격)
    TplSwiper.initSubVisual('facility-hero');

    // 하단 시설 목록 — 원본 sld_opt2 (200/480/981/1024 → 1/2/3/3열)
    // ⚠️ index 의 .main_special 은 sld_opt1(2열, 소수점 열수)이라 규격이 다르다.
    var el = document.querySelector('.main_special .swiper-container');
    var count = el ? el.querySelectorAll('.swiper-slide').length : 0;
    var cap = function (n) {
      return Math.min(n, count || 1);
    };

    TplSwiper.init('facility-list', '.main_special .swiper-container', {
      loop: count > cap(3),
      slidesPerView: cap(3),
      spaceBetween: 45,
      navigation: {
        nextEl: '.main_special .swiper-button-next',
        prevEl: '.main_special .swiper-button-prev'
      },
      breakpoints: {
        200: { slidesPerView: 1, spaceBetween: 20 },
        480: { slidesPerView: cap(2), spaceBetween: 20 },
        981: { slidesPerView: cap(3), spaceBetween: 30 },
        1024: { slidesPerView: cap(3), spaceBetween: 45 }
      },
      // 시설이 한 화면에 다 들어오면 화살표를 숨긴다
      lockHide: '.main_special .arw_box'
    });
  }

  global.initFacilitySwipers = initFacilitySwipers;

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (!TplSwiper.instances['facility-hero']) initFacilitySwipers();
    }, 3000);
  });
})(window);
