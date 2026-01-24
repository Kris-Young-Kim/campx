/**
 * @file actions.ts
 * @description 예약 관련 Server Actions
 *
 * 이 파일은 예약 생성, 조회, QR 체크인 기능을 제공하는 Server Actions를 포함합니다.
 *
 * 주요 기능:
 * 1. 예약 생성
 * 2. 예약 조회 (사용자별, ID별)
 * 3. QR 체크인 (예약 상태 업데이트)
 *
 * 핵심 구현 로직:
 * - Clerk 인증을 통한 사용자 인증 상태 확인
 * - Drizzle ORM을 사용한 데이터베이스 쿼리
 * - 예약 상태 관리 (PENDING → CONFIRMED → CHECKED_IN → CHECKED_OUT)
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - drizzle-orm: 데이터베이스 ORM
 * - @/shared/lib/auth-server: 인증 유틸리티
 * - @/shared/api/db: 데이터베이스 연결
 * - @/entities/booking: 예약 스키마
 * - @/entities/user: 사용자 스키마
 */

'use server';

import { eq, and, desc } from 'drizzle-orm';
import { db } from '@/shared/api/db';
import { bookings } from '@/entities/booking';
import { users } from '@/entities/user';
import { requireAuth, getSession } from '@/shared/lib/auth-server';
import type { ActionResult } from '@/features/user/api/actions';

/**
 * 예약 생성 입력 타입
 */
export type CreateBookingInput = {
  checkIn: Date;
  checkOut: Date;
};

/**
 * 예약 타입
 */
export type Booking = {
  id: string;
  userId: string;
  checkIn: Date;
  checkOut: Date;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELLED';
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * 예약을 생성합니다.
 *
 * @param input 예약 정보 (체크인/체크아웃 날짜)
 * @returns 생성된 예약
 */
export async function createBooking(
  input: CreateBookingInput,
): Promise<ActionResult<Booking>> {
  try {
    const session = await requireAuth();

    // 사용자 프로필 확인 (DB에 사용자가 있어야 함)
    const userProfile = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, session.user.id))
      .limit(1);

    if (userProfile.length === 0) {
      return {
        ok: false,
        error: '사용자 프로필을 먼저 생성해주세요.',
      };
    }

    // 날짜 유효성 검사
    if (input.checkOut <= input.checkIn) {
      return {
        ok: false,
        error: '체크아웃 날짜는 체크인 날짜보다 이후여야 합니다.',
      };
    }

    // 예약 생성
    const [booking] = await db
      .insert(bookings)
      .values({
        id: crypto.randomUUID(),
        userId: userProfile[0].id,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        status: 'PENDING',
        updatedAt: new Date(),
      })
      .returning();

    return {
      ok: true,
      data: {
        id: booking.id,
        userId: booking.userId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status as Booking['status'],
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    };
  } catch (error) {
    console.error('Failed to create booking:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '예약 생성에 실패했습니다.',
    };
  }
}

/**
 * 현재 인증된 사용자의 예약 목록을 조회합니다.
 *
 * @returns 예약 목록 (최신순)
 */
export async function getUserBookings(): Promise<ActionResult<Booking[]>> {
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

    // 예약 목록 조회
    const bookingList = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userProfile[0].id))
      .orderBy(desc(bookings.createdAt));

    return {
      ok: true,
      data: bookingList.map((booking) => ({
        id: booking.id,
        userId: booking.userId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status as Booking['status'],
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      })),
    };
  } catch (error) {
    console.error('Failed to get user bookings:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '예약 조회에 실패했습니다.',
    };
  }
}

/**
 * 예약 ID로 예약을 조회합니다.
 *
 * @param bookingId 예약 ID
 * @returns 예약 정보
 */
export async function getBookingById(
  bookingId: string,
): Promise<ActionResult<Booking | null>> {
  try {
    const session = await getSession();

    if (!session) {
      return { ok: true, data: null };
    }

    // 사용자 프로필 확인
    const userProfile = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, session.user.id))
      .limit(1);

    if (userProfile.length === 0) {
      return { ok: true, data: null };
    }

    // 예약 조회 (본인 예약만)
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
      return { ok: true, data: null };
    }

    return {
      ok: true,
      data: {
        id: booking.id,
        userId: booking.userId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: booking.status as Booking['status'],
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
      },
    };
  } catch (error) {
    console.error('Failed to get booking:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '예약 조회에 실패했습니다.',
    };
  }
}

/**
 * QR 체크인을 수행합니다.
 * 예약 상태를 CHECKED_IN으로 업데이트합니다.
 *
 * @param bookingId 예약 ID
 * @returns 업데이트된 예약
 */
export async function checkInBooking(
  bookingId: string,
): Promise<ActionResult<Booking>> {
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

    // 예약 조회 및 상태 확인
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

    // 상태 검증 (PENDING 또는 CONFIRMED만 체크인 가능)
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      return {
        ok: false,
        error: `현재 상태(${booking.status})에서는 체크인할 수 없습니다.`,
      };
    }

    // 체크인 처리
    const [updated] = await db
      .update(bookings)
      .set({
        status: 'CHECKED_IN',
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    return {
      ok: true,
      data: {
        id: updated.id,
        userId: updated.userId,
        checkIn: updated.checkIn,
        checkOut: updated.checkOut,
        status: updated.status as Booking['status'],
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    };
  } catch (error) {
    console.error('Failed to check in booking:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '체크인에 실패했습니다.',
    };
  }
}
