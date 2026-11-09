(function (global) {
  'use strict';

  function setAllText(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) {
      el.textContent = value;
    });
  }

  function MainMapper() {
    BaseDataMapper.call(this);
  }
  MainMapper.prototype = Object.create(BaseDataMapper.prototype);
  MainMapper.prototype.constructor = MainMapper;

  MainMapper.prototype.mapPage = function () {
    this.mapPropertyNames();
    this.mapHero();
    this.mapWelcome();
    this.mapAboutBlocks();

    if (typeof window.initMainSwipers === 'function') window.initMainSwipers();
  };

  // 섹션 배정 — pages.main.sections[0]
  //
  //   hero     → .sub_visual (히어로 슬라이더) + .about_wide_bnr (인사말)
  //   about[]  → .about_img_wrap .box[] (특장점 — 블록당 카드 1개, 좌우 교차)
  //
  // 원본 about.html + view.html 을 한 페이지로 병합했다. 히어로는 view.html 의
  // 슬라이더(.sub_visual)를 쓰고 본문은 about.html 을 쓴다.
  // view.html 맨 아래 클로징 배너(.view_btm_bnr)는 뺐다 — 마커 없는 숙소에서 바로 위
  // 특장점 사진이 한 번 더 나왔고(대노 바베큐), 운영 요청으로 영역째 삭제했다.
  MainMapper.prototype.getSection = function () {
    var page = this.getPages().main;
    return (page && page.sections && page.sections[0]) || {};
  };

  MainMapper.prototype.mapPropertyNames = function () {
    setAllText('[data-property-name-en]', this.getPropertyNameEn());
    setAllText('[data-property-name]', this.getPropertyName());
    this.applyPropertyCaptions();
  };

  // 값이 없으면 요소째 숨긴다. 빈 p 를 남기면 원본 margin 때문에 빈 줄이 생긴다.
  MainMapper.prototype.setCopySlot = function (selector, value, asHtml) {
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

  // MAPPER: hero.images → .sub_visual 슬라이더
  //
  // 히어로 문구(em / h3 / p)는 매핑 대상이 아니다.
  //   em = 영문 숙소명 (mapPropertyNames)
  //   h3 = 'ABOUT' 고정
  //   p  = `빛처럼 맑고 아름다운 {숙소명}` — 두 원본이 같은 문장이라 하드코딩한다
  MainMapper.prototype.mapHero = function () {
    var self = this;
    var name = this.getPropertyName();
    var images = this.getSelectedImages((this.getSection().hero || {}).images || []);

    setAllText('[data-main-hero-lead]', '빛처럼 맑고 아름다운 ' + name);

    var wrapper = document.querySelector('[data-main-hero-slides]');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    // 사진이 한 장도 없으면 히어로가 빈 영역이 되므로 placeholder 한 장을 세운다
    if (!images.length) {
      var empty = document.createElement('div');
      empty.className = 'swiper-slide';
      ImageHelpers.applyBackgroundPlaceholder(empty, '외경 이미지');
      wrapper.appendChild(empty);
      return;
    }

    images.forEach(function (img) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';
      self.setBackground(slide, img.url, '외경 이미지');
      wrapper.appendChild(slide);
    });
  };

  // MAPPER: hero → .about_wide_bnr (인사말)
  //
  // 이 페이지에서 **데이터로 받는 본문은 여기 하나뿐이다.**
  // 두 원본을 대조했을 때 나머지 고정 문구는 숙소명만 갈아끼운 같은 문장인데,
  // 이 문단만 숙소마다 내용이 다르다.
  //
  // 사진은 원본 about.html 이 고른 컷(외경 사본의 about_banner 마커)이 1순위다.
  // 마커가 없으면 hero.images 의 **두 번째 장**을 쓴다 — 바로 위 슬라이더 첫 장과
  // 같은 사진이 연달아 나오지 않게 한다. 한 장뿐이면 그 한 장을 그대로 쓴다.
  MainMapper.prototype.mapWelcome = function () {
    var self = this;
    var hero = this.getSection().hero || {};
    var name = this.getPropertyName();
    var images = this.getSelectedImages(hero.images || []);
    var pick = images[1] || images[0];

    setAllText('[data-main-welcome-lead]', name + '에 오신 것을 환영합니다.');

    // 인사말 대제목: hero.title 이 1순위, 없으면 원본 문구(`Welcome to {영문 숙소명}`).
    // HTML 은 `Welcome to <span data-property-name-en>` 두 조각이지만, hero.title 이
    // 들어오면 그 자리를 통째로 대체한다(업주가 쓴 제목을 쪼개면 안 된다).
    var title = this.cleanText(hero.title);
    document.querySelectorAll('[data-main-welcome-title]').forEach(function (el) {
      if (!title) return; // 비면 HTML 의 기본 조각(`Welcome to {영문명}`)을 그대로 둔다
      el.textContent = title;
    });

    this.setCopySlot('[data-main-welcome-text]', this.cleanText(hero.description), true);

    document.querySelectorAll('[data-main-welcome-image]').forEach(function (el) {
      self.setBackground(
        el,
        self.getViewBannerImage('about_banner') || (pick && pick.url),
        '숙소 소개 이미지'
      );
    });
  };

  // MAPPER: about[] → .about_img_wrap .box[]
  //
  // 블록 하나가 카드 하나다. 홀/짝으로 좌우가 교차하는데, **좌우를 정하는 것은
  // DOM 순서다** (.img / .txt 가 각각 49% inline-block 이라 먼저 온 쪽이 왼쪽).
  //   홀수 카드 : .img → .txt  (사진 왼쪽)
  //   짝수 카드 : .txt → .img  (사진 오른쪽)
  // style.css 의 `.about_img_wrap .box:nth-of-type(2n) .txt` 가 그에 맞춰
  // text-align 을 오른쪽으로 돌린다.
  //
  // 블록이 하나도 없으면 섹션째 숨긴다 — 제목만 남은 빈 영역이 생기는 것보다 낫다.
  // (인사말 .about_wide_bnr 은 페이지 본체라 비어도 placeholder 로 남긴다)
  //
  // ⚠️ 마지막 블록은 원본 about.html 의 `.about_img_list`(사진 3장 가로 + 제목/설명)다.
  //    크롤러가 원본 4곳 모두에서 이 영역을 about[] 마지막 블록(사진 3장)으로 담는다
  //    (template-i/crawl.js). 예전에는 이 블록도 카드로 그려 사진이 1장만 나왔다(대노 Barbecue).
  //    판정은 사진 수로 한다 — 마지막 블록에 사진이 2장 이상이면 사진 영역, 1장 이하면 카드다.
  MainMapper.prototype.ABOUT_PHOTOS_MAX = 3;

  MainMapper.prototype.mapAboutBlocks = function () {
    var self = this;
    var name = this.getPropertyName();
    var list = document.querySelector('[data-main-about-list]');
    var wrap = document.querySelector('[data-main-about-wrap]');

    setAllText('[data-main-about-lead]', name + '만의 특장점');

    if (!list) return;
    list.innerHTML = '';

    // 사진도 문구도 없는 블록은 건너뛴다 (빈 카드가 여백만 차지한다)
    var blocks = (this.getSection().about || [])
      .map(function (block) {
        return {
          title: self.cleanText(block.title),
          desc: self.cleanText(block.description),
          images: self.getSelectedImages(block.images || []).filter(function (image) {
            return image.url;
          })
        };
      })
      .filter(function (b) {
        return b.title || b.desc || b.images.length;
      });

    var last = blocks[blocks.length - 1];
    var photos = last && last.images.length >= 2 ? blocks.pop() : null;
    this.mapAboutPhotos(photos);

    var rendered = 0;
    blocks.forEach(function (block) {
      var title = block.title;
      var desc = block.desc;

      var box = document.createElement('div');
      box.className = 'box';

      var img = document.createElement('div');
      img.className = 'img';
      self.setBackground(img, block.images[0] && block.images[0].url, '특장점 이미지');

      var txt = document.createElement('div');
      txt.className = 'txt';
      var strong = document.createElement('strong');
      strong.textContent = title;
      var p = document.createElement('p');
      p.innerHTML = self.nl2br(desc);
      txt.appendChild(strong);
      txt.appendChild(p);

      // 짝수 카드는 문구가 먼저 와서 사진이 오른쪽에 놓인다
      if (rendered % 2 === 1) {
        box.appendChild(txt);
        box.appendChild(img);
      } else {
        box.appendChild(img);
        box.appendChild(txt);
      }

      list.appendChild(box);
      rendered += 1;
    });

    // 제목(SOMETHING SPECIAL)은 이 래퍼 안에 있어 사진 영역만 있어도 남긴다
    if (wrap) wrap.style.display = rendered || photos ? '' : 'none';
  };

  // MAPPER: about[] 마지막 블록 → .about_img_list (사진 최대 3장 + 제목/설명)
  // 해당 블록이 없으면 영역째 숨긴다.
  MainMapper.prototype.mapAboutPhotos = function (block) {
    var self = this;
    var host = document.querySelector('[data-main-about-photos]');
    if (!host) return;
    if (!block) {
      host.style.display = 'none';
      return;
    }
    host.style.display = '';

    var ul = host.querySelector('[data-main-about-photos-list]');
    if (ul) {
      ul.innerHTML = '';
      block.images.slice(0, this.ABOUT_PHOTOS_MAX).forEach(function (image) {
        var li = document.createElement('li');
        self.setBackground(li, image.url, '특장점 이미지');
        ul.appendChild(li);
      });
    }
    this.setCopySlot('[data-main-about-photos-title]', block.title);
    this.setCopySlot('[data-main-about-photos-text]', block.desc, true);
  };

  document.addEventListener('DOMContentLoaded', function () {
    // 초기화 주체는 preview-handler 다. 중복 실행을 막는다.
    if (window.previewHandler) return;
    new MainMapper().initialize();
  });

  global.MainMapper = MainMapper;
})(window);
