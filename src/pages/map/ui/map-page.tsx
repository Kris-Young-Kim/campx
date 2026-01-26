/**
 * @file map-page.tsx
 * @description 맵 전용 페이지 컴포넌트
 *
 * 전체 화면 맵 레이아웃을 제공하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 전체 화면 맵 레이아웃
 * 2. GPS 위치 추적
 * 3. 경로 안내 오버레이
 * 4. 노드 상세 정보 모달
 *
 * @dependencies
 * - @/features/map: 맵 컴포넌트
 * - @/features/schedule: 스케줄 데이터
 * - @/features/node: 노드 데이터
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { ArrowLeft, MapPin } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { getBookingById } from '@/features/booking';
import { getActiveSchedule } from '@/features/schedule';
import { getNodes } from '@/features/node';
import { CampsiteMap } from '@/features/map';
import type { Schedule } from '@/features/schedule/api/actions';
import type { Node } from '@/features/node/api/actions';
import { Loader2 } from 'lucide-react';

export function MapPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const bookingId = params?.bookingId as string;
  const highlightNodeId = searchParams?.get('highlight');

  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (!bookingId) {
      router.push('/bookings');
      return;
    }

    async function loadData() {
      try {
        setIsLoading(true);

        // 예약 확인
        const bookingResult = await getBookingById(bookingId);
        if (!bookingResult.ok || !bookingResult.data) {
          router.push('/bookings');
          return;
        }

        // 활성 스케줄 조회
        const scheduleResult = await getActiveSchedule(bookingId);
        if (scheduleResult.ok && scheduleResult.data) {
          setSchedule(scheduleResult.data);
        }

        // 모든 노드 조회
        const nodesResult = await getNodes();
        if (nodesResult.ok) {
          setNodes(nodesResult.data);
        }

        // GPS 위치 추적
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

          // 위치 추적 지속
          const watchId = navigator.geolocation.watchPosition(
            (position) => {
              setCurrentLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            (error) => {
              console.warn('GPS 위치 추적 오류:', error);
            },
          );

          return () => {
            navigator.geolocation.clearWatch(watchId);
          };
        }
      } catch (error) {
        console.error('Failed to load map data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [bookingId, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* 뒤로가기 버튼 */}
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => router.back()}
          className="shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* GPS 위치 표시 */}
      {currentLocation && (
        <div className="absolute top-4 right-4 z-10">
          <Card className="shadow-lg">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">위치 추적 중</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 맵 */}
      <div className="h-full w-full">
        <CampsiteMap
          nodes={nodes}
          scheduleItems={schedule?.items}
          selectedNodeId={highlightNodeId ?? undefined}
        />
      </div>
    </div>
  );
}
