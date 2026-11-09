(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function FacilityMapper() {
    BaseDataMapper.call(this);
  }
  FacilityMapper.prototype = Object.create(BaseDataMapper.prototype);
  FacilityMapper.prototype.constructor = FacilityMapper;

  // 데이터 소스 — pages.facility[] 는 비어 있는 응답이 흔하다(현재 샘플도 빈 배열).
  // 내용은 전부 property.facilities[] 에서 온다.
  //
  // 원본 special1~6.html 을 facility.html?id= 한 파일로 합쳤다.
  // 시설 순서는 getFacilities() 가 displayOrder 로 정렬한다 —
  // 헤더 서브메뉴 / index 카드 / 이 페이지 탭이 모두 같은 순서를 쓴다.
  FacilityMapper.prototype.getCurrentId = function () {
    var id = new URLSearchParams(window.location.search).get('id');
    if (id) return id;
    // ?id= 없이 들어오면 첫 시설을 보여준다.
    var list = this.getFacilities();
    return list.length ? String(list[0].id) : '';
  };

  FacilityMapper.prototype.mapPage = function () {
    var facility = this.findFacilityById(this.getCurrentId());

    // 시설이 없거나 잘못된 id → 404.
    // 백오피스 preview 에서는 리다이렉트하지 않는다(다른 페이지와 같은 규칙).
    if (!facility) {
      if (!this.isPreviewMode()) {
        window.location.href = '404.html';
        return;
      }
    }

    this.mapPropertyNames();
    this.mapHeading(facility);
    this.mapHeroSlides(facility);
    this.renderFacilityNav(facility);
    this.mapBanner(facility);
    this.mapBottomImages(facility);
    this.mapListIntro();
    this.renderSpecialCards('[data-facility-list-slides]');

    if (typeof window.initFacilitySwipers === 'function') window.initFacilitySwipers();
  };

  FacilityMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: facilities[i].name / nameEn → 히어로 문구
  //
  // 원본 히어로는 em(영문 숙소명) / h3(시설 영문명) / p(시설 한글명) 3줄이다.
  // 영문명이 없으면 h3 에 한글명을 쓰고 p 는 숨긴다 — 같은 문구가 두 줄 반복되면
  // 제목이 두 번 찍힌 것처럼 보인다. (index / facility 카드와 같은 규칙)
  FacilityMapper.prototype.mapHeading = function (facility) {
    var name = this.cleanText(facility && facility.name);
    var nameEn = this.cleanText(facility && facility.nameEn);

    setAllText('[data-facility-name]', nameEn || name);

    var caption = nameEn && name !== nameEn ? name : '';
    document.querySelectorAll('[data-facility-caption]').forEach(function (el) {
      el.textContent = caption;
      el.style.display = caption ? '' : 'none';
    });

    // `SPECIAL No.N` — 정렬된 목록에서의 순번이다(헤더 메뉴 / index 카드와 같은 순서)
    var list = this.getFacilities();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (facility && String(list[i].id) === String(facility.id)) idx = i;
    }
    setAllText('[data-facility-no]', idx >= 0 ? 'SPECIAL No.' + (idx + 1) : 'SPECIAL');
  };

  // 시설 사진 (isSelected 우선). index 카드 전용 사본(special_card)은 뺀다 —
  // 히어로 · 배너는 원본 시설 상세 순서 그대로 가야 한다 (base-mapper renderSpecialCards 참고).
  FacilityMapper.prototype.getPhotos = function (facility) {
    var self = this;
    return this.getSelectedImages((facility && facility.images) || []).filter(function (img) {
      return self.isFacilityPhoto(img);
    });
  };

  // MAPPER: facilities[i].images → .sub_visual 슬라이더
  FacilityMapper.prototype.mapHeroSlides = function (facility) {
    var self = this;
    var images = this.getPhotos(facility);
    var wrapper = document.querySelector('[data-facility-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '부대시설 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '부대시설 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: getFacilities() → .cate_box 시설 탭
  //
  // 원본에는 맨 앞에 '미리보기'(special.html) li 가 있지만 우리 템플릿에는
  // 시설 목록 페이지가 없어 시설만 나열한다. 현재 시설에 .on 을 준다.
  FacilityMapper.prototype.renderFacilityNav = function (facility) {
    var currentId = facility && facility.id;
    var facilities = this.getFacilities();

    document.querySelectorAll('[data-facility-nav]').forEach(function (ul) {
      ul.innerHTML = '';
      facilities.forEach(function (f) {
        var label = String(f.name || '').trim();
        if (!label) return;
        var li = document.createElement('li');
        if (String(f.id) === String(currentId)) li.className = 'on';
        var a = document.createElement('a');
        a.href = './facility.html?id=' + f.id;
        a.textContent = label;
        // 탭이 화면을 넘치면 가로 스크롤로 밀어서 봐야 한다.
        // 스크롤 없이도 전체 이름을 확인할 수 있게 툴팁으로 남긴다.
        a.title = label;
        li.appendChild(a);
        ul.appendChild(li);
      });
    });
  };

  // MAPPER: facilities[i] → .special_top_bnr (사진 + 소제목 + 소개문)
  //
  // 원본 문구는 두 덩이였다.
  //   strong "푸른 동해바다와 함께하는 여행"     ← 배너 소제목
  //   p      "객실 내에서 아름다운 동해바다를 …" ← 소개문
  //
  // 우리 데이터에는 배너 소제목에 대응하는 필드가 없다. **자리를 비워 둔다.**
  //
  // 시설명을 넣지 않는 이유: 이 배너 위에서 시설명이 이미 나온다(히어로 h3).
  // 바로 아래에 또 찍을 값이 아니다.
  //
  // ⚠️ description 의 첫 줄을 소제목으로 올리지도 않는다. description 은
  //    "잔잔하게 흐르는 강을 바라보며\n편안한 쉼의 순간을 느껴보세요." 처럼
  //    한 문장을 줄바꿈한 것이라, 첫 줄만 20px 볼드로 키우면 한 문장이 서로 다른
  //    서체로 쪼개진다. 개행은 줄바꿈일 뿐 제목 경계가 아니다.
  //
  // usageGuide 는 소개문 아래 한 줄 띄고 붙인다(이용 객실 / 운영 기간 등).
  FacilityMapper.prototype.mapBanner = function (facility) {
    var self = this;
    var description = this.cleanText(facility && facility.description);
    var usageGuide = this.cleanText(facility && facility.usageGuide);

    // 소제목은 항상 비어 있다. 원본에서 이 strong 의 margin 이 사진 띠와 소개문
    // 사이 간격을 만들고 있었으므로, 숨길 때는 그 간격을 p 가 대신 갖도록
    // .txt 에 .no_title 을 붙인다 (style.css 참고).
    document.querySelectorAll('[data-facility-title]').forEach(function (el) {
      el.textContent = '';
      el.style.display = 'none';
      var box = el.closest('.txt');
      if (box) box.classList.add('no_title');
    });

    var html = description ? this.nl2br(description) : '';
    if (usageGuide) {
      // 소개문이 있으면 한 줄 띄우고 이어 붙인다
      html += (html ? '<br /><br />' : '') + this.nl2br(usageGuide);
    }

    document.querySelectorAll('[data-facility-description]').forEach(function (el) {
      el.innerHTML = html;
      el.style.display = html ? '' : 'none';
    });

    // 배너 사진은 첫 장. 없으면 placeholder (배너는 이 페이지의 본문이라 유지한다)
    var photos = this.getPhotos(facility);
    var url = photos.length ? photos[0].url : '';
    document.querySelectorAll('[data-facility-bnr-image]').forEach(function (el) {
      self.setBackground(el, url, '부대시설 이미지');
    });
  };

  // MAPPER: facilities[i].images[1..] → .special_btm_bnr 사진 2장
  //
  // 이 배너의 문구는 두 원본이 완전히 같은 영문 고정 문구라 HTML 에 두고
  // 사진만 매핑한다. 배너가 첫 장을 쓰므로 **두 번째 장부터** 가져간다.
  // 사진이 모자라면 앞에서부터 순환해 채운다 — 문구가 본체라 자리가 비면
  // 레이아웃이 무너진다.
  FacilityMapper.prototype.mapBottomImages = function (facility) {
    var self = this;
    var photos = this.getPhotos(facility);
    var pool = photos.length > 1 ? photos.slice(1) : photos;

    document.querySelectorAll('[data-facility-btm-image]').forEach(function (el) {
      var i = Number(el.getAttribute('data-facility-btm-image')) || 0;
      var img = pool.length ? pool[i % pool.length] : null;
      self.setBackground(el, img && img.url, '부대시설 이미지');
    });
  };

  // MAPPER: .main_special .title_box — 배정할 블록이 없어 원본 문구 + 숙소명이다.
  // index 의 같은 자리와 문구를 맞춘다.
  FacilityMapper.prototype.mapListIntro = function () {
    var name = this.getPropertyName();
    setAllText(
      '[data-facility-list-lead]',
      (name ? name + '의 ' : '') + '부대시설과 특장점을 확인해 보세요.'
    );
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new FacilityMapper().initialize();
  });

  global.FacilityMapper = FacilityMapper;
})(window);
