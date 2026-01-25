/**
 * @file schedule-dashboard-page.tsx
 * @description 스케줄 대시보드 페이지 컴포넌트
 *
 * 스케줄을 타임라인 뷰와 맵 뷰로 표시하는 대시보드입니다.
 *
 * 주요 기능:
 * 1. 타임라인 뷰와 맵 뷰 토글
 * 2. 스케줄 항목 클릭 시 맵에서 해당 노드 하이라이트
 * 3. 활성 스케줄 조회 및 표시
 *
 * @dependencies
 * - @/features/schedule: 스케줄 데이터 및 뷰
 * - @/features/map: 맵 컴포넌트
 * - @/features/node: 노드 데이터
 * - @/features/booking: 예약 데이터
 * - @/shared/ui: Sidebar 컴포넌트
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Calendar, Map as MapIcon, Loader2, Home, LayoutDashboard, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
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
import { TimelineView } from '@/features/schedule/ui';
import { CampsiteMap } from '@/features/map';
import { getActiveSchedule } from '@/features/schedule';
import { getNodes } from '@/features/node';
import { getUserBookings } from '@/features/booking';
import type { Schedule, ScheduleItem } from '@/features/schedule/api/actions';
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
];

export function ScheduleDashboardPage() {
  const pathname = usePathname();
  const [activeSchedule, setActiveSchedule] = useState<Schedule | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  const [selectedNodeId, setSelectedNodeId] = useState<string | undefined>();

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);

        // 예약 목록 조회
        const bookingsResult = await getUserBookings();
        if (!bookingsResult.ok || bookingsResult.data.length === 0) {
          setIsLoading(false);
          return;
        }

        // 가장 최근 예약의 활성 스케줄 조회
        const latestBooking = bookingsResult.data[0]!;
        const scheduleResult = await getActiveSchedule(latestBooking.id);
        if (scheduleResult.ok && scheduleResult.data) {
          setActiveSchedule(scheduleResult.data);
        }

        // 모든 노드 조회
        const nodesResult = await getNodes();
        if (nodesResult.ok) {
          setNodes(nodesResult.data);
        }
      } catch (error) {
        console.error('Failed to load schedule data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // 타임라인 항목 클릭 핸들러
  const handleTimelineItemClick = (item: ScheduleItem) => {
    setSelectedItemId(item.id);
    setSelectedNodeId(item.nodeId);
  };

  const loadingContent = (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );

  const emptyContent = (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">활성 스케줄이 없습니다</h3>
          <p className="text-sm text-muted-foreground">
            예약을 생성하고 AI 스케줄을 생성해보세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const mainContent = activeSchedule ? (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">스케줄 대시보드</h1>
        <p className="mt-1 md:mt-2 text-sm md:text-base text-muted-foreground">
          일정을 타임라인과 맵으로 확인하세요
        </p>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="timeline" className="gap-1 md:gap-2 flex-1 md:flex-initial">
            <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-sm md:text-base">타임라인</span>
          </TabsTrigger>
          <TabsTrigger value="map" className="gap-1 md:gap-2 flex-1 md:flex-initial">
            <MapIcon className="h-3.5 w-3.5 md:h-4 md:w-4" />
            <span className="text-sm md:text-base">맵</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>일정 타임라인</CardTitle>
            </CardHeader>
            <CardContent>
              <TimelineView
                schedule={activeSchedule}
                onItemClick={handleTimelineItemClick}
                selectedItemId={selectedItemId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>캠핑장 맵</CardTitle>
            </CardHeader>
            <CardContent>
              <CampsiteMap
                nodes={nodes}
                scheduleItems={activeSchedule.items}
                selectedNodeId={selectedNodeId}
                onNodeClick={(node) => {
                  // 맵에서 노드 클릭 시 해당 스케줄 항목 찾기
                  const item = activeSchedule.items.find(
                    (i) => i.nodeId === node.id,
                  );
                  if (item) {
                    setSelectedItemId(item.id);
                  }
                  setSelectedNodeId(node.id);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  ) : emptyContent;

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
          {isLoading ? loadingContent : mainContent}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
