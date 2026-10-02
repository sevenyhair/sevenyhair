"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 네이버 지도 (NCP Maps · Dynamic Map). Ignite 의 StudioMap 을 바탕으로 했다.
 *
 * - 키: NEXT_PUBLIC_NAVER_MAP_CLIENT_ID (NCP 콘솔 → Maps → Application 의 Client ID).
 *   스크립트 파라미터는 `ncpKeyId` (신규 NCP 키). 빌드 때 박히므로 바꾸면 재배포.
 * - NCP 에 등록한 "Web 서비스 URL" 이 아닌 곳(미등록 도메인)에서는 인증 실패 화면이 뜬다.
 * - 키가 없거나 스크립트가 실패하면 지도를 숨기고 링크만 남긴다 (Ignite 는 "로딩 중" 에서 멈췄다).
 */
type Props = {
  lat: number;
  lng: number;
  zoom?: number;
  title: string;
  placeUrl: string;
  height?: number;
};

const SCRIPT_ID = "naver-maps-sdk";

declare global {
  interface Window {
    naver: typeof naver;
    navermap_authFailure?: () => void;
  }
}

type Status = "loading" | "ready" | "failed";

function loadNaverMaps(): Promise<void> {
  if (window.naver?.maps) return Promise.resolve();
  const key = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID;
  if (!key) return Promise.reject(new Error("NEXT_PUBLIC_NAVER_MAP_CLIENT_ID 없음"));
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const s = existing ?? document.createElement("script");
    s.addEventListener("load", () => (window.naver?.maps ? resolve() : reject(new Error("maps 없음"))));
    s.addEventListener("error", () => reject(new Error("스크립트 로드 실패")));
    if (!existing) {
      s.id = SCRIPT_ID;
      s.async = true;
      s.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(key)}`;
      document.head.appendChild(s);
    }
  });
}

export default function NaverMap({ lat, lng, zoom = 17, title, placeUrl, height = 460 }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    let map: naver.maps.Map | null = null;
    let cancelled = false;
    // 등록되지 않은 도메인이면 네이버가 이 함수를 부른다
    window.navermap_authFailure = () => setStatus("failed");

    loadNaverMaps()
      .then(() => {
        if (cancelled || !boxRef.current) return;
        const pos = new naver.maps.LatLng(lat, lng);
        map = new naver.maps.Map(boxRef.current, {
          center: pos,
          zoom,
          scrollWheel: false, // 페이지 스크롤을 가로채지 않는다
          zoomControl: true,
          zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT, style: naver.maps.ZoomControlStyle.SMALL },
          scaleControl: false,
          mapDataControl: false,
          logoControlOptions: { position: naver.maps.Position.BOTTOM_LEFT },
        });
        new naver.maps.Marker({
          position: pos,
          map,
          title,
          // 사이트 톤에 맞춘 검정 사각 마커
          icon: {
            content:
              '<div style="transform:translate(-50%,-100%);display:flex;flex-direction:column;align-items:center">' +
              `<div style="background:#111;color:#fff;font:600 12px/1 Jost,Pretendard,sans-serif;letter-spacing:1px;padding:8px 10px;white-space:nowrap">${title}</div>` +
              '<div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid #111"></div>' +
              "</div>",
          },
        });
        setStatus("ready");
      })
      .catch((err) => {
        console.warn("[map]", err instanceof Error ? err.message : err);
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      map?.destroy();
    };
  }, [lat, lng, zoom, title]);

  return (
    <div className="naver-map" data-status={status}>
      {status !== "failed" && <div ref={boxRef} className="naver-map-canvas" style={{ height }} aria-label={`${title} 위치 지도`} />}
      <a href={placeUrl} target="_blank" rel="noreferrer" className="button ghost-button naver-map-link">
        네이버 지도에서 보기
      </a>
    </div>
  );
}
