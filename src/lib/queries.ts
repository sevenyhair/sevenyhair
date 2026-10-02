import { cache } from "react";
import { connectDB } from "./mongodb";
import {
  CustomPageModel,
  InstagramModel,
  MediaModel,
  PageModel,
  PostModel,
  SeoModel,
  ServiceModel,
  ShopModel,
  StaffModel,
  StyleModel,
  TestimonialModel,
} from "./models";
import { styles as styleDefaults, type Style } from "@/content/styles";
import { instagram as instagramDefaults, type InstagramItem } from "@/content/instagram";
import * as defaults from "@/content/defaults";
import * as pageDefaults from "@/content/pages";
import type { CustomPage, MediaItem, Page, Post, SeoOverride, Service, Shop, Staff, Testimonial } from "./types";

/*
 * DB 를 먼저 읽고, 실패하거나 비어 있으면 기본 콘텐츠로 그린다.
 * 실패는 삼키되 [db] 로그로 남긴다 — "데이터 없음"과 "연결 실패"가 같아 보이지 않도록.
 */
async function fromDb<T>(label: string, read: () => Promise<T | null | undefined>, fallback: T): Promise<T> {
  if (!process.env.MONGODB_URI) return fallback;
  try {
    await connectDB();
    const value = await read();
    if (value == null || (Array.isArray(value) && value.length === 0)) return fallback;
    return value;
  } catch (err) {
    console.error(`[db] ${label} 실패 — 기본 콘텐츠로 대체`, err instanceof Error ? err.message : err);
    return fallback;
  }
}

const clean = <T,>(doc: unknown): T => JSON.parse(JSON.stringify(doc)) as T;

/** 매장 정보 — DB 에 없는 필드(나중에 추가된 map 등)는 기본값으로 채운다 */
export const getShop = cache(async () => {
  const shop = await fromDb<Shop | null>("getShop", async () => clean(await ShopModel.findOne({ key: "main" }).lean()), null);
  return { ...defaults.shop, ...(shop ?? {}) } as Shop;
});

const PAGE_DEFAULTS: Record<string, Page> = {
  home: defaults.homePage as Page,
  ...pageDefaults.pages,
};

export const getPage = cache((slug: string) =>
  fromDb<Page>(
    `getPage(${slug})`,
    async () => clean(await PageModel.findOne({ slug }).lean()),
    PAGE_DEFAULTS[slug],
  ),
);

export const getTestimonials = cache(() =>
  fromDb<Testimonial[]>(
    "getTestimonials",
    async () => clean(await TestimonialModel.find({ published: { $ne: false } }).sort({ order: 1 }).lean()),
    defaults.testimonials,
  ),
);

export const getServices = cache(() =>
  fromDb<Service[]>(
    "getServices",
    async () => clean(await ServiceModel.find({ published: { $ne: false } }).sort({ order: 1 }).lean()),
    pageDefaults.services,
  ),
);

export const getStaff = cache(() =>
  fromDb<Staff[]>(
    "getStaff",
    async () => clean(await StaffModel.find().sort({ order: 1 }).lean()),
    pageDefaults.staff,
  ),
);

export const getPosts = cache(() =>
  fromDb<Post[]>(
    "getPosts",
    async () => clean(await PostModel.find({ published: { $ne: false } }).sort({ publishedAt: -1 }).lean()),
    pageDefaults.posts,
  ),
);

export async function getPost(slug: string): Promise<Post | undefined> {
  const all = await getPosts();
  return all.find((p) => p.slug === slug);
}

/**
 * 인스타그램 피드. 고정(pinned) → 어드민에서 정한 순서(order) → 최신(takenAt).
 * DB 에 하나라도 있으면 DB 를, 없으면 수집해 둔 기본 목록을 쓴다.
 */
export const getInstagram = cache((limit = 24) =>
  fromDb<InstagramItem[]>(
    "getInstagram",
    async () =>
      clean(
        await InstagramModel.find({ hidden: { $ne: true } })
          .sort({ pinned: -1, order: 1, takenAt: -1 })
          .limit(limit)
          .lean(),
      ),
    instagramDefaults.slice(0, limit),
  ),
);

/** 스타일북 — DB 가 비면 네이버에서 수집한 기본 목록 */
export const getStyles = cache(() =>
  fromDb<Style[]>(
    "getStyles",
    async () => clean(await StyleModel.find({ hidden: { $ne: true } }).sort({ order: 1 }).lean()),
    styleDefaults,
  ),
);

/** 라우트별 SEO 덮어쓰기 (없으면 null → content/seo.ts 기본값) */
export const getSeoOverride = cache(async (route: string): Promise<SeoOverride | null> => {
  if (!process.env.MONGODB_URI) return null;
  try {
    await connectDB();
    return clean((await SeoModel.findOne({ route }).lean()) ?? null);
  } catch (err) {
    console.error(`[db] getSeoOverride(${route}) 실패`, err instanceof Error ? err.message : err);
    return null;
  }
});

/** 커스텀 페이지 — 공개된 것만 (어드민은 actions 에서 따로 읽는다) */
export const getCustomPage = cache(async (slug: string): Promise<CustomPage | null> => {
  if (!process.env.MONGODB_URI) return null;
  try {
    await connectDB();
    return clean((await CustomPageModel.findOne({ slug, published: true }).lean()) ?? null);
  } catch (err) {
    console.error(`[db] getCustomPage(${slug}) 실패`, err instanceof Error ? err.message : err);
    return null;
  }
});

export const getPublishedPages = cache(() =>
  fromDb<CustomPage[]>(
    "getPublishedPages",
    async () => clean(await CustomPageModel.find({ published: true }, { html: 0 }).sort({ updatedAt: -1 }).lean()),
    [],
  ),
);

export const getMedia = cache((limit = 200) =>
  fromDb<MediaItem[]>("getMedia", async () => clean(await MediaModel.find().sort({ createdAt: -1 }).limit(limit).lean()), []),
);
