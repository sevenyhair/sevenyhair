import { redirect } from "next/navigation";

/** 옛 메뉴 주소 — 후기 → 홈 페이지의 후기 블록 (2026-10-02 페이지별 메뉴로 묶음) */
export default function Page() {
  redirect("/admin/pages/home?open=testimonials");
}
