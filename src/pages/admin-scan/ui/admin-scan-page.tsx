/**
 * @file admin-scan-page.tsx
 * @description 관리자 QR 스캔 페이지 컴포넌트
 *
 * 관리자가 고객의 QR 코드를 스캔하여 체크인을 처리하는 페이지입니다.
 *
 * 주요 기능:
 * 1. 카메라를 통한 QR 코드 스캔
 * 2. 스캔된 QR 코드 데이터 검증
 * 3. 체크인 처리 및 결과 표시
 *
 * @dependencies
 * - html5-qrcode: QR 코드 스캔 라이브러리
 * - @/features/checkin: QR 코드 검증 및 체크인
 * - @/shared/ui: 공유 UI 컴포넌트
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyAndCheckIn } from '@/features/checkin';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Loader2, Camera, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

/**
 * 관리자 QR 스캔 페이지 컴포넌트
 */
export function AdminScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    bookingId?: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 컴포넌트 언마운트 시 스캐너 정리
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.error('Failed to clear scanner:', err);
        });
      }
    };
  }, []);

  const startScanning = () => {
    if (!scannerContainerRef.current) return;

    // 기존 스캐너가 있으면 정리
    if (scannerRef.current) {
      scannerRef.current.clear().catch((err) => {
        console.error('Failed to clear previous scanner:', err);
      });
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          qrbox: {
            width: 250,
            height: 250,
          },
          fps: 10,
          aspectRatio: 1.0,
          supportedScanTypes: [],
        },
        false, // verbose
      );

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          // QR 코드 스캔 성공
          setIsScanning(false);
          scanner.clear().catch((err) => {
            console.error('Failed to clear scanner after scan:', err);
          });

          // QR 코드 데이터 처리
          await handleQRCodeScan(decodedText);
        },
        (errorMessage) => {
          // 스캔 오류는 무시 (계속 스캔)
          // console.debug('QR scan error:', errorMessage);
        },
      );
    } catch (error) {
      console.error('Failed to start QR scanner:', error);
      toast.error('QR 스캐너를 시작할 수 없습니다. 카메라 권한을 확인해주세요.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch((err) => {
        console.error('Failed to stop scanner:', err);
      });
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const handleQRCodeScan = async (qrDataString: string) => {
    setIsProcessing(true);
    setScanResult(null);

    try {
      const result = await verifyAndCheckIn(qrDataString);

      if (!result.ok) {
        setScanResult({
          success: false,
          message: result.error || '체크인 처리에 실패했습니다.',
        });
        toast.error(result.error || '체크인 처리에 실패했습니다.');
        return;
      }

      setScanResult({
        success: true,
        message: '체크인이 완료되었습니다!',
        bookingId: result.data?.bookingId,
      });
      toast.success('체크인이 완료되었습니다!');
    } catch (error) {
      console.error('Failed to process QR code:', error);
      setScanResult({
        success: false,
        message: error instanceof Error ? error.message : '체크인 처리 중 오류가 발생했습니다.',
      });
      toast.error('체크인 처리 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    stopScanning();
    setScanResult(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="space-y-6">
        {/* 헤더 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              QR 코드 스캔
            </CardTitle>
            <CardDescription>
              고객의 QR 코드를 스캔하여 체크인을 처리하세요
            </CardDescription>
          </CardHeader>
        </Card>

        {/* 스캐너 영역 */}
        <Card>
          <CardContent className="pt-6">
            <div id="qr-reader" ref={scannerContainerRef} className="w-full" />
            {!isScanning && !scanResult && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Camera className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center">
                  QR 코드 스캔을 시작하려면 아래 버튼을 눌러주세요
                </p>
                <Button onClick={startScanning} size="lg">
                  <Camera className="mr-2 h-4 w-4" />
                  스캔 시작
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 처리 중 */}
        {isProcessing && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">체크인 처리 중...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 결과 표시 */}
        {scanResult && (
          <Alert
            variant={scanResult.success ? 'default' : 'destructive'}
            className={scanResult.success ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}
          >
            {scanResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {scanResult.success ? '체크인 완료' : '체크인 실패'}
            </AlertTitle>
            <AlertDescription>
              {scanResult.message}
              {scanResult.bookingId && (
                <p className="mt-2 text-xs text-muted-foreground">
                  예약 ID: {scanResult.bookingId}
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* 재시작 버튼 */}
        {scanResult && (
          <Button
            onClick={handleReset}
            variant="outline"
            className="w-full"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            다시 스캔하기
          </Button>
        )}

        {/* 안내 메시지 */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="font-medium">사용 안내:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>고객의 QR 코드를 카메라에 맞춰주세요</li>
                <li>QR 코드는 24시간 동안 유효합니다</li>
                <li>스캔이 완료되면 자동으로 체크인이 처리됩니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
