import { isAdmin } from "@/lib/admin/guard";
import { makeKey, presignPut, readR2Config, UPLOAD_MAX_BYTES, UPLOAD_TYPES } from "@/lib/r2";

/**
 * 업로드용 사전 서명 URL 발급. 브라우저가 이 URL 로 R2 에 직접 PUT 한다.
 * 요청: { filename, contentType, size } — size 는 리사이즈 *후* 크기 (서명에 들어간다)
 */
export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ ok: false, error: "로그인이 필요합니다." }, { status: 401 });

  const r2 = readR2Config();
  if (!r2) {
    return Response.json(
      { ok: false, error: "R2 설정이 아직 없습니다. Vercel 환경 변수 R2_* 5개를 넣고 재배포하세요.", code: "R2_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as { filename?: string; contentType?: string; size?: number } | null;
  const contentType = body?.contentType ?? "";
  const size = Number(body?.size);
  if (!UPLOAD_TYPES[contentType]) {
    return Response.json({ ok: false, error: "jpg · png · webp · gif · avif · svg 만 올릴 수 있습니다." }, { status: 400 });
  }
  if (!Number.isInteger(size) || size <= 0 || size > UPLOAD_MAX_BYTES) {
    return Response.json({ ok: false, error: "파일은 30MB 이하여야 합니다." }, { status: 400 });
  }

  const key = makeKey(body?.filename ?? "image", contentType);
  const signed = await presignPut(r2, key, contentType, size);
  return Response.json({ ok: true, ...signed });
}
