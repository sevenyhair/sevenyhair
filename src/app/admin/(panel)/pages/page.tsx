import type { Metadata } from "next";
import PagesEditor from "@/components/admin/editors/PagesEditor";
import { getPage } from "@/lib/queries";

export const metadata: Metadata = { title: "페이지 문구" };

const SLUGS = ["home", "services", "salon", "about", "journal", "contact"] as const;

export default async function PagesPage({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  const pages = await Promise.all(SLUGS.map((s) => getPage(s)));
  const current = SLUGS.includes(p as (typeof SLUGS)[number]) ? (p as string) : "home";
  return <PagesEditor pages={pages} current={current} />;
}
