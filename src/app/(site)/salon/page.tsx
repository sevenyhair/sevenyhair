import type { Metadata } from "next";
import FixedBg from "@/components/FixedBg";
import Gallery from "@/components/Gallery";
import { Lines } from "@/components/Lines";
import PageHero from "@/components/PageHero";
import SiteFooter from "@/components/SiteFooter";
import ValuesRow from "@/components/ValuesRow";
import { gallery } from "@/content/pages";
import { routeMetadata } from "@/lib/seo";
import { getPage, getShop } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return routeMetadata("salon");
}

function Paragraphs({ items }: { items?: string[] }) {
  return (
    <>
      {items?.map((b, i) => (
        <span key={i}>
          {i > 0 && (
            <>
              <br />
              <br />
            </>
          )}
          {b}
        </span>
      ))}
    </>
  );
}

/** 원본 Das Haarlokal 자리 — 소개 / 갤러리 / 런던 연수 띠 / 가치 4열 */
export default async function SalonPage() {
  const [shop, page, home] = await Promise.all([getShop(), getPage("salon"), getPage("home")]);
  const intro = page.sections.find((s) => s.key === "intro");
  const london = page.sections.find((s) => s.key === "london");
  const values = home.sections.find((s) => s.key === "values");
  // 원본 띠: 앞 사진(float) · 뒤 사진(back) · 왼쪽 위 작은 이미지(제품 자리) · 섹션 배경
  const [front, back, badge, bg] = london?.images ?? [];

  return (
    <>
      <PageHero heading={page.hero.heading} image={page.hero.image} position="50% 55%" />

      {intro && (
        <div className="section">
          <div className="wrapper">
            <div className="side-feature-2">
              <div className="side-info-35">
                <h1 className="heading">
                  <Lines text={intro.heading ?? ""} />
                </h1>
              </div>
              <div className="side-info-65">
                <p className="paragraph">
                  <Paragraphs items={intro.body} />
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Gallery desktop={gallery.desktop} mobile={gallery.mobile} />

      {london && (
        <div className="section brand-band has-fixed-bg">
          {bg && <FixedBg image={bg.src} overlay="#0009" />}
          <div className="wrapper">
            <div className="side-feature-3">
              <div className="side-media" data-reveal="right">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {front && <img src={front.src} alt="" className="side-image-float right" />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {back && <img src={back.src} alt="" className="side-image-back left" />}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {badge && <img src={badge.src} alt="KCIA 우수 헤어디자이너 선정" className="brand-products" />}
              </div>
              <div className="side-info brand-info" data-reveal="left" data-reveal-delay="300">
                <h1 className="heading text-white">
                  <Lines text={london.heading ?? ""} />
                </h1>
                <p className="paragraph text-white">
                  <Paragraphs items={london.body} />
                </p>
                {london.cta?.map((c) => (
                  <a key={c.href} href={c.href} target="_blank" rel="noreferrer" className="button ghost-white-button">
                    {c.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {values?.items && <ValuesRow items={values.items} spaced />}
      <SiteFooter shop={shop} />
    </>
  );
}
