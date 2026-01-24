/**
 * @file qr-code-display.tsx
 * @description QR 코드 표시 컴포넌트
 *
 * 이 컴포넌트는 예약 정보를 기반으로 생성된 QR 코드를 표시합니다.
 *
 * 주요 기능:
 * 1. QR 코드 이미지 표시
 * 2. 로딩 상태 처리
 * 3. 에러 상태 처리
 * 4. 다운로드 기능 (선택사항)
 *
 * @dependencies
 * - react: React 라이브러리
 * - @/features/checkin/api/actions: QR 코드 생성
 * - @/shared/ui: 공유 UI 컴포넌트
 */

'use client';

import { useEffect, useState } from 'react';
import { generateQRCode } from '../api/actions';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Loader2, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface QRCodeDisplayProps {
  bookingId: string;
  onRefresh?: () => void;
}

/**
 * QR 코드 표시 컴포넌트
 */
export function QRCodeDisplay({ bookingId, onRefresh }: QRCodeDisplayProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadQRCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generateQRCode(bookingId);

      if (!result.ok) {
        setError(result.error || 'QR 코드를 생성할 수 없습니다.');
        return;
      }

      setQrDataUrl(result.data?.dataUrl || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'QR 코드 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQRCode();
  }, [bookingId]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `checkin-qr-${bookingId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('QR 코드가 다운로드되었습니다.');
  };

  const handleRefresh = () => {
    loadQRCode();
    onRefresh?.();
    toast.info('QR 코드를 새로고침했습니다.');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">QR 코드 생성 중...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!qrDataUrl) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">QR 코드를 불러올 수 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>체크인 QR 코드</CardTitle>
        <CardDescription>
          관리자에게 이 QR 코드를 보여주세요
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="p-4 bg-white rounded-lg border-2 border-border">
          <img
            src={qrDataUrl}
            alt="Check-in QR Code"
            className="w-64 h-64"
          />
        </div>
        <div className="flex gap-2 w-full">
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            다운로드
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          QR 코드는 24시간 동안 유효합니다
        </p>
      </CardContent>
    </Card>
  );
}
