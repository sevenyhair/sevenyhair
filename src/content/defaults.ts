/**
 * seveny hair 기본 콘텐츠. 출처: 네이버 플레이스 hairshop/1767344271 (2026-10-02 수집).
 *
 * 표기 원칙 (2026-10-02 결정)
 *  - 영어: 메뉴, 페이지·섹션 제목 (디자인 요소)
 *  - 한글: 설명·버튼·가격·이력·수상·주소·영업시간 등 고객이 읽는 정보 전부
 *  - 디자이너 이름은 "Seveny". 실명(이현주)은 사업자 정보에만 쓴다.
 *
 * scripts/seed.ts 가 이 파일을 그대로 DB 에 넣는다.
 */
import { EMOJI, PHOTOS } from "./photos.ts";

export const LINKS = {
  booking: "https://m.booking.naver.com/booking/13/bizes/447613",
  naverPlace: "https://m.place.naver.com/hairshop/1767344271/home",
  naverReviews: "https://m.place.naver.com/hairshop/1767344271/review/visitor",
  blog: "https://blog.naver.com/sevenyhair",
  youtube: "https://youtube.com/@sevenyhair",
  instagram: "https://www.instagram.com/seveny.hair/",
  talk: "http://talk.naver.com/w4ju0f?frm=mnmb",
  map: "https://map.naver.com/p/entry/place/1767344271",
};

export const shop = {
  name: "SEVENY",
  nameSuffix: "hair.",
  byline: "by Seveny",
  owner: "Seveny",
  address: {
    street: "부산 동래구 충렬사로 38, 1층",
    zip: "화목아파트 정문 앞",
    city: "부산",
    country: "대한민국",
  },
  phone: "0507-1351-8646",
  phoneHref: "tel:050713518646",
  email: "",
  instagram: { handle: "@seveny.hair", url: LINKS.instagram },
  bookingUrl: LINKS.booking,
  naverPlaceUrl: LINKS.naverPlace,
  logos: { vertical: "", horizontal: "", hero: "", preloader: "" },
  // 네이버 플레이스 좌표 (충렬사로 38)
  map: { lat: 35.2024218, lng: 129.0979297, zoom: 17 },
  hours: [
    { days: "월", lines: ["10:00  –  20:00"] },
    { days: "화", lines: ["정기 휴무"] },
    { days: "수", lines: ["10:00  –  20:00"] },
    { days: "목", lines: ["10:00  –  17:00"] },
    { days: "금 – 일", lines: ["10:00  –  20:00"] },
  ],
  payments: [
    { label: "카드", icon: "card" },
    { label: "현금", icon: "cash" },
    { label: "제로페이", icon: "zeropay" },
  ],
  paymentNote: "모든 시술은 우선 예약제입니다. 네이버 예약 또는 전화로 예약해 주세요.",
  copyright: "© 2026 SEVENY HAIR",
  credit: "Hair & photography by Seveny",
  nav: [
    { label: "Services", href: "/services" },
    { label: "The Salon", href: "/salon" },
    { label: "About", href: "/about" },
    { label: "Journal", href: "/journal" },
    { label: "Contact", href: "/contact" },
  ],
};

