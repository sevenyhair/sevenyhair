import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CustomPageEditor from "@/components/admin/editors/CustomPageEditor";
import { CustomPageModel } from "@/lib/models";
import { connectDB } from "@/lib/mongodb";
import type { CustomPage } from "@/lib/types";

export const metadata: Metadata = { title: "페이지 편집" };

const EMPTY: CustomPage = { slug: "", title: "", heroImage: "", html: "", published: false, seo: {} };

export default async function CustomEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") return <CustomPageEditor initial={EMPTY} />;
  if (!/^[a-f0-9]{24}$/.test(id) || !process.env.MONGODB_URI) notFound();
  await connectDB();
  const doc = await CustomPageModel.findById(id).lean();
  if (!doc) notFound();
  return <CustomPageEditor initial={JSON.parse(JSON.stringify(doc))} />;
}
