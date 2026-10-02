import type { MetadataRoute } from "next";
import { ROUTES, siteUrl } from "@/content/seo";
import { getPublishedPages } from "@/lib/queries";

/** /sitemap.xml — 공개 라우트 + 공개된 커스텀 페이지. /api, /admin, /post 는 넣지 않는다. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const custom = await getPublishedPages();
  const base = siteUrl();
  const now = new Date();
  return [
    ...Object.values(ROUTES).map((r) => ({
      url: `${base}${r.path === "/" ? "" : r.path}`,
      lastModified: now,
      changeFrequency: r.path === "/journal" ? ("weekly" as const) : ("monthly" as const),
      priority: r.priority,
    })),
    ...custom.map((p) => ({
      url: `${base}/p/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    { url: `${base}/imprint`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
