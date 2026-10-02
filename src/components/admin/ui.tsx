"use client";

import { Check, Loader2, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

/* ───────── 기본 부품 ───────── */

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  loading?: boolean;
};

export function Button({ variant = "secondary", size = "md", loading, className = "", children, disabled, ...rest }: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-[10px] font-medium transition-colors disabled:opacity-50 whitespace-nowrap";
  const sizes = { sm: "h-8 px-3 text-[13px]", md: "h-10 px-4 text-sm" };
  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-800",
    secondary: "bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300",
    ghost: "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900",
    danger: "bg-white border border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button
      type="button"
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Card({ title, description, actions, children, className = "" }: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-2xl border border-zinc-200 bg-white ${className}`}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
          <div>
            {title && <h2 className="text-[15px] font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-zinc-500">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Field({ label, hint, children, className = "" }: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-medium text-zinc-700">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-zinc-500">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`admin-input ${props.className ?? ""}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`admin-input ${props.className ?? ""}`} />;
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-[13px] text-zinc-700"
    >
      <span className={`relative h-5 w-9 rounded-full transition-colors ${checked ? "bg-zinc-900" : "bg-zinc-300"}`}>
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[18px]" : "translate-x-0.5"}`}
        />
      </span>
      {label}
    </button>
  );
}

export function Badge({ tone = "zinc", children }: { tone?: "zinc" | "green" | "amber" | "red" | "blue"; children: React.ReactNode }) {
  const tones = {
    zinc: "bg-zinc-100 text-zinc-600",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-600",
    blue: "bg-sky-50 text-sky-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[12px] font-medium ${tones[tone]}`}>{children}</span>;
}

export function PageHeader({ title, description, actions }: { title: string; description?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-zinc-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ───────── 토스트 ───────── */

type Toast = { id: number; kind: "success" | "error" | "info"; text: string };
const ToastCtx = createContext<(kind: Toast["kind"], text: string) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const push = useCallback((kind: Toast["kind"], text: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s.slice(-3), { id, kind, text }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), kind === "error" ? 6000 : 2800);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`admin-pop pointer-events-auto flex max-w-sm items-start gap-2 rounded-xl px-4 py-3 text-[13px] shadow-lg ${
              t.kind === "error" ? "bg-red-600 text-white" : "bg-zinc-900 text-white"
            }`}
          >
            {t.kind === "success" ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : t.kind === "error" ? <X className="mt-0.5 h-4 w-4 shrink-0" /> : null}
            <span>{t.text}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);

/* ───────── 저장 도우미 ───────── */

type SaveResult = { ok: true } | { ok: false; error: string };

/**
 * 폼 상태 + 변경 감지 + Ctrl/⌘+S + 저장 안 하고 나갈 때 경고.
 * save 는 서버 액션을 감싼 함수. 성공하면 현재 값이 새 기준이 된다.
 */
export function useSaveable<T>(initial: T, save: (value: T) => Promise<SaveResult>) {
  const [value, setValue] = useState<T>(initial);
  const [saved, setSaved] = useState<string>(() => JSON.stringify(initial));
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const dirty = useMemo(() => JSON.stringify(value) !== saved, [value, saved]);
  const ref = useRef({ value, dirty, saving });
  ref.current = { value, dirty, saving };

  const doSave = useCallback(async () => {
    if (ref.current.saving) return;
    setSaving(true);
    const snapshot = ref.current.value;
    const res = await save(snapshot).catch((e: unknown) => ({ ok: false as const, error: e instanceof Error ? e.message : "저장 실패" }));
    setSaving(false);
    if (res.ok) {
      setSaved(JSON.stringify(snapshot));
      toast("success", "저장했습니다. 사이트에 바로 반영됩니다.");
    } else {
      toast("error", res.error);
    }
  }, [save, toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (ref.current.dirty) void doSave();
      }
    };
    const onLeave = (e: BeforeUnloadEvent) => {
      if (ref.current.dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onLeave);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onLeave);
    };
  }, [doSave]);

  const reset = useCallback(() => setValue(JSON.parse(saved) as T), [saved]);
  return { value, setValue, dirty, saving, save: doSave, reset };
}

/** 화면 아래에 붙는 저장 바 — 바뀐 게 있을 때만 떠오른다 */
export function SaveBar({ dirty, saving, onSave, onReset }: { dirty: boolean; saving: boolean; onSave: () => void; onReset: () => void }) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 transition-all duration-200 lg:pl-[260px] ${
        dirty || saving ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="flex w-full max-w-3xl items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
        <span className="flex items-center gap-2 text-[13px] text-zinc-600">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          저장하지 않은 변경사항이 있습니다
          <kbd className="hidden rounded border border-zinc-200 bg-zinc-50 px-1.5 text-[11px] text-zinc-500 sm:inline">Ctrl S</kbd>
        </span>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onReset} disabled={saving}>
            되돌리기
          </Button>
          <Button size="sm" variant="primary" onClick={onSave} loading={saving}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ───────── 목록 편집: 순서 바꾸기 ───────── */

export function move<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/**
 * 끌어서 순서 바꾸기 (HTML5 드래그) + ↑↓ 버튼 (터치 기기·키보드용).
 * renderItem 에 handle(끌기 손잡이 props)을 넘긴다.
 */
export function SortableList<T>({ items, onChange, renderItem, getKey }: {
  items: T[];
  onChange: (items: T[]) => void;
  getKey: (item: T, i: number) => string;
  renderItem: (item: T, i: number, ctl: { up: () => void; down: () => void; handle: React.HTMLAttributes<HTMLElement> }) => React.ReactNode;
}) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li
          key={getKey(item, i)}
          onDragOver={(e) => {
            if (drag === null) return;
            e.preventDefault();
            setOver(i);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (drag !== null && drag !== i) onChange(move(items, drag, i));
            setDrag(null);
            setOver(null);
          }}
          className={`rounded-xl transition-shadow ${over === i && drag !== i ? "ring-2 ring-zinc-900/20" : ""} ${drag === i ? "opacity-50" : ""}`}
        >
          {renderItem(item, i, {
            up: () => onChange(move(items, i, i - 1)),
            down: () => onChange(move(items, i, i + 1)),
            handle: {
              draggable: true,
              onDragStart: (e) => {
                setDrag(i);
                e.dataTransfer.effectAllowed = "move";
              },
              onDragEnd: () => {
                setDrag(null);
                setOver(null);
              },
            },
          })}
        </li>
      ))}
    </ul>
  );
}
