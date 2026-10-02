import { ImageResponse } from "next/og";
import { resolveRouteSeo, type RouteKey } from "./seo";

/**
 * 라우트별 공유 이미지 (1200×630). 매장 사진 + 어두운 그라데이션 + SEVENY 로고 테두리 + 제목.
 *
 * 글꼴은 Google Fonts 에서 "그 이미지에 들어갈 글자만" 받는다 (&text=). satori 는 woff2 를 못 읽어서
 * User-Agent 없이 요청해 ttf 를 받는다. 실패하면 글꼴 없이(기본 글꼴) 그리고, 한글 줄은 뺀다.
 * 요청 때 만들어지고(빌드 때 네트워크를 쓰지 않는다) CDN 이 캐시한다.
 */
export const OG_SIZE = { width: 1200, height: 630 };

async function googleFont(family: string, weight: number, text: string): Promise<ArrayBuffer | null> {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
    const css = await fetch(url, { cache: "force-cache" }).then((r) => r.text());
    const src = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    if (!src) return null;
    const res = await fetch(src, { cache: "force-cache" });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export async function renderOg(key: RouteKey) {
  const { og } = await resolveRouteSeo(key);
  return renderOgImage(og);
}

/** 문구·사진을 직접 받아 그린다 — 커스텀 페이지(/p/[slug])도 쓴다 */
export async function renderOgImage(og: { title: string; subtitle: string; image: string }) {
  const latin = `SEVNY${og.title}SEVENY HAIR`;
  const [bodoni, kr, sans] = await Promise.all([
    googleFont("Bodoni+Moda", 400, latin),
    googleFont("Noto+Sans+KR", 300, og.subtitle),
    googleFont("Jost", 400, "SEVENY HAIR · @seveny.hair"),
  ]);

  const fonts = [
    bodoni && { name: "Bodoni", data: bodoni, weight: 400 as const, style: "normal" as const },
    kr && { name: "KR", data: kr, weight: 300 as const, style: "normal" as const },
    sans && { name: "Jost", data: sans, weight: 400 as const, style: "normal" as const },
  ].filter(Boolean) as { name: string; data: ArrayBuffer; weight: 300 | 400; style: "normal" }[];

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#111" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={og.image}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
        />
        <div
          style={{
            // satori 는 inset 단축 속성을 모른다 — 위치·크기를 직접 준다
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            // satori 는 background 단축 속성의 그라데이션을 무시한다 — backgroundImage 로 쓴다
            backgroundImage:
              "linear-gradient(90deg, rgba(17,17,17,0.88) 0%, rgba(17,17,17,0.62) 55%, rgba(17,17,17,0.25) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
            color: "#fff",
          }}
        >
          {/* 로고: 정사각 테두리 + SEV / ENY (대각선 띠는 작은 크기에서 생략) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 140,
              height: 140,
              border: "4px solid #fff",
              fontFamily: "Bodoni",
              fontSize: 42,
              lineHeight: 1.08,
            }}
          >
            <span>SEV</span>
            <span>ENY</span>
          </div>
          <div style={{ marginTop: 48, fontFamily: "Bodoni", fontSize: 76, lineHeight: 1.05 }}>{og.title}</div>
          {kr && (
            <div style={{ marginTop: 22, fontFamily: "KR", fontSize: 34, color: "rgba(255,255,255,0.88)" }}>
              {og.subtitle}
            </div>
          )}
          <div
            style={{
              marginTop: 40,
              fontFamily: "Jost",
              fontSize: 22,
              letterSpacing: 4,
              color: "rgba(255,255,255,0.7)",
            }}
          >
            SEVENY HAIR · @seveny.hair
          </div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts },
  );
}
