"use client";

import { ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, GripVertical, Pin, PinOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { igPermalink } from "@/content/instagram";
import { parseInstagramLink, saveInstagram } from "@/lib/admin/actions";
import { Badge, Button, Card, Input, PageHeader, SaveBar, SortableList, useSaveable, useToast } from "../ui";

type Row = { code: string; type: "reel" | "post"; title: string; caption?: string; pinned?: boolean; hidden?: boolean };

/**
 * 인스타그램 피드 — 자동 수집 없이 직접 관리한다 (2026-10-02 결정).
 * 링크를 붙여넣으면 코드만 저장하고, 사진은 /api/ig 프록시가 그때그때 받아 온다.
 * 사이트 순서: 고정 → 이 목록 순서. 홈엔 위 3개, Journal 엔 24개.
 */
export default function InstagramEditor({ initial }: { initial: Row[] }) {
  const { value: items, setValue, dirty, saving, save, reset } = useSaveable<Row[]>(
    initial.map((r) => ({ code: r.code, type: r.type, title: r.title ?? "", caption: r.caption ?? "", pinned: !!r.pinned, hidden: !!r.hidden })),
    saveInstagram,
  );
  const [link, setLink] = useState("");
  const [adding, setAdding] = useState(false);
  const toast = useToast();
  const set = (i: number, patch: Partial<Row>) => setValue((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const add = async () => {
    setAdding(true);
    const r = await parseInstagramLink(link.trim());
    setAdding(false);
    if (!r.ok || !r.data) return toast("error", r.ok ? "링크를 읽지 못했습니다." : r.error);
    if (items.some((x) => x.code === r.data!.code)) return toast("info", "이미 목록에 있는 게시물입니다.");
    setValue((s) => [{ ...r.data!, caption: "", title: "" }, ...s]);
    setLink("");
    toast("success", "맨 위에 추가했습니다. 제목을 적고 저장하세요.");
  };

  return (
    <>
      <PageHeader title="인스타그램" description="홈 'Latest from the journal' 에 위 3개, Journal 페이지에 24개까지 보입니다." />
      <Card title="게시물 추가" description="인스타그램 앱에서 게시물 ··· → 링크 복사 → 여기에 붙여넣기" className="mb-6">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void add();
          }}
        >
          <Input placeholder="https://www.instagram.com/reel/…" value={link} onChange={(e) => setLink(e.target.value)} />
          <Button type="submit" variant="primary" loading={adding} disabled={!link.trim()}>
            <Plus className="h-4 w-4" /> 추가
          </Button>
        </form>
      </Card>

      <SortableList
        items={items}
        getKey={(r) => r.code}
        onChange={setValue}
        renderItem={(r, i, ctl) => (
          <div className={`flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 ${r.hidden ? "opacity-55" : ""}`}>
            <span {...ctl.handle} className="cursor-grab text-zinc-300 hover:text-zinc-600" title="끌어서 순서 바꾸기">
              <GripVertical className="h-4 w-4" />
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/ig/${r.code}?size=m`} alt="" loading="lazy" className="h-20 w-16 shrink-0 rounded-lg bg-zinc-100 object-cover" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-zinc-400">#{i + 1}</span>
                {r.pinned && <Badge tone="blue">고정</Badge>}
                {r.hidden && <Badge tone="amber">숨김</Badge>}
                <Badge>{r.type === "reel" ? "릴스" : "게시물"}</Badge>
              </div>
              <Input value={r.title} placeholder="카드 제목 (비우면 표시 안 함)" onChange={(e) => set(i, { title: e.target.value })} />
            </div>
            <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
              <Button size="sm" variant="ghost" onClick={ctl.up} aria-label="위로">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={ctl.down} aria-label="아래로">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => set(i, { pinned: !r.pinned })} aria-label={r.pinned ? "고정 해제" : "맨 앞 고정"}>
                {r.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => set(i, { hidden: !r.hidden })} aria-label={r.hidden ? "보이기" : "숨기기"}>
                {r.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <a href={igPermalink(r)} target="_blank" rel="noreferrer" className="inline-flex h-8 w-8 items-center justify-center rounded-[10px] text-zinc-500 hover:bg-zinc-100" aria-label="인스타그램에서 보기">
                <ExternalLink className="h-4 w-4" />
              </a>
              <Button size="sm" variant="ghost" onClick={() => setValue(items.filter((_, j) => j !== i))} aria-label="삭제">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      />
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  );
}
