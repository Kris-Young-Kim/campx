/**
 * @file node-detail-modal.tsx
 * @description 노드 상세 정보 모달 컴포넌트
 *
 * 맵에서 노드를 클릭했을 때 표시되는 상세 정보 모달입니다.
 *
 * 주요 기능:
 * 1. 노드 정보 표시 (이름, 타입, 설명)
 * 2. 거리 계산 (현재 위치 기준, 향후 구현)
 * 3. 예상 소요 시간 표시 (향후 구현)
 *
 * @dependencies
 * - @/shared/ui/dialog: ShadCN Dialog 컴포넌트
 * - @/features/node: 노드 타입
 */

'use client';

import { MapPin, Clock, Navigation } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Badge } from '@/shared/ui/badge';
import type { Node } from '@/features/node/api/actions';

export interface NodeDetailModalProps {
  node: Node;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * 현재 위치 (거리 계산용, 향후 구현)
   */
  currentPosition?: { x: number; y: number };
}

/**
 * 노드 타입별 라벨
 */
const NODE_TYPE_LABELS: Record<Node['type'], string> = {
  SITE: '캠핑 사이트',
  WC: '화장실',
  STORE: '매점',
  ACTIVITY: '체험존',
};

/**
 * 노드 상세 정보 모달 컴포넌트
 */
export function NodeDetailModal({
  node,
  open,
  onOpenChange,
  currentPosition,
}: NodeDetailModalProps) {
  // 거리 계산 (향후 구현)
  const distance = currentPosition
    ? Math.sqrt(
        Math.pow(node.posX - currentPosition.x, 2) +
          Math.pow(node.posY - currentPosition.y, 2),
      )
    : null;

  // 예상 소요 시간 계산 (보행 속도 4km/h 기준)
  const estimatedTime = distance
    ? Math.round((distance / 1000 / 4) * 60) // 분 단위
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <DialogTitle>{node.name}</DialogTitle>
          </div>
          <DialogDescription>
            <Badge variant="outline" className="mt-2">
              {NODE_TYPE_LABELS[node.type]}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 설명 */}
          {node.description && (
            <div>
              <p className="text-sm text-muted-foreground">
                {node.description}
              </p>
            </div>
          )}

          {/* 위치 정보 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">좌표:</span>
              <span className="font-mono">
                ({node.posX.toFixed(1)}, {node.posY.toFixed(1)})
              </span>
            </div>
            {node.posZ !== 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">고도:</span>
                <span className="font-mono">{node.posZ.toFixed(1)}m</span>
              </div>
            )}
          </div>

          {/* 거리 및 예상 시간 */}
          {distance !== null && (
            <div className="space-y-2 rounded-lg border bg-muted/50 p-3">
              <div className="flex items-center gap-2 text-sm">
                <Navigation className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">거리:</span>
                <span className="font-medium">
                  {distance < 1000
                    ? `${Math.round(distance)}m`
                    : `${(distance / 1000).toFixed(1)}km`}
                </span>
              </div>
              {estimatedTime !== null && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">예상 소요 시간:</span>
                  <span className="font-medium">
                    약 {estimatedTime}분 (보행 기준)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
