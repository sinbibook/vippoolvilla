/* ============================================================
   common.js — 전 페이지 공통 스크립트
   원본 jd38.kr /js/custom.js 의 UI 동작을 옮긴 것 (대조: 더파란.kr — 두 파일은 바이트 동일).

   - PC LNB hover 패널 / 모바일 aside / aside 아코디언
   - 스크롤 시 헤더 축소(.header.on) + 로고 교체(.logo ↔ .logo2)
   - 히어로 scroll_down 버튼

   헤더·푸터는 header-footer-loader.js 가 fetch 로 주입하고, 객실·시설 메뉴는
   매퍼가 나중에 만든다. 그래서 바인딩은 window.loaderReady 이후에 하고
   동적으로 생기는 요소는 전부 이벤트 위임으로 잡는다.

   ⚠️ 원본에서 `.header.on` 은 "스크롤됨"이다 (t-template-G 와 반대).
      G(playbeach)에서는 `.on` 이 LNB 패널 열림이라 스크롤에 붙이면 메뉴가 저절로
      열렸지만, 여기서는 `.logo` → `.logo2` 로 갈아끼우는 축소 상태를 뜻한다.

   ⚠️ Swiper 초기화는 원본처럼 여기서 하지 않는다. 매퍼가 슬라이드를 생성한 뒤
      js/pages/*.js 가 아래 TplSwiper 로 초기화한다.
   ============================================================ */

// 원본과 동일: 이 폭 아래에서는 헤더 축소/로고 교체를 하지 않는다(모바일은 aside)
var HEADER_SHRINK_MIN_WIDTH = 861;

