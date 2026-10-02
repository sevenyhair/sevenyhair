import type { Metadata } from "next";
import CtaSection from "@/components/CtaSection";
import PageHero from "@/components/PageHero";
import PriceTabs from "@/components/PriceTabs";
import SiteFooter from "@/components/SiteFooter";
import StyleBook from "@/components/StyleBook";
import { routeMetadata } from "@/lib/seo";
import { getPage, getServices, getShop, getStyles } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return routeMetadata("services");
}

export default async function ServicesPage() {
  const [shop, page, tables, home, styles] = await Promise.all([
    getShop(),
    getPage("services"),
    getServices(),
    getPage("home"),
    getStyles(),
  ]);
  const prices = page.sections.find((s) => s.key === "prices");
  const cta = home.sections.find((s) => s.kind === "cta");

  return (
    <>
      <PageHero heading={page.hero.heading} image={page.hero.image} position="50% 35%" />
      <div className="section">
        <div className="wrapper">
          <PriceTabs tables={tables} />
        </div>
      </div>
      {prices && (
        <section className="section preise-section">
          <div className="preise-box">
            <p className="preise-text">
              {prices.heading}
              {prices.body?.map((b, i) => (
                <span key={i} className="preise-sub">
                  <br />
                  <br />
                  {b}
                </span>
              ))}
            </p>
          </div>
        </section>
      )}

      {/* 네이버 플레이스 스타일 정보 */}
      <div className="section style-section">
        <div className="wrapper">
          <h2 className="heading style-heading">Style book</h2>
          <StyleBook styles={styles} />
        </div>
      </div>

      {cta && <CtaSection section={cta} shop={shop} />}
      <SiteFooter shop={shop} />
    </>
  );
}
