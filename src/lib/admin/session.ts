/**
 * 어드민 세션 토큰 — `base64url(payload).base64url(hmac)`
 *
 * ignite 는 고정 문자열의 HMAC 하나를 토큰으로 써서 만료·폐기가 없었다.
 * 여기서는 payload 에 발급·만료 시각을 넣어 서명한다. ADMIN_SECRET 을 바꾸면 모든 세션이 끊긴다.
 *
 * Web Crypto 만 쓴다 — middleware(Edge)와 서버 액션(Node) 양쪽에서 같은 코드로 검증한다.
 */
export const ADMIN_COOKIE = "sv_admin";
export const SESSION_DAYS = 7;

type Payload = { iat: number; exp: number };

const enc = new TextEncoder();

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64url(s: string): Uint8Array {
  const pad = s.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

function secret(): string | null {
  const s = process.env.ADMIN_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

async function hmac(key: string, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return crypto.subtle.sign("HMAC", k, enc.encode(data));
}

/** 길이가 같은 두 바이트열을 시간 차 없이 비교 */
function safeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function createSessionToken(now = Date.now()): Promise<string | null> {
  const key = secret();
  if (!key) return null;
  const payload: Payload = { iat: now, exp: now + SESSION_DAYS * 24 * 60 * 60 * 1000 };
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = b64url(await hmac(key, body));
  return `${body}.${sig}`;
}

export async function verifySessionToken(token: string | undefined | null, now = Date.now()): Promise<boolean> {
  const key = secret();
  if (!key || !token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const expected = new Uint8Array(await hmac(key, body));
  if (!safeEqual(expected, fromB64url(sig))) return false;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as Payload;
    return typeof payload.exp === "number" && payload.exp > now;
  } catch {
    return false;
  }
}

/** 비밀번호 비교 — 길이가 달라도 시간 차가 나지 않도록 해시끼리 비교한다 */
export async function passwordMatches(input: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(input)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  return safeEqual(new Uint8Array(a), new Uint8Array(b));
}

/** 설정 점검 — 로그인 화면과 대시보드에서 안내용으로 쓴다 */
export function adminConfigIssues(): string[] {
  const issues: string[] = [];
  if (!process.env.ADMIN_PASSWORD) issues.push("ADMIN_PASSWORD 가 설정되지 않았습니다.");
  if (!secret()) issues.push("ADMIN_SECRET 이 없거나 16자보다 짧습니다.");
  return issues;
}
