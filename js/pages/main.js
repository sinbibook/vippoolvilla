/* ============================================================
   main.js — 펜션소개 페이지 슬라이더 초기화
   원본 jd38.kr /js/custom.js 의 `.sub_visual` 분기를 옮긴 것.

   매퍼가 슬라이드를 동적으로 만든 뒤 호출되므로 window.initMainSwipers 로
   내보내고, 매퍼가 없는 상황(데이터 로드 실패)에 대비해 스스로도 한 번 돈다.
   ============================================================ */

(function (global) {
  'use strict';

  function initMainSwipers() {
    // 서브 히어로는 main / room / facility 이 같은 규격을 쓴다 (common.js 공용본)
    TplSwiper.initSubVisual('main-hero');
  }

  global.initMainSwipers = initMainSwipers;

  document.addEventListener('DOMContentLoaded', function () {
    setTimeout(function () {
      if (!TplSwiper.instances['main-hero']) initMainSwipers();
    }, 3000);
  });
})(window);
