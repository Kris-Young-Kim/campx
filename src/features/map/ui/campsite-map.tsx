/**
 * @file campsite-map.tsx
 * @description 2.5D 인터랙티브 캠핑장 맵 컴포넌트
 *
 * 이 컴포넌트는 캠핑장의 항공샷 이미지를 배경으로 하고,
 * 그 위에 노드 위치를 핀으로 표시하고 스케줄 경로를 렌더링합니다.
 *
 * 주요 기능:
 * 1. 항공샷 배경 이미지 표시
 * 2. 노드 위치 핀 표시 (타입별 색상 구분)
 * 3. 스케줄 경로 렌더링 (동선 표시)
 * 4. 핀 클릭 시 노드 상세 모달 표시
 * 5. 줌/팬 인터랙션 (모바일 터치 지원)
 *
 * 구현 방식:
 * - SVG 기반 (가볍고 빠른 렌더링)
 * - 배경 이미지 위에 SVG 레이어 오버레이
 * - 반응형 디자인 (모바일 최적화)
 *
 * @dependencies
 * - @/features/node: 노드 데이터
 * - @/features/schedule: 스케줄 데이터
 * - @/features/map/ui/node-detail-modal: 노드 상세 모달
 * - @/shared/ui: ShadCN UI 컴포넌트
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';
import type { Node } from '@/features/node/api/actions';
import type { ScheduleItem } from '@/features/schedule/api/actions';
import { NodeDetailModal } from './node-detail-modal';
import { cn } from '@/shared/lib/utils';

export interface CampsiteMapProps {
  /**
   * 맵 배경 이미지 경로
   * @default "/maps/campsite-aerial.jpg"
   */
  backgroundImage?: string;
  /**
   * 표시할 노드 목록
   */
  nodes: Node[];
  /**
   * 스케줄 항목 목록 (경로 표시용)
   */
  scheduleItems?: ScheduleItem[];
  /**
   * 현재 선택된 노드 ID (하이라이트용)
   */
  selectedNodeId?: string;
  /**
   * 맵 너비 (픽셀)
   * @default 800
   */
  mapWidth?: number;
  /**
   * 맵 높이 (픽셀)
   * @default 600
   */
  mapHeight?: number;
  /**
   * 노드 클릭 핸들러
   */
  onNodeClick?: (node: Node) => void;
}

/**
 * 노드 타입별 색상 매핑
 */
const NODE_TYPE_COLORS: Record<Node['type'], string> = {
  SITE: '#3b82f6', // blue
  WC: '#10b981', // green
  STORE: '#f59e0b', // amber
  ACTIVITY: '#ef4444', // red
};

/**
 * 노드 타입별 아이콘 크기
 */
const NODE_ICON_SIZE = 24;

/**
 * 2.5D 인터랙티브 캠핑장 맵 컴포넌트
 */
