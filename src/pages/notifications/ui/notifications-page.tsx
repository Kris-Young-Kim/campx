/**
 * @file notifications-page.tsx
 * @description 알림 센터 페이지 컴포넌트
 *
 * 사용자에게 발송된 알림 목록을 표시하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 알림 목록 UI
 * 2. 알림 타입별 필터 (매너타임, 체험 시간 임박 등)
 * 3. 알림 설정 페이지 (향후 구현)
 *
 * @dependencies
 * - @/shared/ui: UI 컴포넌트
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  BellRing,
  Clock,
  Settings,
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
import { Badge } from '@/shared/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';

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

// 임시 알림 데이터 (향후 실제 알림 시스템과 연동)
const mockNotifications = [
  {
    id: '1',
    type: 'MANNER_TIME' as const,
    title: '매너타임 시작 안내',
    message: '오늘 밤 10시부터 매너타임입니다. 조용히 보내주세요.',
    timestamp: new Date(),
    read: false,
  },
  {
    id: '2',
    type: 'ACTIVITY_REMINDER' as const,
    title: '체험 시간 임박',
    message: '나무 조각 체험이 30분 후에 시작됩니다.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
  },
  {
    id: '3',
    type: 'ACTIVITY_REMINDER' as const,
    title: '체험 시간 임박',
    message: '별 관측 체험이 30분 후에 시작됩니다.',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
  },
];

export function NotificationsPage() {
  const pathname = usePathname();
  const [notifications] = useState(mockNotifications);
  const [filter, setFilter] = useState<'ALL' | 'MANNER_TIME' | 'ACTIVITY_REMINDER'>('ALL');

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'ALL') return true;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

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
                          {item.url === '/notifications' && unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-auto">
                              {unreadCount}
                            </Badge>
                          )}
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
        <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">알림 센터</h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              중요한 알림을 확인하세요
            </p>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all" onClick={() => setFilter('ALL')}>
                전체
              </TabsTrigger>
              <TabsTrigger value="manner" onClick={() => setFilter('MANNER_TIME')}>
                매너타임
              </TabsTrigger>
              <TabsTrigger value="activity" onClick={() => setFilter('ACTIVITY_REMINDER')}>
                체험 알림
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <NotificationList notifications={filteredNotifications} />
            </TabsContent>
            <TabsContent value="manner" className="space-y-4">
              <NotificationList notifications={filteredNotifications} />
            </TabsContent>
            <TabsContent value="activity" className="space-y-4">
              <NotificationList notifications={filteredNotifications} />
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function NotificationList({
  notifications,
}: {
  notifications: typeof mockNotifications;
}) {
  if (notifications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">알림이 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              새로운 알림이 도착하면 여기에 표시됩니다
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notif) => (
        <Card
          key={notif.id}
          className={notif.read ? 'opacity-60' : 'border-primary/50'}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {notif.type === 'MANNER_TIME' ? (
                  <BellRing className="h-5 w-5 text-primary" />
                ) : (
                  <Clock className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{notif.title}</h3>
                  {!notif.read && (
                    <Badge variant="default" className="text-xs">
                      새 알림
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                <p className="text-xs text-muted-foreground">
                  {format(notif.timestamp, 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
