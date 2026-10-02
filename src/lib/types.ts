/**
 * seveny hair 데이터 모델 (DB: seveny)
 *
 * shop          — 매장 기본 정보 (단일 문서)
 * pages         — 페이지별 히어로·섹션 (slug 로 구분)
 * services      — 시술·가격표 (Angebot)
 * testimonials  — 고객 후기
 * staff         — 디자이너 소개 (Über uns)
 * posts         — 블로그/공지
 *
 * 화면은 DB 를 먼저 읽고, 실패하거나 비어 있으면 src/content/defaults.ts 로 그린다.
 */

export type ImageRef = {
  src: string;
  alt?: string;
};

export type LinkRef = {
  label: string;
  href: string;
  external?: boolean;
};

export type OpeningHour = {
  days: string; // "DI – DO"
  lines: string[]; // ["09:00 – 12:00 Uhr", "13:00 – 18:00 Uhr"]
};

export type Shop = {
  name: string; // "LAURENCE."
  nameSuffix: string; // "das Haarlokal."
  byline: string; // "by Laurence Fischer"
  owner: string;
  address: { street: string; zip: string; city: string; country: string };
  phone: string;
  phoneHref: string;
  email: string;
  instagram: { handle: string; url: string };
  bookingUrl: string;
  naverPlaceUrl?: string;
  logos: {
    vertical: string; // 데스크톱 좌측 내비 (큰 로고)
    horizontal: string; // 태블릿·모바일 상단바 (작은 로고)
    hero: string; // 히어로 흰색 로고
    preloader: string;
  };
  /** 네이버 지도 — 좌표·확대 수준 (어드민에서 수정) */
  map?: { lat: number; lng: number; zoom: number };
  hours: OpeningHour[];
  payments: { label: string; icon: string }[];
  paymentNote: string;
  copyright: string;
  credit: string;
  nav: LinkRef[];
};

export type Section = {
  key: string; // 페이지 안에서 유일
  kind: "side-feature" | "values" | "text" | "gallery" | "cta" | "image-band";
  heading?: string;
  kicker?: string;
  body?: string[];
  images?: ImageRef[];
  cta?: LinkRef[];
  items?: { title: string; body: string; image?: ImageRef; link?: LinkRef }[];
  layout?: "media-left" | "media-right";
};

export type Page = {
  slug: string; // "home" | "angebot" | ...
  title: string;
  hero: {
    heading: string;
    body?: string;
    image: string;
    cta?: LinkRef[];
  };
  sections: Section[];
};

/**
 * 가격표 한 장. 탭(DAMEN/HERREN…) 안에 여러 장이 순서대로 놓인다.
 * columns[0] 은 서비스명 열 머리(보통 빈 문자열), 나머지는 가격 열 머리("Kurz" 등).
 * 머리가 모두 비면 머리 행을 그리지 않는다.
 */
export type PriceRow = {
  label: string;
  prices: (string | null)[]; // null = 빈 칸(밑줄만)
  note?: boolean; // 각주 행: 가는 글씨, 밑줄 없음
};

export type Service = {
  tab: string; // "DAMEN"
  heading?: string; // 표 위 소제목 ("Farbe")
  columns: string[];
  rows: PriceRow[];
  order: number;
};

export type Testimonial = {
  name: string;
  text: string;
  avatar: string;
  order: number;
};

export type Staff = {
  name: string;
  role: string;
  bio: string[];
  photo: string;
  order: number;
};

export type Post = {
  slug: string;
  title: string;
  excerpt?: string;
  thumbnail: string;
  body: string; // HTML
  category?: string;
  publishedAt: string; // ISO
};

export type SeoOverride = {
  route: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogSubtitle?: string;
  ogImage?: string;
};

export type CustomPage = {
  _id?: string;
  slug: string;
  title: string;
  heroImage?: string;
  html: string;
  published: boolean;
  seo?: { title?: string; description?: string; ogImage?: string };
  updatedAt?: string;
};

export type MediaItem = {
  _id?: string;
  key: string;
  url: string;
  name?: string;
  type?: string;
  size?: number;
  width?: number;
  height?: number;
  alt?: string;
  createdAt?: string;
};
