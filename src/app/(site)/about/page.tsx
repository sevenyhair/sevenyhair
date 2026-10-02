import type { Metadata } from "next";
import FixedBg from "@/components/FixedBg";
import PageHero from "@/components/PageHero";
import SiteFooter from "@/components/SiteFooter";
import { routeMetadata } from "@/lib/seo";
import { getPage, getShop, getStaff } from "@/lib/queries";
import type { Staff } from "@/lib/types";

export async function generateMetadata(): Promise<Metadata> {
  return routeMetadata("about");
}

function PersonText({ p }: { p: Staff }) {
  return (
    <div className="about-text">
      <h1 className="heading about-name">{p.name}</h1>
      <p className="paragraph">
        {p.bio.map((b, i) => (
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

export default async function AboutPage() {
  const [shop, page, staff] = await Promise.all([getShop(), getPage("about"), getStaff()]);
  const milestones = page.sections.find((s) => s.key === "milestones");

  return (
    <>
      <PageHero heading={page.hero.heading} image={page.hero.image} position="50% 30%" />

      {/* 인물 소개 — 첫 사람은 글·사진, 다음 사람은 사진·글 (지그재그) */}
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

      {milestones && (
        <div className="section milestones has-fixed-bg">
          {milestones.images?.[0] && <FixedBg image={milestones.images[0].src} overlay="#111111b3" />}
          <div className="milestones-box">
            <h2 className="heading">{milestones.heading}</h2>
            {milestones.items?.map((m, i) => (
              <div key={i} className="job">
                <div className="paragraph">{m.title}</div>
                <h5>{m.body}</h5>
              </div>
            ))}
          </div>
        </div>
      )}

      <SiteFooter shop={shop} />
    </>
  );
}
