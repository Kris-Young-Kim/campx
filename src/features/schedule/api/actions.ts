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
import type { Node } from '@/features/node/api/actions';

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
 * 스케줄 생성 입력 타입
 */
export type GenerateScheduleInput = {
  startNodeId?: string; // 시작 노드 ID (기본값: 사용자의 캠핑 사이트)
  maxNodes?: number; // 최대 노드 개수 (기본값: 10)
};

/**
 * AI 스케줄을 생성합니다.
 * 
 * @param bookingId 예약 ID
 * @param input 스케줄 생성 옵션
 * @returns 생성된 스케줄
 */
export async function generateSchedule(
  bookingId: string,
  input: GenerateScheduleInput = {},
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

    // 예약 확인
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
      return {
        ok: false,
        error: '예약을 찾을 수 없습니다.',
      };
    }

    // 사용자 벡터 확인
    if (!userProfile[0].preferenceVector) {
      return {
        ok: false,
        error: '사용자 선호 벡터가 설정되지 않았습니다. 온보딩 설문을 먼저 완료해주세요.',
      };
    }

    // AI 스케줄러 로직 import
    const { findSimilarNodes, findOptimalPath } = await import(
      '@/shared/lib/ai-scheduler'
    );
    const { getNodeById } = await import('@/features/node/api/actions');

    // 시작 노드 확인 (기본값: SITE 타입 노드 중 첫 번째)
    let startNode: Node;
    if (input.startNodeId) {
      const nodeResult = await getNodeById(input.startNodeId);
      if (!nodeResult.ok || !nodeResult.data) {
        return {
          ok: false,
          error: '시작 노드를 찾을 수 없습니다.',
        };
      }
      startNode = nodeResult.data;
    } else {
      // SITE 타입 노드 중 첫 번째를 시작 노드로 사용
      const { getNodesByType } = await import('@/features/node/api/actions');
      const siteNodesResult = await getNodesByType('SITE');
      if (!siteNodesResult.ok || siteNodesResult.data.length === 0) {
        return {
          ok: false,
          error: '캠핑 사이트를 찾을 수 없습니다.',
        };
      }
      startNode = siteNodesResult.data[0]!;
    }

    // 1. 사용자 벡터로 유사 노드 추출
    const userVector = userProfile[0].preferenceVector as unknown as number[];
    const similarNodes = await findSimilarNodes(userVector, 30);

    // 2. 최적 경로 산출
    const optimalPath = findOptimalPath(
      similarNodes,
      startNode,
      userProfile[0].healthCondition ?? 5,
      input.maxNodes ?? 10,
    );

    if (optimalPath.nodes.length === 0) {
      return {
        ok: false,
        error: '스케줄을 생성할 수 있는 노드가 없습니다.',
      };
    }

    // 3. 시간 배분 (체크인부터 체크아웃까지)
    const checkInTime = new Date(booking.checkIn);
    const checkOutTime = new Date(booking.checkOut);
    const totalDuration = checkOutTime.getTime() - checkInTime.getTime();
    const timePerNode = totalDuration / optimalPath.nodes.length;

    // 4. 스케줄 생성
    const scheduleId = crypto.randomUUID();
    const [schedule] = await db
      .insert(schedules)
      .values({
        id: scheduleId,
        bookingId: booking.id,
        totalFatigueScore: optimalPath.totalFatigueScore,
        isActive: true,
        updatedAt: new Date(),
      })
      .returning();

    // 5. 스케줄 항목 생성
    const scheduleItemsData = optimalPath.nodes.map((pathNode, index) => {
      const startTime = new Date(checkInTime.getTime() + timePerNode * index);
      const endTime = new Date(
        checkInTime.getTime() + timePerNode * (index + 1),
      );

      // 활동명 생성 (노드 타입과 이름 기반)
      let activityName = pathNode.node.name;
      if (pathNode.node.type === 'ACTIVITY') {
        activityName = `${pathNode.node.name} 체험`;
      } else if (pathNode.node.type === 'WC') {
        activityName = '화장실 이용';
      } else if (pathNode.node.type === 'STORE') {
        activityName = `${pathNode.node.name} 방문`;
      }

      return {
        id: crypto.randomUUID(),
        scheduleId: schedule.id,
        nodeId: pathNode.node.id,
        sequenceOrder: index + 1,
        startTime,
        endTime,
        activityName,
        updatedAt: new Date(),
      };
    });

    await db.insert(scheduleItems).values(scheduleItemsData);

    // 6. 생성된 스케줄 조회 (항목 포함)
    const result = await getSchedulesByBookingId(bookingId);
    if (!result.ok) {
      return result;
    }

    const createdSchedule = result.data.find((s) => s.id === scheduleId);
    if (!createdSchedule) {
      return {
        ok: false,
        error: '스케줄 생성 후 조회에 실패했습니다.',
      };
    }

    return {
      ok: true,
      data: createdSchedule,
    };
  } catch (error) {
    console.error('Failed to generate schedule:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '스케줄 생성에 실패했습니다.',
    };
  }
}
