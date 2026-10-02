import { redirect } from "next/navigation";

/** 옛 메뉴 주소 — 시술 · 가격 → Services 페이지의 가격표 블록 (2026-10-02 페이지별 메뉴로 묶음) */
export default function Page() {
  redirect("/admin/pages/services?open=price-table");
}
