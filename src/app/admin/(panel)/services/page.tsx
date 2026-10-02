import type { Metadata } from "next";
import ServicesEditor from "@/components/admin/editors/ServicesEditor";
import { getServices } from "@/lib/queries";

export const metadata: Metadata = { title: "시술 · 가격" };

/** 목록 메뉴 — 페이지 블록(목록 연결 블록)이 이 데이터를 보여준다. 어느 페이지에 놓을지는 페이지 메뉴에서 */
export default async function Page() {
  return <ServicesEditor initial={await getServices()} />;
}
