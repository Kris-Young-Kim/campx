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
- [x] `src/features/user/api/actions.ts`: 사용자 프로필 저장, 조회 ✅
  - `getUserProfile()`: 현재 인증된 사용자 프로필 조회
  - `updateUserProfile()`: 사용자 프로필 업데이트
  - `createOrUpdateUserProfile()`: Clerk 사용자와 DB 사용자 동기화
  - Public API: `src/features/user/index.ts` ✅
- [x] `src/features/booking/api/actions.ts`: 예약 생성, QR 체크인 ✅
  - `createBooking()`: 예약 생성
  - `getUserBookings()`: 사용자 예약 목록 조회
  - `getBookingById()`: 예약 ID로 조회
  - `checkInBooking()`: QR 체크인 (상태 업데이트)
  - Public API: `src/features/booking/index.ts` ✅
- [x] `src/features/schedule/api/actions.ts`: 스케줄 조회 및 관리 (기본 구조) ✅
  - `getSchedulesByBookingId()`: 예약별 스케줄 조회
  - `getActiveSchedule()`: 활성 스케줄 조회
  - `toggleScheduleActive()`: 스케줄 활성화/비활성화
  - ⚠️ AI 스케줄 생성 로직은 Phase 3에서 구현 예정
  - Public API: `src/features/schedule/index.ts` ✅
- [x] `src/features/node/api/actions.ts`: 노드 정보 조회 ✅
  - `getNodes()`: 모든 노드 조회 (타입, 검색 필터 지원)
  - `getNodeById()`: 노드 ID로 조회
  - `getNodesByType()`: 타입별 노드 조회
  - Public API: `src/features/node/index.ts` ✅

---

## Phase 3: AI 스케줄러 엔진 (P0 - Critical)

### 3.1 벡터 유사도 계산 로직
- [x] `src/shared/lib/ai-scheduler.ts` 파일 생성 ✅
- [x] `calculateCosineSimilarity(userVector, nodeVector)` 함수 구현 ✅
  - pgvector 쿼리 사용 (cosine distance 연산자 `<=>` 활용)
- [x] `calculateFatiguePenalty(distance, elevationDelta)` 함수 구현 ✅
  - 특허 수식 3 적용: `penalty = distance * (1 + elevation_delta / 100) * health_factor`
- [x] `findOptimalPath(nodes, userProfile)` 함수 구현 ✅
  - TSP 변형 알고리즘 (그리디 기반 최적 경로 탐색)
- [x] `findSimilarNodes(userVector, limit)` 함수 구현 ✅
  - pgvector를 사용한 유사 노드 검색

### 3.2 스케줄 생성 Server Action
- [x] `generateSchedule(bookingId, userInput)` 메인 함수 구현 ✅
  1. 사용자 벡터 조회/생성 ✅
  2. pgvector로 유사 노드 추출 ✅
  3. 피로도 페널티 계산 ✅
  4. 최적 경로 산출 ✅
  5. `schedules`, `schedule_items` 저장 ✅
  6. 시간 배분 (체크인~체크아웃) ✅
- [x] 파일: `src/features/schedule/api/actions.ts` ✅
- [x] Public API 업데이트: `src/features/schedule/index.ts` ✅

### 3.3 온보딩 설문 폼
- [x] `src/features/onboarding/ui/survey-form.tsx` 생성 ✅
- [x] react-hook-form + zod 검증 설정 ✅
- [x] 질문 구성: 컨디션(피로도), 동반자, 선호 활동 ✅
  - 컨디션: 1-10 스케일 (Slider)
  - 가족 구성원 수: 1-10명 (Slider)
  - 반려동물 유무: Checkbox
  - 선호 활동: Nature, Activity, Rest 각각 0-10 (Slider)
- [x] 제출 시 사용자 벡터 생성 및 저장 로직 ✅
  - `src/shared/lib/user-vector.ts`: 벡터 생성 유틸리티
  - `updateUserProfile()` Server Action 호출
- [x] 온보딩 페이지: `src/pages/onboarding/ui/onboarding-page.tsx` ✅
- [x] Public API: `src/features/onboarding/index.ts` ✅

---

## Phase 4: 2.5D 인터랙티브 맵 (P0 - Critical)

### 4.1 맵 구현 방식
- [x] SVG 기반 구현 (가볍고 빠른 렌더링) ✅
  - ⚠️ React Three Fiber 대신 SVG 사용 (MVP 단계에서 더 적합)
  - 향후 필요시 Three.js로 업그레이드 가능

### 4.2 맵 컴포넌트 구조
- [x] `src/features/map/ui/campsite-map.tsx` 생성 ✅
- [x] 배경: 항공샷 이미지 (`public/maps/`) 통합 ✅
- [x] 핀 레이어: SVG로 노드 위치 표시 (타입별 색상 구분) ✅
- [x] 동선 표시: 스케줄에 따른 경로 렌더링 (polyline) ✅
- [x] 인터랙션: 핀 클릭 시 모달 (ShadCN Dialog) ✅
- [x] 줌/팬 기능: 마우스 휠 줌, 드래그 팬 ✅
- [x] Public API: `src/features/map/index.ts` ✅