export function CampsiteMap({
  backgroundImage = '/maps/campsite-aerial.jpg',
  nodes,
  scheduleItems = [],
  selectedNodeId,
  mapWidth = 800,
  mapHeight = 600,
  onNodeClick,
}: CampsiteMapProps) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [lastTouchDistance, setLastTouchDistance] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 노드 클릭 핸들러
  const handleNodeClick = useCallback(
    (node: Node) => {
      setSelectedNode(node);
      setIsModalOpen(true);
      onNodeClick?.(node);
    },
    [onNodeClick],
  );

  // 마우스 드래그 시작
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - pan.x,
      y: e.clientY - pan.y,
    });
  }, [pan]);

  // 마우스 드래그 중
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setPan({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart],
  );

  // 마우스 드래그 종료
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 휠 줌
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setScale((prev) => Math.max(0.5, Math.min(3, prev * delta)));
    },
    [],
  );

  // 터치 시작
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      // 단일 터치: 팬
      setIsDragging(true);
      setTouchStart({
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y,
      });
    } else if (e.touches.length === 2) {
      // 두 손가락: 핀치 줌
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY,
      );
      setLastTouchDistance(distance);
    }
  }, [pan]);

  // 터치 이동
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 1 && isDragging && touchStart) {
        // 단일 터치: 팬
        setPan({
          x: e.touches[0].clientX - touchStart.x,
          y: e.touches[0].clientY - touchStart.y,
        });
      } else if (e.touches.length === 2 && lastTouchDistance !== null) {
        // 두 손가락: 핀치 줌
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY,
        );
        const scaleDelta = distance / lastTouchDistance;
        setScale((prev) => Math.max(0.5, Math.min(3, prev * scaleDelta)));
        setLastTouchDistance(distance);
      }
    },
    [isDragging, touchStart, lastTouchDistance],
  );

  // 터치 종료
  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setTouchStart(null);
    setLastTouchDistance(null);
  }, []);

  // 좌표를 SVG 좌표계로 변환
  const transformCoordinates = useCallback(
    (node: Node) => {
      // 노드의 실제 좌표를 맵 이미지 좌표계로 변환
      // 실제 구현에서는 노드 좌표와 맵 이미지의 스케일을 매핑해야 함
      // 여기서는 간단히 posX, posY를 그대로 사용 (실제로는 변환 로직 필요)
      return {
        x: node.posX * (mapWidth / 100), // 예시: 100 단위 좌표계를 맵 너비로 변환
        y: node.posY * (mapHeight / 100), // 예시: 100 단위 좌표계를 맵 높이로 변환
      };
    },
    [mapWidth, mapHeight],
  );

  // 스케줄 경로 생성
  const pathPoints = scheduleItems
    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
    .map((item) => {
      const node = nodes.find((n) => n.id === item.nodeId);
      if (!node) return null;
      return transformCoordinates(node);
    })
    .filter((point): point is { x: number; y: number } => point !== null);

  return (
    <div className="relative w-full overflow-hidden rounded-lg border bg-muted">
      <div
        ref={containerRef}
        className="relative h-[400px] md:h-[600px] w-full cursor-move touch-none select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 배경 이미지 */}
        <div className="absolute inset-0">
          <Image
            src={backgroundImage}
            alt="캠핑장 항공샷"
            fill
            className="object-contain"
            priority
            unoptimized
            onError={(e) => {
              // 이미지 로드 실패 시 플레이스홀더 표시
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          {/* 플레이스홀더 (이미지가 없을 때) */}
          <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">맵 이미지를 준비 중입니다</p>
            </div>
          </div>
        </div>

        {/* SVG 오버레이 (핀 및 경로) */}
        <svg
          className="absolute inset-0 h-full w-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          {/* 스케줄 경로 */}
          {pathPoints.length > 1 && (
            <polyline
              points={pathPoints
                .map((p) => `${p.x},${p.y}`)
                .join(' ')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="5,5"
              opacity={0.6}
            />
          )}

          {/* 노드 핀 */}
          {nodes.map((node) => {
            const coords = transformCoordinates(node);
            const color = NODE_TYPE_COLORS[node.type];
            const isSelected = selectedNodeId === node.id;

            return (
              <g
                key={node.id}
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => handleNodeClick(node)}
              >
                {/* 핀 원 */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={isSelected ? 12 : 8}
                  fill={color}
                  stroke="white"
                  strokeWidth={isSelected ? 3 : 2}
                  opacity={0.9}
                />
                {/* 핀 아이콘 (간단한 점) */}
                <circle
                  cx={coords.x}
                  cy={coords.y}
                  r={3}
                  fill="white"
                />
                {/* 노드 이름 라벨 */}
                <text
                  x={coords.x}
                  y={coords.y - 15}
                  textAnchor="middle"
                  className="text-xs font-medium fill-foreground"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 줌 컨트롤 */}
        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 flex flex-col gap-1.5 md:gap-2 rounded-lg border bg-background/90 p-1.5 md:p-2 backdrop-blur-sm shadow-lg">
          <button
            type="button"
            onClick={() => setScale((prev) => Math.min(3, prev * 1.2))}
            className="rounded px-2 py-1.5 md:py-1 text-sm md:text-base hover:bg-accent active:bg-accent touch-manipulation"
            aria-label="확대"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setScale((prev) => Math.max(0.5, prev * 0.8))}
            className="rounded px-2 py-1.5 md:py-1 text-sm md:text-base hover:bg-accent active:bg-accent touch-manipulation"
            aria-label="축소"
          >
            −
          </button>
          <button
            type="button"
            onClick={() => {
              setScale(1);
              setPan({ x: 0, y: 0 });
            }}
            className="rounded px-2 py-1 text-xs hover:bg-accent active:bg-accent touch-manipulation"
            aria-label="리셋"
          >
            리셋
          </button>
        </div>
      </div>

      {/* 노드 상세 모달 */}
      {selectedNode && (
        <NodeDetailModal
          node={selectedNode}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        />
      )}
    </div>
  );
}
