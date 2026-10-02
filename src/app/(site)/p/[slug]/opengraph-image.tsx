import { PHOTOS } from "@/content/photos";
import { renderOgImage, OG_SIZE } from "@/lib/og";
import { getCustomPage } from "@/lib/queries";

// 커스텀 페이지 공유 이미지 — 요청 때 만든다
export const dynamic = "force-dynamic";
export const alt = "세브니헤어";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const page = await getCustomPage((await params).slug);
  return renderOgImage({
    title: page?.title ?? "SEVENY HAIR",
    subtitle: page?.seo?.description?.slice(0, 40) ?? "동래 1인 헤어살롱",
    image: page?.seo?.ogImage || page?.heroImage || PHOTOS.interior,
  });
}
