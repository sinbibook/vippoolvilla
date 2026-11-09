(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  // ── 랜딩 진입 판단 ─────────────────────────────────────────
  // index.html 진입을 landing.html 로 돌려야 하면 true. 쿼리 파라미터 없이 "어디서 왔는지(referrer)" 로 가른다.
  //   - 어드민 프리뷰 iframe → false (운영자가 "홈" 탭을 직접 볼 수 있어야 한다)
  //   - pages.landing.sections[0].enabled !== true → false (명시적으로 켠 경우만. 어드민 저장 시
  //     undefined 는 JSON 에서 키째 빠지므로, 누락을 '켜짐' 으로 보면 랜딩을 안 쓰는 숙소가 튕긴다)
  //   - 같은 사이트 안에서 넘어옴 → false (헤더 로고, 랜딩의 자기 자신 카드)
  //   - 랜딩 카드에 등록된 연결 숙소 도메인에서 넘어옴 → false (그 숙소 랜딩의 카드를 눌러 온 경우)
  //   - 그 외(주소 직접 입력·즐겨찾기·검색/외부 링크) → true
  function shouldEnterLanding(landingPage) {
    if (window.top !== window.self) return false;

    var section = landingPage && landingPage.sections && landingPage.sections[0];
    if (!section || section.enabled !== true) return false;

    return !isFromSameSite() && !isFromLinkedProperty(section);
  }

  function getReferrerUrl() {
    try {
      return document.referrer ? new URL(document.referrer) : null;
    } catch (e) {
      return null;
    }
  }

  function isFromSameSite() {
    var ref = getReferrerUrl();
    return !!ref && ref.origin === window.location.origin;
  }

  // 크로스 도메인 referrer 는 브라우저 기본 정책상 origin 만 오므로 호스트로만 비교한다 (www. 유무는 무시).
  function isFromLinkedProperty(section) {
    var ref = getReferrerUrl();
    if (!ref) return false;

    var refHost = normalizeHost(ref.host);
    return ((section && section.about) || []).some(function (card) {
      var domain = card && typeof card.domain === 'string' ? card.domain.trim() : '';
      if (!domain) return false;
      try {
        var url = new URL(/^https?:\/\//i.test(domain) ? domain : 'https://' + domain);
        return normalizeHost(url.host) === refHost;
      } catch (e) {
        return false;
      }
    });
  }

  // 랜딩으로 이동을 시작했으면 true. location.replace 는 즉시 페이지를 떠나지 않으므로,
  // 그 사이 다른 매핑(헤더 등)이 끝나며 부르는 __tplReveal 이 index 를 잠깐 드러내지 않게 막는 데 쓴다.
  var leavingToLanding = false;

  function goToLanding() {
    leavingToLanding = true;
    window.location.replace('landing.html');
  }

  function normalizeHost(host) {
    return String(host || '').toLowerCase().replace(/^www\./, '');
  }

  function IndexMapper() {
    BaseDataMapper.call(this);
  }
  IndexMapper.prototype = Object.create(BaseDataMapper.prototype);
  IndexMapper.prototype.constructor = IndexMapper;

  IndexMapper.prototype.mapPage = function () {
    if (this.maybeRedirectToLanding()) return;

    this.mapPropertyNames();
    this.mapIntroVideo();
    this.mapHero();
    this.mapSpecial();
    this.mapRooms();
    this.mapLandscape();
    this.mapReserve();

    if (typeof window.fitIndexHeroName === 'function') window.fitIndexHeroName();
    if (typeof window.initIndexSwipers === 'function') window.initIndexSwipers();
  };

  // 루트 가드: 랜딩 진입 대상이면 index.html 진입을 landing.html 로 되돌린다 (판단은 shouldEnterLanding).
  IndexMapper.prototype.maybeRedirectToLanding = function () {
    if (!shouldEnterLanding(this.getPages().landing)) return false;

    goToLanding();
    return true;
  };

  // 섹션 배정 — pages.index.sections[0] 의 블록 5개를 전부 쓴다.
  //
  //   hero      → .main_visual              (히어로 슬라이더 + 설명문)
  //   essence   → .main_landscape           (전경 — 사진 + 리드 + 본문)
  //   closing   → .main_reserve 이용안내      (사진 + 문구)
  //   signature → .main_reserve 오시는길      (사진 + 문구)
  //             → .vimeoWrap 인트로 영상 밴드 (signature.videos/mediaType 겸용, mapIntroVideo 참고 —
  //                title/description/images 는 그대로 오시는길이 쓰고 videos/mediaType 만 겸용한다)
  //   gallery   → .main_reserve .reserve_bg  (뒤 배경 사진)
  //
  // ⚠️ .main_special / .main_room 에는 블록을 배정하지 않는다. 두 섹션의 본체는
  //    property.facilities[] 와 customFields.roomtypes[] 라 카드가 데이터로 채워지고,
  //    title_box 의 리드 한 줄만 남는다. 남는 블록을 억지로 붙이면 전경·예약 쪽에서
  //    블록이 모자란다. 이 두 줄은 원본 문장에 숙소명만 끼워 기본값으로 둔다.
  IndexMapper.prototype.getSection = function () {
    var page = this.getPages().index;
    return (page && page.sections && page.sections[0]) || {};
  };

  IndexMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // ── 눈썹/본문 두 슬롯 배분 (G / H 공통 방식) ──────────────
  // 블록의 title / description 중 어느 쪽이 짧은 눈썹이고 어느 쪽이 본문인지
  // **이름만으로는 정해지지 않는다.** 실제 백오피스 데이터가 블록마다 엇갈린다.
  //   essence : title = 150자 한글 문단 / description = 'Stay Close To Every Season'
  //   gallery : title = 'Preview'       / description = 빈 값
  //
  // 이름 대신 길이로 가른다. 긴 문단이 한 줄짜리 자리에 들어가 레이아웃을
  // 무너뜨리는 사고가 훨씬 크게 티가 나기 때문이다.
  IndexMapper.prototype.EYEBROW_MAX = 30;

  IndexMapper.prototype.pickCopy = function (block) {
    var a = this.cleanText(block && block.title);
    var b = this.cleanText(block && block.description);

    if (a && b) {
      return a.length <= b.length ? { eyebrow: a, body: b } : { eyebrow: b, body: a };
    }

    var only = a || b;
    if (!only) return { eyebrow: '', body: '' };
    return only.length <= this.EYEBROW_MAX
      ? { eyebrow: only, body: '' }
      : { eyebrow: '', body: only };
  };

  // 값이 없으면 요소째 숨긴다. 빈 p 를 남기면 원본 margin 때문에 빈 줄이 생긴다.
  IndexMapper.prototype.setCopySlot = function (selector, value, asHtml) {
    var self = this;
    document.querySelectorAll(selector).forEach(function (el) {
      if (!value) {
        el.textContent = '';
        el.style.display = 'none';
        return;
      }
      el.style.display = '';
      if (asHtml) el.innerHTML = self.nl2br(value);
      else el.textContent = value;
    });
  };

  // 블록의 isSelected 이미지 목록
  IndexMapper.prototype.blockImages = function (key) {
    var block = this.getSection()[key] || {};
    return this.getSelectedImages(block.images || []);
  };

  // 여러 블록에서 순서대로 첫 이미지를 찾는다 (앞 블록이 비면 다음으로)
  IndexMapper.prototype.pickImage = function () {
    for (var i = 0; i < arguments.length; i++) {
      var list = this.blockImages(arguments[i]);
      if (list.length && list[0].url) return list[0].url;
    }
    return '';
  };

  /* MAPPER: signature → `.vimeoWrap` (히어로 **위** 인트로 영상 밴드)

     ⚠️ **`mediaType` 은 image/video 택일이라 게이트로 쓴다**(참고값이 아니다).
        `'video'` 가 아니면 `videos[]` 에 값이 남아 있어도 노출하지 않는다.
     ⚠️ 영상이 없으면 `.vimeoWrap` 째 숨긴다. `<video>` 만 비워 두면 브라우저가
        빈 플레이어(컨트롤 바)를 그려 히어로 위에 검은 띠가 남는다
        — `.vimeoWrap` 에는 CSS 규칙이 하나도 없어 크기를 잡아 줄 것도 없다.
     ⚠️ 정본(jd38.kr)/대조(더파란.kr) 둘 다 이 밴드가 없다. 영상 없는 숙소가
        정상 상태이므로 **기본은 숨김**이다.
     ⚠️ F/KIDS1/KIDS3 와 동일하게 `signature.videos`/`signature.mediaType` 을 쓴다.
        `signature.title`/`description`/`images` 는 그대로 `mapReserve()` 가 오시는길
        블록에 쓰므로, 이 함수는 같은 블록의 `videos`/`mediaType` 서브필드만 겸용한다
        — `hero` 는 히어로 슬라이더 전용으로 그대로 남겨 둔다(영상이 있어도 히어로
        영역은 별개로 존재한다). */
  IndexMapper.prototype.mapIntroVideo = function () {
    var signature = this.getSection().signature || {};
    var url =
      signature.mediaType === 'video' ? this.getFirstSelectedImage(signature.videos || []) : '';

    document.querySelectorAll('[data-index-hero-video-wrap]').forEach(function (wrap) {
      wrap.style.display = url ? '' : 'none';
    });
    document.querySelectorAll('[data-index-hero-video]').forEach(function (video) {
      if (url) {
        video.src = url;
      } else {
        video.removeAttribute('src');
      }
    });
  };

  // MAPPER: hero → .main_visual
  //
  // .visual_txt 는 strong(대제목) + p(설명) 2줄이다.
  // 대제목은 `Welcome to {영문 숙소명}` 형태의 장식 문구라 em 만 매핑하고
  // 앞 단어는 HTML 에 고정으로 둔다 (mapPropertyNames 가 채운다).
  //
  // 설명은 폴백 없이 hero.description 만 쓴다.
  // (property.subtitle 로 폴백하면 백오피스에서 의도적으로 비운 값을 되살린다)
  //
  // ⚠️ 다른 슬롯과 달리 **비어도 요소를 숨기지 않는다.** .visual_txt 는
  //    bottom 기준 정렬이라, 이 <p> 가 사라지면 그만큼 제목이 아래로 내려앉는다.
  //    style.css 의 min-height:2.8em 로 두 줄을 잡아 두고 텍스트만 비운다.
  IndexMapper.prototype.mapHero = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var images = this.blockImages('hero');

    document.querySelectorAll('[data-index-hero-description]').forEach(function (el) {
      el.innerHTML = self.nl2br(self.cleanText(hero.description) || '');
    });

    var wrapper = document.querySelector('[data-index-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    // 원본 슬라이드는 내용 없는 배경 <div> 다. 이미지가 없으면 히어로가
    // 통째로 빈 화면이 되므로 placeholder 슬라이드 한 장을 세운다.
    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, 'Hero Image');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, 'Hero Image');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: property.facilities[] → .main_special
  // 카드 마크업이 facility.html 하단과 같아 base 공용 renderSpecialCards 를 쓴다.
  // title_box 리드는 배정할 블록이 없어 원본 문장이 기본값이다 (위 getSection 주석 참고).
  IndexMapper.prototype.mapSpecial = function () {
    var name = this.getPropertyName();
    setAllText(
      '[data-index-special-description]',
      (name ? name + '의 ' : '') + '부대시설과 특장점을 확인해 보세요.'
    );
    this.renderSpecialCards('[data-index-special-list]');
  };

  // MAPPER: customFields.roomtypes[] → .main_room
  // 카드 마크업은 layout-map 과 같아 base 공용 renderRoomSlides 를 쓴다.
  // title_box 리드는 배정할 블록이 없어 원본 문장이 기본값이다.
  IndexMapper.prototype.mapRooms = function () {
    var name = this.getPropertyName();
    setAllText(
      '[data-index-room-description]',
      '편안한 휴식이 함께하는 ' + (name ? name + '의 ' : '') + '객실입니다.'
    );
    this.renderRoomSlides('[data-index-room-list]');
  };

  // MAPPER: essence → .main_landscape
  //
  // 문구 슬롯
  //   .txt_box strong   : 판 제목 (`{영문 숙소명} / Watching Scenery`) ← essence.title
  //   .txt_box p        : 판 안 본문 여러 줄                          ← essence.description
  //   title_box p       : LANDSCAPE 아래 회색 리드 한 줄 — 고정 문구(`{숙소명}의 멋진 전경을…`)
  //
  // 운영 요청(대노)으로 「핵심 메시지 섹션」 제목이 판 제목을 바꾼다. 비면 원본 문구 그대로다.
  // 리드 한 줄은 원본 4곳(jd38 · 더파란 · thesharpps · himong)이 모두 숙소명만 바꾼 같은
  // 문장이라 데이터로 받지 않는다.
  //
  // 사진은 essence → gallery 순으로 찾고, 둘 다 비면 base 의 getLandscapeImages()
  // (pages.main.about[] → main hero → property.exterior)로 떨어진다.
  // 한 장도 없어도 섹션을 숨기지 않고 placeholder 를 세운다 — 영역이 통째로
  // 사라지면 편집자가 이 자리가 있다는 것 자체를 모른다.
  IndexMapper.prototype.mapLandscape = function () {
    var self = this;
    var essence = this.getSection().essence || {};
    var title = this.cleanText(essence.title);
    var name = this.getPropertyName();
    var nameEn = this.getPropertyNameEn();

    setAllText(
      '[data-index-landscape-description]',
      (name ? name + '의 ' : '') + '멋진 전경을 미리보기 하세요.'
    );

    // 판 제목 — 원본 마크업(영문명 span + Watching Scenery)을 처음 한 번 기억해 두고,
    // 제목이 비면 그것으로 되돌린다 (프리뷰는 같은 페이지에서 다시 매핑한다)
    document.querySelectorAll('[data-index-landscape-title]').forEach(function (el) {
      if (el.tplDefaultHtml === undefined) el.tplDefaultHtml = el.innerHTML;
      if (title) {
        el.innerHTML = self.nl2br(title);
        return;
      }
      el.innerHTML = el.tplDefaultHtml;
      el.querySelectorAll('[data-property-name-en]').forEach(function (span) {
        span.textContent = nameEn;
      });
    });

    this.setCopySlot('[data-index-landscape-text]', this.cleanText(essence.description), true);

    var fallback = this.getLandscapeImages();
    var url = this.pickImage('essence', 'gallery') || (fallback[0] && fallback[0].url);

    document.querySelectorAll('[data-index-landscape-image]').forEach(function (el) {
      self.setBackground(el, url, '전경 이미지');
    });
  };

  // MAPPER: closing / signature / gallery → .main_reserve
  //
  //   closing   → 두 블록 뒤에 깔리는 배경 사진(.reserve_bg) + 이용안내 블록 문구
  //   gallery   → 이용안내 블록 사진
  //   signature → 오시는길 블록 (사진 + 문구) — videos/mediaType 은 mapIntroVideo() 가 따로 씀
  //
  // ⚠️ 운영자는 「마무리 섹션」 사진을 맨 아래 배경으로 기대한다(대노 피드백 —
  //    마무리 섹션에 넣었는데 배경이 안 바뀐다). 그래서 배경은 closing 이 1순위이고
  //    closing → gallery → hero 로 떨어진다. 이용안내 사진은 gallery → hero 다.
  //    배경이 gallery 로 떨어졌을 때 이용안내 사진까지 gallery 면 같은 사진이 두 번 나오므로
  //    이용안내는 배경과 다른 첫 사진을 쓴다.
  //
  // 두 블록 모두 문구가 비면 숙소명을 끼운 원본 문장이 기본값이다.
  // 이 섹션은 문구가 본체라 사진이 없다고 섹션을 숨기지 않는다(placeholder 로 남긴다).
  IndexMapper.prototype.mapReserve = function () {
    var self = this;
    var name = this.getPropertyName();

    this.setCopySlot(
      '[data-index-reserve-text]',
      this.pickCopy(this.getSection().closing).body ||
        '치열한 일상에서 벗어나 다양한 즐거움이 있는 ' +
          (name ? name + '에서 ' : '') +
          '행복한 추억을 만드세요.',
      true
    );
    this.setCopySlot(
      '[data-index-directions-text]',
      this.pickCopy(this.getSection().signature).body ||
        (name ? name + '의 ' : '') + '위치와 찾아오시는 길을 안내해 드립니다.',
      true
    );

    var bg = this.pickImage('closing', 'gallery', 'hero');
    var reserve = [this.pickImage('gallery'), this.pickImage('hero')].filter(function (url) {
      return url && url !== bg;
    })[0];

    var slots = [
      ['[data-index-reserve-image]', reserve || bg, '이용안내 이미지'],
      [
        '[data-index-directions-image]',
        this.pickImage('signature', 'hero'),
        '오시는길 이미지'
      ],
      ['[data-index-reserve-bg]', bg, '']
    ];
    slots.forEach(function (slot) {
      document.querySelectorAll(slot[0]).forEach(function (el) {
        self.setBackground(el, slot[1], slot[2]);
      });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new IndexMapper().initialize();
  });

  // 조기 랜딩 가드 — 매핑을 기다리지 않고 이 스크립트가 로드되자마자 랜딩 여부부터 판단한다.
  //   standalone 에서는 preview-handler 가 어드민 데이터를 2초 기다린 뒤에야 index 를 매핑하는데,
  //   그 사이 헤더 매핑이 렌더 게이트를 먼저 풀어 매핑 전 index(히어로 < > 화살표 등)가 보였다가
  //   랜딩으로 넘어갔다. 판단이 끝날 때까지 __tplReveal 을 붙잡아 둔다.
  //   - 랜딩 진입 대상(shouldEnterLanding) → 화면을 풀지 않고 곧장 landing.html. 이동 판단 뒤에 헤더 매핑이
  //     끝나며 노출을 요청해도 무시한다 (판단 = 노출 허용으로 보면 페이지를 떠나기 직전 index 가 비친다)
  //   - 그 외 → 붙잡아 둔 노출을 그대로 진행 (기존과 같은 화면. JSON 한 번 더 읽는 시간만큼 늦게 뜰 수 있다)
  //   - 네트워크 실패/지연 대비 3초 뒤에는 무조건 판단을 끝낸다 (head 의 렌더 게이트 타임아웃과 같은 값)
  //   iframe(어드민 프리뷰)·내부 이동은 JSON 을 읽기 전에 바로 건너뛴다 (어차피 랜딩으로 안 보낸다).
  (function earlyLandingGate() {
    if (window.top !== window.self) return;
    if (isFromSameSite()) return;

    var reveal = window.__tplReveal;
    var decided = false;
    var pending = false;

    function finish() {
      if (decided) return;
      decided = true;
      if (pending && reveal) reveal();
    }

    window.__tplReveal = function () {
      if (leavingToLanding) return; // 랜딩으로 떠나는 중 — 노출하지 않는다
      if (decided) {
        if (reveal) reveal();
      } else {
        pending = true;
      }
    };

    setTimeout(function () {
      pending = true;
      finish();
    }, 3000);

    fetch('standard-template-data.json?t=' + Date.now())
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var customFields = (data && data.homepage && data.homepage.customFields) || (data && data.customFields) || {};
        var landing = customFields.pages && customFields.pages.landing;
        if (!decided && shouldEnterLanding(landing)) {
          decided = true;
          goToLanding(); // 노출하지 않고 이동한다 (이후 들어오는 노출 요청은 무시)
          return;
        }
        finish();
      })
      .catch(finish);
  })();

  global.IndexMapper = IndexMapper;
})(window);
