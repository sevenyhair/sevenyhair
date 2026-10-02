"use client";

import { GripVertical, MapPin, Plus, Trash2 } from "lucide-react";
import NaverMap from "@/components/NaverMap";
import { saveShop } from "@/lib/admin/actions";
import type { Shop } from "@/lib/types";
import { Button, Card, Field, Input, PageHeader, SaveBar, SortableList, Textarea, useSaveable } from "../ui";

const PAY_ICONS = [
  { value: "card", label: "카드" },
  { value: "cash", label: "현금" },
  { value: "zeropay", label: "제로페이" },
];

export default function ShopEditor({ initial }: { initial: Shop }) {
  const { value: s, setValue, dirty, saving, save, reset } = useSaveable<Shop>(initial, saveShop);
  const set = <K extends keyof Shop>(k: K, v: Shop[K]) => setValue((p) => ({ ...p, [k]: v }));
  const map = s.map ?? { lat: 35.2024218, lng: 129.0979297, zoom: 17 };

  return (
    <>
      <PageHeader title="매장 정보" description="푸터 · Contact · 검색엔진 매장 정보에 함께 쓰입니다." />
      <div className="space-y-6">
        <Card title="이름">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="이름" hint="좌측 세로 타이틀 앞부분">
              <Input value={s.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="뒷부분" hint="예: hair.">
              <Input value={s.nameSuffix} onChange={(e) => set("nameSuffix", e.target.value)} />
            </Field>
            <Field label="부제" hint="예: by Seveny">
              <Input value={s.byline} onChange={(e) => set("byline", e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card title="연락처 · 예약">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="전화번호">
              <Input
                value={s.phone}
                onChange={(e) => setValue((p) => ({ ...p, phone: e.target.value, phoneHref: `tel:${e.target.value.replace(/[^0-9+]/g, "")}` }))}
              />
            </Field>
            <Field label="예약 링크" hint="네이버 예약 주소">
              <Input value={s.bookingUrl} onChange={(e) => set("bookingUrl", e.target.value)} />
            </Field>
            <Field label="인스타그램 계정">
              <Input value={s.instagram.handle} onChange={(e) => set("instagram", { ...s.instagram, handle: e.target.value })} />
            </Field>
            <Field label="인스타그램 주소">
              <Input value={s.instagram.url} onChange={(e) => set("instagram", { ...s.instagram, url: e.target.value })} />
            </Field>
          </div>
        </Card>

        <Card title="주소 · 지도" description="좌표는 네이버 지도에서 장소를 우클릭 → '좌표 복사' 로 얻을 수 있습니다.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="주소">
              <Input value={s.address.street} onChange={(e) => set("address", { ...s.address, street: e.target.value })} />
            </Field>
            <Field label="찾아오는 길 한 줄" hint="예: 화목아파트 정문 앞">
              <Input value={s.address.zip} onChange={(e) => set("address", { ...s.address, zip: e.target.value })} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Field label="위도 (lat)">
              <Input type="number" step="0.0000001" value={map.lat} onChange={(e) => set("map", { ...map, lat: Number(e.target.value) })} />
            </Field>
            <Field label="경도 (lng)">
              <Input type="number" step="0.0000001" value={map.lng} onChange={(e) => set("map", { ...map, lng: Number(e.target.value) })} />
            </Field>
            <Field label="확대 수준" hint="6 (넓게) ~ 21 (가깝게)">
              <Input type="number" min={6} max={21} value={map.zoom} onChange={(e) => set("map", { ...map, zoom: Number(e.target.value) })} />
            </Field>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-zinc-200">
            {process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID ? (
              <NaverMap lat={map.lat} lng={map.lng} zoom={map.zoom} title="SEVENY HAIR" placeUrl={s.naverPlaceUrl ?? "#"} height={280} />
            ) : (
              <div className="flex items-center gap-2 bg-zinc-50 px-4 py-6 text-[13px] text-zinc-500">
                <MapPin className="h-4 w-4" />
                네이버 지도 키(NEXT_PUBLIC_NAVER_MAP_CLIENT_ID)를 넣으면 여기에 미리보기가 나옵니다.
              </div>
            )}
          </div>
        </Card>

        <Card
          title="영업시간"
          description="줄을 끌어서 순서를 바꿉니다. 시간 칸은 엔터로 여러 줄."
          actions={
            <Button size="sm" onClick={() => set("hours", [...s.hours, { days: "", lines: [""] }])}>
              <Plus className="h-4 w-4" /> 추가
            </Button>
          }
        >
          <SortableList
            items={s.hours}
            getKey={(_, i) => `h${i}`}
            onChange={(hours) => set("hours", hours)}
            renderItem={(h, i, ctl) => (
              <div className="flex items-start gap-2 rounded-xl border border-zinc-200 bg-white p-2">
                <span {...ctl.handle} className="cursor-grab p-2 text-zinc-300 hover:text-zinc-600" title="끌어서 순서 바꾸기">
                  <GripVertical className="h-4 w-4" />
                </span>
                <Input
                  className="w-28"
                  placeholder="요일"
                  value={h.days}
                  onChange={(e) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, days: e.target.value } : x)))}
                />
                <Textarea
                  className="min-h-0 flex-1"
                  rows={Math.max(1, h.lines.length)}
                  placeholder="10:00  –  20:00"
                  value={h.lines.join("\n")}
                  onChange={(e) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, lines: e.target.value.split("\n") } : x)))}
                />
                <Button size="sm" variant="ghost" onClick={() => set("hours", s.hours.filter((_, j) => j !== i))} aria-label="삭제">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          />
        </Card>

        <Card title="결제 · 하단 문구">
          <div className="space-y-2">
            {s.payments.map((p, i) => (
              <div key={i} className="flex gap-2">
                <select
                  className="admin-input w-36"
                  value={p.icon}
                  onChange={(e) => set("payments", s.payments.map((x, j) => (j === i ? { ...x, icon: e.target.value } : x)))}
                >
                  {PAY_ICONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label} 아이콘
                    </option>
                  ))}
                </select>
                <Input value={p.label} onChange={(e) => set("payments", s.payments.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
                <Button size="sm" variant="ghost" className="h-10" onClick={() => set("payments", s.payments.filter((_, j) => j !== i))} aria-label="삭제">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button size="sm" onClick={() => set("payments", [...s.payments, { label: "", icon: "card" }])}>
              <Plus className="h-4 w-4" /> 결제수단 추가
            </Button>
          </div>
          <div className="mt-5 grid gap-4">
            <Field label="결제 아래 안내 문구">
              <Input value={s.paymentNote} onChange={(e) => set("paymentNote", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="저작권 표시">
                <Input value={s.copyright} onChange={(e) => set("copyright", e.target.value)} />
              </Field>
              <Field label="오른쪽 아래 문구">
                <Input value={s.credit} onChange={(e) => set("credit", e.target.value)} />
              </Field>
            </div>
          </div>
        </Card>

        <Card title="메뉴 이름" description="주소는 고정이고 보이는 이름만 바뀝니다.">
          <div className="grid gap-3 sm:grid-cols-2">
            {s.nav.map((n, i) => (
              <Field key={n.href} label={n.href}>
                <Input value={n.label} onChange={(e) => set("nav", s.nav.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              </Field>
            ))}
          </div>
        </Card>
      </div>
      <SaveBar dirty={dirty} saving={saving} onSave={save} onReset={reset} />
    </>
  );
}
