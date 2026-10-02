import type { Metadata } from "next";
import StaffEditor from "@/components/admin/editors/StaffEditor";
import { getStaff } from "@/lib/queries";

export const metadata: Metadata = { title: "원장 소개" };

export default async function StaffAdminPage() {
  return <StaffEditor initial={await getStaff()} />;
}
