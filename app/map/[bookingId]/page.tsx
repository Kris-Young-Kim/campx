import { MapPage } from '@/pages/map';

export default async function Page({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  await params;
  return <MapPage />;
}
