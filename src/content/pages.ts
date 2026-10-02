/**
 * 하위 페이지 기본 콘텐츠 (services · salon · about · journal · contact). 제목은 영어, 설명은 한글.
 * sections 는 위에서부터 그리는 블록 목록 (종류는 src/content/blocks.ts).
 * 출처: 네이버 플레이스 메뉴·소개·디자이너 정보 (2026-10-02).
 */
import type { Page, PriceRow, Post, Service, Staff } from "../lib/types.ts";
import { LINKS } from "./defaults.ts";
import { PHOTOS } from "./photos.ts";

export const IMG = {
  milestonesBg: PHOTOS.houseOfSassoon,
  contact: PHOTOS.signWall,
};

/** 갤러리: 데스크톱 3열×5행 그리드 위치는 원본 그대로, 사진만 seveny 것으로 */
export const gallery = {
  desktop: [
    { src: PHOTOS.interior, area: "1 / 1 / 3 / 2", pos: "50% 60%", grow: true },
    { src: PHOTOS.interiorWide, area: "1 / 2 / 2 / 4", pos: "50% 55%" },
    { src: PHOTOS.styleAshLayer, area: "2 / 2 / 3 / 3", pos: "50% 40%" },
    { src: PHOTOS.styleTeal, area: "2 / 3 / 3 / 4", pos: "50% 45%" },
    { src: PHOTOS.styleBob, area: "3 / 1 / 4 / 2", pos: "50% 40%" },
    { src: PHOTOS.stylePinkViolet, area: "3 / 2 / 4 / 3", pos: "50% 50%" },
    { src: PHOTOS.styleMensCut, area: "3 / 3 / 4 / 4", pos: "50% 35%" },
    { src: PHOTOS.signCurtain, area: "4 / 1 / 5 / 3", pos: "50% 50%" },
    { src: PHOTOS.styleWave, area: "4 / 3 / 5 / 4", pos: "50% 45%" },
    { src: PHOTOS.styleBobBack, area: "5 / 1 / 6 / 2", pos: "50% 40%" },
    { src: PHOTOS.styleLongWave, area: "5 / 2 / 6 / 3", pos: "50% 45%" },
    { src: PHOTOS.styleShort, area: "5 / 3 / 6 / 4", pos: "50% 40%" },
  ],
  mobile: [
    { src: PHOTOS.interiorWide, area: "1 / 1 / 2 / 3", pos: "50% 55%" },
    { src: PHOTOS.styleAshLayer, area: "2 / 1 / 3 / 2" },
    { src: PHOTOS.interior, area: "2 / 2 / 4 / 3" },
    { src: PHOTOS.styleTeal, area: "3 / 1 / 4 / 2" },
    { src: PHOTOS.styleBob, area: "4 / 1 / 5 / 2" },
    { src: PHOTOS.stylePinkViolet, area: "4 / 2 / 5 / 3" },
    { src: PHOTOS.signCurtain, area: "5 / 1 / 6 / 3" },
    { src: PHOTOS.styleWave, area: "6 / 1 / 7 / 2" },
    { src: PHOTOS.styleMensCut, area: "6 / 2 / 7 / 3" },
    { src: PHOTOS.styleBobBack, area: "7 / 1 / 8 / 2" },
    { src: PHOTOS.styleLongWave, area: "7 / 2 / 8 / 3" },
  ],
};

