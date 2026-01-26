/**
 * @file booking-new-page.tsx
 * @description 예약 생성 페이지 컴포넌트
 *
 * 사용자가 새로운 예약을 생성하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 체크인/체크아웃 날짜 선택
 * 2. 인원 수 입력
 * 3. 특이사항 입력
 * 4. 예약 생성 및 AI 스케줄 생성 트리거
 *
 * @dependencies
 * - @/features/booking: 예약 생성 Server Action
 * - @/features/schedule: AI 스케줄 생성 Server Action
 * - @/shared/ui: UI 컴포넌트 (Sidebar, Form, Calendar 등)
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarIcon, Loader2, Home, LayoutDashboard, User, Calendar, Map as MapIcon, Bell, BookOpen } from 'lucide-react';
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
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Calendar as CalendarComponent } from '@/shared/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { cn } from '@/shared/lib/utils';
import { createBooking } from '@/features/booking';
import { generateSchedule } from '@/features/schedule';

const bookingFormSchema = z.object({
  checkIn: z.date({
    required_error: '체크인 날짜를 선택해주세요.',
  }),
  checkOut: z.date({
    required_error: '체크아웃 날짜를 선택해주세요.',
  }),
  guestCount: z
    .number()
    .min(1, '인원 수는 최소 1명 이상이어야 합니다.')
    .max(20, '인원 수는 최대 20명까지 가능합니다.'),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

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

export function BookingNewPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      guestCount: 1,
      notes: '',
    },
  });

  const onSubmit = async (data: BookingFormValues) => {
    try {
      setIsSubmitting(true);

      // 예약 생성
      const bookingResult = await createBooking({
        checkIn: data.checkIn,
        checkOut: data.checkOut,
      });

      if (!bookingResult.ok) {
        form.setError('root', {
          message: bookingResult.error || '예약 생성에 실패했습니다.',
        });
        return;
      }

      // 예약 생성 성공 시 AI 스케줄 생성 페이지로 이동
      router.push(`/bookings/${bookingResult.data.id}/generating`);
    } catch (error) {
      console.error('Failed to create booking:', error);
      form.setError('root', {
        message: '예약 생성 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <h1 className="text-2xl md:text-3xl font-bold">새 예약 만들기</h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              체크인/체크아웃 날짜와 인원 정보를 입력해주세요
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>예약 정보</CardTitle>
              <CardDescription>
                캠핑 일정에 맞춰 예약을 생성하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* 체크인 날짜 */}
                  <div className="space-y-2">
                    <Label htmlFor="checkIn">체크인 날짜</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !form.watch('checkIn') && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('checkIn') ? (
                            format(form.watch('checkIn'), 'yyyy년 MM월 dd일', {
                              locale: ko,
                            })
                          ) : (
                            <span>날짜 선택</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={form.watch('checkIn')}
                          onSelect={(date) => {
                            form.setValue('checkIn', date!, {
                              shouldValidate: true,
                            });
                            // 체크아웃 날짜가 체크인보다 이전이면 초기화
                            if (
                              form.watch('checkOut') &&
                              date &&
                              form.watch('checkOut') <= date
                            ) {
                              form.setValue('checkOut', undefined as any);
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.checkIn && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.checkIn.message}
                      </p>
                    )}
                  </div>

                  {/* 체크아웃 날짜 */}
                  <div className="space-y-2">
                    <Label htmlFor="checkOut">체크아웃 날짜</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !form.watch('checkOut') && 'text-muted-foreground',
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.watch('checkOut') ? (
                            format(form.watch('checkOut'), 'yyyy년 MM월 dd일', {
                              locale: ko,
                            })
                          ) : (
                            <span>날짜 선택</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={form.watch('checkOut')}
                          onSelect={(date) => {
                            form.setValue('checkOut', date!, {
                              shouldValidate: true,
                            });
                          }}
                          disabled={(date) => {
                            const checkIn = form.watch('checkIn');
                            return (
                              !checkIn || date <= checkIn || date < new Date()
                            );
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    {form.formState.errors.checkOut && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.checkOut.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* 인원 수 */}
                <div className="space-y-2">
                  <Label htmlFor="guestCount">인원 수</Label>
                  <Input
                    id="guestCount"
                    type="number"
                    min={1}
                    max={20}
                    {...form.register('guestCount', {
                      valueAsNumber: true,
                    })}
                  />
                  {form.formState.errors.guestCount && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.guestCount.message}
                    </p>
                  )}
                </div>

                {/* 특이사항 */}
                <div className="space-y-2">
                  <Label htmlFor="notes">특이사항 (선택사항)</Label>
                  <Textarea
                    id="notes"
                    placeholder="알레르기, 특별 요청사항 등을 입력해주세요"
                    rows={4}
                    {...form.register('notes')}
                  />
                  {form.formState.errors.notes && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.notes.message}
                    </p>
                  )}
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
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        예약 생성 중...
                      </>
                    ) : (
                      '예약 생성하기'
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
