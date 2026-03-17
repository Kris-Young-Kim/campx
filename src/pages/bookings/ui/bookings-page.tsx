/**
 * @file bookings-page.tsx
 * @description 예약 히스토리 페이지 컴포넌트
 *
 * 사용자의 과거 예약 목록을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 과거 예약 목록 UI
 * 2. 예약별 상세 정보 모달
 * 3. 각 예약별 스케줄 확인
 * 4. 재방문 시 이전 데이터 활용
 *
 * @dependencies
 * - @/features/booking: 예약 데이터
 * - @/features/schedule: 스케줄 데이터
 * - @/shared/ui: UI 컴포넌트
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Plus,
  Loader2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { getUserBookings } from '@/features/booking';
import { getSchedulesByBookingId } from '@/features/schedule';
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
  PENDING: { label: '대기 중', icon: Clock, variant: 'secondary' as const },
  CONFIRMED: { label: '확정', icon: CheckCircle, variant: 'default' as const },
  CHECKED_IN: { label: '체크인 완료', icon: CheckCircle, variant: 'default' as const },
  CHECKED_OUT: { label: '체크아웃 완료', icon: CheckCircle, variant: 'outline' as const },
  CANCELLED: { label: '취소됨', icon: XCircle, variant: 'destructive' as const },
};

export function BookingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedBookingSchedules, setSelectedBookingSchedules] = useState<Schedule[]>([]);

  useEffect(() => {
    async function loadBookings() {
      try {
        setIsLoading(true);
        const result = await getUserBookings();
        if (result.ok) {
          setBookings(result.data);
        }
      } catch (error) {
        console.error('Failed to load bookings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadBookings();
  }, []);

  const handleViewDetails = async (booking: Booking) => {
    setSelectedBooking(booking);
    const schedulesResult = await getSchedulesByBookingId(booking.id);
    if (schedulesResult.ok) {
      setSelectedBookingSchedules(schedulesResult.data);
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
        <div className="container mx-auto max-w-6xl space-y-6 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">예약 히스토리</h1>
              <p className="mt-2 text-sm md:text-base text-muted-foreground">
                과거 예약 내역을 확인하세요
              </p>
            </div>
            <Button asChild>
              <Link href="/bookings/new">
                <Plus className="mr-2 h-4 w-4" />
                새 예약 만들기
              </Link>
            </Button>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">예약 내역이 없습니다</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    새로운 예약을 만들어보세요
                  </p>
                  <Button asChild>
                    <Link href="/bookings/new">
                      <Plus className="mr-2 h-4 w-4" />
                      새 예약 만들기
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {bookings.map((booking) => {
                const statusInfo = statusConfig[booking.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {format(new Date(booking.checkIn), 'MM월 dd일', { locale: ko })} ~{' '}
                          {format(new Date(booking.checkOut), 'MM월 dd일', { locale: ko })}
                        </CardTitle>
                        <Badge variant={statusInfo.variant} className="flex items-center gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <CardDescription>
                        예약 ID: {booking.id.slice(0, 8)}...
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">체크인</span>
                          <span className="font-medium">
                            {format(new Date(booking.checkIn), 'yyyy-MM-dd', { locale: ko })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">체크아웃</span>
                          <span className="font-medium">
                            {format(new Date(booking.checkOut), 'yyyy-MM-dd', { locale: ko })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleViewDetails(booking)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              상세 보기
                            </Button>
                          </DialogTrigger>
                          {selectedBooking?.id === booking.id && (
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>예약 상세 정보</DialogTitle>
                                <DialogDescription>
                                  예약 ID: {selectedBooking.id}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div>
                                    <p className="text-sm text-muted-foreground">체크인</p>
                                    <p className="font-medium">
                                      {format(
                                        new Date(selectedBooking.checkIn),
                                        'yyyy년 MM월 dd일',
                                        { locale: ko },
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">체크아웃</p>
                                    <p className="font-medium">
                                      {format(
                                        new Date(selectedBooking.checkOut),
                                        'yyyy년 MM월 dd일',
                                        { locale: ko },
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">상태</p>
                                    <Badge variant={statusConfig[selectedBooking.status].variant}>
                                      {statusConfig[selectedBooking.status].label}
                                    </Badge>
                                  </div>
                                </div>

                                {selectedBookingSchedules.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium mb-2">스케줄</p>
                                    <div className="space-y-2">
                                      {selectedBookingSchedules.map((schedule) => (
                                        <Card key={schedule.id}>
                                          <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <p className="font-medium">
                                                  {schedule.items.length}개 활동
                                                </p>
                                                {schedule.totalFatigueScore && (
                                                  <p className="text-sm text-muted-foreground">
                                                    피로도 점수: {schedule.totalFatigueScore}
                                                  </p>
                                                )}
                                              </div>
                                              <Badge variant={schedule.isActive ? 'default' : 'outline'}>
                                                {schedule.isActive ? '활성' : '비활성'}
                                              </Badge>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  {selectedBooking.status === 'CHECKED_IN' && (
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      asChild
                                    >
                                      <Link href={`/stay/${selectedBooking.id}`}>
                                        Stay 대시보드
                                      </Link>
                                    </Button>
                                  )}
                                  {selectedBooking.status === 'CHECKED_IN' && (
                                    <Button
                                      variant="outline"
                                      className="flex-1"
                                      asChild
                                    >
                                      <Link href={`/checkout/${selectedBooking.id}`}>
                                        체크아웃
                                      </Link>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </DialogContent>
                          )}
                        </Dialog>
                        {booking.status === 'CHECKED_IN' && (
                          <Button
                            variant="default"
                            size="sm"
                            className="flex-1"
                            asChild
                          >
                            <Link href={`/stay/${booking.id}`}>Stay 보기</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
