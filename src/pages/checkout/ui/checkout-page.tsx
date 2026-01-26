/**
 * @file checkout-page.tsx
 * @description 체크아웃 페이지 컴포넌트
 *
 * 체크아웃 확인 및 경험 평가 설문을 제공하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 체크아웃 확인 UI
 * 2. 경험 평가 설문 폼:
 *    - 만족도 (1-5점)
 *    - 추천 활동/비추천 활동 선택
 *    - 개선사항 피드백 입력
 * 3. 피드백 데이터 저장 Server Action
 * 4. 완료 후 홈 또는 예약 목록으로 이동
 *
 * @dependencies
 * - @/features/booking: 예약 데이터
 * - @/shared/ui: UI 컴포넌트
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Home,
  LayoutDashboard,
  User,
  Calendar,
  Map as MapIcon,
  Bell,
  BookOpen,
  Loader2,
  Star,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/shared/ui/sidebar';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { RadioGroup, RadioGroupItem } from '@/shared/ui/radio-group';
import { getBookingById } from '@/features/booking';
import type { Booking } from '@/features/booking/api/actions';

const navigationItems = [
  {
    title: '홈',
    url: '/',
    icon: Home,
  },
  {
    title: '대시보드',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: '맞춤 질문',
    url: '/onboarding',
    icon: User,
  },
  {
    title: '스케줄',
    url: '/schedule',
    icon: Calendar,
  },
  {
    title: '예약',
    url: '/bookings',
    icon: BookOpen,
  },
  {
    title: '맵',
    url: '/map',
    icon: MapIcon,
  },
  {
    title: '알림',
    url: '/notifications',
    icon: Bell,
  },
];

const checkoutFormSchema = z.object({
  satisfaction: z.enum(['1', '2', '3', '4', '5'], {
    required_error: '만족도를 선택해주세요.',
  }),
  recommendedActivities: z.string().optional(),
  notRecommendedActivities: z.string().optional(),
  feedback: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const bookingId = params?.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      satisfaction: undefined,
      recommendedActivities: '',
      notRecommendedActivities: '',
      feedback: '',
    },
  });

  useEffect(() => {
    if (!bookingId) {
      router.push('/bookings');
      return;
    }

    async function loadBooking() {
      try {
        setIsLoading(true);
        const result = await getBookingById(bookingId);
        if (!result.ok || !result.data) {
          router.push('/bookings');
          return;
        }
        setBooking(result.data);
      } catch (error) {
        console.error('Failed to load booking:', error);
        router.push('/bookings');
      } finally {
        setIsLoading(false);
      }
    }

    loadBooking();
  }, [bookingId, router]);

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      setIsSubmitting(true);

      // TODO: 피드백 데이터 저장 Server Action 구현
      // await saveCheckoutFeedback(bookingId, data);

      // 체크아웃 완료 후 예약 목록으로 이동
      router.push('/bookings');
    } catch (error) {
      console.error('Failed to submit checkout:', error);
      form.setError('root', {
        message: '체크아웃 처리 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-4">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold">CampX</h2>
            </div>
          </SidebarHeader>
        </Sidebar>
        <SidebarInset>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-4">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">CampX</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>메뉴</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                      >
                        <Link href={item.url}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">체크아웃</h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              캠핑 경험을 평가해주세요
            </p>
          </div>

          {/* 예약 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>예약 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">체크인</span>
                  <span className="font-medium">
                    {format(new Date(booking.checkIn), 'yyyy년 MM월 dd일', { locale: ko })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">체크아웃</span>
                  <span className="font-medium">
                    {format(new Date(booking.checkOut), 'yyyy년 MM월 dd일', { locale: ko })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">상태</span>
                  <span className="font-medium">{booking.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 경험 평가 설문 */}
          <Card>
            <CardHeader>
              <CardTitle>경험 평가</CardTitle>
              <CardDescription>
                이번 캠핑 경험에 대한 의견을 남겨주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* 만족도 */}
                <div className="space-y-3">
                  <Label>전체 만족도</Label>
                  <RadioGroup
                    value={form.watch('satisfaction')}
                    onValueChange={(value) =>
                      form.setValue('satisfaction', value as '1' | '2' | '3' | '4' | '5')
                    }
                    className="flex gap-4"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <RadioGroupItem value={String(rating)} id={`rating-${rating}`} />
                        <Label
                          htmlFor={`rating-${rating}`}
                          className="flex items-center gap-1 cursor-pointer"
                        >
                          <Star className="h-4 w-4 fill-primary text-primary" />
                          <span>{rating}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {form.formState.errors.satisfaction && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.satisfaction.message}
                    </p>
                  )}
                </div>

                {/* 추천 활동 */}
                <div className="space-y-2">
                  <Label htmlFor="recommendedActivities">추천 활동 (선택사항)</Label>
                  <Textarea
                    id="recommendedActivities"
                    placeholder="다음에 다시 방문한다면 추천하고 싶은 활동을 입력해주세요"
                    rows={3}
                    {...form.register('recommendedActivities')}
                  />
                </div>

                {/* 비추천 활동 */}
                <div className="space-y-2">
                  <Label htmlFor="notRecommendedActivities">비추천 활동 (선택사항)</Label>
                  <Textarea
                    id="notRecommendedActivities"
                    placeholder="개선이 필요한 활동을 입력해주세요"
                    rows={3}
                    {...form.register('notRecommendedActivities')}
                  />
                </div>

                {/* 개선사항 피드백 */}
                <div className="space-y-2">
                  <Label htmlFor="feedback">개선사항 피드백 (선택사항)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="서비스 개선을 위한 의견을 자유롭게 남겨주세요"
                    rows={4}
                    {...form.register('feedback')}
                  />
                </div>

                {/* 에러 메시지 */}
                {form.formState.errors.root && (
                  <div className="rounded-md bg-destructive/10 p-4">
                    <p className="text-sm text-destructive">
                      {form.formState.errors.root.message}
                    </p>
                  </div>
                )}

                {/* 제출 버튼 */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/bookings')}
                    disabled={isSubmitting}
                  >
                    나중에 하기
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        제출 중...
                      </>
                    ) : (
                      '체크아웃 완료'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
