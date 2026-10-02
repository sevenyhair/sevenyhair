import type { Metadata } from "next";
import SitePage from "@/components/blocks/SitePage";
import { getPage, getSharedBlocks, getShop } from "@/lib/queries";
import { routeMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return routeMetadata("home");
}

/** 히어로 + 블록 목록 — 블록은 관리자 페이지 메뉴에서 고친다 (src/components/blocks) */
export default async function HomePage() {
  const [shop, page, shared] = await Promise.all([getShop(), getPage("home"), getSharedBlocks()]);
  return <SitePage slug="home" page={page} shared={shared} shop={shop} />;
}
