import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageHero from "@/components/PageHero";
import SiteFooter from "@/components/SiteFooter";
import { SITE_NAME } from "@/content/seo";
import { getCustomPage, getShop } from "@/lib/queries";
import { sanitizeRichHtml } from "@/lib/sanitize";

type Params = { params: Promise<{ slug: string }> };

/** 어드민 → 페이지 에서 만든 커스텀 페이지. 사이트 디자인(히어로 + 본문 + 푸터) 그대로 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = await getCustomPage((await params).slug);
  if (!page) return {};
  const title = page.seo?.title?.trim() || page.title;
  const description = page.seo?.description?.trim() || undefined;
  return {
    title,
    description,
    alternates: { canonical: `/p/${page.slug}` },
    openGraph: { type: "article", locale: "ko_KR", siteName: SITE_NAME, url: `/p/${page.slug}`, title, description },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CustomPageView({ params }: Params) {
  const { slug } = await params;
  const [page, shop] = await Promise.all([getCustomPage(slug), getShop()]);
  if (!page) notFound();

  return (
    <>
      {page.heroImage ? (
        <PageHero heading={page.title} image={page.heroImage} />
      ) : (
        <div className="section custom-page-head">
          <h1 className="heading">{page.title}</h1>
        </div>
      )}
      <article className="section custom-page">
        <div className="wrapper rich-text" dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(page.html) }} />
      </article>
      <SiteFooter shop={shop} />
    </>
  );
}
