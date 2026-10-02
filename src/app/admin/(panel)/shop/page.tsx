import type { Metadata } from "next";
import ShopEditor from "@/components/admin/editors/ShopEditor";
import { getShop } from "@/lib/queries";

export const metadata: Metadata = { title: "매장 정보" };

export default async function ShopPage() {
  return <ShopEditor initial={await getShop()} />;
}
