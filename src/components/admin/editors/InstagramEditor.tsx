"use client";

import { ArrowDown, ArrowUp, Check, ExternalLink, Eye, EyeOff, GripVertical, Link2, Pin, PinOff, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { igPermalink } from "@/content/instagram";
import { parseInstagramLink, saveInstagram } from "@/lib/admin/actions";
import { Badge, Button, Card, Input, PageHeader, SaveBar, SortableList, useSaveable, useToast } from "../ui";

type Row = { code: string; type: "reel" | "post"; title: string; caption?: string; pinned?: boolean; hidden?: boolean; thumbnail?: string; _k?: string };

/**
 * 인스타그램 피드 — 자동 수집 없이 직접 관리한다 (2026-10-02 결정).
 * 링크를 붙여넣으면 코드만 저장하고, 저장할 때 썸네일을 R2(instagram/<code>.jpg)에 올린다.
 * 링크를 바꾸면 썸네일을 비워 두고 저장할 때 새 게시물 것으로 다시 올린다.
 * 사이트 순서: 고정 → 이 목록 순서. 홈엔 위 3개, Journal 엔 24개.
 */
export default function InstagramEditor({ initial }: { initial: Row[] }) {
  const { value: items, setValue, dirty, saving, save, reset } = useSaveable<Row[]>(
    initial.map((r) => ({
      code: r.code,
      type: r.type,
      title: r.title ?? "",
      caption: r.caption ?? "",
      pinned: !!r.pinned,
      hidden: !!r.hidden,
      thumbnail: r.thumbnail ?? "",
      _k: r.code, // 목록 키 — 링크(code)를 바꿔도 줄이 다시 그려지지 않게
    })),
    saveInstagram,
  );
  const [link, setLink] = useState("");
  const [adding, setAdding] = useState(false);
  const toast = useToast();
  const set = (i: number, patch: Partial<Row>) => setValue((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const [editing, setEditing] = useState<{ k: string; url: string } | null>(null);

  const applyLink = async (i: number) => {
    if (!editing) return;
    const r = await parseInstagramLink(editing.url.trim());
    if (!r.ok || !r.data) return toast("error", r.ok ? "링크를 읽지 못했습니다." : r.error);
    if (items.some((x, j) => j !== i && x.code === r.data!.code)) return toast("info", "이미 목록에 있는 게시물입니다.");
    if (r.data.code !== items[i].code) set(i, { code: r.data.code, type: r.data.type, thumbnail: "" });
    setEditing(null);
  };

  const add = async () => {
    setAdding(true);
    const r = await parseInstagramLink(link.trim());
    setAdding(false);
    if (!r.ok || !r.data) return toast("error", r.ok ? "링크를 읽지 못했습니다." : r.error);
    if (items.some((x) => x.code === r.data!.code)) return toast("info", "이미 목록에 있는 게시물입니다.");
    setValue((s) => [{ ...r.data!, caption: "", title: "", _k: `${r.data!.code}-${Date.now()}` }, ...s]);
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
        getKey={(r) => r._k ?? r.code}
        onChange={setValue}
        renderItem={(r, i, ctl) => (
          <div className={`flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3 ${r.hidden ? "opacity-55" : ""}`}>
            <span {...ctl.handle} className="cursor-grab text-zinc-300 hover:text-zinc-600" title="끌어서 순서 바꾸기">
              <GripVertical className="h-4 w-4" />
            </span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.thumbnail || `/api/ig/${r.code}?size=m`} alt="" loading="lazy" className="h-20 w-16 shrink-0 rounded-lg bg-zinc-100 object-cover" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[12px] text-zinc-400">#{i + 1}</span>
                {r.pinned && <Badge tone="blue">고정</Badge>}
                {r.hidden && <Badge tone="amber">숨김</Badge>}
                <Badge>{r.type === "reel" ? "릴스" : "게시물"}</Badge>
              </div>
              <Input value={r.title} placeholder="카드 제목 (비우면 표시 안 함)" onChange={(e) => set(i, { title: e.target.value })} />
              {editing?.k === (r._k ?? r.code) ? (
                <form
                  className="flex gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    void applyLink(i);
                  }}
                >
                  <Input autoFocus value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="https://www.instagram.com/reel/…" />
                  <Button type="submit" size="sm" variant="primary" className="h-10" aria-label="링크 적용">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-10" onClick={() => setEditing(null)}>
                    취소
                  </Button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing({ k: r._k ?? r.code, url: igPermalink(r) })}
                  className="flex max-w-full items-center gap-1 truncate text-[12px] text-zinc-400 hover:text-zinc-900"
                  title="링크 바꾸기"
                >
                  <Link2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{igPermalink(r).replace("https://www.", "")}</span>
                  {!r.thumbnail && <span className="shrink-0 text-amber-600">· 저장하면 사진을 새로 받습니다</span>}
                </button>
              )}
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
