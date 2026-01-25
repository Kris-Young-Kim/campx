import type { Metadata } from 'next';
import { OnboardingPage } from '@/pages/onboarding';

export const metadata: Metadata = {
  title: '온보딩',
  description: '맞춤형 스케줄을 위한 선호도 설문',
};

export default function Page() {
  return <OnboardingPage />;
}
