import { redirect } from "next/navigation";

/** 옛 메뉴 주소 — 인스타그램 → Journal 페이지의 인스타 피드 블록 (2026-10-02 페이지별 메뉴로 묶음) */
export default function Page() {
  redirect("/admin/pages/journal?open=feed");
}
