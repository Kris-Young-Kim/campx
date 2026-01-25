import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ScheduleDashboardPage } from '@/pages/schedule-dashboard';
import { getSession } from '@/shared/lib/auth-server';

export const metadata: Metadata = {
  title: '스케줄 대시보드',
  description: 'AI가 생성한 맞춤형 스케줄을 확인하세요',
};

export default async function Page() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  return <ScheduleDashboardPage />;
}
