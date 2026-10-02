import { redirect } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import { siteUrl } from "@/content/seo";
import { isAdmin } from "@/lib/admin/guard";

/** 로그인한 관리자만 — middleware 가 먼저 막지만 레이아웃에서도 한 번 더 확인한다 */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  return <AdminShell siteUrl={siteUrl()}>{children}</AdminShell>;
}
