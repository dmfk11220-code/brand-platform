'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';

type Platform = '인스타그램' | '유튜브' | '틱톡' | '블로그';
type CreatorStatus = '활성' | '비활성' | '검토중';
type CreatorCategory = '패션' | '뷰티' | '식품' | '생활' | '스포츠' | '기타';

interface Creator {
  id: string;
  name: string;
  handle: string;
  platform: Platform;
  category: CreatorCategory;
  followers: number;
  commissionRate: number;
  phone: string;
  hashtags: string[];
  status: CreatorStatus;
  joinedAt: string;
}

const mockCreators: Creator[] = [
  { id: '1', name: '김민지', handle: '@minji_fit', platform: '인스타그램', category: '스포츠', followers: 182000, commissionRate: 12, phone: '010-1111-2222', hashtags: ['#레깅스', '#홈트', '#운동복'], status: '활성', joinedAt: '2024-01-10' },
  { id: '2', name: '박서연', handle: '@seo_beauty', platform: '유튜브', category: '뷰티', followers: 543000, commissionRate: 15, phone: '010-2222-3333', hashtags: ['#뷰티', '#메이크업', '#스킨케어'], status: '활성', joinedAt: '2024-02-05' },
  { id: '3', name: '이지호', handle: '@jiho_eats', platform: '틱톡', category: '식품', followers: 97000, commissionRate: 10, phone: '010-3333-4444', hashtags: ['#먹방', '#맛집', '#요리'], status: '활성', joinedAt: '2024-02-20' },
  { id: '4', name: '최아름', handle: '@arum_style', platform: '인스타그램', category: '패션', followers: 231000, commissionRate: 13, phone: '010-4444-5555', hashtags: ['#오오티디', '#패션', '#코디'], status: '검토중', joinedAt: '2024-03-15' },
  { id: '5', name: '한도윤', handle: '@doyoon_life', platform: '블로그', category: '생활', followers: 45000, commissionRate: 8, phone: '010-5555-6666', hashtags: ['#인테리어', '#생활용품', '#살림'], status: '비활성', joinedAt: '2024-04-01' },
];

const PLATFORMS: Platform[] = ['인스타그램', '유튜브', '틱톡', '블로그'];
const CATEGORIES: CreatorCategory[] = ['패션', '뷰티', '식품', '생활', '스포츠', '기타'];
const STATUSES: CreatorStatus[] = ['활성', '비활성', '검토중'];

const PLATFORM_STYLE: Record<Platform, string> = {
  '인스타그램': 'bg-pink-50 text-pink-500',
  '유튜브': 'bg-red-50 text-red-500',
  '틱톡': 'bg-slate-100 text-slate-600',
  '블로그': 'bg-green-50 text-green-600',
};

const PLATFORM_ICON: Record<Platform, string> = {
  '인스타그램': '📸', '유튜브': '▶️', '틱톡': '🎵', '블로그': '✍️',
};

const STATUS_STYLE: Record<CreatorStatus, string> = {
  '활성': 'bg-emerald-50 text-emerald-600',
  '비활성': 'bg-slate-100 text-slate-400',
  '검토중': 'bg-amber-50 text-amber-600',
};

