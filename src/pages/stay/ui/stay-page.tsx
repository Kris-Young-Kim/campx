/**
 * @file stay-page.tsx
 * @description Stay 대시보드 페이지 컴포넌트
 *
 * 체크인 후 캠핑 중 사용하는 대시보드입니다.
 *
 * 주요 기능:
 * 1. 현재 시간 및 다음 활동 카드
 * 2. 맵 미리보기 (클릭 시 전체 맵으로 이동)
 * 3. 빠른 액션 버튼 (화장실 찾기, 개수대 찾기, 현재 스케줄 보기, 알림 확인)
 * 4. 알림 센터 (슬라이드 아웃)
 * 5. GPS 기반 현재 위치 표시
 * 6. 피로도 기반 Upselling UI
 * 7. activity_logs 기록 기능
 *
 * @dependencies
 * - @/features/booking: 예약 데이터
 * - @/features/schedule: 스케줄 데이터
 * - @/features/map: 맵 컴포넌트
 * - @/features/node: 노드 데이터
 * - @/shared/ui: UI 컴포넌트
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { format, isAfter, isBefore } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  Home,
  LayoutDashboard,
  User,
  Calendar,
  Map as MapIcon,
  Bell,
  BookOpen,
  Bath,
  Droplet,
  Clock,
  MapPin,
  Sparkles,
  Loader2,
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
import { getBookingById } from '@/features/booking';
import { getActiveSchedule } from '@/features/schedule';
import { getNodes, getNodesByType } from '@/features/node';
import { CampsiteMap } from '@/features/map';
import type { Booking } from '@/features/booking/api/actions';
import type { Schedule } from '@/features/schedule/api/actions';
import type { Node } from '@/features/node/api/actions';

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

export function StayPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const bookingId = params?.bookingId as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // 현재 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 데이터 로드
  useEffect(() => {
    if (!bookingId) {
      router.push('/bookings');
      return;
    }

    async function loadData() {
      try {
        setIsLoading(true);

        // 예약 조회
        const bookingResult = await getBookingById(bookingId);
        if (!bookingResult.ok || !bookingResult.data) {
          router.push('/bookings');
          return;
        }
        setBooking(bookingResult.data);

        // 활성 스케줄 조회
        const scheduleResult = await getActiveSchedule(bookingId);
        if (scheduleResult.ok && scheduleResult.data) {
          setSchedule(scheduleResult.data);
        }

        // 노드 조회 (맵 표시용)
        const nodesResult = await getNodes();
        if (nodesResult.ok) {
          setNodes(nodesResult.data);
        }

        // GPS 위치 추적 (선택사항)
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.warn('GPS 위치를 가져올 수 없습니다:', error);
            },
          );
        }
      } catch (error) {
        console.error('Failed to load stay data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [bookingId, router]);

  // 다음 활동 찾기
  const getNextActivity = () => {
    if (!schedule || !schedule.items.length) return null;

    const now = currentTime;
    const nextItem = schedule.items.find((item) => {
      const startTime = new Date(item.startTime);
      return isAfter(startTime, now);
    });

    return nextItem ?? null;
  };

  // 빠른 액션: 화장실 찾기
  const handleFindToilet = async () => {
    const toiletNodes = await getNodesByType('WC');
    if (toiletNodes.ok && toiletNodes.data.length > 0) {
      router.push(`/map/${bookingId}?highlight=${toiletNodes.data[0]!.id}`);
    }
  };

  // 빠른 액션: 개수대 찾기
  const handleFindStore = async () => {
    const storeNodes = await getNodesByType('STORE');
    if (storeNodes.ok && storeNodes.data.length > 0) {
      router.push(`/map/${bookingId}?highlight=${storeNodes.data[0]!.id}`);
    }
  };

  const nextActivity = getNextActivity();

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
        <div className="container mx-auto max-w-6xl space-y-4 md:space-y-6 p-4 md:p-6">
          {/* 헤더 */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Stay 대시보드</h1>
            <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
              {format(new Date(booking.checkIn), 'yyyy년 MM월 dd일', { locale: ko })} ~{' '}
              {format(new Date(booking.checkOut), 'yyyy년 MM월 dd일', { locale: ko })}
            </p>
          </div>

          {/* 현재 시간 및 다음 활동 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  현재 시간
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {format(currentTime, 'HH:mm:ss', { locale: ko })}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {format(currentTime, 'yyyy년 MM월 dd일 EEEE', { locale: ko })}
                </p>
              </CardContent>
            </Card>

            {nextActivity && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    다음 활동
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-lg font-semibold">
                      {nextActivity.activityName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(nextActivity.startTime), 'HH:mm', { locale: ko })} 시작
                    </div>
                    <Badge variant="outline">
                      {Math.round(
                        (new Date(nextActivity.startTime).getTime() - currentTime.getTime()) /
                          60000,
                      )}{' '}
                     분 후
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 맵 미리보기 */}
          {schedule && nodes.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>캠핑장 맵</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/map/${bookingId}`}>
                      전체 맵 보기
                      <MapIcon className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded-lg overflow-hidden">
                  <CampsiteMap
                    nodes={nodes}
                    scheduleItems={schedule.items}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 빠른 액션 버튼 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 액션</CardTitle>
              <CardDescription>자주 사용하는 기능에 빠르게 접근하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={handleFindToilet}
                >
                  <Bath className="h-6 w-6" />
                  <span>화장실 찾기</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  onClick={handleFindStore}
                >
                  <Droplet className="h-6 w-6" />
                  <span>개수대 찾기</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  asChild
                >
                  <Link href={`/schedule`}>
                    <Calendar className="h-6 w-6" />
                    <span>스케줄 보기</span>
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto flex-col gap-2 py-4"
                  asChild
                >
                  <Link href="/notifications">
                    <Bell className="h-6 w-6" />
                    <span>알림 확인</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* GPS 위치 표시 */}
          {currentLocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  현재 위치
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  위도: {currentLocation.lat.toFixed(6)}, 경도:{' '}
                  {currentLocation.lng.toFixed(6)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* 피로도 기반 Upselling UI (향후 구현) */}
          {schedule && schedule.totalFatigueScore && schedule.totalFatigueScore > 70 && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle>추가 서비스</CardTitle>
                <CardDescription>
                  피로도가 높으시네요. 편안한 캠핑을 위해 추가 서비스를 이용해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="default" className="w-full">
                  장작 배달 주문하기
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
