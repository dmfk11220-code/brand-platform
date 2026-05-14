# 두호 어드민 플랫폼 개발 스킬
> 경로: `/Users/sky/Desktop/두호/brand-platform/`
> 스택: Next.js 16.2.6 App Router · TypeScript · Tailwind CSS v4 · lucide-react · xlsx (SheetJS)

## 개발 서버
```bash
cd /Users/sky/Desktop/두호/brand-platform
npm run dev          # 시작
pkill -f "next dev"  # 재시작 필요 시 먼저 종료
```
→ localhost:3000

## 파일 구조
```
app/
  page.tsx            — 메인 대시보드 (목업 데이터, GMV/크리에이터/브랜드 탭)
  products/page.tsx   — 상품 관리 (전체 로직 집중)
  brands/page.tsx     — 브랜드 관리
  layout.tsx          — 사이드바 포함 레이아웃
components/
  Sidebar.tsx         — 네비게이션
```

## 핵심 타입 (products/page.tsx)
```typescript
interface Product {
  id, name, brand, category, price, discountRate, stock, status, sales,
  creator, thumbnail, createdAt, saleType, contract?, channel?,
  rsRate?,        // RS 수수료율 (0.20 = 20%)
  dhRatio?,       // DH 분배율 (예: 3)
  crRatio?,       // 크리에이터 분배율 (예: 7)
  mgAmount?,      // MG 총액 (원)
  supplyPrice?,   // 단위 공급가 (매입 전용)
  shippingFee?,   // 건당 배송비 (매입 전용)
  freeShippingThreshold?, // 무료배송 기준금액 (0=없음)
  freeShippingBearer?,    // 'brand' | 'dh'
  marketStart?, marketEnd?,
  revenue?, crPaid?, dhProfit?,
}
```

## 계약 유형별 정산 로직

### 매입 (자사몰) → SettlementIssueModal
- 정산서를 우리가 발급 (브랜드 지급 + 크리에이터 지급 엑셀)
- `calcPurchase(summaries, shippingFee, dhRatio, crRatio, dhExtraExpense?)`
  - margin = totalSale - (totalSupply + shippingFee)
  - marginExclVat = margin ÷ 1.1
  - crPaidBefore = marginExclVat × (crRatio / total)
  - crPaid = crPaidBefore × 0.967 (3.3% 차감)
  - dhProfit = marginExclVat - crPaidBefore - dhExtraExpense

### RS / RS+MG / MG (브랜드몰·타플랫폼) → SettlementUploadModal
- 브랜드에서 받은 정산서 xlsx를 업로드해서 거래액 입력
- `calcRS(product, revenue)`
  - rsFee = revenue × rsRate
  - rsFeeExclVat = rsFee ÷ 1.1
  - crPaid = rsFeeExclVat × (crRatio / total)
  - dhProfit = rsFeeExclVat × (dhRatio / total)
- MG 고정 정산: mgCrBefore = mgTotal × (crRatio/total), 3.3% 차감 후 지급

## 배송비 로직 (매입 전용)
- 상품 등록 시: `shippingFee`(건당), `freeShippingThreshold`(기준금액), `freeShippingBearer`('brand'|'dh')
- 정산서 발급 모달에서:
  - `totalShipping = shippingPerUnit × totalQty`
  - `freeShippingAmount = shippingPerUnit × freeQty` (수기 입력)
  - 브랜드 부담: `effectiveShipping = totalShipping - freeShippingAmount` (브랜드 지급액 차감)
  - DH 부담: `effectiveShipping = totalShipping`, `dhExtraExpense = freeShippingAmount` (DH 이익에서 차감)

## sf() 함수 — 폼 값 저장
```typescript
const NUM_KEYS = new Set(['price','discountRate','stock','dhRatio','crRatio','rsRate','mgAmount','supplyPrice','shippingFee','freeShippingThreshold']);
const sf = (key, val) => {
  const parsed = NUM_KEYS.has(key) ? (val === '' ? undefined : Number(val)) : val;
  setForm(prev => ({ ...prev, [key]: parsed }));
};
```
→ **number 키는 반드시 즉시 Number() 변환** — string으로 저장되면 `+` 연산 시 문자열 연결 버그 발생 (`11340000 + "3000" = "113400003000"`)

## 계약-채널 연동 규칙
- `매입` → `자사몰` 고정
- `RS/MG/RS+MG` → `브랜드몰` 또는 `타 플랫폼`
- 계약 버튼 클릭 시 채널 자동 전환, 매입 해제 시 배송비 필드 초기화

## 정산서 모달 분기
```typescript
settlementTarget.contract === '매입'
  ? <SettlementIssueModal />   // 자사몰: 우리가 발급
  : <SettlementUploadModal />  // 브랜드몰/타플랫폼: 업로드
```

## 자주 발생하는 버그 체크리스트
- `shippingFee` string 저장 → `sf()` 통하면 자동 Number 변환
- `calcPurchase` 인자는 항상 `Number()` 감싸기 (방어 코드)
- 판매 유형 버튼 클릭 시 contract 리셋되지 않도록 주의 (상시판매 전환 시에만 초기화)
- dev 서버 캐시 문제 시 `pkill -f "next dev"` 후 재시작
- `freeShippingThreshold = 0` 저장 여부: `val == null` 체크 (0은 유효값)

## 현재 구현 상태
- [x] 상품 관리 CRUD
- [x] 매입 정산서 발급 (브랜드 + 크리에이터 엑셀)
- [x] RS/RS+MG 정산서 등록 + 크리에이터 정산서 발급
- [x] MG 고정 정산 계산
- [x] 배송비 건당 × 수량 자동 계산
- [x] 무료배송 기준금액 + 부담 주체 설정
- [x] 메인 대시보드 (목업)
- [x] 브랜드 관리 페이지
- [ ] 실제 DB 연동 (현재 메모리 상태만)
- [ ] 크리에이터 관리 페이지
- [ ] 정산 페이지
