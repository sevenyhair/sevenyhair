import type { Metadata } from "next";
import InstagramEditor from "@/components/admin/editors/InstagramEditor";
import { instagram as defaults } from "@/content/instagram";
import { InstagramModel } from "@/lib/models";
import { connectDB } from "@/lib/mongodb";

export const metadata: Metadata = { title: "인스타그램" };

/** 숨긴 게시물까지 보여야 해서 DB 를 직접 읽는다 */
async function loadAll() {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const rows = await InstagramModel.find().sort({ pinned: -1, order: 1, takenAt: -1 }).lean();
      if (rows.length) return JSON.parse(JSON.stringify(rows));
    }
  } catch {
    /* 기본값으로 */
  }
  return defaults;
}

export default async function InstagramAdminPage() {
  return <InstagramEditor initial={await loadAll()} />;
}
