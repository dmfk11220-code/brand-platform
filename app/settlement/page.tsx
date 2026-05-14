'use client';

import { useState } from 'react';
import { Download, Search, TrendingUp, TrendingDown } from 'lucide-react';

const mockSettlements = [
  { id: 'S001', creator: '박서연', handle: '@seo_beauty', month: '2025-04', sales: 4320000, commission: 12, amount: 3801600, status: '정산완료', paidAt: '2025-05-10' },
  { id: 'S002', creator: '김민지', handle: '@minji_fit', month: '2025-04', sales: 2850000, commission: 12, amount: 2508000, status: '정산완료', paidAt: '2025-05-10' },
  { id: 'S003', creator: '최아름', handle: '@arum_style', month: '2025-04', sales: 1920000, commission: 15, amount: 1632000, status: '정산대기', paidAt: '-' },
  { id: 'S004', creator: '이지호', handle: '@jiho_eats', month: '2025-04', sales: 980000, commission: 15, amount: 833000, status: '정산대기', paidAt: '-' },
  { id: 'S005', creator: '정현우', handle: '@hyunwoo_fit', month: '2025-04', sales: 760000, commission: 12, amount: 668800, status: '정산완료', paidAt: '2025-05-10' },
  { id: 'S006', creator: '한도윤', handle: '@doyoon_life', month: '2025-04', sales: 430000, commission: 15, amount: 365500, status: '정산대기', paidAt: '-' },
  { id: 'S007', creator: '박서연', handle: '@seo_beauty', month: '2025-03', sales: 3980000, commission: 12, amount: 3502400, status: '정산완료', paidAt: '2025-04-10' },
  { id: 'S008', creator: '김민지', handle: '@minji_fit', month: '2025-03', sales: 2610000, commission: 12, amount: 2296800, status: '정산완료', paidAt: '2025-04-10' },
];

const months = ['2025-04', '2025-03', '2025-02'];

export default function SettlementPage() {
  const [selectedMonth, setSelectedMonth] = useState('2025-04');
  const [search, setSearch] = useState('');

  const filtered = mockSettlements.filter(s =>
    s.month === selectedMonth &&
    (s.creator.includes(search) || s.handle.includes(search))
  );

  const totalSales = filtered.reduce((a, s) => a + s.sales, 0);
  const totalAmount = filtered.reduce((a, s) => a + s.amount, 0);
  const pendingCount = filtered.filter(s => s.status === '정산대기').length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">정산 관리</h1>
          <p className="text-slate-400 text-sm">크리에이터 월별 정산 내역</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors">
          <Download size={15} /> 엑셀 다운로드
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
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
          <div className="flex items-center gap-1 mt-2 text-slate-400 text-xs">
            수수료 차감 후
          </div>
        </div>
        <div className="bg-[#1a1d27] rounded-xl p-5 border border-white/5">
          <p className="text-slate-400 text-xs mb-2 font-medium">정산 대기</p>
          <p className="text-2xl font-bold text-amber-400">{pendingCount}건</p>
          <div className="flex items-center gap-1 mt-2 text-slate-400 text-xs">
            미처리 항목
          </div>
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
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="크리에이터 검색"
            className="pl-9 pr-4 py-2 bg-[#1a1d27] border border-white/5 rounded-lg text-sm text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 w-52"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-[#1a1d27] rounded-xl border border-white/5 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              {['크리에이터', '정산월', '매출액', '수수료율', '정산액', '상태', '지급일'].map(h => (
                <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5">
                  <p className="text-white font-medium">{s.creator}</p>
                  <p className="text-slate-500 text-xs">{s.handle}</p>
                </td>
                <td className="px-5 py-3.5 text-slate-300">{s.month}</td>
                <td className="px-5 py-3.5 text-white font-medium">₩{s.sales.toLocaleString()}</td>
                <td className="px-5 py-3.5 text-slate-300">{s.commission}%</td>
                <td className="px-5 py-3.5 text-emerald-400 font-bold">₩{s.amount.toLocaleString()}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    s.status === '정산완료' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'
                  }`}>{s.status}</span>
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{s.paidAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
