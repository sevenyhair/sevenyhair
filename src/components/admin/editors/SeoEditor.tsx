"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { RouteSeo } from "@/content/seo";
import { saveSeo } from "@/lib/admin/actions";
import type { SeoOverride } from "@/lib/types";
import { ImageField } from "../media";
import { Button, Card, Field, Input, PageHeader, SaveBar, Textarea, useSaveable } from "../ui";

const LABEL: Record<string, string> = { home: "홈", services: "Services", salon: "The Salon", about: "About", journal: "Journal", contact: "Contact" };

function Counter({ n, max }: { n: number; max: number }) {
  return <span className={`text-[11px] tabular-nums ${n > max ? "text-amber-600" : "text-zinc-400"}`}>{n}/{max}</span>;
}

/** inPage: 페이지 메뉴 안의 "SEO · 공유" 탭으로 쓸 때 — 머리글 · 페이지 고르기 줄을 뺀다 */
export default function SeoEditor({ route, keys, defaults, initial, site, inPage = false }: {
  route: string;
  keys: string[];
  inPage?: boolean;
  defaults: RouteSeo;
  initial: SeoOverride;
  site: string;
}) {
  const router = useRouter();
  const [ogVer, setOgVer] = useState(() => Date.now());
  const { value: o, setValue, dirty, saving, save: doSave, reset } = useSaveable<SeoOverride>(initial, async (v) => {
    const r = await saveSeo(v);
    if (r.ok) setOgVer(Date.now()); // 공유 이미지 새로 그리기
    return r;
  });
  const set = (patch: Partial<SeoOverride>) => setValue((x) => ({ ...x, ...patch }));

  const title = o.title || defaults.title;
  const desc = o.description || defaults.description;
  // 입력 중인 문구로 미리보기를 그린다 (0.6초 쉬면 갱신)
  const ogQuery = new URLSearchParams({ key: route, title: o.ogTitle ?? "", subtitle: o.ogSubtitle ?? "", image: o.ogImage ?? "" }).toString();
  const [ogSrc, setOgSrc] = useState(`/api/admin/og?${ogQuery}`);
  useEffect(() => {
    const t = setTimeout(() => setOgSrc(`/api/admin/og?${ogQuery}&v=${ogVer}`), 600);
    return () => clearTimeout(t);
  }, [ogQuery, ogVer]);

  return (
    <>
      {!inPage && (
        <>
      <PageHeader title="SEO · 공유" description="검색 결과와 카카오톡·인스타 링크 미리보기에 쓰입니다. 빈 칸은 기본값을 씁니다." />
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-zinc-200/60 p-1">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => router.push(`/admin/seo?r=${k}`)}
            className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-[13px] font-medium ${k === route ? "bg-white shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
          >
            {LABEL[k] ?? k}
          </button>
        ))}
      </div>

        </>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="검색 결과">
            <div className="space-y-4">
              <Field label={<span className="flex justify-between">제목 <Counter n={title.length} max={40} /></span>} hint={`기본: ${defaults.title}`}>
                <Input value={o.title ?? ""} placeholder={defaults.title} onChange={(e) => set({ title: e.target.value })} />
              </Field>
              <Field label={<span className="flex justify-between">설명 <Counter n={desc.length} max={120} /></span>} hint="검색 결과 제목 아래 두 줄. 지역·시술명을 자연스럽게 넣으면 좋아요.">
                <Textarea rows={3} value={o.description ?? ""} placeholder={defaults.description} onChange={(e) => set({ description: e.target.value })} />
              </Field>
            </div>
          </Card>
          <Card title="공유 이미지" description="사진 위에 로고와 아래 두 줄이 얹힌 1200×630 이미지가 자동으로 만들어집니다.">
            <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
              <div className="space-y-4">
                <Field label="큰 글씨 (영어 권장)">
                  <Input value={o.ogTitle ?? ""} placeholder={defaults.og.title} onChange={(e) => set({ ogTitle: e.target.value })} />
                </Field>
                <Field label="작은 글씨 (한글)">
                  <Input value={o.ogSubtitle ?? ""} placeholder={defaults.og.subtitle} onChange={(e) => set({ ogSubtitle: e.target.value })} />
                </Field>
              </div>
              <ImageField label="배경 사진" aspect="1200/630" value={o.ogImage || defaults.og.image} onChange={(ogImage) => set({ ogImage })} />
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-10 lg:self-start">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <p className="mb-3 text-[12px] font-medium text-zinc-500">검색 결과 미리보기</p>
            <p className="truncate text-[12px] text-zinc-500">{site.replace(/^https?:\/\//, "")}{defaults.path === "/" ? "" : defaults.path}</p>
            <p className="mt-0.5 line-clamp-1 text-[17px] text-[#1a0dab]">
              {defaults.path === "/" ? title : `${title} | 세브니헤어 SEVENY HAIR`}
            </p>
            <p className="mt-1 line-clamp-2 text-[13px] text-zinc-600">{desc}</p>
          </div>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            <div className="flex items-center justify-between px-4 pt-3">
              <p className="text-[12px] font-medium text-zinc-500">공유 이미지 미리보기</p>
              <Button size="sm" variant="ghost" onClick={() => setOgVer(Date.now())} aria-label="새로고침">
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={ogSrc} src={ogSrc} alt="공유 이미지 미리보기" className="mt-3 aspect-[1200/630] w-full bg-zinc-100 object-cover" />
            <p className="px-4 py-3 text-[11px] text-zinc-400">카카오톡은 미리보기를 캐시합니다. 바뀌지 않으면 카카오 공유 디버거에서 초기화하세요.</p>
          </div>
        </div>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={doSave} onReset={reset} />
    </>
  );
}
