import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SitePage from "@/components/blocks/SitePage";
import { SITE_PAGES } from "@/content/blocks";
import { isAdmin } from "@/lib/admin/guard";
import { DraftModel } from "@/lib/models";
import { connectDB } from "@/lib/mongodb";
import { getShop } from "@/lib/queries";
import type { Page, SharedBlocks } from "@/lib/types";

export const metadata: Metadata = { title: "미리보기", robots: { index: false, follow: false } };

/**
 * 관리자 "저장 전 미리보기" — 페이지 편집기가 만든 초안(drafts, 1시간 보관)을 사이트와 같은 화면으로 그린다.
 * 관리자 로그인 상태에서만 보이고, 아니면 404.
 */
export default async function PreviewPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ d?: string }> }) {
  const [{ slug }, { d }] = await Promise.all([params, searchParams]);
  if (!(await isAdmin()) || !d || !/^[a-f0-9]{24}$/.test(d) || !SITE_PAGES.some((p) => p.slug === slug)) notFound();
  await connectDB();
  const draft = JSON.parse(JSON.stringify(await DraftModel.findById(d).lean())) as { page: Page; shared: SharedBlocks } | null;
  if (!draft) notFound();
  const shop = await getShop();
  return (
    <>
      <div className="preview-badge">미리보기 · 저장 전 화면입니다</div>
      <SitePage slug={slug} page={draft.page} shared={draft.shared} shop={shop} />
    </>
  );
}
