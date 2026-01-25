'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/shared/ui/card';

export function SeedDummyDataButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    data?: any;
  } | null>(null);

  const handleSeed = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/dev/seed-dummy-data', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          data: data.data,
        });
      } else {
        setResult({
          success: false,
          message: data.error || '더미 데이터 생성에 실패했습니다.',
          data: data.details ? { details: data.details, stack: data.stack } : undefined,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSeed}
        disabled={isLoading}
        size="lg"
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            더미 데이터 생성 중...
          </>
        ) : (
          '더미 데이터 생성'
        )}
      </Button>

      {result && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 space-y-2">
                <p
                  className={
                    result.success
                      ? 'text-sm text-green-700 dark:text-green-300'
                      : 'text-sm text-red-700 dark:text-red-300'
                  }
                >
                  {result.message}
                </p>
                {result.success && result.data && !result.data.details && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-xs font-mono text-muted-foreground">
                      <div>User ID: {result.data.userId}</div>
                      <div>Booking ID: {result.data.bookingId}</div>
                      <div>Schedule ID: {result.data.scheduleId}</div>
                      <div>Schedule Items: {result.data.scheduleItemsCount}개</div>
                      <div>Nodes: {result.data.nodesCount}개</div>
                    </p>
                  </div>
                )}
                {!result.success && result.data?.details && (
                  <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 rounded-md border border-red-200 dark:border-red-800">
                    <p className="text-xs font-mono text-red-700 dark:text-red-300 break-all">
                      <div className="font-semibold mb-1">에러 상세:</div>
                      <div>{result.data.details}</div>
                      {result.data.stack && process.env.NODE_ENV === 'development' && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs">스택 트레이스 보기</summary>
                          <pre className="mt-2 text-xs whitespace-pre-wrap overflow-auto">
                            {result.data.stack}
                          </pre>
                        </details>
                      )}
                    </p>
                  </div>
                )}
                {result.success && (
                  <div className="mt-4">
                    <a
                      href="/schedule"
                      className="text-sm text-primary hover:underline"
                    >
                      → 스케줄 대시보드로 이동
                    </a>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
