"use client";

import { ImageIcon, Link2, Loader2, Trash2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { listMedia } from "@/lib/admin/actions";
import { uploadImage, type UploadProgress } from "@/lib/admin/upload-client";
import type { MediaItem } from "@/lib/types";
import { Button, Input, useToast } from "./ui";

/* ───────── 업로드 영역 (끌어놓기 · 클릭 · 붙여넣기) ───────── */

export function Dropzone({ onUploaded, compact = false }: { onUploaded: (items: MediaItem[]) => void; compact?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  const [progress, setProgress] = useState<UploadProgress[]>([]);
  const toast = useToast();

  const handle = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!list.length) return;
      const done: MediaItem[] = [];
      for (const [i, f] of list.entries()) {
        const res = await uploadImage(f, (p) =>
          setProgress((s) => {
            const next = s.slice();
            next[i] = p;
            return next;
          }),
        );
        if (res.ok) done.push(res.item);
        else {
          toast("error", res.notConfigured ? "R2 설정 후 업로드할 수 있습니다. 지금은 이미지 주소 붙여넣기를 써 주세요." : `${f.name}: ${res.error}`);
          if (res.notConfigured) break;
        }
      }
      setProgress([]);
      if (done.length) {
        toast("success", `${done.length}개 업로드했습니다.`);
        onUploaded(done);
      }
    },
    [onUploaded, toast],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length) void handle(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [handle]);

  const busy = progress.length > 0;
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        void handle(e.dataTransfer.files);
      }}
      onClick={() => !busy && inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition-colors ${
        over ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-300"
      } ${compact ? "px-4 py-6" : "px-6 py-10"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => e.target.files && void handle(e.target.files)}
      />
      {busy ? (
        <div className="w-full max-w-xs space-y-2">
          {progress.map((p, i) => (
            <div key={i} className="text-left text-[12px] text-zinc-600">
              <div className="mb-1 flex justify-between">
                <span className="truncate">{p?.name}</span>
                <span>{p?.phase === "resizing" ? "줄이는 중" : p?.phase === "saving" ? "등록 중" : `${p?.percent ?? 0}%`}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full bg-zinc-900 transition-all" style={{ width: `${p?.percent ?? 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <Upload className="h-5 w-5 text-zinc-400" />
          <p className="text-[13px] text-zinc-600">
            이미지를 끌어다 놓거나 <span className="font-medium text-zinc-900 underline">클릭해서 선택</span>
          </p>
          <p className="text-[12px] text-zinc-400">붙여넣기(Ctrl V)도 됩니다 · 긴 변 2400px 로 자동 축소</p>
        </>
      )}
    </div>
  );
}

/* ───────── 이미지 고르기 창 ───────── */

export function MediaPicker({ open, onClose, onPick }: { open: boolean; onClose: () => void; onPick: (url: string) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!open) return;
    listMedia().then((r) => setItems(r.ok ? r.data ?? [] : []));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="admin-fade fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="admin-pop flex max-h-[86vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
          <h2 className="text-[15px] font-semibold">이미지 선택</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-zinc-100" aria-label="닫기">
            <X className="h-4 w-4" />
          </button>
        </header>
        <div className="space-y-4 overflow-y-auto p-5">
          <Dropzone compact onUploaded={(up) => onPick(up[0].url)} />
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (/^https?:\/\//.test(url.trim())) onPick(url.trim());
            }}
          >
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input className="pl-9" placeholder="또는 이미지 주소 붙여넣기 (https://…)" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <Button type="submit" variant="primary">
              사용
            </Button>
          </form>
          <div>
            <p className="mb-2 text-[12px] font-medium text-zinc-500">라이브러리</p>
            {items === null ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
              </div>
            ) : items.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-zinc-400">아직 올린 이미지가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {items.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => onPick(m.url)}
                    className="group relative aspect-square overflow-hidden rounded-xl bg-zinc-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={m.url} alt={m.alt ?? ""} loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── 이미지 한 칸 ───────── */

export function ImageField({ value, onChange, aspect = "4/3", label }: {
  value?: string;
  onChange: (url: string) => void;
  aspect?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      {label && <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">{label}</span>}
      <div className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50" style={{ aspectRatio: aspect }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-zinc-300">
            <ImageIcon className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <Button size="sm" onClick={() => setOpen(true)}>
            {value ? "바꾸기" : "선택"}
          </Button>
          {value && (
            <Button size="sm" variant="danger" onClick={() => onChange("")} aria-label="이미지 빼기">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      <MediaPicker
        open={open}
        onClose={() => setOpen(false)}
        onPick={(url) => {
          onChange(url);
          setOpen(false);
        }}
      />
    </div>
  );
}
