"use client";

import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { saveStaff } from "@/lib/admin/actions";
import type { Staff } from "@/lib/types";
import { ImageField } from "../media";
import { Button, Card, Field, Input, PageHeader, SaveBar, Textarea, useSaveable } from "../ui";

/** About 페이지 인물 소개. 이력(Milestones)은 페이지 문구 → About 에서 편집한다 */
export default function StaffEditor({ initial }: { initial: Staff[] }) {
  const { value: items, setValue, dirty, saving, save, reset } = useSaveable<Staff[]>(initial, saveStaff);
  const set = (i: number, patch: Partial<Staff>) => setValue((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <>
      <PageHeader
        title="원장 소개"
        description={
          <>
            About 페이지 소개 · 이력(Milestones)은{" "}
            <Link href="/admin/pages?p=about" className="underline">
              페이지 문구 → About
            </Link>{" "}
            에서 수정합니다.
          </>
        }
        actions={
          <Button onClick={() => setValue((s) => [...s, { name: "", role: "", bio: [""], photo: "", order: s.length + 1 }])}>
            <Plus className="h-4 w-4" /> 인물 추가
          </Button>
        }
      />
      <div className="space-y-6">
        {items.map((p, i) => (
          <Card
            key={i}
            title={p.name || "새 인물"}
            actions={
              items.length > 1 && (
                <Button size="sm" variant="danger" onClick={() => confirm("삭제할까요?") && setValue(items.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )
            }
          >
            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
              <ImageField label="사진" aspect="4/5" value={p.photo} onChange={(photo) => set(i, { photo })} />
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="이름 (제목·서명에 쓰임)">
                    <Input value={p.name} onChange={(e) => set(i, { name: e.target.value })} />
                  </Field>
                  <Field label="역할">
                    <Input value={p.role} onChange={(e) => set(i, { role: e.target.value })} />
                  </Field>
                </div>
                <div className="space-y-2">
                  <span className="block text-[13px] font-medium text-zinc-700">소개 문단</span>
                  {p.bio.map((b, k) => (
                    <div key={k} className="flex gap-2">
                      <Textarea rows={3} value={b} onChange={(e) => set(i, { bio: p.bio.map((x, m) => (m === k ? e.target.value : x)) })} />
                      <Button size="sm" variant="ghost" onClick={() => set(i, { bio: p.bio.filter((_, m) => m !== k) })} aria-label="문단 삭제">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" onClick={() => set(i, { bio: [...p.bio, ""] })}>
                    <Plus className="h-4 w-4" /> 문단 추가
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  );
}
