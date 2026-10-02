"use client";

import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Style } from "@/content/styles";
import { saveStyles } from "@/lib/admin/actions";
import { ImageField } from "../media";
import { Badge, Button, Input, PageHeader, SaveBar, SortableList, useSaveable } from "../ui";

type Row = Style & { hidden?: boolean };

export default function StylesEditor({ initial }: { initial: Row[] }) {
  const { value: items, setValue, dirty, saving, save, reset } = useSaveable<Row[]>(initial, saveStyles);
  const [filter, setFilter] = useState<"all" | "f" | "m">("all");
  const set = (i: number, patch: Partial<Row>) => setValue((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  const add = () =>
    setValue((s) => [
      { num: "", title: "새 스타일", category: "", titleEn: "", gender: "f", images: [], order: 0 },
      ...s,
    ]);

  return (
    <>
      <PageHeader
        title="스타일북"
        description={`Services 아래 Style book · ${items.length}개 (숨김 ${items.filter((x) => x.hidden).length})`}
        actions={
          <Button variant="primary" onClick={add}>
            <Plus className="h-4 w-4" /> 스타일 추가
          </Button>
        }
      />
      <div className="mb-4 flex gap-1">
        {(["all", "f", "m"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "primary" : "secondary"} onClick={() => setFilter(f)}>
            {f === "all" ? "전체" : f === "f" ? "여성" : "남성"}
          </Button>
        ))}
      </div>
      <SortableList
        items={items}
        getKey={(s, i) => s.num || `new${i}`}
        onChange={setValue}
        renderItem={(s, i, ctl) =>
          filter !== "all" && s.gender !== filter ? null : (
            <div className={`grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 md:grid-cols-[auto_1fr] ${s.hidden ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-2">
                <span {...ctl.handle} className="cursor-grab pt-1 text-zinc-300 hover:text-zinc-600" title="끌어서 순서 바꾸기">
                  <GripVertical className="h-4 w-4" />
                </span>
                <div className="w-32">
                  <ImageField
                    aspect="4/5"
                    value={s.images[0]?.src}
                    onChange={(src) => set(i, { images: src ? [{ src, w: 0, h: 0 }, ...s.images.slice(1)] : s.images.slice(1) })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Input className="max-w-xs font-medium" value={s.title} onChange={(e) => set(i, { title: e.target.value })} placeholder="스타일 이름" />
                  <Input className="max-w-xs" value={s.category} onChange={(e) => set(i, { category: e.target.value })} placeholder="카테고리 (예: 투톤 · 탈색)" />
                  <select className="admin-input w-24" value={s.gender} onChange={(e) => set(i, { gender: e.target.value as "f" | "m" })}>
                    <option value="f">여성</option>
                    <option value="m">남성</option>
                  </select>
                  {s.hidden && <Badge tone="amber">숨김</Badge>}
                  <div className="ml-auto flex gap-1">
                    <Button size="sm" variant="ghost" onClick={ctl.up} aria-label="위로">
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={ctl.down} aria-label="아래로">
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => set(i, { hidden: !s.hidden })} aria-label={s.hidden ? "보이기" : "숨기기"}>
                      {s.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => confirm(`"${s.title}" 를 삭제할까요?`) && setValue(items.filter((_, j) => j !== i))}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-[12px] text-zinc-500">추가 사진 (누르면 사이트에서 넘겨 봅니다)</p>
                  <div className="flex flex-wrap gap-2">
                    {s.images.slice(1).map((img, k) => (
                      <div key={k} className="w-20">
                        <ImageField
                          aspect="1/1"
                          value={img.src}
                          onChange={(src) =>
                            set(i, {
                              images: src
                                ? s.images.map((x, m) => (m === k + 1 ? { ...x, src } : x))
                                : s.images.filter((_, m) => m !== k + 1),
                            })
                          }
                        />
                      </div>
                    ))}
                    <div className="w-20">
                      <ImageField aspect="1/1" onChange={(src) => src && set(i, { images: [...s.images, { src, w: 0, h: 0 }] })} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        }
      />
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  );
}
