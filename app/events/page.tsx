'use client';

import { useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Link2, Calendar, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

// ── 타입 ──────────────────────────────────────────────
type EventStatus = '진행중' | '진행예정' | '종료';
type BannerPosition = '홈 메인' | '마켓 상단' | '상품 상단' | '팝업';
type BannerStatus = '노출중' | '노출예정' | '비노출';

interface Campaign {
  id: string;
  title: string;
  subtitle: string;
  period: string;        // "2026.05.01 ~ 2026.05.07"
  creators: string[];
  products: string[];    // 상품명 목록
  status: EventStatus;
  thumbnail: string;     // emoji or dataURL
  tag: string;           // "봄맞이 기획전" 등 태그
  description: string;
}

interface Banner {
  id: string;
  title: string;
  image: string;         // emoji or dataURL
  linkUrl: string;
  position: BannerPosition;
  startDate: string;
  endDate: string;
  status: BannerStatus;
  order: number;
}

// ── 목업 데이터 ──────────────────────────────────────
const mockCampaigns: Campaign[] = [
  {
    id: 'c01', title: '봄맞이 뷰티 공구', subtitle: '봄을 담은 K-뷰티 컬렉션',
    period: '2026.03.17 ~ 2026.03.31', creators: ['채리블', '블루웨이브', '아이리스'],
    products: ['글로우코리아 레이어드 세트', '뷰티팩토리 콜라보 에디션', '스타일랩 버블팩'],
    status: '종료', thumbnail: '🌸', tag: '시즌 기획전', description: '봄 시즌 특집 뷰티·패션 공구 묶음 기획전. 인기 크리에이터 3인 콜라보.',
  },
  {
    id: 'c02', title: '건강식품 위크', subtitle: '단백질·다이어트 특가 기획전',
    period: '2026.04.08 ~ 2026.04.12', creators: ['골든아워', '그린위시'],
    products: ['그린푸드 도시락 세트', '홈리빙 세럼 기획세트'],
    status: '종료', thumbnail: '💪', tag: '식품 기획전', description: '건강·식품 카테고리 집중 기획전. MG+RS 혼합 구조.',
  },
  {
    id: 'c03', title: '5월 패션 공구', subtitle: '여름 직전 패션 총집합',
    period: '2026.05.12 ~ 2026.05.24', creators: ['하늘빛', '골든아워'],
    products: ['스타일랩 콜라보 티셔츠', '그린푸드 프로틴바 10입'],
    status: '진행예정', thumbnail: '👗', tag: '시즌 기획전', description: '5월 패션·식품 복합 기획전. 하늘빛·골든아워 양대 크리에이터 협업.',
  },
];

const mockBanners: Banner[] = [
  {
    id: 'b01', title: '5월 패션 공구 D-7', image: '👗',
    linkUrl: '/events/c03', position: '홈 메인', startDate: '2026.05.05', endDate: '2026.05.12',
    status: '노출중', order: 1,
  },
  {
    id: 'b02', title: '스튜디오플랫폼 크리에이터 모집', image: '🎬',
    linkUrl: '/creators/apply', position: '홈 메인', startDate: '2026.05.01', endDate: '2026.05.31',
    status: '노출중', order: 2,
  },
  {
    id: 'b03', title: '봄 기획전 마감 임박', image: '🌸',
    linkUrl: '/events/c01', position: '마켓 상단', startDate: '2026.03.28', endDate: '2026.03.31',
    status: '비노출', order: 1,
  },
  {
    id: 'b04', title: '신규 크리에이터 웰컴 팝업', image: '🎉',
    linkUrl: '/creators/welcome', position: '팝업', startDate: '2026.05.10', endDate: '2026.05.20',
    status: '노출예정', order: 1,
  },
];

// ── 상수 ──────────────────────────────────────────────
const CREATORS_LIST = ['하늘빛', '별빛소녀', '루나스타', '채리블', '민들레', '소울비트', '핑크무드', '아이리스', '그린위시', '블루웨이브', '플라워데이', '스카이블루', '골든아워', '퍼플레인', '실버문'];
const PRODUCTS_LIST = ['그린푸드 쉐이크', '스타일랩 버블팩', '글로우코리아 레이어드 세트', '뷰티팩토리 콜라보 에디션', '그린푸드 도시락 세트', '홈리빙 세럼 기획세트', '스타일랩 콜라보 티셔츠', '그린푸드 프로틴바 10입'];
const POSITIONS: BannerPosition[] = ['홈 메인', '마켓 상단', '상품 상단', '팝업'];
const BANNER_STATUSES: BannerStatus[] = ['노출중', '노출예정', '비노출'];
const EVENT_STATUSES: EventStatus[] = ['진행예정', '진행중', '종료'];

// ── 스타일 맵 ──────────────────────────────────────────
const EVENT_STATUS_STYLE: Record<EventStatus, string> = {
  '진행중':   'bg-emerald-50 text-emerald-600',
  '진행예정': 'bg-blue-50 text-blue-600',
  '종료':     'bg-slate-100 text-slate-400',
};
const BANNER_STATUS_STYLE: Record<BannerStatus, string> = {
  '노출중':   'bg-emerald-50 text-emerald-600',
  '노출예정': 'bg-blue-50 text-blue-600',
  '비노출':   'bg-slate-100 text-slate-400',
};
const POSITION_STYLE: Record<BannerPosition, string> = {
  '홈 메인':   'bg-violet-50 text-violet-600',
  '마켓 상단': 'bg-indigo-50 text-indigo-600',
  '상품 상단': 'bg-sky-50 text-sky-600',
  '팝업':      'bg-amber-50 text-amber-600',
};

const inputCls = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 bg-white";

// ── 기획전 카드 ────────────────────────────────────────
function CampaignCard({
  campaign, onEdit, onDelete,
}: { campaign: Campaign; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-start gap-4 p-5">
        {/* 썸네일 */}
        <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center text-3xl flex-shrink-0 border border-slate-100">
          {campaign.thumbnail.startsWith('data:') ? (
            <img src={campaign.thumbnail} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : campaign.thumbnail}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800">{campaign.title}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-semibold">{campaign.tag}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${EVENT_STATUS_STYLE[campaign.status]}`}>{campaign.status}</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{campaign.subtitle}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={onEdit} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center">
                <Pencil size={13} />
              </button>
              <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center">
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          {/* 메타 정보 */}
          <div className="flex items-center gap-4 mt-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar size={11} />
              <span>{campaign.period}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {campaign.creators.map(c => (
                <span key={c} className="text-[11px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-semibold">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 펼치기 */}
      <div className="border-t border-slate-50">
        <button onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between px-5 py-2.5 text-xs text-slate-400 hover:bg-slate-50 transition-colors">
          <span>연결 상품 {campaign.products.length}개 · 상세 설명 보기</span>
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {expanded && (
          <div className="px-5 pb-4 flex flex-col gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {campaign.products.map(p => (
                <span key={p} className="text-[11px] px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 text-slate-600">{p}</span>
              ))}
            </div>
            {campaign.description && (
              <p className="text-xs text-slate-400 leading-relaxed">{campaign.description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 배너 행 ────────────────────────────────────────────
function BannerRow({ banner, onEdit, onDelete }: { banner: Banner; onEdit: () => void; onDelete: () => void }) {
  return (
    <tr className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
      <td className="px-4 py-3.5">
        <GripVertical size={14} className="text-slate-300 cursor-grab" />
      </td>
      <td className="px-3 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-xl flex-shrink-0">
            {banner.image.startsWith('data:') ? (
              <img src={banner.image} alt="" className="w-full h-full object-cover rounded-lg" />
            ) : banner.image}
          </div>
          <span className="font-semibold text-sm text-slate-800">{banner.title}</span>
        </div>
      </td>
      <td className="px-3 py-3.5">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${POSITION_STYLE[banner.position]}`}>{banner.position}</span>
      </td>
      <td className="px-3 py-3.5">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Link2 size={11} />
          <span className="truncate max-w-[160px]">{banner.linkUrl}</span>
        </div>
      </td>
      <td className="px-3 py-3.5 text-xs text-slate-400 whitespace-nowrap">
        {banner.startDate} ~ {banner.endDate}
      </td>
      <td className="px-3 py-3.5 text-xs text-slate-400 text-center">{banner.order}</td>
      <td className="px-3 py-3.5">
        <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${BANNER_STATUS_STYLE[banner.status]}`}>{banner.status}</span>
      </td>
      <td className="px-3 py-3.5">
        <div className="flex gap-1.5">
          <button onClick={onEdit} className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-500 hover:bg-indigo-100 flex items-center justify-center">
            <Pencil size={13} />
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── 기획전 모달 ────────────────────────────────────────
function CampaignModal({
  initial, onClose, onSave,
}: { initial?: Partial<Campaign>; onClose: () => void; onSave: (c: Campaign) => void }) {
  const [form, setForm] = useState<Partial<Campaign>>(initial ?? { status: '진행예정', creators: [], products: [], thumbnail: '🎪', tag: '' });
  const imgRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof Campaign, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));
  const toggleArr = (key: 'creators' | 'products', val: string) => {
    const arr = (form[key] ?? []) as string[];
    set(key, arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => set('thumbnail', e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.title?.trim()) return alert('기획전명을 입력해주세요.');
    onSave({
      id: initial?.id ?? String(Date.now()),
      title: form.title!, subtitle: form.subtitle ?? '', period: form.period ?? '',
      creators: form.creators ?? [], products: form.products ?? [],
      status: form.status as EventStatus ?? '진행예정',
      thumbnail: form.thumbnail ?? '🎪', tag: form.tag ?? '',
      description: form.description ?? '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-[600px] max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-[16px] font-bold">{initial?.id ? '기획전 수정' : '기획전 등록'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg p-1">✕</button>
        </div>

        <div className="px-7 py-5 flex flex-col gap-4">
          {/* 썸네일 */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-3xl cursor-pointer hover:border-indigo-300 transition-colors overflow-hidden"
              onClick={() => imgRef.current?.click()}>
              {form.thumbnail?.startsWith('data:')
                ? <img src={form.thumbnail} alt="" className="w-full h-full object-cover" />
                : form.thumbnail || '🎪'}
            </div>
            <input ref={imgRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
            <div className="flex flex-col gap-1">
              <p className="text-[12.5px] font-semibold text-slate-700">썸네일</p>
              <p className="text-[11px] text-slate-400">클릭해서 이미지 업로드 또는 이모지 직접 입력</p>
              <input value={form.thumbnail?.startsWith('data:') ? '' : (form.thumbnail ?? '')}
                onChange={e => set('thumbnail', e.target.value)}
                placeholder="이모지 입력 (예: 🌸)"
                className="px-2 py-1.5 text-sm border border-slate-200 rounded-lg w-32 outline-none focus:border-indigo-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="기획전명" required>
              <input value={form.title ?? ''} onChange={e => set('title', e.target.value)} placeholder="봄맞이 뷰티 공구" className={inputCls} />
            </Field>
            <Field label="부제목">
              <input value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)} placeholder="부제목 입력" className={inputCls} />
            </Field>
            <Field label="태그">
              <input value={form.tag ?? ''} onChange={e => set('tag', e.target.value)} placeholder="시즌 기획전" className={inputCls} />
            </Field>
            <Field label="상태">
              <select value={form.status ?? '진행예정'} onChange={e => set('status', e.target.value)} className={inputCls}>
                {EVENT_STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="시작일">
              <input value={form.period?.split(' ~ ')[0] ?? ''} onChange={e => set('period', `${e.target.value} ~ ${form.period?.split(' ~ ')[1] ?? ''}`)} placeholder="2026.05.01" className={inputCls} />
            </Field>
            <Field label="종료일">
              <input value={form.period?.split(' ~ ')[1] ?? ''} onChange={e => set('period', `${form.period?.split(' ~ ')[0] ?? ''} ~ ${e.target.value}`)} placeholder="2026.05.07" className={inputCls} />
            </Field>
          </div>

          <Field label="설명">
            <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value)} rows={2} placeholder="기획전 설명 입력" className={inputCls + ' resize-none'} />
          </Field>

          {/* 크리에이터 선택 */}
          <div>
            <p className="text-[12.5px] font-semibold text-slate-600 mb-2">참여 크리에이터</p>
            <div className="flex flex-wrap gap-1.5">
              {CREATORS_LIST.map(c => {
                const sel = (form.creators ?? []).includes(c);
                return (
                  <button key={c} type="button" onClick={() => toggleArr('creators', c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${sel ? 'border-indigo-400 bg-indigo-50 text-indigo-600' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 상품 선택 */}
          <div>
            <p className="text-[12.5px] font-semibold text-slate-600 mb-2">연결 상품</p>
            <div className="flex flex-wrap gap-1.5">
              {PRODUCTS_LIST.map(p => {
                const sel = (form.products ?? []).includes(p);
                return (
                  <button key={p} type="button" onClick={() => toggleArr('products', p)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${sel ? 'border-violet-400 bg-violet-50 text-violet-600' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-7 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">취소</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">저장</button>
        </div>
      </div>
    </div>
  );
}

// ── 배너 모달 ──────────────────────────────────────────
function BannerModal({
  initial, onClose, onSave,
}: { initial?: Partial<Banner>; onClose: () => void; onSave: (b: Banner) => void }) {
  const [form, setForm] = useState<Partial<Banner>>(initial ?? { status: '노출예정', position: '홈 메인', order: 1, image: '🖼️' });
  const imgRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof Banner, val: unknown) => setForm(prev => ({ ...prev, [key]: val }));

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = e => set('image', e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!form.title?.trim()) return alert('배너 제목을 입력해주세요.');
    onSave({
      id: initial?.id ?? String(Date.now()),
      title: form.title!, image: form.image ?? '🖼️',
      linkUrl: form.linkUrl ?? '', position: form.position as BannerPosition ?? '홈 메인',
      startDate: form.startDate ?? '', endDate: form.endDate ?? '',
      status: form.status as BannerStatus ?? '노출예정',
      order: Number(form.order) || 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-[500px] shadow-2xl">
        <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
          <h2 className="text-[16px] font-bold">{initial?.id ? '배너 수정' : '배너 등록'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg p-1">✕</button>
        </div>

        <div className="px-7 py-5 flex flex-col gap-3">
          {/* 이미지 */}
          <div className="flex items-center gap-4">
            <div className="w-24 h-14 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center text-3xl cursor-pointer hover:border-indigo-300 transition-colors overflow-hidden"
              onClick={() => imgRef.current?.click()}>
              {form.image?.startsWith('data:')
                ? <img src={form.image} alt="" className="w-full h-full object-cover" />
                : form.image || '🖼️'}
            </div>
            <input ref={imgRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <ImageIcon size={12} className="text-slate-400" />
                <p className="text-[12.5px] font-semibold text-slate-700">배너 이미지</p>
              </div>
              <button onClick={() => imgRef.current?.click()} className="text-[11px] text-indigo-500 hover:underline">이미지 업로드</button>
              <span className="text-[11px] text-slate-300 mx-1.5">or</span>
              <input value={form.image?.startsWith('data:') ? '' : (form.image ?? '')}
                onChange={e => set('image', e.target.value)}
                placeholder="이모지" className="text-sm border border-slate-200 rounded-lg px-2 py-1 w-16 outline-none" />
            </div>
          </div>

          <Field label="배너 제목" required>
            <input value={form.title ?? ''} onChange={e => set('title', e.target.value)} placeholder="배너 제목 입력" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="노출 위치">
              <select value={form.position ?? '홈 메인'} onChange={e => set('position', e.target.value)} className={inputCls}>
                {POSITIONS.map(p => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="노출 순서">
              <input type="number" value={form.order ?? 1} onChange={e => set('order', e.target.value)} min={1} className={inputCls} />
            </Field>
            <Field label="시작일">
              <input value={form.startDate ?? ''} onChange={e => set('startDate', e.target.value)} placeholder="2026.05.01" className={inputCls} />
            </Field>
            <Field label="종료일">
              <input value={form.endDate ?? ''} onChange={e => set('endDate', e.target.value)} placeholder="2026.05.31" className={inputCls} />
            </Field>
          </div>

          <Field label="링크 URL">
            <div className="relative">
              <Link2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={form.linkUrl ?? ''} onChange={e => set('linkUrl', e.target.value)} placeholder="/events/c01 또는 https://..." className={inputCls + ' pl-8'} />
            </div>
          </Field>

          <Field label="상태">
            <div className="flex gap-2">
              {BANNER_STATUSES.map(s => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${form.status === s ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}>
                  {s}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="flex justify-end gap-2 px-7 py-4 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50">취소</button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">저장</button>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function EventsPage() {
  const [tab, setTab] = useState<'campaign' | 'banner'>('campaign');
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [banners, setBanners] = useState<Banner[]>(mockBanners);

  const [campaignModal, setCampaignModal] = useState<{ open: boolean; data?: Campaign }>({ open: false });
  const [bannerModal, setBannerModal] = useState<{ open: boolean; data?: Banner }>({ open: false });

  const handleSaveCampaign = (c: Campaign) => {
    setCampaigns(prev => prev.some(x => x.id === c.id) ? prev.map(x => x.id === c.id ? c : x) : [c, ...prev]);
    setCampaignModal({ open: false });
  };

  const handleSaveBanner = (b: Banner) => {
    setBanners(prev => prev.some(x => x.id === b.id) ? prev.map(x => x.id === b.id ? b : x) : [b, ...prev]);
    setBannerModal({ open: false });
  };

  const deleteCampaign = (id: string) => {
    if (!confirm('기획전을 삭제하시겠습니까?')) return;
    setCampaigns(prev => prev.filter(x => x.id !== id));
  };

  const deleteBanner = (id: string) => {
    if (!confirm('배너를 삭제하시겠습니까?')) return;
    setBanners(prev => prev.filter(x => x.id !== id));
  };

  const activeCampaigns = campaigns.filter(c => c.status === '진행중').length;
  const upcomingCampaigns = campaigns.filter(c => c.status === '진행예정').length;
  const activeBanners = banners.filter(b => b.status === '노출중').length;

  return (
    <div className="p-10">
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[22px] font-bold">기획전 · 배너</h1>
          <p className="text-sm text-slate-400 mt-1">기획전 세팅 및 플랫폼 배너를 관리합니다.</p>
        </div>
        <button
          onClick={() => tab === 'campaign' ? setCampaignModal({ open: true }) : setBannerModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors">
          <Plus size={16} /> {tab === 'campaign' ? '기획전 등록' : '배너 등록'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-7">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-semibold mb-2">진행중 기획전</p>
          <p className="text-2xl font-bold text-emerald-600">{activeCampaigns}<span className="text-sm font-normal text-slate-400 ml-1">건</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-semibold mb-2">예정 기획전</p>
          <p className="text-2xl font-bold text-blue-600">{upcomingCampaigns}<span className="text-sm font-normal text-slate-400 ml-1">건</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-semibold mb-2">노출중 배너</p>
          <p className="text-2xl font-bold">{activeBanners}<span className="text-sm font-normal text-slate-400 ml-1">개</span></p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs text-slate-400 font-semibold mb-2">전체 기획전</p>
          <p className="text-2xl font-bold">{campaigns.length}<span className="text-sm font-normal text-slate-400 ml-1">건</span></p>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 mb-5 bg-slate-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('campaign')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'campaign' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          🎪 기획전 {campaigns.length}
        </button>
        <button onClick={() => setTab('banner')}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'banner' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          🖼️ 배너 {banners.length}
        </button>
      </div>

      {/* 기획전 탭 */}
      {tab === 'campaign' && (
        <div className="flex flex-col gap-3">
          {campaigns.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-16 text-center text-slate-400 text-sm">
              등록된 기획전이 없습니다.
            </div>
          ) : campaigns.map(c => (
            <CampaignCard key={c.id} campaign={c}
              onEdit={() => setCampaignModal({ open: true, data: c })}
              onDelete={() => deleteCampaign(c.id)} />
          ))}
        </div>
      )}

      {/* 배너 탭 */}
      {tab === 'banner' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-4 py-3 w-8"></th>
                {['배너', '노출 위치', '링크', '노출 기간', '순서', '상태', '관리'].map(h => (
                  <th key={h} className="px-3 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {banners.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-slate-400 text-sm">등록된 배너가 없습니다.</td></tr>
              ) : banners.map(b => (
                <BannerRow key={b.id} banner={b}
                  onEdit={() => setBannerModal({ open: true, data: b })}
                  onDelete={() => deleteBanner(b.id)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 모달 */}
      {campaignModal.open && (
        <CampaignModal
          initial={campaignModal.data}
          onClose={() => setCampaignModal({ open: false })}
          onSave={handleSaveCampaign}
        />
      )}
      {bannerModal.open && (
        <BannerModal
          initial={bannerModal.data}
          onClose={() => setBannerModal({ open: false })}
          onSave={handleSaveBanner}
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
