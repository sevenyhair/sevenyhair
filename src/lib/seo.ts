import type { Metadata } from "next";
import { KEYWORDS, ROUTES, SITE_NAME, type RouteSeo } from "@/content/seo";
import { getSeoOverride } from "./queries";

/**
 * 라우트 SEO = content/seo.ts 기본값 + 어드민 덮어쓰기(DB seo 컬렉션). 빈 칸은 기본값.
 * 공유 이미지는 같은 폴더의 opengraph-image.tsx 가 붙인다 (어드민 값으로 문구·사진이 바뀐다).
 */
export type RouteKey = keyof typeof ROUTES;

export async function resolveRouteSeo(key: RouteKey): Promise<RouteSeo> {
  const base = ROUTES[key];
  const o = await getSeoOverride(key);
  if (!o) return base;
  return {
    ...base,
    title: o.title?.trim() || base.title,
    description: o.description?.trim() || base.description,
    og: {
      title: o.ogTitle?.trim() || base.og.title,
      subtitle: o.ogSubtitle?.trim() || base.og.subtitle,
      image: o.ogImage?.trim() || base.og.image,
    },
  };
}

export async function routeMetadata(key: RouteKey): Promise<Metadata> {
  const r = await resolveRouteSeo(key);
  const isHome = r.path === "/";
  const fullTitle = isHome ? r.title : `${r.title} | ${SITE_NAME}`;
  return {
    title: isHome ? { absolute: r.title } : r.title,
    description: r.description,
    keywords: KEYWORDS,
    alternates: { canonical: r.path },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: SITE_NAME,
      url: r.path,
      title: fullTitle,
      description: r.description,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description: r.description },
  };
}
