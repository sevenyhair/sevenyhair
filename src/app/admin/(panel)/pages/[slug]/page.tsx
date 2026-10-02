import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageEditor from "@/components/admin/blocks/PageEditor";
import InstagramEditor from "@/components/admin/editors/InstagramEditor";
import ReviewsEditor from "@/components/admin/editors/ReviewsEditor";
import SeoEditor from "@/components/admin/editors/SeoEditor";
import ServicesEditor from "@/components/admin/editors/ServicesEditor";
import StaffEditor from "@/components/admin/editors/StaffEditor";
import StylesEditor from "@/components/admin/editors/StylesEditor";
import { SITE_PAGES } from "@/content/blocks";
import { ROUTES, siteUrl } from "@/content/seo";
import { loadAllInstagram, loadAllStyles } from "@/lib/admin/load";
import { getPage, getServices, getSeoOverride, getSharedBlocks, getStaff, getTestimonials } from "@/lib/queries";
import type { SeoOverride } from "@/lib/types";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ tab?: string; open?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: SITE_PAGES.find((p) => p.slug === slug)?.label ?? "페이지" };
}

/** 페이지 메뉴 — 히어로 · 블록 · 블록에 연결된 목록 · SEO 를 한 화면에서 고친다 */
export default async function PageMenu({ params, searchParams }: Props) {
  const [{ slug }, { tab, open }] = await Promise.all([params, searchParams]);
  const meta = SITE_PAGES.find((p) => p.slug === slug);
  if (!meta) notFound();

  const [page, shared, allPages, services, styles, instagram, testimonials, staff, seo] = await Promise.all([
    getPage(slug),
    getSharedBlocks(),
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
      (usage[s.kind] ??= []).includes(SITE_PAGES[i].label) || usage[s.kind].push(SITE_PAGES[i].label);
    }
  });

  const override: SeoOverride = seo ?? { route: slug };
  return (
    <PageEditor
      key={slug}
      label={meta.label}
      path={meta.path}
      initial={page}
      initialShared={shared}
      usage={usage}
      initialTab={tab === "seo" ? "seo" : "blocks"}
      initialOpen={open}
      lists={{
        prices: <ServicesEditor initial={services} />,
        stylebook: <StylesEditor initial={styles} />,
        instagram: <InstagramEditor initial={instagram} />,
        testimonials: <ReviewsEditor initial={testimonials} />,
        staff: <StaffEditor initial={staff} />,
      }}
      seo={<SeoEditor inPage route={slug} keys={Object.keys(ROUTES)} defaults={ROUTES[slug]} initial={{ ...override, route: slug }} site={siteUrl()} />}
    />
  );
}
