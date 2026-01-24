# CampX MVP 개발 TODO

> 기반: CampX MVP 개발 계획 (campx_mvp_개발_계획_60a4b1c1)
> 목표: AI 스케줄러, 2.5D 맵, QR 체크인 핵심 기능 구현

## Phase 1: 데이터베이스 스키마 완성 (Foundation)

### 1.1 pgvector 확장 활성화
- [x] Neon Console에서 `pgvector` 확장 활성화
- [x] Drizzle 스키마에 벡터 타입 지원 추가
  - 파일: `src/shared/lib/pgvector.ts` 생성 완료

### 1.2 핵심 엔티티 스키마 구현
- [x] **nodes** 테이블 생성
  - `id`, `name`, `type` (SITE, WC, STORE, ACTIVITY)
  - `pos_x`, `pos_y`, `pos_z` (3D 좌표)
  - `attr_vector` (pgvector, 차원 3: [Nature, Activity, Rest])
  - `description`
  - 파일: `src/entities/node/model/schema.ts` ✅
  - Public API: `src/entities/node/index.ts` ✅

- [x] **bookings** 테이블 생성
  - `id`, `user_id` (FK), `check_in`, `check_out`, `status`
  - 파일: `src/entities/booking/model/schema.ts` ✅
  - Public API: `src/entities/booking/index.ts` ✅

- [x] **schedules** 테이블 생성
  - `id`, `booking_id` (FK), `total_fatigue_score`, `is_active`
  - 파일: `src/entities/schedule/model/schema.ts` ✅
  - Public API: `src/entities/schedule/index.ts` ✅

- [x] **schedule_items** 테이블 생성
  - `id`, `schedule_id` (FK), `node_id` (FK)
  - `sequence_order`, `start_time`, `end_time`, `activity_name`
  - 파일: `src/entities/schedule/model/schema.ts`에 포함됨 ✅

- [x] **activity_logs** 테이블 생성
  - `id`, `user_id` (FK), `node_id` (FK)
  - `action_type`, `satisfaction_score`
  - 파일: `src/entities/activity-log/model/schema.ts` ✅
  - Public API: `src/entities/activity-log/index.ts` ✅

### 1.3 users 테이블 확장
- [x] `preference_vector` (pgvector, 차원 3) 추가
- [x] `health_condition` (피로도) 추가
- [x] `has_pet`, `family_size` 추가
- [x] `bio_data_json` (JSONB) 추가
- [x] `clerk_user_id` 필드 추가
  - 파일: `src/entities/user/model/schema.ts` 업데이트 완료 ✅

### 1.4 마이그레이션 생성 및 적용
- [x] `pnpm drizzle-kit generate` 실행
  - 마이그레이션 파일: `drizzle/0001_chief_stellaris.sql` 생성됨 ✅
- [x] `pnpm drizzle-kit push` 실행 (Neon DB에 적용 필요)
  - ✅ **완료**: 터미널에서 `pnpm drizzle-kit push` 실행 완료
  - 또는 Neon Console SQL Editor에서 `drizzle/0001_chief_stellaris.sql` 내용 직접 실행
- [x] DB 스키마 검증
  - ✅ 마이그레이션 적용 후 Neon MCP를 통해 테이블 생성 확인 완료
  - ✅ 확인된 테이블: `nodes`, `bookings`, `schedules`, `schedule_items`, `activity_logs` 모두 정상 생성
  - ✅ `users` 테이블 확장 필드 확인 완료:
    - `clerk_user_id` (NOT NULL, UNIQUE) ✅
    - `preference_vector` (pgvector 타입) ✅
    - `has_pet` (boolean, default: false) ✅
    - `family_size` (integer, default: 1) ✅
    - `bio_data_json` (jsonb, default: '{}') ✅
    - ⚠️ `health_condition` 필드 누락: 마이그레이션 파일(`drizzle/0001_chief_stellaris.sql:61`)에는 있으나 실제 DB에 적용되지 않음
      - 스키마 파일(`src/entities/user/model/schema.ts:14`)에는 정의되어 있음
      - 해결 방법: `pnpm drizzle-kit push` 재실행 또는 수동으로 `ALTER TABLE users ADD COLUMN health_condition integer DEFAULT 5;` 실행

