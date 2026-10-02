import mongoose, { Schema, type Model } from "mongoose";
import { COLLECTIONS } from "./collections";

/*
 * 콘텐츠 구조는 types.ts 가 원본이다. 스키마는 인덱스·정렬 키만 엄격히 잡고
 * 나머지는 Mixed 로 둬서, 어드민을 붙이기 전까지 구조를 자유롭게 고칠 수 있게 한다.
 */
const opts = { timestamps: true, strict: false, minimize: false } as const;

// 타입 인자를 주지 않는다 — mongoose 제네릭이 tsc 를 메모리 부족으로 죽인다.
// 결과 타입은 queries.ts 에서 types.ts 기준으로 붙인다.
function model(name: string, schema: Schema, collection: string): Model<Record<string, unknown>> {
  return (mongoose.models[name] as Model<Record<string, unknown>>) ?? mongoose.model(name, schema, collection);
}

const ShopSchema = new Schema({ key: { type: String, default: "main", unique: true } }, opts);

const PageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: String,
    hero: Schema.Types.Mixed,
    sections: [Schema.Types.Mixed],
  },
  opts,
);

const ServiceSchema = new Schema(
  {
    tab: { type: String, required: true, index: true },
    heading: String,
    columns: [String],
    rows: [Schema.Types.Mixed],
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  opts,
);

const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    text: String,
    avatar: String,
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  opts,
);

const StaffSchema = new Schema(
  {
    name: { type: String, required: true },
    role: String,
    bio: [String],
    photo: String,
    order: { type: Number, default: 0 },
  },
  opts,
);

const PostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    thumbnail: String,
    body: String,
    category: String,
    publishedAt: { type: Date, index: true },
    published: { type: Boolean, default: true },
  },
  opts,
);

export const ShopModel = model("Shop", ShopSchema, COLLECTIONS.shop);
export const PageModel = model("Page", PageSchema, COLLECTIONS.pages);
export const ServiceModel = model("Service", ServiceSchema, COLLECTIONS.services);
export const TestimonialModel = model("Testimonial", TestimonialSchema, COLLECTIONS.testimonials);
export const StaffModel = model("Staff", StaffSchema, COLLECTIONS.staff);
export const PostModel = model("Post", PostSchema, COLLECTIONS.posts);

/** 공통 블록 — kind 별 한 문서 (values · cta) */
const BlockSchema = new Schema({ kind: { type: String, required: true, unique: true } }, opts);
export const BlockModel = model("Block", BlockSchema, COLLECTIONS.blocks);

/** 미리보기 초안 — expireAt 이 지나면 Mongo TTL 이 지운다 */
const DraftSchema = new Schema({ expireAt: { type: Date, index: { expires: 0 } } }, opts);
export const DraftModel = model("Draft", DraftSchema, COLLECTIONS.drafts);

/** 인스타그램 게시물 — 코드만 저장. source: manual(npm run ig 로 직접 등록) | seed */
const InstagramSchema = new Schema(
  {
    code: { type: String, required: true, unique: true },
    type: { type: String, enum: ["reel", "post"], default: "reel" },
    title: String, // 화면 제목(영어). 비면 caption 을 쓴다
    caption: String,
    takenAt: { type: Date, index: true },
    pinned: { type: Boolean, default: false },
    hidden: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    source: { type: String, default: "manual" },
    thumbnail: String, // R2 썸네일
  },
  opts,
);

export const InstagramModel = model("Instagram", InstagramSchema, COLLECTIONS.instagram);

/** 스타일북 — 네이버 플레이스 스타일 정보에서 시작, 어드민에서 추가·수정 */
const StyleSchema = new Schema(
  {
    num: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    category: String,
    titleEn: String,
    gender: { type: String, enum: ["f", "m"], default: "f" },
    images: [Schema.Types.Mixed],
    order: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
  },
  opts,
);

/** 라우트별 SEO 덮어쓰기 — 비어 있는 값은 src/content/seo.ts 기본값을 쓴다 */
const SeoSchema = new Schema(
  {
    route: { type: String, required: true, unique: true },
    title: String,
    description: String,
    ogTitle: String,
    ogSubtitle: String,
    ogImage: String,
  },
  opts,
);

/** 커스텀 페이지 — /p/[slug] */
const CustomPageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    heroImage: String,
    html: String,
    published: { type: Boolean, default: false },
    seo: Schema.Types.Mixed, // { title, description, ogImage }
  },
  opts,
);

/** 업로드한 이미지 (R2) */
const MediaSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    name: String,
    type: String,
    size: Number,
    width: Number,
    height: Number,
    alt: String,
    source: String, // 외부에서 옮겨 온 이미지의 원래 주소 (scripts/migrate-images.ts)
  },
  opts,
);

export const StyleModel = model("Style", StyleSchema, COLLECTIONS.styles);
export const SeoModel = model("Seo", SeoSchema, COLLECTIONS.seo);
export const CustomPageModel = model("CustomPage", CustomPageSchema, COLLECTIONS.customPages);
export const MediaModel = model("Media", MediaSchema, COLLECTIONS.media);