export const pages: Record<string, Page> = {
  services: {
    slug: "services",
    title: "Services — 세브니헤어 시술 · 가격",
    hero: { heading: "Services", image: PHOTOS.styleAshLayer },
    version: 2,
    sections: [
      { key: "price-table", kind: "prices" },
      {
        key: "prices",
        kind: "price-note",
        heading: "2026년 기준 기본 가격입니다 (단위: 원).",
        body: [
          "모발 길이와 숱, 상태에 따라 가격이 달라질 수 있으며, 시술 전에 꼭 먼저 안내해 드립니다. 모든 시술은 우선 예약제로 운영되니 네이버 예약 또는 전화로 예약해 주세요.",
        ],
      },
      { key: "stylebook", kind: "stylebook", heading: "Style book" },
      { key: "cta", kind: "cta" },
    ],
  },
  salon: {
    slug: "salon",
    title: "The Salon — 세브니헤어",
    hero: { heading: "The Salon", image: PHOTOS.interiorWide },
    version: 2,
    sections: [
      {
        key: "intro",
        kind: "text",
        heading: "Quiet, careful,\nmade for you",
        body: [
          "세브니헤어는 디자이너 한 명이 운영하는 헤어살롱으로, 한 분 한 분을 위한 섬세하고 차분한 시술 환경을 드립니다. 미용은 단순한 스타일링을 넘어 얼굴형과 모질, 생활 스타일을 고려한 맞춤 디자인이어야 한다고 믿습니다.",
          "과하거나 필요 없는 시술은 권하지 않습니다. 기본에 충실하면서도 감각 있는 스타일, 유행보다 나에게 어울리는 스타일을 찾는 분들께 가장 편안한 공간이 되겠습니다.",
          "동래 화목아파트 정문 쪽, 충렬사로 38 1층에 있습니다. 4호선 충렬사역 3번 출구에서 도보 6분, 충렬사역 · 서원시장 버스정류장에서 도보 5분입니다. 전용 주차장은 없습니다.",
        ],
      },
      { key: "gallery", kind: "gallery", images: gallery.desktop.map((g) => ({ src: g.src })) },
      {
        key: "london",
        kind: "image-band",
        heading: "Trained at\nSassoon London",
        body: [
          "사순웨이 마스터 과정(비달사순 ABC)을 수료하고, 2025년 영국 런던 비달사순 아카데미에서 Collection 코스를 이수했습니다.",
          "런던에서 배운 정교한 커트와 새로운 디자인 감각을, 부산에서 한 분 한 분에게 맞춰 제안합니다.",
        ],
        images: [
          { src: PHOTOS.londonGroup },
          { src: PHOTOS.londonClass },
          { src: PHOTOS.kciaAward },
          { src: PHOTOS.londonFriends },
        ],
        cta: [{ label: "인스타그램에서 보기", href: "https://www.instagram.com/reel/DPpfUevjOEi/", external: true }],
      },
      { key: "values", kind: "values" },
    ],
  },
  about: {
    slug: "about",
    title: "About — Seveny",
    hero: { heading: "About", image: PHOTOS.londonCollection },
    version: 2,
    sections: [
      { key: "staff", kind: "staff" },
      {
        key: "milestones",
        kind: "milestones",
        heading: "Milestones",
        items: [
          { title: "2026", body: "KCIA 한국소비자산업평가 우수 헤어디자이너 (3년 연속)" },
          { title: "2025", body: "영국 런던 비달사순 Collection 코스 수료" },
          { title: "2025", body: "KCIA 한국소비자산업평가 우수 헤어디자이너 · 우수업체" },
          { title: "2024", body: "KCIA 한국소비자산업평가 우수 헤어디자이너 · 우수업체" },
          { title: "교육", body: "사순웨이 마스터 과정 수료 (비달사순 ABC)" },
          { title: "교육", body: "일본 히카리 헤어교육 수료" },
          { title: "학력", body: "동서대학교 디자인학과 전체 수석 졸업" },
          { title: "자격", body: "미용사 · 이용사 면허, 컬러리스트 기사, 시각디자인 기사" },
          { title: "경력", body: "헤어디자이너 경력 10년 이상, 호주 · 인도네시아 활동" },
        ],
        images: [{ src: PHOTOS.houseOfSassoon }],
      },
    ],
  },
  journal: {
    slug: "journal",
    title: "Journal — 세브니헤어 인스타그램",
    hero: { heading: "Journal", image: PHOTOS.signCurtain },
    version: 2,
    sections: [
      { key: "feed", kind: "instagram", count: 24, follow: true },
      { key: "cta", kind: "cta" },
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact — 세브니헤어 오시는 길 · 예약",
    hero: { heading: "Opening hours", image: PHOTOS.signWall },
    version: 2,
    sections: [],
  },
};

const r = (label: string, ...prices: (string | null)[]): PriceRow => ({ label, prices });
const note = (label: string, ...prices: (string | null)[]): PriceRow => ({ label, prices, note: true });
const ONE = ["", "기본가"];

export const services: Service[] = [
  {
    tab: "커트",
    columns: ONE,
    rows: [r("일반 커트 (여성 · 남성)", "18,000원"), note("* 상담과 마무리 스타일링이 포함됩니다.", null)],
    order: 1,
  },
  {
    tab: "펌",
    columns: ONE,
    rows: [r("일반펌", "60,000원"), r("남성 스타일펌", "60,000원")],
    order: 2,
  },
  {
    tab: "펌",
    heading: "열펌 · 매직",
    columns: ONE,
    rows: [
      r("디지털펌", "100,000원"),
      r("매직", "100,000원"),
      r("볼륨매직", "110,000원"),
      r("매직셋팅", "140,000원"),
      note("* 모발 길이와 상태에 따라 가격이 달라질 수 있습니다.", null),
    ],
    order: 3,
  },
  {
    tab: "염색",
    columns: ONE,
    rows: [
      r("전체 염색", "60,000원"),
      r("남성 전체 염색", "45,000원"),
      r("뿌리 염색", "40,000원"),
      r("탈색", "80,000원"),
      note("* 모발 길이와 상태에 따라 가격이 달라질 수 있습니다.", null),
    ],
    order: 4,
  },
  {
    tab: "클리닉",
    columns: ONE,
    rows: [r("세브니 고객맞춤 클리닉", "80,000원"), r("신데렐라 클리닉", "140,000원")],
    order: 5,
  },
];

export const staff: Staff[] = [
  {
    name: "Seveny",
    role: "원장 · 헤어디자이너",
    bio: [
      "10년 넘게 헤어디자이너로 일하며 호주와 인도네시아에서도 활동했습니다. 동서대학교 디자인학과를 수석으로 졸업했고, 미용사 · 이용사 면허와 컬러리스트 · 시각디자인 기사 자격을 갖고 있습니다.",
      "사순웨이 마스터 과정(비달사순 ABC)과 2025년 런던 비달사순 Collection 코스를 수료했고, KCIA 한국소비자산업평가에서 3년 연속 우수 헤어디자이너로 선정되었습니다.",
      "모든 시술 약은 제가 직접 써보고 테스트한 제품만 사용합니다. 스타일은 유행이 아니라 고객님의 얼굴형과 모질, 생활 방식에서 시작해야 한다고 생각합니다. 기본에 충실하면서도 감각 있게, 트렌드를 먼저 배우고 소통하는 디자이너가 되겠습니다.",
      "세브니헤어에서 뵙기를 기다리겠습니다.",
    ],
    photo: PHOTOS.ownerPortrait,
    order: 1,
  },
];

/** 블로그 글(DB posts). 지금은 Journal 이 인스타그램 피드를 쓰므로 비워 둔다. */
export const posts: Post[] = [];

export const contactLinks = [
  { label: "네이버 예약", href: LINKS.booking },
  { label: "네이버 블로그", href: LINKS.blog },
  { label: "유튜브", href: LINKS.youtube },
];
