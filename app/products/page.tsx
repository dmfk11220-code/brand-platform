'use client';

import { useState, useMemo } from 'react';
import { Plus, Search, Pencil, Trash2, Info } from 'lucide-react';

type ProductStatus = '판매중' | '품절' | '숨김';
type ProductCategory = '패션' | '뷰티' | '식품' | '생활' | '스포츠' | '기타';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  discountRate: number;
  stock: number;
  status: ProductStatus;
  sales: number;
  createdAt: string;
  thumbnail: string;
}

const mockProducts: Product[] = [
  { id: '1', name: '에어핏 레깅스 블랙', brand: '젝시믹스', category: '스포츠', price: 59000, discountRate: 10, stock: 342, status: '판매중', sales: 1823, createdAt: '2024-01-20', thumbnail: '🩱' },
  { id: '2', name: '무결점 쿠션 SPF50+', brand: '어뮤즈', category: '뷰티', price: 38000, discountRate: 0, stock: 0, status: '품절', sales: 4201, createdAt: '2024-02-14', thumbnail: '💄' },
  { id: '3', name: '린넨 와이드 팬츠', brand: 'MANGO', category: '패션', price: 89000, discountRate: 20, stock: 87, status: '판매중', sales: 632, createdAt: '2024-03-01', thumbnail: '👖' },
  { id: '4', name: '유기농 그래놀라 500g', brand: '마켓컬리', category: '식품', price: 14900, discountRate: 5, stock: 1204, status: '판매중', sales: 3871, createdAt: '2024-03-10', thumbnail: '🥣' },
  { id: '5', name: '모던 수납 선반 3단', brand: '한샘', category: '생활', price: 129000, discountRate: 15, stock: 43, status: '판매중', sales: 287, createdAt: '2024-04-05', thumbnail: '🪵' },
  { id: '6', name: '비건 립밤 라즈베리', brand: '어뮤즈', category: '뷰티', price: 12000, discountRate: 0, stock: 560, status: '숨김', sales: 921, createdAt: '2024-04-12', thumbnail: '💋' },
  { id: '7', name: '쿨링 스포츠 탑', brand: '젝시믹스', category: '스포츠', price: 42000, discountRate: 0, stock: 215, status: '판매중', sales: 1102, createdAt: '2024-05-01', thumbnail: '👕' },
];

const STATUS_STYLE: Record<ProductStatus, string> = {
  '판매중': 'bg-emerald-50 text-emerald-600',
  '품절': 'bg-rose-50 text-rose-500',
  '숨김': 'bg-slate-100 text-slate-400',
};

const CAT_STYLE: Record<ProductCategory, string> = {
  패션: 'bg-pink-100 text-pink-600',
  뷰티: 'bg-red-100 text-red-600',
  식품: 'bg-amber-100 text-amber-700',
  생활: 'bg-emerald-100 text-emerald-600',
  스포츠: 'bg-blue-100 text-blue-600',
  기타: 'bg-slate-100 text-slate-500',
};

const CATEGORIES: ProductCategory[] = ['패션', '뷰티', '식품', '생활', '스포츠', '기타'];
const STATUSES: ProductStatus[] = ['판매중', '품절', '숨김'];
const BRANDS = ['젝시믹스', '어뮤즈', 'MANGO', '마켓컬리', '한샘'];

