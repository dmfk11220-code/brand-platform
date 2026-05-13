'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Key, Trash2, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { Brand, BrandFormData } from '@/lib/types';
import { mockBrands, CATEGORIES, BRAND_TYPES } from '@/lib/mockData';
import BrandModal from '@/components/brand/BrandModal';
import TempPasswordModal from '@/components/brand/TempPasswordModal';
import InfoModal from '@/components/brand/InfoModal';

const CAT_STYLE: Record<string, string> = {
  패션: 'bg-pink-100 text-pink-600',
  뷰티: 'bg-red-100 text-red-600',
  식품: 'bg-amber-100 text-amber-700',
  생활: 'bg-emerald-100 text-emerald-600',
  스포츠: 'bg-blue-100 text-blue-600',
  기타: 'bg-slate-100 text-slate-500',
};

function genPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type SortKey = 'name' | 'commissionRate' | 'createdAt';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>(mockBrands);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'createdAt', dir: 'desc' });

  const [brandModal, setBrandModal] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [pwModal, setPwModal] = useState(false);
  const [pwTarget, setPwTarget] = useState<{ name: string; pw: string }>({ name: '', pw: '' });
  const [infoModal, setInfoModal] = useState(false);
  const [infoBrand, setInfoBrand] = useState<Brand | null>(null);

  const filtered = useMemo(() => {
    let list = brands.filter((b) => {
      const matchQ = b.name.toLowerCase().includes(query.toLowerCase());
      const matchCat = !catFilter || b.category === catFilter;
      const matchType = !typeFilter || b.type === typeFilter;
      return matchQ && matchCat && matchType;
    });

    list = [...list].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      const cmp = typeof aVal === 'number'
        ? aVal - (bVal as number)
        : String(aVal).localeCompare(String(bVal));
      return sort.dir === 'asc' ? cmp : -cmp;
    });

    return list;
  }, [brands, query, catFilter, typeFilter, sort]);

  const stats = useMemo(() => ({
    total: brands.length,
    active: brands.filter((b) => b.status === 'active').length,
    avgRate: (brands.reduce((s, b) => s + b.commissionRate, 0) / brands.length).toFixed(1),
  }), [brands]);

  const handleSave = (data: BrandFormData, id?: string) => {
    if (id) {
      setBrands((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                name: data.name,
                type: data.type as Brand['type'],
                category: data.category as Brand['category'],
                commissionRate: parseFloat(data.commissionRate),
                managerPhone: data.managerPhone,
                csPhone: data.csPhone,
                memo: data.memo,
                bankName: data.bankName,
                accountHolder: data.accountHolder,
                accountNumber: data.accountNumber,
                businessName: data.businessName,
                businessNumber: data.businessNumber,
                loginId: data.loginId,
              }
            : b
        )
      );
    } else {
      const newBrand: Brand = {
        id: String(Date.now()),
        name: data.name,
        type: data.type as Brand['type'],
        category: data.category as Brand['category'],
        commissionRate: parseFloat(data.commissionRate),
        managerPhone: data.managerPhone,
        csPhone: data.csPhone,
        memo: data.memo,
        bankName: data.bankName,
        accountHolder: data.accountHolder,
        accountNumber: data.accountNumber,
        businessName: data.businessName,
        businessNumber: data.businessNumber,
        loginId: data.loginId,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setBrands((prev) => [newBrand, ...prev]);
    }
    setBrandModal(false);
    setEditBrand(null);
  };

  const handleDelete = (id: string) => {
    const target = brands.find((b) => b.id === id);
    if (!target) return;
    if (!confirm(`"${target.name}" 브랜드를 삭제하시겠습니까?`)) return;
    setBrands((prev) => prev.filter((b) => b.id !== id));
  };

  const handleIssuePw = (brand: Brand) => {
    setPwTarget({ name: brand.name, pw: genPassword() });
    setPwModal(true);
  };

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }
    );
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sort.key === k ? (
      sort.dir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
    ) : (
      <ChevronDown size={13} className="opacity-30" />
    );

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold">브랜드 관리</h1>
          <p className="text-sm text-slate-400 mt-1">등록된 브랜드를 조회하고 관리합니다.</p>
        </div>
        <button
          onClick={() => { setEditBrand(null); setBrandModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors"
        >
          <Plus size={16} />
          브랜드 추가
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <StatCard label="전체 브랜드" value={stats.total} sub="등록" subColor="indigo" />
        <StatCard label="활성 브랜드" value={stats.active} sub="운영 중" subColor="emerald" />
        <StatCard label="평균 수수료율" value={`${stats.avgRate}%`} sub="평균" subColor="indigo" />
      </div>

      {/* Toolbar */}
      <div className="flex gap-2.5 mb-4 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="브랜드명 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400"
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400"
        >
          <option value="">전체 타입</option>
          {BRAND_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length}개 브랜드</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <Th>
                <button onClick={() => toggleSort('name')} className="flex items-center gap-1">
                  브랜드 <SortIcon k="name" />
                </button>
              </Th>
              <Th>타입</Th>
              <Th>카테고리</Th>
              <Th>
                <button onClick={() => toggleSort('commissionRate')} className="flex items-center gap-1">
                  수수료율 <SortIcon k="commissionRate" />
                </button>
              </Th>
              <Th>담당자 번호</Th>
              <Th>CS 전화번호</Th>
              <Th>상태</Th>
              <Th>관리</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-slate-400 text-sm">
                  검색 결과가 없습니다.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {b.name[0]}
                      </div>
                      <span className="font-semibold text-sm">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold bg-indigo-50 text-indigo-500 px-2 py-1 rounded-md">
                      {b.type}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${CAT_STYLE[b.category]}`}>
                      {b.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-sm font-bold">{b.commissionRate}%</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{b.managerPhone}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-500">{b.csPhone || '—'}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      b.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {b.status === 'active' ? '활성' : '비활성'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-1.5">
                      <IconBtn
                        title="상세 정보"
                        color="indigo"
                        onClick={() => { setInfoBrand(b); setInfoModal(true); }}
                      >
                        <Info size={14} />
                      </IconBtn>
                      <IconBtn
                        title="수정"
                        color="indigo"
                        onClick={() => { setEditBrand(b); setBrandModal(true); }}
                      >
                        <Pencil size={14} />
                      </IconBtn>
                      <IconBtn
                        title="임시 비밀번호 발급"
                        color="amber"
                        onClick={() => handleIssuePw(b)}
                      >
                        <Key size={14} />
                      </IconBtn>
                      <IconBtn
                        title="삭제"
                        color="rose"
                        onClick={() => handleDelete(b.id)}
                      >
                        <Trash2 size={14} />
                      </IconBtn>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <BrandModal
        open={brandModal}
        brand={editBrand}
        onClose={() => { setBrandModal(false); setEditBrand(null); }}
        onSave={handleSave}
      />
      <TempPasswordModal
        open={pwModal}
        brandName={pwTarget.name}
        password={pwTarget.pw}
        onClose={() => setPwModal(false)}
      />
      <InfoModal
        open={infoModal}
        brand={infoBrand}
        onClose={() => setInfoModal(false)}
      />
    </div>
  );
}

function StatCard({ label, value, sub, subColor }: { label: string; value: string | number; sub: string; subColor: 'indigo' | 'emerald' }) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-500',
    emerald: 'bg-emerald-50 text-emerald-600',
  };
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <p className="text-xs text-slate-400 font-semibold mb-2">{label}</p>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[subColor]}`}>{sub}</span>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-[11.5px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  );
}

function IconBtn({
  children,
  title,
  color,
  onClick,
}: {
  children: React.ReactNode;
  title: string;
  color: 'indigo' | 'amber' | 'rose';
  onClick: () => void;
}) {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-500 hover:bg-indigo-100',
    amber: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
    rose: 'bg-rose-50 text-rose-500 hover:bg-rose-100',
  };
  return (
    <button
      title={title}
      onClick={onClick}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${colors[color]}`}
    >
      {children}
    </button>
  );
}
