/**
 * 외부에 링크해 둔 이미지를 R2(img.sevenyhair.com)로 옮긴다.
 *
 *   npm run images:migrate -- --dry-run   # 옮길 목록만 본다
 *   npm run images:migrate                # 실제로 옮긴다
 *
 * 1. DB(pages · testimonials · staff · styles)와 콘텐츠 파일(photos.ts · styles.ts · defaults.ts)에서
 *    R2_PUBLIC_BASE_URL 이 아닌 이미지 주소를 모은다
 * 2. 내려받아 긴 변 2400px · JPEG 82(투명 PNG 는 WebP)로 줄여 R2 에 올린다
 * 3. media 컬렉션에 등록하고(source = 원래 주소), DB 문서와 콘텐츠 파일의 주소를 새 주소로 바꾼다
 * 4. 인스타그램 게시물마다 썸네일을 받아 instagram/<code>.jpg 로 올리고 thumbnail 필드에 넣는다
 *
 * 같은 원본(source)은 media 에서 찾아 재사용하므로 여러 번 돌려도 중복 업로드되지 않는다.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import mongoose from "mongoose";
import sharp from "sharp";

const DRY = process.argv.includes("--dry-run");
const DB = "seveny";
const env = (k: string) => {
  const v = process.env[k]?.trim();
  if (!v) throw new Error(`${k} 가 없습니다 (.env.local)`);
  return v;
};

const MONGODB_URI = env("MONGODB_URI");
const R2 = {
  accountId: env("R2_ACCOUNT_ID"),
  accessKeyId: env("R2_ACCESS_KEY_ID"),
  secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
  bucket: env("R2_BUCKET_NAME"),
  base: env("R2_PUBLIC_BASE_URL").replace(/\/$/, ""),
};
const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2.accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: R2.accessKeyId, secretAccessKey: R2.secretAccessKey },
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const CONTENT_FILES = ["src/content/photos.ts", "src/content/styles.ts", "src/content/defaults.ts"];
// 주소는 따옴표·공백까지 통째로 읽고 확장자는 따로 검사한다 (….jpeg.jpg 를 중간에서 끊지 않도록)
const URL_RE = /https?:\/\/[^\s"'`)]+/g;
const isImageUrl = (u: string) => /\.(?:jpe?g|png|webp|gif)(?:\?.*)?$/i.test(u);

/** 사이트 이미지로 쓰는 외부 주소인가 (이미 R2 면 제외) */
const isForeign = (u: string) => /^https?:\/\//.test(u) && !u.startsWith(R2.base) && /pstatic\.net|website-files|cdninstagram/.test(u);

function collectStrings(v: unknown, out: Set<string>) {
  if (typeof v === "string") {
    if (isForeign(v)) out.add(v);
  } else if (Array.isArray(v)) v.forEach((x) => collectStrings(x, out));
  else if (v && typeof v === "object") Object.values(v).forEach((x) => collectStrings(x, out));
}

function replaceStrings<T>(v: T, map: Map<string, string>): T {
  if (typeof v === "string") return (map.get(v) ?? v) as T;
  if (Array.isArray(v)) return v.map((x) => replaceStrings(x, map)) as T;
  if (v && typeof v === "object" && !(v instanceof Date) && !(v instanceof mongoose.Types.ObjectId)) {
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, replaceStrings(x, map)])) as T;
  }
  return v;
}

/** 저장 키: site/<원래 파일 이름>-<해시 8자>.jpg */
function keyFor(url: string, ext: string, prefix = "site") {
  const name = decodeURIComponent(url.split("?")[0].split("/").pop() ?? "image")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "_")
    .slice(0, 50);
  const hash = createHash("sha1").update(url).digest("hex").slice(0, 8);
  return `${prefix}/${name}-${hash}.${ext}`;
}

