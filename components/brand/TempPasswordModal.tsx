'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface Props {
  open: boolean;
  brandName: string;
  password: string;
  onClose: () => void;
}

export default function TempPasswordModal({ open, brandName, password, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-[360px] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <h2 className="text-[16px] font-bold">임시 비밀번호 발급</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={17} />
          </button>
        </div>

        <div className="px-6 py-6 flex flex-col items-center gap-4">
          <div className="text-4xl">🔑</div>

          <p className="text-sm text-slate-500 text-center">
            <span className="font-semibold text-slate-700">{brandName}</span>의<br />
            임시 비밀번호가 발급되었습니다.
          </p>

          <div className="bg-slate-50 rounded-xl px-8 py-4 font-mono text-2xl font-bold tracking-[4px] text-slate-800 border border-slate-200">
            {password}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors"
          >
            {copied ? <Check size={15} /> : <Copy size={15} />}
            {copied ? '복사됨' : '복사하기'}
          </button>

          <p className="text-[11.5px] text-rose-500 bg-rose-50 rounded-lg px-4 py-2.5 text-center leading-relaxed">
            ⚠️ 최초 로그인 후 즉시 비밀번호를 변경하도록<br />브랜드 담당자에게 안내해 주세요.
          </p>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-lg hover:bg-indigo-600 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
