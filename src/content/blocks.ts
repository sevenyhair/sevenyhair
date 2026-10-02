/**
 * 페이지 블록 종류 — 지금 사이트에 있는 구역을 그대로 블록으로 만든 것 (새 디자인 없음).
 * 관리자 블록 추가 목록 · 렌더러(src/components/blocks/PageBlocks.tsx)가 같이 쓴다.
 *
 * group
 *  - content: 내용이 블록 안에 있다. 같은 종류를 여러 번 넣을 수 있다.
 *  - shared : 내용은 한 벌(blocks 컬렉션). 어느 페이지에서 고쳐도 모든 페이지가 바뀐다.
 *  - data   : 내용은 각 목록 데이터(가격표·후기 등). 블록은 놓을 자리와 제목만 정한다.
 */
import type { Section, SectionKind } from "../lib/types.ts";
import { gallery } from "./pages.ts";
import { PHOTOS } from "./photos.ts";

export type BlockGroup = "content" | "shared" | "data";

export type BlockSpec = {
  label: string;
  description: string;
  group: BlockGroup;
  /** 새로 추가할 때의 기본 내용 (key 는 편집기가 붙인다) */
  template: () => Omit<Section, "key" | "kind">;
};

export const BLOCKS: Record<SectionKind, BlockSpec> = {
  "side-feature": {
    label: "사진 2장 + 글",
    description: "겹친 사진 두 장과 제목·문단·버튼. 사진을 왼쪽/오른쪽에 둘 수 있습니다.",
    group: "content",
    template: () => ({ layout: "media-left", heading: "", body: [""], images: [{ src: "" }, { src: "" }], cta: [] }),
  },
  text: {
    label: "제목 + 문단",
    description: "왼쪽 큰 제목, 오른쪽 문단 (The Salon 소개)",
    group: "content",
    template: () => ({ heading: "", body: [""] }),
  },
  "image-band": {
    label: "어두운 사진 띠",
    description: "배경 사진 위 사진 2장 · 작은 이미지 · 흰 글씨 (The Salon 런던 구역)",
    group: "content",
    template: () => ({ heading: "", body: [""], images: [{ src: "" }, { src: "" }, { src: "" }, { src: "" }], cta: [] }),
  },
  milestones: {
    label: "연혁 목록",
    description: "배경 사진 위 연도 + 내용 목록 (About)",
    group: "content",
    template: () => ({ heading: "Milestones", items: [{ title: "", body: "" }], images: [{ src: "" }] }),
  },
  "price-note": {
    label: "안내 상자",
    description: "가운데 상자에 굵은 첫 줄 + 문단 (Services 가격 안내)",
    group: "content",
    template: () => ({ heading: "", body: [""] }),
  },
  gallery: {
    label: "사진 갤러리",
    description: "사진 12장 격자, 누르면 크게 보기 (The Salon)",
    group: "content",
    template: () => ({ images: gallery.desktop.map((g) => ({ src: g.src })) }),
  },
  values: {
    label: "아이콘 4열",
    description: "사진 · 제목 · 설명 · 버튼 4칸",
    group: "shared",
    template: () => ({}),
  },
  cta: {
    label: "예약 유도",
    description: "고정 배경 사진 위 문구 + 전화 · 예약 버튼",
    group: "shared",
    template: () => ({}),
  },
  testimonials: {
    label: "후기 슬라이더",
    description: "네이버 리뷰 키워드 후기 (내용은 후기 목록)",
    group: "data",
    template: () => ({ heading: "What our\nguests say", images: [{ src: PHOTOS.interiorWide }] }),
  },
  instagram: {
    label: "인스타그램 피드",
    description: "인스타 게시물 카드 (내용은 인스타그램 목록)",
    group: "data",
    template: () => ({ heading: "", count: 6, cta: [], follow: false }),
  },
  prices: {
    label: "가격표",
    description: "탭으로 나뉜 시술 가격표 (내용은 시술 · 가격)",
    group: "data",
    template: () => ({}),
  },
  stylebook: {
    label: "스타일북",
    description: "스타일 사진 목록 (내용은 스타일북)",
    group: "data",
    template: () => ({ heading: "Style book" }),
  },
  staff: {
    label: "원장 소개",
    description: "사진 + 이름 + 소개글 (내용은 원장 소개)",
    group: "data",
    template: () => ({}),
  },
};

export const GROUP_LABEL: Record<BlockGroup, string> = {
  content: "내용 블록",
  shared: "공통 블록 — 한 곳에서 고치면 모든 페이지에 반영",
  data: "목록 연결 블록 — 내용은 연결된 목록에서",
};

/** 사이트 기본 페이지 (관리자 메뉴 순서) */
export const SITE_PAGES = [
  { slug: "home", label: "홈", path: "/" },
  { slug: "services", label: "Services", path: "/services" },
  { slug: "salon", label: "The Salon", path: "/salon" },
  { slug: "about", label: "About", path: "/about" },
  { slug: "journal", label: "Journal", path: "/journal" },
  { slug: "contact", label: "Contact", path: "/contact" },
] as const;

export const isSharedKind = (k: SectionKind): k is "values" | "cta" => k === "values" || k === "cta";
