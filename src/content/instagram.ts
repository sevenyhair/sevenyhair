/**
 * @seveny.hair 인스타그램 피드 — 2026-10-02 프로필에서 수집한 최근 24개 (모두 릴스).
 *
 * 이미지는 저장하지 않는다. 게시물 코드(shortcode)만 두고 /api/ig/[code] 가
 * 인스타그램에서 그때그때 받아 캐시해 내려준다 (인스타 CDN 주소는 서명이 만료되고,
 * 다른 출처에서 직접 링크하면 cross-origin-resource-policy 로 막힌다).
 *
 * title 은 카드에 쓰는 제목(원문 캡션 첫 줄), caption 은 원문 그대로.
 * 새 게시물은 `npm run ig -- add <링크>` 로 직접 등록한다. DB 에 한 건이라도 있으면 DB 가 이 목록을 대신한다.
 */
export type InstagramItem = {
  code: string;
  type: "reel" | "post";
  title: string;
  caption: string;
  pinned?: boolean;
  /** R2 에 올린 썸네일 (img.sevenyhair.com/instagram/<code>.jpg). 없으면 /api/ig 프록시 */
  thumbnail?: string;
  order: number;
};

const raw: [string, string, string, boolean?][] = [
  ["DPe_P2yjCZS", "런던 비달사순 오늘 첫 모델😊", "런던 비달사순 오늘 첫 모델😊", true],
  ["DPpfUevjOEi", "collection class at sassoon london", "collection class at sassoon london", true],
  ["DQ4PesriX8m", "You guys were awesome today✨", "You guys were awesome today✨", true],
  ["Dd8xMYwJeOx", "내 휴일은 금방가네❤️", "내 휴일은 금방가네❤️"],
  ["Dd6H-gNpYi5", "수요일 전체 예약 마감🩵", "수요일 전체 예약 마감🩵"],
  ["Dd1FtbFJ5vN", "월요일 전체 예약 너무 감사합니다🙏🏻", "월요일 전체 예약 너무 감사합니다🙏🏻"],
  ["DdyfUTKJKS6", "추석 마지막날 전체 예약마감🩵", "추석 마지막날 전체 예약마감🩵"],
  ["Ddqd431xY9U", "추석 전날 예약 마감!! 감사합니다🩵", "추석 전날 예약 마감!! 감사합니다🩵"],
  ["DdoR6mKp6Df", "수요일 전체 예약 마감🩵", "수요일 전체 예약 마감🩵"],
  ["Ddi8CIsJsIh", "월요일 전체 예약 마감!! 감사합니다", "월요일 전체 예약 마감!! 감사합니다"],
  ["DdgXkoRpwFu", "24시간이 부족한 요즘🩵", "24시간이 부족한 요즘🩵"],
  ["DddwEpbJ0K0", "토요일 전체 예약 마감!!🩵🩵", "토요일 전체 예약 마감!!🩵🩵"],
  ["DdbU6t2pcL5", "금요일 전체 예약 마감 감사합니다🩵", "금요일 전체 예약 마감 감사합니다🩵"],
  ["DdWIY1KJIvY", "수요일 전체 예약 마감🩵", "수요일 전체 예약 마감🩵"],
  ["DdQ5GXNp2VN", "월요일 시험치러 가서🌿", "월요일 시험치러 가서🌿"],
  ["DdOJcigJIMJ", "일요일 4시까지 영업했는데,", "일요일 4시까지 영업했는데,"],
  ["DdJPPf9Jh1T", "금요일 전체 예약 마감🙏🏻 감사합니다", "금요일 전체 예약 마감🙏🏻 감사합니다"],
  ["Dc_HRy2ph4L", "죽음의 월요일 감사합니다🩵", "죽음의 월요일 감사합니다🩵"],
  ["Dc57uxaJXeE", "토요일 너무 많은 분들 방문 감사합니다🙏🏻", "토요일 너무 많은 분들 방문 감사합니다🙏🏻"],
  ["Dc1AJGCpZLy", "오늘은 짧고 굵게 끝내기", "오늘은 짧고 굵게 끝내기"],
  ["DcyC-T9J2T4", "수요일 / 목요일 전체 예약 마감🩵", "수요일 / 목요일 전체 예약 마감🩵"],
  ["DctC1QRpswe", "2년 단발 생활하다 급 짧머", "2년 단발 생활하다 급 짧머"],
  ["Dcs0KFKpogC", "월요일도 많은 방문 감사합니다🙏🏻", "월요일도 많은 방문 감사합니다🙏🏻"],
  ["DcnqFxdRaIn", "토요일 전체 예약 마감! 감사합니다🩵", "토요일 전체 예약 마감! 감사합니다🩵"],
];

export const instagram: InstagramItem[] = raw.map(([code, title, caption, pinned], i) => ({
  code,
  type: "reel",
  title,
  caption,
  pinned: pinned ?? false,
  order: i + 1,
}));

export const IG_CODE_RE = /^[A-Za-z0-9_-]{5,40}$/;

export function igPermalink(item: Pick<InstagramItem, "code" | "type">) {
  return `https://www.instagram.com/${item.type === "reel" ? "reel" : "p"}/${item.code}/`;
}
