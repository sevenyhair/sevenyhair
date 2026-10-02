import type { Metadata } from "next";
import ServicesEditor from "@/components/admin/editors/ServicesEditor";
import { getServices } from "@/lib/queries";

export const metadata: Metadata = { title: "시술 · 가격" };

export default async function ServicesAdminPage() {
  return <ServicesEditor initial={await getServices()} />;
}
