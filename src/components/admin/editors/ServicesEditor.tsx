"use client";

import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import { saveServices } from "@/lib/admin/actions";
import type { PriceRow, Service } from "@/lib/types";
import { Button, Card, Field, Input, PageHeader, SaveBar, SortableList, Switch, useSaveable } from "../ui";

/**
 * 가격표 — 표 하나 = 탭 이름 + (소제목) + 가격 열 머리 + 행들.
 * 같은 탭 이름의 표들은 사이트에서 한 탭 안에 차례로 그려진다.
 */
export default function ServicesEditor({ initial }: { initial: Service[] }) {
  const { value: tables, setValue, dirty, saving, save, reset } = useSaveable<Service[]>(initial, saveServices);
  const setTable = (i: number, patch: Partial<Service>) => setValue((t) => t.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const tabs = Array.from(new Set(tables.map((t) => t.tab)));

  return (
    <>
      <PageHeader
        title="시술 · 가격"
        description={`탭: ${tabs.join(" · ") || "없음"} — 같은 탭 이름의 표는 한 탭 안에 순서대로 보입니다.`}
        actions={
          <Button
            variant="primary"
            onClick={() => setValue((t) => [...t, { tab: tabs[0] ?? "커트", columns: ["", "기본가"], rows: [{ label: "", prices: [""] }], order: t.length + 1 }])}
          >
            <Plus className="h-4 w-4" /> 표 추가
          </Button>
        }
      />
      <SortableList
        items={tables}
        getKey={(_, i) => `t${i}`}
        onChange={setValue}
        renderItem={(t, i, ctl) => (
          <Card
            title={
              <span className="flex items-center gap-2">
                <span {...ctl.handle} className="cursor-grab text-zinc-300 hover:text-zinc-600" title="끌어서 순서 바꾸기">
                  <GripVertical className="h-4 w-4" />
                </span>
                {t.tab}
                {t.heading ? ` · ${t.heading}` : ""}
              </span>
            }
            actions={
              <>
                <Button size="sm" variant="ghost" onClick={ctl.up} aria-label="위로">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={ctl.down} aria-label="아래로">
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="danger" onClick={() => confirm("이 표를 삭제할까요?") && setValue(tables.filter((_, j) => j !== i))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            }
          >
            <TableForm table={t} onChange={(patch) => setTable(i, patch)} />
          </Card>
        )}
      />
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  );
}

function TableForm({ table: t, onChange }: { table: Service; onChange: (patch: Partial<Service>) => void }) {
  const priceCols = Math.max(1, t.columns.length - 1);
  const setRow = (i: number, patch: Partial<PriceRow>) => onChange({ rows: t.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const setCols = (n: number) => {
    const cols = [t.columns[0] ?? "", ...Array.from({ length: n }, (_, k) => t.columns[k + 1] ?? "")];
    onChange({ columns: cols, rows: t.rows.map((r) => ({ ...r, prices: Array.from({ length: n }, (_, k) => r.prices[k] ?? "") })) });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="탭 이름" hint="커트 · 펌 · 염색 · 클리닉">
          <Input value={t.tab} onChange={(e) => onChange({ tab: e.target.value })} />
        </Field>
        <Field label="표 소제목 (선택)" hint="예: 열펌 · 매직">
          <Input value={t.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value || undefined })} />
        </Field>
        <Field label="가격 칸 수" hint="길이별로 나누려면 3 (숏·미디엄·롱)">
          <select className="admin-input" value={priceCols} onChange={(e) => setCols(Number(e.target.value))}>
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}칸
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-[13px]">
          <thead>
            <tr className="text-left text-zinc-500">
              <th className="pb-2 font-medium">시술명</th>
              {Array.from({ length: priceCols }, (_, k) => (
                <th key={k} className="w-32 pb-2 pl-2 font-medium">
                  <Input
                    className="h-8 py-1 text-[12px]"
                    placeholder="열 머리"
                    value={t.columns[k + 1] ?? ""}
                    onChange={(e) => onChange({ columns: t.columns.map((c, j) => (j === k + 1 ? e.target.value : c)) })}
                  />
                </th>
              ))}
              <th className="w-24 pb-2 pl-2 font-medium">각주</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {t.rows.map((r, i) => (
              <tr key={i} className="border-t border-zinc-100">
                <td className="py-1.5">
                  <Input value={r.label} onChange={(e) => setRow(i, { label: e.target.value })} placeholder={r.note ? "* 안내 문구" : "시술명"} />
                </td>
                {Array.from({ length: priceCols }, (_, k) => (
                  <td key={k} className="py-1.5 pl-2">
                    <Input
                      value={r.prices[k] ?? ""}
                      placeholder="60,000원"
                      onChange={(e) => setRow(i, { prices: Array.from({ length: priceCols }, (_, m) => (m === k ? e.target.value : r.prices[m] ?? "")) })}
                    />
                  </td>
                ))}
                <td className="py-1.5 pl-2">
                  <Switch checked={!!r.note} onChange={(v) => setRow(i, { note: v || undefined })} />
                </td>
                <td className="py-1.5 pl-1">
                  <Button size="sm" variant="ghost" onClick={() => onChange({ rows: t.rows.filter((_, j) => j !== i) })} aria-label="행 삭제">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button size="sm" onClick={() => onChange({ rows: [...t.rows, { label: "", prices: Array(priceCols).fill("") }] })}>
        <Plus className="h-4 w-4" /> 행 추가
      </Button>
    </div>
  );
}
