import Preloader from "@/components/Preloader";
import ScrollEffects from "@/components/ScrollEffects";
import SiteNav from "@/components/SiteNav";
import { BUSINESS, LINKS } from "@/content/defaults";
import { PHOTOS } from "@/content/photos";
import { ROUTES, siteUrl } from "@/content/seo";
import { getShop } from "@/lib/queries";
import type { Shop } from "@/lib/types";
import "../globals.css";
import "../subpages.css";

/**
 * 공개 사이트 레이아웃 — 원본 클론의 장식(흰 덮개 인트로 · 좌측 내비 · 스크롤 효과)과 사이트 CSS.
 * (site) 는 라우트 그룹이라 주소에 나타나지 않는다.
 */

/**
 * 검색엔진용 매장 정보 (schema.org HairSalon). 매장 정보(어드민에서 수정)를 따른다.
 * 리뷰 평점은 넣지 않는다 — 자기 사이트에 올린 자체 리뷰 평점은 구글이 리치 결과에서 제외한다.
 */
function salonJsonLd(shop: Shop) {
  const url = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    "@id": `${url}/#salon`,
    name: "세브니헤어",
    alternateName: "SEVENY HAIR",
    url,
    image: [PHOTOS.interior, PHOTOS.interiorWide, PHOTOS.signWall],
    logo: `${url}/icon.svg`,
    description: ROUTES.home.description,
    telephone: `+82-${shop.phone.replace(/^0/, "")}`,
    priceRange: "₩18,000 – ₩140,000",
    taxID: BUSINESS.bizNo,
    address: {
      "@type": "PostalAddress",
      streetAddress: shop.address.street,
      addressLocality: "동래구",
      addressRegion: "부산광역시",
      addressCountry: "KR",
    },
    ...(shop.map ? { geo: { "@type": "GeoCoordinates", latitude: shop.map.lat, longitude: shop.map.lng } } : {}),
    hasMap: LINKS.map,
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Wednesday", "Friday", "Saturday", "Sunday"], opens: "10:00", closes: "20:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Thursday"], opens: "10:00", closes: "17:00" },
    ],
    sameAs: [LINKS.instagram, LINKS.blog, LINKS.youtube, LINKS.naverPlace],
    potentialAction: { "@type": "ReserveAction", target: shop.bookingUrl },
  };
}

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const shop = await getShop();
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(salonJsonLd(shop)) }}
      />
      <Preloader />
      <SiteNav name={shop.name} nameSuffix={shop.nameSuffix} byline={shop.byline} nav={shop.nav} />
      <div className="page-wrapper">{children}</div>
      <ScrollEffects />
    </>
  );
}
