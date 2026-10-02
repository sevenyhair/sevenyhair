"use client";

import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { saveTestimonials } from "@/lib/admin/actions";
import type { Testimonial } from "@/lib/types";
import { ImageField } from "../media";
import { Button, Input, PageHeader, SaveBar, SortableList, Textarea, useSaveable } from "../ui";

/**
 * 홈 "What our guests say" 슬라이드.
 * 원칙: 지어낸 후기를 쓰지 않는다. 지금은 네이버 리뷰 키워드 집계를 쓰고 있다 (예: "원하는 스타일로 잘해줘요" 213명).
 */
export default function ReviewsEditor({ initial }: { initial: Testimonial[] }) {
  const { value: items, setValue, dirty, saving, save, reset } = useSaveable<Testimonial[]>(initial, saveTestimonials);
  const set = (i: number, patch: Partial<Testimonial>) => setValue((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <>
      <PageHeader
        title="후기"
        description="홈 'What our guests say' 슬라이드 · 실제 리뷰(네이버 등)에 근거한 문구만 써 주세요."
        actions={
          <Button variant="primary" onClick={() => setValue((s) => [...s, { name: "", text: "", avatar: "", order: s.length + 1 }])}>
            <Plus className="h-4 w-4" /> 추가
          </Button>
        }
      />
      <SortableList
        items={items}
        getKey={(_, i) => `r${i}`}
        onChange={setValue}
        renderItem={(t, i, ctl) => (
          <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-[auto_96px_1fr_auto]">
            <span {...ctl.handle} className="hidden cursor-grab pt-2 text-zinc-300 hover:text-zinc-600 sm:block" title="끌어서 순서 바꾸기">
              <GripVertical className="h-4 w-4" />
            </span>
            <ImageField aspect="1/1" value={t.avatar} onChange={(avatar) => set(i, { avatar })} />
            <div className="space-y-2">
              <Input placeholder="이름 줄 (예: 네이버 방문자 213명)" value={t.name} onChange={(e) => set(i, { name: e.target.value })} />
              <Textarea rows={3} placeholder="후기 문구" value={t.text} onChange={(e) => set(i, { text: e.target.value })} />
            </div>
            <div className="flex gap-1 sm:flex-col">
              <Button size="sm" variant="ghost" onClick={ctl.up} aria-label="위로">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={ctl.down} aria-label="아래로">
                <ArrowDown className="h-4 w-4" />
              </Button>
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
