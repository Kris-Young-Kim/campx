import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CheckinPage } from '@/pages/checkin';
import { getSession } from '@/shared/lib/auth-server';

export const metadata: Metadata = {
  title: '체크인',
  description: '예약 체크인 및 QR 코드',
};

export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const { bookingId } = await params;

  return <CheckinPage bookingId={bookingId} />;
}
