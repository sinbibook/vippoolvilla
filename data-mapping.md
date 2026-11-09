# Data Mapping 정의서 — t-template-I

`standard-template-data.json` 기준 HTML의 `data-*` 속성 매핑 정의.

원본 디자인: [jd38.kr](https://jd38.kr/) (정본) / 동일 계열 대조: [더파란.kr](https://xn--9m1b42fp84a.kr/)

두 사이트는 같은 트립일레븐/makehome 원본의 동일 디자인이다.
`reset.css` 와 `custom.js` 는 **바이트 단위로 동일**하고, `style.css` 차이는 146줄(실질 변경 약 35곳)뿐이다.
index 골격은 한 줄도 다르지 않고, 서브페이지 8개 골격도 전부 일치한다
(유일한 차이는 더파란의 객실 상세에 있는 `.box.sub_inner` 평면도 블록 하나다).

갈리는 축은 **브랜드 포인트 색 하나**(jd38 `#8dbed6` / 더파란 `#d1ab57`)뿐이라 그것만
`styles/theme.css` 토큰으로 뽑았다. 서체는 두 사이트가 100% 같다(G 와 다른 점이다).

정본은 **jd38** 로 삼는다. 객실이 7실이라 목록·슬라이더 패턴이 풍부하고,
`style.css` 가 더 최신이며 푸터에 `.calendar` 블록이 더 있다.

베이스 인프라는 **t-template-H** 에서 가져왔다. 원본의 특징 셀렉터 10개를 기존 템플릿에
대조했을 때 H 가 9/10 으로 압도적이었다(다음이 A 7/10, C2 6/10, G 3/10).
`base-mapper` / `preview-handler` / `image-helpers` / `popup` / `kakao-maps-sdk` /
`header-footer-loader` 와 린트 설정을 그대로 쓴다.
**H(udosky)의 디자인은 한 줄도 가져오지 않았다** — CSS·마크업·UI 스크립트는 전부 jd38 원본이다.

## 진행 현황

| 구분   | 파일                                                         | 상태               |
| ------ | ------------------------------------------------------------ | ------------------ |
| 공통   | `styles/theme.css` (토큰 5개)                                | 완료               |
| 공통   | `styles/reset.css` (jd38 원본 이식 + 토큰화)                 | 완료               |
| 공통   | `styles/style.css` (jd38 원본 전체 이식 + 토큰화)            | 완료               |
| 공통   | `styles/popup.css` (공통본)                                  | 완료               |
| 공통   | `js/` 인프라                                                 | H 복사본 그대로    |
| 공통   | `common/header.html` + `header-footer-mapper.js`             | 완료               |
| 공통   | `common/footer.html`                                         | 완료               |
| 공통   | `js/common.js` (원본 `custom.js` UI 동작 + `TplSwiper`)      | 완료               |
| 페이지 | `index.html` + `index-mapper.js` + `pages/index.js`          | 완료               |
| 페이지 | `main.html` + `main-mapper.js` + `pages/main.js`             | 완료               |
| 페이지 | `layout-map.html` + `layout-map-mapper.js`                   | 완료               |
| 페이지 | `room.html` + `room-mapper.js` + `pages/room.js`             | 완료               |
| 페이지 | `facility.html` + `facility-mapper.js` + `pages/facility.js` | 완료               |
| 페이지 | `reservation.html` + `reservation-mapper.js`                 | 완료               |
| 페이지 | `nearby-attractions.html` + `nearby-attractions-mapper.js`   | 완료               |
| 페이지 | `directions.html` + `directions-mapper.js`                   | 완료               |
| 페이지 | `404.html`                                                   | 공통본 그대로 사용 |

---

## 원본 페이지 → 템플릿 파일명

| 원본 (jd38.kr)             | 템플릿                    | 데이터 소스                                  |
| -------------------------- | ------------------------- | -------------------------------------------- |
| `index.html`               | `index.html`              | `pages.index.sections[0]`                    |
| `about.html` + `view.html` | `main.html` (병합)        | `pages.main.sections[0]`                     |
| `room.html` 목록           | `layout-map.html`         | `pages.layoutMap.sections[0]`                |
| `room.html?room_id=`       | `room.html?room_id=`      | `pages.room[]` + `rooms[]`                   |
| `special1~6.html`          | `facility.html?id=`       | `pages.facility[]` + `property.facilities[]` |
| `reservation.html`         | `reservation.html`        | `pages.reservation.sections[0]`              |
| `travel.html`              | `nearby-attractions.html` | `pages.nearbyAttractions.sections[0]`        |
| `traffic.html`             | `directions.html`         | `pages.directions.sections[0]`               |
| —                          | `404.html`                | 공통본                                       |

원본 객실 id 참고 — jd38: `32737~32743` (7실) / 더파란: `32270~32271` (2실).

---

## 구현 원칙

A/B/C2/D2/E2/G/H 와 동일하다.

- 파일명과 JS 구조는 우리 템플릿 구조를 따른다. 원본 `about.html`, `view.html`,
  `special1~6.html`, `travel.html`, `traffic.html` 파일명은 쓰지 않는다.
- 페이지 링크는 GitHub Pages 하위 경로 배포를 위해 상대경로(`./xxx.html`)만 쓴다.
- 이미지·아이콘 등 템플릿 고정 에셋은 `images/` 에 둔다. 원본 도메인(`/assets/...`) 직접 참조 금지.
- **로고는 고정 저장하지 않는다.** `homepage.images[0].logo[isSelected]` → 숙소명 텍스트 → placeholder 3단 폴백.
- **객실 목록의 단일 소스는 `homepage.customFields.roomtypes`** 다. 최상위 `rooms[]` 는
  `roomtypes[i].id === rooms[j].id` 매칭으로 인원/평형/집기 등 **상세값을 조회할 때만** 쓴다.
- 각 페이지 mapper 는 `js/preview-handler.js` 의 `mapperConfig` 에 등록한다. 초기화 주체는
  `preview-handler` 이고, 페이지 매퍼의 `DOMContentLoaded` 핸들러는 `if (window.previewHandler) return;` 로 빠진다.
- **렌더 게이트**: 각 HTML `<head>` 에 `html.tpl-loading body{opacity:0}` + `window.__tplReveal`(3초 타임아웃)을 둔다.
- **원본의 장식용 하드코딩 텍스트는 그대로 둔다.** 모든 영역을 매핑하지 않는다.
- 값이 비어 있으면 `firstText()` / `cleanText()` 가 `trim()` 후 판단해 다음 폴백으로 넘어간다.
- Swiper 초기화는 `TplSwiper.init()` / `TplSwiper.initRoomList()` 를 거친다.

### 문구 매핑 1순위는 항상 `customFields`

각 페이지의 제목·설명 슬롯은 **`pages.{page}.sections[0]` 의 값이 1순위**이고,
비어 있을 때만 원본 문구(+숙소명)를 기본값으로 쓴다.

| 페이지               | 슬롯                     | 1순위                           | 폴백                       |
| -------------------- | ------------------------ | ------------------------------- | -------------------------- |
| `index`              | 전경 리드 / 본문         | `essence` (`pickCopy`)          | 원본 문장 + 숙소명         |
| `index`              | 이용안내 / 오시는길 문구 | `closing` / `signature`         | 원본 문장 + 숙소명         |
| `main`               | 인사말 대제목            | `hero.title`                    | `Welcome to {영문 숙소명}` |
| `main`               | 인사말 본문              | `hero.description`              | 없음(비면 숨김)            |
| `main`               | 특장점 카드              | `about[].title/description`     | 없음(비면 카드 생략)       |
| `layout-map`         | `PREVIEW` 제목/설명      | `hero.title/description`        | `PREVIEW` + 원본 문장      |
| `facility`           | 시설명 / 소개문          | `facilities[].name/description` | 없음                       |
| `reservation`        | 히어로 설명              | `hero.title`                    | `펜션 이용안내`            |
| `nearby-attractions` | `TOURIST SPOT` 제목/설명 | `hero.title/description`        | 원본 문장                  |
| `directions`         | `DIRECTIONS` 제목/설명   | `hero.title/description`        | `DIRECTIONS` + 원본 문장   |
| `directions`         | 교통 안내 제목/본문      | `notice.title/description`      | `승용차 이용 시`           |

**배정할 블록이 없어 하드코딩으로 남긴 자리**는 다음 네 곳뿐이다. 모두 섹션 리드
한 줄이고, 본체는 `facilities[]` / `roomtypes[]` 가 채운다.

- `index` / `layout-map` / `room` 의 `.main_room .title_box p` (`편안한 휴식이 함께하는 …`)
- `index` / `facility` 의 `.main_special .title_box p` (`… 부대시설과 특장점을 …`)
- `main` 의 `.about_wide_bnr` 리드 · `.about_img_wrap` 리드
- `room` / `facility` / `main` 의 배너 영문 문구 — **두 원본이 완전히 동일**해 데이터로 뺄 값이 아니다

### 원본에서 가져오지 않은 것

| 원본                                | 이유                                                               |
| ----------------------------------- | ------------------------------------------------------------------ |
| `board.js` / `board_black.css`      | 예약 게시판. 템플릿은 실시간 예약 링크만 쓴다                      |
| `popup_black.css`                   | 팝업은 우리 `js/popup.js` + `styles/popup.css` 공통본을 쓴다       |
| `jquery.cookie.min.js`              | 위와 같음 (원본 팝업의 "오늘 하루 보지 않기" 전용)                 |
| `#talk_custom_button` (카카오 상담) | bookingplay `tid` 하드코딩이라 데이터로 만들 수 없다               |
| 푸터 `실시간 달력` 링크             | bookingplay 파트너 번호가 URL 에 박힌 값이라 데이터로 만들 수 없다 |

---

## 테마 색상/폰트

`styles/theme.css` 토큰 5개. 토큰 값은 **하나씩만** 두고 폴백은 사용처에서 붙인다
(`font-family: var(--font-en-main), 'Times New Roman', serif`).

| 토큰                | 값 (jd38)       | 더파란    | 사용처                                                     |
| ------------------- | --------------- | --------- | ---------------------------------------------------------- |
| `--color-primary`   | `#f5f5f5`       | 동일      | 밝은 바탕 면 4곳 — 히어로 카피 / 부대시설·소개·객실 배경띠 |
| `--color-secondary` | `#8dbed6`       | `#d1ab57` | 브랜드 포인트 20곳 (불투명 14 + 반투명 5 + aside 패널 1)   |
| `--font-en-main`    | `Lora`          | 동일      | 영문 대제목 19곳                                           |
| `--font-ko-main`    | `Noto Sans KR`  | 동일      | `reset.css` 전역 본문 + 폼 요소, `style.css` 6곳           |
| `--font-ko-sub`     | `Noto Serif KR` | 동일      | 한글 세리프 3곳                                            |

**두 원본이 갈리는 축은 `--color-secondary` 하나뿐이다.** 서체는 100% 동일하다.

반투명 파생 5곳은 `color-mix(in srgb, var(--color-secondary) 90%, transparent)` 로 만든다.
aside 패널 배경(jd38 `#7aa7be`)은 브랜드색을 어둡게 한 값이라
`color-mix(in srgb, var(--color-secondary) 88%, #000)` 로 묶었다 (더파란은 무채색 `#303030`).

`style.css` 에 **하드코딩된 유채색은 하나도 남지 않았다.** 무채색 계조(`#fff` / `#333` /
`#666` / `#e5e5e5` …)와 로고 서체 `Cinzel` 은 하드코딩으로 남긴다 — 브랜드색을 바꿔도
본문 가독성이 흔들리면 안 되고, 로고는 업종·브랜드와 무관한 디스플레이 서체다.

### 하드코딩으로 남긴 값

| 값                                                      | 위치                        | 이유                                                                      |
| ------------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------- |
| `Cinzel`                                                | `.header .logo a, .logo2 a` | 아래 참고                                                                 |
| `#fff` / `#333` / `#666` / `#e5e5e5` / `#1f1d1c` … 19종 | 전역                        | **무채색 계조.** 브랜드색을 바꿔도 본문 가독성·면 대비가 흔들리면 안 된다 |
| `Lato`                                                  | `select, input, textarea`   | 폼 서체 스택의 첫 항목. 실질 렌더는 뒤의 `var(--font-ko-main)` 이 맡는다  |

**`style.css` 에 하드코딩된 유채색은 하나도 없다** (채도>8 인 hex/rgba 0건).
서체 하드코딩도 `Cinzel` 1곳뿐이다 —
`reset.css` 의 `'Noto Sans KR'` 6줄은 `@font-face` **정의부**라 `var()` 를 넣을 수 없다
(사용처인 전역 본문·폼 요소는 토큰으로 바뀌어 있다).

#### `Cinzel`(로고)을 토큰으로 뽑지 않는 이유

- **두 원본이 같은 값**이라 분기축이 아니다 (갈리는 건 이 규칙의 `color` 뿐 —
  jd38 `#fff` / 더파란 `#d1ab57`. 헤더가 히어로 위에 겹치는 구조라 정본의 `#fff` 를 따랐다).
- 이 서체가 **화면에 보이는 경우가 한정적**이다. 로고는 3단 폴백을 타는데,
  `Cinzel` 이 뜨는 건 가운데 한 칸뿐이다.

  | 상황                    | 렌더                                      | Cinzel 노출    |
  | ----------------------- | ----------------------------------------- | -------------- |
  | 로고 이미지 있음        | `<img>` 표시, 텍스트 2줄 숨김             | ❌             |
  | 이미지 없고 숙소명 있음 | 영문명(Cinzel) + 한글명(`--font-ko-main`) | ✅ 영문명 줄만 |
  | 둘 다 없음              | placeholder SVG                           | ❌             |

- 백오피스 테마 슬롯이 5개라 **6번째 토큰은 주입되지 않는다** — standalone 에서만 의미가 생겨
  A~H 전체와 구조가 달라진다.

⚠️ `nameEn` 이 비면 `applyLogo` 가 한글 `name` 을 이 자리에 넣는다. `Cinzel` 은 라틴 전용이라
한글은 `serif` 로 폴백된다(깨지지는 않는다). 원본도 같은 동작이라 그대로 둔다.

### 원본 버그 3건을 고쳤다

| 원본 상태                                      | 조치                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| `Noto Serif KR` 을 3곳에서 쓰면서 로드 안 함   | `theme.css` 에서 `@import` (원본은 조용히 serif 로 폴백 중이었다) |
| `@CHARSET "uft-8"` — 오타 + 대문자라 무효      | `@charset "utf-8"` 로 수정 (CSS 안 한글 주석이 깨지던 원인)       |
| `.main_room .arw_box` 가 1451~1599px 에서 잘림 | 아래 「`main_room` 화살표」 참고                                  |

### 서체 보정용 `margin-bottom: -5px` 를 걷어냈다

원본은 `.sub_title_box h3` / `.sub_location_wrap em` 에 `margin-bottom: -5px` 를 줘서
`Lora` 의 행간을 손으로 당겼다. 서체는 이제 백오피스 테마(`--font-en-main`)에서 바뀌므로
특정 서체에 맞춘 수기 보정은 다른 서체에서 제목과 설명을 겹치게 만든다. 두 곳 모두 뺐다.

`reset.css` 의 `Cinzel` / `Lora` `@import` 3줄은 제거했다 — `theme.css` 가 로드한다.
**`Noto Sans KR` 의 `@font-face` 6블록만 원본 그대로 둔다.** Google Fonts css2 쪽은
가변폰트라 자간·굵기가 미세하게 달라져 원본 화면이 틀어진다.

---

## `.tpl-slot` — 매핑 슬롯 유틸리티

`reset.css` 의 전역 리셋이 `span` · `em` · `a` · `p` · `strong` **각각에**
`color:#333` / `font-family` / `letter-spacing` 을 직접 박아 두어 부모에게서 상속되지 않는다.

원본이 bare 텍스트로 두던 자리를 `data-*` 매핑 때문에 `span` 으로 감싸면,
**감싼 것만으로 글자색이 `#333`, 서체가 본문 고딕으로 떨어진다.**
원본 제작자도 같은 문제를 만나 `.footer .address p` 에 `color:inherit`,
`.main_visual .visual_txt strong/em/p` 에 `font-family:inherit` 를 따로 넣어 뒀다.

```css
.tpl-slot {
  color: inherit;
  font-family: inherit;
  letter-spacing: inherit;
}
```

| 붙인 곳                                   | 없으면 생기는 문제                           |
| ----------------------------------------- | -------------------------------------------- |
| 헤더 `.logo_text` ×2 (`.logo` / `.logo2`) | `#333` + 고딕 (Cinzel 아님)                  |
| index 전경 `.txt_box strong > span`       | `#333` + 고딕 (Lora 아님)                    |
| 푸터 전화 링크 / 번호                     | `#333` — 어두운 푸터(`#1f1d1c`) 위라 안 보임 |
| 푸터 주소 / 업체명 / 대표자 / 사업자번호  | 위와 같음                                    |
| 푸터 야놀자 YBS 링크                      | 위와 같음                                    |

⚠️ **이미 전용 스타일이 있는 곳에는 붙이지 않는다.** 클래스 선택자가 요소 선택자보다
우선해 원본 스타일을 덮어쓴다. `.logo_sub`(자체 색·서체 보유)와
`.main_visual .visual_txt strong em`(부모와 **다른** `#fff` 를 의도적으로 쓰는 강조 줄)이 그렇다.

---

## 레이아웃 규약

### `#header.on` 은 스크롤 상태다

⚠️ **G 와 반대다.** G(playbeach)에서 `.on` 은 LNB 패널 열림이라 스크롤에 붙이면
메뉴가 저절로 열렸지만, jd38 에서 `.on` 은 헤더 축소 상태다.

```css
.header.on .hd_inner { ... }        /* 가로로 눕는 축소 상태 */
.header.on .logo2 { display: none } /* .logo → .logo2 교체 */
```

`js/common.js` 가 `scrollTop > 0` 에서 `.on` 을 붙이고 `.logo` ↔ `.logo2` 를 교체한다.
861px 이하에서는 하지 않는다(모바일은 aside).

### `main_room` 화살표 — 원본에 없는 브레이크포인트를 하나 넣었다

`.main_room .arw_box` 는 `width:1600px` + `left:50%` + `translateX(-50%)` 라
좌우 화살표가 콘텐츠(`.inner` 1400px) 바깥 100px 씩에 놓인다.
뷰포트가 1600px 보다 좁으면 `#wrap { overflow:hidden }` 에 잘려 **화살표가 사라진다.**

원본의 우측 상단 재배치는 `max-width:1450px` 부터라 **1451~1599px 구간이 통째로 조작 불가**가 된다.
index 객실 목록은 autoplay 가 없어(원본 `sld_opt3`) 화살표가 유일한 조작 수단이라,
그 구간에서는 첫 객실만 계속 보인다. 흔한 노트북 해상도(1440~1536px)가 정확히 여기 들어간다.

`@media (max-width: 1599px)` 를 신설하고 원본의 재배치 규칙을 그 블록으로 **옮겼다**(중복 없음).
값은 새로 만들지 않았다 — `top:170px` 은 원본에서도 `.title_box { padding-top:130px }` 인
1024~~1450px 과 짝으로 쓰이던 값이고, `padding-top` 은 `≤1023px` 부터 줄어들므로
1451~~1599px 는 1024~1450px 과 기하학적으로 동일하다.

부대시설(`.main_special .arw_box`)은 `margin-left:585px` 라 오른쪽 끝이 중앙+약 685px 에
그쳐 1451px 에서도 잘리지 않는다 — 손대지 않았다.

### 슬라이더별 autoplay (원본 그대로)

| 슬라이더                   | autoplay | 비고                     |
| -------------------------- | -------- | ------------------------ |
| `main_visual` (히어로)     | 4초      | fade + loop              |
| `sub_visual` (서브 히어로) | 4초      | fade                     |
| `main_special` (index)     | 없음     | 화살표 전용              |
| `main_room` (index)        | 없음     | 화살표 전용, fade + loop |

⚠️ index 의 `.main_room` 은 **3열 그리드가 아니다.** 원본 `sld_opt3` 은 fade + loop 로
한 장씩 넘긴다. `layout-map` / `room` 하단이 `TplSwiper.initRoomList()` 의 3열 규격을 쓴다.

---

## 공통 — `common/header.html` + `common/footer.html`

| `data-*` 속성                       | 소스                                                        |
| ----------------------------------- | ----------------------------------------------------------- |
| `data-logo-image`                   | `homepage.images[0].logo[isSelected].url`                   |
| `data-property-name-en`             | `customFields.property.nameEn` → `property.nameEn`          |
| `data-property-name`                | `customFields.property.name` → `property.name`              |
| `data-booking-link`                 | `property.realtimeBookingId`                                |
| `data-rooms-submenu`                | `customFields.roomtypes[]` (미리보기 li 뒤에 생성)          |
| `data-special-submenu`              | `property.facilities[]` (displayOrder 정렬)                 |
| `data-menu-id="layout-map"`         | `pages.layoutMap.sections[0].enabled` 로 표시/숨김          |
| `data-rooms-link`                   | 대메뉴 ROOMS — 위 값 켜짐 → `layout-map.html` / 꺼짐 → 첫 객실 상세 |
| `data-travel-menu`                  | `pages.nearbyAttractions.sections[0].enabled` 로 표시/숨김  |
| `data-footer-phone`                 | `property.contactPhone[]` (번호 수만큼 복제, `\|` 구분)     |
| `data-footer-phone-link`            | 전화 링크(`tel:`) — 번호 수만큼 복제되는 원본 요소          |
| `data-footer-address`               | `property.address` → `businessInfo.businessAddress`         |
| `data-footer-business-name`         | `businessInfo.businessName`                                 |
| `data-footer-representative`        | `businessInfo.representativeName`                           |
| `data-footer-business-number`       | `businessInfo.businessNumber`                               |
| `data-ybs-button` / `data-ybs-wrap` | `property.ybsId` — 푸터 「야놀자 YBS」 + 헤더(PC)·aside(모바일) 「YBS」 버튼(thehaebeach.co.kr 와 같은 배치). 없으면 `data-ybs-wrap` 째 숨김. 헤더 비켜서기는 루트 `data-ybs` |
| `data-homepage-socialLinks-blog`    | `homepage.socialLinks.blog` — 헤더·aside 「네이버예약」 버튼. 없으면 `data-social-wrap` 째 숨김 |
| `data-homepage-socialLinks-instagram` | `homepage.socialLinks.instagram` — 헤더·aside 「인스타그램」 버튼. 없으면 `data-social-wrap` 째 숨김 |

### 원본과 다르게 한 것

| 위치                | 원본                            | 우리                                                                                           |
| ------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------- |
| `.aside .btn_close` | `.aside` 직속                   | `.aisde_inner` 안 — 원본은 `position:absolute` 기준 조상이 없어 스크롤 시 문서 좌상단에 남는다 |
| `.btn_aside_res`    | `./reservation.html` (이용안내) | `data-booking-link` (실시간 예약) — 모바일 패널의 유일한 예약 CTA 다                           |
| 푸터 `.calendar`    | 실시간 달력 + 개인정보처리방침  | 개인정보처리방침만 (위 「가져오지 않은 것」 참고)                                              |

### 네이버예약 · 인스타그램 (`homepage.socialLinks`)

- 네이버예약은 원본(브리앙뜨 `.btn_hd_res.naver`)과 같은 **글자 버튼**이다 — 예약하기와 같은 클래스·스타일.
  원본 링크는 네이버 플레이스 주소지만 어드민의 `socialLinks.blog` 칸에 넣어 쓴다.
- 인스타그램은 원본에 없어 같은 글자 버튼(`.btn_hd_res.insta`)으로 네이버예약 오른쪽, aside 에서는 그 아래에 둔다.
- 마크업 기본값이 숨김(`style="display: none"`)이고, 값이 있을 때만 매퍼가 푼다(null / 빈 문자열 / 키 없음 → 숨김).
- 헤더 버튼은 모두 `position:absolute; right:0` 이라, 매퍼가 루트에 찍는 `data-social-blog` / `data-social-instagram`
  (`on`/`off`) 으로 CSS 가 왼쪽 버튼들을 한 칸(글자 약 4.3em + 좌우 padding + 10px)씩 비켜 세운다.
- 프리뷰 `section_update` 의 `section === 'socialLinks'` 는 `pages[page].sections[0]` 이 아니라
  `homepage.socialLinks` 에 넣고 헤더만 다시 매핑한다(`HeaderFooterMapper.mapSocialLinks`).

---

## `index.html`

### 섹션 배정 — `pages.index.sections[0]` 의 블록 5개를 전부 쓴다

| 블록        | 화면 섹션                                                 |
| ----------- | ------------------------------------------------------------ |
| `hero`      | `.main_visual` (히어로)                                    |
| `essence`   | `.main_landscape` (전경)                                    |
| `closing`   | `.main_reserve` 배경 사진(`.reserve_bg`) + 이용안내 블록 문구 |
| `signature` | `.main_reserve` 오시는길 블록 + `.vimeoWrap` 인트로 영상 밴드 |
| `gallery`   | `.main_reserve` 이용안내 블록 사진 (배경 폴백)               |

⚠️ `.main_special` / `.main_room` 에는 블록을 배정하지 않는다. 두 섹션의 본체는
`property.facilities[]` 와 `customFields.roomtypes[]` 라 카드가 데이터로 채워지고
`title_box` 의 리드 한 줄만 남는다. 남는 블록을 억지로 붙이면 전경·예약 쪽에서 블록이 모자란다.

### `.vimeoWrap` — 인트로 영상 (히어로 **위** 밴드)

> F / KIDS1 / KIDS3 와 동일하게 `signature.videos` / `signature.mediaType` 으로 매핑한다.
> `signature.title`/`description`/`images` 는 그대로 `.main_reserve` 오시는길 블록이 쓰므로,
> 이 밴드는 **같은 블록의 `videos`/`mediaType` 서브필드만 겸용**한다 — 두 용도가 쓰는 필드가
> 겹치지 않아 기존 오시는길 매핑(`mapReserve`)과 충돌하지 않는다.
> `hero` 는 영상 유무와 무관하게 **항상 별도로 존재하는 히어로 슬라이더 전용** 블록이라 건드리지 않는다.

⚠️ `mediaType` 은 image/video **택일이라 게이트로 쓴다**(참고값이 아니다). `'video'` 가
아니면 `videos[]` 에 값이 남아 있어도 노출하지 않는다.

⚠️ 영상이 없으면 `.vimeoWrap` 째 숨긴다 — `<video>` 만 비워 두면 브라우저가 빈 플레이어
(컨트롤 바)를 그려 히어로 위에 검은 띠가 남는다. `.vimeoWrap` 에는 CSS 규칙이 하나도 없어
크기를 잡아 줄 것도 없다.

⚠️ 정본 jd38.kr / 대조 더파란.kr 둘 다 이 밴드가 **없다.** 영상 없는 숙소가 정상 상태이므로
기본은 숨김이다. (thesharpps.com 같은 개별 숙소가 원본 위에 직접 얹은 커스텀 영상 사례 참고)

⚠️ **크롤러 구현 시 F 의 `signature` 블록 코드를 그대로 베끼면 안 된다.**
`trip-template-crawlers/template-f/crawl.js` 는 `signature` 를 영상 전용으로만 쓰기 때문에
`images: []` 를 **조건 없이 고정값**으로 내보낸다(오시는길 같은 용도가 아예 없어서 채울 코드가
없다). 이 템플릿은 `signature.images` 가 오시는길 사진으로 이미 쓰이고 있으므로, template-I
전용 크롤러는 **`signature.images` 는 기존처럼 실제 오시는길 사진으로 채우고, 별도로
`.vimeoWrap video` 를 찾아 `signature.videos` 에 영상 URL을 채워야 한다** — 두 필드를
동시에 채워도 된다(`mediaType` 은 영상 밴드 노출 여부만 결정할 뿐 `mapReserve()` 의 사진
매핑은 `mediaType` 을 아예 보지 않는다).

| `data-*` 속성                 | 요소                | JSON 경로                                                           |
| ------------------------------ | ------------------- | ---------------------------------------------------------------------- |
| `data-index-hero-video-wrap`  | `.vimeoWrap`        | `signature.mediaType === 'video'` 이면 노출, 아니면 `display:none`    |
| `data-index-hero-video`       | `.vimeoWrap video`  | `signature.videos[isSelected][0].url` → `<video>` 의 `src`            |

크롤러가 `.vimeoWrap video` 를 찾으면 `signature.videos` 에 넣고 `signature.mediaType` 을
`'video'` 로 세팅해야 한다(F/KIDS1/KIDS3 와 동일한 크롤링 규약).

### 눈썹/본문 배분 — `pickCopy()` (G / H 공통 방식)

블록의 `title` / `description` 중 어느 쪽이 짧은 눈썹이고 어느 쪽이 본문인지
**이름만으로는 정해지지 않는다.** 실제 백오피스 데이터가 블록마다 엇갈린다.

```
essence : title = 150자 한글 문단  / description = 'Stay Close To Every Season'
gallery : title = 'Preview'        / description = 빈 값
```

이름 대신 **길이로** 가른다(둘 다 있으면 짧은 쪽이 눈썹, 하나뿐이면 30자 기준).
긴 문단이 한 줄짜리 자리에 들어가 레이아웃을 무너뜨리는 사고가 훨씬 크게 티가 나기 때문이다.

### 슬롯

| `data-*` 속성                      | 소스                                           | 비고                                      |
| ---------------------------------- | ---------------------------------------------- | ----------------------------------------- |
| `data-index-hero-slides`           | `hero.images[isSelected]`                      | 배경 `div` 슬라이드                       |
| `data-index-hero-description`      | `hero.description`                             | 폴백 없음 · **비어도 요소를 안 숨긴다**   |
| `data-index-hero-video-wrap` / `-video` | `signature.videos[isSelected][0]` (`mediaType==='video'` 게이트) | `.vimeoWrap` 인트로 영상 밴드, 아래 상세 참고 |
| `data-index-special-description`   | — (하드코딩)                                   | `{숙소명}의 부대시설과 특장점을…`         |
| `data-index-special-list`          | `property.facilities[]`                        | `renderSpecialCards()`                    |
| `data-index-room-description`      | — (하드코딩)                                   | `편안한 휴식이 함께하는 {숙소명}의 객실…` |
| `data-index-room-list`             | `customFields.roomtypes[]` + `rooms[]`         | `renderRoomSlides()`                      |
| `data-index-landscape-description` | — (하드코딩) `{숙소명}의 멋진 전경을 미리보기 하세요.` | 원본 4곳이 모두 같은 문장                 |
| `data-index-landscape-title`       | `essence.title`                                | 판 제목. 없으면 원본 `{영문명}<br>Watching Scenery` |
| `data-index-landscape-text`        | `essence.description`                          | 없으면 요소째 숨김                        |
| `data-index-landscape-image`       | `essence` → `gallery` → `getLandscapeImages()` |                                           |
| `data-index-reserve-text`          | `pickCopy(closing).body`                       | 없으면 원본 문장                          |
| `data-index-reserve-image`         | `gallery` → `hero` (배경과 같은 사진이면 건너뛴다) |                                           |
| `data-index-directions-text`       | `pickCopy(signature).body`                     | 없으면 원본 문장                          |
| `data-index-directions-image`      | `signature` → `hero`                           |                                           |
| `data-index-reserve-bg`            | **`closing`** → `gallery` → `hero` (「마무리 섹션」 사진 = 맨 아래 배경) |                                           |

매핑하지 않는 장식 고정 문구: `Welcome to`, `SPECIAL`, `ROOMS LIST`, `LANDSCAPE`,
`Watching Scenery`, `Reservation Guide`, `Directions`, `VIEW MORE`, `이용안내 확인`, `오시는길 확인`.

### 히어로 제목에서 업종어를 뺐다

원본은 `Welcome to <em>JD38</em> <span>Pension</span>` 3줄이다.
마지막 줄의 업종어(`Pension` / `Poolvilla` …)는 **가져오지 않는다** — 업종은 숙소마다
달라 고정 문구로 둘 수 없다.

그 `<span>` 은 단순 장식이 아니라 **밝은 띠 위에 놓이는 어두운(`#333`) 줄**이었다.
`.visual_txt` 가 `bottom` 기준 정렬이라 그냥 지우면 흰색 숙소명이 그 자리로 내려가
`--color-primary` 배경 위에서 사실상 안 보인다. `bottom` 값 5개를 그 줄 높이
(`font-size × 0.91 + margin 7px`)만큼 올려 숙소명이 히어로 사진 위에 그대로 남도록 맞췄다.

| 브레이크포인트 | span 높이 | `bottom`           |
| -------------- | --------- | ------------------ |
| 전역           | 62px      | `-130px` → `-68px` |
| ≤1450px        | 53px      | `-122px` → `-69px` |
| ≤1200px        | 53px      | `-116px` → `-63px` |
| ≤1023px        | 43px      | `-107px` → `-64px` |
| ≤640px         | 38px      | `-85px` → `-47px`  |

죽은 `.main_visual .visual_txt strong span` 규칙 5개와 그룹 셀렉터의 참조도 함께 걷어냈다.

### 히어로 설명은 비어도 자리를 지킨다

`.visual_txt` 가 `bottom` 기준 정렬이라, 설명문 `<p>` 가 `display:none` 으로 사라지면
그만큼 제목(`Welcome to` / 숙소명)이 **통째로 아래로 내려앉는다.**
원본은 설명문이 늘 2줄이라 드러나지 않던 문제다.

`style.css` 의 `.main_visual .visual_txt p { min-height: 2.8em }` 로 두 줄 높이를 미리 잡고,
매퍼는 이 슬롯만 숨기지 않고 텍스트만 비운다. 설명문이 3줄 이상이면 자연히 늘어난다.

### 전경 판(`.landscape_box .txt_box`)은 폭 상한만 둔다

⚠️ **원본에 `width` 가 없다.** 판은 내용 폭(shrink-to-fit)으로 잡힌다. 원본 문구는 `<br>` 로
3줄을 직접 끊어 둔 짧은 문장이라 판이 약 290 × 281px 로 **정사각형에 가깝다**(thesharpps 실측).
업주가 긴 소개문(`essence`)을 넣으면 판이 화면 오른쪽 끝까지 늘어나므로 **상한만** 둔다.

```css
box-sizing: border-box;
max-width: min(560px, calc(100% - 60px)); /* 560px = 좌우 패딩 40px 포함, 본문 480px */
```

예전에는 `width: 560px` 로 고정했는데, 원본 문구처럼 짧은 글에서도 판이 가로로 두 배 가까이
늘어나 원본과 모양이 달라졌다. 폭을 고정하지 않고 상한만 두면 짧은 문구는 원본 폭 그대로,
긴 문구는 560px 에서 줄바꿈된다. 한글 150자 기준 판 높이는 약 312px 로 `.img_box`(580px) 안에 들어온다.

### 객실 카드 구조

원본 `.room_list` 마크업을 그대로 만든다 (H 의 것과 다르다).

```
.swiper-slide > a.link + .room_box
  .room_box > .img(배경) + .room_inner_wrap
    .room_inner_wrap > .room_inner_box(strong 객실명 + p 구조 + a.btn_more)
                     + .btm_img > ul > li × 3 (배경)
```

- `.btm_img` 조각컷 3장은 **큰 사진 다음 장부터** 쓴다(같은 사진을 위아래로 겹쳐 쓰지 않는다).
- `.btm_img` 컨테이너는 장수와 무관하게 **항상 만든다.** 원본 CSS 가 `.room_inner_wrap` 안에서
  `.room_inner_box` 와 높이를 나눠 갖는 구조라 빼면 카드 아래쪽이 무너진다.
- `.btn_more` 에 인라인 배경을 주지 않는다. 원본 CSS 가 데스크톱은 단색,
  1023px 이하에서만 `spe_view_w.png` 를 깔도록 이미 나눠 두었다.

### 부대시설 카드 — 번호가 두 번 들어간다

```
.txt_box > span.special_txt(SPECIAL01) + strong(영문명) + p(span.special_txt + 한글명) + a.btn_more
```

⚠️ `.special_txt` 가 두 번 나오는 것은 원본 그대로다. 원본 CSS 가 페이지별로 한쪽만 보여준다 —
index(`.main_special`)는 위 `span`, facility(`.sub_special`)는 `<p>` 안 `span` 을 쓴다.
**둘 다 있어야 양쪽이 산다.**

### 부대시설 카드 사진 — `special_card` 마커

원본 index 카드는 시설 사진 중에서 **손으로 고른 컷**이라 시설 상세 히어로 첫 장과 다르다.
시설 밖 사진을 쓰기도 한다.

| 숙소       | 시설       | 카드 컷             | 시설 상세 히어로 첫 장 |
| ---------- | ---------- | ------------------- | ---------------------- |
| jd38       | 오션뷰     | `special/1/2`       | `special/1/1`          |
| 더파란     | 불멍       | `special/3/4`       | `special/3/1`          |
| thesharpps | 개별바베큐 | `room/2/8` (객실!) | `special/3/1`          |

시설 사진 배열은 시설 상세 히어로 순서라 순서를 바꿀 수 없다. 그래서 E2 `room_gallery:N` ·
D2 `room_bnr:N` 과 같은 규약으로, 크롤러가 카드 컷을 **`description: 'special_card'` 사본으로
뒤에 따로 덧붙인다.**

- `renderSpecialCards()`(index · facility 하단 목록)는 마커 컷을 먼저 쓰고, 없으면 시설 사진 첫 장.
- 시설 상세(히어로 · 배너 · 하단 사진)는 `isFacilityPhoto()` 로 마커 컷을 **뺀다** — 원본 순서 그대로.

---

## `main.html` — 원본 `about.html` + `view.html` 병합

메뉴는 `펜션소개` 하나만 남긴다(원본의 `외경보기`는 없앴다).
**히어로는 `view.html` 쪽(슬라이더 `.sub_visual`)을 쓰고 본문은 `about.html` 쪽을 쓴다.**
`about.html` 의 히어로는 정지 이미지 한 장(`.sub_visual_wide`)이라 버렸다.

```
.sub_visual        ← view.html 히어로 (슬라이더 + 화살표), 탭 제거
.sub_cont
  .about_wide_bnr  ← about.html 인사말
  .about_img_wrap  ← about.html 좌우 교차 — about[] 블록마다 카드 1개
```

원본 `view.html` 의 `.view_top_bnr` 는 가져오지 않았다 — 본문 3영역으로 충분하고,
`about[]` 를 더 소화하려면 데이터가 모자란다.

### 섹션 배정 — `pages.main.sections[0]`

| 블록      | 화면                                                         |
| --------- | ------------------------------------------------------------ |
| `hero`    | `.sub_visual` 슬라이더 + `.about_wide_bnr` 인사말(문구·사진) |
| `about[]` | `.about_img_wrap .box[]` — 블록당 카드 1개. 마지막 블록에 사진이 2장 이상이면 `.about_img_list`(사진 3장 가로) |

### 슬롯

| `data-*` 속성                | 소스                                      | 비고                                        |
| ---------------------------- | ----------------------------------------- | ------------------------------------------- |
| `data-main-hero-slides`      | `hero.images[isSelected]`                 |                                             |
| `data-main-hero-lead`        | — (하드코딩)                              | `빛처럼 맑고 아름다운 {숙소명}`             |
| `data-main-welcome-lead`     | — (하드코딩)                              | `{숙소명}에 오신 것을 환영합니다.`          |
| `data-main-welcome-image`    | 외경 중 `about_banner` 마커 → `hero.images[1]` → `[0]` | 원본 about.html `.about_wide_bnr .img_box` 가 고른 컷 |
| **`data-main-welcome-text`** | **`hero.description`**                    | **이 페이지의 유일한 본문 매핑**            |
| `data-main-welcome-title`    | `hero.title`                              | 없으면 HTML 기본 조각 `Welcome to {영문명}` |
| `data-main-about-lead`       | — (하드코딩)                              | `{숙소명}만의 특장점`                       |
| `data-main-about-list`       | `about[]` (title / description / images)  | 블록 0개면 섹션째 숨김 · 카드당 사진 1장     |
| `data-main-about-photos`     | `about[]` **마지막 블록** (사진 2장 이상일 때) | 원본 `.about_img_list` — 사진 최대 3장 가로 + 제목/설명. 없으면 숨김 |
| `data-main-about-wrap`       | (섹션 래퍼) — 블록 0개면 이 요소를 숨긴다 | —                                           |

`ABOUT`(원본은 `LANDSCAPE`), `Welcome to`, `SOMETHING SPECIAL`, `Hello,`,
`.sub_txt` 영문 3줄은 매핑하지 않는 고정 문구다.

### 고정 문구는 두 원본이 같아서 하드코딩했다

두 원본의 문구를 전수 대조한 결과 **본문 문단 하나만 숙소별로 다르고 나머지는 전부
숙소명만 갈아끼운 같은 문장**이었다. 그래서 `hero.description` 하나만 데이터로 받는다.

| 슬롯                         | 더파란 / jd38                                    | 판정          |
| ---------------------------- | ------------------------------------------------ | ------------- |
| 히어로 `p`                   | `빛처럼 맑고 아름다운 {숙소명}`                  | 동일 패턴     |
| `.about_wide_bnr` 리드       | `{숙소명}에 오신 것을 환영합니다.`               | 동일 패턴     |
| `.about_wide_bnr strong`     | `Welcome to {영문 숙소명}`                       | 동일 패턴     |
| `.about_img_wrap` 제목       | `SOMETHING SPECIAL` / `{숙소명}만의 특장점`      | 동일 패턴     |
| `.about_wide_bnr .txt_box p` | 첫 줄만 같고 나머지는 숙소별로 다름              | **매핑**      |

### 클로징 배너(`.view_btm_bnr`)는 삭제했다

원본 `view.html` 맨 아래 배너(사진 + `Hello, {영문명}` + 고정 문구 + 흑백 배경)를 붙였었지만
운영 요청(대노)으로 영역째 뺐다. 크롤러 마커가 없는 숙소는 사진을 `getLandscapeImages()`
(= 특장점 사진)에서 골라 바로 위 사진 영역과 같은 사진이 한 번 더 나왔다.
크롤러가 남기는 `view_banner` / `view_banner_bg` 마커는 이제 쓰지 않는다(남아 있어도 무해).

`about_banner` 마커(외경 사본 `description`)는 그대로 `data-main-welcome-image`(인사말 사진)가 쓴다 —
`getViewBannerImage(mark)` 가 `property.images[0].exterior` 와 `customFields.property.images` 를 함께 본다.

### 좌우 교차를 개수 무제한으로 일반화했다

⚠️ 원본은 `.box` / `.box + .box` / `.box + .box + .box` 로 **3개까지만** 정의돼 있었다.
`about[]` 블록 수는 숙소마다 다르고(샘플 데이터는 4건이다) 4개 이상이면 4번째부터
3번째 스타일이 그대로 반복돼 좌우 교차가 깨진다.

```css
.about_img_wrap .box .txt                             { vertical-align: top; }    /* 1번 */
.about_img_wrap .box + .box .txt                      { vertical-align: middle; } /* 2번 이후 */
.about_img_wrap .box:nth-of-type(n + 3):last-of-type .txt { vertical-align: bottom; } /* 3번 이후의 마지막 */
.about_img_wrap .box:nth-of-type(2n) .txt             { text-align: right; }      /* 좌우 교차 */
```

⚠️ 원본 1·2·3번의 `vertical-align`(top / middle / bottom)은 장식이 아니라 **겹침 회피**다.
카드끼리 50px 씩 겹치므로 글은 위 카드 사진 밑단과 아래 카드 사진 윗단 사이에 있어야 한다.
예전에 홀=top / 짝=middle 로 단순화했더니 3번 글이 top 으로 올라가 2번 카드의 사진과 겹쳤다
(thesharpps "Jet Spa"). 가운데는 위아래 어느 쪽과도 겹치지 않으므로 2번 이후는 middle,
아래에 카드가 없는 마지막 카드(3번 이후)만 원본처럼 bottom 이다.
카드 2~3개면 원본과 똑같고, 4개(thesharpps)는 top / middle / middle / bottom 이다.
`.box + .box { margin-top: -50px }`(지그재그 겹침)는 "첫 번째 이후 전부"라 그대로 둔다.

**좌우를 실제로 정하는 것은 DOM 순서다.** `.img` / `.txt` 가 각각 49% `inline-block`
이라 먼저 온 쪽이 왼쪽에 놓인다. 매퍼가 홀수 카드는 `.img → .txt`,
짝수 카드는 `.txt → .img` 순으로 만들고, 위 CSS 가 그에 맞춰 `text-align` 을 돌린다.

### `TplSwiper.initSubVisual()`

`.sub_visual` 은 `main` / `room` / `facility` 세 페이지가 같은 규격으로 쓴다.
원본 `custom.js` 의 `new Swiper('.sub_visual .swiper-container', …)`(fade + autoplay 4초,
loop 없음)를 `js/common.js` 의 공용 헬퍼로 옮겨 세 페이지가 함께 쓴다.

---

## `layout-map.html` — 원본 `room.html` 목록

원본 `room.html` 이 목록과 상세를 한 파일에서 `room_id` 쿼리로 갈랐다.
우리는 목록을 `layout-map.html`, 상세를 `room.html?room_id=` 로 나눈다.

```
.sub_visual_wide   배경 1장 + h3 ROOMS + 위치표시 + 객실 탭(.cate_box)
.sub_cont
  .sub_title_box   PREVIEW + 설명
  .wide_img        배치도 이미지 (원본 layout.webp)
  .main_room       ROOMS LIST + 객실 카드 2열 그리드
```

### 섹션 배정 — `pages.layoutMap.sections[0]`

| 슬롯                         | 소스                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| `data-layoutmap-hero`        | `hero.images` → 객실 썸네일 → `exterior` → `thumbnail`       |
| `data-layoutmap-room-nav`    | `customFields.roomtypes[]` (`renderRoomNav`)                 |
| `data-layoutmap-title`       | `hero.title` → `PREVIEW`                                     |
| `data-layoutmap-description` | `hero.description` → `{숙소명}의 객실을 미리 만나보세요.`    |
| `data-layoutmap-images`      | **`about.images`** — 배치도. 여러 장이면 세로로 쌓는다       |
| `data-layoutmap-room-lead`   | — (하드코딩) `편안한 휴식이 함께하는 {숙소명}의 객실입니다.` |
| `data-layoutmap-room-slides` | `customFields.roomtypes[]` (`renderRoomSlides`)              |

`hero` 는 히어로 배경 + `.sub_title_box` 문구를, `about` 은 배치도 이미지를 담당한다.
⚠️ 서브 히어로 안에는 문구 슬롯이 없다 — 원본이 `h3 ROOMS` + 위치표시 + 탭뿐이다.
`about.title` / `about.description` 은 배정할 자리가 없어 쓰지 않는다.
`main` 의 `about[]` 은 배열이지만 여기 `about` 은 **단일 객체**다.

`sections[0].enabled === false` 면 `404.html` 로 리다이렉트한다(백오피스 preview 에서는 안 한다).
헤더의 `미리보기` li 도 `header-footer-mapper` 가 같은 기준으로 숨긴다.

**대메뉴 `ROOMS`(`[data-rooms-link]`)는 이 값에 따라 이동처가 갈린다.** — `getRoomsEntryLink()`

| `layoutMap` | ROOMS 클릭 시                                     |
| ----------- | ------------------------------------------------- |
| 켜짐        | `layout-map.html` (객실 배치도)                   |
| 꺼짐        | 첫 번째 객실 상세 (헤더 객실 메뉴 첫 항목과 같음) |

꺼진 상태에서 그대로 두면 `layout-map.html` 이 404 로 튕긴다. 판정은 이 페이지의 404 기준과 같은
`isLayoutMapEnabled()`(섹션 없음 / `enabled:false` → 꺼짐)를 쓴다. 객실이 하나도 없으면 원래 href 를 둔다.
`room.html` 의 객실 탭 첫 칸 `미리보기` 도 꺼져 있으면 숨긴다.

### 객실 그룹 — 이 페이지는 헤더 메뉴와 **같은** 목록이다

`renderRoomNav` 에 `currentId` 를 `null` 로 넘기므로 항상 "그룹 밖" 취급이다.
탭과 카드가 모두 `getRoomMenuItems()` 를 거치므로 `roomtypes[].groupName` 이 있으면
헤더 메뉴와 똑같이 **그룹명 하나로 접힌다.**

그룹을 펼치는 것은 **객실 상세(`room.html`)뿐**이다 — 자세한 규칙은 아래
「객실 그룹 규칙」 절 참고.

### ⚠️ 이 페이지의 객실 목록은 슬라이더가 아니다

마크업은 `.swiper-container / -wrapper / -slide` 를 쓰지만 **Swiper 를 초기화하지 않는다.**
원본 `custom.js` 의 분기가 `sub3_1` / `main` / `sub_room_detail` 뿐이라 `sub2_1` 은 어디에도
걸리지 않고, 대신 `style.css` 가 CSS 로 2열 그리드를 만든다.

```css
.sub2_1 .main_room .arw_box {
  display: none;
} /* 화살표 숨김 */
.sub2_1 .swiper-wrapper {
  display: block;
} /* flex 해제 */
.sub2_1 .swiper-slide {
  width: calc(50% - 2.5%);
  float: left;
  opacity: 1 !important;
}
.sub2_1 .swiper-slide:nth-of-type(2n) {
  margin-left: 5%;
}
.sub2_1 .swiper-slide:nth-of-type(2n + 1) {
  clear: both;
}
```

`opacity: 1 !important` 가 핵심이다. 전역 `.room_list .swiper-slide { opacity: 0 !important }` +
`.room_list .swiper-slide-visible { opacity: 1 !important }` 는 **Swiper 가 런타임에 붙이는
`-visible` 클래스**에 기대므로, 초기화하지 않으면 카드가 전부 투명해진다.

그래서 이 페이지는 **`js/pages/layout-map.js` 가 없고** `.arw_box` 마크업도 두지 않았다
(원본에는 있지만 `display:none` 인 죽은 마크업이다).

---

## `room.html` — 원본 `room.html?room_id=`

```
.sub_visual        객실 사진 슬라이더 + em/h3/p + 객실 탭
.sub_cont
  .table_wrap      ROOMS INFO — PC 5열 / 모바일 4열 표 + 집기품목 + 예약 버튼
  .room_top_bnr    사진 2 + 영문 문구
  .room_wide_bnr   사진 1 + 영문 문구
  .room_txt_bnr    사진 2 + 영문 문구 + **객실 평면도**
  .main_room       ROOMS LIST — 3열 슬라이더
```

### 데이터 소스

`pages.room[]` 은 **비어 있는 응답이 흔하다**(현재 샘플도 빈 배열). 상세 내용은 전부
`customFields.roomtypes[]` + 최상위 `rooms[]` 에서 온다.

| `data-*` 속성                | 소스                                                         |
| ---------------------------- | ------------------------------------------------------------ |
| `data-room-name`             | `rooms[j].name` (`getRoomtypeName`)                          |
| `data-room-structure`        | `formatRoomStructure(rooms[j])`                              |
| `data-room-hero-slides`      | `roomtypes[i]` 인테리어 → 썸네일                             |
| `data-room-nav`              | `roomtypes[]` (`renderRoomNav`, **currentId 전달**)          |
| `data-room-table-pc`         | 객실명 / 기준 / 최대 / 유형 / 평형 (5열)                     |
| `data-room-table-m`          | 머리글 tr + 값 tr, **평형 제외** 4열                         |
| `data-room-amenities`        | `rooms[j].amenities` — 없으면 목록째 숨김                    |
| `data-room-bnr-image="0~4"`  | 「컨셉 및 외경」(`roomtype_exterior`) N번째 → `room_bnr:N` 마커 컷 → 객실 사진 2번째 장부터 |
| `data-room-floorplan`        | `getRoomFloorplanImages()` — **없으면 영역째 숨김**          |
| `data-room-floorplan-images` | 평면도 `<img>` 를 담는 자리 — 여러 장이면 세로로 쌓는다      |
| `data-room-list-slides`      | `roomtypes[]` (`renderRoomSlides`)                           |
| `data-room-list-lead`        | — (하드코딩) `편안한 휴식이 함께하는 {숙소명}의 객실입니다.` |
| `.btn_wrap .btn_reserve`     | `property.realtimeBookingId`                                 |

표에서 값이 없으면 빈 칸 대신 `-` 를 넣는다. 표는 칸이 비면 무너져 보인다.

### ⚠️ `room_id` 와 `id` 를 모두 읽는다

우리 링크(헤더 메뉴 / 객실 탭 / 카드)는 `?room_id=` 를 쓰지만, 백오피스 preview 는
`js/preview-handler.js` 가 **`?id=`** 로 이동시킨다(`newPath += '?id=' + roomId`).
한쪽만 읽으면 preview 에서 어느 객실을 골라도 첫 객실만 나온다.

```js
var id = params.get('room_id') || params.get('id');
```

### ⚠️ `document.title` 은 페이지 매퍼가 건드리지 않는다

`HeaderFooterMapper.updateMetaTags()` 가 `homepage.seo.title` 로 `<title>` 을 채운다.
`preview-handler` 는 페이지 매퍼 → 헤더푸터 매퍼 순으로 돌리고, standalone 은
`DOMContentLoaded` / `headerFooterLoaded` 순서가 확정적이지 않다.
페이지 매퍼에서 객실명을 넣으면 실행 순서에 따라 제목이 오락가락한다.

### 배너 5칸 사진은 원본이 고른 컷을 쓴다 — `room_bnr:N`

원본 "Rooms Detail" 아래 배너 5칸(`.room_top_bnr` 2 · `.room_wide_bnr` 1 · `.room_txt_bnr` 2)은
객실 사진 중에서 따로 고른 컷이다 (jd38 D-201: `1 · 4 · 8 · 10 · 5`, 더파란 파란하늘: `3 · 1 · 8 · 9 · 6`).

D2 와 같은 규약으로 크롤러가 `roomtype_interior` 사본에 `description: 'room_bnr:0~4'` 를 남긴다.
N 이 곧 `data-room-bnr-image` 칸 번호다. 마커가 없는 칸은 종전처럼 객실 사진 2번째 장부터 채운다.

마커 사본은 배너 전용이라 `getRoomtypeImages()` 가 뺀다 — 히어로 슬라이더 · 카드 조각컷 ·
썸네일 폴백 어디에도 섞이지 않는다 (배너는 `getRoomBannerImages()` 로만 읽는다).

⚠️ 원본이 칸을 비워 둔 경우(thesharpps B702 `url('')`)는 마커를 만들지 않아 객실 사진으로 채워진다.

### 배너 3종의 문구는 전부 하드코딩이다

두 원본을 대조한 결과 배너 3종의 영문 문구가 **완전히 동일**했다 — 숙소명조차 들어가지
않는다(`Rooms Detail` / `Clean & Cozy, Healing Pension` / `Place For You` + 영문 설명).
그래서 HTML 에 그대로 두고 **사진 5장만 매핑한다.**

사진이 모자라면 앞에서부터 순환해 채운다. 배너는 문구가 본체라 자리가 비면 레이아웃이 무너진다.

### 객실 평면도 — 없으면 영역째 숨긴다

⚠️ 크롤러가 객실 상세의 평면도 영역에서 찾았을 때만 채워지는 필드다.
**없으면 `객실 평면도` 제목까지 통째로 숨긴다.** 부가 정보라 placeholder 를 세우면
안내 문구만 덩그러니 남는다. (`layout-map` 의 배치도는 그 페이지의 본 목적이라 반대로
자리를 유지하고 placeholder 를 세운다)

**일반 객실 사진으로 폴백하지 않는다.** 평면도 자리에 인테리어 사진이 들어가면 잘못된 정보다.

> 평면도 블록은 두 원본 모두에 있다. 다만 위치가 다르다 —
> jd38 은 `.room_txt_bnr > .table_wrap > (.sub_title_box + .box.sub_inner)` 로 감싸고,
> 더파란은 `.box.sub_inner` 를 `.table_wrap` 형제로 뺐다. 정본인 jd38 쪽을 따랐다
> (제목과 이미지가 한 래퍼 안에 있어 영역째 숨기기도 쉽다).

### 미사용 규칙 정리

원본 `.table_*` 계열 중 **어느 원본 페이지에도 마크업이 없는 규칙 9개**를 걷어냈다
(G / E2 도 같은 처리를 했다). `.table_default` 는 객실 상세에서만 쓰이므로
다른 페이지가 되살릴 일도 없다.

| 셀렉터                                                           | 사유                             |
| ---------------------------------------------------------------- | -------------------------------- |
| `.table_box .for_t` (2규칙) / `… .for_t .table_default thead th` | 태블릿용 표 — 원본에 마크업 없음 |
| `.table_default .bg` / `strong` / `tbody td span`                | 표 안 장식 — 마크업 없음         |
| `.table_text li + li`                                            | 집기품목 2줄 이상 — 원본은 1줄   |
| `.table_text li.point` / `:before`                               | 강조 항목 — 마크업 없음          |

### ⚠️ 하단 객실 목록은 `layout-map` 과 다르다

같은 `.main_room` 마크업이지만 동작이 갈린다.

| 페이지                          | 원본 분기      | 동작                        |
| ------------------------------- | -------------- | --------------------------- |
| `layout-map.html` (`sub2_1`)    | 해당 분기 없음 | CSS 2열 그리드, 화살표 없음 |
| `room.html` (`sub_room_detail`) | `sld_opt4`     | **3열 슬라이더 + 화살표**   |

`js/pages/room.js` 가 `TplSwiper.initRoomList()` 로 초기화한다.

---

## `facility.html` — 원본 `special1~6.html`

원본은 시설마다 파일이 따로였다(`special1.html` … `special6.html`).
`facility.html?id=` 한 파일로 합쳤다.

```
.sub_visual         시설 사진 슬라이더 + em/h3/p + 시설 탭
.sub_cont
  .special_top_bnr  SPECIAL No.N + 사진 + 소제목(비움) + 소개문
  .special_btm_bnr  사진 2 + 영문 고정 문구 (좌우 교차)
  .main_special     SPECIAL 목록 슬라이더
```

### 데이터 소스

`pages.facility[]` 는 **비어 있는 응답이 흔하다**(현재 샘플도 빈 배열).
내용은 전부 `property.facilities[]` 에서 온다.

| `data-*` 속성                   | 소스                                              |
| ------------------------------- | ------------------------------------------------- |
| `data-facility-name`            | `nameEn` → `name` (히어로 h3)                     |
| `data-facility-caption`         | `name` — 영문명이 있고 다를 때만. 아니면 숨김     |
| `data-facility-no`              | `SPECIAL No.{정렬 순번}`                          |
| `data-facility-nav`             | `getFacilities()` — 현재 시설에 `.on`             |
| `data-facility-hero-slides`     | `facilities[i].images[isSelected]` (`special_card` 제외) |
| `data-facility-bnr-image`       | `images[0]`                                       |
| `data-facility-title`           | **대응 필드 없음 — 항상 비우고 숨긴다**           |
| `data-facility-description`     | `description` + `usageGuide`(한 줄 띄고 이어붙임) |
| `data-facility-btm-image="0~1"` | `images[1..]` (배너가 첫 장을 쓰므로 두 번째부터) |
| `data-facility-list-lead`       | — (하드코딩) `{숙소명}의 부대시설과 특장점을…`    |
| `data-facility-list-slides`     | `getFacilities()` (`renderSpecialCards`)          |

시설 순서는 `getFacilities()` 가 `displayOrder` 로 정렬한다 —
헤더 서브메뉴 / index 카드 / 이 페이지 탭이 모두 같은 순서다.

### 배너 소제목은 비워 둔다

원본 `.special_top_bnr .txt` 는 두 덩이였다.

```
strong  "푸른 동해바다와 함께하는 여행"      ← 배너 소제목
p       "객실 내에서 아름다운 동해바다를 …"  ← 소개문
```

우리 데이터에 **배너 소제목에 대응하는 필드가 없다.** 자리를 비우고 숨긴다.

- **시설명을 넣지 않는다** — 바로 위 히어로 `h3` 에서 이미 나온다.
- ⚠️ **`description` 의 첫 줄을 소제목으로 올리지도 않는다.** `description` 은
  `"잔잔하게 흐르는 강을 바라보며\n편안한 쉼의 순간을 느껴보세요."` 처럼 한 문장을
  줄바꿈한 것이라, 첫 줄만 20px 볼드로 키우면 한 문장이 서로 다른 서체로 쪼개진다.
  개행은 줄바꿈일 뿐 제목 경계가 아니다. (H 와 같은 판단)

원본에서 이 `strong` 의 `margin: 0.75em 0 0.5em`(20px 기준 위 15px + 아래 10px)이
사진 띠와 소개문 사이 간격을 만들고 있었다. 숨길 때 그 간격이 사라지므로
매퍼가 `.txt` 에 **`.no_title`** 을 붙이고, `style.css` 가 그 간격을 `p` 에 넘긴다
(원본에 없는 클래스는 이것 하나뿐이다).

### 탭에서 `미리보기` 를 뺐다

원본 `.cate_box` 맨 앞에는 `미리보기`(`special.html`) li 가 있지만
**우리 템플릿에는 시설 목록 페이지가 없다.** 시설만 나열한다. (H 와 같은 처리)

### 하단 배너 문구는 전부 하드코딩이다

`.special_btm_bnr` 의 영문 문구(`Something Special` / `All seasons of the year…` /
`Stay with your beloved companion…`)는 두 원본이 **완전히 동일**하다. 사진 2장만 매핑한다.

### ⚠️ 하단 목록 슬라이더가 index 와 다르다

같은 `.main_special` 마크업이지만 원본이 페이지별로 다른 옵션을 준다.

| 페이지                                 | 원본 분기  | 열 수                        |
| -------------------------------------- | ---------- | ---------------------------- |
| `index.html` (`main`)                  | `sld_opt1` | 2열 (소수점 1.2 / 2.2 / 2.3) |
| `facility.html` (`sub_special_detail`) | `sld_opt2` | 200/480/981/1024 → 1/2/3/3열 |

---

## `reservation.html` — 원본 `reservation.html`

```
.sub_visual_wide   배경 1장 + h3 RESERVE + 위치표시 + 탭(예약하기 | 이용안내)
.sub_cont
  dl.info_box      dt(INFORMATION) + dd(사진 + 본문)
                   dt(REFUND INFO) + dd(사진 + 본문)
```

| `data-*` 속성                       | 소스                                                       |
| ----------------------------------- | ---------------------------------------------------------- |
| `data-reservation-hero`             | `hero.images[0]` → `about.images` → 숙소 외경              |
| `data-reservation-hero-description` | **`hero.title`** → `hero.description` → `펜션 이용안내`    |
| `data-reservation-info-image`       | 위 풀의 2번째 장부터                                       |
| `data-reservation-info-body`        | `property.address` + `property.usageGuide`                 |
| `data-reservation-refund-image`     | 위 풀의 3번째 장                                           |
| `data-reservation-refund-body`      | `refundPolicies[]` + `refundSettings.customerRefundNotice` |

⚠️ **사진 위 라벨(`펜션정보` / `환불정보`)은 CSS 가 넣는다.**
`.info_box dd .img:after` 가 `펜션정보`, `:nth-of-type(2)` 가 `환불정보` 로 바꾼다.
**두 `dd` 의 순서를 바꾸면 라벨이 뒤바뀐다.**

⚠️ `checkInOutInfo` 를 `usageGuide` 와 함께 붙이면 안 된다. `usageGuide` 안에 이미
`[입퇴실안내]` 절이 들어 있어 같은 내용이 두 번 나온다.
`usageGuide` 가 비었을 때만 `checkInOutInfo` + `reservationGuide` 로 대신한다.

환불 규정은 `refundProcessingDays` 내림차순으로 문장을 만든다 —
가장 이른 날짜는 `이용일 N일 이전`, 0일은 `이용일 당일`, 그 사이는 `이용일 N일 전`.
비율 100/0 은 `전액 환불` / `환불 불가`.

`about` 은 **단일 객체**다(`nearbyAttractions` / `main` 의 배열과 다르다).

---

## `nearby-attractions.html` — 원본 `travel.html`

```
.sub_visual_wide   배경 1장 + h3 TRAVEL + 위치표시 + 탭
.sub_cont
  .sub_title_box   TOURIST SPOT + 설명
  .travel_list     ul > li × N (2열 float 그리드)
```

| `data-*` 속성             | 소스                                                          |
| ------------------------- | ------------------------------------------------------------- |
| `data-nearby-hero`        | `hero.images` → 첫 여행지 사진 → `surrounding`/`exterior`     |
| `data-nearby-title`       | `hero.title` → `TOURIST SPOT`                                 |
| `data-nearby-description` | `hero.description` → `근처 주요 관광지 정보를 확인해 보세요.` |
| `data-nearby-list`        | **`about[]`** → 없으면 `property.nearbyAttractions[]`         |

⚠️ 이 섹션의 `about` 은 **여행지 항목 배열**이다.
`layout-map` / `reservation` 의 `about` 은 단일 객체라 헷갈리기 쉽다
(`main` 의 `about` 만 여기와 같은 배열이다).

`sections[0].enabled === false` 면 `404.html` 로 리다이렉트한다(preview 제외).
헤더 TRAVEL 메뉴도 `header-footer-mapper` 가 같은 기준으로 숨긴다.

### li 하나 만들기 — 본문 / 출처 / 거리 3분할

원본 li 는 `img + strong + p(본문 + span 출처 + em 거리)` 구조다.
`01.` `02.` 번호는 매퍼가 넣지 않는다 — 원본 CSS 의 counter 가 붙인다.

- **거리**는 `images[0].description` 이 정본이다.
- **출처**는 전용 필드가 없어 `description` 안에서 가려낸다 (`/^(자료출처|출처)/`).
- 출처·거리는 각각 **첫 번째로 매칭된 줄 하나만** 쓰고 나머지는 본문으로 남는다. 줄 순서는 무관.
- `property.nearbyAttractions[]` 폴백은 문자열 태그 배열이라 이름만 있다 —
  본문·출처·거리가 모두 없으면 `<p>` 를 만들지 않는다.
- 항목이 하나도 없으면 목록을 비운 채 둔다. 2열 float 그리드라 빈 li 를 넣으면
  다음 항목의 `clear` 규칙이 어긋난다.

---

## `directions.html` — 원본 `traffic.html`

```
.sub_visual_wide   배경 1장 + h3 LOCATION + 위치표시 + 탭
.sub_cont
  .sub_title_box   DIRECTIONS + 설명
  .map_box .map    카카오 지도
  .map_info        strong(주소) + dl(dt 제목 + dd 본문)
```

| `data-*` 속성                          | 소스                                                        |
| -------------------------------------- | ----------------------------------------------------------- |
| `data-directions-hero`                 | `hero.images` → `surrounding`/`exterior`/`thumbnail`        |
| `data-directions-title`                | `hero.title` → `DIRECTIONS`                                 |
| `data-directions-description`          | `hero.description` → `{숙소명}에 찾아 오시는 길을…`         |
| `data-directions-address`              | `property.address` (`주소 : ` 접두)                         |
| `data-directions-notice`               | `notice.title` / `notice.description` — 본문 없으면 dl 숨김 |
| `#kakao-map`                           | `property.latitude` / `longitude`                           |
| `data-directions-map` (= `#kakao-map`) | 좌표 없으면 지도 대신 placeholder                           |

### ⚠️ 지도는 카카오 퍼가기 대신 SDK 로 대체했다

원본은 `daum.roughmap.Lander` 퍼가기 스크립트를 심었다(`"key" : "2ie7x"`).
**업체 고유 key 라 데이터로 만들 수 없어** 좌표 기반 `js/kakao-maps-sdk.js` 로 대체했다.

그 결과 원본 클래스 3종(`root_daum_roughmap`, `root_daum_roughmap_landing`,
`daum_roughmap_loader_script`)은 쓰지 않는다.

⚠️ **`.map` 에 높이를 직접 줬다.** 원본은 `.map` 자체에 규칙이 없고 퍼가기 스크립트가
`mapHeight:360` 으로 높이를 만들었다. 우리는 그 스크립트를 안 쓰므로
`style.css` 에 `.map_box .map { height: 360px }`(640px 이하 260px)를 넣었다.

좌표가 없으면 지도 대신 placeholder 를 세운다 — 영역을 비우면 테두리만 남은 빈 띠가 된다.
preview 는 데이터가 바뀔 때마다 매핑을 다시 돌리므로, 지도 인스턴스가 이미 있으면
새로 만들지 않고 중심만 옮긴다.

원본의 `대중교통 이용 시` / `픽업 이용 시` dt/dd 는 만들지 않는다 —
`notice` 가 `{ title, description }` 하나뿐이라 항목 하나로 매핑한다.

---

## 객실 그룹 규칙 (`groupName`)

`roomtypes[].groupName`이 **하나라도 있으면** 그룹 모드로
동작한다. 없으면 객실 하나가 항목 하나다. 규칙은 `base-mapper.js` 한 곳에 있고
헤더 메뉴 / `layout-map` / 객실 상세 탭이 모두 같은 소스를 쓴다.

| 함수                     | 역할                                                                      |
| ------------------------ | ------------------------------------------------------------------------- |
| `hasRoomGroups()`        | `groupName` 이 하나라도 있는지                                            |
| `getRoomMenuItems()`     | 그룹 단위 항목 배열 — `{ label, groupName, roomtype(대표), roomtypes[] }` |
| `getRoomMenuLabel()`     | 메뉴에 쓸 이름 — **그룹명** (없으면 객실명)                               |
| `getRoomMenuLink()`      | **그룹의 첫 객실** 상세로 연결                                            |
| `isRoomMenuItemActive()` | 그룹 안 **어느 객실 id 로 들어와도** 그 항목을 활성으로 본다              |
| `renderRoomSlides()`     | 미리보기 카드 — **그룹을 쓰지 않고 `roomtypes[]` 전체**를 깐다            |

**그룹으로 접히는 곳은 헤더 ROOMS 메뉴와 객실 상세 탭뿐이다.**
Room Preview(미리보기) 카드는 그룹과 무관하게 **항상 전체 객실**을 깔고,
카드마다 자기 객실 상세로 연결한다 — 원본이 그렇다.

```
헤더 ROOMS / layout-map 탭  →  그룹명   (스파동 | 프리미엄동)
        ↓ 그룹명 클릭
그룹의 첫 객실 상세          →  그 그룹의 객실만
                               (미리보기 | 에버골드 | 퍼블하제 | 유메)

Room Preview 카드            →  전체 객실 (그룹과 무관), 카드마다 자기 객실 상세로 연결
```

### ⚠️ 객실 상세 탭만 그룹을 펼친다

헤더·`layout-map` **탭**은 그룹명 하나로 접히므로, **상세 페이지 탭까지 접으면 그룹의 첫 객실
외에는 탭으로 도달할 방법이 없다.** 그래서 `room.html` 만 `renderRoomNav` 에 `currentId` 를
넘겨, 현재 객실이 속한 그룹을 찾아 **그 그룹의 객실만** 렌더한다.

| 상황                                | 탭                                            |
| ----------------------------------- | --------------------------------------------- |
| `layout-map` (currentId = null)     | `미리보기 \| 스파동 \| 프리미엄동 \| …`       |
| 객실 상세 · 그룹 밖                 | 위와 같음                                     |
| 객실 상세 · 그룹 안 (멤버 2실 이상) | `미리보기 \| 에버골드 \| 퍼블하제 \| 유메`    |
| 멤버 1실 그룹                       | 펼치지 않음 — 그룹명 = 객실명이라 의미가 없다 |
| `groupName` 없음                    | 객실 하나가 항목 하나                         |

**다른 그룹은 이 줄에 섞지 않는다.** 그룹명과 객실명이 나란히 놓이면 부모/자식이
형제처럼 보인다. 다른 그룹으로는 헤더 ROOMS 메뉴나 `미리보기` 를 거쳐 이동한다.
(미리보기 카드에서는 어느 객실이든 바로 갈 수 있다.)

탭을 다시 그릴 때 **첫 li(`미리보기`)는 남기고** `data-generated="room"` 이 붙은
이전 생성분만 지운다. 통째로 비우면 미리보기로 돌아갈 길이 없어진다.

> 현재 샘플 데이터(홍천 타샤의정원, 10실)는 `groupName` 이 없어 그룹 분기가 실행되지 않는다.

---

## 미해결 / 확인 필요

- `property.nameEn` 과 `customFields.property.nameEn` 의 값이 다르다
  (`Hongcheon Tasha's Garden Pension` vs `Hongcheon Tasha's Garden`).
  `getPropertyNameEn()` 은 `customFields` 를 우선하므로 히어로·전경에는 업종어 없는 쪽이 나온다.
  전 템플릿 공통 규칙이라 그대로 둔다.

---

## 카피라이트 (`data-copyright`)

푸터 카피라이트는 `property.tripProviderName`(Trip11 공급자명)으로 렌더한다.

`common/footer.html` 의 카피라이트 요소에 템플릿 문자열을 두고,
`header-footer-mapper.js` 의 `mapCopyright()` 가 `{provider}` 를 치환한다.

```html
<a href="http://trip11.kr/" data-copyright="COPYRIGHT©{provider}. ALL RIGHTS RESERVED.">
  COPYRIGHT©(주)트립일레븐. ALL RIGHTS RESERVED.
</a>
```

| `property.tripProviderName` | 결과                                  |
| --------------------------- | ------------------------------------- |
| `"신비서"`                  | `COPYRIGHT©신비서. ALL RIGHTS RESERVED.` |
| `""` / 미입력               | HTML 에 적힌 기존 문구 그대로          |

- 문구 형식(대소문자, `ⓒ` 접두, `(주)` 표기)은 템플릿마다 달라서 **형식은 `data-copyright` 속성값이 갖고
  매퍼는 이름만 바꾼다**.
- 값이 없을 때(백오피스 미입력 → `""`) 는 건드리지 않으므로 기존 트립일레븐 문구가 그대로 남는다.
- `trip11.kr` 링크는 변경하지 않는다.

---

## landing.html (선택 기능 — 여러 숙소 게이트)

t-template-A 와 같은 구현이다 (상세 스키마·카드 구조는 `t-template-A/data-mapping.md` 의 landing 절).
헤더/푸터가 없는 별도 페이지이고, 카드(`pages.landing.sections[0].about[]`, 1~3장)를 그리드로 나란히 놓는다.

**루트 가드** — `IndexMapper.mapPage()` → `maybeRedirectToLanding()` → `shouldEnterLanding()`

- 어드민 프리뷰 iframe 안이면 skip
- `pages.landing.sections[0].enabled !== true` 면 skip — **명시적으로 켠 숙소만** 가로챈다.
  섹션이 없거나 `enabled` 가 false/누락이면 기존처럼 `index.html` 을 그대로 보여준다
- `document.referrer` 가 같은 origin 이면 skip (헤더 로고, 랜딩의 자기 자신 카드)
- `document.referrer` 호스트가 `about[].domain` 중 하나면 skip (연결 숙소 랜딩에서 카드로 넘어옴)
- 그 외 (주소 직접 입력·즐겨찾기·검색/외부 링크) → `location.replace('landing.html')`

`landing.html` 을 직접 열었는데 `enabled !== true` 면 `404.html` 로 보낸다.

쿼리 파라미터 없이 **referrer** 로 "랜딩을 이미 거쳤는지" 를 가른다. 그래서 헤더 로고 링크는
원래대로 `./index.html`, 랜딩 카드도 `./index.html` / `{domain}/` 로 보낸다.

- 크로스 도메인 referrer 는 브라우저 기본 정책(`strict-origin-when-cross-origin`)상 origin 만 오므로 호스트로만 비교한다 (`www.` 유무 무시).
- 연결 숙소 B 의 랜딩 `about[]` 에 A 의 도메인이 없으면, A 랜딩 → B 카드 클릭 시 B 의 랜딩이 한 번 더 뜬다.
- https → http 로 넘어가면 브라우저가 referrer 를 보내지 않아 랜딩이 다시 뜬다 (연결 숙소 도메인은 https 전제).

**카드 링크** (`landing-mapper.js` `getCardLink()`) — 전부 새 탭. 도착한 index 는 referrer 로 랜딩을 건너뛴다 (위 루트 가드 참고)

| 조건                                         | 이동                          |
| -------------------------------------------- | ----------------------------- |
| `about[i].propertyId === property.id`        | `./index.html`                |
| 연결 숙소 + `about[i].domain` 있음           | `{domain}/`                   |
| 연결 숙소인데 `domain` 없음                  | `href="#"` (비활성)           |

카드 배경은 `about[i].images` 첫 장, 로고는 `hero.images[]` 중 `blockId === about[i].blockId`,
로고가 없으면 `about[i].propertyName` 텍스트, `about[i].title` 은 입력했을 때만 보인다.
