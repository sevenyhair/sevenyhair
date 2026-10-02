import { ROUTES } from "@/content/seo";
import { renderOgImage } from "@/lib/og";

/**
 * 관리자 SEO 화면의 공유 이미지 미리보기 — 아직 저장하지 않은 문구·사진으로 그린다.
 * 공개 /opengraph-image 주소는 라우트 그룹 때문에 개발 서버에서 해시가 붙어 직접 부를 수 없다.
 * /api/admin 은 middleware 가 막는다.
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const base = ROUTES[q.get("key") ?? "home"] ?? ROUTES.home;
  const pick = (k: string, fallback: string) => q.get(k)?.trim() || fallback;
  return renderOgImage({
    title: pick("title", base.og.title),
    subtitle: pick("subtitle", base.og.subtitle),
    image: pick("image", base.og.image),
  });
}
