import { igPermalink, type InstagramItem } from "@/content/instagram";

/**
 * 인스타그램 게시물 카드 — 원본 블로그 카드(.post-card-v3)와 같은 모양.
 * 이미지는 R2 에 올린 썸네일(thumbnail), 없으면 /api/ig/[code] 프록시. 누르면 인스타그램 원문이 새 탭으로 열린다.
 * 릴스는 세로(9:16)라 카드 비율을 4:5 로 잘라 원본 카드 높이에 가깝게 맞춘다.
 */
export default function InstagramCards({ items, reveal = true }: { items: InstagramItem[]; reveal?: boolean }) {
  return (
    <div className="blog-posts" role="list">
      {items.map((it) => (
        <div key={it.code} className="blog-post-v3" role="listitem" data-reveal={reveal ? "up" : undefined}>
          <a href={igPermalink(it)} target="_blank" rel="noreferrer" className="post-card-v3 ig-card">
            <div className="post-card-info-v3">
              <h4 className="post-card-v3-heading">{it.title || it.caption}</h4>
              <div className="link-v2 white-link">인스타그램에서 보기</div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={it.thumbnail || `/api/ig/${it.code}`} alt="" loading="lazy" className="zoom-image" />
            {it.type === "reel" && <span className="ig-reel-badge" aria-hidden="true" />}
          </a>
        </div>
      ))}
    </div>
  );
}
