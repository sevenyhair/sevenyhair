"use client";

import { ArrowDown, ArrowUp, ChevronDown, ExternalLink, Eye, EyeOff, GripVertical, Link2, MonitorPlay, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { BLOCKS, GROUP_LABEL, isSharedKind, type BlockGroup } from "@/content/blocks";
import { createPreview, savePageBlocks } from "@/lib/admin/actions";
import { newKey } from "@/lib/blocks";
import type { Page, Section, SectionKind, SharedBlocks } from "@/lib/types";
import { ImageField } from "../media";
import { Badge, Button, Card, EmbedCtx, Field, Input, PageHeader, SaveBar, SortableList, Textarea, useSaveable, useToast } from "../ui";
import { BlockForm, Links } from "./BlockForms";

/**
 * 페이지 메뉴 하나 (홈 · Services …) — 히어로 + 블록 목록 + SEO.
 *
 * 저장 단위
 *  - 페이지(히어로 · 블록 순서 · 블록 내용) + 공통 블록(아이콘 4열 · 예약 유도) → 아래 고정 저장 바 하나
 *  - 목록 연결 블록의 목록(가격표 · 후기 · 인스타 · 스타일북 · 원장) → 그 블록 안 저장 줄 (모든 페이지에 반영)
 */
type DataKind = "testimonials" | "instagram" | "prices" | "stylebook" | "staff";
type State = { page: Page; shared: SharedBlocks };

const LIST_NAME: Record<DataKind, string> = {
  testimonials: "후기 목록",
  instagram: "인스타그램 게시물",
  prices: "시술 · 가격표",
  stylebook: "스타일 목록",
  staff: "원장 소개",
};

export default function PageEditor({
  label,
  path,
  initial,
  initialShared,
  usage,
  lists,
  seo,
  initialTab,
  initialOpen,
}: {
  label: string;
  path: string;
  initial: Page;
  initialShared: SharedBlocks;
  /** 블록 종류 → 그 종류가 놓인 페이지 이름들 (공통 · 목록 블록의 "쓰이는 곳") */
  usage: Record<string, string[]>;
  /** 목록 연결 블록에 붙일 편집 화면 (서버에서 데이터를 채워 넘긴다) */
  lists: Record<DataKind, React.ReactNode>;
  seo: React.ReactNode;
  initialTab: "blocks" | "seo";
  initialOpen?: string;
}) {
  const [tab, setTab] = useState(initialTab);
  const { value, setValue, dirty, saving, save, reset } = useSaveable<State>({ page: initial, shared: initialShared }, savePageBlocks);
  const [open, setOpen] = useState<Set<string>>(() => new Set(initialOpen ? [initialOpen] : []));
  const [picker, setPicker] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const toast = useToast();

  const p = value.page;
  const setPage = (fn: (p: Page) => Page) => setValue((v) => ({ ...v, page: fn(v.page) }));
  const setSections = (sections: Section[]) => setPage((x) => ({ ...x, sections }));
  const patchSection = (key: string, patch: Partial<Section>) =>
    setPage((x) => ({ ...x, sections: x.sections.map((s) => (s.key === key ? { ...s, ...patch } : s)) }));
  const patchShared = (kind: "values" | "cta", patch: Partial<Section>) =>
    setValue((v) => ({ ...v, shared: { ...v.shared, [kind]: { ...v.shared[kind], ...patch } } }));
  const setHero = (patch: Partial<Page["hero"]>) => setPage((x) => ({ ...x, hero: { ...x.hero, ...patch } }));
  const toggle = (key: string) => setOpen((o) => (o.has(key) ? (o.delete(key), new Set(o)) : new Set(o).add(key)));

  const add = (kind: SectionKind) => {
    const key = newKey(kind, p.sections.map((s) => s.key));
    setSections([...p.sections, { key, kind, ...BLOCKS[kind].template() }]);
    setOpen((o) => new Set(o).add(key));
    setPicker(false);
    toast("info", `맨 아래에 '${BLOCKS[kind].label}' 블록을 넣었습니다. 끌어서 자리를 옮기세요.`);
  };

  const preview = async () => {
    setPreviewing(true);
    const r = await createPreview(value);
    setPreviewing(false);
    if (!r.ok || !r.data) return toast("error", r.ok ? "미리보기를 만들지 못했습니다." : r.error);
    window.open(`/preview/${p.slug}?d=${r.data.id}`, "_blank");
  };

  // 같은 목록 블록이 한 페이지에 두 번 있으면 목록 편집 화면은 첫 블록에만 붙인다 (두 벌이 따로 놀지 않게)
  const firstOfKind = new Map<string, string>();
  for (const s of p.sections) if (!firstOfKind.has(s.kind)) firstOfKind.set(s.kind, s.key);

  return (
    <>
      <PageHeader
        title={label}
        description={<span className="font-mono text-[12px]">{path}</span>}
        actions={
          <>
            <Button onClick={preview} loading={previewing}>
              <MonitorPlay className="h-4 w-4" /> 저장 전 미리보기
            </Button>
            <a href={path} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50">
              사이트에서 보기 <ExternalLink className="h-4 w-4" />
            </a>
          </>
        }
      />

      <div className="mb-6 flex gap-1 rounded-xl bg-zinc-200/60 p-1 sm:inline-flex">
        {(
          [
            ["blocks", "블록"],
            ["seo", "SEO · 공유"],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`flex-1 whitespace-nowrap rounded-lg px-5 py-1.5 text-[13px] font-medium sm:flex-none ${tab === k ? "bg-white shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* 탭은 숨기기만 한다 — 입력 중인 값과 각 저장 바가 그대로 남도록 */}
      <div className={tab === "blocks" ? "space-y-4" : "hidden"}>
        <HeroCard slug={p.slug} hero={p.hero} onChange={setHero} />

        <div className="flex items-center justify-between pt-2">
          <h2 className="text-[15px] font-semibold">
            블록 <span className="font-normal text-zinc-400">{p.sections.length}</span>
          </h2>
          <span className="text-[12px] text-zinc-400">위에서부터 그 순서대로 그려집니다 · 끌어서 순서 바꾸기</span>
        </div>

        <SortableList
          items={p.sections}
          getKey={(s) => s.key}
          onChange={setSections}
          renderItem={(s, i, ctl) => {
            const spec = BLOCKS[s.kind];
            const shared = isSharedKind(s.kind);
            const content = shared ? value.shared[s.kind as "values" | "cta"] : s;
            const isOpen = open.has(s.key);
            const others = (usage[s.kind] ?? []).filter((l) => l !== label);
            const title = (content.heading || content.kicker || "").split("\n").join(" ");
            return (
              <div className={`overflow-clip rounded-2xl border bg-white ${s.hidden ? "border-dashed border-zinc-300" : "border-zinc-200"}`}>
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <span {...ctl.handle} className="cursor-grab p-1 text-zinc-300 hover:text-zinc-600" title="끌어서 순서 바꾸기">
                    <GripVertical className="h-4 w-4" />
                  </span>
                  <button type="button" onClick={() => toggle(s.key)} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                    <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                    <span className={`truncate text-[14px] font-medium ${s.hidden ? "text-zinc-400 line-through" : ""}`}>{spec.label}</span>
                    {title && <span className="hidden truncate text-[13px] text-zinc-400 sm:inline">{title}</span>}
                  </button>
                  <span className="hidden shrink-0 items-center gap-1.5 md:flex">
                    {spec.group === "shared" && <Badge tone="blue">공통{others.length ? ` · ${others.join(" · ")}에도` : ""}</Badge>}
                    {spec.group === "data" && <Badge tone="green">목록 연결{others.length ? ` · ${others.join(" · ")}에도` : ""}</Badge>}
                    {s.hidden && <Badge tone="amber">숨김</Badge>}
                  </span>
                  <span className="flex shrink-0">
                    <Button size="sm" variant="ghost" onClick={ctl.up} aria-label="위로">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={ctl.down} aria-label="아래로">
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => patchSection(s.key, { hidden: !s.hidden })} aria-label={s.hidden ? "보이기" : "숨기기"} title={s.hidden ? "보이기" : "숨기기 (지우지 않고 사이트에서만 감춤)"}>
                      {s.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label="블록 삭제"
                      onClick={() => {
                        const note = shared ? "\n(공통 블록 내용은 남아 있어서 다른 페이지에는 그대로 보입니다)" : spec.group === "data" ? "\n(연결된 목록 데이터는 지워지지 않습니다)" : "";
                        if (window.confirm(`'${spec.label}' 블록을 이 페이지에서 뺄까요?${note}`)) setSections(p.sections.filter((x) => x.key !== s.key));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </span>
                </div>

                {/* 접어도 지우지 않는다 — 목록 편집 화면의 입력 중인 값이 남도록 */}
                <div className={isOpen ? "border-t border-zinc-100 p-5" : "hidden"}>
                  {shared && (
                    <p className="mb-4 flex items-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-[12px] text-blue-800">
                      <Link2 className="h-3.5 w-3.5 shrink-0" />
                      공통 블록입니다. 여기서 고치면 {others.length ? `${others.join(" · ")} 페이지도` : "이 블록을 넣은 모든 페이지가"} 같이 바뀝니다.
                    </p>
                  )}
                  <BlockForm section={content} onChange={(patch) => (shared ? patchShared(s.kind as "values" | "cta", patch) : patchSection(s.key, patch))} />
                  {spec.group === "data" && (
                    <div className={s.kind === "prices" || s.kind === "staff" ? "" : "mt-6 border-t border-zinc-100 pt-5"}>
                      <p className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold">
                        <Link2 className="h-4 w-4 text-emerald-600" /> {LIST_NAME[s.kind as DataKind]}
                        <span className="font-normal text-zinc-400">— {others.length ? `${others.join(" · ")} 페이지와 같은 목록` : "모든 페이지 공통 목록"}</span>
                      </p>
                      {firstOfKind.get(s.kind) === s.key ? (
                        <EmbedCtx.Provider value={{ saveLabel: `${LIST_NAME[s.kind as DataKind]} 저장` }}>{lists[s.kind as DataKind]}</EmbedCtx.Provider>
                      ) : (
                        <p className="text-[13px] text-zinc-400">같은 목록을 쓰는 블록이 위에 있어서 거기서 편집합니다.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }}
        />

        <button
          type="button"
          onClick={() => setPicker(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-zinc-300 py-5 text-[14px] font-medium text-zinc-500 hover:border-zinc-400 hover:text-zinc-900"
        >
          <Plus className="h-4 w-4" /> 블록 추가
        </button>

        <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
      </div>

      <div className={tab === "seo" ? "" : "hidden"}>{seo}</div>

      {picker && <BlockPicker onClose={() => setPicker(false)} onPick={add} taken={p.sections.map((s) => s.kind)} />}
    </>
  );
}

/* ───────── 히어로 ───────── */

function HeroCard({ slug, hero, onChange }: { slug: string; hero: Page["hero"]; onChange: (patch: Partial<Page["hero"]>) => void }) {
  const isHome = slug === "home";
  const isContact = slug === "contact";
  return (
    <Card
      title="맨 위 (히어로)"
      description={isContact ? "왼쪽 연락처 · 지도는 매장 정보에서. 여기선 영업시간 제목과 오른쪽 사진" : "페이지 맨 위 큰 사진과 제목 — 모양은 고정"}
    >
      <div className="grid gap-5 md:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <Field label={isContact ? "영업시간 제목" : "제목"}>
            <Input value={hero.heading} onChange={(e) => onChange({ heading: e.target.value })} />
          </Field>
          {isHome && (
            <>
              <Field label="본문">
                <Textarea rows={4} value={hero.body ?? ""} onChange={(e) => onChange({ body: e.target.value })} />
              </Field>
              <Links links={hero.cta ?? []} onChange={(cta) => onChange({ cta })} newTab max={2} />
            </>
          )}
        </div>
        <ImageField label={isContact ? "오른쪽 사진" : "배경 사진"} value={hero.image} onChange={(image) => onChange({ image })} aspect="4/3" />
      </div>
    </Card>
  );
}

/* ───────── 블록 고르기 ───────── */

function BlockPicker({ onClose, onPick, taken }: { onClose: () => void; onPick: (k: SectionKind) => void; taken: SectionKind[] }) {
  const groups: BlockGroup[] = ["content", "shared", "data"];
  return (
    <div className="admin-fade fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/40 p-4 sm:p-10" onClick={onClose}>
      <div className="admin-pop w-full max-w-2xl rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold">블록 추가</h2>
          <Button size="sm" variant="ghost" onClick={onClose} aria-label="닫기">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-6 p-5">
          {groups.map((g) => (
            <div key={g}>
              <p className="mb-2 text-[12px] font-medium text-zinc-500">{GROUP_LABEL[g]}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {(Object.entries(BLOCKS) as [SectionKind, (typeof BLOCKS)[SectionKind]][])
                  .filter(([, b]) => b.group === g)
                  .map(([k, b]) => {
                    const dup = isSharedKind(k) && taken.includes(k);
                    return (
                      <button
                        key={k}
                        type="button"
                        disabled={dup}
                        onClick={() => onPick(k)}
                        className="rounded-xl border border-zinc-200 p-3 text-left hover:border-zinc-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-zinc-200"
                      >
                        <span className="block text-[14px] font-medium">{b.label}</span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-zinc-500">{dup ? "이 페이지에 이미 있습니다" : b.description}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
