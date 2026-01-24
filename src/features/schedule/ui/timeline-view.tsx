/**
 * @file timeline-view.tsx
 * @description 스케줄 타임라인 뷰 컴포넌트
 *
 * 시계열 형태의 일정표를 표시하는 컴포넌트입니다.
 *
 * 주요 기능:
 * 1. 스케줄 항목을 시간순으로 표시
 * 2. 각 항목 클릭 시 맵에서 해당 노드 하이라이트
 * 3. 시간대별 시각화
 *
 * @dependencies
 * - @/features/schedule: 스케줄 데이터
 * - @/shared/ui: ShadCN UI 컴포넌트
 */

'use client';

import { Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import type { Schedule, ScheduleItem } from '@/features/schedule/api/actions';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/shared/lib/utils';

export interface TimelineViewProps {
  schedule: Schedule | null;
  onItemClick?: (item: ScheduleItem) => void;
  selectedItemId?: string;
}

/**
 * 노드 타입별 색상
 */
const NODE_TYPE_COLORS: Record<string, string> = {
  SITE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  WC: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  STORE: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  ACTIVITY: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

/**
 * 스케줄 타임라인 뷰 컴포넌트
 */
export function TimelineView({
  schedule,
  onItemClick,
  selectedItemId,
}: TimelineViewProps) {
  if (!schedule || schedule.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-sm text-muted-foreground">
          스케줄이 없습니다. AI 스케줄을 생성해보세요.
        </p>
      </div>
    );
  }

  const sortedItems = [...schedule.items].sort(
    (a, b) => a.sequenceOrder - b.sequenceOrder,
  );

  return (
    <div className="space-y-4">
      {/* 총 피로도 점수 */}
      {schedule.totalFatigueScore !== null && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">총 피로도 점수</span>
              <span className="text-2xl font-bold">
                {schedule.totalFatigueScore.toFixed(1)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 타임라인 */}
      <div className="relative">
        {/* 타임라인 라인 */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

        {/* 타임라인 항목 */}
        <div className="space-y-6">
          {sortedItems.map((item, index) => {
            const startTime = new Date(item.startTime);
            const endTime = new Date(item.endTime);
            const isSelected = selectedItemId === item.id;

            return (
              <div
                key={item.id}
                className={cn(
                  'relative flex gap-4 cursor-pointer transition-all',
                  isSelected && 'scale-105',
                )}
                onClick={() => onItemClick?.(item)}
              >
                {/* 타임라인 점 */}
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-background bg-card">
                  <div
                    className={cn(
                      'h-3 w-3 rounded-full',
                      isSelected ? 'bg-primary' : 'bg-muted-foreground',
                    )}
                  />
                </div>

                {/* 컨텐츠 */}
                <Card
                  className={cn(
                    'flex-1 transition-all',
                    isSelected && 'ring-2 ring-primary',
                  )}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{item.activityName}</h3>
                          <Badge variant="outline" className="text-xs">
                            #{item.sequenceOrder}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {format(startTime, 'HH:mm')} -{' '}
                            {format(endTime, 'HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>노드 ID: {item.nodeId.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
