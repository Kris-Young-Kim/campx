/**
 * @file page.tsx
 * @description 오프라인 페이지
 *
 * 네트워크 연결이 없을 때 표시되는 오프라인 페이지입니다.
 */

'use client';

import { WifiOff } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle>오프라인 모드</CardTitle>
          <CardDescription>
            인터넷 연결을 확인할 수 없습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            네트워크 연결을 확인하고 페이지를 새로고침해주세요.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
            variant="default"
          >
            새로고침
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