const fmtFollower = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}만` : `${n.toLocaleString()}`;

const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white";

export default function CreatorsPage() {
  const [creators, setCreators] = useState<Creator[]>(mockCreators);
  const [query, setQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editCreator, setEditCreator] = useState<Creator | null>(null);
  const [form, setForm] = useState<Partial<Creator & { hashtagInput: string }>>({});

  const filtered = useMemo(() => creators.filter(c =>
    (c.name.includes(query) || c.handle.includes(query)) &&
    (!platformFilter || c.platform === platformFilter) &&
    (!statusFilter || c.status === statusFilter)
  ), [creators, query, platformFilter, statusFilter]);

  const allChecked = filtered.length > 0 && filtered.every(c => selected.has(c.id));
  const toggleAll = () => {
    if (allChecked) {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(c => s.delete(c.id)); return s; });
    } else {
      setSelected(prev => { const s = new Set(prev); filtered.forEach(c => s.add(c.id)); return s; });
    }
  };
  const toggleOne = (id: string) => {
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const handleBulkDelete = () => {
    if (!selected.size) return;
    if (!confirm(`선택한 ${selected.size}명을 삭제하시겠습니까?`)) return;
    setCreators(prev => prev.filter(c => !selected.has(c.id)));
    setSelected(new Set());
  };

  const openAdd = () => {
    setEditCreator(null);
    setForm({ platform: '인스타그램', category: '패션', status: '활성', commissionRate: 10, hashtags: [], hashtagInput: '' });
    setModalOpen(true);
  };

  const openEdit = (c: Creator) => {
    setEditCreator(c);
    setForm({ ...c, hashtagInput: c.hashtags.join(' ') });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name?.trim()) return alert('크리에이터명을 입력해주세요.');
    const hashtags = (form.hashtagInput || '').split(/\s+/).filter(h => h.startsWith('#') && h.length > 1);
    if (editCreator) {
      setCreators(prev => prev.map(c => c.id === editCreator.id ? { ...c, ...form, hashtags } as Creator : c));
    } else {
      setCreators(prev => [{
        id: String(Date.now()),
        name: form.name!,
        handle: form.handle || '',
        platform: form.platform as Platform || '인스타그램',
        category: form.category as CreatorCategory || '패션',
        followers: Number(form.followers) || 0,
        commissionRate: Number(form.commissionRate) || 10,
        phone: form.phone || '',
        hashtags,
        status: form.status as CreatorStatus || '활성',
        joinedAt: new Date().toISOString().slice(0, 10),
      }, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const c = creators.find(x => x.id === id);
    if (!c || !confirm(`"${c.name}" 크리에이터를 삭제하시겠습니까?`)) return;
    setCreators(prev => prev.filter(x => x.id !== id));
    setSelected(prev => { const s = new Set(prev); s.delete(id); return s; });
  };

  const set = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="p-10">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold">크리에이터 관리</h1>
          <p className="text-sm text-slate-400 mt-1">파트너 크리에이터를 조회하고 관리합니다.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors">
          <Plus size={16} /> 크리에이터 추가
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {[
          { label: '전체 크리에이터', value: creators.length, unit: '명' },
          { label: '활성', value: creators.filter(c => c.status === '활성').length, unit: '명' },
          { label: '검토중', value: creators.filter(c => c.status === '검토중').length, unit: '명' },
          { label: '총 팔로워', value: fmtFollower(creators.reduce((s, c) => s + c.followers, 0)), unit: '' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs text-slate-400 font-semibold mb-2">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}<span className="text-sm font-normal text-slate-400 ml-1">{s.unit}</span></p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex gap-2.5 mb-4 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="이름 또는 핸들 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400" />
        </div>
        <select value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none">
          <option value="">전체 플랫폼</option>
          {PLATFORMS.map(p => <option key={p}>{p}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none">
          <option value="">전체 상태</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length}명</span>
        {selected.size > 0 && (
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white text-sm font-semibold rounded-lg hover:bg-rose-600 transition-colors">
            <Trash2 size={13} /> {selected.size}명 삭제
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allChecked} onChange={toggleAll}
                  className="rounded border-slate-300 accent-indigo-500" />
              </th>
              {['크리에이터', '플랫폼', '카테고리', '팔로워', '수수료율', '연락처', '해시태그', '상태', '관리'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="py-16 text-center text-slate-400 text-sm">검색 결과가 없습니다.</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors ${selected.has(c.id) ? 'bg-indigo-50/40' : ''}`}>
                <td className="px-4 py-3.5">
                  <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggleOne(c.id)}
                    className="rounded border-slate-300 accent-indigo-500" />
                </td>
                <td className="px-4 py-3.5">
                  <div>
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.handle}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md whitespace-nowrap ${PLATFORM_STYLE[c.platform]}`}>
                    {PLATFORM_ICON[c.platform]} {c.platform}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-pink-50 text-pink-500 whitespace-nowrap">{c.category}</span>
                </td>
                <td className="px-4 py-3.5 text-sm font-semibold">{fmtFollower(c.followers)}</td>
                <td className="px-4 py-3.5 text-sm font-bold">{c.commissionRate}%</td>
                <td className="px-4 py-3.5 text-sm text-slate-500">{c.phone}</td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {c.hashtags.map(h => (
                      <span key={h} className="text-[11px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-medium">{h}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(c)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-7 pt-6 pb-1">
              <h2 className="text-[17px] font-bold">{editCreator ? '크리에이터 수정' : '크리에이터 추가'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 text-lg">✕</button>
            </div>
            <div className="px-7 py-5 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="이름" required>
                  <input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="실명" className={inputCls} />
                </Field>
                <Field label="핸들 (계정명)">
                  <input value={form.handle || ''} onChange={e => set('handle', e.target.value)} placeholder="@handle" className={inputCls} />
                </Field>
                <Field label="플랫폼">
                  <select value={form.platform || ''} onChange={e => set('platform', e.target.value)} className={inputCls}>
                    {PLATFORMS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="카테고리">
                  <select value={form.category || ''} onChange={e => set('category', e.target.value)} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="팔로워 수">
                  <input type="number" value={form.followers || ''} onChange={e => set('followers', e.target.value)} placeholder="0" className={inputCls} />
                </Field>
                <Field label="수수료율 (%)">
                  <input type="number" value={form.commissionRate || ''} onChange={e => set('commissionRate', e.target.value)} placeholder="10" className={inputCls} />
                </Field>
                <Field label="연락처">
                  <input value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="010-0000-0000" className={inputCls} />
                </Field>
                <Field label="상태">
                  <select value={form.status || '활성'} onChange={e => set('status', e.target.value)} className={inputCls}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="해시태그">
                <input value={form.hashtagInput || ''} onChange={e => set('hashtagInput', e.target.value)}
                  placeholder="#레깅스 #홈트 #운동복 (스페이스로 구분)" className={inputCls} />
                <p className="text-[11px] text-slate-400 mt-1"># 포함하여 입력, 스페이스로 구분</p>
              </Field>
            </div>
            <div className="flex justify-end gap-2 px-7 py-5 border-t border-slate-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-indigo-500 border border-indigo-300 rounded-lg hover:bg-indigo-50">취소</button>
              <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-slate-600">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
