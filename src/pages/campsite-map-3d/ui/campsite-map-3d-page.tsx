"use client"

import { Suspense } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CampsiteScene3D } from "@/features/map/ui/campsite-scene-3d"

const LEGEND = [
  { color: "#22c55e", label: "사용 가능" },
  { color: "#ef4444", label: "사용 중" },
  { color: "#f59e0b", label: "예약됨" },
  { color: "#3b82f6", label: "화장실" },
  { color: "#a855f7", label: "매점" },
  { color: "#06b6d4", label: "체험존" },
]

export function CampsiteMap3DPage() {
  return (
    <div className="relative h-screen w-full flex flex-col bg-background overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm z-20 shrink-0">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <p className="font-semibold text-foreground text-sm">자연스런 캠핑장 3D 배치도</p>
          <p className="text-xs text-muted-foreground">자리를 클릭해 상세 정보를 확인하세요</p>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative">
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
      <div className="px-4 py-3 border-t border-border bg-background/95 backdrop-blur-sm z-20 shrink-0">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center">
          {LEGEND.map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-xs text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