### 4.3 노드 상세 모달
- [x] `src/features/map/ui/node-detail-modal.tsx` 생성 ✅
- [x] 노드 정보 표시 (이름, 타입, 설명) ✅
- [x] 거리 계산 (현재 위치 기준, 향후 GPS 연동) ✅
- [x] 예상 소요 시간 표시 (보행 속도 기준) ✅
- [x] 좌표 및 고도 정보 표시 ✅

### 4.4 대시보드 통합
- [x] `src/pages/schedule-dashboard/ui/schedule-dashboard-page.tsx` 생성 ✅
- [x] 타임라인 뷰와 맵 뷰 토글 구현 (ShadCN Tabs) ✅
- [x] 스케줄 항목 클릭 시 맵에서 해당 노드 하이라이트 ✅
- [x] 타임라인 뷰 컴포넌트: `src/features/schedule/ui/timeline-view.tsx` ✅
- [x] 양방향 인터랙션: 맵에서 노드 클릭 시 타임라인 항목도 하이라이트 ✅
- [x] Public API: `src/pages/schedule-dashboard/index.ts` ✅

---

## Phase 5: QR 체크인 시스템 (P1 - High)

### 5.1 QR 코드 생성
- [x] 의존성 설치: `pnpm add qrcode @types/qrcode html5-qrcode` ✅
- [x] `src/features/checkin/api/actions.ts` 생성 ✅
- [x] `generateQRCode(bookingId)` Server Action 구현 ✅
  - QR 데이터: `{ bookingId, userId, timestamp }`
  - Base64 이미지 반환
- [x] `verifyAndCheckIn(qrDataString)` Server Action 구현 ✅
  - QR 코드 데이터 검증 및 체크인 처리

### 5.2 체크인 페이지
- [x] `app/checkin/[bookingId]/page.tsx` 생성 ✅
- [x] QR 코드 표시 UI ✅
- [x] 체크인 버튼 및 상태 업데이트 로직 ✅
- [x] QR 코드 표시 컴포넌트: `src/features/checkin/ui/qr-code-display.tsx` ✅
- [x] 예약 정보 표시 및 상태 관리 ✅

### 5.3 관리자 QR 스캔 페이지
- [x] `app/admin/scan/page.tsx` 생성 ✅
- [x] 모바일 웹 최적화 ✅
- [x] 카메라 접근 (Web API) 구현 ✅
- [x] QR 스캔 후 `booking.status` 업데이트 ✅
- [x] `html5-qrcode` 라이브러리 통합 ✅

---

## Phase 6: 운영 알림 봇 (P1 - High)

### 6.1 카카오 알림톡 API 연동
- [ ] 의존성 설치: `pnpm add @kakao/kakao-sdk` (또는 REST API)
- [ ] `src/shared/api/kakao-notification.ts` 생성
- [ ] 알림톡 발송 함수 구현
- [ ] 템플릿 메시지 구성

### 6.2 스케줄 알림 로직
- [x] `src/features/notification/api/actions.ts` 생성 ✅
- [x] 매너타임 시작 알림 대상 조회 (체크인 후 지정 시간) ✅
- [x] 체험 시간 임박 알림 대상 조회 (시작 30분 전) ✅
- [x] API 라우트 생성 (`/api/notifications/check`) ✅
- [x] Public API 생성 (`src/features/notification/index.ts`) ✅
- [ ] Cron Job 또는 Server Action 주기적 실행 설정 (Vercel Cron 또는 외부 스케줄러)
- [ ] TODO (Post-MVP): 카카오 알림톡 API 연동 후 실제 발송 로직 추가

---

## Phase 7: UI/UX 개선 및 통합

### 7.1 타임라인 뷰
- [x] `src/features/schedule/ui/timeline-view.tsx` 생성 ✅
- [x] 시계열 형태 일정표 UI ✅
- [x] 모바일 반응형 개선 ✅
- [x] 각 항목 클릭 시 맵에서 위치 표시 ✅
- [ ] 드래그 앤 드롭 순서 변경 (선택사항, 향후 구현)

### 7.2 모바일 반응형 최적화
- [x] Tailwind CSS 반응형 클래스 적용 ✅
- [x] 타임라인 뷰 모바일 최적화 ✅
- [x] 스케줄 대시보드 모바일 최적화 ✅
- [x] 터치 제스처 지원 (맵 줌/팬) ✅
  - 단일 터치: 팬 (드래그)
  - 핀치 줌: 두 손가락으로 확대/축소
- [x] 맵 컴포넌트 모바일 반응형 개선 ✅

### 7.3 PWA 설정
- [x] `app/manifest.ts` 최적화 ✅
  - CampX 앱 정보 업데이트
  - 아이콘 및 스크린샷 설정
  - 카테고리 및 언어 설정
- [x] 오프라인 지원 구현 ✅
  - Service Worker 추가 (`public/sw.js`)
  - 오프라인 페이지 생성 (`app/offline/page.tsx`)
  - 기본 캐싱 전략 구현
- [ ] 홈 화면 추가 기능 테스트 (수동 테스트 필요)

---

## Phase 8: 사용자 여정 페이지 구현

