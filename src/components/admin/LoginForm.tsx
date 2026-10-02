"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { loginAction } from "@/lib/admin/actions";
import { Button } from "./ui";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, undefined);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">비밀번호</span>
        <div className="relative">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            autoFocus
            required
            className="admin-input pr-10"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 hover:text-zinc-700"
            aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </label>
      {state?.error && <p className="text-[13px] text-red-600">{state.error}</p>}
      <Button type="submit" variant="primary" className="w-full" loading={pending}>
        로그인
      </Button>
      <p className="text-center text-[12px] text-zinc-400">로그인은 7일 동안 유지됩니다</p>
    </form>
  );
}
