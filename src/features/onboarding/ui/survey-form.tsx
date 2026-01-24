/**
 * @file survey-form.tsx
 * @description 온보딩 설문 폼 컴포넌트
 *
 * 사용자의 선호도와 컨디션을 조사하여 AI 스케줄 생성을 위한 벡터를 생성합니다.
 *
 * 주요 기능:
 * 1. 컨디션(피로도) 입력 (1-10)
 * 2. 동반자 정보 입력 (가족 구성원 수, 반려동물 유무)
 * 3. 선호 활동 입력 (Nature, Activity, Rest 각각 0-10)
 * 4. 설문 제출 시 사용자 벡터 생성 및 저장
 *
 * @dependencies
 * - react-hook-form: 폼 관리
 * - zod: 스키마 검증
 * - @hookform/resolvers: zod resolver
 * - @/shared/ui: ShadCN UI 컴포넌트
 * - @/features/user: 사용자 프로필 업데이트
 */

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Slider } from '@/shared/ui/slider';
import { Checkbox } from '@/shared/ui/checkbox';
import { updateUserProfile } from '@/features/user';
import { generateUserVector } from '@/shared/lib/user-vector';
import type { OnboardingSurvey } from '@/shared/lib/user-vector';

const surveySchema = z.object({
  healthCondition: z.number().min(1).max(10),
  familySize: z.number().min(1).max(10),
  hasPet: z.boolean(),
  naturePreference: z.number().min(0).max(10),
  activityPreference: z.number().min(0).max(10),
  restPreference: z.number().min(0).max(10),
});

type SurveyFormValues = z.infer<typeof surveySchema>;

export function SurveyForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    defaultValues: {
      healthCondition: 5,
      familySize: 1,
      hasPet: false,
      naturePreference: 5,
      activityPreference: 5,
      restPreference: 5,
    },
  });

  const onSubmit = async (data: SurveyFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // 사용자 벡터 생성
      const userVector = generateUserVector(data);

      // 사용자 프로필 업데이트
      const result = await updateUserProfile({
        healthCondition: data.healthCondition,
        familySize: data.familySize,
        hasPet: data.hasPet,
        preferenceVector: userVector,
      });

      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }

      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : '설문 제출에 실패했습니다.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">설문이 완료되었습니다!</h2>
        <p className="text-muted-foreground">
          AI가 맞춤형 스케줄을 생성할 준비가 되었습니다.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 컨디션(피로도) */}
        <FormField
          control={form.control}
          name="healthCondition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>오늘 컨디션은 어떠신가요?</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>피곤함 (1)</span>
                    <span className="font-medium">{field.value}</span>
                    <span>활력 (10)</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                오늘의 컨디션을 선택해주세요. 건강할수록 더 많은 활동을 추천합니다.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 가족 구성원 수 */}
        <FormField
          control={form.control}
          name="familySize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>동반 인원은 몇 명인가요?</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>1명</span>
                    <span className="font-medium">{field.value}명</span>
                    <span>10명</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                함께 오시는 인원 수를 선택해주세요.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 반려동물 유무 */}
        <FormField
          control={form.control}
          name="hasPet"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>반려동물을 데려오셨나요?</FormLabel>
                <FormDescription>
                  반려동물과 함께 오셨다면 체크해주세요.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* 자연 선호도 */}
        <FormField
          control={form.control}
          name="naturePreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>자연/산책 선호도</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>관심 없음 (0)</span>
                    <span className="font-medium">{field.value}</span>
                    <span>매우 좋아함 (10)</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                숲속 산책, 자연 관찰 등의 활동을 얼마나 선호하시나요?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 액티비티 선호도 */}
        <FormField
          control={form.control}
          name="activityPreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>액티비티/체험 선호도</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>관심 없음 (0)</span>
                    <span className="font-medium">{field.value}</span>
                    <span>매우 좋아함 (10)</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                캠핑장 체험 프로그램, 야외 활동 등을 얼마나 선호하시나요?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 휴식 선호도 */}
        <FormField
          control={form.control}
          name="restPreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>휴식/여유 선호도</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>관심 없음 (0)</span>
                    <span className="font-medium">{field.value}</span>
                    <span>매우 좋아함 (10)</span>
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                텐트에서 휴식하거나 여유롭게 시간을 보내는 것을 얼마나 선호하시나요?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {submitError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {submitError}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? '저장 중...' : '설문 완료'}
        </Button>
      </form>
    </Form>
  );
}