const fmtWon = (n: number) => `₩${n.toLocaleString()}`;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});

  const filtered = useMemo(() =>
    products.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) &&
      (!catFilter || p.category === catFilter) &&
      (!statusFilter || p.status === statusFilter)
    ), [products, query, catFilter, statusFilter]);

  const stats = useMemo(() => ({
    total: products.length,
    onSale: products.filter(p => p.status === '판매중').length,
    soldOut: products.filter(p => p.status === '품절').length,
    totalSales: products.reduce((s, p) => s + p.sales, 0),
  }), [products]);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ status: '판매중', category: '패션', discountRate: 0, stock: 0 });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ ...p });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name?.trim()) return alert('상품명을 입력해주세요.');
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...form } as Product : p));
    } else {
      setProducts(prev => [{
        id: String(Date.now()),
        name: form.name!,
        brand: form.brand || BRANDS[0],
        category: form.category as ProductCategory || '패션',
        price: Number(form.price) || 0,
        discountRate: Number(form.discountRate) || 0,
        stock: Number(form.stock) || 0,
        status: form.status as ProductStatus || '판매중',
        sales: 0,
        createdAt: new Date().toISOString().slice(0, 10),
        thumbnail: '📦',
      }, ...prev]);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    const p = products.find(x => x.id === id);
    if (!p || !confirm(`"${p.name}" 상품을 삭제하시겠습니까?`)) return;
    setProducts(prev => prev.filter(x => x.id !== id));
  };

  const set = (key: keyof Product, value: string | number) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const salePrice = (price: number, rate: number) =>
    rate > 0 ? Math.round(price * (1 - rate / 100)) : price;

  return (
    <div className="p-10">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold">상품 관리</h1>
          <p className="text-sm text-slate-400 mt-1">등록된 상품을 조회하고 관리합니다.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors">
          <Plus size={16} /> 상품 추가
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        {[
          { label: '전체 상품', value: stats.total, unit: '개' },
          { label: '판매중', value: stats.onSale, unit: '개' },
          { label: '품절', value: stats.soldOut, unit: '개' },
          { label: '누적 판매량', value: stats.totalSales.toLocaleString(), unit: '건' },
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
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="상품명 검색..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400" />
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400">
          <option value="">전체 카테고리</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400">
          <option value="">전체 상태</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length}개 상품</span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['상품', '브랜드', '카테고리', '정가', '할인율', '판매가', '재고', '판매량', '상태', '관리'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={10} className="py-16 text-center text-slate-400 text-sm">검색 결과가 없습니다.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{p.thumbnail}</span>
                    <span className="font-semibold text-sm">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-500">{p.brand}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${CAT_STYLE[p.category]}`}>{p.category}</span>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-400 line-through">{p.discountRate > 0 ? fmtWon(p.price) : '—'}</td>
                <td className="px-4 py-3.5 text-sm">
                  {p.discountRate > 0 ? <span className="text-rose-500 font-bold">{p.discountRate}%</span> : '—'}
                </td>
                <td className="px-4 py-3.5 text-sm font-bold">{fmtWon(salePrice(p.price, p.discountRate))}</td>
                <td className="px-4 py-3.5 text-sm">
                  <span className={p.stock === 0 ? 'text-rose-400 font-semibold' : 'text-slate-600'}>{p.stock.toLocaleString()}</span>
                </td>
                <td className="px-4 py-3.5 text-sm text-slate-600">{p.sales.toLocaleString()}</td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1.5">
                    <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors">
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
              <h2 className="text-[17px] font-bold">{editProduct ? '상품 수정' : '상품 추가'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 text-lg">✕</button>
            </div>
            <div className="px-7 py-5 flex flex-col gap-4">
              <Field label="상품명" required>
                <input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="상품명 입력" className={inputCls} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="브랜드" required>
                  <select value={form.brand || ''} onChange={e => set('brand', e.target.value)} className={inputCls}>
                    <option value="">선택</option>
                    {BRANDS.map(b => <option key={b}>{b}</option>)}
                  </select>
                </Field>
                <Field label="카테고리" required>
                  <select value={form.category || ''} onChange={e => set('category', e.target.value)} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="정가 (원)" required>
                  <input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} placeholder="0" className={inputCls} />
                </Field>
                <Field label="할인율 (%)">
                  <input type="number" value={form.discountRate || ''} onChange={e => set('discountRate', e.target.value)} placeholder="0" min="0" max="100" className={inputCls} />
                </Field>
                <Field label="재고 수량">
                  <input type="number" value={form.stock || ''} onChange={e => set('stock', e.target.value)} placeholder="0" className={inputCls} />
                </Field>
                <Field label="판매 상태">
                  <select value={form.status || '판매중'} onChange={e => set('status', e.target.value)} className={inputCls}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
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

const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white transition-colors";

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
