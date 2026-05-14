'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Percent, Users, BarChart2 } from 'lucide-react';

// ── 타입 ──────────────────────────────────────────────
type Month = '2025-04' | '2025-03' | '2025-02' | '2025-01' | '2024-12' | '2024-11';

interface MonthlySales {
  month: Month;
  total: number;
  byCategory: Record<Category, number>;
  byCreator: { name: string; amount: number }[];
}

type Category = '브랜드딜' | '라이브커머스' | '콘텐츠광고' | '자체상품' | '협찬';

// ── 목업 데이터 ──────────────────────────────────────
const CATEGORY_META: Record<Category, { color: string; bg: string; desc: string }> = {
  '브랜드딜':    { color: '#6366f1', bg: 'bg-indigo-50 text-indigo-600', desc: '브랜드와 크리에이터 1:1 협업' },
  '라이브커머스': { color: '#8b5cf6', bg: 'bg-violet-50 text-violet-600', desc: '라이브 방송 연동 판매' },
  '콘텐츠광고':  { color: '#3b82f6', bg: 'bg-blue-50 text-blue-600',   desc: '피드·릴스·쇼츠 광고 삽입' },
  '자체상품':    { color: '#10b981', bg: 'bg-emerald-50 text-emerald-600', desc: '두호 자체 기획 상품' },
  '협찬':        { color: '#f59e0b', bg: 'bg-amber-50 text-amber-600',  desc: '제품 협찬·체험단' },
};

const MONTHLY: MonthlySales[] = [
  {
    month: '2025-04', total: 27480000,
    byCategory: { '브랜드딜': 13500000, '라이브커머스': 7920000, '콘텐츠광고': 3360000, '자체상품': 1580000, '협찬': 1120000 },
    byCreator: [
      { name: '하늘빛', amount: 8640000 }, { name: '별빛소녀', amount: 5910000 },
      { name: '루나스타', amount: 4020000 },   { name: '채리블', amount: 3270000 },
      { name: '민들레', amount: 1760000 }, { name: '그린위시', amount: 1490000 },
      { name: '소울비트', amount: 1300000 }, { name: '블루웨이브', amount: 1090000 },
    ],
  },
  {
    month: '2025-03', total: 20130000,
    byCategory: { '브랜드딜': 9740000, '라이브커머스': 5640000, '콘텐츠광고': 2730000, '자체상품': 1160000, '협찬': 860000 },
    byCreator: [
      { name: '하늘빛', amount: 8030000 }, { name: '별빛소녀', amount: 5380000 },
      { name: '루나스타', amount: 3570000 },   { name: '채리블', amount: 3150000 },
    ],
  },
  {
    month: '2025-02', total: 13940000,
    byCategory: { '브랜드딜': 6410000, '라이브커머스': 4000000, '콘텐츠광고': 2080000, '자체상품': 1030000, '협찬': 420000 },
    byCreator: [
      { name: '하늘빛', amount: 7250000 }, { name: '별빛소녀', amount: 5020000 },
      { name: '그린위시', amount: 1670000 },
    ],
  },
  {
    month: '2025-01', total: 12450000,
    byCategory: { '브랜드딜': 5680000, '라이브커머스': 3360000, '콘텐츠광고': 1890000, '자체상품': 890000, '협찬': 630000 },
    byCreator: [
      { name: '하늘빛', amount: 5880000 }, { name: '별빛소녀', amount: 4410000 },
      { name: '그린위시', amount: 2160000 },
    ],
  },
  {
    month: '2024-12', total: 16380000,
    byCategory: { '브랜드딜': 7560000, '라이브커머스': 4730000, '콘텐츠광고': 2310000, '자체상품': 1180000, '협찬': 600000 },
    byCreator: [
      { name: '하늘빛', amount: 7770000 }, { name: '별빛소녀', amount: 5360000 },
      { name: '그린위시', amount: 3250000 },
    ],
  },
  {
    month: '2024-11', total: 11540000,
    byCategory: { '브랜드딜': 5040000, '라이브커머스': 3260000, '콘텐츠광고': 1790000, '자체상품': 920000, '협찬': 530000 },
    byCreator: [
      { name: '하늘빛', amount: 5460000 }, { name: '별빛소녀', amount: 4100000 },
      { name: '그린위시', amount: 1980000 },
    ],
  },
];

