import type { Metadata } from "next";
import StylesEditor from "@/components/admin/editors/StylesEditor";
import { StyleModel } from "@/lib/models";
import { connectDB } from "@/lib/mongodb";
import { getStyles } from "@/lib/queries";
import type { Style } from "@/content/styles";

export const metadata: Metadata = { title: "스타일북" };

/** 숨긴 스타일까지 보여야 해서 DB 를 직접 읽는다 (비어 있으면 기본 26개) */
async function loadAll(): Promise<Style[]> {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const rows = await StyleModel.find().sort({ order: 1 }).lean();
      if (rows.length) return JSON.parse(JSON.stringify(rows)) as Style[];
    }
  } catch {
    /* 기본값으로 */
  }
  return getStyles();
}

export default async function StylesAdminPage() {
  return <StylesEditor initial={await loadAll()} />;
}
