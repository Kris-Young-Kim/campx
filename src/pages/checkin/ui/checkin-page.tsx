/**
 * @file checkin-page.tsx
 * @description 체크인 페이지 컴포넌트
 *
 * 예약 정보를 확인하고 QR 코드를 표시하는 체크인 페이지입니다.
 *
 * 주요 기능:
 * 1. 예약 정보 조회 및 표시
 * 2. QR 코드 표시
 * 3. 체크인 상태 확인
 *
 * @dependencies
 * - @/features/checkin: QR 코드 생성 및 표시
 * - @/features/booking: 예약 데이터
 * - @/shared/ui: 공유 UI 컴포넌트
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeDisplay } from '@/features/checkin';
import { getBookingById, checkInBooking } from '@/features/booking';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { Loader2, Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Booking } from '@/features/booking';

interface CheckinPageProps {
  bookingId: string;
}

/**
 * 체크인 페이지 컴포넌트
 */
export function CheckinPage({ bookingId }: CheckinPageProps) {
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    async function loadBooking() {
      try {
        setIsLoading(true);
        const result = await getBookingById(bookingId);

        if (!result.ok) {
          toast.error(result.error || '예약 정보를 불러올 수 없습니다.');
          router.push('/dashboard');
          return;
        }

        if (!result.data) {
          toast.error('예약을 찾을 수 없습니다.');
          router.push('/dashboard');
          return;
        }

        setBooking(result.data);
      } catch (error) {
        console.error('Failed to load booking:', error);
        toast.error('예약 정보를 불러오는 중 오류가 발생했습니다.');
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    }

    loadBooking();
  }, [bookingId, router]);

  const handleCheckIn = async () => {
    if (!booking) return;

    setIsCheckingIn(true);
    try {
      const result = await checkInBooking(booking.id);

      if (!result.ok) {
        toast.error(result.error || '체크인에 실패했습니다.');
        return;
      }

      toast.success('체크인이 완료되었습니다!');
      setBooking(result.data);
    } catch (error) {
      console.error('Failed to check in:', error);
      toast.error('체크인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsCheckingIn(false);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    const variants: Record<Booking['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      PENDING: { variant: 'outline', label: '대기 중' },
      CONFIRMED: { variant: 'default', label: '확정' },
      CHECKED_IN: { variant: 'default', label: '체크인 완료' },
      CHECKED_OUT: { variant: 'secondary', label: '체크아웃 완료' },
      CANCELLED: { variant: 'destructive', label: '취소됨' },
    };

    const statusInfo = variants[status];
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">예약 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const canCheckIn = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  const isCheckedIn = booking.status === 'CHECKED_IN';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* 예약 정보 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>예약 정보</CardTitle>
              {getStatusBadge(booking.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">체크인</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.checkIn), 'yyyy년 MM월 dd일 HH:mm')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">체크아웃</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(booking.checkOut), 'yyyy년 MM월 dd일 HH:mm')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QR 코드 카드 */}
        {canCheckIn && (
          <QRCodeDisplay bookingId={booking.id} />
        )}

        {/* 체크인 완료 안내 */}
        {isCheckedIn && (
          <Card className="border-green-500 bg-green-50 dark:bg-green-950">
            <CardContent className="flex items-center gap-3 py-6">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">체크인 완료</p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  체크인이 완료되었습니다. 즐거운 캠핑 되세요!
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 체크인 버튼 */}
        {canCheckIn && (
          <Card>
            <CardHeader>
              <CardTitle>체크인</CardTitle>
              <CardDescription>
                관리자에게 QR 코드를 보여주거나, 아래 버튼을 눌러 직접 체크인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleCheckIn}
                disabled={isCheckingIn}
                className="w-full"
                size="lg"
              >
                {isCheckingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    체크인 처리 중...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    체크인하기
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* 안내 메시지 */}
        {booking.status === 'CANCELLED' && (
          <Card className="border-destructive">
            <CardContent className="flex items-center gap-3 py-6">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <div>
                <p className="font-medium text-destructive">취소된 예약</p>
                <p className="text-sm text-muted-foreground">
                  이 예약은 취소되었습니다.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
