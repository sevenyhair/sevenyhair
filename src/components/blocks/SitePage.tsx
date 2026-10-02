import Link from "next/link";
import { IconArrowDown, IconCalendar, IconHome, IconInstagram, IconLocation, IconPhone } from "@/components/Icons";
import Logo from "@/components/Logo";
import NaverMap from "@/components/NaverMap";
import PageHero from "@/components/PageHero";
import SiteFooter from "@/components/SiteFooter";
import { LINKS } from "@/content/defaults";
import type { Page, SharedBlocks, Shop } from "@/lib/types";
import PageBlocks from "./PageBlocks";

/**
 * 사이트 기본 페이지 하나 = 히어로(페이지마다 모양 고정) + 블록 목록 + 푸터.
 * 공개 라우트와 관리자 미리보기(/preview)가 같이 쓴다.
 */
const HERO_POS: Record<string, string> = { services: "50% 35%", salon: "50% 55%", about: "50% 30%" };

export default function SitePage({ slug, page, shared, shop }: { slug: string; page: Page; shared: SharedBlocks; shop: Shop }) {
  return (
    <>
      {slug === "home" ? (
        <HomeHero page={page} shop={shop} />
      ) : slug === "contact" ? (
        <ContactHero page={page} shop={shop} />
      ) : (
        <PageHero heading={page.hero.heading} image={page.hero.image} position={HERO_POS[slug]} />
      )}
      <PageBlocks sections={page.sections} shared={shared} shop={shop} />
      <SiteFooter shop={shop} />
    </>
  );
}

function HomeHero({ page, shop }: { page: Page; shop: Shop }) {
  return (
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
  );
}

/**
 * 원본 /kontakt — 왼쪽 연락처·영업시간, 오른쪽 50vw × 100vh 사진.
 * 매장 이름 아래·주소 위에 작은 네이버 지도를 넣었다 (원본엔 없음).
 */
function ContactHero({ page, shop }: { page: Page; shop: Shop }) {
  const map = shop.map;
  return (
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
  );
}