$(function () {
  (window.loaderReady || Promise.resolve()).then(function () {
    // ── PC LNB hover 패널 ──────────────────────────────────
    // 메뉴 영역에 들어가면 서브메뉴(.depth_box)가 내려오고 뒤에 반투명 흰 판
    // (.hd_lnb_bg)이 깔린다. 원본은 mouseover/out 이라 자식으로 옮길 때마다
    // 껐다 켜져 깜빡인다. 버블링하지 않는 mouseenter/leave 로 바꿨다.
    $(document).on('mouseenter', '#hd_lnb, .hd_lnb_bg', function () {
      $('.depth_box, .hd_lnb_bg').addClass('on');
      syncLnbPanel();
    });
    $(document).on('mouseleave', '#hd_lnb, .hd_lnb_bg', function () {
      $('.depth_box, .hd_lnb_bg').removeClass('on');
      resetLnbPanel();
    });

    // ── 서브메뉴 높이 ──────────────────────────────────────
    // ⚠️ 원본은 .hd_lnb_bg 가 height:300px 로 **고정**이고 .depth_box 는
    //    높이가 auto 라 항목 수만큼 무한히 늘어난다. 객실이 많은 숙소면
    //    (jd38 원본도 7실이다) 메뉴가 흰 판 아래로 흘러내린다.
    //    배경판이 서브메뉴를 덮도록 높이를 맞춰 준다.
    //
    // 그래도 화면을 넘길 만큼 길면 뷰포트에 맞춰 자르고 그 목록만 스크롤시킨다.
    // ⚠️ display:none 인 요소는 scrollHeight 가 0 이다. CSS 로 이미 펼쳐진
    //    (.on 이 붙은) 상태에서 재야 실제 값이 나온다.
    var LNB_BOTTOM_GAP = 20; // 화면 아래 남길 여백
    var LNB_PANEL_PAD = 30; // 색판이 목록 아래로 더 내려오는 여유
    var LNB_MAX_ITEMS = 15; // 이보다 많으면 목록을 자르고 스크롤시킨다

    // 위에서 n 번째 항목 끝까지의 높이. 반응형으로 글자 크기가 달라지므로
    // 값을 박지 않고 실제 위치를 잰다. 항목이 n 개 이하면 자를 필요가 없다.
    function itemsHeight($box, n) {
      var items = $box.children('li');
      if (items.length <= n) return Infinity;
      var top = $box[0].getBoundingClientRect().top;
      return items.eq(n - 1)[0].getBoundingClientRect().bottom - top;
    }

    // ⚠️ .depth_box / .hd_lnb_bg 는 열릴 때 transition 으로 움직인다(지금은 10px 내려오며
    //    나타나고, 예전 원본 방식은 top:-500% 에서 미끄러져 내려왔다). mouseenter 직후에 재면
    //    출발점이 잡혀 색판이 짧아진다(객실 18실에서 목록이 판 밖으로 100px 넘게 흘렀다).
    //    transition 을 끈 복제본을 같은 자리에 잠깐 붙여 **도착 위치**를 잰다.
    function measureOpen(el, fn) {
      var probe = el.cloneNode(true);
      probe.style.transition = 'none';
      probe.style.visibility = 'hidden';
      probe.classList.add('on');
      el.parentNode.appendChild(probe);
      try {
        return fn(probe);
      } finally {
        el.parentNode.removeChild(probe);
      }
    }

    function syncLnbPanel() {
      var $bg = $('.hd_lnb_bg');
      var bottom = 0;

      $('.hd_lnb .depth_box.on').each(function () {
        var $box = $(this);

        // 상한을 풀고 실제 내용 높이를 잰다
        $box.css({ 'max-height': '', 'overflow-y': '' });

        var boxBottom = measureOpen(this, function (probe) {
          // 화면에 남는 높이와 15개 높이 중 작은 쪽으로 자른다
          var top = probe.getBoundingClientRect().top;
          var room = $(window).height() - top - LNB_BOTTOM_GAP;
          var cap = Math.min(room, itemsHeight($(probe), LNB_MAX_ITEMS));

          if (probe.scrollHeight > cap) {
            var height = Math.max(120, cap);
            $box.css({ 'max-height': height + 'px', 'overflow-y': 'auto' });
            return top + height;
          }
          return probe.getBoundingClientRect().bottom;
        });

        if (boxBottom > bottom) bottom = boxBottom;
      });

      if (!$bg.length || !bottom) return;
      // 색판 위쪽은 CSS 가 정한 자리를 그대로 두고 아래로만 늘린다
      var bgTop = measureOpen($bg[0], function (probe) {
        return probe.getBoundingClientRect().top;
      });
      var need = bottom - bgTop + LNB_PANEL_PAD;
      $bg.css('height', Math.max(need, 0) + 'px');
    }

    function resetLnbPanel() {
      $('.hd_lnb .depth_box').css({ 'max-height': '', 'overflow-y': '' });
      $('.hd_lnb_bg').css('height', '');
    }

    // 열려 있는 동안 창 크기가 바뀌면 다시 계산한다
    $(window).on('resize', function () {
      if ($('.hd_lnb .depth_box.on').length) syncLnbPanel();
    });

    // ── 모바일 aside 토글 ──────────────────────────────────
    $(document).on('click', '.btn_menu, .aside .btn_close', function (e) {
      e.preventDefault();
      if ($('.aside').hasClass('on')) {
        closeAside();
      } else {
        $('.aside, .aside_bg').addClass('on');
        $('html, body').css({ height: '100%', overflow: 'hidden' });
      }
    });
    $(document).on('click', '.aside_bg', closeAside);

    function closeAside() {
      $('.aside, .aside_bg').removeClass('on');
      $('html, body').css({ height: 'inherit', overflow: 'inherit' });
    }

    // ── aside 아코디언 ─────────────────────────────────────
    // ⚠️ .aside .depth1 로 좁힌다. 원본 선택자(.aside .depth1)는 같지만
    //    PC LNB 의 li.depth1 과 클래스명이 겹치므로 범위를 분명히 해 둔다.
    $(document).on('click', '.aside .depth1', function () {
      $('.aside .depth_list').not($(this).next()).slideUp();
      $(this).next().slideToggle();
    });

    // ── 스크롤 상단 on (헤더 축소 + 로고 교체) ──────────────
    // 원본은 매 스크롤마다 fadeIn/fadeOut 을 다시 호출해 애니메이션이 쌓인다.
    // 상태가 실제로 바뀔 때만 전환한다.
    var shrunk = null;

    function syncHeader() {
      if ($(window).width() <= HEADER_SHRINK_MIN_WIDTH) return;
      var next = $(window).scrollTop() > 0;
      if (next === shrunk) return;
      shrunk = next;

      $('#header').toggleClass('on', next);
      $('.logo').stop(true, true)[next ? 'fadeOut' : 'fadeIn']();
      $('.logo2').stop(true, true)[next ? 'fadeIn' : 'fadeOut']();
    }

    $(window).on('scroll resize', syncHeader);
    syncHeader();

    // ── 히어로 scroll_down ────────────────────────────────
    // index 전용. 원본에 등장 애니메이션은 없다(udosky 계열과 다른 점).
    $(document).on('click', '.scroll_down', function (e) {
      e.preventDefault();
      // 높이는 클릭 시점에 잰다. 원본은 로드 시점 값을 캐시해 두어
      // 반응형으로 폭이 바뀌면 엉뚱한 위치로 내려간다.
      $('html, body')
        .stop()
        .animate({ scrollTop: $('.main_visual').height() }, 600);
    });
  });
});

/* ============================================================
   Swiper 공용 헬퍼 (G / H 공통본)
   매퍼가 슬라이드를 동적 생성한 뒤 호출되므로, 같은 컨테이너에
   이미 인스턴스가 있으면 destroy 후 재생성한다.
   ============================================================ */
