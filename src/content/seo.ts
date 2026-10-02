/**
 * 라우트별 SEO 문구. 제목은 "영어 타이틀 · 한글 설명" 형태로 두 언어 검색에 모두 걸리게 한다.
 * og 는 공유 이미지(opengraph-image)에 들어가는 글자 — 영어 제목 + 한글 한 줄.
 * 검색어는 인스타그램 소개에 쓰인 지역명(동래 · 안락동 · 명장동 · 충렬사)을 따른다.
 */
import { PHOTOS } from "./photos.ts";

export type RouteSeo = {
  path: string;
  title: string;
  description: string;
  og: { title: string; subtitle: string; image: string };
  priority: number;
};

export const SITE_NAME = "세브니헤어 SEVENY HAIR";

export const KEYWORDS = [
  "세브니헤어",
  "SEVENY HAIR",
  "동래 미용실",
  "충렬사역 미용실",
  "안락동 미용실",
  "명장동 미용실",
  "부산 미용실",
  "1인 미용실",
  "남자 원장 미용실",
  "비달사순",
];

export const ROUTES: Record<string, RouteSeo> = {
  home: {
    path: "/",
    title: "세브니헤어 SEVENY HAIR — 동래 1인 헤어살롱",
    description:
      "부산 동래 충렬사역 근처 1인 헤어살롱 세브니헤어. 상담부터 커트·펌·컬러까지 Seveny 원장이 직접 시술하는 우선 예약제 살롱입니다. KCIA 3년 연속 우수 헤어디자이너.",
    og: { title: "One chair, one designer", subtitle: "동래 1인 헤어살롱 · 우선 예약제", image: PHOTOS.interior },
    priority: 1,
  },
  services: {
    path: "/services",
    title: "Services · 시술과 가격",
    description:
      "세브니헤어 커트·펌·염색·클리닉 기본 가격과 스타일북. 일반 커트 18,000원부터, 디지털펌·매직·탈색·신데렐라 클리닉까지.",
    og: { title: "Services", subtitle: "커트 · 펌 · 염색 · 클리닉 가격과 스타일북", image: PHOTOS.styleAshLayer },
    priority: 0.9,
  },
  salon: {
    path: "/salon",
    title: "The Salon · 살롱 소개",
    description:
      "조용하고 꼼꼼한 1인 헤어살롱 세브니헤어의 공간과 시술 갤러리. 런던 비달사순에서 배운 커트와 디자인 감각을 부산에서 제안합니다.",
    og: { title: "The Salon", subtitle: "조용하고 꼼꼼한, 나만을 위한 살롱", image: PHOTOS.interiorWide },
    priority: 0.8,
  },
  about: {
    path: "/about",
    title: "About · Seveny 원장 소개",
    description:
      "10년 이상 경력의 헤어디자이너 Seveny. 사순웨이 마스터 과정, 2025 런던 비달사순 Collection 코스 수료, KCIA 한국소비자산업평가 3년 연속 우수 헤어디자이너.",
    og: { title: "About Seveny", subtitle: "런던 비달사순 · KCIA 3년 연속 우수 디자이너", image: PHOTOS.houseOfSassoon },
    priority: 0.7,
  },
  journal: {
    path: "/journal",
    title: "Journal · 인스타그램 소식",
    description: "세브니헤어 인스타그램(@seveny.hair) 최신 시술과 살롱 소식.",
    og: { title: "Journal", subtitle: "@seveny.hair 최신 소식", image: PHOTOS.signCurtain },
    priority: 0.6,
  },
  contact: {
    path: "/contact",
    title: "Contact · 오시는 길 · 예약",
    description:
      "부산 동래구 충렬사로 38 1층 (화목아파트 정문 앞), 4호선 충렬사역 3번 출구 도보 6분. 화요일 정기 휴무, 네이버 예약·전화 0507-1351-8646.",
    og: { title: "Contact", subtitle: "충렬사역 3번 출구 도보 6분 · 화요일 휴무", image: PHOTOS.signWall },
    priority: 0.8,
  },
};

/** 운영 도메인 (2026-10-02 연결) */
export const PRODUCTION_URL = "https://www.sevenyhair.com";

/**
 * 사이트 주소 — sitemap · 공유 이미지 · canonical 이 쓴다.
 * NEXT_PUBLIC_SITE_URL 이 있으면 그 값, 운영 배포면 www.sevenyhair.com,
 * 미리보기 배포면 그 배포 주소, 로컬이면 localhost.
 */
export function siteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (process.env.VERCEL_ENV === "production") return PRODUCTION_URL;
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3040";
}
