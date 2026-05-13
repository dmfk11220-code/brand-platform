'use client';

import { X } from 'lucide-react';
import { Brand } from '@/lib/types';

interface Props {
  open: boolean;
  brand: Brand | null;
  onClose: () => void;
}

export default function InfoModal({ open, brand, onClose }: Props) {
  if (!open || !brand) return null;

  const rows = [
    { label: '사업자명', value: brand.businessName },
    { label: '사업자등록번호', value: brand.businessNumber },
    { label: '은행명', value: brand.bankName },
    { label: '예금주', value: brand.accountHolder },
    { label: '계좌번호', value: brand.accountNumber },
    { label: '로그인 ID', value: brand.loginId },
    { label: '등록일', value: brand.createdAt },
    { label: '메모', value: brand.memo || '—' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-[400px] shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <h2 className="text-[16px] font-bold">{brand.name} 상세 정보</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X size={17} />
          </button>
        </div>

        <div className="px-6 py-4">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(({ label, value }) => (
                <tr key={label} className="border-b border-slate-50 last:border-0">
                  <td className="py-2.5 pr-4 text-[12px] font-semibold text-slate-400 w-32 whitespace-nowrap">
                    {label}
                  </td>
                  <td className="py-2.5 text-slate-700 font-medium break-all">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-indigo-500 text-white text-sm font-semibold rounded-lg hover:bg-indigo-600 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
