import type { Metadata } from "next";
import InstagramEditor from "@/components/admin/editors/InstagramEditor";
import { loadAllInstagram } from "@/lib/admin/load";

export const metadata: Metadata = { title: "인스타그램" };

/** 목록 메뉴 — 페이지 블록(목록 연결 블록)이 이 데이터를 보여준다. 어느 페이지에 놓을지는 페이지 메뉴에서 */
export default async function Page() {
  return <InstagramEditor initial={await loadAllInstagram()} />;
}
