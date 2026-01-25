/**
 * @file route.ts
 * @description 개발용 더미 데이터 생성 API
 *
 * 인증된 사용자에 대해 다음 더미 데이터를 생성합니다:
 * 1. User 프로필 (없는 경우)
 * 2. Node들 (SITE, WC, STORE, ACTIVITY)
 * 3. Booking (예약)
 * 4. Schedule (스케줄)
 * 5. ScheduleItem들 (스케줄 항목)
 *
 * 개발 모드에서만 사용 가능합니다.
 */

import { NextResponse } from 'next/server';
import { db } from '@/shared/api/db';
import { getSession, requireAuth } from '@/shared/lib/auth-server';
import { users } from '@/entities/user';
import { nodes } from '@/entities/node';
import { bookings } from '@/entities/booking';
import { schedules, scheduleItems } from '@/entities/schedule';
import { eq } from 'drizzle-orm';

export async function POST() {
  // 개발 모드 체크
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: '이 엔드포인트는 개발 모드에서만 사용 가능합니다.' },
      { status: 403 },
    );
  }

  try {
    const session = await requireAuth();
    const clerkUserId = session.user.id;

    console.log('[Seed] 더미 데이터 생성 시작...', { clerkUserId });

    // 1. User 프로필 확인 및 생성
    let userProfile = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, clerkUserId))
      .limit(1);

    if (userProfile.length === 0) {
      try {
        const [newUser] = await db
          .insert(users)
          .values({
            id: crypto.randomUUID(),
            email: session.user.email || `user-${clerkUserId}@example.com`,
            name: session.user.name || '테스트 사용자',
            clerkUserId,
            preferenceVector: [0.7, 0.5, 0.3] as number[], // Nature, Activity, Rest
            healthCondition: 7,
            hasPet: false,
            familySize: 2,
          })
          .returning();
        userProfile = [newUser];
        console.log('[Seed] User 프로필 생성 완료:', newUser.id);
      } catch (userError) {
        console.error('[Seed] User 프로필 생성 실패:', userError);
        throw userError;
      }
    } else {
      console.log('[Seed] 기존 User 프로필 사용:', userProfile[0]!.id);
    }

    const userId = userProfile[0]!.id;

    // 2. Node들 생성 (이미 있으면 스킵)
    const existingNodes = await db.select().from(nodes).limit(1);
    if (existingNodes.length === 0) {
      const dummyNodes = [
        // SITE 타입
        {
          id: crypto.randomUUID(),
          name: 'A구역 캠핑 사이트',
          type: 'SITE' as const,
          posX: 100,
          posY: 100,
          posZ: 0,
          attrVector: [0.8, 0.2, 0.0] as number[],
          description: '조용하고 평탄한 캠핑 사이트',
        },
        {
          id: crypto.randomUUID(),
          name: 'B구역 캠핑 사이트',
          type: 'SITE' as const,
          posX: 200,
          posY: 150,
          posZ: 5,
          attrVector: [0.7, 0.3, 0.0] as number[],
          description: '전망이 좋은 캠핑 사이트',
        },
        // WC 타입
        {
          id: crypto.randomUUID(),
          name: '중앙 화장실',
          type: 'WC' as const,
          posX: 150,
          posY: 200,
          posZ: 0,
          attrVector: [0.1, 0.1, 0.8] as number[],
          description: '깨끗하고 넓은 화장실',
        },
        {
          id: crypto.randomUUID(),
          name: '동쪽 화장실',
          type: 'WC' as const,
          posX: 300,
          posY: 100,
          posZ: 0,
          attrVector: [0.1, 0.1, 0.8] as number[],
          description: '새로 지어진 화장실',
        },
        // STORE 타입
        {
          id: crypto.randomUUID(),
          name: '캠핑용품 매점',
          type: 'STORE' as const,
          posX: 180,
          posY: 180,
          posZ: 0,
          attrVector: [0.2, 0.3, 0.5] as number[],
          description: '캠핑 필수품 판매',
        },
        {
          id: crypto.randomUUID(),
          name: '편의점',
          type: 'STORE' as const,
          posX: 250,
          posY: 250,
          posZ: 0,
          attrVector: [0.2, 0.2, 0.6] as number[],
          description: '24시간 운영 편의점',
        },
        // ACTIVITY 타입
        {
          id: crypto.randomUUID(),
          name: '모닥불 체험',
          type: 'ACTIVITY' as const,
          posX: 120,
          posY: 120,
          posZ: 0,
          attrVector: [0.6, 0.8, 0.2] as number[],
          description: '안전한 모닥불 체험',
        },
        {
          id: crypto.randomUUID(),
          name: '자연 관찰',
          type: 'ACTIVITY' as const,
          posX: 220,
          posY: 220,
          posZ: 10,
          attrVector: [0.9, 0.5, 0.1] as number[],
          description: '야생 동식물 관찰',
        },
        {
          id: crypto.randomUUID(),
          name: '등산로',
          type: 'ACTIVITY' as const,
          posX: 280,
          posY: 300,
          posZ: 50,
          attrVector: [0.7, 0.9, 0.0] as number[],
          description: '가벼운 등산 코스',
        },
        {
          id: crypto.randomUUID(),
          name: '낚시터',
          type: 'ACTIVITY' as const,
          posX: 100,
          posY: 300,
          posZ: 0,
          attrVector: [0.8, 0.6, 0.2] as number[],
          description: '조용한 낚시 공간',
        },
      ];

      try {
        await db.insert(nodes).values(dummyNodes);
        console.log('[Seed] Node들 생성 완료:', dummyNodes.length, '개');
      } catch (nodeError) {
        console.error('[Seed] Node들 생성 실패:', nodeError);
        throw nodeError;
      }
    } else {
      console.log('[Seed] 기존 Node들 사용');
    }

    // 3. Booking 생성
    const checkIn = new Date();
    checkIn.setHours(14, 0, 0, 0); // 오늘 14:00
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 2); // 2박 3일
    checkOut.setHours(11, 0, 0, 0); // 체크아웃 11:00

    let booking;
    try {
      [booking] = await db
        .insert(bookings)
        .values({
          id: crypto.randomUUID(),
          userId,
          checkIn,
          checkOut,
          status: 'CONFIRMED',
        })
        .returning();

      console.log('[Seed] Booking 생성 완료:', booking.id);
    } catch (bookingError) {
      console.error('[Seed] Booking 생성 실패:', bookingError);
      throw bookingError;
    }

    // 4. Schedule 생성
    const scheduleId = crypto.randomUUID();
    let schedule;
    try {
      [schedule] = await db
        .insert(schedules)
        .values({
          id: scheduleId,
          bookingId: booking.id,
          totalFatigueScore: 45.5,
          isActive: true,
        })
        .returning();

      console.log('[Seed] Schedule 생성 완료:', schedule.id);
    } catch (scheduleError) {
      console.error('[Seed] Schedule 생성 실패:', scheduleError);
      throw scheduleError;
    }

    // 5. ScheduleItem들 생성
    const allNodes = await db.select().from(nodes);
    const siteNodes = allNodes.filter((n) => n.type === 'SITE');
    const otherNodes = allNodes.filter((n) => n.type !== 'SITE');

    if (siteNodes.length === 0 || otherNodes.length === 0) {
      return NextResponse.json(
        { error: '노드가 충분하지 않습니다.' },
        { status: 500 },
      );
    }

    // 스케줄 항목 생성 (체크인부터 체크아웃까지)
    const scheduleItemsData = [];
    const totalDuration = checkOut.getTime() - checkIn.getTime();
    const numItems = 8; // 8개 항목
    const timePerItem = totalDuration / numItems;

    // 시작 노드 (SITE)
    const startNode = siteNodes[0]!;
    const startTime1 = new Date(checkIn);
    const endTime1 = new Date(checkIn.getTime() + timePerItem);
    scheduleItemsData.push({
      id: crypto.randomUUID(),
      scheduleId: schedule.id,
      nodeId: startNode.id,
      sequenceOrder: 1,
      startTime: startTime1,
      endTime: endTime1,
      activityName: '캠핑 사이트 도착 및 텐트 설치',
      updatedAt: new Date(),
    });

    // 중간 노드들 (다양한 활동)
    const selectedNodes = [
      otherNodes[0], // WC
      otherNodes[1], // STORE
      otherNodes[2], // ACTIVITY
      otherNodes[3], // ACTIVITY
      otherNodes[4], // STORE
      otherNodes[5], // ACTIVITY
    ].filter(Boolean) as typeof otherNodes;

    selectedNodes.forEach((node, index) => {
      const startTime = new Date(checkIn.getTime() + timePerItem * (index + 1));
      const endTime = new Date(checkIn.getTime() + timePerItem * (index + 2));

      let activityName = node.name;
      if (node.type === 'WC') {
        activityName = '화장실 이용';
      } else if (node.type === 'STORE') {
        activityName = `${node.name} 방문`;
      } else if (node.type === 'ACTIVITY') {
        activityName = `${node.name} 체험`;
      }

      scheduleItemsData.push({
        id: crypto.randomUUID(),
        scheduleId: schedule.id,
        nodeId: node.id,
        sequenceOrder: index + 2,
        startTime,
        endTime,
        activityName,
        updatedAt: new Date(),
      });
    });

    // 마지막 노드 (SITE로 돌아가기)
    const endNode = siteNodes[siteNodes.length > 1 ? 1 : 0]!;
    const lastStartTime = new Date(
      checkIn.getTime() + timePerItem * (scheduleItemsData.length),
    );
    const lastEndTime = new Date(checkOut);
    scheduleItemsData.push({
      id: crypto.randomUUID(),
      scheduleId: schedule.id,
      nodeId: endNode.id,
      sequenceOrder: scheduleItemsData.length + 1,
      startTime: lastStartTime,
      endTime: lastEndTime,
      activityName: '캠핑 사이트 복귀 및 휴식',
      updatedAt: new Date(),
    });

    try {
      await db.insert(scheduleItems).values(scheduleItemsData);
      console.log('[Seed] ScheduleItem들 생성 완료:', scheduleItemsData.length, '개');
    } catch (itemError) {
      console.error('[Seed] ScheduleItem들 생성 실패:', itemError);
      throw itemError;
    }

    return NextResponse.json({
      success: true,
      message: '더미 데이터 생성 완료',
      data: {
        userId,
        bookingId: booking.id,
        scheduleId: schedule.id,
        scheduleItemsCount: scheduleItemsData.length,
        nodesCount: allNodes.length,
      },
    });
  } catch (error) {
    console.error('[Seed] 더미 데이터 생성 실패:', error);
    
    // 에러 스택 트레이스 포함
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    };
    
    console.error('[Seed] 에러 상세:', JSON.stringify(errorDetails, null, 2));
    
    return NextResponse.json(
      {
        error: '더미 데이터 생성에 실패했습니다.',
        details: errorDetails.message,
        ...(process.env.NODE_ENV === 'development' && {
          stack: errorDetails.stack,
        }),
      },
      { status: 500 },
    );
  }
}
