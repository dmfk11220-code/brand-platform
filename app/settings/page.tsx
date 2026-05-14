'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    companyName: '두호',
    email: 'contact@dooho.kr',
    phone: '02-0000-0000',
    defaultCommission: '12',
    settlementDay: '10',
    currency: 'KRW',
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">설정</h1>
        <p className="text-slate-400 text-sm">플랫폼 기본 설정을 관리합니다.</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-6">
          <h2 className="text-sm font-bold text-white mb-5">회사 정보</h2>
          <div className="flex flex-col gap-4">
            {[
              { key: 'companyName', label: '회사명' },
              { key: 'email', label: '대표 이메일' },
              { key: 'phone', label: '연락처' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
                <input
                  value={form[f.key as keyof typeof form]}
                  onChange={e => set(f.key, e.target.value)}
                  className="w-full bg-[#0f1117] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1d27] rounded-xl border border-white/5 p-6">
          <h2 className="text-sm font-bold text-white mb-5">정산 설정</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">기본 수수료율 (%)</label>
              <input
                value={form.defaultCommission}
                onChange={e => set('defaultCommission', e.target.value)}
                type="number"
                className="w-full bg-[#0f1117] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">정산일 (매월)</label>
              <input
                value={form.settlementDay}
                onChange={e => set('settlementDay', e.target.value)}
                type="number"
                min="1" max="28"
                className="w-full bg-[#0f1117] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">통화</label>
              <select
                value={form.currency}
                onChange={e => set('currency', e.target.value)}
                className="w-full bg-[#0f1117] border border-white/5 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 transition-colors">
                <option value="KRW">KRW (원)</option>
                <option value="USD">USD (달러)</option>
              </select>
            </div>
          </div>
        </div>

        <button onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors w-fit ${
            saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}>
          <Save size={15} />
          {saved ? '저장됐어요!' : '저장하기'}
        </button>
      </div>
    </div>
  );
}
