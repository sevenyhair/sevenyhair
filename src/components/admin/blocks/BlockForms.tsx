"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import type { LinkRef, Section } from "@/lib/types";
import { ImageField } from "../media";
import { Button, Field, Input, Switch, Textarea } from "../ui";

/**
 * 블록 종류별 입력 폼. 목록 연결 블록(가격표 등)의 목록 편집 화면은 PageEditor 가 아래에 붙인다.
 * 줄바꿈이 의미 있는 제목은 Textarea (엔터 = 줄바꿈).
 */
type Patch = (patch: Partial<Section>) => void;

export function BlockForm({ section: s, onChange }: { section: Section; onChange: Patch }) {
  switch (s.kind) {
    case "side-feature":
      return (
        <div className="space-y-5">
          <Field label="사진 위치">
            <div className="flex gap-1 rounded-xl bg-zinc-100 p-1">
              {(["media-left", "media-right"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => onChange({ layout: v })}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium ${
                    (s.layout ?? "media-left") === v ? "bg-white shadow-sm" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {v === "media-left" ? "사진 왼쪽 · 글 오른쪽" : "글 왼쪽 · 사진 오른쪽"}
                </button>
              ))}
            </div>
          </Field>
          <Heading s={s} onChange={onChange} />
          <Paragraphs s={s} onChange={onChange} />
          <Images s={s} onChange={onChange} labels={["뒤 사진 (큰 것)", "앞 사진 (떠 있는 것)"]} aspect="4/5" />
          <Links links={s.cta ?? []} onChange={(cta) => onChange({ cta })} newTab={false} />
        </div>
      );
    case "text":
      return (
        <div className="space-y-5">
          <Heading s={s} onChange={onChange} hint="왼쪽 큰 제목 · 엔터로 줄바꿈" />
          <Paragraphs s={s} onChange={onChange} />
        </div>
      );
    case "image-band":
      return (
        <div className="space-y-5">
          <Heading s={s} onChange={onChange} />
          <Paragraphs s={s} onChange={onChange} />
          <Images s={s} onChange={onChange} labels={["앞 사진", "뒤 사진", "작은 이미지 (왼쪽 위)", "띠 배경 (어둡게 깔림)"]} aspect="1/1" />
          <Links links={s.cta ?? []} onChange={(cta) => onChange({ cta })} newTab />
        </div>
      );
    case "milestones":
      return (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <Field label="제목">
              <Input value={s.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
            </Field>
            <ImageField label="배경 사진" value={s.images?.[0]?.src} aspect="16/10" onChange={(src) => onChange({ images: [{ src }] })} />
          </div>
          <Items s={s} onChange={onChange} titleHint="연도 · 교육 · 자격 …" withImage={false} withLink={false} />
        </div>
      );
    case "price-note":
      return (
        <div className="space-y-5">
          <Field label="굵은 첫 줄">
            <Textarea rows={2} className="min-h-0" value={s.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
          </Field>
          <Paragraphs s={s} onChange={onChange} />
        </div>
      );
    case "gallery":
      return <GalleryForm s={s} onChange={onChange} />;
    case "values":
      return <Items s={s} onChange={onChange} titleHint="제목 (영어 권장)" withImage withLink />;
    case "cta":
      return (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
            <div className="space-y-4">
              <Field label="윗줄 (작은 글씨)">
                <Input value={s.kicker ?? ""} onChange={(e) => onChange({ kicker: e.target.value })} />
              </Field>
              <Field label="제목">
                <Input value={s.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
              </Field>
            </div>
            <ImageField label="배경 사진" value={s.images?.[0]?.src} aspect="4/3" onChange={(src) => onChange({ images: [{ src }] })} />
          </div>
          <Paragraphs s={s} onChange={onChange} />
          <p className="text-[12px] text-zinc-400">전화 · 예약하기 버튼은 매장 정보의 전화번호 · 예약 링크를 씁니다.</p>
        </div>
      );
    case "testimonials":
      return (
        <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
          <Heading s={s} onChange={onChange} />
          <ImageField label="배경 사진" value={s.images?.[0]?.src} aspect="4/3" onChange={(src) => onChange({ images: [{ src }] })} />
        </div>
      );
    case "instagram":
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
            <Heading s={s} onChange={onChange} hint="비우면 제목 줄 없이 카드만 (Journal 처럼)" />
            <Field label="보여줄 개수">
              <Input type="number" min={1} max={60} value={s.count ?? 6} onChange={(e) => onChange({ count: Math.max(1, Math.min(60, Number(e.target.value) || 1)) })} />
            </Field>
          </div>
          {s.heading ? <Links links={s.cta ?? []} onChange={(cta) => onChange({ cta })} newTab={false} max={1} label="제목 옆 버튼" /> : null}
          <Switch label="아래에 '팔로우하기' 버튼" checked={!!s.follow} onChange={(follow) => onChange({ follow })} />
        </div>
      );
    case "stylebook":
      return (
        <Field label="제목">
          <Input value={s.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
        </Field>
      );
    default:
      return null;
  }
}

function Heading({ s, onChange, hint = "엔터로 줄바꿈" }: { s: Section; onChange: Patch; hint?: string }) {
  return (
    <Field label="제목" hint={hint}>
      <Textarea rows={2} className="min-h-0" value={s.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
    </Field>
  );
}

function Paragraphs({ s, onChange }: { s: Section; onChange: Patch }) {
  const body = s.body ?? [];
  return (
    <div className="space-y-2">
      <span className="block text-[13px] font-medium text-zinc-700">문단</span>
      {body.map((b, i) => (
        <div key={i} className="flex gap-2">
          <Textarea rows={3} value={b} onChange={(e) => onChange({ body: body.map((x, j) => (j === i ? e.target.value : x)) })} />
          <Button size="sm" variant="ghost" onClick={() => onChange({ body: body.filter((_, j) => j !== i) })} aria-label="문단 삭제">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button size="sm" onClick={() => onChange({ body: [...body, ""] })}>
        <Plus className="h-4 w-4" /> 문단 추가
      </Button>
    </div>
  );
}

function Images({ s, onChange, labels, aspect }: { s: Section; onChange: Patch; labels: string[]; aspect: string }) {
  const imgs = labels.map((_, i) => s.images?.[i] ?? { src: "" });
  return (
    <div>
      <span className="mb-2 block text-[13px] font-medium text-zinc-700">사진</span>
      <div className={`grid gap-3 ${labels.length > 2 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:max-w-md"}`}>
        {imgs.map((img, i) => (
          <div key={i}>
            <ImageField value={img.src} aspect={aspect} onChange={(src) => onChange({ images: imgs.map((x, j) => (j === i ? { ...x, src } : x)) })} />
            <p className="mt-1 text-[11px] text-zinc-400">{labels[i]}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function GalleryForm({ s, onChange }: { s: Section; onChange: Patch }) {
  const imgs = s.images ?? [];
  const set = (next: typeof imgs) => onChange({ images: next });
  return (
    <div>
      <p className="mb-3 text-[12px] text-zinc-500">
        칸 모양(크고 작은 칸)은 디자인 그대로이고, 사진이 1번 칸부터 순서대로 들어갑니다. 최대 12장 · 모바일에선 12번째 사진은 빠집니다.
      </p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {imgs.map((img, i) => (
          <div key={i}>
            <ImageField value={img.src} aspect="1/1" onChange={(src) => set(imgs.map((x, j) => (j === i ? { ...x, src } : x)))} />
            <div className="mt-1 flex items-center justify-between text-[11px] text-zinc-400">
              <span>{i + 1}번</span>
              <span className="flex">
                <button type="button" className="p-0.5 hover:text-zinc-900" aria-label="앞으로" onClick={() => i > 0 && set(swap(imgs, i, i - 1))}>
                  <ArrowUp className="h-3 w-3 -rotate-90" />
                </button>
                <button type="button" className="p-0.5 hover:text-zinc-900" aria-label="뒤로" onClick={() => i < imgs.length - 1 && set(swap(imgs, i, i + 1))}>
                  <ArrowDown className="h-3 w-3 -rotate-90" />
                </button>
                <button type="button" className="p-0.5 hover:text-red-600" aria-label="빼기" onClick={() => set(imgs.filter((_, j) => j !== i))}>
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            </div>
          </div>
        ))}
      </div>
      {imgs.length < 12 && (
        <Button size="sm" className="mt-3" onClick={() => set([...imgs, { src: "" }])}>
          <Plus className="h-4 w-4" /> 사진 칸 추가 ({imgs.length}/12)
        </Button>
      )}
    </div>
  );
}

function Items({ s, onChange, titleHint, withImage, withLink }: { s: Section; onChange: Patch; titleHint: string; withImage: boolean; withLink: boolean }) {
  const items = s.items ?? [];
  const set = (next: typeof items) => onChange({ items: next });
  return (
    <div className="space-y-3">
      <span className="block text-[13px] font-medium text-zinc-700">항목</span>
      {items.map((it, i) => {
        const patch = (p: Partial<typeof it>) => set(items.map((x, j) => (j === i ? { ...x, ...p } : x)));
        return (
          <div key={i} className={`grid gap-3 rounded-xl border border-zinc-200 p-3 ${withImage ? "sm:grid-cols-[120px_1fr_auto]" : "sm:grid-cols-[1fr_auto]"}`}>
            {withImage && <ImageField value={it.image?.src} aspect="6/5" onChange={(src) => patch({ image: src ? { src } : undefined })} />}
            <div className="space-y-2">
              <Input placeholder={titleHint} value={it.title} onChange={(e) => patch({ title: e.target.value })} />
              <Textarea rows={2} className="min-h-0" placeholder="내용" value={it.body} onChange={(e) => patch({ body: e.target.value })} />
              {withLink && (
                <div className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
                  <Input placeholder="버튼 글자" value={it.link?.label ?? ""} onChange={(e) => patch({ link: { href: "", ...it.link, label: e.target.value } })} />
                  <Input placeholder="/about 또는 https://…" value={it.link?.href ?? ""} onChange={(e) => patch({ link: { label: "", ...it.link, href: e.target.value } })} />
                  <Switch label="새 탭" checked={!!it.link?.external} onChange={(external) => patch({ link: { label: "", href: "", ...it.link, external } })} />
                </div>
              )}
            </div>
            <div className="flex gap-1 sm:flex-col">
              <Button size="sm" variant="ghost" onClick={() => i > 0 && set(swap(items, i, i - 1))} aria-label="위로">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => i < items.length - 1 && set(swap(items, i, i + 1))} aria-label="아래로">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => set(items.filter((_, j) => j !== i))} aria-label="항목 삭제">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
      <Button size="sm" onClick={() => set([...items, { title: "", body: "" }])}>
        <Plus className="h-4 w-4" /> 항목 추가
      </Button>
    </div>
  );
}

export function Links({ links, onChange, newTab, max = 3, label = "버튼" }: { links: LinkRef[]; onChange: (l: LinkRef[]) => void; newTab: boolean; max?: number; label?: string }) {
  return (
    <div className="space-y-2">
      <span className="block text-[13px] font-medium text-zinc-700">{label}</span>
      {links.map((l, i) => (
        <div key={i} className="grid items-center gap-2 sm:grid-cols-[1fr_1.4fr_auto_auto]">
          <Input placeholder="버튼 글자" value={l.label} onChange={(e) => onChange(links.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
          <Input placeholder="/services 또는 https://…" value={l.href} onChange={(e) => onChange(links.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} />
          {newTab ? <Switch label="새 탭" checked={l.external !== false} onChange={(v) => onChange(links.map((x, j) => (j === i ? { ...x, external: v } : x)))} /> : <span />}
          <Button size="sm" variant="ghost" onClick={() => onChange(links.filter((_, j) => j !== i))} aria-label="버튼 삭제">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {links.length < max && (
        <Button size="sm" onClick={() => onChange([...links, { label: "", href: "" }])}>
          <Plus className="h-4 w-4" /> 버튼 추가
        </Button>
      )}
    </div>
  );
}

function swap<T>(arr: T[], a: number, b: number): T[] {
  const next = arr.slice();
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}
