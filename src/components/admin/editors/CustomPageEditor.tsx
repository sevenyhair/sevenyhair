"use client";

import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteCustomPage, saveCustomPage } from "@/lib/admin/actions";
import type { CustomPage } from "@/lib/types";
import { ImageField } from "../media";
import RichEditor from "../RichEditor";
import { Badge, Button, Card, Field, Input, PageHeader, SaveBar, Switch, Textarea, useSaveable, useToast } from "../ui";

/** 제목 → 주소 제안. 한글 제목이면 비워 두고 직접 쓰게 한다 */
function suggestSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export default function CustomPageEditor({ initial }: { initial: CustomPage & { _id?: string } }) {
  const router = useRouter();
  const toast = useToast();
  const isNew = !initial._id;
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [deleting, setDeleting] = useState(false);

  const { value: p, setValue, dirty, saving, save, reset } = useSaveable<CustomPage & { _id?: string }>(initial, async (v) => {
    const r = await saveCustomPage(v);
    if (r.ok && isNew && r.data?.id) {
      router.replace(`/admin/custom/${r.data.id}`);
    }
    return r;
  });
  const set = (patch: Partial<CustomPage>) => setValue((x) => ({ ...x, ...patch }));

  const remove = async () => {
    if (!initial._id || !confirm(`"${p.title}" 페이지를 삭제할까요? 되돌릴 수 없습니다.`)) return;
    setDeleting(true);
    const r = await deleteCustomPage(initial._id);
    setDeleting(false);
    if (!r.ok) return toast("error", r.error);
    toast("success", "삭제했습니다.");
    router.push("/admin/custom");
  };

  return (
    <>
      <Link href="/admin/custom" className="mb-3 inline-flex items-center gap-1 text-[13px] text-zinc-500 hover:text-zinc-900">
        <ArrowLeft className="h-4 w-4" /> 목록
      </Link>
      <PageHeader
        title={isNew ? "새 페이지" : p.title || "페이지 편집"}
        description={p.slug ? `주소: /p/${p.slug}` : "주소를 정하면 /p/주소 로 열립니다."}
        actions={
          <>
            {!isNew && initial.published && (
              <a href={`/p/${initial.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-zinc-200 bg-white px-4 text-sm font-medium hover:bg-zinc-50">
                보기 <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {!isNew && (
              <Button variant="danger" onClick={remove} loading={deleting}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Input
            className="h-14 text-[20px] font-semibold"
            placeholder="페이지 제목"
            value={p.title}
            onChange={(e) => set({ title: e.target.value, ...(slugTouched ? {} : { slug: suggestSlug(e.target.value) }) })}
          />
          <RichEditor value={p.html} onChange={(html) => set({ html })} />
        </div>

        <div className="space-y-4 lg:sticky lg:top-10 lg:self-start">
          <Card title="게시">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Switch checked={p.published} onChange={(published) => set({ published })} label={p.published ? "공개" : "비공개"} />
                {p.published ? <Badge tone="green">사이트에 보임</Badge> : <Badge>초안</Badge>}
              </div>
              <Field label="주소" hint="영문 소문자 · 숫자 · 하이픈">
                <div className="flex items-center rounded-[10px] border border-zinc-200 bg-white pl-3 focus-within:border-zinc-900">
                  <span className="text-[13px] text-zinc-400">/p/</span>
                  <input
                    className="w-full bg-transparent py-[9px] pr-3 outline-none"
                    value={p.slug}
                    placeholder="winter-break"
                    onChange={(e) => {
                      setSlugTouched(true);
                      set({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") });
                    }}
                  />
                </div>
              </Field>
            </div>
          </Card>
          <Card title="상단 사진" description="넣으면 다른 페이지처럼 큰 사진 위에 제목이 얹힙니다.">
            <ImageField aspect="16/9" value={p.heroImage} onChange={(heroImage) => set({ heroImage })} />
          </Card>
          <Card title="SEO · 공유">
            <div className="space-y-3">
              <Field label="검색 제목" hint="비우면 페이지 제목">
                <Input value={p.seo?.title ?? ""} onChange={(e) => set({ seo: { ...p.seo, title: e.target.value } })} />
              </Field>
              <Field label="설명">
                <Textarea rows={3} value={p.seo?.description ?? ""} onChange={(e) => set({ seo: { ...p.seo, description: e.target.value } })} />
              </Field>
              <ImageField label="공유 이미지 배경 (비우면 상단 사진)" aspect="1200/630" value={p.seo?.ogImage} onChange={(ogImage) => set({ seo: { ...p.seo, ogImage } })} />
            </div>
          </Card>
        </div>
      </div>
      <SaveBar dirty={dirty || isNew} saving={saving} onSave={save} onReset={reset} />
    </>
  );
}
