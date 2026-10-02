import { OG_SIZE, renderOg } from "@/lib/og";

// 공유 이미지 — 요청 때 만든다 (빌드에서 네트워크를 쓰지 않도록)
export const dynamic = "force-dynamic";
export const alt = "세브니헤어 시술과 가격";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg("services");
}
