import { BookingGeneratingPage } from '@/pages/booking-generating';

export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  await params;
  return <BookingGeneratingPage />;
}
