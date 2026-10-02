"use client";

import { Check, Copy, Trash2, X } from "lucide-react";
import { useState } from "react";
import { deleteMedia, updateMediaAlt } from "@/lib/admin/actions";
import type { MediaItem } from "@/lib/types";
import { Dropzone } from "../media";
import { Button, Field, Input, PageHeader, useToast } from "../ui";

function size(n?: number) {
  if (!n) return "";
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)}MB` : `${Math.round(n / 1024)}KB`;
}

export default function MediaLibrary({ initial, r2Ready }: { initial: MediaItem[]; r2Ready: boolean }) {
  const [items, setItems] = useState(initial);
  const [sel, setSel] = useState<MediaItem | null>(null);
  const [alt, setAlt] = useState("");
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const open = (m: MediaItem) => {
    setSel(m);
    setAlt(m.alt ?? "");
    setCopied(false);
  };

  return (
    <>
      <PageHeader title="미디어" description={`올린 이미지 ${items.length}개 · Cloudflare R2 에 저장됩니다.`} />
      {!r2Ready && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
          R2 설정이 아직 없어 업로드가 막혀 있습니다. Vercel 환경 변수 <code>R2_*</code> 5개를 넣고 재배포하면 바로 쓸 수 있어요.
          그전에는 각 화면의 이미지 칸에서 <b>이미지 주소 붙여넣기</b>로 바꿀 수 있습니다.
        </div>
      )}
      <Dropzone onUploaded={(up) => setItems((s) => [...up, ...s])} />

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
        {items.map((m) => (
          <button
            key={m.key}
            onClick={() => open(m)}
            className="group overflow-hidden rounded-xl border border-zinc-200 bg-white text-left transition-shadow hover:shadow-md"
          >
            <div className="aspect-square overflow-hidden bg-zinc-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
            </div>
            <div className="px-2.5 py-2">
              <p className="truncate text-[12px] font-medium">{m.name}</p>
              <p className="text-[11px] text-zinc-400">
                {m.width && m.height ? `${m.width}×${m.height} · ` : ""}
                {size(m.size)}
              </p>
            </div>
          </button>
        ))}
      </div>

      {sel && (
        <div className="admin-fade fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={() => setSel(null)}>
          <div className="admin-pop grid max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl md:grid-cols-[1fr_300px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-center bg-zinc-100 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={sel.url} alt={sel.alt ?? ""} className="max-h-[70vh] object-contain" />
            </div>
            <div className="flex flex-col gap-4 p-5">
              <div className="flex items-start justify-between">
                <p className="break-all text-[13px] font-medium">{sel.name}</p>
                <button onClick={() => setSel(null)} className="rounded-lg p-1 hover:bg-zinc-100" aria-label="닫기">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Field label="주소">
                <div className="flex gap-2">
                  <Input readOnly value={sel.url} className="text-[12px]" />
                  <Button
                    onClick={() => {
                      void navigator.clipboard.writeText(sel.url);
                      setCopied(true);
                    }}
                    aria-label="주소 복사"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </Field>
              <Field label="설명 (alt)" hint="이미지를 못 보는 사람·검색엔진을 위한 설명">
                <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="예: 핑크바이올렛 투톤 뒷모습" />
              </Field>
              <div className="mt-auto flex gap-2">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={async () => {
                    const r = await updateMediaAlt(sel._id!, alt);
                    if (!r.ok) return toast("error", r.error);
                    setItems((s) => s.map((x) => (x._id === sel._id ? { ...x, alt } : x)));
                    toast("success", "저장했습니다.");
                  }}
                >
                  설명 저장
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!confirm("이 이미지를 삭제할까요? 사이트에서 쓰고 있다면 그 자리가 비게 됩니다.")) return;
                    const r = await deleteMedia(sel._id!);
                    if (!r.ok) return toast("error", r.error);
                    setItems((s) => s.filter((x) => x._id !== sel._id));
                    setSel(null);
                    toast("success", "삭제했습니다.");
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
