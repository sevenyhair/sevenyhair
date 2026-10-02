import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/seo";

/** /robots.txt — 이미지 프록시(/api) · 어드민 · 미리보기는 크롤링하지 않는다 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin", "/preview"] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
    host: siteUrl(),
  };
}
