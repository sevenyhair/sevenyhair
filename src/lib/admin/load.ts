import "server-only";
import { instagram as igDefaults } from "@/content/instagram";
import type { Style } from "@/content/styles";
import { InstagramModel, StyleModel } from "@/lib/models";
import { connectDB } from "@/lib/mongodb";
import { getStyles } from "@/lib/queries";

/**
 * 관리자 화면용 목록 — 사이트에서 숨긴 것까지 보여야 해서 DB 를 직접 읽는다 (비어 있거나 실패하면 기본값).
 * 공개 쪽 queries 는 숨긴 항목을 빼고 읽는다.
 */
async function readAll<T>(read: () => Promise<unknown[]>, fallback: () => T[] | Promise<T[]>): Promise<T[]> {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const rows = await read();
      if (rows.length) return JSON.parse(JSON.stringify(rows)) as T[];
    }
  } catch {
    /* 기본값으로 */
  }
  return fallback();
}

export const loadAllStyles = () => readAll<Style>(() => StyleModel.find().sort({ order: 1 }).lean(), getStyles);

export const loadAllInstagram = () =>
  readAll<(typeof igDefaults)[number]>(() => InstagramModel.find().sort({ pinned: -1, order: 1, takenAt: -1 }).lean(), () => igDefaults);
