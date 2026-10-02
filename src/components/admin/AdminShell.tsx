"use client";

import {
  Armchair,
  BookOpen,
  ExternalLink,
  FileText,
  Gauge,
  House,
  Info,
  Image as ImageIcon,
  LogOut,
  MapPin,
  Menu,
  MessageSquareQuote,
  Scissors,
  Search,
  Sparkles,
  Store,
  Tags,
  UserRound,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { logoutAction } from "@/lib/admin/actions";
import { IconInstagram as Instagram } from "../Icons";
import Logo from "../Logo";

type NavItem = { href: string; label: string; icon: React.ElementType; keywords?: string };

/**
 * 페이지: 사이트 페이지 단위 (메뉴 이름 · 히어로 · 블록 순서 · SEO).
 * 목록: 블록이 보여주는 데이터 (가격표 · 인스타 · 후기 · 스타일북 · 원장). 목록 연결 블록은 여기로 링크한다.
 * keywords 는 Ctrl K 빠른 이동 검색어.
 */
export const NAV: { group: string; items: NavItem[] }[] = [
  { group: "", items: [{ href: "/admin", label: "대시보드", icon: Gauge, keywords: "home 상태" }] },
  {
    group: "페이지",
    items: [
      { href: "/admin/pages/home", label: "홈", icon: House, keywords: "home 히어로 후기 리뷰 인스타 아이콘 예약유도 seo" },
      { href: "/admin/pages/services", label: "Services", icon: Scissors, keywords: "시술 가격 가격표 커트 펌 염색 클리닉 스타일북 seo" },
      { href: "/admin/pages/salon", label: "The Salon", icon: Armchair, keywords: "살롱 소개 갤러리 사진 런던 seo" },
      { href: "/admin/pages/about", label: "About", icon: Info, keywords: "원장 소개 디자이너 연혁 이력 seo" },
      { href: "/admin/pages/journal", label: "Journal", icon: BookOpen, keywords: "인스타그램 instagram 피드 릴스 게시물 seo" },
      { href: "/admin/pages/contact", label: "Contact", icon: MapPin, keywords: "오시는 길 영업시간 사진 seo" },
    ],
  },
  {
    group: "목록",
    items: [
      { href: "/admin/services", label: "시술 · 가격", icon: Tags, keywords: "가격표 커트 펌 염색 클리닉" },
      { href: "/admin/instagram", label: "인스타그램", icon: Instagram, keywords: "피드 릴스 게시물 링크 journal" },
      { href: "/admin/reviews", label: "후기", icon: MessageSquareQuote, keywords: "리뷰 testimonials 네이버" },
      { href: "/admin/styles", label: "스타일북", icon: Sparkles, keywords: "스타일 사진 포트폴리오" },
      { href: "/admin/staff", label: "원장 소개", icon: UserRound, keywords: "디자이너 소개 이력 about" },
    ],
  },
  {
    group: "공통",
    items: [
      { href: "/admin/shop", label: "매장 정보", icon: Store, keywords: "주소 전화 영업시간 휴무 지도 결제 예약 푸터" },
      { href: "/admin/custom", label: "커스텀 페이지", icon: FileText, keywords: "새 페이지 html 에디터 공지 이벤트" },
      { href: "/admin/media", label: "미디어", icon: ImageIcon, keywords: "이미지 업로드 사진 r2 라이브러리" },
    ],
  },
];

const ALL = NAV.flatMap((g) => g.items);

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");
}

