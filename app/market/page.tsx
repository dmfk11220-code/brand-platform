'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

// ── 타입 ──────────────────────────────────────────────────────
type ContractType = 'RS' | 'RS+MG' | 'MG';
type DealStatus = '진행 완료' | '진행 중' | '작업 중' | '상품 세팅' | '컨택 중';
type SalesChannel = '브랜드몰' | '자사몰' | '타 플랫폼';

interface Deal {
  id: string;
  month: string;         // 'YYMM'
  manager: string;
  brand: string;
  creator: string;
  contract: ContractType;
  channel: SalesChannel;
  startDate: string;
  endDate: string;
  status: DealStatus;
  revenue: number | null;   // 거래액 (VAT 포함)
  rsRate: number | null;    // RS율 (0.2 = 20%)
  dhRatio: number;          // DH 분배 비율 (3 → 30%)
  crRatio: number;          // 크리에이터 분배 비율 (7 → 70%)
  mgTotal: number | null;   // MG 총 진행 비용
  crPaid: number | null;    // 크리에이터 실정산액
  dhProfit: number | null;  // DH 순이익
}

// ── 실제 데이터 (2604, 2605 시트 기반) ──────────────────────
const deals: Deal[] = [
  // ── 2605 (5월) ──
  { id: 'd2605-01', month: '2605', manager: '배정은', brand: '뉴치트', creator: '워니', contract: 'RS', channel: '브랜드몰', startDate: '2026.04.27', endDate: '2026.05.01', status: '진행 완료', revenue: 18719100, rsRate: 0.20, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: 2382431, dhProfit: 971042 },
  { id: 'd2605-02', month: '2605', manager: '배정은', brand: '셀올로지', creator: '다빈', contract: 'RS', channel: '자사몰', startDate: '2026.04.23', endDate: '2026.04.26', status: '진행 완료', revenue: null, rsRate: 0.40, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: null, dhProfit: null },
  { id: 'd2605-03', month: '2605', manager: '김봄', brand: '그린몬스터', creator: '채도', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.05.12', endDate: '2026.05.15', status: '작업 중', revenue: null, rsRate: 0.30, dhRatio: 2, crRatio: 8, mgTotal: 4000000, crPaid: 3200000, dhProfit: 800000 },
  { id: 'd2605-04', month: '2605', manager: '이유나', brand: '보바', creator: '리비', contract: 'RS+MG', channel: '자사몰', startDate: '2026.05.18', endDate: '2026.05.21', status: '컨택 중', revenue: null, rsRate: 0.25, dhRatio: 3, crRatio: 7, mgTotal: 6000000, crPaid: 4200000, dhProfit: 1800000 },
  { id: 'd2605-05', month: '2605', manager: '이유나', brand: '오하입', creator: '디씨즈마테', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.05.18', endDate: '2026.05.21', status: '작업 중', revenue: null, rsRate: null, dhRatio: 3, crRatio: 7, mgTotal: 2000000, crPaid: 1400000, dhProfit: 600000 },
  { id: 'd2605-06', month: '2605', manager: '김하늘', brand: '플라이밀', creator: '승진', contract: 'RS', channel: '브랜드몰', startDate: '2026.05.21', endDate: '2026.05.24', status: '작업 중', revenue: null, rsRate: 0.25, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: null, dhProfit: null },
  { id: 'd2605-07', month: '2605', manager: '김하늘', brand: '싸이언티픽', creator: '다빈', contract: 'RS', channel: '브랜드몰', startDate: '2026.05.19', endDate: '2026.05.24', status: '컨택 중', revenue: null, rsRate: null, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: null, dhProfit: null },
  { id: 'd2605-08', month: '2605', manager: '김하늘', brand: '채우닭', creator: '승진', contract: 'RS', channel: '브랜드몰', startDate: '2026.05.12', endDate: '2026.05.14', status: '진행 중', revenue: null, rsRate: 0.17, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: null, dhProfit: null },
  { id: 'd2605-09', month: '2605', manager: '이유나', brand: '비비안', creator: '신혜림', contract: 'RS', channel: '자사몰', startDate: '2026.05.11', endDate: '2026.05.15', status: '상품 세팅', revenue: null, rsRate: null, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: null, dhProfit: null },
  { id: 'd2605-10', month: '2605', manager: '김봄', brand: '휙', creator: '너큐', contract: 'RS', channel: '자사몰', startDate: '2026.05.20', endDate: '2026.05.24', status: '컨택 중', revenue: null, rsRate: 0.30, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: null, dhProfit: null },
  { id: 'd2605-11', month: '2605', manager: '이유나', brand: '로얄캐네디언', creator: '예아', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.05.29', endDate: '2026.06.05', status: '컨택 중', revenue: null, rsRate: null, dhRatio: 3, crRatio: 7, mgTotal: 1000000, crPaid: 700000, dhProfit: 300000 },
  { id: 'd2605-12', month: '2605', manager: '김봄', brand: '라티젠', creator: '혜지투즈', contract: 'RS+MG', channel: '타 플랫폼', startDate: '-', endDate: '-', status: '컨택 중', revenue: null, rsRate: null, dhRatio: 3, crRatio: 7, mgTotal: 16600000, crPaid: 11620000, dhProfit: 4980000 },
  { id: 'd2605-13', month: '2605', manager: '이유나', brand: '성분에디터', creator: '채도', contract: 'RS+MG', channel: '자사몰', startDate: '연간계약', endDate: '-', status: '컨택 중', revenue: null, rsRate: null, dhRatio: 3, crRatio: 7, mgTotal: 8000000, crPaid: 6400000, dhProfit: 1600000 },
  { id: 'd2605-14', month: '2605', manager: '김봄', brand: '성분에디터', creator: '김갈릭', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.05.18', endDate: '2026.05.22', status: '작업 중', revenue: null, rsRate: 0.35, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: null, dhProfit: 1500000 },
  { id: 'd2605-15', month: '2605', manager: '배정은', brand: '메리몽드', creator: '이브이', contract: 'RS', channel: '자사몰', startDate: '2026.04.27', endDate: '2026.04.30', status: '진행 중', revenue: null, rsRate: 0.25, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: null, dhProfit: null },

  // ── 2604 (4월) ──
  { id: 'd2604-01', month: '2604', manager: '이유나', brand: '링컨디저트', creator: '애정', contract: 'RS', channel: '브랜드몰', startDate: '2026.03.14', endDate: '2026.03.20', status: '진행 완료', revenue: 761000, rsRate: 0.20, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: 96855, dhProfit: 41509 },
  { id: 'd2604-02', month: '2604', manager: '이유나', brand: '스퀘어라인', creator: '채도', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.03.17', endDate: '2026.03.22', status: '진행 완료', revenue: 19886900, rsRate: 0.30, dhRatio: 2, crRatio: 8, mgTotal: null, crPaid: 4295570, dhProfit: 1073893 },
  { id: 'd2604-03', month: '2604', manager: '배정은', brand: '마른파이브', creator: '디씨즈마테', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.03.22', endDate: '2026.03.25', status: '진행 완료', revenue: 14796300, rsRate: 0.30, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: 2824748, dhProfit: 1210606 },
  { id: 'd2604-04', month: '2604', manager: '배정은', brand: '그린테크라이프', creator: '너큐', contract: 'RS', channel: '브랜드몰', startDate: '2026.03.23', endDate: '2026.03.27', status: '진행 완료', revenue: 4891000, rsRate: null, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: 344133, dhProfit: 147485 },
  { id: 'd2604-05', month: '2604', manager: '김봄', brand: '그린몬스터', creator: '병권', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.03.30', endDate: '2026.04.01', status: '진행 완료', revenue: 1338400, rsRate: 0.32, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: 1561830, dhProfit: 470256 },
  { id: 'd2604-06', month: '2604', manager: '이유나', brand: '오로라렌즈', creator: '포백', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.03.26', endDate: '2026.03.31', status: '진행 완료', revenue: 79933150, rsRate: 0.25, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: 11814844, dhProfit: 5063505 },
  { id: 'd2604-07', month: '2604', manager: '배정은', brand: '러븀', creator: '티비조씨', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.04.02', endDate: '2026.04.05', status: '진행 완료', revenue: null, rsRate: null, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: 4200000, dhProfit: null },
  { id: 'd2604-08', month: '2604', manager: '배정은', brand: '칼로비스', creator: '이브이', contract: 'RS', channel: '브랜드몰', startDate: '2026.04.03', endDate: '2026.04.05', status: '진행 완료', revenue: 1397100, rsRate: 0.45, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: 400079, dhProfit: 171462 },
  { id: 'd2604-09', month: '2604', manager: '배정은', brand: '링컨디저트', creator: '애정', contract: 'RS', channel: '브랜드몰', startDate: '2026.04.03', endDate: '2026.04.07', status: '진행 완료', revenue: 507200, rsRate: 0.20, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: 64553, dhProfit: 27665 },
  { id: 'd2604-10', month: '2604', manager: '김봄', brand: '성분에디터', creator: '시타', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.04.06', endDate: '2026.04.12', status: '진행 완료', revenue: null, rsRate: 0.30, dhRatio: 3, crRatio: 7, mgTotal: 2500000, crPaid: 1750000, dhProfit: 750000 },
  { id: 'd2604-11', month: '2604', manager: '이유나', brand: '앰플엔', creator: '리비', contract: 'RS+MG', channel: '브랜드몰', startDate: '2026.04.08', endDate: '2026.04.12', status: '진행 완료', revenue: null, rsRate: null, dhRatio: 3, crRatio: 7, mgTotal: 7000000, crPaid: 3850000, dhProfit: 3150000 },
  { id: 'd2604-12', month: '2604', manager: '배정은', brand: '풍림푸드', creator: '승진', contract: 'RS', channel: '브랜드몰', startDate: '2026.04.08', endDate: '2026.04.10', status: '진행 완료', revenue: 6199050, rsRate: 0.17, dhRatio: 3, crRatio: 7, mgTotal: null, crPaid: 670625, dhProfit: 287411 },
];

// ── 헬퍼 ──────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000)     return `${(n / 10000).toFixed(0)}만`;
  return n.toLocaleString();
}

const CONTRACT_STYLE: Record<ContractType, string> = {
  'RS':     'bg-indigo-500/15 text-indigo-400',
  'RS+MG':  'bg-violet-500/15 text-violet-400',
  'MG':     'bg-amber-500/15 text-amber-400',
};

const STATUS_STYLE: Record<DealStatus, string> = {
  '진행 완료': 'bg-emerald-500/15 text-emerald-400',
  '진행 중':   'bg-blue-500/15 text-blue-400',
  '작업 중':   'bg-sky-500/15 text-sky-400',
  '상품 세팅': 'bg-amber-500/15 text-amber-400',
  '컨택 중':   'bg-slate-500/15 text-slate-400',
};

const MONTHS = [
  { key: '2605', label: '2026년 5월' },
  { key: '2604', label: '2026년 4월' },
];

// ── 손익 구조 바 ──────────────────────────────────────────────
function ProfitBar({ revenue, crPaid, dhProfit }: { revenue: number; crPaid: number; dhProfit: number }) {
  const brandShare = revenue - crPaid - dhProfit;
  const total = revenue;
  const pct = (n: number) => total > 0 ? `${Math.round((n / total) * 100)}%` : '0%';
  return (
    <div>
      <div className="flex h-3 rounded-full overflow-hidden gap-px mb-2">
        <div style={{ width: pct(brandShare) }} className="bg-slate-600/80" title={`브랜드 ${pct(brandShare)}`} />
        <div style={{ width: pct(crPaid) }} className="bg-blue-500/80" title={`크리에이터 ${pct(crPaid)}`} />
        <div style={{ width: pct(dhProfit) }} className="bg-indigo-500" title={`DH ${pct(dhProfit)}`} />
      </div>
      <div className="flex gap-4 text-[10px]">
        <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-600" /> 브랜드 {pct(brandShare)}</span>
        <span className="flex items-center gap-1 text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500" /> 크리에이터 {pct(crPaid)}</span>
        <span className="flex items-center gap-1 text-indigo-400"><span className="w-2 h-2 rounded-full bg-indigo-500" /> DH {pct(dhProfit)}</span>
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────────
export default function MarketPage() {
  const [month, setMonth] = useState('2605');
  const [contractFilter, setContractFilter] = useState<ContractType | ''>('');
  const [statusFilter, setStatusFilter] = useState<DealStatus | ''>('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() =>
    deals.filter(d =>
      d.month === month &&
      (!contractFilter || d.contract === contractFilter) &&
      (!statusFilter || d.status === statusFilter) &&
      (!search || d.brand.includes(search) || d.creator.includes(search) || d.manager.includes(search))
    ),
    [month, contractFilter, statusFilter, search]
  );

  // 요약 집계
  const totalRevenue  = filtered.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const totalCrPaid   = filtered.reduce((s, d) => s + (d.crPaid ?? 0), 0);
  const totalDhProfit = filtered.reduce((s, d) => s + (d.dhProfit ?? 0), 0);
  const completedCount = filtered.filter(d => d.status === '진행 완료').length;
  const dhMargin = totalRevenue > 0 ? ((totalDhProfit / totalRevenue) * 100).toFixed(1) : '-';

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-white mb-1">마켓 손익 관리</h1>
        <p className="text-slate-400 text-sm">공구·상시 딜별 거래액 → 브랜드 정산 → 크리에이터 지급 → DH 순이익 분석</p>
      </div>

      {/* 월 탭 */}
      <div className="flex gap-1 mb-6 bg-[#13151f] rounded-lg p-1 w-fit">
        {MONTHS.map(m => (
          <button key={m.key} onClick={() => setMonth(m.key)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${month === m.key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-5">
          <p className="text-xs text-slate-400 font-medium mb-2">집계된 거래액</p>
          <p className="text-2xl font-bold text-white">₩{fmt(totalRevenue)}</p>
          <p className="text-[11px] text-slate-600 mt-1">매출 미집계 딜 제외</p>
        </div>
        <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-5">
          <p className="text-xs text-slate-400 font-medium mb-2">크리에이터 지급</p>
          <p className="text-2xl font-bold text-blue-400">₩{fmt(totalCrPaid)}</p>
          <p className="text-[11px] text-slate-600 mt-1">RS 분배 + MG 합산</p>
        </div>
        <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-5">
          <p className="text-xs text-slate-400 font-medium mb-2">DH 순이익</p>
          <p className="text-2xl font-bold text-indigo-400">₩{fmt(totalDhProfit)}</p>
          {totalRevenue > 0 && (
            <div className="flex items-center gap-1 mt-1 text-emerald-400 text-[11px]">
              <TrendingUp size={11} /> 마진율 {dhMargin}%
            </div>
          )}
        </div>
        <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-5">
          <p className="text-xs text-slate-400 font-medium mb-2">딜 현황</p>
          <p className="text-2xl font-bold text-white">{filtered.length}<span className="text-sm font-normal text-slate-400 ml-1">건</span></p>
          <p className="text-[11px] text-slate-600 mt-1">완료 {completedCount}건 · 진행 {filtered.length - completedCount}건</p>
        </div>
      </div>

      {/* 손익 구조 바 (매출 있는 딜 기준) */}
      {totalRevenue > 0 && (
        <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-5 mb-5">
          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">손익 구조 (집계된 거래액 기준)</p>
          <ProfitBar revenue={totalRevenue} crPaid={totalCrPaid} dhProfit={totalDhProfit} />
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <p className="text-slate-500 text-[11px] mb-0.5">브랜드 정산</p>
              <p className="text-white font-bold">₩{fmt(totalRevenue - totalCrPaid - totalDhProfit)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px] mb-0.5">크리에이터 지급</p>
              <p className="text-blue-400 font-bold">₩{fmt(totalCrPaid)}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[11px] mb-0.5">DH 순이익</p>
              <p className="text-indigo-400 font-bold">₩{fmt(totalDhProfit)}</p>
            </div>
          </div>
        </div>
      )}

      {/* 필터 툴바 */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {/* 계약 형태 */}
        <div className="flex gap-1.5">
          {(['', 'RS', 'RS+MG', 'MG'] as const).map(t => (
            <button key={t} onClick={() => setContractFilter(t as ContractType | '')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${contractFilter === t ? 'bg-indigo-600 text-white' : 'bg-[#1a1d27] text-slate-400 hover:text-white border border-white/5'}`}>
              {t || '전체'}
            </button>
          ))}
        </div>
        <div className="w-px h-5 bg-white/10 mx-1" />
        {/* 상태 */}
        <div className="flex gap-1.5 flex-wrap">
          {(['', '진행 완료', '진행 중', '작업 중', '상품 세팅', '컨택 중'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s as DealStatus | '')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${statusFilter === s ? 'bg-indigo-600 text-white' : 'bg-[#1a1d27] text-slate-400 hover:text-white border border-white/5'}`}>
              {s || '전체 상태'}
            </button>
          ))}
        </div>
        {/* 검색 */}
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="브랜드·크리에이터·담당 검색"
            className="pl-8 pr-4 py-2 bg-[#1a1d27] border border-white/5 rounded-lg text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 w-52" />
        </div>
        <span className="text-xs text-slate-500">{filtered.length}건</span>
      </div>

      {/* 테이블 */}
      <div className="bg-[#1a1d27] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['브랜드', '크리에이터', '담당', '계약', '채널', '진행일', '거래액', 'RS율', '크리 지급', 'DH 순이익', '상태', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[11px] font-semibold text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr><td colSpan={12} className="py-14 text-center text-slate-500 text-sm">조건에 맞는 딜이 없습니다.</td></tr>
            ) : filtered.map(d => {
              const isExpanded = expandedId === d.id;
              // RS 계산 표시용
              const rsFeeVat = d.revenue && d.rsRate ? Math.round(d.revenue * d.rsRate) : null;
              const totalRatio = d.dhRatio + d.crRatio;
              const dhPct = Math.round((d.dhRatio / totalRatio) * 100);
              const crPct = Math.round((d.crRatio / totalRatio) * 100);

              return (
                <>
                  <tr key={d.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : d.id)}>
                    <td className="px-4 py-3.5">
                      <p className="text-white font-semibold text-sm">{d.brand}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-slate-300 text-sm">{d.creator}</p>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{d.manager}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${CONTRACT_STYLE[d.contract]}`}>{d.contract}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{d.channel}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{d.startDate?.slice(5)}</td>
                    <td className="px-4 py-3.5">
                      {d.revenue
                        ? <span className="text-white font-semibold text-sm">₩{fmt(d.revenue)}</span>
                        : <span className="text-slate-600 text-xs">미집계</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      {d.rsRate
                        ? <span className="text-slate-300 text-sm font-medium">{Math.round(d.rsRate * 100)}%</span>
                        : <span className="text-slate-600 text-xs">-</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      {d.crPaid != null
                        ? <span className="text-blue-400 font-bold">₩{fmt(d.crPaid)}</span>
                        : <span className="text-slate-600 text-xs">-</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      {d.dhProfit != null
                        ? <span className="text-indigo-400 font-bold">₩{fmt(d.dhProfit)}</span>
                        : <span className="text-slate-600 text-xs">-</span>
                      }
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </td>
                  </tr>

                  {/* 확장: 손익 상세 */}
                  {isExpanded && (
                    <tr key={`${d.id}-detail`} className="bg-white/[0.012]">
                      <td colSpan={12} className="px-6 py-5">
                        <div className="grid grid-cols-3 gap-6">

                          {/* RS 수수료 구조 */}
                          <div>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">RS 수수료 구조</p>
                            <div className="flex flex-col gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">거래액 (VAT 포함)</span>
                                <span className="text-white font-semibold">{d.revenue ? `₩${d.revenue.toLocaleString()}` : '미집계'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">RS 수수료율</span>
                                <span className="text-white">{d.rsRate ? `${Math.round(d.rsRate * 100)}%` : '-'}</span>
                              </div>
                              {rsFeeVat && (
                                <>
                                  <div className="flex justify-between border-t border-white/5 pt-2">
                                    <span className="text-slate-400">RS 수수료 (VAT 포함)</span>
                                    <span className="text-white font-semibold">₩{rsFeeVat.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">RS 수수료 (VAT 제외)</span>
                                    <span className="text-white">₩{Math.round(rsFeeVat / 1.1).toLocaleString()}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* DH / 크리에이터 분배 */}
                          <div>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">수익 분배 ({d.dhRatio}:{d.crRatio})</p>
                            <div className="flex flex-col gap-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-slate-400">DH 분배율</span>
                                <span className="text-indigo-400 font-semibold">{dhPct}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">크리에이터 분배율</span>
                                <span className="text-blue-400 font-semibold">{crPct}%</span>
                              </div>
                              {d.mgTotal != null && (
                                <div className="flex justify-between border-t border-white/5 pt-2">
                                  <span className="text-slate-400">MG 총 진행비용</span>
                                  <span className="text-amber-400 font-semibold">₩{d.mgTotal.toLocaleString()}</span>
                                </div>
                              )}
                              <div className="flex justify-between border-t border-white/5 pt-2">
                                <span className="text-slate-400">크리에이터 실지급</span>
                                <span className="text-blue-400 font-bold">{d.crPaid != null ? `₩${d.crPaid.toLocaleString()}` : '-'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">DH 최종 순이익</span>
                                <span className="text-indigo-400 font-bold">{d.dhProfit != null ? `₩${d.dhProfit.toLocaleString()}` : '-'}</span>
                              </div>
                            </div>
                          </div>

                          {/* 손익 비율 바 */}
                          <div>
                            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-3">손익 구조</p>
                            {d.revenue && d.crPaid != null && d.dhProfit != null ? (
                              <ProfitBar revenue={d.revenue} crPaid={d.crPaid} dhProfit={d.dhProfit} />
                            ) : d.crPaid != null && d.dhProfit != null ? (
                              <div className="flex flex-col gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">크리에이터</span>
                                  <span className="text-blue-400 font-bold">₩{d.crPaid.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">DH</span>
                                  <span className="text-indigo-400 font-bold">₩{d.dhProfit.toLocaleString()}</span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-slate-600 text-xs">매출 집계 후 확인 가능</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