window.TplSwiper = (function () {
  var instances = {};

  function init(key, selector, options) {
    var el = document.querySelector(selector);
    if (!el) return null;

    // 슬라이드가 하나도 없으면 초기화하지 않는다 (매핑 전/데이터 없음)
    var slideCount = el.querySelectorAll('.swiper-slide').length;
    if (!slideCount) return null;

    if (instances[key]) {
      try {
        instances[key].destroy(true, true);
      } catch (e) {
        /* 이미 파괴된 인스턴스 무시 */
      }
      delete instances[key];
    }

    var opts = options || {};

    // loop 는 화면에 보이는 수보다 슬라이드가 많아야 정상 동작한다.
    // 부족한 상태로 켜면 Swiper 가 레이아웃을 못 잡거나 예외를 던진다.
    var perView = Number(opts.slidesPerView) || 1;
    if (opts.loop && slideCount <= perView) {
      var relaxed = {};
      Object.keys(opts).forEach(function (k) {
        relaxed[k] = opts[k];
      });
      relaxed.loop = false;
      opts = relaxed;
    }

    // 넘길 슬라이드가 없을 때 화살표를 숨길 대상 (Swiper 옵션이 아니므로 분리해 둔다)
    var lockHide = opts.lockHide;
    if (lockHide) {
      var cleaned = {};
      Object.keys(opts).forEach(function (k) {
        if (k !== 'lockHide') cleaned[k] = opts[k];
      });
      opts = cleaned;
    }

    // 한 슬라이더가 실패해도 같은 페이지의 나머지 초기화까지 멈추면 안 된다.
    try {
      instances[key] = new Swiper(selector, opts);
    } catch (e) {
      console.error('[TplSwiper] init failed:', key, selector, e);
      return null;
    }

    if (lockHide) bindLockHide(instances[key], lockHide);
    return instances[key];
  }

  // 슬라이드가 화면에 다 들어와 넘길 게 없으면 화살표 영역을 숨긴다.
  // Swiper 의 watchOverflow(기본 on)가 그 상태를 isLocked / lock·unlock 이벤트로 알려준다.
  // 브레이크포인트마다 slidesPerView 가 달라 잠김 여부가 바뀌므로 resize 에도 다시 본다.
  function bindLockHide(swiper, selector) {
    var target = document.querySelector(selector);
    if (!target || !swiper) return;

    function sync() {
      target.style.display = swiper.isLocked ? 'none' : '';
    }

    swiper.on('lock', sync);
    swiper.on('unlock', sync);
    swiper.on('resize', sync);
    sync();
  }

  // 서브 히어로 공용 초기화 — main / room / facility 이 같은 .sub_visual 을 쓴다.
  // 원본 custom.js 의 `new Swiper('.sub_visual .swiper-container', {...})` 를 그대로 옮겼다
  // (fade + autoplay 4초. 히어로와 달리 loop 는 원본에도 없다).
  function initSubVisual(key) {
    return init(key || 'sub-visual', '.sub_visual .swiper-container', {
      navigation: {
        prevEl: '.sub_visual .swiper-button-prev',
        nextEl: '.sub_visual .swiper-button-next'
      },
      spaceBetween: 0,
      effect: 'fade',
      autoplay: { delay: 4000, disableOnInteraction: false },
      // 사진이 1장이면 넘길 게 없으므로 화살표를 숨긴다
      lockHide: '.sub_visual .arw_box'
    });
  }

  // 객실 카드 목록 공용 초기화 — layout-map / room 상세 하단이 같은 규격을 쓴다.
  // 원본 custom.js 의 sld_opt4 breakpoints 를 따른다 (200/480/1024/1200 → 1/2/3/3열).
  // 객실이 열 수보다 적으면 빈 칸이 생기므로 개수만큼만 배치한다.
  //
  // ⚠️ index(.main)의 .main_room 은 이 규격이 아니다. 원본 sld_opt3 은
  //    fade + loop 로 한 장씩 넘긴다. js/pages/index.js 가 따로 초기화한다.
  var ROOM_MAX_COLS = 3;

  function initRoomList(key, selector, extra) {
    var el = document.querySelector(selector);
    if (!el) return null;

    var count = el.querySelectorAll('.swiper-slide').length;
    if (!count) return null;

    var cap = function (n) {
      return Math.min(n, count);
    };
    var perView = cap(ROOM_MAX_COLS);

    var opts = {
      loop: count > perView,
      slidesPerView: perView,
      spaceBetween: 50,
      roundLengths: true,
      grabCursor: true,
      breakpoints: {
        200: { slidesPerView: 1, spaceBetween: 20 },
        480: { slidesPerView: cap(2), spaceBetween: 20 },
        1024: { slidesPerView: cap(3), spaceBetween: 30 },
        1200: { slidesPerView: perView, spaceBetween: 50 }
      }
    };
    if (extra) {
      Object.keys(extra).forEach(function (k) {
        opts[k] = extra[k];
      });
    }

    return init(key, selector, opts);
  }

  return {
    init: init,
    initSubVisual: initSubVisual,
    initRoomList: initRoomList,
    instances: instances
  };
})();
