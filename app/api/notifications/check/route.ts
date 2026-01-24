/**
 * @file route.ts
 * @description 알림 대상 조회 API 라우트
 *
 * 이 API는 주기적으로 실행되어 알림 대상을 조회합니다.
 * MVP 단계에서는 대상 조회만 수행하며, 실제 발송은 post-MVP에서 구현됩니다.
 *
 * 사용 예시:
 * - Vercel Cron: vercel.json에 cron 설정 추가
 * - GitHub Actions: .github/workflows/notifications.yml 생성
 * - 외부 스케줄러: 주기적으로 이 엔드포인트 호출
 *
 * TODO (Post-MVP):
 * - 카카오 알림톡 API 연동 후 실제 발송 로직 추가
 */

import { NextResponse } from 'next/server';
import {
  getMannerTimeNotificationTargets,
  getActivityReminderTargets,
} from '@/features/notification';

/**
 * 알림 대상 조회 API
 * GET /api/notifications/check
 */
export async function GET(request: Request) {
  try {
    // 인증 확인 (선택사항 - API 키 또는 헤더 기반)
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.NOTIFICATION_API_KEY;

    if (apiKey && authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // 알림 대상 조회
    const [mannerResult, activityResult] = await Promise.all([
      getMannerTimeNotificationTargets(22), // 매너타임 22시
      getActivityReminderTargets(30), // 체험 30분 전
    ]);

    const result = {
      mannerTime: {
        ok: mannerResult.ok,
        count: mannerResult.ok ? mannerResult.data?.length || 0 : 0,
        targets: mannerResult.ok ? mannerResult.data : [],
        error: mannerResult.ok ? undefined : mannerResult.error,
      },
      activityReminder: {
        ok: activityResult.ok,
        count: activityResult.ok ? activityResult.data?.length || 0 : 0,
        targets: activityResult.ok ? activityResult.data : [],
        error: activityResult.ok ? undefined : activityResult.error,
      },
    };

    // MVP 단계: 대상 조회만 수행 (실제 발송은 post-MVP에서)
    console.log('알림 대상 조회 결과:', {
      매너타임: result.mannerTime.count,
      체험알림: result.activityReminder.count,
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: '알림 대상 조회 완료 (MVP 단계: 발송은 post-MVP에서 구현 예정)',
    });
  } catch (error) {
    console.error('Notification check API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : '알림 대상 조회 중 오류가 발생했습니다.',
      },
      { status: 500 },
    );
  }
}
