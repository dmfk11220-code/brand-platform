'use client';

import { useState } from 'react';
import { Download, Search, TrendingUp, CheckCircle2, Circle, AlertCircle, FileText, ChevronDown, ChevronUp } from 'lucide-react';

type TaxType = '프리랜서' | '일반과세' | '간이과세';
type SettlementStatus = '정산완료' | '정산대기' | '서류미비';

interface Settlement {
  id: string;
  creator: string;
  handle: string;
  month: string;
  sales: number;
  commission: number;
  amount: number;
  status: SettlementStatus;
  paidAt: string;
  taxType: TaxType;
  docs: {
    bankbook: boolean;       // 통장사본
    idCard: boolean;         // 주민등록증 (프리랜서)
    bizReg: boolean;         // 사업자등록증 (사업자)
    stamp: boolean;          // 도장 (일반과세)
  };
}

const TAX_TYPE_INFO: Record<TaxType, { label: string; color: string; process: string; docs: string[] }> = {
  '프리랜서': {
    label: '프리랜서',
    color: 'bg-blue-500/15 text-blue-400',
    process: '공액 지급',
    docs: ['통장사본', '주민등록증 사본'],
  },
  '일반과세': {
    label: '일반과세',
    color: 'bg-violet-500/15 text-violet-400',
    process: '세금계산서 발급',
    docs: ['사업자등록증', '통장사본', '도장'],
  },
  '간이과세': {
    label: '간이과세',
    color: 'bg-orange-500/15 text-orange-400',
    process: '세금계산서 발행',
    docs: ['사업자등록증', '통장사본'],
  },
};

const mockSettlements: Settlement[] = [
  // 2025-04
  { id: 'S001', creator: '레미니씬', handle: '@reminiscene_', month: '2025-04', sales: 8200000, commission: 12, amount: 7216000, status: '정산완료', paidAt: '2025-05-10', taxType: '일반과세', docs: { bankbook: true, idCard: false, bizReg: true, stamp: true } },
  { id: 'S002', creator: '애정', handle: '@ae_jeong_', month: '2025-04', sales: 5640000, commission: 12, amount: 4963200, status: '정산완료', paidAt: '2025-05-10', taxType: '일반과세', docs: { bankbook: true, idCard: false, bizReg: true, stamp: true } },
  { id: 'S003', creator: '김체리', handle: '@kimcherry_tt', month: '2025-04', sales: 3850000, commission: 12, amount: 3388000, status: '정산완료', paidAt: '2025-05-10', taxType: '프리랜서', docs: { bankbook: true, idCard: true, bizReg: false, stamp: false } },
  { id: 'S004', creator: '진경', handle: '@jinkyoung_ig', month: '2025-04', sales: 3120000, commission: 12, amount: 2745600, status: '정산대기', paidAt: '-', taxType: '일반과세', docs: { bankbook: true, idCard: false, bizReg: true, stamp: false } },
  { id: 'S005', creator: '이펠(최명)', handle: '@eiffel_choi', month: '2025-04', sales: 1680000, commission: 15, amount: 1428000, status: '정산대기', paidAt: '-', taxType: '프리랜서', docs: { bankbook: true, idCard: false, bizReg: false, stamp: false } },
  { id: 'S006', creator: '뭉순임당', handle: '@moongsunimdang', month: '2025-04', sales: 1420000, commission: 12, amount: 1249600, status: '정산완료', paidAt: '2025-05-10', taxType: '일반과세', docs: { bankbook: true, idCard: false, bizReg: true, stamp: true } },
  { id: 'S007', creator: '류스펜나', handle: '@ryuspenna', month: '2025-04', sales: 1240000, commission: 15, amount: 1054000, status: '서류미비', paidAt: '-', taxType: '프리랜서', docs: { bankbook: false, idCard: false, bizReg: false, stamp: false } },
  { id: 'S008', creator: '인아짱', handle: '@inahjjang', month: '2025-04', sales: 980000, commission: 15, amount: 833000, status: '서류미비', paidAt: '-', taxType: '프리랜서', docs: { bankbook: false, idCard: false, bizReg: false, stamp: false } },
  // 2025-03
  { id: 'S009', creator: '레미니씬', handle: '@reminiscene_', month: '2025-03', sales: 7650000, commission: 12, amount: 6732000, status: '정산완료', paidAt: '2025-04-10', taxType: '일반과세', docs: { bankbook: true, idCard: false, bizReg: true, stamp: true } },
  { id: 'S010', creator: '애정', handle: '@ae_jeong_', month: '2025-03', sales: 5120000, commission: 12, amount: 4505600, status: '정산완료', paidAt: '2025-04-10', taxType: '일반과세', docs: { bankbook: true, idCard: false, bizReg: true, stamp: true } },
  { id: 'S011', creator: '김체리', handle: '@kimcherry_tt', month: '2025-03', sales: 3400000, commission: 12, amount: 2992000, status: '정산완료', paidAt: '2025-04-10', taxType: '프리랜서', docs: { bankbook: true, idCard: true, bizReg: false, stamp: false } },
  { id: 'S012', creator: '진경', handle: '@jinkyoung_ig', month: '2025-03', sales: 2880000, commission: 12, amount: 2534400, status: '정산완료', paidAt: '2025-04-10', taxType: '일반과세', docs: { bankbook: true, idCard: false, bizReg: true, stamp: true } },
  // 2025-02
  { id: 'S013', creator: '레미니씬', handle: '@reminiscene_', month: '2025-02', sales: 6900000, commission: 12, amount: 6072000, status: '정산완료', paidAt: '2025-03-10', taxType: '일반과세', docs: { bankbook: true, idCard: false, bizReg: true, stamp: true } },
  { id: 'S014', creator: '애정', handle: '@ae_jeong_', month: '2025-02', sales: 4780000, commission: 12, amount: 4206400, status: '정산완료', paidAt: '2025-03-10', taxType: '일반과세', docs: { bankbook: true, idCard: false, bizReg: true, stamp: true } },
  { id: 'S015', creator: '뭉순임당', handle: '@moongsunimdang', month: '2025-02', sales: 1580000, commission: 12, amount: 1390400, status: '정산완료', paidAt: '2025-03-10', taxType: '일반과세', docs: { bankbook: true, idCard: false, bizReg: true, stamp: true } },
];