**Phase 1 완료 요약:**
- ✅ 모든 엔티티 스키마 파일 생성 완료 (`node`, `booking`, `schedule`, `activity-log`)
- ✅ pgvector 타입 정의 완료 (`src/shared/lib/pgvector.ts`)
- ✅ FSD Public API (index.ts) 파일 생성 완료
- ✅ DB 연결 설정 업데이트 완료 (`src/shared/api/db.ts`)
- ✅ 마이그레이션 파일 생성 완료 (`drizzle/0001_chief_stellaris.sql`)
- ⏳ 마이그레이션 DB 적용 대기 중 (수동 실행 필요: `pnpm drizzle-kit push`)

---

## Phase 2: 데이터베이스 연결 및 유틸리티

### 2.1 DB 연결 설정 업데이트
- [x] `src/shared/api/db.ts`: 모든 엔티티 스키마 import ✅
- [x] Drizzle 인스턴스에 전체 스키마 등록 ✅

### 2.2 Server Actions 기본 구조
- [ ] `src/features/user/api/actions.ts`: 사용자 프로필 저장, 조회
- [ ] `src/features/booking/api/actions.ts`: 예약 생성, QR 체크인
- [ ] `src/features/schedule/api/actions.ts`: AI 스케줄 생성 (핵심)
- [ ] `src/features/node/api/actions.ts`: 노드 정보 조회

---

## Phase 3: AI 스케줄러 엔진 (P0 - Critical)

### 3.1 벡터 유사도 계산 로직
- [ ] `src/shared/lib/ai-scheduler.ts` 파일 생성
- [ ] `calculateCosineSimilarity(userVector, nodeVector)` 함수 구현
  - pgvector 쿼리 사용
- [ ] `calculateFatiguePenalty(distance, elevationDelta)` 함수 구현
  - 특허 수식 3 적용
- [ ] `findOptimalPath(nodes, userProfile)` 함수 구현
  - TSP 변형 알고리즘

### 3.2 스케줄 생성 Server Action
- [ ] `generateSchedule(bookingId, userInput)` 메인 함수 구현
  1. 사용자 벡터 조회/생성
  2. pgvector로 유사 노드 추출
  3. 피로도 페널티 계산
  4. 최적 경로 산출
  5. `schedules`, `schedule_items` 저장
- [ ] 파일: `src/features/schedule/api/actions.ts`

### 3.3 온보딩 설문 폼
- [ ] `src/features/onboarding/ui/survey-form.tsx` 생성
- [ ] react-hook-form + zod 검증 설정
- [ ] 질문 구성: 컨디션(피로도), 동반자, 선호 활동
- [ ] 제출 시 사용자 벡터 생성 및 저장 로직
- [ ] 온보딩 페이지: `src/pages/onboarding/ui/onboarding-page.tsx`

---

## Phase 4: 2.5D 인터랙티브 맵 (P0 - Critical)

### 4.1 React Three Fiber 설정
- [ ] 의존성 설치: `pnpm add @react-three/fiber @react-three/drei three`
- [ ] Three.js 타입 설치: `pnpm add -D @types/three`

### 4.2 맵 컴포넌트 구조
- [ ] `src/features/map/ui/campsite-map.tsx` 생성
- [ ] 배경: 항공샷 이미지 (`public/maps/`) 통합
- [ ] 핀 레이어: Three.js로 노드 위치 표시
- [ ] 동선 표시: 스케줄에 따른 경로 렌더링
- [ ] 인터랙션: 핀 클릭 시 모달 (ShadCN Dialog)

### 4.3 노드 상세 모달
- [ ] `src/features/map/ui/node-detail-modal.tsx` 생성
- [ ] 노드 정보 표시 (이름, 타입, 설명)
- [ ] 거리 계산 (현재 위치 기준)
- [ ] 예상 소요 시간 표시

