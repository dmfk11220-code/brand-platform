'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import { Plus, Search, Pencil, Trash2, ShoppingBag, Calendar, FileSpreadsheet, Upload, CheckCircle2, ChevronRight } from 'lucide-react';

// ── 타입 ──────────────────────────────────────────────
type SaleType = '마켓(공구)' | '상시판매';
type ContractType = 'RS' | 'RS+MG' | 'MG';
type SalesChannel = '브랜드몰' | '자사몰' | '타 플랫폼';
type ProductStatus = '판매중' | '진행예정' | '진행완료' | '품절' | '숨김';
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
  creator: string;
  thumbnail: string;
  createdAt: string;
  saleType: SaleType;
  // 마켓(공구) 전용
  contract?: ContractType;
  channel?: SalesChannel;
  rsRate?: number;
  dhRatio?: number;
  crRatio?: number;
  mgAmount?: number;
  marketStart?: string;
  marketEnd?: string;
  revenue?: number;
  crPaid?: number;
  dhProfit?: number;
}

interface ParsedCandidate {
  sheet: string;
  label: string;
  value: number;
  isTotal: boolean;
}

// ── 목업 데이터 ──────────────────────────────────────
const mockProducts: Product[] = [
  {
    id: 'm01', name: '뉴치트 쉐이크', brand: '뉴치트', category: '식품', price: 66900, discountRate: 0,
    stock: 0, status: '진행완료', sales: 250, creator: '워니', thumbnail: '🥤', createdAt: '2026-04-27',
    saleType: '마켓(공구)', contract: 'RS', channel: '브랜드몰',
    rsRate: 0.20, dhRatio: 3, crRatio: 7,
    marketStart: '2026.04.27', marketEnd: '2026.05.01',
    revenue: 18719100, crPaid: 2382431, dhProfit: 971042,
  },
  {
    id: 'm02', name: '율무톡스 버블팩', brand: '셀올로지', category: '뷰티', price: 42800, discountRate: 0,
    stock: 0, status: '진행완료', sales: 0, creator: '다빈', thumbnail: '🫧', createdAt: '2026-04-23',
    saleType: '마켓(공구)', contract: 'RS', channel: '자사몰',
    rsRate: 0.40, dhRatio: 3, crRatio: 7,
    marketStart: '2026.04.23', marketEnd: '2026.04.26',
  },
  {
    id: 'm03', name: 'KAIA 레이어드 세트', brand: '스퀘어라인', category: '패션', price: 88500, discountRate: 0,
    stock: 0, status: '진행완료', sales: 225, creator: '채도', thumbnail: '👗', createdAt: '2026-03-17',
    saleType: '마켓(공구)', contract: 'RS+MG', channel: '브랜드몰',
    rsRate: 0.30, dhRatio: 2, crRatio: 8,
    marketStart: '2026.03.17', marketEnd: '2026.03.22',
    revenue: 19886900, crPaid: 4295570, dhProfit: 1073893,
  },
  {
    id: 'm04', name: '오로라렌즈 콜라보 에디션', brand: '오로라렌즈', category: '뷰티', price: 96600, discountRate: 0,
    stock: 0, status: '진행완료', sales: 827, creator: '포백', thumbnail: '👁️', createdAt: '2026-03-26',
    saleType: '마켓(공구)', contract: 'RS+MG', channel: '브랜드몰',
    rsRate: 0.25, dhRatio: 3, crRatio: 7,
    marketStart: '2026.03.26', marketEnd: '2026.03.31',
    revenue: 79933150, crPaid: 11814844, dhProfit: 5063505,
  },
  {
    id: 'm05', name: '한솥밥 떡갈비 도시락', brand: '풍림푸드', category: '식품', price: 12900, discountRate: 0,
    stock: 0, status: '진행완료', sales: 480, creator: '승진', thumbnail: '🍱', createdAt: '2026-04-08',
    saleType: '마켓(공구)', contract: 'RS', channel: '브랜드몰',
    rsRate: 0.17, dhRatio: 3, crRatio: 7,
    marketStart: '2026.04.08', marketEnd: '2026.04.10',
    revenue: 6199050, crPaid: 670625, dhProfit: 287411,
  },
  {
    id: 'm06', name: '앰플엔 세럼 기획세트', brand: '앰플엔', category: '뷰티', price: 58000, discountRate: 0,
    stock: 0, status: '진행완료', sales: 0, creator: '리비', thumbnail: '💧', createdAt: '2026-04-08',
    saleType: '마켓(공구)', contract: 'RS+MG', channel: '브랜드몰',
    mgAmount: 7000000, dhRatio: 3, crRatio: 7,
    marketStart: '2026.04.08', marketEnd: '2026.04.12',
    crPaid: 3850000, dhProfit: 3150000,
  },
  {
    id: 'm07', name: '그린몬스터 콜라보 티셔츠', brand: '그린몬스터', category: '패션', price: 49000, discountRate: 0,
    stock: 150, status: '진행예정', sales: 0, creator: '채도', thumbnail: '👕', createdAt: '2026-05-12',
    saleType: '마켓(공구)', contract: 'RS+MG', channel: '브랜드몰',
    rsRate: 0.30, dhRatio: 2, crRatio: 8, mgAmount: 4000000,
    marketStart: '2026.05.12', marketEnd: '2026.05.15',
  },
  {
    id: 'm08', name: '플라이밀 프로틴바 10입', brand: '플라이밀', category: '식품', price: 32000, discountRate: 0,
    stock: 300, status: '진행예정', sales: 0, creator: '승진', thumbnail: '🍫', createdAt: '2026-05-21',
    saleType: '마켓(공구)', contract: 'RS', channel: '브랜드몰',
    rsRate: 0.25, dhRatio: 3, crRatio: 7,
    marketStart: '2026.05.21', marketEnd: '2026.05.24',
  },
  // ── 상시판매 ──
  {
    id: 's01', name: '두호 DH 에코백', brand: '두호', category: '패션', price: 29000, discountRate: 10,
    stock: 245, status: '판매중', sales: 382, creator: '레미니씬', thumbnail: '👜', createdAt: '2025-12-01',
    saleType: '상시판매',
  },
  {
    id: 's02', name: '두호 시그니처 후드', brand: '두호', category: '패션', price: 69000, discountRate: 0,
    stock: 88, status: '판매중', sales: 215, creator: '뭉순임당', thumbnail: '🧥', createdAt: '2026-01-15',
    saleType: '상시판매',
  },
  {
    id: 's03', name: '무결점 선크림 SPF50+', brand: '어뮤즈', category: '뷰티', price: 28000, discountRate: 5,
    stock: 0, status: '품절', sales: 1840, creator: '진경', thumbnail: '🧴', createdAt: '2025-11-20',
    saleType: '상시판매',
  },
  {
    id: 's04', name: '유기농 프로틴 그래놀라', brand: '마켓컬리', category: '식품', price: 14900, discountRate: 0,
    stock: 620, status: '판매중', sales: 973, creator: '', thumbnail: '🥣', createdAt: '2026-02-10',
    saleType: '상시판매',
  },
];

