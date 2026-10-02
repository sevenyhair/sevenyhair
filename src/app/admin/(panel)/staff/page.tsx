import { redirect } from "next/navigation";

/** 옛 메뉴 주소 — 원장 소개 → About 페이지의 원장 소개 블록 (2026-10-02 페이지별 메뉴로 묶음) */
export default function Page() {
  redirect("/admin/pages/about?open=staff");
}
