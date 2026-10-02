import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * 커스텀 페이지 본문 정제 — 렌더할 때 한 번 더 거른다 (저장할 때도 거른다).
 * Ignite 는 isomorphic-dompurify 의 jsdom 이 Vercel 에서 ESM/CJS 충돌로 500 을 냈다 → 순수 JS 인 sanitize-html.
 *
 * 허용: 문단·제목·목록·인용·표·링크·이미지·강조, 그리고 유튜브·네이버TV 임베드 iframe.
 * 막음: script · style · 이벤트 속성 · javascript: URL · style 안의 url()/expression().
 */
const EMBED_HOSTS = ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com", "tv.naver.com"];

export function sanitizeRichHtml(html: string): string {
  return sanitizeHtml(html ?? "", {
    allowedTags: [
      ...sanitizeHtml.defaults.allowedTags,
      "img",
      "figure",
      "figcaption",
      "iframe",
      "u",
      "s",
      "mark",
      "hr",
      "br",
    ],
    allowedAttributes: {
      "*": ["class", "style", "id"],
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "alt", "title", "width", "height", "loading"],
      iframe: ["src", "width", "height", "title", "allow", "allowfullscreen", "frameborder"],
      td: ["colspan", "rowspan"],
      th: ["colspan", "rowspan"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedIframeHostnames: EMBED_HOSTS,
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.target === "_blank") attribs.rel = "noopener noreferrer";
        return { tagName, attribs };
      },
      "*": (tagName, attribs) => {
        if (attribs.style && /url\(|expression\(|javascript:|@import/i.test(attribs.style)) delete attribs.style;
        return { tagName, attribs };
      },
    },
    nonTextTags: ["script", "style", "textarea", "noscript", "title"],
  });
}
