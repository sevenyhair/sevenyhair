import type { Metadata, Viewport } from "next";
import { KEYWORDS, ROUTES, SITE_NAME, siteUrl } from "@/content/seo";

/*
 * 루트 레이아웃 — html·폰트·공통 메타데이터만.
 * 사이트 장식(로딩 덮개·좌측 내비·사이트 CSS)은 (site)/layout.tsx, 어드민은 admin/layout.tsx.
 * 이렇게 나눠야 사이트 CSS(h1·p·a 기본 스타일 등)가 어드민을 건드리지 않는다.
 *
 * 원본 폰트(Adobe Fonts)의 무료 대체:
 *   futura-pt → Jost / bodoni-urw → Bodoni Moda / Oswald 동일 / p22-cezanne-pro(서명) → Pinyon Script
 * 한글: 본문 Pretendard, 제목 Noto Serif KR (영문 폰트 뒤에 이어 붙여 글자 단위로 대체)
 *
 * 폰트는 빌드 때 받지 않고 브라우저가 Google Fonts 에서 직접 받는다.
 * next/font/google 은 캐시 없는 빌드(Vercel)에서 폰트 파일을 받다가 간헐적으로 실패했다 (2026-10-02).
 */
const GOOGLE_FONTS =
  "https://fonts.googleapis.com/css2" +
  "?family=Jost:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300" +
  "&family=Bodoni+Moda:wght@400" +
  "&family=Oswald:wght@400;500" +
  "&family=Pinyon+Script" +
  "&family=Noto+Serif+KR:wght@300;400" +
  "&display=swap";

const PRETENDARD =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css";

export const dynamic = "force-dynamic";

/** 공통 메타데이터 — 라우트마다 lib/seo.ts 가 덮어쓴다 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: ROUTES.home.title, template: `%s | ${SITE_NAME}` },
  description: ROUTES.home.description,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: [{ name: "Seveny" }],
  formatDetection: { telephone: true, address: true },
  openGraph: { type: "website", locale: "ko_KR", siteName: SITE_NAME },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#111111" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href={GOOGLE_FONTS} />
        <link rel="stylesheet" crossOrigin="anonymous" href={PRETENDARD} />
      </head>
      <body>{children}</body>
    </html>
  );
}