async function optimize(buf: Buffer): Promise<{ body: Buffer; type: string; ext: string; width: number; height: number }> {
  const img = sharp(buf, { failOn: "none" }).rotate();
  const meta = await img.metadata();
  const resized = img.resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
  if (meta.hasAlpha) {
    const { data, info } = await resized.webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
    return { body: data, type: "image/webp", ext: "webp", width: info.width, height: info.height };
  }
  const { data, info } = await resized.jpeg({ quality: 82, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  return { body: data, type: "image/jpeg", ext: "jpg", width: info.width, height: info.height };
}

async function upload(key: string, body: Buffer, type: string) {
  await s3.send(
    new PutObjectCommand({
      Bucket: R2.bucket,
      Key: key,
      Body: body,
      ContentType: type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return `${R2.base}/${key}`;
}

async function fetchBuf(url: string): Promise<Buffer> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (seveny-hair migrate)" }, redirect: "follow" });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

await mongoose.connect(MONGODB_URI, { dbName: DB, serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection.db!;
const media = db.collection("media");

// 1. 모으기
const found = new Set<string>();
const COLS = ["pages", "testimonials", "staff", "styles", "shop", "seo", "custompages"];
for (const c of COLS) for (const doc of await db.collection(c).find().toArray()) collectStrings(doc, found);
for (const f of CONTENT_FILES) for (const m of readFileSync(f, "utf8").matchAll(URL_RE)) if (isImageUrl(m[0]) && isForeign(m[0])) found.add(m[0]);
const igDocs = await db.collection("instagram").find({ thumbnail: { $in: [null, ""] } }).toArray();
console.log(`[migrate] 옮길 이미지 ${found.size}개 · 인스타 썸네일 ${igDocs.length}개${DRY ? " (dry-run)" : ""}`);
if (DRY) {
  [...found].slice(0, 80).forEach((u) => console.log("  ", u));
  await mongoose.disconnect();
  process.exit(0);
}

// 2~3. 올리기
const map = new Map<string, string>();
let n = 0;
for (const url of found) {
  n++;
  const existing = await media.findOne({ source: url });
  if (existing) {
    map.set(url, existing.url as string);
    continue;
  }
  try {
    const out = await optimize(await fetchBuf(url));
    const key = keyFor(url, out.ext);
    const newUrl = await upload(key, out.body, out.type);
    await media.insertOne({
      key,
      url: newUrl,
      name: key.split("/").pop(),
      type: out.type,
      size: out.body.length,
      width: out.width,
      height: out.height,
      alt: "",
      source: url,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    map.set(url, newUrl);
    console.log(`[migrate] ${n}/${found.size} ${Math.round(out.body.length / 1024)}KB ${out.width}×${out.height} → ${key}`);
  } catch (err) {
    console.error(`[migrate] 실패 ${url}`, err instanceof Error ? err.message : err);
  }
}

// DB 문서 주소 바꾸기
for (const c of COLS) {
  const col = db.collection(c);
  for (const doc of await col.find().toArray()) {
    const next = replaceStrings(doc, map);
    if (JSON.stringify(next) !== JSON.stringify(doc)) {
      await col.replaceOne({ _id: doc._id }, next);
      console.log(`[migrate] DB ${c} ${doc.slug ?? doc.key ?? doc.num ?? doc._id} 주소 교체`);
    }
  }
}

// 콘텐츠 파일 주소 바꾸기 (DB 가 비었을 때의 기본값도 R2 를 쓰게)
for (const f of CONTENT_FILES) {
  let text = readFileSync(f, "utf8");
  let changed = 0;
  for (const [from, to] of map) {
    if (text.includes(from)) {
      text = text.split(from).join(to);
      changed++;
    }
  }
  if (changed) {
    writeFileSync(f, text);
    console.log(`[migrate] 파일 ${f} 주소 ${changed}개 교체`);
  }
}

// 4. 인스타 썸네일
for (const ig of igDocs) {
  try {
    const out = await optimize(await fetchBuf(`https://www.instagram.com/p/${ig.code}/media/?size=l`));
    const key = `instagram/${ig.code}.${out.ext}`;
    const url = await upload(key, out.body, out.type);
    await db.collection("instagram").updateOne({ _id: ig._id }, { $set: { thumbnail: url } });
    console.log(`[migrate] 인스타 ${ig.code} → ${key}`);
  } catch (err) {
    console.error(`[migrate] 인스타 실패 ${ig.code}`, err instanceof Error ? err.message : err);
  }
}

console.log(`[migrate] 완료 — 이미지 ${map.size}/${found.size}, 인스타 ${igDocs.length}`);
await mongoose.disconnect();