const months = ['2025-04', '2025-03', '2025-02'] as const;

const STATUS_STYLE: Record<SettlementStatus, string> = {
  '정산완료': 'bg-emerald-500/15 text-emerald-400',
  '정산대기': 'bg-amber-500/15 text-amber-400',
  '서류미비': 'bg-rose-500/15 text-rose-400',
};

function DocBadge({ checked, label }: { checked: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${checked ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
      {checked ? <CheckCircle2 size={9} /> : <Circle size={9} />}
      {label}
    </span>
  );
}

function getRequiredDocs(taxType: TaxType, docs: Settlement['docs']) {
  if (taxType === '프리랜서') {
    return [
      { label: '통장사본', checked: docs.bankbook },
      { label: '주민등록증', checked: docs.idCard },
    ];
  } else if (taxType === '일반과세') {
    return [
      { label: '사업자등록증', checked: docs.bizReg },
      { label: '통장사본', checked: docs.bankbook },
      { label: '도장', checked: docs.stamp },
    ];
  } else {
    return [
      { label: '사업자등록증', checked: docs.bizReg },
      { label: '통장사본', checked: docs.bankbook },
    ];
  }
}

export default function SettlementPage() {
  const [selectedMonth, setSelectedMonth] = useState('2025-04');
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'list' | 'guide'>('list');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filtered = mockSettlements.filter(s =>
    s.month === selectedMonth &&
    (s.creator.includes(search) || s.handle.includes(search))
  );

  const totalSales = filtered.reduce((a, s) => a + s.sales, 0);
  const totalAmount = filtered.reduce((a, s) => a + s.amount, 0);
  const pendingCount = filtered.filter(s => s.status === '정산대기').length;
  const missingDocsCount = filtered.filter(s => s.status === '서류미비').length;

  return (
    <div className="p-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">정산 관리</h1>
          <p className="text-slate-400 text-sm">크리에이터 유형별 정산 프리셋 적용</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Download size={15} /> 엑셀 다운로드
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-6 bg-[#13151f] rounded-lg p-1 w-fit">
        {[['list', '정산 내역'], ['guide', '유형별 안내']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as 'list' | 'guide')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'guide' ? (
        /* ── 유형별 안내 탭 ── */
        <div className="grid grid-cols-3 gap-4">
          {(Object.entries(TAX_TYPE_INFO) as [TaxType, typeof TAX_TYPE_INFO[TaxType]][]).map(([type, info]) => (
            <div key={type} className="bg-[#1a1d27] rounded-xl border border-white/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${info.color}`}>{info.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold mb-1 uppercase tracking-wider">정산 절차</p>
              <p className="text-white font-semibold text-sm mb-5">
                ① 사업자시트 작성 → ② {info.process}
              </p>
              <p className="text-[11px] text-slate-500 font-semibold mb-2 uppercase tracking-wider">필요 서류</p>
              <div className="flex flex-col gap-2">
                {info.docs.map(doc => (
                  <div key={doc} className="flex items-center gap-2 text-sm text-slate-300">
                    <FileText size={13} className="text-slate-500 shrink-0" />
                    {doc}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* ── 정산 내역 탭 ── */
        <>
          {/* 요약 카드 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#1a1d27] rounded-xl p-5 border border-white/5">
              <p className="text-slate-400 text-xs mb-2 font-medium">총 매출</p>
              <p className="text-2xl font-bold text-white">₩{totalSales.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-400 text-xs">
                <TrendingUp size={12} /> 전월 대비 +8.2%
              </div>
            </div>
            <div className="bg-[#1a1d27] rounded-xl p-5 border border-white/5">
              <p className="text-slate-400 text-xs mb-2 font-medium">정산 예정액</p>
              <p className="text-2xl font-bold text-white">₩{totalAmount.toLocaleString()}</p>
              <p className="text-slate-500 text-xs mt-2">수수료 차감 후</p>
            </div>
            <div className="bg-[#1a1d27] rounded-xl p-5 border border-white/5">
              <p className="text-slate-400 text-xs mb-2 font-medium">정산 대기</p>
              <p className="text-2xl font-bold text-amber-400">{pendingCount}건</p>
              <p className="text-slate-500 text-xs mt-2">서류 완료, 지급 전</p>
            </div>
            <div className="bg-[#1a1d27] rounded-xl p-5 border border-white/5">
              <p className="text-slate-400 text-xs mb-2 font-medium">서류 미비</p>
              <p className="text-2xl font-bold text-rose-400">{missingDocsCount}건</p>
              <p className="text-slate-500 text-xs mt-2">서류 수집 필요</p>
            </div>
          </div>

          {/* 필터 */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex gap-2">
              {months.map(m => (
                <button key={m} onClick={() => setSelectedMonth(m)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMonth === m ? 'bg-indigo-600 text-white' : 'bg-[#1a1d27] text-slate-400 hover:text-white border border-white/5'
                  }`}>
                  {m}
                </button>
              ))}
            </div>
            <div className="relative ml-auto">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="크리에이터 검색"
                className="pl-9 pr-4 py-2 bg-[#1a1d27] border border-white/5 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 w-52" />
            </div>
          </div>

          {/* 테이블 */}
          <div className="bg-[#1a1d27] rounded-xl border border-white/5 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['크리에이터', '유형', '절차', '서류 현황', '매출액', '수수료율', '정산액', '상태', '지급일', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3.5 text-xs font-semibold text-slate-400 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.map(s => {
                  const info = TAX_TYPE_INFO[s.taxType];
                  const requiredDocs = getRequiredDocs(s.taxType, s.docs);
                  const allDocsOk = requiredDocs.every(d => d.checked);
                  const isExpanded = expandedRow === s.id;

                  return (
                    <>
                      <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="text-white font-medium">{s.creator}</p>
                          <p className="text-slate-500 text-xs">{s.handle}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${info.color}`}>{info.label}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-xs whitespace-nowrap">{info.process}</td>
                        <td className="px-4 py-3.5">
                          {allDocsOk
                            ? <span className="flex items-center gap-1 text-xs text-emerald-400"><CheckCircle2 size={12} /> 완료</span>
                            : <span className="flex items-center gap-1 text-xs text-rose-400"><AlertCircle size={12} /> 미비</span>
                          }
                        </td>
                        <td className="px-4 py-3.5 text-white font-medium">₩{s.sales.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-slate-300">{s.commission}%</td>
                        <td className="px-4 py-3.5 text-emerald-400 font-bold">₩{s.amount.toLocaleString()}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[s.status]}`}>{s.status}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-xs">{s.paidAt}</td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => setExpandedRow(isExpanded ? null : s.id)}
                            className="text-slate-500 hover:text-white transition-colors">
                            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${s.id}-detail`} className="bg-white/[0.015]">
                          <td colSpan={10} className="px-6 py-4">
                            <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">서류 체크리스트</p>
                            <div className="flex flex-wrap gap-2">
                              {requiredDocs.map(doc => (
                                <DocBadge key={doc.label} checked={doc.checked} label={doc.label} />
                              ))}
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
        </>
      )}
    </div>
  );
}