const CATEGORIES = Object.keys(CATEGORY_META) as Category[];

// ── 헬퍼 ─────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000)     return `${(n / 10000).toFixed(0)}만`;
  return n.toLocaleString();
}

function pct(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

// ── 바 차트 (CSS) ─────────────────────────────────────
const BAR_MAX_HEIGHT = 140; // px
// 월별 그라데이션 컬러 팔레트 (11월→4월 순)
const BAR_COLORS = [
  '#4f46e5', // 11
  '#6366f1', // 12
  '#7c3aed', // 01
  '#8b5cf6', // 02
  '#a78bfa', // 03
  '#c4b5fd', // 04 (가장 최신 → 가장 밝게)
].reverse(); // 최신월이 앞에 오게 reverse

function MonthlyBarChart({ data, selected, onSelect }: {
  data: MonthlySales[];
  selected: Month;
  onSelect: (m: Month) => void;
}) {
  const sorted = [...data].reverse(); // 오래된 순 → 최신 순
  const maxTotal = Math.max(...sorted.map(d => d.total));
  return (
    <div className="flex items-end gap-3 h-[200px] px-2">
      {sorted.map((d, i) => {
        const h = maxTotal === 0 ? 4 : Math.max(8, Math.round((d.total / maxTotal) * BAR_MAX_HEIGHT));
        const isSelected = d.month === selected;
        const color = BAR_COLORS[i % BAR_COLORS.length];
        return (
          <div key={d.month} className="flex flex-col items-center gap-2 flex-1 cursor-pointer group"
            onClick={() => onSelect(d.month)}>
            {/* 금액 레이블 */}
            <span className="text-[11px] font-bold text-slate-700 opacity-90 group-hover:opacity-100 transition-opacity">
              {fmt(d.total)}
            </span>
            {/* 바 */}
            <div className="relative w-full flex items-end" style={{ height: `${BAR_MAX_HEIGHT}px` }}>
              <div
                style={{ height: `${h}px`, backgroundColor: color }}
                className={`w-full rounded-t-lg transition-all duration-200 ${isSelected ? 'brightness-110 ring-2 ring-white/30 ring-offset-1 ring-offset-transparent' : 'opacity-80 hover:opacity-100'}`}
              />
            </div>
            {/* 월 레이블 */}
            <span className={`text-[11px] font-semibold transition-colors ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
              {d.month.slice(5)}월
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── 카테고리 스택 바 ──────────────────────────────────
function StackBar({ byCategory, total }: { byCategory: Record<Category, number>; total: number }) {
  return (
    <div className="flex h-3 rounded-full overflow-hidden gap-px">
      {CATEGORIES.map(cat => (
        <div
          key={cat}
          style={{ width: `${pct(byCategory[cat], total)}%`, backgroundColor: CATEGORY_META[cat].color }}
          className="transition-all"
        />
      ))}
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────
export default function SalesPage() {
  const [selectedMonth, setSelectedMonth] = useState<Month>('2025-04');
  const current = MONTHLY.find(m => m.month === selectedMonth)!;
  const prevIdx = MONTHLY.findIndex(m => m.month === selectedMonth) + 1;
  const prev = MONTHLY[prevIdx];

  const growth = prev
    ? Math.round(((current.total - prev.total) / prev.total) * 100)
    : null;

  const commission = Math.round(current.total * 0.12);
  const net = current.total - commission;

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">매출 카테고리</h1>
        <p className="text-slate-400 text-sm">채널·유형별 매출 구성 및 추이</p>
      </div>

      {/* 월별 바 차트 + 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* 바 차트 */}
        <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm font-semibold text-slate-900">월별 매출 추이</p>
            <p className="text-[11px] text-slate-400">바를 클릭하면 해당 월 상세 조회</p>
          </div>
          <MonthlyBarChart data={MONTHLY} selected={selectedMonth} onSelect={setSelectedMonth} />
        </div>

        {/* 이번달 요약 */}
        <div className="flex flex-col gap-3">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign size={13} className="text-indigo-400" />
              <p className="text-xs text-slate-400 font-medium">총 매출 ({selectedMonth})</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-1">₩{current.total.toLocaleString()}</p>
            {growth !== null && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${growth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {growth >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                전월 대비 {growth >= 0 ? '+' : ''}{growth}%
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Percent size={13} className="text-violet-400" />
              <p className="text-xs text-slate-400 font-medium">수수료 수입</p>
            </div>
            <p className="text-xl font-bold text-violet-600">₩{commission.toLocaleString()}</p>
            <p className="text-slate-400 text-[11px] mt-1">평균 12% 기준</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <Users size={13} className="text-emerald-400" />
              <p className="text-xs text-slate-400 font-medium">크리에이터 지급액</p>
            </div>
            <p className="text-xl font-bold text-emerald-600">₩{net.toLocaleString()}</p>
            <p className="text-slate-400 text-[11px] mt-1">수수료 차감 후</p>
          </div>
        </div>
      </div>

      {/* 카테고리별 분석 */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 카테고리 상세 */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <BarChart2 size={14} className="text-indigo-400" />
            <p className="text-sm font-semibold text-slate-900">카테고리별 매출</p>
          </div>

          {/* 스택 바 */}
          <StackBar byCategory={current.byCategory} total={current.total} />

          {/* 범례 */}
          <div className="mt-2 mb-5 flex flex-wrap gap-3">
            {CATEGORIES.map(cat => (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_META[cat].color }} />
                <span className="text-[11px] text-slate-400">{cat}</span>
              </div>
            ))}
          </div>

          {/* 테이블 */}
          <div className="flex flex-col gap-3">
            {CATEGORIES
              .sort((a, b) => current.byCategory[b] - current.byCategory[a])
              .map(cat => {
                const amount = current.byCategory[cat];
                const ratio = pct(amount, current.total);
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_META[cat].bg}`}>{cat}</span>
                        <span className="text-[11px] text-slate-400">{CATEGORY_META[cat].desc}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">₩{amount.toLocaleString()}</span>
                        <span className="text-[11px] text-slate-400 w-8 text-right">{ratio}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${ratio}%`, backgroundColor: CATEGORY_META[cat].color }}
                        className="h-full rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 크리에이터별 매출 */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users size={14} className="text-indigo-400" />
            <p className="text-sm font-semibold text-slate-900">크리에이터별 매출</p>
          </div>
          <div className="flex flex-col gap-3">
            {current.byCreator
              .sort((a, b) => b.amount - a.amount)
              .map((c, i) => {
                const ratio = pct(c.amount, current.total);
                const colors = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];
                const color = colors[i % colors.length];
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-500 w-4">{i + 1}</span>
                        <span className="text-sm font-semibold text-slate-900">{c.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">₩{c.amount.toLocaleString()}</span>
                        <span className="text-[11px] text-slate-400 w-8 text-right">{ratio}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${ratio}%`, backgroundColor: color }}
                        className="h-full rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* 집중도 경고 */}
          {(() => {
            const top = current.byCreator[0];
            const topRatio = top ? pct(top.amount, current.total) : 0;
            if (topRatio >= 50) {
              return (
                <div className="mt-5 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2.5">
                  <span className="text-amber-400 text-[11px] font-semibold">⚠ 집중도 주의</span>
                  <span className="text-amber-300/70 text-[11px]">{top.name}이 전체의 {topRatio}% 차지 — 분산 필요</span>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </div>

      {/* 6개월 카테고리 트렌드 테이블 */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <p className="text-sm font-semibold text-slate-900 mb-5">카테고리 월별 추이</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left pb-3 text-xs text-slate-400 font-semibold w-28">카테고리</th>
                {[...MONTHLY].reverse().map(m => (
                  <th key={m.month} className={`text-right pb-3 text-xs font-semibold ${m.month === selectedMonth ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {m.month.slice(5)}월
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {CATEGORIES.map(cat => (
                <tr key={cat} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CATEGORY_META[cat].bg}`}>{cat}</span>
                  </td>
                  {[...MONTHLY].reverse().map(m => (
                    <td key={m.month} className={`py-3 text-right text-xs font-medium ${m.month === selectedMonth ? 'text-slate-900' : 'text-slate-400'}`}>
                      ₩{fmt(m.byCategory[cat])}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="border-t border-white/10">
                <td className="py-3 text-xs font-bold text-slate-300">합계</td>
                {[...MONTHLY].reverse().map(m => (
                  <td key={m.month} className={`py-3 text-right text-xs font-bold ${m.month === selectedMonth ? 'text-indigo-600' : 'text-slate-300'}`}>
                    ₩{fmt(m.total)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
