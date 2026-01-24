/**
 * @file actions.ts
 * @description 스케줄 관련 Server Actions (기본 구조)
 *
 * 이 파일은 AI 스케줄 생성 기능의 기본 구조를 제공합니다.
 * 실제 AI 스케줄 생성 로직은 Phase 3에서 구현됩니다.
 *
 * 주요 기능:
 * 1. 스케줄 조회 (예약별, 사용자별)
 * 2. 스케줄 활성화/비활성화
 * 3. 스케줄 삭제
 *
 * TODO (Phase 3):
 * - AI 스케줄 생성 로직 구현
 * - 벡터 유사도 계산
 * - 피로도 페널티 계산
 * - 최적 경로 산출
 *
 * @dependencies
 * - drizzle-orm: 데이터베이스 ORM
 * - @/shared/lib/auth-server: 인증 유틸리티
 * - @/shared/api/db: 데이터베이스 연결
 * - @/entities/schedule: 스케줄 스키마
 * - @/entities/booking: 예약 스키마
 */

'use server';

import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/shared/api/db';
import { schedules, scheduleItems } from '@/entities/schedule';
import { bookings } from '@/entities/booking';
import { users } from '@/entities/user';
import { requireAuth, getSession } from '@/shared/lib/auth-server';
import type { ActionResult } from '@/features/user/api/actions';

/**
 * 스케줄 항목 타입
 */
export type ScheduleItem = {
  id: string;
  scheduleId: string;
  nodeId: string;
  sequenceOrder: number;
  startTime: Date;
  endTime: Date;
  activityName: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * 스케줄 타입 (항목 포함)
 */
export type Schedule = {
  id: string;
  bookingId: string;
  totalFatigueScore: number | null;
  isActive: boolean;
  items: ScheduleItem[];
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * 예약 ID로 스케줄을 조회합니다.
 *
 * @param bookingId 예약 ID
 * @returns 스케줄 목록
 */
export async function getSchedulesByBookingId(
  bookingId: string,
): Promise<ActionResult<Schedule[]>> {
  try {
    const session = await getSession();

    if (!session) {
      return { ok: true, data: [] };
    }

    // 사용자 프로필 확인
    const userProfile = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, session.user.id))
      .limit(1);

    if (userProfile.length === 0) {
      return { ok: true, data: [] };
    }

    // 예약 소유권 확인
    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.userId, userProfile[0].id),
        ),
      )
      .limit(1);

    if (!booking) {
      return { ok: true, data: [] };
    }

    // 스케줄 조회
    const scheduleList = await db
      .select()
      .from(schedules)
      .where(eq(schedules.bookingId, bookingId))
      .orderBy(desc(schedules.createdAt));

    // 각 스케줄의 항목 조회
    const schedulesWithItems = await Promise.all(
      scheduleList.map(async (schedule) => {
        const items = await db
          .select()
          .from(scheduleItems)
          .where(eq(scheduleItems.scheduleId, schedule.id))
          .orderBy(scheduleItems.sequenceOrder);

        return {
          id: schedule.id,
          bookingId: schedule.bookingId,
          totalFatigueScore: schedule.totalFatigueScore,
          isActive: schedule.isActive,
          items: items.map((item) => ({
            id: item.id,
            scheduleId: item.scheduleId,
            nodeId: item.nodeId,
            sequenceOrder: item.sequenceOrder,
            startTime: item.startTime,
            endTime: item.endTime,
            activityName: item.activityName,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          })),
          createdAt: schedule.createdAt,
          updatedAt: schedule.updatedAt,
        };
      }),
    );

    return {
      ok: true,
      data: schedulesWithItems,
    };
  } catch (error) {
    console.error('Failed to get schedules:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '스케줄 조회에 실패했습니다.',
    };
  }
}

/**
 * 활성 스케줄을 조회합니다.
 *
 * @param bookingId 예약 ID
 * @returns 활성 스케줄
 */
export async function getActiveSchedule(
  bookingId: string,
): Promise<ActionResult<Schedule | null>> {
  try {
    const result = await getSchedulesByBookingId(bookingId);

    if (!result.ok) {
      return result;
    }

    const activeSchedule = result.data.find((schedule) => schedule.isActive);

    return {
      ok: true,
      data: activeSchedule ?? null,
    };
  } catch (error) {
    console.error('Failed to get active schedule:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '스케줄 조회에 실패했습니다.',
    };
  }
}

/**
 * 스케줄을 활성화/비활성화합니다.
 *
 * @param scheduleId 스케줄 ID
 * @param isActive 활성화 여부
 * @returns 업데이트된 스케줄
 */
export async function toggleScheduleActive(
  scheduleId: string,
  isActive: boolean,
): Promise<ActionResult<Schedule>> {
  try {
    const session = await requireAuth();

    // 사용자 프로필 확인
    const userProfile = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, session.user.id))
      .limit(1);

    if (userProfile.length === 0) {
      return {
        ok: false,
        error: '사용자 프로필을 찾을 수 없습니다.',
      };
    }

    // 스케줄 소유권 확인
    const [schedule] = await db
      .select({
        schedule: schedules,
        booking: bookings,
      })
      .from(schedules)
      .innerJoin(bookings, eq(schedules.bookingId, bookings.id))
      .where(
        and(
          eq(schedules.id, scheduleId),
          eq(bookings.userId, userProfile[0].id),
        ),
      )
      .limit(1);

    if (!schedule) {
      return {
        ok: false,
        error: '스케줄을 찾을 수 없습니다.',
      };
    }

    // 스케줄 상태 업데이트
    const [updated] = await db
      .update(schedules)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(schedules.id, scheduleId))
      .returning();

    // 스케줄 항목 조회
    const items = await db
      .select()
      .from(scheduleItems)
      .where(eq(scheduleItems.scheduleId, scheduleId))
      .orderBy(scheduleItems.sequenceOrder);

    return {
      ok: true,
      data: {
        id: updated.id,
        bookingId: updated.bookingId,
        totalFatigueScore: updated.totalFatigueScore,
        isActive: updated.isActive,
        items: items.map((item) => ({
          id: item.id,
          scheduleId: item.scheduleId,
          nodeId: item.nodeId,
          sequenceOrder: item.sequenceOrder,
          startTime: item.startTime,
          endTime: item.endTime,
          activityName: item.activityName,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  } catch (error) {
    console.error('Failed to toggle schedule active:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '스케줄 업데이트에 실패했습니다.',
    };
  }
}

/**
 * TODO (Phase 3): AI 스케줄 생성 함수
 * 
 * @param bookingId 예약 ID
 * @param userInput 사용자 입력 (선호 활동, 제약 조건 등)
 * @returns 생성된 스케줄
 */
// export async function generateSchedule(
//   bookingId: string,
//   userInput: GenerateScheduleInput,
// ): Promise<ActionResult<Schedule>> {
//   // Phase 3에서 구현 예정
//   // 1. 사용자 벡터 조회/생성
//   // 2. pgvector로 유사 노드 추출
//   // 3. 피로도 페널티 계산
//   // 4. 최적 경로 산출
//   // 5. schedules, schedule_items 저장
// }
