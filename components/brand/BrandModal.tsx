'use client';

import { useEffect, useState } from 'react';
import { X, Upload } from 'lucide-react';
import { Brand, BrandFormData } from '@/lib/types';
import { BANKS, BRAND_TYPES, CATEGORIES } from '@/lib/mockData';

const empty: BrandFormData = {
  name: '',
  type: '',
  category: '',
  commissionRate: '',
  managerPhone: '',
  csPhone: '',
  memo: '',
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  businessName: '',
  businessNumber: '',
  loginId: '',
  password: '',
};

interface Props {
  open: boolean;
  brand?: Brand | null;
  onClose: () => void;
  onSave: (data: BrandFormData, id?: string) => void;
}

export default function BrandModal({ open, brand, onClose, onSave }: Props) {
  const [form, setForm] = useState<BrandFormData>(empty);
  const [bankBookName, setBankBookName] = useState('');
  const [bizRegName, setBizRegName] = useState('');

  useEffect(() => {
    if (brand) {
      setForm({
        name: brand.name,
        type: brand.type,
        category: brand.category,
        commissionRate: String(brand.commissionRate),
        managerPhone: brand.managerPhone,
        csPhone: brand.csPhone,
        memo: brand.memo,
        bankName: brand.bankName,
        accountHolder: brand.accountHolder,
        accountNumber: brand.accountNumber,
        businessName: brand.businessName,
        businessNumber: brand.businessNumber,
        loginId: brand.loginId,
        password: '',
      });
    } else {
      setForm(empty);
      setBankBookName('');
      setBizRegName('');
    }
  }, [brand, open]);

  if (!open) return null;

  const set = (key: keyof BrandFormData, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    if (!form.name.trim()) return alert('브랜드명을 입력해주세요.');
    if (!form.commissionRate) return alert('수수료율을 입력해주세요.');
    onSave(form, brand?.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-[620px] max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-1">
          <h2 className="text-[17px] font-bold">{brand ? '브랜드 수정' : '브랜드 추가'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={18} />
          </button>
        </div>

        <div className="px-7 py-5 flex flex-col gap-6">
          {/* 기본 정보 */}
          <Section title="기본 정보">
            <Grid>
              <Field label="브랜드명" required>
                <Input value={form.name} onChange={(v) => set('name', v)} placeholder="예) 젝시믹스" />
              </Field>
              <Field label="수수료율 (%)" required>
                <Input type="number" value={form.commissionRate} onChange={(v) => set('commissionRate', v)} placeholder="예) 15" />
              </Field>
              <Field label="카테고리" required>
                <Select value={form.category} onChange={(v) => set('category', v)} options={CATEGORIES} />
              </Field>
              <Field label="타입" required>
                <Select value={form.type} onChange={(v) => set('type', v)} options={BRAND_TYPES} />
              </Field>
              <Field label="담당자 번호" required>
                <Input value={form.managerPhone} onChange={(v) => set('managerPhone', v)} placeholder="010-0000-0000" />
              </Field>
              <Field label="CS 전화번호">
                <Input value={form.csPhone} onChange={(v) => set('csPhone', v)} placeholder="02-0000-0000" />
              </Field>
              <Field label="추가 정보" className="col-span-2">
                <textarea
                  value={form.memo}
                  onChange={(e) => set('memo', e.target.value)}
                  placeholder="브랜드 관련 메모"
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 resize-none"
                />
              </Field>
            </Grid>
          </Section>

          {/* 계좌 정보 */}
          <Section title="계좌 정보">
            <Grid>
              <Field label="은행명" required>
                <Select value={form.bankName} onChange={(v) => set('bankName', v)} options={BANKS} />
              </Field>
              <Field label="예금주" required>
                <Input value={form.accountHolder} onChange={(v) => set('accountHolder', v)} placeholder="예금주명" />
              </Field>
              <Field label="계좌번호" required className="col-span-2">
                <Input value={form.accountNumber} onChange={(v) => set('accountNumber', v)} placeholder="'-' 없이 입력" />
              </Field>
            </Grid>
          </Section>

          {/* 사업자 정보 */}
          <Section title="사업자 정보">
            <Grid>
              <Field label="사업자명" required>
                <Input value={form.businessName} onChange={(v) => set('businessName', v)} placeholder="법인명 또는 상호" />
              </Field>
              <Field label="사업자등록번호" required>
                <Input value={form.businessNumber} onChange={(v) => set('businessNumber', v)} placeholder="000-00-00000" />
              </Field>
            </Grid>
          </Section>

          {/* 계정 정보 */}
          <Section title="계정 정보">
            <Grid>
              <Field label="ID" required>
                <Input value={form.loginId} onChange={(v) => set('loginId', v)} placeholder="로그인 아이디" />
              </Field>
              <Field label="비밀번호" required={!brand}>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(v) => set('password', v)}
                  placeholder={brand ? '변경 시에만 입력' : '초기 비밀번호'}
                />
              </Field>
            </Grid>
          </Section>

          {/* 파일 업로드 */}
          <Section title="파일 첨부">
            <Grid>
              <FileUpload
                label="통장 사본"
                icon="🏦"
                fileName={bankBookName}
                onChange={(name) => setBankBookName(name)}
              />
              <FileUpload
                label="사업자등록증"
                icon="📄"
                fileName={bizRegName}
                onChange={(name) => setBizRegName(name)}
              />
            </Grid>
          </Section>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-7 py-5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-indigo-500 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-semibold bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 작은 공용 컴포넌트 ── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">
        {title}
      </p>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ''}`}>
      <label className="text-[12.5px] font-semibold text-slate-600">
        {label}
        {required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 w-full transition-colors"
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-indigo-400 w-full bg-white transition-colors"
    >
      <option value="">선택</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
  );
}

function FileUpload({
  label,
  icon,
  fileName,
  onChange,
}: {
  label: string;
  icon: string;
  fileName: string;
  onChange: (name: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12.5px] font-semibold text-slate-600">{label}</label>
      <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-200 rounded-lg p-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors">
        <span className="text-2xl">{icon}</span>
        {fileName ? (
          <span className="text-xs text-indigo-500 font-medium">{fileName}</span>
        ) : (
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Upload size={12} /> 파일 선택
          </span>
        )}
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0]?.name ?? '')}
        />
      </label>
    </div>
  );
}
