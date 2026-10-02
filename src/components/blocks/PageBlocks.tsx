import Link from "next/link";
import CtaSection from "@/components/CtaSection";
import FixedBg from "@/components/FixedBg";
import Gallery from "@/components/Gallery";
import InstagramCards from "@/components/InstagramCards";
import { Lines } from "@/components/Lines";
import PriceTabs from "@/components/PriceTabs";
import SideFeature from "@/components/SideFeature";
import StyleBook from "@/components/StyleBook";
import TestimonialSlider from "@/components/TestimonialSlider";
import ValuesRow from "@/components/ValuesRow";
import { LINKS, REVIEW_STATS } from "@/content/defaults";
import { gallery } from "@/content/pages";
import { PHOTOS } from "@/content/photos";
import { getInstagram, getServices, getStaff, getStyles, getTestimonials } from "@/lib/queries";
import type { Section, SharedBlocks, Shop, Staff } from "@/lib/types";

/**
 * 페이지 블록을 위에서부터 그린다. 마크업·클래스는 블록으로 바꾸기 전 각 페이지 코드 그대로다.
 * 여백은 원본처럼 이웃 블록에 따라 정한다:
 *  - 사진 2장 + 글이 이어지면 사이 여백을 없앤다 (홈 위 두 블록)
 *  - 아이콘 4열은 앞이 흰 "사진 2장 + 글"이면 위 여백 없이 붙고, 어두운 블록 뒤면 띄운다
 */