### 4.4 대시보드 통합
- [ ] `src/pages/dashboard/ui/dashboard-page.tsx` 업데이트
- [ ] 타임라인 뷰와 맵 뷰 토글 구현
- [ ] 스케줄 항목 클릭 시 맵에서 해당 노드 하이라이트

---

## Phase 5: QR 체크인 시스템 (P1 - High)

### 5.1 QR 코드 생성
- [ ] 의존성 설치: `pnpm add qrcode @types/qrcode`
- [ ] `src/features/checkin/api/actions.ts` 생성
- [ ] `generateQRCode(bookingId)` Server Action 구현
  - QR 데이터: `{ bookingId, userId, timestamp }`
  - Base64 이미지 반환

### 5.2 체크인 페이지
- [ ] `app/checkin/[bookingId]/page.tsx` 생성
- [ ] QR 코드 표시 UI
- [ ] 체크인 버튼 및 상태 업데이트 로직
- [ ] QR 코드 표시 컴포넌트: `src/features/checkin/ui/qr-code-display.tsx`

### 5.3 관리자 QR 스캔 페이지
- [ ] `app/admin/scan/page.tsx` 생성
- [ ] 모바일 웹 최적화
- [ ] 카메라 접근 (Web API) 구현
- [ ] QR 스캔 후 `booking.status` 업데이트

---

## Phase 6: 운영 알림 봇 (P1 - High)

### 6.1 카카오 알림톡 API 연동
- [ ] 의존성 설치: `pnpm add @kakao/kakao-sdk` (또는 REST API)
- [ ] `src/shared/api/kakao-notification.ts` 생성
- [ ] 알림톡 발송 함수 구현
- [ ] 템플릿 메시지 구성

### 6.2 스케줄 알림 로직
- [ ] `src/features/notification/api/actions.ts` 생성
- [ ] 매너타임 시작 알림 (체크인 후 N시간)
- [ ] 체험 시간 임박 알림 (시작 30분 전)
- [ ] Cron Job 또는 Server Action 주기적 실행 설정

---

## Phase 7: UI/UX 개선 및 통합

### 7.1 타임라인 뷰
- [ ] `src/features/schedule/ui/timeline-view.tsx` 생성
- [ ] 시계열 형태 일정표 UI
- [ ] 드래그 앤 드롭 순서 변경 (선택사항)
- [ ] 각 항목 클릭 시 맵에서 위치 표시

### 7.2 모바일 반응형 최적화
- [ ] Tailwind CSS 반응형 클래스 적용
- [ ] 터치 제스처 지원 (맵 줌/팬)
- [ ] 모바일 네비게이션 개선

### 7.3 PWA 설정
- [ ] `app/manifest.ts` 최적화
- [ ] 오프라인 지원 구현
- [ ] 홈 화면 추가 기능 테스트

---

## 성능 목표

- [ ] AI 스케줄 생성: 3초 이내
- [ ] 맵 렌더링: 초기 로드 2초 이내
- [ ] 모바일 최적화: Lighthouse 점수 90+

---

## 참고 문서

- [docs/PRD.md](docs/PRD.md): 제품 요구사항
- [docs/MRD.md](docs/MRD.md): 시장 요구사항
- [docs/TRD.md](docs/TRD.md): 기술 요구사항
- [docs/Mermaid.md](docs/Mermaid.md): 데이터베이스 ERD
- [docs/BOILERPLATE_REPORT.md](docs/BOILERPLATE_REPORT.md): 개발 환경 설정
- [docs/NEON_AUTH_SETUP.md](docs/NEON_AUTH_SETUP.md): Neon Auth 가이드

---

## 기술 스택

### Core
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Neon PostgreSQL + pgvector

### UI
- Tailwind CSS v4
- ShadCN UI
- React Three Fiber (3D 맵)

### 데이터베이스
- Drizzle ORM
- pgvector (벡터 유사도 검색)

### 인증
- Clerk Auth

### 스토리지
- Cloudflare R2 (파일 업로드)
