import type { Metadata } from "next";
import SeoEditor from "@/components/admin/editors/SeoEditor";
import { ROUTES, siteUrl } from "@/content/seo";
import { getSeoOverride } from "@/lib/queries";
import type { SeoOverride } from "@/lib/types";

export const metadata: Metadata = { title: "SEO · 공유" };

export default async function SeoAdminPage({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const { r } = await searchParams;
  const keys = Object.keys(ROUTES);
  const route = keys.includes(r ?? "") ? (r as string) : "home";
  const override: SeoOverride = (await getSeoOverride(route)) ?? { route };
  return <SeoEditor key={route} route={route} keys={keys} defaults={ROUTES[route]} initial={{ ...override, route }} site={siteUrl()} />;
}