// ── 상수 ──────────────────────────────────────────────
const SALE_TYPES: SaleType[] = ['마켓(공구)', '상시판매'];
const CONTRACT_TYPES: ContractType[] = ['RS', 'RS+MG', 'MG'];
const CHANNELS: SalesChannel[] = ['브랜드몰', '자사몰', '타 플랫폼'];
const CATEGORIES: ProductCategory[] = ['패션', '뷰티', '식품', '생활', '스포츠', '기타'];
const STATUSES: ProductStatus[] = ['판매중', '진행예정', '진행완료', '품절', '숨김'];
const CREATORS = ['레미니씬', '애정', '김체리', '진경', '이펠(최명)', '류스펜나', '켈리', '송수이', '뭉순임당', '인아짱', '제롬', '츄베릅', '그대들의 센세', '융나', '황소영', '워니', '포백', '채도', '다빈', '승진', '리비', '티비조씨'];

// ── 스타일 맵 ─────────────────────────────────────────
const SALE_TYPE_STYLE: Record<SaleType, string> = {
  '마켓(공구)': 'bg-violet-50 text-violet-600',
  '상시판매':   'bg-sky-50 text-sky-600',
};
const CONTRACT_STYLE: Record<ContractType, string> = {
  'RS':    'bg-indigo-50 text-indigo-600',
  'RS+MG': 'bg-purple-50 text-purple-600',
  'MG':    'bg-amber-50 text-amber-600',
};
const STATUS_STYLE: Record<ProductStatus, string> = {
  '판매중':   'bg-emerald-50 text-emerald-600',
  '진행예정': 'bg-blue-50 text-blue-600',
  '진행완료': 'bg-slate-100 text-slate-500',
  '품절':     'bg-rose-50 text-rose-500',
  '숨김':     'bg-slate-100 text-slate-400',
};
const CAT_STYLE: Record<ProductCategory, string> = {
  패션: 'bg-pink-100 text-pink-600', 뷰티: 'bg-red-100 text-red-600',
  식품: 'bg-amber-100 text-amber-700', 생활: 'bg-emerald-100 text-emerald-600',
  스포츠: 'bg-blue-100 text-blue-600', 기타: 'bg-slate-100 text-slate-500',
};

