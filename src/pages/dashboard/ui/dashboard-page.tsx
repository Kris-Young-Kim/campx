/**
 * @file dashboard-page.tsx
 * @description 종합 대시보드 페이지 컴포넌트
 *
 * 사용자의 예약 현황, 다음 예약, 활성 스케줄 미리보기, 빠른 액션 등을 제공하는 종합 대시보드입니다.
 *
 * 주요 기능:
 * 1. 예약 현황 카드 (다음 예약, 진행 중인 예약)
 * 2. 활성 스케줄 미리보기 (있는 경우)
 * 3. 빠른 액션 버튼
 * 4. 통계/요약 정보
 *
 * @dependencies
 * - @/features/booking: 예약 데이터
 * - @/features/schedule: 스케줄 데이터
 * - @/shared/ui: UI 컴포넌트
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { format, isAfter, isBefore, isToday, isTomorrow } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Home,
  LayoutDashboard,
  User,
  Calendar,
  Map as MapIcon,
  Bell,
  BookOpen,
  Plus,
  ArrowRight,
  Clock,
  MapPin,
  Sparkles,
  Loader2,
  CheckCircle2,
  CalendarDays,
  UtensilsCrossed,
} from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { getUserBookings } from '@/features/booking';
import { getActiveSchedule } from '@/features/schedule';
import type { Booking } from '@/features/booking/api/actions';
import type { Schedule } from '@/features/schedule/api/actions';

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
    title: '캠핑장지도',
    url: '/map',
    icon: MapIcon,
  },
  {
    title: '알림',
    url: '/notifications',
    icon: Bell,
  },
];

const statusConfig = {
  PENDING: { label: '대기 중', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400' },
  CONFIRMED: { label: '확정', color: 'bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  CHECKED_IN: { label: '체크인 완료', color: 'bg-green-500/10 text-green-700 dark:text-green-400' },
  CHECKED_OUT: { label: '체크아웃 완료', color: 'bg-gray-500/10 text-gray-700 dark:text-gray-400' },
  CANCELLED: { label: '취소됨', color: 'bg-red-500/10 text-red-700 dark:text-red-400' },
};

export function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // 예약 목록 조회
        const bookingsResult = await getUserBookings();
        if (bookingsResult.ok && bookingsResult.data) {
          setBookings(bookingsResult.data);

          // 가장 최근 예약의 활성 스케줄 조회
          const latestBooking = bookingsResult.data[0];
          if (latestBooking) {
            const scheduleResult = await getActiveSchedule(latestBooking.id);
            if (scheduleResult.ok && scheduleResult.data) {
              setActiveSchedule(scheduleResult.data);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // 다음 예약 찾기
  const getNextBooking = () => {
    const now = new Date();
    return bookings.find((booking) => {
      const checkIn = new Date(booking.checkIn);
      return isAfter(checkIn, now) || (isToday(checkIn) && booking.status !== 'CHECKED_OUT');
    });
  };

  // 진행 중인 예약 찾기
  const getActiveBooking = () => {
    const now = new Date();
    return bookings.find((booking) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return (
        (isAfter(now, checkIn) || isToday(checkIn)) &&
        (isBefore(now, checkOut) || isToday(checkOut)) &&
        booking.status === 'CHECKED_IN'
      );
    });
  };

  const nextBooking = getNextBooking();
  const activeBooking = getActiveBooking();
  const upcomingBookings = bookings.filter((booking) => {
    const checkIn = new Date(booking.checkIn);
    return isAfter(checkIn, new Date()) && booking.status !== 'CANCELLED';
  });

  if (isLoading) {
    return (
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-2 py-4">
              <SidebarTrigger />
              <h2 className="text-lg font-semibold">자연스런 캠핑장</h2>
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

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-4">
            <SidebarTrigger />
            <h2 className="text-lg font-semibold">자연스런 캠핑장</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>메뉴</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.slice(0, -1).map((item) => {
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
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/cooking'} tooltip="미식조리현황">
                    <Link href="/cooking">
                      <UtensilsCrossed />
                      <span>미식조리현황</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/notifications'} tooltip="알림">
                    <Link href="/notifications">
                      <Bell />
                      <span>알림</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="container mx-auto max-w-6xl space-y-4 md:space-y-6 p-4 md:p-6">
          {/* 헤더 */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">대시보드</h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
              예약 현황과 빠른 액션을 한눈에 확인하세요
            </p>
          </div>

          {/* 예약 현황 + 빠른 액션 */}
          <div className="grid gap-4 md:grid-cols-2">
              {/* 다음 예약 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    다음 예약
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {nextBooking ? (
                    <div className="space-y-3">
                      <div>
                        <div className="text-lg font-semibold">
                          {format(new Date(nextBooking.checkIn), 'yyyy년 MM월 dd일', { locale: ko })} ~{' '}
                          {format(new Date(nextBooking.checkOut), 'yyyy년 MM월 dd일', { locale: ko })}
                        </div>
                        <Badge className={statusConfig[nextBooking.status]?.color || ''}>
                          {statusConfig[nextBooking.status]?.label || nextBooking.status}
                        </Badge>
                      </div>
                      {isTomorrow(new Date(nextBooking.checkIn)) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>내일 체크인 예정</span>
                        </div>
                      )}
                      <Button asChild className="w-full">
                        <Link href={`/bookings/${nextBooking.id}`}>
                          예약 상세 보기
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                      <CalendarDays className="h-10 w-10 text-muted-foreground/40" />
                      <p className="text-sm text-muted-foreground">예정된 예약이 없습니다</p>
                      <Button asChild size="sm">
                        <Link href="/bookings/new">
                          <Plus className="mr-2 h-4 w-4" />
                          새 예약 만들기
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 빠른 액션 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    빠른 액션
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" className="h-auto flex-col gap-1 py-3">
                      <Link href="/bookings/new">
                        <Plus className="h-5 w-5" />
                        <span className="text-xs">새 예약</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-auto flex-col gap-1 py-3">
                      <Link href="/schedule">
                        <Calendar className="h-5 w-5" />
                        <span className="text-xs">스케줄</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-auto flex-col gap-1 py-3">
                      <Link href="/map">
                        <MapPin className="h-5 w-5" />
                        <span className="text-xs">캠핑장 지도</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="h-auto flex-col gap-1 py-3">
                      <Link href="/notifications">
                        <Bell className="h-5 w-5" />
                        <span className="text-xs">알림</span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

          {/* 활성 스케줄 미리보기 */}
          {activeSchedule && activeBooking ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      오늘의 스케줄
                    </CardTitle>
                    <CardDescription>
                      AI가 생성한 맞춤형 일정을 확인하세요
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/schedule">
                      전체 보기
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activeSchedule.items.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{item.activityName}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(item.startTime), 'HH:mm', { locale: ko })} -{' '}
                            {format(new Date(item.endTime), 'HH:mm', { locale: ko })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {activeSchedule.items.length > 3 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      외 {activeSchedule.items.length - 3}개의 일정이 더 있습니다
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* 예약 통계 */}
          {bookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>예약 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{bookings.length}</div>
                    <div className="text-sm text-muted-foreground">전체 예약</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {bookings.filter((b) => b.status === 'CHECKED_IN').length}
                    </div>
                    <div className="text-sm text-muted-foreground">진행 중</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{upcomingBookings.length}</div>
                    <div className="text-sm text-muted-foreground">예정된 예약</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {bookings.filter((b) => b.status === 'CHECKED_OUT').length}
                    </div>
                    <div className="text-sm text-muted-foreground">완료된 예약</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
