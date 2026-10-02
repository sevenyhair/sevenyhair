"use client";

import { registerMedia } from "./actions";
import type { MediaItem } from "../types";

/**
 * 브라우저 업로드: 리사이즈 → 사전 서명 받기 → R2 에 직접 PUT(진행률) → 미디어 라이브러리에 등록.
 * Ignite 의 admin-upload-xhr + client-image-resize 를 합쳐 정리했다.
 */
export const MAX_SIDE = 2400;
const QUALITY = 0.82;

type Resized = { blob: Blob; type: string; width?: number; height?: number };

async function resize(file: File): Promise<Resized> {
  // GIF·SVG·AVIF 는 그대로 (애니메이션·벡터·디코딩 지원 차이)
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return { blob: file, type: file.type };
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
    const w = Math.round(bmp.width * scale);
    const h = Math.round(bmp.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
    bmp.close();
    const type = file.type === "image/png" ? "image/webp" : file.type; // 투명 PNG 도 webp 로 보존
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, QUALITY));
    // 더 커지면 원본을 올린다
    if (!blob || (blob.size >= file.size && scale === 1)) return { blob: file, type: file.type, width: w, height: h };
    return { blob, type, width: w, height: h };
  } catch {
    return { blob: file, type: file.type };
  }
}

export type UploadProgress = { name: string; phase: "resizing" | "uploading" | "saving"; percent: number };

export async function uploadImage(
  file: File,
  onProgress?: (p: UploadProgress) => void,
): Promise<{ ok: true; item: MediaItem } | { ok: false; error: string; notConfigured?: boolean }> {
  onProgress?.({ name: file.name, phase: "resizing", percent: 0 });
  const r = await resize(file);

  const signRes = await fetch("/api/admin/upload/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: file.name, contentType: r.type, size: r.blob.size }),
  });
  const sign = (await signRes.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    code?: string;
    uploadUrl?: string;
    key?: string;
    publicUrl?: string;
  };
  if (!sign.ok || !sign.uploadUrl) {
    return { ok: false, error: sign.error ?? `업로드 준비 실패 (${signRes.status})`, notConfigured: sign.code === "R2_NOT_CONFIGURED" };
  }

  const putOk = await new Promise<boolean>((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", sign.uploadUrl!);
    xhr.setRequestHeader("Content-Type", r.type);
    xhr.setRequestHeader("Cache-Control", "public, max-age=31536000, immutable");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.({ name: file.name, phase: "uploading", percent: Math.round((e.loaded / e.total) * 100) });
    };
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send(r.blob);
  });
  if (!putOk) return { ok: false, error: "R2 업로드 실패 — 버킷 CORS 에 이 사이트 주소가 있는지 확인하세요." };

  onProgress?.({ name: file.name, phase: "saving", percent: 100 });
  const saved = await registerMedia({
    key: sign.key!,
    url: sign.publicUrl!,
    name: file.name,
    type: r.type,
    size: r.blob.size,
    width: r.width,
    height: r.height,
  });
  if (!saved.ok || !saved.data) return { ok: false, error: saved.ok ? "등록 실패" : saved.error };
  return { ok: true, item: saved.data };
}
