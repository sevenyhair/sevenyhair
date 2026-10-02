import { ExternalLink, FilePlus2, FileText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge, PageHeader } from "@/components/admin/ui";
import { CustomPageModel } from "@/lib/models";
import { connectDB } from "@/lib/mongodb";
import type { CustomPage } from "@/lib/types";

export const metadata: Metadata = { title: "커스텀 페이지" };

async function loadAll(): Promise<CustomPage[]> {
  if (!process.env.MONGODB_URI) return [];
  await connectDB();
  return JSON.parse(JSON.stringify(await CustomPageModel.find({}, { html: 0 }).sort({ updatedAt: -1 }).lean()));
}

export default async function CustomListPage() {
  const pages = await loadAll();
  return (
    <>
      <PageHeader
        title="커스텀 페이지"
        description="이벤트·공지·안내처럼 따로 링크할 페이지. 주소는 /p/이름 이 되고, 공개하면 사이트맵에도 들어갑니다."
        actions={
          <Link href="/admin/custom/new" className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800">
            <FilePlus2 className="h-4 w-4" /> 새 페이지
          </Link>
        }
      />
      {pages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
          <FileText className="mx-auto mb-3 h-8 w-8 text-zinc-300" />
          <p className="text-[14px] font-medium">아직 만든 페이지가 없습니다</p>
          <p className="mt-1 text-[13px] text-zinc-500">예: 겨울 휴무 안내, 첫 방문 이벤트, 클리닉 소개</p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {pages.map((p) => (
            <li key={p._id} className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50">
              <Link href={`/admin/custom/${p._id}`} className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium">{p.title}</p>
                <p className="text-[12px] text-zinc-500">
                  /p/{p.slug} · {p.updatedAt ? new Date(p.updatedAt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" }) : ""}
                </p>
              </Link>
              {p.published ? <Badge tone="green">공개</Badge> : <Badge>비공개</Badge>}
              {p.published && (
                <a href={`/p/${p.slug}`} target="_blank" rel="noreferrer" className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900" aria-label="사이트에서 보기">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
