/**
 * @file onboarding-page.tsx
 * @description 온보딩 페이지 컴포넌트
 *
 * 사용자가 처음 접속할 때 선호도를 조사하는 페이지입니다.
 *
 * @dependencies
 * - @/features/onboarding: 설문 폼 컴포넌트
 * - @/shared/ui: Sidebar 컴포넌트
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Home,
  LayoutDashboard,
  User,
} from 'lucide-react';
import { SurveyForm } from '@/features/onboarding';
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

export function OnboardingPage() {
  const pathname = usePathname();

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
        <div className="container mx-auto max-w-2xl py-8 px-4">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">맞춤 질문</h1>
            <p className="text-muted-foreground">
              맞춤형 스케줄을 위해 몇 가지 질문에 답변해주세요.
            </p>
          </div>

          <div className="rounded-lg border bg-card p-6">
            <SurveyForm />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
