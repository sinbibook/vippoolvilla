/* ============================================================
   room.js — 객실 상세 페이지 슬라이더 초기화
   원본 jd38.kr /js/custom.js 의 `.sub_visual` + `sub_room_detail` 분기를 옮긴 것.

   ⚠️ 하단 객실 목록은 layout-map 과 다르다.
      layout-map(sub2_1)은 CSS 로 만든 2열 그리드라 Swiper 를 쓰지 않지만,
      여기(sub_room_detail)는 원본 sld_opt4 로 3열 슬라이더를 돌린다.
   ============================================================ */

(function (global) {
  'use strict';

  function initRoomSwipers() {
    // 서브 히어로 (main / room / facility 공용 규격)
    TplSwiper.initSubVisual('room-hero');

    // 하단 객실 목록 — 원본 sld_opt4 (200/480/1024/1200 → 1/2/3/3열)
    TplSwiper.initRoomList('room-list', '.main_room .swiper-container', {
      navigation: {
        nextEl: '.main_room .swiper-button-next',
        prevEl: '.main_room .swiper-button-prev'
      },
      // 객실이 한 화면에 다 들어오면 화살표를 숨긴다
      lockHide: '.main_room .arw_box'
    });
  }

  global.initRoomSwipers = initRoomSwipers;

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (!TplSwiper.instances['room-hero']) initRoomSwipers();
    }, 3000);
  });
})(window);
