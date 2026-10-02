import type { Metadata } from "next";
import MediaLibrary from "@/components/admin/editors/MediaLibrary";
import { getMedia } from "@/lib/queries";
import { readR2Config } from "@/lib/r2";

export const metadata: Metadata = { title: "미디어" };

export default async function MediaAdminPage() {
  return <MediaLibrary initial={await getMedia(300)} r2Ready={!!readR2Config()} />;
}
