import type { Metadata } from "next";
import SiteFooter from "@/components/SiteFooter";
import { BUSINESS } from "@/content/defaults";
import { getShop } from "@/lib/queries";

export const metadata: Metadata = { title: "사업자 정보", alternates: { canonical: "/imprint" } };

/** 푸터 "사업자 정보" 링크 대상. 디자이너 실명은 이 페이지에만 쓴다. */
export default async function ImprintPage() {
  const shop = await getShop();
  return (
    <>
      <div className="section">
        <div className="wrapper" style={{ maxWidth: 800 }}>
          <h1 className="heading">Imprint</h1>
          <div className="hours-grid kontakt imprint-grid">
            <div className="oeffnung-links">상호</div>
            <div className="oeffnung">{BUSINESS.nameKo} (SEVENY HAIR)</div>
            <div className="oeffnung-links">대표</div>
            <div className="oeffnung">
              {BUSINESS.ownerKo} ({BUSINESS.ownerEn})
            </div>
            <div className="oeffnung-links">주소</div>
            <div className="oeffnung">{shop.address.street}</div>
            <div className="oeffnung-links">전화</div>
            <div className="oeffnung">{shop.phone}</div>
            <div className="oeffnung-links">사업자등록번호</div>
            <div className="oeffnung">{BUSINESS.bizNo}</div>
          </div>
        </div>
      </div>
      <SiteFooter shop={shop} />
    </>
  );
}
