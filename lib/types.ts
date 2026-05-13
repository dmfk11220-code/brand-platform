export type BrandCategory = '패션' | '뷰티' | '식품' | '생활' | '스포츠' | '기타';
export type BrandType = '브랜드사' | '에이전시';
export type BrandStatus = 'active' | 'inactive';

export interface Brand {
  id: string;
  name: string;
  type: BrandType;
  category: BrandCategory;
  commissionRate: number;
  managerPhone: string;
  csPhone: string;
  memo: string;
  // 계좌
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  // 사업자
  businessName: string;
  businessNumber: string;
  // 계정
  loginId: string;
  // 파일 (실제 구현 시 URL)
  bankBookFile?: string;
  bizRegFile?: string;
  status: BrandStatus;
  createdAt: string;
}

export interface BrandFormData {
  name: string;
  type: BrandType | '';
  category: BrandCategory | '';
  commissionRate: string;
  managerPhone: string;
  csPhone: string;
  memo: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  businessName: string;
  businessNumber: string;
  loginId: string;
  password: string;
}
