'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  BookOpen,
  Calendar,
  Home,
  LayoutDashboard,
  Map as MapIcon,
  User,
  UtensilsCrossed,
} from 'lucide-react';
import { CookingStatusCard } from '@/features/cooking';
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
  { title: '홈', url: '/', icon: Home },
  { title: '대시보드', url: '/dashboard', icon: LayoutDashboard },
  { title: '맞춤 질문', url: '/onboarding', icon: User },
  { title: '스케줄', url: '/schedule', icon: Calendar },
  { title: '예약', url: '/bookings', icon: BookOpen },
  { title: '캠핑장지도', url: '/map', icon: MapIcon },
  { title: '알림', url: '/notifications', icon: Bell },
];

export function CookingPage() {
  const pathname = usePathname();

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
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
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
        <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">미식조리현황</h1>
            <p className="mt-2 text-sm md:text-base text-muted-foreground">
              실시간 조리 현황을 확인하세요
            </p>
          </div>
          <CookingStatusCard show={true} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
