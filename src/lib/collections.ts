/** 컬렉션 이름. 시드 스크립트와 조회 함수가 같이 쓴다. */
export const COLLECTIONS = {
  shop: "shop",
  pages: "pages",
  services: "services",
  testimonials: "testimonials",
  staff: "staff",
  posts: "posts",
  instagram: "instagram",
  styles: "styles",
  seo: "seo",
  customPages: "custompages",
  media: "media",
  blocks: "blocks", // 공통 블록 내용 (values · cta)
  drafts: "drafts", // 관리자 저장 전 미리보기 (1시간 뒤 삭제)
} as const;
