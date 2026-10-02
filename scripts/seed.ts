/**
 * 기본 콘텐츠를 seveny DB 에 넣는다. 컬렉션마다 비우고 다시 채운다.
 *
 *   npm run seed            # 비어 있는 컬렉션만 채운다
 *   npm run seed -- --force # 전부 지우고 다시 채운다
 *
 * Node 22 의 --experimental-strip-types 로 실행한다 (package.json 참고).
 */
import mongoose from "mongoose";
import { homePage, shop, testimonials } from "../src/content/defaults.ts";
import { pages, posts, services, staff } from "../src/content/pages.ts";
import { instagram } from "../src/content/instagram.ts";
import { styles } from "../src/content/styles.ts";

const DB = "seveny"; // src/lib/mongodb.ts 의 MONGODB_DB 와 같아야 한다
const force = process.argv.includes("--force");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI 가 없습니다. .env.local 을 확인하세요.");
  process.exit(1);
}

const now = new Date();
const stamp = <T extends object>(d: T) => ({ ...d, createdAt: now, updatedAt: now });

// posts 처럼 비어 있는 목록은 insertMany 가 실패하므로 건너뛴다
const data: Record<string, object[]> = {
  shop: [stamp({ key: "main", ...shop })],
  pages: [homePage, ...Object.values(pages)].map(stamp),
  services: services.map((s) => stamp({ ...s, published: true })),
  testimonials: testimonials.map((t) => stamp({ ...t, published: true })),
  staff: staff.map(stamp),
  posts: posts.map((p) => stamp({ ...p, publishedAt: new Date(p.publishedAt), published: true })),
  // 수집 시점 순서를 지키려고 takenAt 을 1분씩 줄인다 (자동 수집이 들어오면 실제 시각으로 바뀐다)
  styles: styles.map((x) => stamp({ ...x, hidden: false })),
  instagram: instagram.map((g, i) => stamp({ ...g, takenAt: new Date(now.getTime() - i * 60000), hidden: false, source: "seed" })),
};

await mongoose.connect(uri, { dbName: DB, serverSelectionTimeoutMS: 10000 });
const db = mongoose.connection.db!;
console.log(`[seed] ${DB} 에 연결`);

for (const [name, docs] of Object.entries(data)) {
  const col = db.collection(name);
  const count = await col.countDocuments();
  if (count > 0 && !force) {
    console.log(`[seed] ${name}: ${count}건 있음 — 건너뜀 (--force 로 덮어쓰기)`);
    continue;
  }
  if (docs.length === 0) {
    console.log(`[seed] ${name}: 기본 데이터 없음 — 건너뜀`);
    continue;
  }
  if (count > 0) await col.deleteMany({});
  await col.insertMany(docs);
  console.log(`[seed] ${name}: ${docs.length}건 넣음`);
}

await db.collection("pages").createIndex({ slug: 1 }, { unique: true });
await db.collection("posts").createIndex({ slug: 1 }, { unique: true });
await db.collection("posts").createIndex({ publishedAt: -1 });
await db.collection("services").createIndex({ tab: 1, order: 1 });
await db.collection("instagram").createIndex({ code: 1 }, { unique: true });
await db.collection("styles").createIndex({ num: 1 }, { unique: true });
await db.collection("seo").createIndex({ route: 1 }, { unique: true });
await db.collection("custompages").createIndex({ slug: 1 }, { unique: true });
await db.collection("media").createIndex({ key: 1 }, { unique: true });
await db.collection("instagram").createIndex({ pinned: -1, takenAt: -1 });

await mongoose.disconnect();
console.log("[seed] 완료");
