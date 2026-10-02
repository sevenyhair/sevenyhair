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
 * 매장 이름 아래·주소 위에 작은 네이버 지도를 넣었다 (원본엔 없음). 아래에 푸터.
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
          {map && (
            <div className="contact-map">
              <NaverMap lat={map.lat} lng={map.lng} zoom={map.zoom} title="SEVENY HAIR" placeUrl={LINKS.map} height={220} />
            </div>
          )}
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

    <SiteFooter shop={shop} />
    </>
  );
}
