import "server-only";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySessionToken } from "./session";

/** 서버 액션·API 안에서 한 번 더 확인한다 (middleware 를 건너뛰는 호출 대비) */
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("로그인이 필요합니다.");
}
