import Link from "next/link";
import CtaSection from "@/components/CtaSection";
import FixedBg from "@/components/FixedBg";
import { IconArrowDown, IconLocation } from "@/components/Icons";
import InstagramCards from "@/components/InstagramCards";
import Logo from "@/components/Logo";
import SideFeature from "@/components/SideFeature";
import SiteFooter from "@/components/SiteFooter";
import TestimonialSlider from "@/components/TestimonialSlider";
import ValuesRow from "@/components/ValuesRow";
import { LINKS, REVIEW_STATS } from "@/content/defaults";
import { PHOTOS } from "@/content/photos";
import type { Metadata } from "next";
import { routeMetadata } from "@/lib/seo";
import { getInstagram, getPage, getShop, getTestimonials } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return routeMetadata("home");
}

export default async function HomePage() {
  const [shop, page, testimonials, feed] = await Promise.all([
    getShop(),
    getPage("home"),
    getTestimonials(),
    getInstagram(3),
  ]);
  const values = page.sections.find((s) => s.key === "values");
  const cta = page.sections.find((s) => s.kind === "cta");
  const features = page.sections.filter((s) => s.kind === "side-feature");

  return (
    <>
      {/* ───── 히어로 ───── */}
      <div className="hero">
        <div
          className="hero-slide"
          style={{ "--bg": `url("${page.hero.image}")`, backgroundPosition: "0 0, 0 0, 50% 60%" } as React.CSSProperties}
        />
        <div className="hero-intro">
          <Logo variant="hero" className="hero-logo" />
          <h1 className="hero-big-heading">{page.hero.heading}</h1>
          {page.hero.body && <p className="paragraph-big">{page.hero.body}</p>}
          <div className="buttons-wrapper">
            {page.hero.cta?.map((c, i) =>
              c.external ? (
                <a key={c.href} href={c.href} target="_blank" rel="noreferrer" className="button ghost-white-button solid">
                  {c.label}
                </a>
              ) : (
                <Link key={c.href} href={c.href} className={`button ghost-white-button${i > 0 ? " solid" : ""}`}>
                  {c.label}
                </Link>
              ),
            )}
          </div>
        </div>
        <a href={LINKS.map} target="_blank" rel="noreferrer" className="location">
          <IconLocation />
          <div className="location-street">{shop.address.zip}</div>
          <div className="location-text">{shop.address.street}</div>
        </a>
        <a href="#start" className="hero-scroll-link">
          <IconArrowDown />
          <div className="paragraph text-white">아래로 스크롤</div>
        </a>
      </div>

      {/* ───── 이미지 겹침 2단 ×2 ───── */}
      {features.map((f, i) => (
        <div
          key={f.key}
          id={i === 0 ? "start" : undefined}
          className={`section ${i === 0 ? "no-bottom-padding" : "no-top-padding"}`}
        >
          <div className="wrapper">
            <SideFeature section={f} />
          </div>
        </div>
      ))}

      {/* ───── 가치 4열 ───── */}
      {values?.items && <ValuesRow items={values.items} />}

      {/* ───── 후기 (네이버 리뷰 키워드) ───── */}
      <div className="section testimonials has-fixed-bg">
        <FixedBg image={PHOTOS.interiorWide} overlay="#111111b3" />
        <div className="wrapper side-padding">
          <TestimonialSlider
            heading={"What our\nguests say"}
            items={testimonials}
            meta={{
              label: `★ ${REVIEW_STATS.rating} · 네이버 방문자 리뷰 ${REVIEW_STATS.total}건 보기`,
              href: LINKS.naverReviews,
            }}
          />
        </div>
      </div>

      {/* ───── 최근 인스타그램 ───── */}
      <div className="section">
        <div className="wrapper">
          <div className="side-header" data-reveal="up" data-reveal-delay="300">
            <h2 className="heading">
              Latest from
              <br />
              the journal
            </h2>
            <Link href="/journal" className="button ghost-button more-link">
              전체 보기
            </Link>
          </div>
          <InstagramCards items={feed} />
        </div>
      </div>

      {cta && <CtaSection section={cta} shop={shop} />}
      <SiteFooter shop={shop} />
    </>
  );
}