### 8.1 예약 생성 플로우
- [x] **예약 생성 페이지** (`/bookings/new`)
  - 파일: `app/bookings/new/page.tsx` ✅
  - SNB 포함 ✅
  - 체크인/체크아웃 날짜 선택기 ✅
  - 인원 수 입력 ✅
  - 특이사항 입력 ✅
  - 예약 생성 Server Action 연동 ✅
  - 생성 후 AI 스케줄 생성 트리거 ✅
  - Public API: `src/pages/booking-new/index.ts` ✅

- [x] **AI 스케줄 생성 중 페이지** (`/bookings/[bookingId]/generating`)
  - 파일: `app/bookings/[bookingId]/generating/page.tsx` ✅
  - SNB 포함 (간소화된 레이아웃) ✅
  - 진행률 바 컴포넌트 ✅
  - 단계별 설명 ("사용자 선호도 분석 중...", "최적 노드 매칭 중...", "경로 최적화 중...") ✅
  - 진행률 업데이트 (시뮬레이션) ✅
  - 완료 후 스케줄 대시보드로 자동 리다이렉트 ✅
  - Public API: `src/pages/booking-generating/index.ts` ✅

### 8.2 Stay 단계 페이지
- [x] **Stay 대시보드** (`/stay/[bookingId]`)
  - 파일: `app/stay/[bookingId]/page.tsx` ✅
  - SNB 포함 ✅
  - 현재 시간 및 다음 활동 카드 ✅
  - 맵 미리보기 (클릭 시 전체 맵으로 이동) ✅
  - 빠른 액션 버튼 (화장실 찾기, 개수대 찾기, 현재 스케줄 보기, 알림 확인) ✅
  - GPS 기반 현재 위치 표시 ✅
  - 피로도 기반 Upselling UI (장작 배달 등) ✅
  - Public API: `src/pages/stay/index.ts` ✅
  - ⚠️ activity_logs 기록 기능은 향후 구현 예정

- [x] **맵 전용 페이지** (`/map/[bookingId]`)
  - 파일: `app/map/[bookingId]/page.tsx` ✅
  - 전체 화면 맵 레이아웃 ✅
  - GPS 위치 추적 ✅
  - 노드 상세 정보 모달 (CampsiteMap 컴포넌트 내장) ✅
  - Public API: `src/pages/map/index.ts` ✅

- [x] **알림 센터** (`/notifications`)
  - 파일: `app/notifications/page.tsx` ✅
  - SNB 포함 ✅
  - 알림 목록 UI ✅
  - 알림 타입별 필터 (매너타임, 체험 시간 임박 등) ✅
  - Public API: `src/pages/notifications/index.ts` ✅
  - ⚠️ 알림 설정 페이지는 향후 구현 예정

### 8.3 체크아웃 및 피드백
- [x] **체크아웃 페이지** (`/checkout/[bookingId]`)
  - 파일: `app/checkout/[bookingId]/page.tsx` ✅
  - SNB 포함 ✅
  - 체크아웃 확인 UI ✅
  - 경험 평가 설문 폼:
    - 만족도 (1-5점) ✅
    - 추천 활동/비추천 활동 선택 ✅
    - 개선사항 피드백 입력 ✅
  - Public API: `src/pages/checkout/index.ts` ✅
  - ⚠️ 피드백 데이터 저장 Server Action은 향후 구현 예정

### 8.4 예약 관리
- [x] **예약 히스토리** (`/bookings`)
  - 파일: `app/bookings/page.tsx` ✅
  - SNB 포함 ✅
  - 과거 예약 목록 UI ✅
  - 예약별 상세 정보 모달 ✅
  - 각 예약별 스케줄 확인 ✅
  - Public API: `src/pages/bookings/index.ts` ✅

### 8.5 네비게이션 통합
- [x] **SNB (Side Navigation Bar) 모든 페이지 적용**
  - 모든 인증된 페이지에 SNB 적용 ✅
  - 공통 메뉴: 홈, 대시보드, 맞춤 질문, 스케줄, 맵, 알림, 예약 ✅
  - 현재 페이지 자동 하이라이트 ✅
  - 각 페이지에서 Sidebar 컴포넌트 직접 사용 ✅
  - ⚠️ GNB (Global Navigation Bar)는 랜딩 페이지에 별도로 구현 필요

### 8.6 사용자 여정 연결
- [x] **예약 생성 완료 후 AI 스케줄 생성 트리거**
  - 예약 생성 후 `/bookings/[bookingId]/generating`으로 이동 ✅
  - AI 스케줄 생성 완료 후 `/schedule`로 자동 이동 ✅

- [ ] **온보딩 완료 후 예약 생성으로 이동**
  - 온보딩 페이지에서 "예약 만들기" CTA 추가 (향후 구현)
  - 설문 완료 후 `/bookings/new`로 리다이렉트 (향후 구현)

- [ ] **체크인 완료 후 Stay 대시보드로 이동**
  - 체크인 완료 후 `/stay/[bookingId]`로 자동 리다이렉트 (향후 구현)

