import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminScanPage } from '@/pages/admin-scan';
import { getSession } from '@/shared/lib/auth-server';

export const metadata: Metadata = {
  title: 'QR 스캔',
  description: '관리자 QR 코드 스캔 페이지',
};

export default async function Page() {
  const session = await getSession();

  // TODO: 관리자 권한 확인 추가 필요
  // if (!session || !isAdmin(session.user.id)) {
  //   redirect('/auth/sign-in');
  // }

  if (!session) {
    redirect('/auth/sign-in');
  }

  return <AdminScanPage />;
}
