"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { igPermalink } from "@/content/instagram";
import type { Style } from "@/content/styles";
import { BLOCKS } from "@/content/blocks";
import { shop as defaultShop } from "@/content/defaults";
import {
  BlockModel,
  CustomPageModel,
  DraftModel,
  InstagramModel,
  MediaModel,
  PageModel,
  SeoModel,
  ServiceModel,
  ShopModel,
  StaffModel,
  StyleModel,
  TestimonialModel,
} from "../models";
import { connectDB } from "../mongodb";
import { deleteObject, putObject, readR2Config } from "../r2";
import { sanitizeRichHtml } from "../sanitize";
import type { CustomPage, MediaItem, Page, Section, SeoOverride, Service, SharedBlocks, Shop, Staff, Testimonial } from "../types";
import { requireAdmin } from "./guard";
import { ADMIN_COOKIE, createSessionToken, passwordMatches, SESSION_DAYS } from "./session";

/*
 * 어드민 저장 — 모든 함수가 requireAdmin() 으로 시작한다 (middleware 와 이중 확인).
 * 공개 페이지는 force-dynamic 이라 저장 즉시 반영되지만, 라우트 캐시를 위해 revalidatePath 도 부른다.
 */
export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

async function run<T>(label: string, fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    await requireAdmin();
    if (!process.env.MONGODB_URI) return { ok: false, error: "MONGODB_URI 가 설정되지 않아 저장할 수 없습니다." };
    await connectDB();
    const data = await fn();
    revalidatePath("/", "layout");
    return { ok: true, data };
  } catch (err) {
    console.error(`[admin] ${label} 실패`, err);
    const msg = err instanceof Error ? err.message : "알 수 없는 오류";
    if (/E11000/.test(msg)) return { ok: false, error: "이미 사용 중인 값입니다 (주소·코드 중복)." };
    return { ok: false, error: msg };
  }
}

const str = (v: unknown, max = 5000) => (typeof v === "string" ? v.slice(0, max) : "");
const strip = <T extends object>(doc: T) => {
  const { _id, __v, createdAt, updatedAt, ...rest } = doc as Record<string, unknown>;
  void _id; void __v; void createdAt; void updatedAt;
  return rest as T;
};

/* ───────── 로그인 ───────── */