- [x] **체크아웃 완료 후 홈 또는 예약 목록으로 이동**
  - 체크아웃 완료 후 `/bookings`로 이동 ✅

### 8.7 UI/UX 개선
- [x] **진행 상황 표시**
  - AI 스케줄 생성: 단계별 진행률 표시 ✅
  - 체크아웃: 단계별 안내 UI ✅
  - 온보딩: 진행률 바 추가 (향후 구현)

- [x] **모바일 최적화**
  - Stay 대시보드: 터치 친화적 버튼 크기 및 간격 ✅
  - 맵: 전체 화면, 제스처 지원 (핀치 줌, 드래그) ✅
  - 알림 센터: 모바일 최적화 ✅

---

## Phase 9: 브랜딩 · 랜딩 페이지 · 지도 개편 (2026-03-15)

### 9.1 브랜딩 전체 적용 — "CampX" → "자연스런 캠핑장"
- [x] **로고 교체** (`/logo-natural-camping.jpg`) — GNB, Footer, About 페이지 ✅
- [x] **브랜드명 텍스트 일괄 변경** ✅
  - `src/components/gnb.tsx`: "CampX" → "자연스런 캠핑장"
  - `src/components/hero-section.tsx`
  - `src/components/features-section.tsx`: "왜 CampX인가요?" / 설명 문구
  - `src/components/app-preview-section.tsx`
  - `src/components/cta-section.tsx`
  - `src/components/footer.tsx`

### 9.2 SEO · PWA · 파비콘 업데이트
- [x] **메타데이터** (`app/layout.tsx`) ✅
  - `title`: '자연스런 캠핑장'
  - `description`: 제천 자연 체험 캠핑장 내용으로 변경
  - `apple-mobile-web-app-title`: '자연스런 캠핑장'
- [x] **파비콘 재생성** (sharp로 로고 JPG → 모든 사이즈 변환) ✅
  - `favicon.ico`, `icon-light/dark-32x32.png`, `icon-192.png`, `icon-512.png`, `apple-icon.png`
- [x] **PWA manifest** (`app/manifest.ts`) ✅
  - `name`, `short_name`: '자연스런 캠핑장'
  - `description`: 캠핑장 소개 내용

### 9.3 체험 프로그램 페이지 실제 이미지 적용 (`/experiences`)
- [x] docs 폴더 사진 7장 → `public/` 복사 ✅
  - `exp-cure-fish.jpg` (큐어피쉬 체험)
  - `exp-forest-product.jpg` (임산물 체험 — 밤 줍기)
  - `exp-event.jpg` (이벤트 프로그램 — 물놀이)
  - `exp-pine-echo.jpg` (소나무동산 메아리 — Go-Forest!)
  - `exp-wind-valley.jpg` (바람골길 맑은 공기)
- [x] `src/pages/experiences/ui/experiences-page.tsx` 실제 사진 카드로 교체 ✅
  - `next/image` + `fill` 사용, hover 시 이미지 줌 효과

### 9.4 기능 카드 인터랙션 구현 (`features-section.tsx`)
- [x] **로그인 상태** → 카드 클릭 시 기능 페이지로 이동 ✅
  - AI 스케줄러 → `/schedule`
  - 3D 맵 뷰어 → `/dashboard`
  - 스마트 체크인 → `/bookings`
- [x] **비로그인 상태** → 클릭 시 Clerk 로그인 모달 팝업 ✅
  - "로그인 후 이용 가능" 안내 표시
- [x] `useUser()` 훅으로 클라이언트 auth 상태 감지 ✅

### 9.5 보도자료 페이지 신설 (`/press`)
- [x] `src/pages/press/ui/press-page.tsx` 생성 ✅
  - 보도자료 카드 목록 UI
  - 굿모닝충청 기사 추가: "[청년이 답이다] 캠핑의 최고 가치는 자연…제천 '모두의 숲' 주목"
    - URL: https://www.goodmorningcc.com/news/articleView.html?idxno=429213
  - 회사소개서 PDF 다운로드 버튼
- [x] `app/press/page.tsx` 라우트 생성 ✅
- [x] **푸터 링크 변경**: "보도자료" `/company-intro.pdf` → `/press` ✅

### 9.6 네이버 지도 페이지 신설 (`/map`)
- [x] `src/pages/campsite-map/ui/campsite-map-page.tsx` 생성 ✅
  - 네이버 지도 JavaScript API v3 연동
  - 캠핑장 위치 마커 + 인포창 (충청북도 제천시 백운면 구학산로 1096-1)
  - 지도 타입 전환 버튼 (일반 / 지형 / 위성)
  - 하단 정보 바: 주소, 전화, 전화 버튼, 길찾기 버튼
  - 길찾기: 네이버 앱 딥링크 → 미설치 시 웹 fallback
  - API 키 미설정 시 안내 메시지 표시
- [x] `app/map/page.tsx` 독립 라우트 생성 (`/map/[bookingId]`와 별도) ✅
- [x] **환경변수 추가** ✅
  - `.env.example`: `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID`
  - `.env.local`: API 키 실제 값 설정 완료
  - 네이버 클라우드 콘솔에서 `localhost` 도메인 등록 필요

