/**
 * @file actions.ts
 * @description 알림 관련 Server Actions
 *
 * 이 파일은 스케줄 기반 알림 발송 기능을 제공하는 Server Actions를 포함합니다.
 *
 * 주요 기능:
 * 1. 매너타임 시작 알림 (체크인 후 N시간)
 * 2. 체험 시간 임박 알림 (시작 30분 전)
 * 3. 알림 발송 스케줄링
 *
 * 핵심 구현 로직:
 * - 체크인된 예약 조회
 * - 활성 스케줄 조회
 * - 스케줄 항목의 시작 시간 기준 알림 발송
 *
 * TODO (Post-MVP):
 * - 카카오 알림톡 API 연동
 * - SMS 알림 연동
 * - 푸시 알림 연동
 *
 * @dependencies
 * - @/features/booking: 예약 데이터
 * - @/features/schedule: 스케줄 데이터
 * - @/entities/user: 사용자 데이터
 */

'use server';

import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '@/shared/api/db';
import { bookings } from '@/entities/booking';
import { schedules, scheduleItems } from '@/entities/schedule';
import { users } from '@/entities/user';
import type { ActionResult } from '@/features/user/api/actions';

/**
 * 알림 발송 결과 타입
 */
export type NotificationResult = {
  sent: number; // 발송된 알림 수
  failed: number; // 실패한 알림 수
  errors: string[]; // 오류 메시지 목록
};

/**
 * 매너타임 시작 알림 대상 조회
 * 체크인 후 지정된 시간(기본 22시)에 발송할 대상자를 조회합니다.
 *
 * @param mannerTimeHour 매너타임 시작 시간 (0-23, 기본값: 22)
 * @returns 알림 대상 예약 목록
 */
export async function getMannerTimeNotificationTargets(
  mannerTimeHour: number = 22,
): Promise<ActionResult<Array<{ bookingId: string; userId: string; checkIn: Date; userName?: string; userEmail?: string }>>> {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentHour = now.getHours();

    // 현재 시간이 매너타임 시간인 경우만 조회 (정확한 시간에만 발송)
    if (currentHour !== mannerTimeHour) {
      return {
        ok: true,
        data: [],
      };
    }

    // 체크인 완료된 예약 중 오늘 체크인한 예약 조회
    const checkedInBookings = await db
      .select({
        booking: bookings,
        user: users,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .where(
        and(
          eq(bookings.status, 'CHECKED_IN'),
          gte(bookings.checkIn, today),
          lte(bookings.checkIn, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
        ),
      );

    return {
      ok: true,
      data: checkedInBookings.map(({ booking, user }) => ({
        bookingId: booking.id,
        userId: booking.userId,
        checkIn: booking.checkIn,
        userName: user.name || undefined,
        userEmail: user.email || undefined,
      })),
    };
  } catch (error) {
    console.error('Failed to get manner time notification targets:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '매너타임 알림 대상 조회에 실패했습니다.',
    };
  }
}

/**
 * 체험 시간 임박 알림 대상 조회
 * 스케줄 항목의 시작 시간 30분 전에 발송할 대상자를 조회합니다.
 *
 * @param reminderMinutesBefore 알림 발송 시간 (분 단위, 기본값: 30)
 * @returns 알림 대상 스케줄 항목 목록
 */
export async function getActivityReminderTargets(
  reminderMinutesBefore: number = 30,
): Promise<ActionResult<Array<{ itemId: string; scheduleId: string; bookingId: string; userId: string; activityName: string; startTime: Date; userName?: string; userEmail?: string }>>> {
  try {
    const now = new Date();
    const reminderTime = new Date(now.getTime() + reminderMinutesBefore * 60 * 1000);

    // 활성 스케줄 조회
    const activeSchedules = await db
      .select()
      .from(schedules)
      .where(eq(schedules.isActive, true));

    const targets: Array<{ itemId: string; scheduleId: string; bookingId: string; userId: string; activityName: string; startTime: Date; userName?: string; userEmail?: string }> = [];

    for (const schedule of activeSchedules) {
      // 예약 및 사용자 정보 조회
      const [bookingData] = await db
        .select({
          booking: bookings,
          user: users,
        })
        .from(bookings)
        .innerJoin(users, eq(bookings.userId, users.id))
        .where(eq(bookings.id, schedule.bookingId))
        .limit(1);

      if (!bookingData || bookingData.booking.status !== 'CHECKED_IN') {
        continue; // 체크인되지 않은 예약은 스킵
      }

      const { booking, user } = bookingData;

      // 30분 후에 시작하는 스케줄 항목 조회 (5분 범위 내)
      const upcomingItems = await db
        .select()
        .from(scheduleItems)
        .where(
          and(
            eq(scheduleItems.scheduleId, schedule.id),
            gte(scheduleItems.startTime, reminderTime),
            lte(scheduleItems.startTime, new Date(reminderTime.getTime() + 5 * 60 * 1000)), // 5분 범위
          ),
        )
        .orderBy(scheduleItems.startTime);

      for (const item of upcomingItems) {
        targets.push({
          itemId: item.id,
          scheduleId: schedule.id,
          bookingId: booking.id,
          userId: booking.userId,
          activityName: item.activityName,
          startTime: item.startTime,
          userName: user.name || undefined,
          userEmail: user.email || undefined,
        });
      }
    }

    return {
      ok: true,
      data: targets,
    };
  } catch (error) {
    console.error('Failed to get activity reminder targets:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '체험 알림 대상 조회에 실패했습니다.',
    };
  }
}