export const homePage = {
  slug: "home",
  title: "SEVENY HAIR 세브니헤어 — 동래 1인 헤어살롱",
  hero: {
    heading: "Welcome",
    body:
      "부산 동래의 1인 헤어살롱 세브니헤어입니다. 상담부터 커트, 펌, 컬러까지 Seveny가 직접, 차분하고 꼼꼼하게 시술합니다. 얼굴형과 모질, 생활 방식에 맞춘 나만의 스타일을 찾아드릴게요.",
    image: PHOTOS.interior,
    cta: [
      { label: "살롱 둘러보기", href: "/salon" },
      { label: "예약하기", href: LINKS.booking, external: true },
    ],
  },
  sections: [
    {
      key: "craft",
      kind: "side-feature",
      layout: "media-left",
      heading: "One chair,\none designer",
      body: [
        "세브니헤어는 디자이너 한 명이 운영하는 1인 샵입니다. 상담부터 마무리 드라이까지 같은 손이 끝까지 책임지고, 필요 없는 시술은 권하지 않습니다.",
      ],
      images: [{ src: PHOTOS.londonMirror }, { src: PHOTOS.ownerPortrait }],
      cta: [{ label: "Seveny 소개", href: "/about" }],
    },
    {
      key: "services",
      kind: "side-feature",
      layout: "media-right",
      heading: "More than\njust a haircut",
      body: [
        "커트, 펌, 컬러, 맞춤 클리닉까지. 얼굴형과 모질, 생활 스타일을 함께 보고 디자인해서, 시술 후 몇 주가 지나도 손질이 쉬운 스타일을 만듭니다.",
      ],
      images: [{ src: PHOTOS.styleWave }, { src: PHOTOS.stylePinkViolet }],
      cta: [{ label: "시술 · 가격 보기", href: "/services" }],
    },
    {
      key: "values",
      kind: "values",
      items: [
        {
          title: "Awarded 3 years",
          body: "KCIA 한국소비자산업평가에서 2024 · 2025 · 2026년 3년 연속 우수 헤어디자이너 및 우수업체로 선정되었습니다.",
          image: { src: PHOTOS.kciaAward },
          link: { label: "더 알아보기", href: LINKS.naverPlace, external: true },
        },
        {
          title: "Trained in London",
          body: "사순웨이 마스터 과정(비달사순 ABC)을 수료하고, 2025년 영국 런던 비달사순 아카데미 Collection 코스를 이수했습니다.",
          image: { src: PHOTOS.houseOfSassoon },
          link: { label: "더 알아보기", href: "/about" },
        },
        {
          title: "One-to-one",
          body: "디자이너 한 명이 운영하는 우선 예약제 살롱. 오직 한 분만을 위한 조용하고 편안한 시간을 보장합니다.",
          image: { src: PHOTOS.signCurtain },
          link: { label: "예약하기", href: LINKS.booking, external: true },
        },
        {
          title: "Tested first",
          body: "살롱에서 쓰는 모든 시술 약은 Seveny가 직접 써보고 테스트한 뒤 검증된 제품만 사용합니다.",
          image: { src: PHOTOS.styleAshLayer },
          link: { label: "더 알아보기", href: "/salon" },
        },
      ],
    },
    {
      key: "cta",
      kind: "cta",
      kicker: "새로운 스타일, 준비되셨나요?",
      heading: "We look forward to seeing you !",
      body: ["모든 시술은 우선 예약제로 운영됩니다. 네이버 예약이나 전화로 편하게 예약해 주세요."],
      images: [{ src: PHOTOS.signWall }],
    },
  ],
};

/**
 * 후기 — 개별 고객 문장 대신 네이버 방문자 리뷰 키워드 집계를 쓴다.
 * (방문자 리뷰 378건, 평점 4.94, 키워드 투표 1,211건 · 2026-10-02 기준)
 */
export const testimonials = [
  {
    name: "네이버 방문자 213명",
    text: "“원하는 스타일로 잘해줘요” — 방문자 리뷰 378건 중 가장 많이 선택된 키워드입니다.",
    avatar: EMOJI.greenHeart,
    order: 1,
  },
  {
    name: "네이버 방문자 197명",
    text: "“친절해요” — 머리만큼이나 편안한 1:1 분위기 때문에 다시 찾아주시는 분들이 많습니다.",
    avatar: EMOJI.beatingHeart,
    order: 2,
  },
  {
    name: "네이버 방문자 146명",
    text: "“시술이 꼼꼼해요” — 한 분만 모시는 1인 샵이라 가능한 디테일입니다.",
    avatar: EMOJI.magnifier,
    order: 3,
  },
  {
    name: "네이버 방문자 102명",
    text: "“스타일 추천을 잘해줘요” — 유행보다 나에게 어울리는 커트와 컬러를 제안합니다.",
    avatar: EMOJI.hairDone,
    order: 4,
  },
];

export const REVIEW_STATS = { total: 378, rating: 4.94 };

/** 사업자 정보 — 실명은 여기에만 쓴다 */
export const BUSINESS = {
  nameKo: "세브니헤어",
  ownerKo: "이현주",
  ownerEn: "Lee Hyeon-ju",
  bizNo: "294-45-00585", // 사업자등록번호 (2026-10-02 고객 확인)
};