### 9.7 Next.js 16 params Promise 오류 수정
- [x] `app/map/[bookingId]/page.tsx`: `async` + `await params` 패턴 적용 ✅
- [x] `app/stay/[bookingId]/page.tsx`: 동일 패턴 적용 ✅
- [x] `app/bookings/[bookingId]/generating/page.tsx`: 동일 패턴 적용 ✅
  - 기준: `app/checkin/[bookingId]/page.tsx`의 `params: Promise<{ bookingId: string }>` 패턴

### 9.8 히어로섹션 전면 개편 — 파노라마 이미지 + 다이나믹 애니메이션
- [x] 실제 캠핑장 사진 7장 `public/` 복사 (`hero-01.jpg` ~ `hero-07.jpg`) ✅
- [x] **파노라마 무한 스크롤 스트립** (2열 반대 방향) ✅
  - Row 1: 오른쪽→왼쪽 (소나무동산·큐어피쉬·물놀이·장작패기)
  - Row 2: 왼쪽→오른쪽 역방향 (풀장·큐어피쉬근접·다슬기·소나무동산)
  - 마우스 진입 → 전체 일시정지 (`useAnimation` 제어)
  - 개별 이미지 호버 → `scale: 1.08` 확대 + 레이블 오버레이
  - 양쪽 끝 fade 마스크로 자연스러운 파노라마 연출
- [x] **헤드라인 단어별 blur+fade 순차 등장** (expo easing) ✅
- [x] **배경 blob pulse 애니메이션** (3개, 비동기 타이밍) ✅
- [x] **스크롤 패럴랙스** (`useScroll` + `useTransform`) ✅
- [x] **통계 카드** spring 진입 + hover float ✅
  - 큐어피쉬 체험 운영 중 / 자연 체험 5가지 / 캠프파이어 매일 저녁
- [x] 버튼 `whileHover` / `whileTap` 스프링 반응 ✅

---

## 성능 목표

- [ ] AI 스케줄 생성: 3초 이내
- [ ] 맵 렌더링: 초기 로드 2초 이내
- [ ] 모바일 최적화: Lighthouse 점수 90+

---

## 플랫폼 사용 가이드

> CampX MVP의 주요 기능 사용 방법 및 접근 경로 안내

### 빠른 시작