const fmtWon = (n: number) => `₩${n.toLocaleString()}`;
const fmtShort = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(0)}만` : n.toLocaleString();
const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white";

// ── RS 계산 ──────────────────────────────────────────
function calcRS(p: Product, revenue: number) {
  const rsRate = p.rsRate ?? 0;
  const dhRatio = p.dhRatio ?? 3;
  const crRatio = p.crRatio ?? 7;
  const total = dhRatio + crRatio;
  const rsFee = revenue * rsRate;
  const rsFeeExclVat = rsFee / 1.1;
  const crPaid = Math.round(rsFeeExclVat * (crRatio / total));
  const dhProfit = Math.round(rsFeeExclVat * (dhRatio / total));
  return { rsFee: Math.round(rsFee), rsFeeExclVat: Math.round(rsFeeExclVat), crPaid, dhProfit };
}

// ── Excel 파싱 ────────────────────────────────────────
async function parseSettlementExcel(file: File): Promise<ParsedCandidate[]> {
  const XLSX = await import('xlsx');
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });

  const candidates: ParsedCandidate[] = [];
  const KEYWORDS = /합계|총|판매금액|거래액|매출액|결제금액|주문금액|실매출/;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 });

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const val = row[c];
        if (typeof val !== 'number' || val < 1_000_000) continue;

        // 주변 텍스트로 라벨 추출
        const leftTexts = row.slice(Math.max(0, c - 3), c).filter(x => typeof x === 'string' && x.trim());
        const aboveText = r > 0 ? String(rows[r - 1]?.[c] ?? '') : '';
        const rightText = typeof row[c + 1] === 'string' ? String(row[c + 1]) : '';
        const contextText = [...leftTexts, aboveText, rightText].filter(Boolean).join(' ').trim();

        const isTotal = KEYWORDS.test(contextText) ||
          (r === rows.length - 1) || // 마지막 행
          (typeof row[0] === 'string' && KEYWORDS.test(String(row[0])));

        candidates.push({
          sheet: sheetName,
          label: contextText || `${sheetName} ${r + 1}행`,
          value: val,
          isTotal,
        });
      }
    }
  }

  // 중복 값 제거 + 정렬 (합계 키워드 먼저, 큰 값 먼저)
  const seen = new Set<number>();
  return candidates
    .sort((a, b) => (b.isTotal ? 1 : 0) - (a.isTotal ? 1 : 0) || b.value - a.value)
    .filter(c => { if (seen.has(c.value)) return false; seen.add(c.value); return true; })
    .slice(0, 12);
}

// ── 정산서 업로드 모달 ─────────────────────────────────
function SettlementUploadModal({
  product, onClose, onApply,
}: {
  product: Product;
  onClose: () => void;
  onApply: (revenue: number, crPaid: number, dhProfit: number) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<'upload' | 'pick' | 'confirm'>('upload');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<ParsedCandidate[]>([]);
  const [picked, setPicked] = useState<ParsedCandidate | null>(null);
  const [drag, setDrag] = useState(false);
  const [manualRevenue, setManualRevenue] = useState('');

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return alert('xlsx / xls / csv 파일만 업로드 가능합니다.');
    }
    setLoading(true);
    try {
      const list = await parseSettlementExcel(file);
      setCandidates(list);
      setStep(list.length > 0 ? 'pick' : 'confirm');
    } catch {
      alert('파일 파싱 중 오류가 발생했습니다. 파일을 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const hasRS = product.contract === 'RS' || product.contract === 'RS+MG';

  const confirmRevenue = picked?.value ?? Number(manualRevenue.replace(/,/g, ''));
  const calc = hasRS && confirmRevenue > 0 ? calcRS(product, confirmRevenue) : null;

  const handleApply = () => {
    if (!confirmRevenue) return alert('거래액을 선택하거나 직접 입력해주세요.');
    const crPaid = calc?.crPaid ?? product.crPaid ?? 0;
    const dhProfit = calc?.dhProfit ?? product.dhProfit ?? 0;
    onApply(confirmRevenue, crPaid, dhProfit);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-start justify-between px-7 pt-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileSpreadsheet size={16} className="text-emerald-500" />
              <h2 className="text-[16px] font-bold">정산서 업로드</h2>
            </div>
            <p className="text-xs text-slate-400">
              <span className="font-semibold text-slate-600">{product.name}</span> · {product.brand}
              {product.contract && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 text-[10px] font-bold">{product.contract}</span>}
              {hasRS && product.rsRate && <span className="ml-1 text-slate-400">RS {Math.round(product.rsRate * 100)}%</span>}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 text-lg mt-0.5">✕</button>
        </div>

        {/* Step 인디케이터 */}
        <div className="flex items-center gap-1 px-7 py-3 bg-slate-50/60 text-[11px] font-semibold text-slate-400">
          {(['엑셀 업로드', '거래액 선택', '계산 확인'] as const).map((label, i) => {
            const stepIdx = step === 'upload' ? 0 : step === 'pick' ? 1 : 2;
            const active = stepIdx === i;
            const done = stepIdx > i;
            return (
              <span key={label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight size={11} className="text-slate-300" />}
                <span className={done ? 'text-emerald-500' : active ? 'text-indigo-600' : ''}>{done ? '✓ ' : ''}{label}</span>
              </span>
            );
          })}
        </div>

        <div className="px-7 py-5">
          {/* STEP 1: 업로드 */}
          {step === 'upload' && (
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-3 transition-colors cursor-pointer
                ${drag ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              {loading
                ? <><div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" /><p className="text-sm text-slate-400">파싱 중...</p></>
                : <>
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Upload size={22} className="text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">브랜드 정산서 파일을 드래그하거나 클릭해서 업로드</p>
                    <p className="text-xs text-slate-400">.xlsx · .xls · .csv 지원</p>
                  </>
              }
            </div>
          )}

          {/* STEP 2: 거래액 후보 선택 */}
          {step === 'pick' && (
            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-semibold text-slate-700">파일에서 감지된 금액을 선택하세요</p>
              <p className="text-[11px] text-slate-400 -mt-1">총 거래액(판매금액 합계)에 해당하는 값을 골라주세요. 없으면 직접 입력도 가능해요.</p>
              <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                {candidates.map((c, i) => (
                  <button key={i} onClick={() => { setPicked(c); setStep('confirm'); }}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all
                      ${c.isTotal ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40'}`}>
                    <div>
                      <div className="flex items-center gap-2">
                        {c.isTotal && <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 font-bold">합계</span>}
                        <span className="text-xs text-slate-500 truncate max-w-[240px]">{c.sheet} · {c.label}</span>
                      </div>
                      <p className="text-[15px] font-bold text-slate-800 mt-0.5">₩{c.value.toLocaleString()}</p>
                    </div>
                    <ChevronRight size={15} className="text-slate-300 flex-shrink-0" />
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[11px] text-slate-400">직접 입력</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualRevenue}
                  onChange={e => setManualRevenue(e.target.value)}
                  placeholder="거래액 직접 입력 (숫자)"
                  className={inputCls}
                />
                <button onClick={() => { if (manualRevenue) setStep('confirm'); }}
                  className="px-4 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 whitespace-nowrap">
                  입력
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: 계산 확인 */}
          {step === 'confirm' && (
            <div className="flex flex-col gap-4">
              {/* 선택된 거래액 */}
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[11px] text-slate-400 font-semibold mb-0.5">총 거래액 (정산서 기준)</p>
                  <p className="text-[22px] font-bold text-slate-800">₩{confirmRevenue.toLocaleString()}</p>
                  {picked && <p className="text-[10px] text-slate-400 mt-0.5">{picked.sheet} · {picked.label}</p>}
                </div>
                <button onClick={() => { setPicked(null); setStep(candidates.length > 0 ? 'pick' : 'upload'); }}
                  className="text-[11px] text-indigo-500 hover:underline">변경</button>
              </div>

              {/* RS 계산 결과 */}
              {hasRS && calc ? (
                <div className="bg-violet-50/60 border border-violet-100 rounded-xl p-4 flex flex-col gap-2.5">
                  <p className="text-[11px] font-bold text-violet-700 uppercase tracking-wider">RS 자동 계산</p>
                  <div className="grid grid-cols-2 gap-3">
                    <CalcRow label="RS 수수료" value={calc.rsFee} sub={`거래액 × ${Math.round((product.rsRate ?? 0) * 100)}%`} />
                    <CalcRow label="RS 수수료 (VAT 제외)" value={calc.rsFeeExclVat} sub="÷ 1.1" />
                    <CalcRow label="크리에이터 지급" value={calc.crPaid} sub={`× ${product.crRatio}/${(product.dhRatio ?? 0) + (product.crRatio ?? 0)}`} highlight="blue" />
                    <CalcRow label="DH 이익" value={calc.dhProfit} sub={`× ${product.dhRatio}/${(product.dhRatio ?? 0) + (product.crRatio ?? 0)}`} highlight="indigo" />
                  </div>
                  {product.contract === 'RS+MG' && product.mgAmount && (
                    <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                      MG ₩{product.mgAmount.toLocaleString()} — 크리에이터 지급에 이미 반영된 경우 별도 조정이 필요합니다.
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-[12px] text-amber-700">
                    {product.contract === 'MG' ? 'MG 계약 — RS 계산 없이 거래액만 기록됩니다.' : 'RS율이 설정되지 않아 거래액만 기록됩니다.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-2 px-7 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">취소</button>
          {step === 'confirm' && (
            <button onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600">
              <CheckCircle2 size={14} /> 적용하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CalcRow({ label, value, sub, highlight }: { label: string; value: number; sub: string; highlight?: 'blue' | 'indigo' }) {
  const color = highlight === 'blue' ? 'text-blue-600' : highlight === 'indigo' ? 'text-indigo-600' : 'text-slate-700';
  return (
    <div className="bg-white rounded-lg border border-violet-100 px-3 py-2.5">
      <p className="text-[10px] text-slate-400 font-semibold">{label}</p>
      <p className={`text-[14px] font-bold mt-0.5 ${color}`}>₩{value.toLocaleString()}</p>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [query, setQuery] = useState('');
  const [saleTypeFilter, setSaleTypeFilter] = useState<SaleType | ''>('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [settlementTarget, setSettlementTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => products.filter(p =>
    (p.name.toLowerCase().includes(query.toLowerCase()) || p.brand.toLowerCase().includes(query.toLowerCase()) || p.creator.includes(query)) &&
    (!saleTypeFilter || p.saleType === saleTypeFilter) &&
    (!catFilter || p.category === catFilter) &&
    (!statusFilter || p.status === statusFilter)
  ), [products, query, saleTypeFilter, catFilter, statusFilter]);

  const toggleAll = () => {
    if (filtered.every(p => selected.has(p.id)))
      setSelected(prev => { const s = new Set(prev); filtered.forEach(p => s.delete(p.id)); return s; });
    else
      setSelected(prev => { const s = new Set(prev); filtered.forEach(p => s.add(p.id)); return s; });
  };
  const toggleOne = (id: string) => setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const allChecked = filtered.length > 0 && filtered.every(p => selected.has(p.id));

  const handleBulkDelete = () => {
    if (!selected.size || !confirm(`선택한 ${selected.size}개 상품을 삭제하시겠습니까?`)) return;
    setProducts(prev => prev.filter(p => !selected.has(p.id)));
    setSelected(new Set());
  };

  const handleDelete = (id: string) => {
    const p = products.find(x => x.id === id);
    if (!p || !confirm(`"${p.name}" 상품을 삭제하시겠습니까?`)) return;
    setProducts(prev => prev.filter(x => x.id !== id));
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm({ saleType: '마켓(공구)', status: '진행예정', category: '뷰티', discountRate: 0, stock: 0, contract: 'RS', channel: '브랜드몰', dhRatio: 3, crRatio: 7 });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    setForm({ ...p });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name?.trim() || !form.brand?.trim()) return alert('상품명과 브랜드를 입력해주세요.');
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...form } as Product : p));
    } else {
      setProducts(prev => [{
        id: String(Date.now()),
        name: form.name!, brand: form.brand!, category: form.category as ProductCategory || '기타',
        price: Number(form.price) || 0, discountRate: Number(form.discountRate) || 0,
        stock: Number(form.stock) || 0, status: form.status as ProductStatus || '진행예정',
        sales: 0, creator: form.creator || '', thumbnail: '📦',
        createdAt: new Date().toISOString().slice(0, 10),
        saleType: form.saleType as SaleType || '마켓(공구)',
        contract: form.contract as ContractType || undefined,
        channel: form.channel as SalesChannel || undefined,
        rsRate: form.rsRate ? Number(form.rsRate) : undefined,
        dhRatio: form.dhRatio ? Number(form.dhRatio) : undefined,
        crRatio: form.crRatio ? Number(form.crRatio) : undefined,
        mgAmount: form.mgAmount ? Number(form.mgAmount) : undefined,
        marketStart: form.marketStart, marketEnd: form.marketEnd,
      }, ...prev]);
    }
    setModalOpen(false);
  };

  const handleSettlementApply = (revenue: number, crPaid: number, dhProfit: number) => {
    if (!settlementTarget) return;
    setProducts(prev => prev.map(p =>
      p.id === settlementTarget.id ? { ...p, revenue, crPaid, dhProfit, status: '진행완료' } : p
    ));
    setSettlementTarget(null);
  };

  const set = (key: string, value: string | number) => setForm(prev => ({ ...prev, [key]: value }));
  const isMarket = form.saleType === '마켓(공구)';
  const hasMG = form.contract === 'MG' || form.contract === 'RS+MG';
  const hasRS = form.contract === 'RS' || form.contract === 'RS+MG';

  const marketCount = products.filter(p => p.saleType === '마켓(공구)').length;
  const regularCount = products.filter(p => p.saleType === '상시판매').length;
  const totalRevenue = products.reduce((s, p) => s + (p.revenue ?? 0), 0);
  const totalDhProfit = products.reduce((s, p) => s + (p.dhProfit ?? 0), 0);
  const pendingCount = products.filter(p => p.saleType === '마켓(공구)' && p.status === '진행완료' && !p.revenue).length;

  return (
    <div className="p-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold">상품 관리</h1>
          <p className="text-sm text-slate-400 mt-1">마켓(공구) · 상시판매 상품을 통합 관리합니다.</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors">
          <Plus size={16} /> 상품 추가
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag size={14} className="text-violet-500" />
            <p className="text-xs text-slate-400 font-semibold">마켓(공구)</p>
          </div>
          <p className="text-2xl font-bold">{marketCount}<span className="text-sm font-normal text-slate-400 ml-1">건</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-sky-500" />
            <p className="text-xs text-slate-400 font-semibold">상시판매</p>
          </div>
          <p className="text-2xl font-bold">{regularCount}<span className="text-sm font-normal text-slate-400 ml-1">건</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-semibold mb-2">공구 집계 거래액</p>
          <p className="text-2xl font-bold">₩{fmtShort(totalRevenue)}</p>
          {pendingCount > 0 && <p className="text-[11px] text-amber-500 mt-1">정산서 미등록 {pendingCount}건</p>}
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-semibold mb-2">DH 순이익 (공구)</p>
          <p className="text-2xl font-bold text-indigo-600">₩{fmtShort(totalDhProfit)}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-2 mb-4 items-center flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="상품명·브랜드·크리에이터 검색"
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-400" />
        </div>
        <div className="flex gap-1.5">
          {(['', ...SALE_TYPES] as const).map(t => (
            <button key={t} onClick={() => setSaleTypeFilter(t as SaleType | '')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${saleTypeFilter === t ? 'bg-indigo-500 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'}`}>
              {t || '전체'}
            </button>
          ))}
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none">
          <option value="">전체 카테고리</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white outline-none">
          <option value="">전체 상태</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{filtered.length}개</span>
        {selected.size > 0 && (
          <button onClick={handleBulkDelete}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-500 text-white text-sm font-semibold rounded-lg hover:bg-rose-600">
            <Trash2 size={13} /> {selected.size}개 삭제
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} className="rounded border-slate-300 accent-indigo-500" />
              </th>
              {['상품', '브랜드', '카테고리', '판매유형', '계약', '채널', '진행일', '판매가', '거래액', 'DH이익', '크리에이터', '상태', '관리'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={14} className="py-16 text-center text-slate-400 text-sm">검색 결과가 없습니다.</td></tr>
            ) : filtered.map(p => (
              <tr key={p.id} className={`border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors ${selected.has(p.id) ? 'bg-indigo-50/40' : ''}`}>
                <td className="px-4 py-3.5">
                  <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleOne(p.id)} className="rounded border-slate-300 accent-indigo-500" />
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{p.thumbnail}</span>
                    <span className="font-semibold text-sm text-slate-800">{p.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-sm text-slate-500">{p.brand}</td>
                <td className="px-3 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${CAT_STYLE[p.category]}`}>{p.category}</span>
                </td>
                <td className="px-3 py-3.5">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${SALE_TYPE_STYLE[p.saleType]}`}>{p.saleType}</span>
                </td>
                <td className="px-3 py-3.5">
                  {p.contract
                    ? <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${CONTRACT_STYLE[p.contract]}`}>{p.contract}</span>
                    : <span className="text-slate-300 text-xs">—</span>
                  }
                </td>
                <td className="px-3 py-3.5 text-xs text-slate-500 whitespace-nowrap">{p.channel ?? '—'}</td>
                <td className="px-3 py-3.5 text-xs text-slate-400 whitespace-nowrap">
                  {p.marketStart ? `${p.marketStart.slice(5)} ~ ${p.marketEnd?.slice(5) ?? ''}` : '—'}
                </td>
                <td className="px-3 py-3.5 text-sm font-bold text-slate-800">
                  {p.price > 0 ? fmtWon(p.price) : '—'}
                </td>
                {/* 거래액 */}
                <td className="px-3 py-3.5">
                  {p.revenue != null
                    ? <span className="text-sm font-semibold text-slate-700">₩{fmtShort(p.revenue)}</span>
                    : p.saleType === '마켓(공구)'
                      ? <button onClick={() => setSettlementTarget(p)}
                          className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold hover:text-amber-600 whitespace-nowrap">
                          <FileSpreadsheet size={11} /> 정산서 등록
                        </button>
                      : <span className="text-slate-300 text-xs">—</span>
                  }
                </td>
                <td className="px-3 py-3.5">
                  {p.dhProfit != null
                    ? <span className="text-sm font-bold text-indigo-600">₩{fmtShort(p.dhProfit)}</span>
                    : <span className="text-slate-300 text-xs">—</span>
                  }
                </td>
                <td className="px-3 py-3.5 text-sm font-medium text-slate-600">{p.creator || '—'}</td>
                <td className="px-3 py-3.5">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${STATUS_STYLE[p.status]}`}>{p.status}</span>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex gap-1.5">
                    {p.saleType === '마켓(공구)' && (
                      <button onClick={() => setSettlementTarget(p)}
                        title="정산서 업로드"
                        className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 flex items-center justify-center">
                        <FileSpreadsheet size={13} />
                      </button>
                    )}
                    <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 상품 추가/수정 모달 */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-2xl w-[580px] max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-7 pt-6 pb-1">
              <h2 className="text-[17px] font-bold">{editProduct ? '상품 수정' : '상품 추가'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 text-lg">✕</button>
            </div>

            <div className="px-7 py-5 flex flex-col gap-3">
              {/* 판매 유형 */}
              <div>
                <p className="text-[12.5px] font-semibold text-slate-600 mb-2">판매 유형 <span className="text-rose-400">*</span></p>
                <div className="flex gap-2">
                  {SALE_TYPES.map(t => (
                    <button key={t} type="button"
                      onClick={() => setForm(prev => ({ ...prev, saleType: t, contract: t === '마켓(공구)' ? 'RS' : undefined }))}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${form.saleType === t ? (t === '마켓(공구)' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-sky-400 bg-sky-50 text-sky-700') : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                      {t === '마켓(공구)' ? '🛒 마켓(공구)' : '🏪 상시판매'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="상품명" required>
                  <input value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="상품명 입력" className={inputCls} />
                </Field>
                <Field label="브랜드" required>
                  <input value={form.brand || ''} onChange={e => set('brand', e.target.value)} placeholder="브랜드명" className={inputCls} />
                </Field>
                <Field label="카테고리">
                  <select value={form.category || ''} onChange={e => set('category', e.target.value)} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="상태">
                  <select value={form.status || '진행예정'} onChange={e => set('status', e.target.value)} className={inputCls}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="판매가 (원)">
                  <input type="number" value={form.price || ''} onChange={e => set('price', e.target.value)} placeholder="0" className={inputCls} />
                </Field>
                <Field label="재고">
                  <input type="number" value={form.stock || ''} onChange={e => set('stock', e.target.value)} placeholder="0" className={inputCls} />
                </Field>
              </div>

              <Field label="크리에이터">
                <select value={form.creator || ''} onChange={e => set('creator', e.target.value)} className={inputCls}>
                  <option value="">선택 안 함</option>
                  {CREATORS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              {/* 마켓(공구) 전용 */}
              {isMarket && (
                <div className="border border-violet-100 rounded-xl p-4 bg-violet-50/40 flex flex-col gap-3">
                  <p className="text-[12px] font-bold text-violet-700 uppercase tracking-wider">🛒 공구 설정</p>
                  <div>
                    <p className="text-[12.5px] font-semibold text-slate-600 mb-1.5">계약 형태</p>
                    <div className="flex gap-2">
                      {CONTRACT_TYPES.map(c => (
                        <button key={c} type="button" onClick={() => set('contract', c)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${form.contract === c ? 'border-violet-500 bg-violet-100 text-violet-700' : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="판매 채널">
                      <select value={form.channel || ''} onChange={e => set('channel', e.target.value)} className={inputCls}>
                        {CHANNELS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </Field>
                    {hasRS && (
                      <Field label="RS 수수료율 (%)">
                        <input type="number" value={form.rsRate ? Math.round(form.rsRate * 100) : ''} onChange={e => set('rsRate', Number(e.target.value) / 100)} placeholder="예: 20" className={inputCls} />
                      </Field>
                    )}
                    {hasRS && (
                      <>
                        <Field label="DH 분배율">
                          <input type="number" value={form.dhRatio || ''} onChange={e => set('dhRatio', e.target.value)} placeholder="예: 3" className={inputCls} />
                        </Field>
                        <Field label="크리에이터 분배율">
                          <input type="number" value={form.crRatio || ''} onChange={e => set('crRatio', e.target.value)} placeholder="예: 7" className={inputCls} />
                        </Field>
                      </>
                    )}
                    {hasMG && (
                      <Field label="MG 금액 (원)">
                        <input type="number" value={form.mgAmount || ''} onChange={e => set('mgAmount', e.target.value)} placeholder="예: 5000000" className={inputCls} />
                      </Field>
                    )}
                    <Field label="진행 시작일">
                      <input value={form.marketStart || ''} onChange={e => set('marketStart', e.target.value)} placeholder="2026.05.21" className={inputCls} />
                    </Field>
                    <Field label="진행 종료일">
                      <input value={form.marketEnd || ''} onChange={e => set('marketEnd', e.target.value)} placeholder="2026.05.24" className={inputCls} />
                    </Field>
                  </div>
                  {hasRS && form.dhRatio && form.crRatio && (
                    <div className="bg-white rounded-lg border border-violet-100 px-3 py-2.5 flex gap-4 text-xs">
                      <span className="text-slate-500">분배 비율</span>
                      <span className="text-indigo-600 font-bold">DH {Math.round((Number(form.dhRatio) / (Number(form.dhRatio) + Number(form.crRatio))) * 100)}%</span>
                      <span className="text-blue-600 font-bold">크리에이터 {Math.round((Number(form.crRatio) / (Number(form.dhRatio) + Number(form.crRatio))) * 100)}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 px-7 py-5 border-t border-slate-100">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-indigo-500 border border-indigo-300 rounded-lg hover:bg-indigo-50">취소</button>
              <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 정산서 업로드 모달 */}
      {settlementTarget && (
        <SettlementUploadModal
          product={settlementTarget}
          onClose={() => setSettlementTarget(null)}
          onApply={handleSettlementApply}
        />
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
