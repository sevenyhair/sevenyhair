"use client";

import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { savePage } from "@/lib/admin/actions";
import type { LinkRef, Page, Section } from "@/lib/types";
import { ImageField } from "../media";
import { Badge, Button, Card, Field, Input, PageHeader, SaveBar, Switch, Textarea, useSaveable } from "../ui";

const LABEL: Record<string, string> = {
  home: "홈",
  services: "Services",
  salon: "The Salon",
  about: "About",
  journal: "Journal",
  contact: "Contact",
};
const PATH: Record<string, string> = { home: "/", services: "/services", salon: "/salon", about: "/about", journal: "/journal", contact: "/contact" };
const KIND_LABEL: Record<string, string> = {
  "side-feature": "이미지 2장 + 글",
  values: "가치 4열",
  text: "글",
  cta: "예약 유도 (배경 사진)",
  "image-band": "어두운 배경 띠",
  gallery: "갤러리",
};

export default function PagesEditor({ pages, current }: { pages: Page[]; current: string }) {
  const router = useRouter();
  const page = pages.find((p) => p.slug === current) ?? pages[0];
  return (
    <>
      <PageHeader
        title="페이지 문구"
        description="제목(영어)은 디자인 요소라 그대로 두는 걸 권해요. 줄바꿈은 엔터로."
        actions={
          <a href={PATH[page.slug]} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50">
            이 페이지 보기 <ExternalLink className="h-4 w-4" />
          </a>
        }
      />
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl bg-zinc-200/60 p-1">
        {pages.map((p) => (
          <button
            key={p.slug}
            onClick={() => router.push(`/admin/pages?p=${p.slug}`)}
            className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-[13px] font-medium transition-colors ${
              p.slug === page.slug ? "bg-white shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            {LABEL[p.slug] ?? p.slug}
          </button>
        ))}
      </div>
      {/* key 로 탭마다 상태를 새로 만든다 */}
      <PageForm key={page.slug} initial={page} />
    </>
  );
}

function PageForm({ initial }: { initial: Page }) {
  const { value: p, setValue, dirty, saving, save, reset } = useSaveable<Page>(initial, savePage);
  const setHero = (patch: Partial<Page["hero"]>) => setValue((x) => ({ ...x, hero: { ...x.hero, ...patch } }));
  const setSection = (i: number, patch: Partial<Section>) =>
    setValue((x) => ({ ...x, sections: x.sections.map((s, j) => (j === i ? { ...s, ...patch } : s)) }));

  return (
    <>
      <div className="space-y-6">
        <Card title="히어로" description="페이지 맨 위 큰 사진과 제목">
          <div className="grid gap-5 md:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <Field label="제목">
                <Input value={p.hero.heading} onChange={(e) => setHero({ heading: e.target.value })} />
              </Field>
              {p.hero.body !== undefined && (
                <Field label="본문">
                  <Textarea rows={4} value={p.hero.body} onChange={(e) => setHero({ body: e.target.value })} />
                </Field>
              )}
              {p.hero.cta && <LinksEditor label="버튼" links={p.hero.cta} onChange={(cta) => setHero({ cta })} />}
            </div>
            <ImageField label="배경 사진" value={p.hero.image} onChange={(image) => setHero({ image })} aspect="4/3" />
          </div>
        </Card>

        {p.sections.map((s, i) => (
          <Card
            key={s.key}
            title={
              <span className="flex items-center gap-2">
                {s.heading?.split("\n").join(" ") || s.key}
                <Badge>{KIND_LABEL[s.kind] ?? s.kind}</Badge>
              </span>
            }
          >
            <SectionForm section={s} onChange={(patch) => setSection(i, patch)} />
          </Card>
        ))}
        {!p.sections.length && <p className="text-center text-[13px] text-zinc-400">이 페이지는 섹션 문구가 없습니다 (내용은 다른 메뉴에서 관리).</p>}
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  );
}

function SectionForm({ section: s, onChange }: { section: Section; onChange: (patch: Partial<Section>) => void }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {s.kicker !== undefined && (
          <Field label="윗줄 (작은 글씨)">
            <Input value={s.kicker} onChange={(e) => onChange({ kicker: e.target.value })} />
          </Field>
        )}
        {s.heading !== undefined && (
          <Field label="제목" hint="엔터로 줄바꿈">
            <Textarea rows={2} className="min-h-0" value={s.heading} onChange={(e) => onChange({ heading: e.target.value })} />
          </Field>
        )}
      </div>

      {s.body && (
        <div className="space-y-2">
          <span className="block text-[13px] font-medium text-zinc-700">문단</span>
          {s.body.map((b, i) => (
            <div key={i} className="flex gap-2">
              <Textarea rows={3} value={b} onChange={(e) => onChange({ body: s.body!.map((x, j) => (j === i ? e.target.value : x)) })} />
              <Button size="sm" variant="ghost" onClick={() => onChange({ body: s.body!.filter((_, j) => j !== i) })} aria-label="문단 삭제">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button size="sm" onClick={() => onChange({ body: [...(s.body ?? []), ""] })}>
            <Plus className="h-4 w-4" /> 문단 추가
          </Button>
        </div>
      )}

      {s.images && s.images.length > 0 && (
        <div>
          <span className="mb-2 block text-[13px] font-medium text-zinc-700">사진</span>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {s.images.map((img, i) => (
              <ImageField
                key={i}
                value={img.src}
                aspect="1/1"
                onChange={(src) => onChange({ images: s.images!.map((x, j) => (j === i ? { ...x, src } : x)) })}
              />
            ))}
          </div>
        </div>
      )}

      {s.cta && <LinksEditor label="버튼" links={s.cta} onChange={(cta) => onChange({ cta })} />}

      {s.items && (
        <div className="space-y-3">
          <span className="block text-[13px] font-medium text-zinc-700">항목</span>
          {s.items.map((it, i) => {
            const setItem = (patch: Partial<typeof it>) => onChange({ items: s.items!.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
            return (
              <div key={i} className="grid gap-3 rounded-xl border border-zinc-200 p-3 sm:grid-cols-[120px_1fr_auto]">
                {it.image !== undefined || s.kind === "values" ? (
                  <ImageField value={it.image?.src} aspect="6/5" onChange={(src) => setItem({ image: src ? { src } : undefined })} />
                ) : (
                  <div className="hidden sm:block" />
                )}
                <div className="space-y-2">
                  <Input placeholder="제목 (연도 등)" value={it.title} onChange={(e) => setItem({ title: e.target.value })} />
                  <Textarea rows={2} className="min-h-0" placeholder="내용" value={it.body} onChange={(e) => setItem({ body: e.target.value })} />
                  {it.link && (
                    <div className="grid gap-2 sm:grid-cols-2">
                      <Input placeholder="버튼 글자" value={it.link.label} onChange={(e) => setItem({ link: { ...it.link!, label: e.target.value } })} />
                      <Input placeholder="링크" value={it.link.href} onChange={(e) => setItem({ link: { ...it.link!, href: e.target.value } })} />
                    </div>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => onChange({ items: s.items!.filter((_, j) => j !== i) })} aria-label="항목 삭제">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
          <Button size="sm" onClick={() => onChange({ items: [...(s.items ?? []), { title: "", body: "" }] })}>
            <Plus className="h-4 w-4" /> 항목 추가
          </Button>
        </div>
      )}
    </div>
  );
}

function LinksEditor({ label, links, onChange }: { label: string; links: LinkRef[]; onChange: (l: LinkRef[]) => void }) {
  return (
    <div className="space-y-2">
      <span className="block text-[13px] font-medium text-zinc-700">{label}</span>
      {links.map((l, i) => (
        <div key={i} className="grid items-center gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
          <Input placeholder="버튼 글자" value={l.label} onChange={(e) => onChange(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
          <Input placeholder="/services 또는 https://…" value={l.href} onChange={(e) => onChange(links.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} />
          <Switch label="새 탭" checked={!!l.external} onChange={(v) => onChange(links.map((x, j) => (j === i ? { ...x, external: v } : x)))} />
        </div>
      ))}
    </div>
  );
}