export default async function PageBlocks({ sections, shared, shop }: { sections: Section[]; shared: SharedBlocks; shop: Shop }) {
  const list = sections.filter((s) => !s.hidden);
  const has = (k: Section["kind"]) => list.some((s) => s.kind === k);
  const igCount = Math.max(0, ...list.filter((s) => s.kind === "instagram").map((s) => s.count ?? 6));

  // 이 페이지에 놓인 목록 블록의 데이터만 읽는다
  const [testimonials, feed, tables, styles, staff] = await Promise.all([
    has("testimonials") ? getTestimonials() : [],
    igCount ? getInstagram(igCount) : [],
    has("prices") ? getServices() : [],
    has("stylebook") ? getStyles() : [],
    has("staff") ? getStaff() : [],
  ]);

  return (
    <>
      {/* 히어로의 "아래로 스크롤" 이 가리키는 자리 */}
      <div id="start" />
      {list.map((s, i) => {
        const prev = list[i - 1];
        const next = list[i + 1];
        switch (s.kind) {
          case "side-feature": {
            const cls = [prev?.kind === "side-feature" && "no-top-padding", next?.kind === "side-feature" && "no-bottom-padding"].filter(Boolean).join(" ");
            return (
              <div key={s.key} className={`section ${cls}`}>
                <div className="wrapper">
                  <SideFeature section={s} />
                </div>
              </div>
            );
          }
          case "text":
            return (
              <div key={s.key} className="section">
                <div className="wrapper">
                  <div className="side-feature-2">
                    <div className="side-info-35">
                      <h1 className="heading">
                        <Lines text={s.heading ?? ""} />
                      </h1>
                    </div>
                    <div className="side-info-65">
                      <p className="paragraph">
                        <Paragraphs items={s.body} />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          case "gallery":
            return <GalleryBlock key={s.key} section={s} />;
          case "image-band":
            return <ImageBand key={s.key} section={s} />;
          case "milestones":
            return (
              <div key={s.key} className="section milestones has-fixed-bg">
                {s.images?.[0]?.src && <FixedBg image={s.images[0].src} overlay="#111111b3" />}
                <div className="milestones-box">
                  <h2 className="heading">{s.heading}</h2>
                  {s.items?.map((m, j) => (
                    <div key={j} className="job">
                      <div className="paragraph">{m.title}</div>
                      <h5>{m.body}</h5>
                    </div>
                  ))}
                </div>
              </div>
            );
          case "price-note":
            return (
              <section key={s.key} className="section preise-section">
                <div className="preise-box">
                  <p className="preise-text">
                    {s.heading}
                    {s.body?.map((b, j) => (
                      <span key={j} className="preise-sub">
                        <br />
                        <br />
                        {b}
                      </span>
                    ))}
                  </p>
                </div>
              </section>
            );
          case "values":
            return shared.values.items?.length ? (
              <ValuesRow key={s.key} items={shared.values.items} spaced={!!prev && prev.kind !== "side-feature"} />
            ) : null;
          case "cta":
            return <CtaSection key={s.key} section={shared.cta} shop={shop} />;
          case "testimonials":
            return (
              <div key={s.key} className="section testimonials has-fixed-bg">
                <FixedBg image={s.images?.[0]?.src || PHOTOS.interiorWide} overlay="#111111b3" />
                <div className="wrapper side-padding">
                  <TestimonialSlider
                    heading={s.heading ?? ""}
                    items={testimonials}
                    meta={{
                      label: `★ ${REVIEW_STATS.rating} · 네이버 방문자 리뷰 ${REVIEW_STATS.total}건 보기`,
                      href: LINKS.naverReviews,
                    }}
                  />
                </div>
              </div>
            );
          case "instagram": {
            const more = s.cta?.[0];
            return (
              <div key={s.key} className="section">
                <div className="wrapper">
                  {s.heading && (
                    <div className="side-header" data-reveal="up" data-reveal-delay="300">
                      <h2 className="heading">
                        <Lines text={s.heading} />
                      </h2>
                      {more?.href && (
                        <Link href={more.href} className="button ghost-button more-link">
                          {more.label}
                        </Link>
                      )}
                    </div>
                  )}
                  {/* 원본 블로그 목록(제목 없는 긴 목록)은 스크롤 등장 없이 호버 확대만 있다 */}
                  <InstagramCards items={feed.slice(0, s.count ?? 6)} reveal={!!s.heading} />
                  {s.follow && (
                    <div className="journal-more">
                      <a href={LINKS.instagram} target="_blank" rel="noreferrer" className="button ghost-button">
                        {shop.instagram.handle} 팔로우하기
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          }
          case "prices":
            return (
              <div key={s.key} className="section">
                <div className="wrapper">
                  <PriceTabs tables={tables} />
                </div>
              </div>
            );
          case "stylebook":
            return (
              <div key={s.key} className="section style-section">
                <div className="wrapper">
                  {s.heading && <h2 className="heading style-heading">{s.heading}</h2>}
                  <StyleBook styles={styles} />
                </div>
              </div>
            );
          case "staff":
            return <StaffBlock key={s.key} staff={staff} />;
          default:
            return null;
        }
      })}
    </>
  );
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

/** 갤러리 칸 위치는 원본 그대로 두고 사진만 블록 순서대로 채운다. 모바일 칸은 데스크톱의 몇 번째 사진을 쓰는지로 정한다. */
const MOBILE_FROM = gallery.mobile.map((m) => gallery.desktop.findIndex((d) => d.src === m.src));

function GalleryBlock({ section }: { section: Section }) {
  const imgs = (section.images ?? []).map((i) => i.src);
  const desktop = gallery.desktop.flatMap((slot, i) => (imgs[i] ? [{ ...slot, src: imgs[i] }] : []));
  const mobile = gallery.mobile.flatMap((slot, j) => {
    const src = imgs[MOBILE_FROM[j]];
    return src ? [{ ...slot, src }] : [];
  });
  return desktop.length ? <Gallery desktop={desktop} mobile={mobile} /> : null;
}

/** 원본 띠: 앞 사진(float) · 뒤 사진(back) · 왼쪽 위 작은 이미지(제품 자리) · 섹션 배경 */
function ImageBand({ section: s }: { section: Section }) {
  const [front, back, badge, bg] = s.images ?? [];
  return (
    <div className="section brand-band has-fixed-bg">
      {bg?.src && <FixedBg image={bg.src} overlay="#0009" />}
      <div className="wrapper">
        <div className="side-feature-3">
          <div className="side-media" data-reveal="right">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {front?.src && <img src={front.src} alt="" className="side-image-float right" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {back?.src && <img src={back.src} alt="" className="side-image-back left" />}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {badge?.src && <img src={badge.src} alt={badge.alt ?? ""} className="brand-products" />}
          </div>
          <div className="side-info brand-info" data-reveal="left" data-reveal-delay="300">
            <h1 className="heading text-white">
              <Lines text={s.heading ?? ""} />
            </h1>
            <p className="paragraph text-white">
              <Paragraphs items={s.body} />
            </p>
            {s.cta?.map((c) => (
              <a key={c.href} href={c.href} target="_blank" rel="noreferrer" className="button ghost-white-button">
                {c.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonText({ p }: { p: Staff }) {
  return (
    <div className="about-text">
      <h1 className="heading about-name">{p.name}</h1>
      <p className="paragraph">
        <Paragraphs items={p.bio} />
      </p>
      <p className="signature">Seveny</p>
    </div>
  );
}

function PersonPhoto({ p, className = "" }: { p: Staff; className?: string }) {
  return (
    <div className={`about-media ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.photo} alt="" />
    </div>
  );
}

/** 인물 소개 — 첫 사람은 글·사진, 다음 사람은 사진·글 (지그재그) */
function StaffBlock({ staff }: { staff: Staff[] }) {
  return (
    <>
      {staff.map((p, i) =>
        i % 2 === 0 ? (
          <div key={i} className="section about-section">
            <div className="wrapper">
              <div className="about-row">
                <PersonText p={p} />
                <PersonPhoto p={p} />
              </div>
            </div>
          </div>
        ) : (
          <div key={i} className="section about-section alt">
            <div className="wrapper">
              <div className="about-row">
                <PersonPhoto p={p} className="desktop-only" />
                <PersonText p={p} />
                <PersonPhoto p={p} className="mobile" />
              </div>
            </div>
          </div>
        ),
      )}
    </>
  );
}
