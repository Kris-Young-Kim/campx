/**
 * @file page.tsx
 * @description 개발용 더미 데이터 생성 페이지
 *
 * 개발 모드에서만 접근 가능한 더미 데이터 생성 페이지입니다.
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/shared/lib/auth-server';
import { SeedDummyDataButton } from './seed-button';

export default async function SeedPage() {
  // 프로덕션 모드 체크
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }

  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="container mx-auto max-w-2xl py-12 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">개발용 더미 데이터 생성</h1>
          <p className="mt-2 text-muted-foreground">
            스케줄 대시보드 테스트를 위한 더미 데이터를 생성합니다.
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-4">생성되는 데이터</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• User 프로필 (없는 경우)</li>
            <li>• Node들 (SITE, WC, STORE, ACTIVITY) - 10개</li>
            <li>• Booking (예약) - 2박 3일</li>
            <li>• Schedule (스케줄) - 활성 스케줄</li>
            <li>• ScheduleItem들 (스케줄 항목) - 8개</li>
          </ul>
        </div>

        <SeedDummyDataButton />

        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ 주의: 이 페이지는 개발 모드에서만 사용 가능합니다.
            <br />
            기존 데이터가 있어도 추가로 생성됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
