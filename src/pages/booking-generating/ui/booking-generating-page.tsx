/**
 * @file booking-generating-page.tsx
 * @description AI 스케줄 생성 중 페이지 컴포넌트
 *
 * 예약 생성 후 AI 스케줄을 생성하는 동안 진행률을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 진행률 바 표시
 * 2. 단계별 설명 ("사용자 선호도 분석 중...", "최적 노드 매칭 중...", "경로 최적화 중...")
 * 3. 완료 후 스케줄 대시보드로 자동 리다이렉트
 *
 * @dependencies
 * - @/features/schedule: AI 스케줄 생성 Server Action
 * - @/shared/ui: UI 컴포넌트
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Progress } from '@/shared/ui/progress';
import { generateSchedule } from '@/features/schedule';

const GENERATION_STEPS = [
  { label: '사용자 선호도 분석 중...', progress: 20 },
  { label: '최적 노드 매칭 중...', progress: 50 },
  { label: '경로 최적화 중...', progress: 80 },
  { label: '스케줄 생성 완료!', progress: 100 },
];

export function BookingGeneratingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.bookingId as string;
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      router.push('/bookings/new');
      return;
    }

    // AI 스케줄 생성
    const generate = async () => {
      try {
        // 단계별 진행률 시뮬레이션
        const stepInterval = setInterval(() => {
          setCurrentStep((prev) => {
            if (prev < GENERATION_STEPS.length - 1) {
              return prev + 1;
            }
            clearInterval(stepInterval);
            return prev;
          });
        }, 1000);

        // 실제 스케줄 생성
        const result = await generateSchedule(bookingId, {});

        clearInterval(stepInterval);
        setCurrentStep(GENERATION_STEPS.length - 1);

        if (!result.ok) {
          setError(result.error || '스케줄 생성에 실패했습니다.');
          setIsGenerating(false);
          return;
        }

        // 생성 완료 후 잠시 대기 후 리다이렉트
        setTimeout(() => {
          router.push(`/schedule`);
        }, 1500);
      } catch (err) {
        console.error('Failed to generate schedule:', err);
        setError('스케줄 생성 중 오류가 발생했습니다.');
        setIsGenerating(false);
      }
    };

    generate();
  }, [bookingId, router]);

  const currentProgress = GENERATION_STEPS[currentStep]?.progress ?? 0;
  const currentLabel = GENERATION_STEPS[currentStep]?.label ?? '';

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">AI 스케줄 생성 중</CardTitle>
          <CardDescription>
            최적의 캠핑 일정을 만들어드리고 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error ? (
            <div className="space-y-4">
              <div className="rounded-md bg-destructive/10 p-4">
                <p className="text-sm text-destructive">{error}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/bookings/new')}
                  className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  다시 시도
                </button>
                <button
                  onClick={() => router.push('/schedule')}
                  className="flex-1 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent"
                >
                  스케줄 보기
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{currentLabel}</span>
                  <span className="font-medium">{currentProgress}%</span>
                </div>
                <Progress value={currentProgress} className="h-2" />
              </div>

              {isGenerating && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>잠시만 기다려주세요...</span>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