1. **랜딩 페이지**: [http://localhost:3000/](http://localhost:3000/) (또는 배포된 도메인)
2. **시작하기**: 랜딩 페이지의 "시작하기" 버튼 클릭 → [온보딩 페이지](/onboarding)로 이동

### 사용자 여정별 기능 접근

#### 1. 온보딩 (Onboarding) - 선호도 설문

**접근 경로:**
- 직접 URL: [`/onboarding`](/onboarding)
- 랜딩 페이지: "시작하기" 버튼 클릭
- CTA 섹션: "Start Free Trial" 버튼 클릭

**기능:**
- 컨디션(피로도) 입력 (1-10 스케일)
- 동반 인원 수 입력 (1-10명)
- 반려동물 유무 선택
- 선호 활동 입력 (Nature, Activity, Rest 각각 0-10)

**다음 단계:** 설문 완료 후 → [스케줄 대시보드](/schedule)에서 AI 스케줄 확인

---

#### 2. AI 스케줄러 + 2.5D 인터랙티브 맵

**접근 경로:**
- 직접 URL: [`/schedule`](/schedule) (인증 필요)
- 온보딩 완료 후 자동 이동 (향후 구현 예정)

**기능:**
- **타임라인 뷰**: 시계열 형태의 일정표 표시
  - 각 활동의 시작/종료 시간
  - 활동별 노드 정보
  - 클릭 시 맵에서 해당 위치 하이라이트
- **맵 뷰**: 2.5D 인터랙티브 캠핑장 맵
  - 항공샷 배경 이미지
  - 노드 위치 핀 표시 (타입별 색상 구분)
  - 스케줄 경로 표시 (polyline)
  - 노드 클릭 시 상세 정보 모달
  - 줌/팬 기능 (마우스 휠, 드래그)

**사용 팁:**
- 타임라인과 맵 뷰를 전환하여 일정을 다양한 방식으로 확인
- 맵에서 노드 클릭 시 타임라인에서 해당 항목도 하이라이트됨

---

#### 3. 비대면 체크인 (QR 체크인)

**접근 경로:**
- 직접 URL: [`/checkin/[bookingId]`](/checkin/[bookingId]) (예: `/checkin/123`)
- 예약 ID가 필요함 (현재는 수동으로 URL 입력)

**기능:**
- 예약 정보 기반 QR 코드 표시
- 체크인 버튼으로 상태 업데이트
- 예약 정보 확인

**사용 시나리오:**
1. 예약 확정 후 예약 ID를 받음
2. 체크인 페이지 URL 접근 (예: `/checkin/abc123`)
3. QR 코드 확인 및 체크인 완료

---

#### 4. 관리자 QR 스캔

**접근 경로:**
- 직접 URL: [`/admin/scan`](/admin/scan) (인증 필요, 관리자 권한 확인 필요)

**기능:**
- 모바일 웹 최적화된 QR 스캔 페이지
- 카메라 접근 (Web API)
- QR 코드 스캔 후 예약 상태 자동 업데이트

**사용 시나리오:**
1. 관리자가 모바일 기기에서 `/admin/scan` 접근
2. 카메라 권한 허용
3. 고객의 QR 코드 스캔
4. 자동으로 체크인 처리

---

#### 5. 대시보드 (파일 관리)

**접근 경로:**
- 직접 URL: [`/dashboard`](/dashboard) (인증 필요)

**기능:**
- 파일 업로드 및 관리
- 업로드된 파일 목록 조회
- 파일 다운로드 및 삭제

**참고:** 현재는 파일 관리 기능만 제공되며, 향후 캠핑 관련 기능으로 확장 예정

---

### 인증 및 계정 관리

#### 로그인/회원가입

**접근 경로:**
- 로그인: [`/auth/sign-in`](/auth/sign-in)
- 회원가입: [`/auth/sign-up`](/auth/sign-up)
- 랜딩 페이지: GNB의 "로그인" 버튼 클릭

**인증 방식:**
- Clerk Auth 사용
- 이메일/소셜 로그인 지원

#### 계정 설정

**접근 경로:**
- 계정 관리: [`/account/[path]`](/account/[path])
  - 예: `/account/profile`, `/account/settings`

---

### 전체 기능 맵

```
랜딩 페이지 (/)
├── 온보딩 (/onboarding) ← "시작하기" 버튼
│   └── 설문 완료 후
│       └── 스케줄 대시보드 (/schedule) ← 인증 필요
│           ├── 타임라인 뷰
│           └── 맵 뷰 (2.5D 인터랙티브 맵)
│
├── 체크인 (/checkin/[bookingId]) ← 예약 ID 필요
│   └── QR 코드 표시 및 체크인
│
├── 관리자 QR 스캔 (/admin/scan) ← 관리자 권한 필요
│   └── QR 코드 스캔 및 체크인 처리
│
├── 대시보드 (/dashboard) ← 인증 필요
│   └── 파일 관리
│
└── 인증
    ├── 로그인 (/auth/sign-in)
    ├── 회원가입 (/auth/sign-up)
    └── 계정 관리 (/account/[path])
```

---

### 주요 기능별 상세 가이드

#### AI 스케줄 생성 프로세스

1. **온보딩 설문 완료** ([`/onboarding`](/onboarding))
   - 컨디션, 동반자, 선호 활동 입력
   - 설문 제출 시 사용자 벡터 생성 및 저장

2. **예약 생성** (향후 구현)
   - 체크인/체크아웃 날짜 입력
   - 예약 생성

3. **AI 스케줄 생성** (향후 구현)
   - 예약 정보 기반 AI 스케줄 자동 생성
   - pgvector 기반 유사 노드 추출
   - 피로도 페널티 계산
   - 최적 경로 산출

4. **스케줄 확인** ([`/schedule`](/schedule))
   - 타임라인 뷰에서 일정 확인
   - 맵 뷰에서 위치 및 경로 확인

#### 2.5D 맵 사용법

1. **맵 접근**: [`/schedule`](/schedule) → "맵" 탭 클릭

2. **기본 조작:**
   - **줌**: 마우스 휠 위/아래 또는 핀치 제스처 (모바일)
   - **팬**: 마우스 드래그 또는 터치 드래그 (모바일)
   - **노드 클릭**: 노드 상세 정보 모달 표시

3. **경로 확인:**
   - 스케줄이 생성되면 맵에 경로(polyline)가 표시됨
   - 타임라인에서 항목 클릭 시 맵에서 해당 노드 하이라이트

#### QR 체크인 프로세스

**고객 측:**
1. 예약 확정 후 예약 ID 확인
2. [`/checkin/[bookingId]`](/checkin/[bookingId]) 접근
3. QR 코드 확인
4. 체크인 버튼 클릭 (또는 관리자가 스캔)

**관리자 측:**
1. [`/admin/scan`](/admin/scan) 접근
2. 카메라 권한 허용
3. 고객의 QR 코드 스캔
4. 자동 체크인 처리

---

### 개발 환경에서 테스트하기

**로컬 개발 서버:**
```bash
pnpm dev  # http://localhost:3000
```

**접근 가능한 페이지:**
- 랜딩 페이지: http://localhost:3000/
- 온보딩: http://localhost:3000/onboarding
- 스케줄 대시보드: http://localhost:3000/schedule (인증 필요)
- 체크인: http://localhost:3000/checkin/[bookingId] (예약 ID 필요)
- 관리자 QR 스캔: http://localhost:3000/admin/scan (인증 필요)
- 대시보드: http://localhost:3000/dashboard (인증 필요)
- 로그인: http://localhost:3000/auth/sign-in

**참고:**
- 인증이 필요한 페이지는 로그인하지 않으면 `/auth/sign-in`으로 리다이렉트됩니다
- 예약 ID는 실제 예약 생성 후 받을 수 있습니다 (현재는 테스트용 ID 필요)
- 더미 데이터는 개발 모드에서만 생성 가능합니다

---

## Post-MVP: 프로젝트 고도화

> MVP 완료 후 확장 및 최적화를 위한 개발 계획

### 성능 최적화 (Performance Optimization)

#### AI 스케줄 생성 최적화 (목표: 3초 이내)
- [ ] **벡터 검색 최적화**
  - pgvector 인덱스 최적화 (IVFFlat 또는 HNSW 인덱스 적용)
  - 유사 노드 검색 쿼리 성능 측정 및 최적화
  - `findSimilarNodes()` 함수 병렬 처리 검토
- [ ] **경로 탐색 알고리즘 최적화**
  - TSP 변형 알고리즘 개선 (그리디 → 동적 프로그래밍 또는 근사 알고리즘)
  - `findOptimalPath()` 함수 메모이제이션 적용
  - 캐시 전략 도입 (동일 사용자/예약 조건 재사용)
- [ ] **데이터베이스 쿼리 최적화**
  - N+1 쿼리 문제 해결 (JOIN 또는 배치 조회)
  - 스케줄 생성 시 필요한 데이터만 선별 조회
  - Connection Pool 설정 최적화
- [ ] **비동기 처리 및 스트리밍**
  - 스케줄 생성 과정을 단계별로 스트리밍하여 사용자 경험 개선
  - WebSocket 또는 Server-Sent Events (SSE) 활용
  - 진행률 표시 UI 추가

#### 맵 렌더링 최적화 (목표: 초기 로드 2초 이내)
- [ ] **이미지 최적화**
  - 항공샷 이미지 WebP/AVIF 변환
  - 이미지 레이지 로딩 및 Progressive Loading 적용
  - CDN 연동 (Cloudflare R2 또는 Vercel Image Optimization)
  - 반응형 이미지 (srcset) 적용
- [ ] **렌더링 성능 개선**
  - SVG 핀 레이어 가상화 (화면에 보이는 영역만 렌더링)
  - React.memo 및 useMemo를 활용한 불필요한 리렌더링 방지
  - Canvas 기반 렌더링 검토 (대량 노드 처리 시)
- [ ] **코드 스플리팅**
  - 맵 컴포넌트 동적 import (`next/dynamic`)
  - Three.js (향후 3D 업그레이드 시) 별도 청크 분리
- [ ] **캐싱 전략**
  - 정적 맵 데이터 (노드 정보) 클라이언트 캐싱
  - Service Worker를 통한 오프라인 맵 지원 강화

#### 모바일 최적화 (목표: Lighthouse 점수 90+)
- [ ] **Core Web Vitals 개선**
  - LCP (Largest Contentful Paint): 2.5초 이내
    - Critical CSS 인라인화
    - 폰트 preload 및 font-display: swap 적용
  - FID (First Input Delay): 100ms 이내
    - JavaScript 번들 크기 최적화
    - 코드 스플리팅 및 트리 쉐이킹
  - CLS (Cumulative Layout Shift): 0.1 이하
    - 이미지/비디오 크기 명시
    - 동적 콘텐츠 로딩 시 스켈레톤 UI 적용
- [ ] **번들 크기 최적화**
  - 번들 분석 도구 도입 (`@next/bundle-analyzer`)
  - 불필요한 의존성 제거
  - Tree-shaking 최적화
- [ ] **PWA 기능 강화**
  - 오프라인 기능 확장 (맵 데이터 캐싱)
  - 푸시 알림 지원 (체크인 알림, 스케줄 알림)
  - 홈 화면 추가 안내 UX 개선

### 기능 확장 (Feature Enhancement)

#### P2 기능: 피로도 기반 Upselling
- [ ] **지침 지수 계산 로직**
  - `total_fatigue_score` 기반 지침 지수 산출 알고리즘 구현
  - 실시간 피로도 추적 (체크인 후 활동 로그 기반)
- [ ] **Upselling UI 구현**
  - 지침 지수 임계값 도달 시 부가 서비스 버튼 노출
  - 장작 배달, 카페 주문 등 부가 서비스 연동
  - 결제 시스템 연동 (Stripe 또는 토스페이먼츠)
- [ ] **관리자 대시보드**
  - 부가 매출 통계 및 분석
  - Upselling 성공률 추적

#### 알림 시스템 완성
- [ ] **카카오 알림톡 API 연동**
  - 카카오 비즈니스 계정 설정
  - 알림톡 템플릿 등록 및 승인
  - `src/shared/api/kakao-notification.ts` 구현
- [ ] **스케줄 알림 로직 완성**
  - 매너타임 시작 알림 발송 로직 구현
  - 체험 시간 임박 알림 (30분 전) 발송 로직 구현
  - Vercel Cron Jobs 또는 외부 스케줄러 연동
- [ ] **알림 설정 관리**
  - 사용자별 알림 수신 설정 (선택/거부)
  - 알림 이력 조회 기능

#### 사용자 경험 개선
- [ ] **스케줄 수정 기능**
  - 타임라인 뷰에서 드래그 앤 드롭으로 순서 변경
  - 항목 삭제/추가 기능
  - 수정된 스케줄 재저장 및 피로도 재계산
- [ ] **체크아웃 및 피드백**
  - 체크아웃 버튼 구현
  - 경험 평가 설문 (만족도, 개선사항)
  - 평가 데이터를 사용자 벡터 재학습에 활용
- [ ] **실시간 위치 추적** (선택사항)
  - GPS 기반 현재 위치 표시
  - 목적지까지 남은 거리/시간 표시
  - 경로 안내 (네비게이션)

### 기술 고도화 (Technical Advancement)

#### 3D 맵 업그레이드
- [ ] **React Three Fiber 통합**
  - SVG 기반 맵에서 Three.js 기반 3D 맵으로 전환
  - 카메라 컨트롤 (OrbitControls) 구현
  - 3D 모델 통합 (텐트, 시설물 등)
- [ ] **성능 최적화**
  - LOD (Level of Detail) 적용
  - Frustum Culling 구현
  - WebGL 렌더링 최적화

#### 실시간 기능
- [ ] **WebSocket 통합**
  - 실시간 스케줄 업데이트 (다중 사용자 환경)
  - 실시간 알림 전달
  - 관리자 대시보드 실시간 모니터링
- [ ] **Server-Sent Events (SSE)**
  - 스케줄 생성 진행률 스트리밍
  - 실시간 피로도 업데이트

#### 데이터 분석 및 ML 개선
- [ ] **사용자 벡터 재학습**
  - 체크아웃 피드백 데이터 수집
  - 벡터 업데이트 알고리즘 구현
  - A/B 테스트 프레임워크 구축
- [ ] **추천 정확도 개선**
  - 협업 필터링 (Collaborative Filtering) 도입
  - 시계열 분석 (시간대별 선호도 패턴)
  - 앙상블 모델 적용

### 운영 및 인프라 (Operations & Infrastructure)

#### 모니터링 및 로깅
- [ ] **애플리케이션 모니터링**
  - Sentry 또는 Datadog 연동
  - 에러 추적 및 알림 설정
  - 성능 메트릭 수집 (APM)
- [ ] **로그 관리**
  - 구조화된 로깅 (JSON 형식)
  - 로그 집계 및 분석 도구 연동
  - 보안 이벤트 로깅

#### 데이터베이스 최적화
- [ ] **인덱스 최적화**
  - 쿼리 성능 분석 및 인덱스 추가
  - pgvector 인덱스 튜닝
  - 파티셔닝 검토 (대용량 데이터 처리)
- [ ] **백업 및 복구**
  - 자동 백업 스케줄 설정
  - Point-in-time Recovery (PITR) 설정
  - 재해 복구 계획 수립

#### CI/CD 및 배포
- [ ] **자동화 테스트**
  - E2E 테스트 (Playwright) 확장
  - 성능 테스트 자동화
  - 부하 테스트 (k6 또는 Artillery)
- [ ] **배포 파이프라인 개선**
  - 스테이징 환경 구축
  - Blue-Green 배포 전략
  - 롤백 자동화

### 보안 강화 (Security Enhancement)

#### Row Level Security (RLS) 활성화
- [ ] **RLS 정책 작성**
  - 사용자별 데이터 접근 제어
  - 관리자 권한 분리
  - 공개 데이터 vs 개인 데이터 구분
- [ ] **보안 테스트**
  - SQL 인젝션 방지 검증
  - XSS 방지 검증
  - CSRF 토큰 적용

#### 인증 및 권한 관리
- [ ] **역할 기반 접근 제어 (RBAC)**
  - 사용자 역할 정의 (일반 사용자, 관리자, 슈퍼 관리자)
  - 권한 관리 시스템 구축
- [ ] **세션 관리**
  - 세션 타임아웃 설정
  - 다중 디바이스 로그인 관리

### 확장성 개선 (Scalability)

#### 다중 캠핑장 지원
- [ ] **멀티 테넌트 아키텍처**
  - 캠핑장별 데이터 격리
  - 캠핑장 관리자 대시보드
  - 캠핑장별 커스터마이징 (맵, 노드, 설정)
- [ ] **관리자 기능**
  - 캠핑장 정보 관리 (CRUD)
  - 노드 정보 관리 (CRUD)
  - 예약 관리 및 통계

#### API 및 통합
- [ ] **RESTful API 문서화**
  - OpenAPI (Swagger) 스펙 작성
  - API 버저닝 전략
- [ ] **외부 서비스 연동**
  - 예약 플랫폼 연동 (캠핏, 땡큐캠핑 등)
  - 결제 시스템 연동
  - SMS/이메일 알림 서비스 연동

### 사용자 경험 개선 (UX Enhancement)

#### 접근성 (Accessibility)
- [ ] **WCAG 2.1 준수**
  - 키보드 네비게이션 지원
  - 스크린 리더 호환성
  - 색상 대비 비율 개선
- [ ] **다국어 지원**
  - i18n (국제화) 설정
  - 영어, 일본어 등 추가 언어 지원

#### UI/UX 개선
- [ ] **애니메이션 및 전환 효과**
  - 부드러운 페이지 전환
  - 로딩 상태 표시 개선
  - 마이크로 인터랙션 추가
- [ ] **다크 모드 개선**
  - 모든 컴포넌트 다크 모드 지원
  - 시스템 설정 자동 감지

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