export async function loginAction(_prev: { error?: string } | undefined, form: FormData) {
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/admin");
  if (!(await passwordMatches(password))) {
    await new Promise((r) => setTimeout(r, 600)); // 무차별 대입을 늦춘다
    return { error: "비밀번호가 맞지 않습니다." };
  }
  const token = await createSessionToken();
  if (!token) return { error: "ADMIN_SECRET 이 설정되지 않았습니다 (16자 이상)." };
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

/* ───────── 매장 정보 · 페이지 문구 ───────── */

export async function saveShop(shop: Shop) {
  return run("saveShop", async () => {
    const clean = strip(shop);
    if (clean.map) {
      const { lat, lng, zoom } = clean.map;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("지도 좌표가 숫자가 아닙니다.");
      clean.map = { lat, lng, zoom: Math.min(21, Math.max(6, Math.round(zoom || 17))) };
    }
    // 메뉴 이름(nav)은 각 페이지 메뉴에서 고친다 — 매장 정보 화면이 들고 있던 옛 값으로 덮지 않게 DB 값을 유지
    const prev = (await ShopModel.findOne({ key: "main" }).lean()) as { nav?: Shop["nav"] } | null;
    await ShopModel.replaceOne({ key: "main" }, { key: "main", ...clean, nav: prev?.nav ?? clean.nav }, { upsert: true });
  });
}

export async function savePage(page: Page) {
  return run(`savePage(${page.slug})`, async () => {
    if (!page.slug) throw new Error("페이지 slug 가 없습니다.");
    await PageModel.replaceOne({ slug: page.slug }, strip(page), { upsert: true });
  });
}

/* ───────── 페이지 블록 ───────── */

/**
 * 블록 목록 검사. 섹션은 통째로 저장한다 — 필드를 골라 담으면 새로 추가한 필드가 저장 때 조용히 사라진다.
 */
function checkSections(sections: Section[]): Section[] {
  if (!Array.isArray(sections)) throw new Error("블록 목록이 올바르지 않습니다.");
  const seen = new Set<string>();
  return sections.map((s) => {
    if (!s?.key || !(s.kind in BLOCKS)) throw new Error(`알 수 없는 블록입니다: ${s?.kind}`);
    if (seen.has(s.key)) throw new Error(`블록 이름(key)이 겹칩니다: ${s.key}`);
    seen.add(s.key);
    return strip(s);
  });
}

/**
 * 페이지(히어로 + 블록 순서·내용) · 공통 블록(values · cta) · 이 페이지의 메뉴 이름을 한 번에 저장한다.
 * 메뉴 이름은 매장 정보 문서의 nav 에서 주소(href)가 같은 항목만 바꾼다.
 */
export async function savePageBlocks(input: { page: Page; shared: SharedBlocks; nav?: { href: string; label: string } }) {
  return run(`savePageBlocks(${input.page?.slug})`, async () => {
    const { page, shared } = input;
    if (!page?.slug) throw new Error("페이지 slug 가 없습니다.");
    const doc = { ...strip(page), sections: checkSections(page.sections), version: 2 };
    await PageModel.replaceOne({ slug: page.slug }, doc, { upsert: true });
    for (const kind of ["values", "cta"] as const) {
      const b = shared?.[kind];
      if (b) await BlockModel.replaceOne({ kind }, { ...strip(b), key: kind, kind }, { upsert: true });
    }
    if (input.nav?.href) {
      const label = str(input.nav.label, 40).trim();
      if (!label) throw new Error("메뉴 이름을 비울 수 없습니다.");
      const doc = (await ShopModel.findOne({ key: "main" }).lean()) as { nav?: Shop["nav"] } | null;
      const nav = (doc?.nav?.length ? doc.nav : defaultShop.nav).map((n) => (n.href === input.nav!.href ? { ...n, label } : n));
      await ShopModel.updateOne({ key: "main" }, { $set: { nav } }, { upsert: true });
    }
  });
}

/** 저장 전 미리보기 — 초안을 1시간 보관하고 id 를 돌려준다 (/preview/<slug>?d=<id>) */
export async function createPreview(input: { page: Page; shared: SharedBlocks }) {
  return run("createPreview", async () => {
    const doc = await DraftModel.create({
      page: { ...strip(input.page), sections: checkSections(input.page.sections), version: 2 },
      shared: input.shared,
      expireAt: new Date(Date.now() + 60 * 60 * 1000),
    });
    return { id: String(doc._id) };
  });
}

/* ───────── 목록형 (통째로 교체) ───────── */

async function replaceAll<T extends object>(model: typeof ServiceModel, rows: T[]) {
  await model.deleteMany({});
  if (rows.length) await model.insertMany(rows.map((r, i) => ({ ...strip(r), order: i + 1 })));
}

export async function saveServices(tables: Service[]) {
  return run("saveServices", () => replaceAll(ServiceModel, tables.map((t) => ({ ...t, published: true }))));
}

export async function saveTestimonials(items: Testimonial[]) {
  return run("saveTestimonials", () => replaceAll(TestimonialModel, items.map((t) => ({ ...t, published: true }))));
}

export async function saveStaff(items: Staff[]) {
  return run("saveStaff", () => replaceAll(StaffModel, items));
}

export async function saveStyles(items: Style[]) {
  return run("saveStyles", async () => {
    const seen = new Set<string>();
    for (const s of items) {
      if (!s.num) s.num = `s${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
      if (seen.has(s.num)) throw new Error(`스타일 번호 중복: ${s.num}`);
      seen.add(s.num);
    }
    await replaceAll(StyleModel, items);
  });
}

/* ───────── 인스타그램 ───────── */

type IgRow = {
  code: string;
  type: "reel" | "post";
  title: string;
  caption?: string;
  pinned?: boolean;
  hidden?: boolean;
  thumbnail?: string;
};

/** 인스타 썸네일을 받아 R2 에 올린다. R2 가 없거나 실패하면 빈 값 (사이트는 /api/ig 프록시로 보여준다) */
async function uploadIgThumbnail(code: string): Promise<string> {
  const r2 = readR2Config();
  if (!r2) return "";
  try {
    const res = await fetch(`https://www.instagram.com/p/${code}/media/?size=l`, { redirect: "follow", cache: "no-store" });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !type.startsWith("image/")) return "";
    return await putObject(r2, `instagram/${code}.jpg`, new Uint8Array(await res.arrayBuffer()), type);
  } catch (err) {
    console.error(`[admin] 인스타 썸네일 ${code} 실패`, err);
    return "";
  }
}

export async function saveInstagram(items: IgRow[]) {
  return run("saveInstagram", async () => {
    const now = Date.now();
    // 새로 추가한 게시물은 썸네일을 R2 에 올려 둔다 (인스타 CDN 주소는 만료된다)
    for (const it of items) if (!it.thumbnail) it.thumbnail = await uploadIgThumbnail(it.code);
    await InstagramModel.deleteMany({});
    if (items.length) {
      await InstagramModel.insertMany(
        items.map((it, i) => ({
          code: it.code,
          type: it.type,
          title: str(it.title, 200),
          caption: str(it.caption, 500),
          pinned: !!it.pinned,
          hidden: !!it.hidden,
          thumbnail: str(it.thumbnail, 500),
          order: i + 1,
          takenAt: new Date(now - i * 60000),
          source: "manual",
        })),
      );
    }
  });
}

/** 인스타 링크 → 코드. 화면에서 미리보기 전에 형식만 확인한다 */
export async function parseInstagramLink(url: string): Promise<ActionResult<IgRow>> {
  await requireAdmin();
  const m = url.match(/instagram\.com\/(?:[^/]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return { ok: false, error: "인스타그램 게시물 링크가 아닙니다. (예: https://www.instagram.com/reel/XXXX/)" };
  const row: IgRow = { code: m[2], type: m[1] === "p" ? "post" : "reel", title: "" };
  return { ok: true, data: { ...row, caption: igPermalink(row) } };
}

/* ───────── SEO ───────── */

export async function saveSeo(o: SeoOverride) {
  return run(`saveSeo(${o.route})`, async () => {
    const doc = {
      route: o.route,
      title: str(o.title, 120),
      description: str(o.description, 300),
      ogTitle: str(o.ogTitle, 60),
      ogSubtitle: str(o.ogSubtitle, 60),
      ogImage: str(o.ogImage, 500),
    };
    await SeoModel.replaceOne({ route: o.route }, doc, { upsert: true });
  });
}

/* ───────── 커스텀 페이지 ───────── */

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED = new Set(["admin", "api", "services", "salon", "about", "journal", "contact", "imprint", "post", "p"]);

export async function saveCustomPage(page: CustomPage & { _id?: string }) {
  return run("saveCustomPage", async () => {
    const slug = page.slug.trim().toLowerCase();
    if (!SLUG_RE.test(slug)) throw new Error("주소는 영문 소문자·숫자·하이픈(-)만 쓸 수 있습니다.");
    if (RESERVED.has(slug)) throw new Error(`"${slug}" 는 사이트에서 쓰는 주소라 사용할 수 없습니다.`);
    if (!page.title.trim()) throw new Error("제목을 입력하세요.");
    const doc = {
      slug,
      title: str(page.title, 120).trim(),
      heroImage: str(page.heroImage, 500),
      html: sanitizeRichHtml(str(page.html, 200_000)),
      published: !!page.published,
      seo: {
        title: str(page.seo?.title, 120),
        description: str(page.seo?.description, 300),
        ogImage: str(page.seo?.ogImage, 500),
      },
    };
    if (page._id) {
      await CustomPageModel.updateOne({ _id: page._id }, { $set: doc });
      return { id: page._id };
    }
    const created = await CustomPageModel.create(doc);
    return { id: String(created._id) };
  });
}

export async function deleteCustomPage(id: string) {
  return run("deleteCustomPage", async () => {
    await CustomPageModel.deleteOne({ _id: id });
  });
}

/* ───────── 미디어 ───────── */

/** 이미지 고르기 창이 부른다 */
export async function listMedia(): Promise<ActionResult<MediaItem[]>> {
  return run("listMedia", async () => JSON.parse(JSON.stringify(await MediaModel.find().sort({ createdAt: -1 }).limit(300).lean())) as MediaItem[]);
}

export async function registerMedia(item: MediaItem) {
  return run("registerMedia", async () => {
    const doc = await MediaModel.create({ ...strip(item), name: str(item.name, 200) });
    return JSON.parse(JSON.stringify(doc)) as MediaItem;
  });
}

export async function updateMediaAlt(id: string, alt: string) {
  return run("updateMediaAlt", async () => {
    await MediaModel.updateOne({ _id: id }, { $set: { alt: str(alt, 200) } });
  });
}

export async function deleteMedia(id: string) {
  return run("deleteMedia", async () => {
    const doc = (await MediaModel.findById(id).lean()) as { key?: string } | null;
    if (!doc) return;
    const r2 = readR2Config();
    if (r2 && doc.key) await deleteObject(r2, doc.key);
    await MediaModel.deleteOne({ _id: id });
  });
}
