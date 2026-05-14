'use client';

import { useState } from 'react';
import { TrendingUp, Users, Tag, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// ── 목업 데이터 ──
const gmvData = [
  { date: '05/08', gmv: 3870000, sales: 294, monthly: 35600000 },
  { date: '05/09', gmv: 4130000, sales: 318, monthly: 39730000 },
  { date: '05/10', gmv: 5420000, sales: 413, monthly: 45150000 },
  { date: '05/11', gmv: 4880000, sales: 371, monthly: 50030000 },
  { date: '05/12', gmv: 6050000, sales: 462, monthly: 56080000 },
  { date: '05/13', gmv: 5730000, sales: 438, monthly: 61810000 },
  { date: '05/14', gmv: 5170000, sales: 396, monthly: 66980000 },
];

const creatorData = [
  { date: '05/08', gmv: 1650000, sales: 122, monthly: 15300000 },
  { date: '05/09', gmv: 1820000, sales: 138, monthly: 17120000 },
  { date: '05/10', gmv: 2380000, sales: 182, monthly: 19500000 },
  { date: '05/11', gmv: 2110000, sales: 161, monthly: 21610000 },
  { date: '05/12', gmv: 2640000, sales: 207, monthly: 24250000 },
  { date: '05/13', gmv: 2490000, sales: 193, monthly: 26740000 },
  { date: '05/14', gmv: 2250000, sales: 171, monthly: 28990000 },
];

const brandData = [
  { date: '05/08', gmv: 2220000, sales: 172, monthly: 20300000 },
  { date: '05/09', gmv: 2310000, sales: 180, monthly: 22610000 },
  { date: '05/10', gmv: 3040000, sales: 231, monthly: 25650000 },
  { date: '05/11', gmv: 2770000, sales: 210, monthly: 28420000 },
  { date: '05/12', gmv: 3410000, sales: 255, monthly: 31830000 },
  { date: '05/13', gmv: 3240000, sales: 245, monthly: 35070000 },
  { date: '05/14', gmv: 2920000, sales: 225, monthly: 37990000 },
];

const inflowData = [
  { channel: '인스타그램', count: 4821, ratio: 38.2 },
  { channel: '유튜브', count: 3102, ratio: 24.6 },
  { channel: '틱톡', count: 2187, ratio: 17.3 },
  { channel: '카카오', count: 1543, ratio: 12.2 },
  { channel: '기타', count: 962, ratio: 7.6 },
];

const memberData = [
  { date: '05/08', join: 142, leave: 23, total: 48210 },
  { date: '05/09', join: 118, leave: 19, total: 48309 },
  { date: '05/10', join: 203, leave: 31, total: 48481 },
  { date: '05/11', join: 187, leave: 28, total: 48640 },
  { date: '05/12', join: 256, leave: 42, total: 48854 },
  { date: '05/13', join: 231, leave: 35, total: 49050 },
  { date: '05/14', join: 198, leave: 29, total: 49219 },
];

const fmt = (n: number) =>
  n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

const fmtWon = (n: number) =>
  n >= 100000000 ? `${(n / 100000000).toFixed(1)}억` : `${(n / 10000).toFixed(0)}만`;

type TabKey = 'gmv' | 'creator' | 'brand';

export default function DashboardPage() {
  const [salesTab, setSalesTab] = useState<TabKey>('gmv');

  const salesMap: Record<TabKey, typeof gmvData> = {
    gmv: gmvData,
    creator: creatorData,
    brand: brandData,
  };

  const salesLabels: Record<TabKey, { label: string; icon: React.ReactNode; color: string }> = {
    gmv: { label: 'GMV', icon: <TrendingUp size={14} />, color: 'indigo' },
    creator: { label: '크리에이터', icon: <Users size={14} />, color: 'violet' },
    brand: { label: '브랜드', icon: <Tag size={14} />, color: 'blue' },
  };

  const currentData = salesMap[salesTab];
  const today = currentData[currentData.length - 1];
  const yesterday = currentData[currentData.length - 2];
  const growthRate = (((today.gmv - yesterday.gmv) / yesterday.gmv) * 100).toFixed(1);
  const isUp = today.gmv >= yesterday.gmv;

  return (
    <div className="p-10">
      <div className="mb-7">
        <h1 className="text-[22px] font-bold">메인 대시보드</h1>
        <p className="text-sm text-slate-400 mt-1">오늘 기준 주요 지표를 확인합니다.</p>
      </div>

      {/* ── 매출 섹션 ── */}
      <SectionTitle>📊 매출</SectionTitle>

      {/* 탭 */}
      <div className="flex gap-2 mb-4">
        {(Object.keys(salesLabels) as TabKey[]).map((k) => (
          <button
            key={k}
            onClick={() => setSalesTab(k)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              salesTab === k
                ? 'bg-indigo-500 text-white'
                : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {salesLabels[k].icon}
            {salesLabels[k].label}
          </button>
        ))}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <SummaryCard
          label="오늘 GMV"
          value={`₩${fmtWon(today.gmv)}`}
          sub={`${isUp ? '+' : ''}${growthRate}% 어제 대비`}
          up={isUp}
        />
        <SummaryCard
          label="오늘 판매량"
          value={`${today.sales.toLocaleString()}건`}
          sub={`어제 ${yesterday.sales.toLocaleString()}건`}
          up={today.sales >= yesterday.sales}
        />
        <SummaryCard
          label="월 합산 GMV"
          value={`₩${fmtWon(today.monthly)}`}
          sub="이번 달 누적"
          up={true}
          noArrow
        />
      </div>

      {/* 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <Th>일자</Th>
              <Th>GMV</Th>
              <Th>판매량</Th>
              <Th>월 합산값</Th>
            </tr>
          </thead>
          <tbody>
            {[...currentData].reverse().map((row) => (
              <tr key={row.date} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                <Td>{row.date}</Td>
                <Td><span className="font-semibold">₩{fmtWon(row.gmv)}</span></Td>
                <Td>{row.sales.toLocaleString()}건</Td>
                <Td className="text-indigo-500 font-semibold">₩{fmtWon(row.monthly)}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── 데이터 섹션 ── */}
      <SectionTitle>📈 데이터</SectionTitle>

      <div className="grid grid-cols-2 gap-6">
        {/* 유입율 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-700">유입율</p>
            <p className="text-xs text-slate-400 mt-0.5">채널별 유입 현황</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <Th>채널</Th>
                <Th>건수</Th>
                <Th>비율</Th>
              </tr>
            </thead>
            <tbody>
              {inflowData.map((row) => (
                <tr key={row.channel} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      {row.channel}
                    </div>
                  </Td>
                  <Td>{row.count.toLocaleString()}</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-[80px]">
                        <div
                          className="bg-indigo-400 h-1.5 rounded-full"
                          style={{ width: `${row.ratio}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{row.ratio}%</span>
                    </div>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 회원 */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-700">회원</p>
            <p className="text-xs text-slate-400 mt-0.5">일별 가입/탈퇴 현황</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <Th>일자</Th>
                <Th>가입수</Th>
                <Th>탈퇴수</Th>
                <Th>총합</Th>
              </tr>
            </thead>
            <tbody>
              {[...memberData].reverse().map((row) => (
                <tr key={row.date} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <Td>{row.date}</Td>
                  <Td><span className="text-emerald-600 font-semibold">+{row.join}</span></Td>
                  <Td><span className="text-rose-400 font-semibold">-{row.leave}</span></Td>
                  <Td><span className="font-bold">{row.total.toLocaleString()}</span></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ── 공용 컴포넌트 ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-[15px] font-bold text-slate-700 mb-4">{children}</h2>;
}

function SummaryCard({
  label, value, sub, up, noArrow,
}: {
  label: string; value: string; sub: string; up: boolean; noArrow?: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
      <p className="text-xs text-slate-400 font-semibold mb-2">{label}</p>
      <p className="text-2xl font-bold mb-1.5">{value}</p>
      <p className={`text-xs font-semibold flex items-center gap-0.5 ${noArrow ? 'text-slate-400' : up ? 'text-emerald-500' : 'text-rose-400'}`}>
        {!noArrow && (up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />)}
        {sub}
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={`px-4 py-3 text-sm text-slate-600 ${className ?? ''}`}>
      {children}
    </td>
  );
}
