import { ArrowUpRight, CheckCircle2, CircleAlert, FileText, Scissors, Store } from "lucide-react";
import { IconInstagram as Instagram } from "@/components/Icons";
import Link from "next/link";
import { Card, PageHeader } from "@/components/admin/ui";
import { siteUrl } from "@/content/seo";
import { adminConfigIssues } from "@/lib/admin/session";
import { CustomPageModel, InstagramModel, MediaModel, StyleModel } from "@/lib/models";
import { connectDB } from "@/lib/mongodb";
import { readR2Config } from "@/lib/r2";

/** 대시보드 — 빠른 작업 + 설정 점검 (무엇이 빠졌는지 한눈에) */
async function checkDb() {
  if (!process.env.MONGODB_URI) return { ok: false, detail: "MONGODB_URI 없음 — 기본 콘텐츠로 표시 중", counts: null };
  try {
    await connectDB();
    const [ig, styles, pages, media] = await Promise.all([
      InstagramModel.countDocuments(),
      StyleModel.countDocuments(),
      CustomPageModel.countDocuments(),
      MediaModel.countDocuments(),
    ]);
    return { ok: true, detail: "연결됨", counts: { ig, styles, pages, media } };
  } catch (err) {
    return { ok: false, detail: err instanceof Error ? err.message : "연결 실패", counts: null };
  }
}

export default async function Dashboard() {
  const db = await checkDb();
  const site = siteUrl();
  const checks = [
    { label: "데이터베이스 (MongoDB)", ok: db.ok, detail: db.detail },
    {
      label: "이미지 업로드 (Cloudflare R2)",
      ok: !!readR2Config(),
      detail: readR2Config() ? "설정됨" : "R2_* 환경 변수 5개가 필요합니다 — 그전엔 이미지 주소 붙여넣기로 쓸 수 있어요",
    },
    {
      label: "네이버 지도",
      ok: !!process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID,
      detail: process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ? "키 설정됨" : "NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 가 없어 Contact 에 지도 대신 링크만 보입니다",
    },
    { label: "관리자 로그인", ok: adminConfigIssues().length === 0, detail: adminConfigIssues()[0] ?? "설정됨" },
    {
      label: "사이트 주소",
      ok: !!process.env.NEXT_PUBLIC_SITE_URL,
      detail: process.env.NEXT_PUBLIC_SITE_URL ?? `NEXT_PUBLIC_SITE_URL 없음 — 지금은 ${site}`,
    },
  ];

  const quick = [
    { href: "/admin/pages/journal?open=feed", icon: Instagram, title: "인스타 게시물 추가", desc: "링크만 붙여넣으면 Journal 에 올라갑니다" },
    { href: "/admin/pages/services?open=price-table", icon: Scissors, title: "가격 수정", desc: "커트·펌·염색·클리닉 가격표" },
    { href: "/admin/shop", icon: Store, title: "영업시간 · 휴무", desc: "푸터·Contact 에 함께 반영" },
    { href: "/admin/custom/new", icon: FileText, title: "새 페이지 만들기", desc: "이벤트·공지 페이지를 에디터로" },
  ];

  return (
    <>
      <PageHeader
        title="안녕하세요, Seveny"
        description="바꾼 내용은 저장하는 즉시 사이트에 반영됩니다."
        actions={
          <a href={site} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50">
            사이트 보기 <ArrowUpRight className="h-4 w-4" />
          </a>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quick.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="group rounded-2xl border border-zinc-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-sm"
          >
            <q.icon className="mb-3 h-5 w-5 text-zinc-500 group-hover:text-zinc-900" />
            <p className="text-[14px] font-semibold">{q.title}</p>
            <p className="mt-0.5 text-[12px] text-zinc-500">{q.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Card title="설정 점검" description="빠진 항목은 Vercel 환경 변수에 넣고 재배포하면 됩니다 (docs/setup-infra.md)">
          <ul className="divide-y divide-zinc-100">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                {c.ok ? (
                  <CheckCircle2 className="mt-0.5 h-[18px] w-[18px] shrink-0 text-emerald-600" />
                ) : (
                  <CircleAlert className="mt-0.5 h-[18px] w-[18px] shrink-0 text-amber-500" />
                )}
                <div>
                  <p className="text-[14px] font-medium">{c.label}</p>
                  <p className="text-[12px] text-zinc-500">{c.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="한눈에">
          <dl className="grid grid-cols-2 gap-4">
            {[
              ["인스타 게시물", db.counts?.ig],
              ["스타일", db.counts?.styles],
              ["커스텀 페이지", db.counts?.pages],
              ["업로드 이미지", db.counts?.media],
            ].map(([k, v]) => (
              <div key={k as string}>
                <dt className="text-[12px] text-zinc-500">{k}</dt>
                <dd className="text-[22px] font-semibold tabular-nums">{v ?? "–"}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[12px] text-zinc-400">스타일이 0 이면 네이버에서 가져온 기본 26개가 표시됩니다.</p>
        </Card>
      </div>
    </>
  );
}
