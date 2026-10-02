import { redirect } from "next/navigation";

/** 옛 "SEO · 공유" 주소 (?r=route) → 각 페이지 메뉴의 SEO 탭 */
export default async function Page({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  const { r } = await searchParams;
  redirect(`/admin/pages/${r && /^[a-z]+$/.test(r) ? r : "home"}?tab=seo`);
}
