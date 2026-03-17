"use client"

import { Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  LayoutDashboard,
  User,
  Calendar,
  Map as MapIcon,
  Bell,
  BookOpen,
  Loader2,
  UtensilsCrossed,
} from "lucide-react"
import { CampsiteScene3D } from "@/features/map/ui/campsite-scene-3d"
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
} from "@/shared/ui/sidebar"

const navigationItems = [
  { title: "홈", url: "/", icon: Home },
  { title: "대시보드", url: "/dashboard", icon: LayoutDashboard },
  { title: "맞춤 질문", url: "/onboarding", icon: User },
  { title: "스케줄", url: "/schedule", icon: Calendar },
  { title: "예약", url: "/bookings", icon: BookOpen },
  { title: "캠핑장지도", url: "/map", icon: MapIcon },
  { title: "알림", url: "/notifications", icon: Bell },
]

const LEGEND = [
  { color: "#22c55e", label: "사용 가능" },
  { color: "#ef4444", label: "사용 중" },
  { color: "#f59e0b", label: "예약됨" },
  { color: "#3b82f6", label: "화장실" },
  { color: "#a855f7", label: "매점" },
  { color: "#06b6d4", label: "체험존" },
]

export function CampsiteMap3DPage() {
  const pathname = usePathname()

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
                  const Icon = item.icon
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                        <Link href={item.url}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
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
                  <SidebarMenuButton asChild isActive={pathname === "/notifications"} tooltip="알림">
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

      <SidebarInset className="flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <p className="font-semibold text-foreground text-sm">자연스런 캠핑장 3D 배치도</p>
            <p className="text-xs text-muted-foreground">자리를 클릭해 상세 정보를 확인하세요</p>
          </div>
        </div>

        {/* 3D Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <Suspense
            fallback={
              <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="text-sm">3D 맵 불러오는 중...</p>
              </div>
            }
          >
            <CampsiteScene3D />
          </Suspense>
        </div>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-border bg-background/95 backdrop-blur-sm shrink-0">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
            {LEGEND.map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
