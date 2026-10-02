import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/ui";
import "./admin.css";

/** 어드민 공통 — 사이트 CSS·장식 없이 어드민 전용 스타일만. 검색엔진에 노출하지 않는다 */
export const metadata: Metadata = {
  title: { default: "관리자", template: "%s · 세브니헤어 관리자" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
