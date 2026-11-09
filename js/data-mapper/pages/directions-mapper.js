(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function DirectionsMapper() {
    BaseDataMapper.call(this);
  }
  DirectionsMapper.prototype = Object.create(BaseDataMapper.prototype);
  DirectionsMapper.prototype.constructor = DirectionsMapper;

  // 섹션 배정 — pages.directions.sections[0]
  //   hero.images        → .sub_visual_wide 배경
  //   hero.title         → .sub_title_box h3
  //   notice             → .map_info dl (dt 제목 + dd 본문)
  //
  // 주소(.map_info strong)와 지도 좌표는 property 에서 온다.
  DirectionsMapper.prototype.getSection = function () {
    var page = this.getPages().directions;
    return (page && page.sections && page.sections[0]) || {};
  };

  DirectionsMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHero();
    this.mapLead();
    this.mapAddress();
    this.mapNotice();
    this.mapKakaoMap();
  };

  DirectionsMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: hero.images → .sub_visual_wide 배경
  // 원본은 사진 한 장을 깐 띠다. 문구(h3 LOCATION / 위치표시 / 탭)는 전부 고정이다.
  DirectionsMapper.prototype.mapHero = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var url =
      this.getFirstSelectedImage(hero.images || []) ||
      (this.pickPropertyImage(['surrounding', 'exterior', 'thumbnail']) || {}).url ||
      '';

    document.querySelectorAll('[data-directions-hero]').forEach(function (el) {
      self.setBackground(el, url, '오시는길 이미지');
    });
  };

  // MAPPER: hero.title → .sub_title_box h3 / 설명은 원본 문구 + 숙소명
  DirectionsMapper.prototype.mapLead = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var name = this.getPropertyName();

    setAllText('[data-directions-title]', this.firstText(hero.title, 'DIRECTIONS'));

    var desc = this.firstText(
      hero.description,
      (name ? name + '에 ' : '') + '찾아 오시는 길을 안내해 드립니다.'
    );
    document.querySelectorAll('[data-directions-description]').forEach(function (el) {
      el.innerHTML = self.nl2br(desc);
    });
  };

  // MAPPER: property.address → .map_info strong
  // 원본은 `주소 : …` 형태다. 주소가 없으면 줄째 숨긴다.
  DirectionsMapper.prototype.mapAddress = function () {
    var address = this.cleanText(this.getProperty().address);
    document.querySelectorAll('[data-directions-address]').forEach(function (el) {
      el.textContent = address ? '주소 : ' + address : '';
      el.style.display = address ? '' : 'none';
    });
  };

  // MAPPER: notice → .map_info dl (dt 제목 + dd 본문)
  //
  // 원본은 `승용차 이용 시` / `대중교통 이용 시` / `픽업 이용 시` dt/dd 를 나열했다.
  // 우리 notice 는 { title, description } 하나뿐이라 항목 하나로 만든다.
  //   description = "지번 : …\n도로명 : …"
  // 제목이 비면 원본 문구를 기본값으로 쓴다.
  //
  // 본문이 아예 없으면 dl 째 숨긴다 — 제목만 남으면 빈 항목이 된다.
  DirectionsMapper.prototype.mapNotice = function () {
    var self = this;
    var notice = this.getSection().notice || {};
    var title = this.firstText(notice.title, '승용차 이용 시');
    var body = this.cleanText(notice.description);

    document.querySelectorAll('[data-directions-notice]').forEach(function (dl) {
      dl.innerHTML = '';
      if (!body) {
        dl.style.display = 'none';
        return;
      }
      dl.style.display = '';

      var dt = document.createElement('dt');
      dt.textContent = title;
      var dd = document.createElement('dd');
      dd.innerHTML = self.nl2br(body);

      dl.appendChild(dt);
      dl.appendChild(dd);
    });
  };

  // ── 지도 ────────────────────────────────────────────────
  // 원본은 daum roughmap 퍼가기 스크립트를 썼다. 업체 고유 key 가 필요해
  // 재현할 수 없으므로 Kakao Maps SDK(js/kakao-maps-sdk.js)로 대체했다.
  //
  // preview 는 데이터가 바뀔 때마다 매핑을 다시 돌린다. 그때마다 new Map() 을
  // 만들면 인스턴스가 쌓이므로, 이미 있으면 중심만 옮긴다.
  DirectionsMapper.prototype.mapKakaoMap = function () {
    var self = this;
    var container = document.getElementById('kakao-map');
    if (!container) return;

    var prop = this.getProperty();
    var lat = Number(prop.latitude);
    var lng = Number(prop.longitude);

    // 좌표가 없어도 영역은 유지한다. 안을 비우면 테두리만 남은 빈 띠가 되어
    // 페이지가 무너진 것처럼 보인다.
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      ImageHelpers.applyBackgroundPlaceholder(container, '지도');
      return;
    }
    container.classList.remove('empty-image-placeholder');
    container.style.backgroundImage = '';

    function createMap() {
      try {
        var position = new kakao.maps.LatLng(lat, lng);

        if (self._kakaoMap) {
          self._kakaoMap.setCenter(position);
          self._kakaoMap.relayout();
          if (self._kakaoMarker) self._kakaoMarker.setPosition(position);
          return;
        }

        self._kakaoMap = new kakao.maps.Map(container, { center: position, level: 4 });
        self._kakaoMarker = new kakao.maps.Marker({ position: position });
        self._kakaoMarker.setMap(self._kakaoMap);

        // 지도가 숨겨진 상태로 생성되면 크기를 0 으로 잡는다. 노출 후 다시 계산한다.
        window.addEventListener('resize', function () {
          if (!self._kakaoMap) return;
          self._kakaoMap.relayout();
          self._kakaoMap.setCenter(position);
        });
      } catch (e) {
        console.error('[directions] kakao map init failed:', e);
      }
    }

    if (window.kakao && window.kakao.maps && window.kakao.maps.load) {
      window.kakao.maps.load(createMap);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new DirectionsMapper().initialize();
  });

  global.DirectionsMapper = DirectionsMapper;
})(window);
