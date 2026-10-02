/**
 * seveny hair 사진 — 네이버 플레이스 "업체 사진" 22장 (2026-10-02 수집).
 * 2026-10-02 R2(img.sevenyhair.com)로 옮겼다 — scripts/migrate-images.ts. 원래 주소는 DB media.source 에 남아 있다.
 * 방문자 리뷰 사진은 고객이 올린 것이라 쓰지 않는다.
 */

export const PHOTOS = {
  ownerPortrait: "https://img.sevenyhair.com/site/IMG_4139-b1a91ee4.jpg", // 원장 + KCIA 배지 (1170×1244)
  kciaAward: "https://img.sevenyhair.com/site/IMG_4133-ec12d6be.jpg", // 2026 KCIA 포스터 (정사각)
  londonGroup: "https://img.sevenyhair.com/site/IMG_4883-b0d723ad.jpg", // 런던 사순 단체
  londonMirror: "https://img.sevenyhair.com/site/IMG_5178-f193b883.jpg", // 사순 교실 거울
  londonFriends: "https://img.sevenyhair.com/site/IMG_4878-f3d9640c.jpg",
  londonClass: "https://img.sevenyhair.com/site/IMG_5010-2ed30b9f.jpg", // 수강생 단체 (세로)
  londonCollection: "https://img.sevenyhair.com/site/IMG_5183-0f2cc99a.jpg", // collection class 캡처
  houseOfSassoon: "https://img.sevenyhair.com/site/IMG_5184-2c8339ec.jpg",
  signWall: "https://img.sevenyhair.com/site/X8jKyDsh0BIOulVqd1de6zF8_jpeg-05b12491.jpg", // SEVENY HAIR 벽 사인
  interior: "https://img.sevenyhair.com/site/PeFi5lP1Hs2zYMCzpI0Fls4F_jpeg-2d688c78.jpg", // 실내 (3024×3575)
  styleAshLayer: "https://img.sevenyhair.com/site/C5257F13-7CEA-4BD4-B809-2FBEB496129D-3bd4e49e.jpg",
  styleTeal: "https://img.sevenyhair.com/site/5E793B9F-58A4-4454-962E-0B4A810432AB-e06fe164.jpg",
  styleMensCut: "https://img.sevenyhair.com/site/4C67225C-47F8-4CD4-93BF-99A52D3829B6-bf28bb5c.jpg",
  styleBob: "https://img.sevenyhair.com/site/14BC2E81-5B5E-4E92-8BA8-E8C2B5DD8E42-2a2aa2b4.jpg",
  styleWave: "https://img.sevenyhair.com/site/ABE6EB64-3F50-47A2-A48B-414936F22F84-bec1beb7.jpg",
  styleBobBack: "https://img.sevenyhair.com/site/336C77D4-DDA0-48F4-B43B-7371FCB0D824-7a849651.jpg",
  stylePinkViolet: "https://img.sevenyhair.com/site/00E5FB81-0F75-40F4-86BE-9401733FE150-82c81f2c.jpg",
  styleShort: "https://img.sevenyhair.com/site/A7DB0736-5956-4321-888A-0B95A6BD0EBA-b4c0fc83.jpg",
  styleLongWave: "https://img.sevenyhair.com/site/D98578CB-D75C-45F6-81DB-61E2C8A7779C-f179ede3.jpg",
  interiorWide: "https://img.sevenyhair.com/site/09TyEtXkPM40yZZ6MPawOXCC_jpeg-db3ae7aa.jpg", // 실내 (샹들리에)
  signCurtain: "https://img.sevenyhair.com/site/e4lYhUFSu8QiCBY3PXuD3QfV_jpeg-2900dc71.jpg", // 커튼 위 사인
  interiorAlt: "https://img.sevenyhair.com/site/4NAphNLTGR8KrDOwmV7-QHJl_jpeg-bb9d276f.jpg",
} as const;

/** 네이버 리뷰 키워드 아이콘 (후기 아바타 자리) — 이것도 R2 로 옮겼다 */
export const EMOJI = {
  greenHeart: "https://img.sevenyhair.com/site/green_heart20220119222224-967ccccc.webp",
  beatingHeart: "https://img.sevenyhair.com/site/beating_heart20220119222223-c2421fe8.webp",
  magnifier: "https://img.sevenyhair.com/site/magnifying_glass20220119222236-6c6b6d9a.webp",
  hairDone: "https://img.sevenyhair.com/site/woman_getting_hair_done20220119222234-b497c415.webp",
  sunglasses: "https://img.sevenyhair.com/site/face_with_sunglasses20220119222235-f38fb766.webp",
  sparkles: "https://img.sevenyhair.com/site/sparkles20220119222028-3051bbb8.webp",
} as const;
