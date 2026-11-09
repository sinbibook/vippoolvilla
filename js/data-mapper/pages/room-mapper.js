(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function RoomMapper() {
    BaseDataMapper.call(this);
  }
  RoomMapper.prototype = Object.create(BaseDataMapper.prototype);
  RoomMapper.prototype.constructor = RoomMapper;

  // 데이터 소스 — pages.room[] 은 비어 있는 응답이 흔하다(현재 샘플도 빈 배열).
  // 상세 내용은 전부 customFields.roomtypes[] + 최상위 rooms[] 에서 온다.
  //   roomtypes[i].images  → 히어로 슬라이더 / 배너 사진 / 평면도
  //   rooms[j]             → 객실명·인원·평형·구조·집기품목 (id 로 매칭)
  //
  // 상세 배너 3종의 문구는 두 원본이 **완전히 같은 영문 고정 문구**라(숙소명도 안 들어간다)
  // HTML 에 그대로 두고 사진만 매핑한다.
  // ⚠️ 파라미터 이름이 두 가지다.
  //    우리 링크(헤더 메뉴 / 객실 탭 / 카드)는 `?room_id=` 를 쓰지만,
  //    백오피스 preview 는 `js/preview-handler.js` 가 `?id=` 로 이동시킨다.
  //    한쪽만 읽으면 preview 에서 어느 객실을 골라도 첫 객실만 나온다.
  RoomMapper.prototype.getCurrentId = function () {
    var params = new URLSearchParams(window.location.search);
    var id = params.get('room_id') || params.get('id');
    if (id) return id;
    // ?room_id= 없이 들어오면 첫 객실을 보여준다.
    // (헤더·미리보기 링크는 항상 id 를 붙이므로 직접 URL 을 친 경우다)
    var roomtypes = this.getRoomtypes();
    return roomtypes.length ? String(roomtypes[0].id) : '';
  };

  RoomMapper.prototype.getCurrentRoomtype = function () {
    var id = this.getCurrentId();
    var roomtypes = this.getRoomtypes();
    for (var i = 0; i < roomtypes.length; i++) {
      if (String(roomtypes[i].id) === String(id)) return roomtypes[i];
    }
    return null;
  };

  RoomMapper.prototype.mapPage = function () {
    var roomtype = this.getCurrentRoomtype();

    // 객실이 하나도 없거나 잘못된 room_id → 404.
    // 백오피스 preview 에서는 리다이렉트하지 않는다(layout-map 과 같은 규칙).
    if (!roomtype) {
      if (!this.isPreviewMode()) {
        window.location.href = '404.html';
        return;
      }
    }

    this.mapPropertyNames();
    this.mapRoomHeading(roomtype);
    this.mapHeroSlides(roomtype);
    // ⚠️ 여기만 currentId 를 넘긴다. 그룹 안이면 탭이 그 그룹의 객실로 펼쳐진다.
    //    (헤더 메뉴 / layout-map 은 항상 그룹명으로 접힌 목록이다)
    this.renderRoomNav('[data-room-nav]', roomtype ? roomtype.id : null);
    this.mapTable(roomtype);
    this.mapBannerImages(roomtype);
    this.mapFloorplan(roomtype);
    this.mapRoomListIntro();
    this.renderRoomSlides('[data-room-list-slides]');

    if (typeof window.initRoomSwipers === 'function') window.initRoomSwipers();
  };

  RoomMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // MAPPER: 객실명 + 구조 문자열 → 히어로 문구
  // 원본 히어로는 em(영문 숙소명) / h3(객실명) / p(구조) 3줄이다.
  RoomMapper.prototype.mapRoomHeading = function (roomtype) {
    var room = this.findRoomById(roomtype && roomtype.id) || {};
    var name = this.getRoomtypeName(roomtype);

    setAllText('[data-room-name]', name);
    setAllText('[data-room-structure]', this.formatRoomStructure(room));

    // ⚠️ document.title 은 여기서 건드리지 않는다.
    //    HeaderFooterMapper.updateMetaTags() 가 homepage.seo.title 로 <title> 을 채우는데,
    //    preview-handler 는 페이지 매퍼 → 헤더푸터 매퍼 순으로 돌리고 standalone 은
    //    DOMContentLoaded / headerFooterLoaded 순서가 확정적이지 않다.
    //    여기서 객실명을 넣으면 실행 순서에 따라 제목이 오락가락한다.
  };

  // 객실 사진 — 인테리어만, 인테리어가 하나도 없을 때만 썸네일. 평면도는 섞이지 않는다
  // (getRoomtypeImages 가 category 로 거른다).
  // ⚠️ 예전에는 인테리어 뒤에 썸네일을 덧붙였다(URL 이 같으면 제외). 백오피스는 썸네일을
  //    인테리어 1번과 같은 사진으로 따로 올리는 경우가 많아 URL 만 달라서, 슬라이드 맨 끝에
  //    1번 사진이 한 번 더 나왔다(대노 101호 6장 → 7장, 파일 내용 동일).
  RoomMapper.prototype.getRoomPhotos = function (roomtype) {
    var interior = this.getRoomtypeImages(roomtype, 'roomtype_interior');
    if (interior.length) return interior;
    return this.getRoomtypeImages(roomtype, 'roomtype_thumbnail');
  };

  // MAPPER: roomtypes[i].images → .sub_visual 슬라이더
  RoomMapper.prototype.mapHeroSlides = function (roomtype) {
    var self = this;
    var images = this.getRoomPhotos(roomtype);
    var wrapper = document.querySelector('[data-room-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '객실 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '객실 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: rooms[j] → 객실 정보 표 (PC 5열 / 모바일 4열)
  //
  // 원본은 PC 표에 평형까지 5열, 모바일은 평형을 뺀 4열을 쓴다.
  // 모바일 표는 thead 가 없고 첫 tr 이 머리글 역할을 한다.
  RoomMapper.prototype.mapTable = function (roomtype) {
    var room = this.findRoomById(roomtype && roomtype.id) || {};
    var name = this.getRoomtypeName(roomtype);
    var structure = this.formatRoomStructure(room);
    var pyeong = this.toPyeong(room.size);

    // 값이 없으면 빈 칸 대신 '-' 를 넣는다. 표는 칸이 비면 무너져 보인다.
    var dash = function (v) {
      var s = v === 0 ? '0' : this.cleanText(v);
      return s || '-';
    }.bind(this);

    var cells = [name, room.baseOccupancy, room.maxOccupancy, structure, pyeong];

    function fillRow(tbody, values) {
      var tr = document.createElement('tr');
      values.forEach(function (v) {
        var td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    }

    document.querySelectorAll('[data-room-table-pc]').forEach(function (tbody) {
      tbody.innerHTML = '';
      fillRow(tbody, cells.map(dash));
    });

    // 모바일: 머리글 tr + 값 tr, 평형 제외
    document.querySelectorAll('[data-room-table-m]').forEach(function (tbody) {
      tbody.innerHTML = '';
      fillRow(tbody, ['객실명', '기준', '최대', '유형']);
      fillRow(tbody, cells.slice(0, 4).map(dash));
    });

    this.mapAmenities(room);
  };

  // MAPPER: rooms[j].amenities → .table_text 집기품목
  // PC / 모바일 두 벌 모두에 같은 내용을 넣는다. 없으면 목록째 숨긴다.
  RoomMapper.prototype.mapAmenities = function (room) {
    var list = (room && room.amenities) || [];

    document.querySelectorAll('[data-room-amenities]').forEach(function (ul) {
      ul.innerHTML = '';
      if (!list.length) {
        ul.style.display = 'none';
        return;
      }
      ul.style.display = '';
      var li = document.createElement('li');
      var strong = document.createElement('strong');
      strong.textContent = '집기품목';
      li.appendChild(strong);
      li.appendChild(document.createTextNode(' : ' + list.join(', ')));
      ul.appendChild(li);
    });
  };

  // MAPPER: roomtypes[i].images → 상세 배너 사진 5장
  //
  // 원본은 배너 3종에 사진을 5장 쓴다 (top 2 + wide 1 + txt 2).
  // 1순위는 백오피스 객실의 「컨셉 및 외경 이미지」(roomtype_exterior) — 조각컷을 올리는 칸이다.
  // N 번째 사진이 data-room-bnr-image="N" 칸으로 간다 (template-a 의 조각컷 6자리와 같은 쓰임).
  // 그다음은 크롤러가 원본 컷에 남긴 room_bnr:N 마커 — N 이 곧 칸 번호다.
  // 둘 다 없는 칸은 종전처럼 객실 사진 **두 번째 장부터** 배분한다 (히어로 첫 장이
  // 연달아 나오지 않게). 사진이 모자라면 앞에서부터 순환해 채운다 —
  // 배너는 문구가 본체라 자리가 비면 레이아웃이 무너진다.
  RoomMapper.prototype.mapBannerImages = function (roomtype) {
    var self = this;
    var photos = this.getRoomPhotos(roomtype);
    var exterior = this.getRoomtypeImages(roomtype, 'roomtype_exterior');
    var marked = this.getRoomBannerImages(roomtype);
    var slots = document.querySelectorAll('[data-room-bnr-image]');
    if (!slots.length) return;

    var pool = photos.length > 1 ? photos.slice(1) : photos;

    slots.forEach(function (el) {
      var i = Number(el.getAttribute('data-room-bnr-image')) || 0;
      var img = pool.length ? pool[i % pool.length] : null;
      var cut = exterior[i] && exterior[i].url;
      self.setBackground(el, cut || marked[i] || (img && img.url), '객실 이미지');
    });
  };

  // MAPPER: roomtypes[i] 평면도 → .box.sub_inner
  //
  // 크롤러가 객실 상세의 평면도 영역에서 찾았을 때만 채워지는 필드다.
  // **없으면 제목까지 영역째 숨긴다.** 평면도는 부가 정보라 placeholder 를 세우면
  // 안내 문구만 덩그러니 남는다. (layout-map 의 배치도는 그 페이지의 본 목적이라 반대다)
  //
  // ⚠️ 일반 객실 사진으로 폴백하지 않는다. 평면도 자리에 인테리어 사진이
  //    들어가면 잘못된 정보다.
  RoomMapper.prototype.mapFloorplan = function (roomtype) {
    var self = this;
    var images = this.getRoomFloorplanImages(roomtype);
    var wrap = document.querySelector('[data-room-floorplan]');
    var host = document.querySelector('[data-room-floorplan-images]');

    if (!images.length) {
      if (wrap) wrap.style.display = 'none';
      return;
    }
    if (wrap) wrap.style.display = '';
    if (!host) return;

    var name = this.getRoomtypeName(roomtype);
    host.innerHTML = '';
    images.forEach(function (image) {
      var img = document.createElement('img');
      img.src = image.url;
      img.alt = self.cleanText(image.description) || (name ? name + ' 평면도' : '평면도');
      host.appendChild(img);
    });
  };

  // MAPPER: .main_room .title_box — 배정할 블록이 없어 원본 문구 + 숙소명이다.
  // index / layout-map 의 같은 자리와 문구를 맞춘다.
  RoomMapper.prototype.mapRoomListIntro = function () {
    var name = this.getPropertyName();
    setAllText(
      '[data-room-list-lead]',
      '편안한 휴식이 함께하는 ' + (name ? name + '의 ' : '') + '객실입니다.'
    );
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new RoomMapper().initialize();
  });

  global.RoomMapper = RoomMapper;
})(window);
