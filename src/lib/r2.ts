import "server-only";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 — 브라우저가 사전 서명 URL 로 직접 PUT 한다 (Vercel 요청 본문 4.5MB 제한 회피).
 * 환경 변수 이름은 Ignite 와 같다. 하나라도 비면 null → 업로드 API 가 503 으로 안내한다.
 *
 * 함정 (Ignite 에서 겪음)
 *  - AWS SDK v3 기본 CRC32 체크섬이 빈 본문 값으로 서명돼 R2 가 PUT 을 거부한다 → WHEN_REQUIRED
 *  - ContentLength 가 서명에 들어간다 → 클라이언트가 리사이즈한 *뒤의* 크기로 서명을 받아야 한다
 */
export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
};

export function readR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET_NAME?.trim();
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, "");
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

let client: S3Client | null = null;
function s3(c: R2Config): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${c.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return client;
}

export const UPLOAD_MAX_BYTES = 30 * 1024 * 1024;
export const UPLOAD_CACHE_CONTROL = "public, max-age=31536000, immutable";
export const UPLOAD_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/** 저장 키: media/2026/10/1727838000000-파일이름.jpg */
export function makeKey(filename: string, contentType: string): string {
  const ext = UPLOAD_TYPES[contentType] ?? "bin";
  const stem = filename.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80) || "image";
  const d = new Date();
  const ym = `${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  return `media/${ym}/${d.getTime()}-${stem}.${ext}`;
}

export async function presignPut(c: R2Config, key: string, contentType: string, contentLength: number) {
  const cmd = new PutObjectCommand({
    Bucket: c.bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
    CacheControl: UPLOAD_CACHE_CONTROL,
  });
  const uploadUrl = await getSignedUrl(s3(c), cmd, { expiresIn: 300 });
  return { uploadUrl, key, publicUrl: `${c.publicBaseUrl}/${key}` };
}

export async function deleteObject(c: R2Config, key: string): Promise<void> {
  await s3(c).send(new DeleteObjectCommand({ Bucket: c.bucket, Key: key }));
}
