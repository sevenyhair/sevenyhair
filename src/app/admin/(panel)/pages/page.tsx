import { redirect } from "next/navigation";

/** 옛 "페이지 문구" 주소 (?p=slug) → 페이지 메뉴 */
export default async function Page({ searchParams }: { searchParams: Promise<{ p?: string }> }) {
  const { p } = await searchParams;
  redirect(`/admin/pages/${p && /^[a-z]+$/.test(p) ? p : "home"}`);
}
