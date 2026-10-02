import type { Metadata } from "next";
import CtaSection from "@/components/CtaSection";
import InstagramCards from "@/components/InstagramCards";
import PageHero from "@/components/PageHero";
import SiteFooter from "@/components/SiteFooter";
import { LINKS } from "@/content/defaults";
import { getInstagram, getPage, getShop } from "@/lib/queries";
import { routeMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return routeMetadata("journal");
}

/** 원본 Blog 자리 — @seveny.hair 인스타그램 피드 */
export default async function JournalPage() {
  const [shop, page, feed, home] = await Promise.all([getShop(), getPage("journal"), getInstagram(24), getPage("home")]);
  const cta = home.sections.find((s) => s.kind === "cta");

  return (
    <>
      <PageHero heading={page.hero.heading} image={page.hero.image} />
      <div className="section">
        <div className="wrapper">
          {/* 원본 블로그 목록은 스크롤 등장 없이 호버 확대만 있다 */}
          <InstagramCards items={feed} reveal={false} />
          <div className="journal-more">
            <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="button ghost-button">
              {shop.instagram.handle} 팔로우하기
            </a>
          </div>
        </div>
      </div>
      {cta && <CtaSection section={cta} shop={shop} />}
      <SiteFooter shop={shop} />
    </>
  );
}
