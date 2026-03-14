# CampX — Agent Context

> **자연스런 캠핑장** 전용 캠핑 플랫폼. AI 스케줄러·QR 체크인·2.5D 맵 기반.
> 목표: camfit.co.kr 능가 + AI 기능 차별화.
> 연락처: 010-6463-9641 | 충청북도 제천시 백운면 구학산로 1096-1

---

## Commands

```bash
pnpm dev              # Dev server (localhost:3000)
pnpm build            # Production build
pnpm lint             # Biome lint
pnpm check            # Biome lint + format + auto-fix
pnpm lint:fsd         # Steiger FSD architecture lint
pnpm dlx shadcn@latest add <component>
```

---

## Tech Stack

| 분류 | 스택 |
|---|---|
| Framework | Next.js 16, React 19, TypeScript 5 |
| Styling | Tailwind CSS v4 (`app/globals.css` 전용, `bg-linear-to-b` 사용) |
| UI | shadcn/ui New York, Lucide icons, react-icons (브랜드) |
| DB | Neon (PostgreSQL + pgvector), Drizzle ORM |
| Auth | Clerk (`@clerk/nextjs`) |
| AI | Claude API (`@anthropic-ai/sdk`) |
| Storage | Cloudflare R2 |
| Deploy | Vercel |

---

## Architecture (FSD)

```
app/                  # Next.js App Router — 라우팅만, 로직 금지
src/
├── app/              # Providers, global config
├── pages/            # 페이지 컴포넌트 조합
├── widgets/          # 재사용 복합 UI (Header, Sidebar)
├── features/         # 도메인 기능 단위
├── entities/         # 도메인 모델 + DB 스키마
└── shared/           # ui, lib, api, hooks (범용)
components/           # Landing page 전용 컴포넌트 (FSD 외부)
```

**Import 규칙**: `app → pages → widgets → features → entities → shared`
같은 레이어 간 cross-import 금지. 반드시 `index.ts` 경유.

```typescript
// ✅ app/example/page.tsx
export { ExamplePage as default } from '@/pages/example';

// ✅ import
import { Button } from '@/shared/ui';
import { UserCard } from '@/entities/user';

// ❌ 내부 직접 접근 금지
import { UserCard } from '@/entities/user/ui/user-card';
```

---

## Domain Map

### DB Entities & Schema 위치

| Entity | Schema 파일 | 주요 필드 |
|---|---|---|
| `users` | `src/entities/user/model/schema.ts` | `clerk_user_id`, `preference_vector(3)`, `health_condition`, `has_pet`, `family_size`, `bio_data_json` |
| `bookings` | `src/entities/booking/model/schema.ts` | `user_id`, `check_in`, `check_out`, `status` (PENDING/CONFIRMED/CHECKED_IN/CHECKED_OUT/CANCELLED) |
| `nodes` | `src/entities/node/model/schema.ts` | `name`, `type` (SITE/WC/STORE/ACTIVITY), `pos_x/y/z`, `attr_vector(3: Nature/Activity/Rest)` |
| `schedules` | `src/entities/schedule/model/schema.ts` | `booking_id`, `total_fatigue_score`, `is_active` |
| `schedule_items` | 동일 파일 | `schedule_id`, `node_id`, `sequence_order`, `start_time`, `end_time`, `activity_name` |
| `activity_logs` | `src/entities/activity-log/model/schema.ts` | `user_id`, `node_id`, `action_type`, `satisfaction_score` |

**DB 연결**: `src/shared/api/db.ts` | **pgvector 유틸**: `src/shared/lib/pgvector.ts`

### Features & Server Actions

| Feature | 위치 | 주요 Actions |
|---|---|---|
| `auth` | `src/features/auth/` | sign-in, sign-up (Clerk) |
| `booking` | `src/features/booking/` | `getUserBookings`, `createBooking` |
| `schedule` | `src/features/schedule/` | `getActiveSchedule`, `generateSchedule` |
| `checkin` | `src/features/checkin/` | QR 체크인 처리 |
| `map` | `src/features/map/` | `CampsiteMap` 컴포넌트 (2.5D) |
| `node` | `src/features/node/` | `getNodes` |
| `notification` | `src/features/notification/` | 알림 조회/생성 |
| `onboarding` | `src/features/onboarding/` | 선호도 설문 |
| `upload` | `src/features/upload/` | R2 파일 업로드 |
| `user` | `src/features/user/` | 프로필 업데이트 |

### Route → Page 매핑