export default function AdminShell({ children, siteUrl }: { children: React.ReactNode; siteUrl: string }) {
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => setDrawer(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPalette((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const current = ALL.find((i) => isActive(pathname, i.href));

  // 데스크톱 사이드바와 모바일 서랍에 두 번 그린다 — 로고 mask id 를 나눈다
  const sidebar = (where: "side" | "drawer") => (
    <nav className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 px-5">
        <Logo className="h-10 w-10 shrink-0" idSuffix={`-admin-${where}`} />
        <div className="leading-tight">
          <p className="text-[14px] font-semibold">세브니헤어</p>
          <p className="text-[12px] text-zinc-500">관리자</p>
        </div>
      </div>
      <button
        onClick={() => setPalette(true)}
        className="mx-3 mb-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-400 hover:border-zinc-300"
      >
        <Search className="h-4 w-4" />
        빠른 이동
        <kbd className="ml-auto rounded border border-zinc-200 px-1.5 text-[11px]">Ctrl K</kbd>
      </button>
      <div className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV.map((g) => (
          <div key={g.group || "top"}>
            {g.group && <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{g.group}</p>}
            <ul className="space-y-0.5">
              {g.items.map((it) => {
                const active = isActive(pathname, it.href);
                const Icon = it.icon;
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] transition-colors ${
                        active ? "bg-zinc-900 font-medium text-white" : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="space-y-1 border-t border-zinc-200 p-3">
        <a
          href={siteUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-zinc-600 hover:bg-zinc-100"
        >
          <ExternalLink className="h-[18px] w-[18px]" />
          사이트 보기
        </a>
        <form action={logoutAction}>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-zinc-600 hover:bg-zinc-100">
            <LogOut className="h-[18px] w-[18px]" />
            로그아웃
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="admin-root">
      {/* 데스크톱 사이드바 */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-zinc-200 bg-[#fbfbfa] lg:block">{sidebar("side")}</aside>

      {/* 모바일 상단바 + 서랍 */}
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setDrawer(true)} className="-ml-1 rounded-lg p-1.5 hover:bg-zinc-100" aria-label="메뉴 열기">
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-[15px] font-semibold">{current?.label ?? "관리자"}</span>
        <button onClick={() => setPalette(true)} className="ml-auto rounded-lg p-1.5 hover:bg-zinc-100" aria-label="빠른 이동">
          <Search className="h-5 w-5" />
        </button>
      </header>
      {drawer && (
        <div className="admin-fade fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setDrawer(false)}>
          <aside className="admin-pop h-full w-[280px] bg-[#fbfbfa] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setDrawer(false)} className="absolute left-[244px] top-4 rounded-lg p-1 text-white" aria-label="메뉴 닫기">
              <X className="h-5 w-5" />
            </button>
            {sidebar("drawer")}
          </aside>
        </div>
      )}

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-[260px] lg:px-10 lg:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      {palette && <CommandPalette onClose={() => setPalette(false)} />}
    </div>
  );
}

/** Ctrl+K — 메뉴 이름·키워드로 바로 이동 */
function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ALL;
    return ALL.filter((i) => `${i.label} ${i.keywords ?? ""} ${i.href}`.toLowerCase().includes(s));
  }, [q]);

  useEffect(() => inputRef.current?.focus(), []);
  useEffect(() => setSel(0), [q]);

  const go = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <div className="admin-fade fixed inset-0 z-[95] flex items-start justify-center bg-black/30 px-4 pt-[14vh]" onClick={onClose}>
      <div className="admin-pop w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4">
          <Search className="h-4 w-4 text-zinc-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              if (e.key === "ArrowDown") setSel((s) => Math.min(results.length - 1, s + 1));
              if (e.key === "ArrowUp") setSel((s) => Math.max(0, s - 1));
              if (e.key === "Enter" && results[sel]) go(results[sel].href);
            }}
            placeholder="어디로 갈까요? (예: 가격, 영업시간, 인스타)"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none"
          />
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {results.map((r, i) => {
            const Icon = r.icon;
            return (
              <li key={r.href}>
                <button
                  onMouseEnter={() => setSel(i)}
                  onClick={() => go(r.href)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14px] ${i === sel ? "bg-zinc-100" : ""}`}
                >
                  <Icon className="h-4 w-4 text-zinc-500" />
                  {r.label}
                </button>
              </li>
            );
          })}
          {!results.length && <li className="px-3 py-6 text-center text-[13px] text-zinc-400">찾는 메뉴가 없습니다</li>}
        </ul>
      </div>
    </div>
  );
}
