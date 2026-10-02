import type { Metadata } from "next";
import { IconCalendar, IconHome, IconInstagram, IconPhone } from "@/components/Icons";
import NaverMap from "@/components/NaverMap";
import SiteFooter from "@/components/SiteFooter";
import { LINKS } from "@/content/defaults";
import { routeMetadata } from "@/lib/seo";
import { getPage, getShop } from "@/lib/queries";

export async function generateMetadata(): Promise<Metadata> {
  return routeMetadata("contact");
}

/**
 * 원본 /kontakt — 왼쪽 연락처·영업시간, 오른쪽 50vw × 100vh 사진.
 * 아래에 네이버 지도(Location)와 푸터를 붙였다 (원본엔 없던 섹션).
 */
export default async function ContactPage() {
  const [shop, page] = await Promise.all([getShop(), getPage("contact")]);

  const map = shop.map;

  return (
    <>
    <div id="Hero" className="hero-split">
      <div className="hero-split-content">
        <div className="contact-block">
          <h1 className="heading kontakt">
            {shop.name} {shop.nameSuffix}
          </h1>
          <div className="contact-row">
            <IconHome />
            <a className="contact-text" href={LINKS.map} target="_blank" rel="noreferrer">
              {shop.address.street}
              <br />
              {shop.address.zip}
              <br />
              4호선 충렬사역 3번 출구 도보 6분
            </a>
          </div>
          <div className="contact-row">
            <IconPhone size={20} />
            <a href={shop.phoneHref}>{shop.phone}</a>
          </div>
          <div className="contact-row">
            <IconCalendar size={20} />
            <a href={shop.bookingUrl} target="_blank" rel="noreferrer">
              네이버로 예약하기
            </a>
          </div>
        </div>
        <div className="contact-block">
          <h1 className="heading kontakt">{page.hero.heading}</h1>
          <div className="hours-grid kontakt">
            {shop.hours.map((h) => (
              <div key={h.days} style={{ display: "contents" }}>
                <div className="oeffnung-links">{h.days}</div>
                <div className="oeffnung">
                  {h.lines.map((l, i) => (
                    <span key={i}>
                      {i > 0 && <br />}
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="split-image" style={{ "--bg": `url("${page.hero.image}")` } as React.CSSProperties}>
        <div className="social-contact">
          <a href={shop.instagram.url} target="_blank" rel="noreferrer" className="social-link" aria-label="Instagram">
            <IconInstagram size={20} />
          </a>
        </div>
      </div>
    </div>

    {/* ───── 네이버 지도 ───── */}
    <section className="section map-section">
      <div className="wrapper">
        <div className="map-head" data-reveal="up">
          <h2 className="heading">Location</h2>
          <div className="map-info">
            <p className="paragraph">
              {shop.address.street}
              <br />
              {shop.address.zip}
            </p>
            <p className="paragraph map-transit">
              4호선 충렬사역 3번 출구 도보 6분 · 충렬사역·서원시장 버스정류장 도보 5분
              <br />
              전용 주차장이 없습니다. 대중교통 이용을 권해 드립니다.
            </p>
          </div>
        </div>
        {map && (
          <NaverMap lat={map.lat} lng={map.lng} zoom={map.zoom} title="SEVENY HAIR" placeUrl={LINKS.map} />
        )}
      </div>
    </section>
    <SiteFooter shop={shop} />
    </>
  );
}
