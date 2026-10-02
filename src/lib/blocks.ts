import type { Page, Section } from "./types";

/**
 * 옛 구조(version 없음) 페이지를 블록 목록으로 바꾼다 — 읽을 때마다 변환하고, 관리자에서 저장하면 version 2 로 남는다.
 *
 * 옛 구조는 페이지 코드가 key 로 섹션을 찾아 정해진 자리에 그렸다.
 * 그래서 새 기본 목록(defaults)의 순서·종류를 쓰고, 같은 key 의 내용만 DB 값으로 덮는다.
 * 옛 DB 의 "text" 종류는 key 에 따라 price-note(Services) · milestones(About) 로 바뀐다 — 종류는 기본 목록 것을 쓴다.
 */
export function upgradePage(db: Page, defaults: Page): Page {
  if ((db.version ?? 0) >= 2) return db;
  const old = new Map(db.sections?.map((s) => [s.key, s]) ?? []);
  const sections: Section[] = defaults.sections.map((d) => {
    const o = old.get(d.key);
    if (!o || d.kind === "values" || d.kind === "cta") return d; // 공통 블록 내용은 blocks 컬렉션으로 따로 읽는다
    return { ...d, ...o, kind: d.kind };
  });
  return { ...defaults, ...db, hero: { ...defaults.hero, ...db.hero }, sections, version: 2 };
}

/** 페이지에 처음 넣을 때 쓸, 겹치지 않는 key */
export function newKey(kind: string, taken: string[]): string {
  let i = 1;
  while (taken.includes(`${kind}-${i}`)) i++;
  return `${kind}-${i}`;
}
