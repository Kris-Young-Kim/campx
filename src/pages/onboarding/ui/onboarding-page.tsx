/**
 * @file onboarding-page.tsx
 * @description 온보딩 페이지 컴포넌트
 *
 * 사용자가 처음 접속할 때 선호도를 조사하는 페이지입니다.
 *
 * @dependencies
 * - @/features/onboarding: 설문 폼 컴포넌트
 */

import { SurveyForm } from '@/features/onboarding';

export function OnboardingPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">환영합니다!</h1>
        <p className="text-muted-foreground">
          맞춤형 스케줄을 위해 몇 가지 질문에 답변해주세요.
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <SurveyForm />
      </div>
    </div>
  );
}
