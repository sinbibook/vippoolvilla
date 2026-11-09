(function (global) {
  'use strict';

  function ReservationMapper() {
    BaseDataMapper.call(this);
  }
  ReservationMapper.prototype = Object.create(BaseDataMapper.prototype);
  ReservationMapper.prototype.constructor = ReservationMapper;

  // 섹션 배정 — pages.reservation.sections[0]
  //   hero.images  → .sub_visual_wide 배경 + 두 dd 의 사진
  //
  // 본문은 섹션이 아니라 property 에서 온다.
  //   INFORMATION → property.address + usageGuide
  //   REFUND INFO → property.refundPolicies + refundSettings
  //
  // ⚠️ 여기 `about` 은 단일 객체다(nearbyAttractions / main 의 배열과 다르다).
  //    배정할 자리가 없어 쓰지 않는다.
  ReservationMapper.prototype.getSection = function () {
    var page = this.getPages().reservation;
    return (page && page.sections && page.sections[0]) || {};
  };

  ReservationMapper.prototype.mapPage = function () {
    this.mapHero();
    this.mapBlockImages();
    this.mapInfo();
    this.mapRefund();
  };

  // 사진 풀 — hero.images → about.images → 숙소 외경/썸네일
  ReservationMapper.prototype.getBlockImages = function () {
    var section = this.getSection();
    var list = this.getSelectedImages((section.hero || {}).images || []).concat(
      this.getSelectedImages((section.about || {}).images || [])
    );
    if (list.length) return list;

    var fallback = this.pickPropertyImage(['exterior', 'thumbnail', 'commonArea']);
    return fallback ? [fallback] : [];
  };

  // MAPPER: hero → .sub_visual_wide (배경 + 설명 한 줄)
  //
  // 원본은 사진 한 장을 깐 띠다. 검은 40% 오버레이 위에 흰 글자가 올라간다.
  // 대제목 `RESERVE` 와 탭은 고정이다.
  //
  // ⚠️ hero.title 을 layout-map 처럼 .sub_title_box 로 내리지 않는다.
  //    이 페이지의 제목 자리가 `INFORMATION` / `REFUND INFO` 라는 고정 라벨이라
  //    업주 문구를 내려놓을 곳이 없다. 히어로 아래 한 줄 자리에서 받는다.
  //    (reservation.hero 에는 description 이 없고 title 만 있다 —
  //     index / main / nearbyAttractions / layoutMap 의 hero 와 다르다)
  ReservationMapper.prototype.mapHero = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var images = this.getBlockImages();

    var desc = this.firstText(hero.title, hero.description, '펜션 이용안내');
    document.querySelectorAll('[data-reservation-hero-description]').forEach(function (el) {
      el.textContent = desc;
    });

    document.querySelectorAll('[data-reservation-hero]').forEach(function (el) {
      self.setBackground(el, images[0] && images[0].url, '숙소 이미지');
    });
  };

  // MAPPER: 두 dd 의 사진.
  // 사진 위 라벨(`펜션정보` / `환불정보`)은 CSS 가 넣는다 — 매퍼가 건드리지 않는다.
  // 히어로가 첫 장을 쓰므로 두 번째 장부터 배분하고, 모자라면 순환해 채운다.
  ReservationMapper.prototype.mapBlockImages = function () {
    var self = this;
    var images = this.getBlockImages();
    var pool = images.length > 1 ? images.slice(1) : images;

    var slots = [
      ['[data-reservation-info-image]', 0, '이용안내 이미지'],
      ['[data-reservation-refund-image]', 1, '환불안내 이미지']
    ];
    slots.forEach(function (slot) {
      var img = pool.length ? pool[slot[1] % pool.length] : null;
      document.querySelectorAll(slot[0]).forEach(function (el) {
        self.setBackground(el, img && img.url, slot[2]);
      });
    });
  };

  // MAPPER: property.address + usageGuide → INFORMATION 본문
  //
  // 원본은 "주소 : …" 한 줄 뒤에 [입퇴실안내] [인원추가정보] [공용바베큐] … 를
  // 이어 붙인 긴 글이다. 그 덩어리가 통째로 property.usageGuide 다.
  //
  // ⚠️ checkInOutInfo 를 함께 붙이면 안 된다. usageGuide 안에 이미 [입퇴실안내]
  //    절이 들어 있어 같은 내용이 두 번 나온다. usageGuide 가 비었을 때만
  //    checkInOutInfo + reservationGuide 로 대신한다.
  ReservationMapper.prototype.mapInfo = function () {
    var self = this;
    var prop = this.getProperty();
    var address = this.cleanText(prop.address);

    var guide = this.cleanText(prop.usageGuide);
    if (!guide) {
      guide = [this.cleanText(prop.checkInOutInfo), this.cleanText(prop.reservationGuide)]
        .filter(Boolean)
        .join('\n\n');
    }

    var parts = [];
    if (address) parts.push('주소 : ' + address);
    if (guide) parts.push(guide);

    var html = parts.join('\n\n');
    document.querySelectorAll('[data-reservation-info-body]').forEach(function (el) {
      el.innerHTML = html ? self.nl2br(html) : '';
    });
  };

  // 환불 규정 한 줄 만들기.
  //   가장 이른 날짜   → "이용일 N일 이전 취소 시"  (그보다 전은 모두 같은 조건)
  //   당일(0일)        → "이용일 당일 취소 시"
  //   그 사이          → "이용일 N일 전 취소 시"
  //   비율 100 / 0     → "전액 환불" / "환불 불가"
  ReservationMapper.prototype.formatRefundPolicies = function () {
    var list = (this.getProperty().refundPolicies || [])
      .filter(function (p) {
        return p && p.refundProcessingDays !== undefined && p.refundProcessingDays !== null;
      })
      .slice()
      .sort(function (a, b) {
        return Number(b.refundProcessingDays) - Number(a.refundProcessingDays);
      });

    if (!list.length) return '';

    var maxDays = Number(list[0].refundProcessingDays);

    return list
      .map(function (policy) {
        var days = Number(policy.refundProcessingDays);
        var rate = Number(policy.refundRate);

        var when;
        if (days === 0) when = '이용일 당일';
        else if (days === maxDays) when = '이용일 ' + days + '일 이전';
        else when = '이용일 ' + days + '일 전';

        var what;
        if (isNaN(rate)) what = '문의';
        else if (rate >= 100) what = '전액 환불';
        else if (rate <= 0) what = '환불 불가';
        else what = rate + '% 환불';

        return '* ' + when + ' 취소 시 ' + what;
      })
      .join('\n');
  };

  // MAPPER: property.refundPolicies / refundSettings → REFUND INFO 본문
  ReservationMapper.prototype.mapRefund = function () {
    var self = this;
    var settings = this.getProperty().refundSettings || {};

    var parts = [];
    var policies = this.formatRefundPolicies();
    if (policies) parts.push(policies);

    var notice = this.cleanText(settings.customerRefundNotice);
    if (notice) parts.push(notice);

    var html = parts.join('\n\n');
    document.querySelectorAll('[data-reservation-refund-body]').forEach(function (el) {
      el.innerHTML = html ? self.nl2br(html) : '';
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new ReservationMapper().initialize();
  });

  global.ReservationMapper = ReservationMapper;
})(window);
