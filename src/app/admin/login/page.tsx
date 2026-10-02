import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/Logo";
import { isAdmin } from "@/lib/admin/guard";
import { adminConfigIssues } from "@/lib/admin/session";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { next } = await searchParams;
  const issues = adminConfigIssues();

  return (
    <div className="admin-root flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Logo className="h-16 w-16" />
          <div>
            <h1 className="text-[20px] font-semibold">세브니헤어 관리자</h1>
            <p className="mt-1 text-[13px] text-zinc-500">사이트 문구·사진·가격을 여기서 바꿉니다</p>
          </div>
        </div>
        {issues.length > 0 && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[13px] text-amber-800">
            <p className="font-medium">로그인 설정이 필요합니다</p>
            <ul className="mt-1 list-disc pl-4">
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
            <p className="mt-2 text-amber-700">Vercel 환경 변수에 넣고 재배포하세요 (docs/setup-infra.md).</p>
          </div>
        )}
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
