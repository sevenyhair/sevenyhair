import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageEditor from "@/components/admin/blocks/PageEditor";
import SeoEditor from "@/components/admin/editors/SeoEditor";
import { SITE_PAGES } from "@/content/blocks";
import { ROUTES, siteUrl } from "@/content/seo";
import { loadAllInstagram, loadAllStyles } from "@/lib/admin/load";
import { getPage, getServices, getSeoOverride, getSharedBlocks, getShop, getStaff, getTestimonials } from "@/lib/queries";
import type { SeoOverride } from "@/lib/types";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string; open?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: SITE_PAGES.find((p) => p.slug === slug)?.label ?? "페이지" };
}

/** 페이지 메뉴 — 메뉴 이름 · 히어로 · 블록 · SEO. 블록이 보여주는 목록 데이터는 사이드바 "목록" 메뉴에서 고친다 */
export default async function PageMenu({ params, searchParams }: Props) {
  const [{ slug }, { tab, open }] = await Promise.all([params, searchParams]);
  const meta = SITE_PAGES.find((p) => p.slug === slug);
  if (!meta) notFound();

  const [page, shared, shop, allPages, services, styles, instagram, testimonials, staff, seo] = await Promise.all([
    getPage(slug),
    getSharedBlocks(),
    getShop(),
    Promise.all(SITE_PAGES.map((p) => getPage(p.slug))),
    getServices(),
    loadAllStyles(),
    loadAllInstagram(),
    getTestimonials(),
    getStaff(),
    getSeoOverride(slug),
  ]);

  // 블록 종류마다 어느 페이지에 놓였는지 ("공통 · 홈 · The Salon에도")
  const usage: Record<string, string[]> = {};
  allPages.forEach((pg, i) => {
    for (const s of pg.sections) {
      if (s.hidden) continue;
      const list = (usage[s.kind] ??= []);
      if (!list.includes(SITE_PAGES[i].label)) list.push(SITE_PAGES[i].label);
    }
  });

  const nav = shop.nav.find((n) => n.href === meta.path);
  const override: SeoOverride = seo ?? { route: slug };
  return (
    <PageEditor
      key={slug}
      label={meta.label}
      path={meta.path}
      initial={page}
      initialShared={shared}
      initialNav={nav ? { href: nav.href, label: nav.label } : undefined}
      usage={usage}
      counts={{
        prices: services.length,
        stylebook: styles.length,
        instagram: instagram.length,
        testimonials: testimonials.length,
        staff: staff.length,
      }}
      initialTab={tab === "seo" ? "seo" : "blocks"}
      initialOpen={open}
      seo={<SeoEditor inPage route={slug} keys={Object.keys(ROUTES)} defaults={ROUTES[slug]} initial={{ ...override, route: slug }} site={siteUrl()} />}
    />
  );
}
