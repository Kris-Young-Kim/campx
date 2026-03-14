import { StayPage } from '@/pages/stay';

export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  await params;
  return <StayPage />;
}