| Route | Page 컴포넌트 | 설명 |
|---|---|---|
| `/` | `components/landing/` | 랜딩 (GNB, Hero, Features, Footer) |
| `/about` | `src/pages/about/` | 회사 소개 + PDF 임베드 |
| `/experiences` | `src/pages/experiences/` | 체험 프로그램 5종 |
| `/dashboard` | `src/pages/dashboard/` | 예약 현황 대시보드 |
| `/schedule` | `src/pages/schedule-dashboard/` | 타임라인 + 2.5D 맵 |
| `/bookings/new` | `src/pages/booking-new/` | 예약 생성 |
| `/bookings/[id]/generating` | `src/pages/booking-generating/` | AI 스케줄 생성 중 |
| `/stay/[id]` | `src/pages/stay/` | 체크인 후 Stay 대시보드 |
| `/map/[id]` | `src/pages/map/` | 전체 화면 맵 |
| `/checkin/[id]` | `src/pages/checkin/` | QR 체크인 |
| `/notifications` | `src/pages/notifications/` | 알림 목록 |
| `/onboarding` | `src/pages/onboarding/` | 선호도 설문 |

### Landing 컴포넌트 (`components/landing/`)

| 파일 | 역할 |
|---|---|
| `gnb.tsx` | 상단 네비게이션 (로고: `자연스런 캠핑장`, 이미지: `/logo-natural-camping.jpg`) |
| `hero-section.tsx` | 히어로 — "모험 시작하기" → `/experiences` |
| `features-section.tsx` | 주요 기능 소개 |
| `app-preview-section.tsx` | 앱 UI 미리보기 (오늘의 일정 포함) |
| `social-proof-section.tsx` | 사용자 후기 |
| `cta-section.tsx` | CTA — "영업팀 문의" 모달 (tel: 010-6463-9641) |
| `footer.tsx` | 푸터 — 회사소개/리소스/파트너 |

---

## Skills 활성화 가이드

> 작업 유형에 맞는 Skill을 먼저 호출하라. 범용 탐색 전에 항상 확인.

| 작업 유형 | 호출 Skill | 언제 |
|---|---|---|
| UI 컴포넌트·페이지 디자인 | `/frontend-design` | 새 UI 설계, 기존 UI 개선 |
| Claude API·AI 기능 구현 | `/claude-developer-platform` | chatbot, 추천 엔진, AI 액션 |
| Supabase/Neon DB·RLS·마이그레이션 | `/supabase-dev` | 스키마 변경, Edge Function, 인증 |
| 기능 단위 개발 (탐색→설계→구현) | `/feature-dev` | 새 feature 추가 |
| 코드 품질·리팩터링 | `/simplify` | 구현 완료 후 |
| Git 커밋 | `/commit` | 작업 완료 후 |
| TDD 방식 구현 | `/tdd` | 핵심 비즈니스 로직 |
| 대규모 코드베이스 분석 | `/gemini-cli` | 100KB+ 파일 분석 |

---

## Agent Workflow (도메인별)

### 새 페이지 추가
1. `src/pages/[name]/ui/[name]-page.tsx` 생성
2. `src/pages/[name]/index.ts` — export
3. `app/[route]/page.tsx` — `export { XPage as default } from '@/pages/[name]'`

### 새 Feature Action 추가
```
src/features/[name]/api/actions.ts  ← 'use server'
src/features/[name]/index.ts        ← public export
```

### DB 스키마 변경
1. `src/entities/[entity]/model/schema.ts` 수정
2. `pnpm drizzle-kit generate` → 마이그레이션 생성
3. `pnpm drizzle-kit push` → Neon DB 적용

### AI 기능 구현
- Claude API 모델: `claude-sonnet-4-6` (기본), `claude-opus-4-6` (고성능)
- `/claude-developer-platform` skill 먼저 호출
- Server Action 내에서 호출 (`'use server'`)
- pgvector 유사도 검색: `src/shared/lib/pgvector.ts` 참조

---

## Conventions

| 대상 | 규칙 | 예시 |
|---|---|---|
| 파일명 | kebab-case | `user-card.tsx` |
| 컴포넌트 | PascalCase | `UserCard` |
| 함수/변수 | camelCase | `handleClick` |
| Server Action | camelCase + `'use server'` | `createBooking` |
| Client Component | 파일 최상단 `"use client"` | — |

**Icons**: `lucide-react` (일반) / `react-icons/fa` (브랜드·SNS)
**Dark mode**: `bg-white dark:bg-black` 패턴
**Tailwind v4**: `bg-linear-to-b` (not `bg-gradient-to-b`)

---

## Key Paths (빠른 참조)

| 용도 | 경로 |
|---|---|
| UI 컴포넌트 | `src/shared/ui/` |
| 유틸리티 | `src/shared/lib/` |
| 커스텀 훅 | `src/shared/hooks/` |
| API 클라이언트 / DB | `src/shared/api/` |
| pgvector 유틸 | `src/shared/lib/pgvector.ts` |
| Tailwind 설정 | `app/globals.css` |
| shadcn 설정 | `components.json` |
| 환경 변수 샘플 | `.env.local` |
| 랜딩 컴포넌트 | `components/landing/` |
| 공개 에셋 | `public/` (logo-natural-camping.jpg, company-intro.pdf) |
| DB 마이그레이션 | `drizzle/` |

---

## SEO

```typescript
// app/[route]/page.tsx
export const metadata: Metadata = {
  title: 'Page Title', // → "Page Title | 자연스런 캠핑장"
  description: '...',
};
```

환경 변수: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
