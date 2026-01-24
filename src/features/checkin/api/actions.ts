/**
 * @file actions.ts
 * @description QR 체크인 관련 Server Actions
 *
 * 이 파일은 QR 코드 생성 및 체크인 처리 기능을 제공하는 Server Actions를 포함합니다.
 *
 * 주요 기능:
 * 1. QR 코드 생성 (예약 정보 기반)
 * 2. QR 코드 데이터 검증 및 체크인 처리
 *
 * 핵심 구현 로직:
 * - qrcode 라이브러리를 사용한 QR 코드 이미지 생성 (Base64)
 * - QR 데이터: { bookingId, userId, timestamp }
 * - 관리자용 QR 스캔 시 데이터 검증 후 체크인 처리
 *
 * @dependencies
 * - qrcode: QR 코드 생성 라이브러리
 * - @clerk/nextjs/server: Clerk 인증
 * - drizzle-orm: 데이터베이스 ORM
 * - @/shared/lib/auth-server: 인증 유틸리티
 * - @/shared/api/db: 데이터베이스 연결
 * - @/entities/booking: 예약 스키마
 * - @/features/booking/api/actions: 체크인 처리
 */

'use server';

import QRCode from 'qrcode';
import { eq, and } from 'drizzle-orm';
import { db } from '@/shared/api/db';
import { bookings } from '@/entities/booking';
import { users } from '@/entities/user';
import { requireAuth, getSession } from '@/shared/lib/auth-server';
import { checkInBooking } from '@/features/booking/api/actions';
import type { ActionResult } from '@/features/user/api/actions';

/**
 * QR 코드 데이터 타입
 */
export type QRCodeData = {
  bookingId: string;
  userId: string;
  timestamp: number;
};

/**
 * QR 코드 생성 결과 타입
 */
export type QRCodeResult = {
  dataUrl: string; // Base64 이미지 데이터 URL
  qrData: QRCodeData; // QR 코드에 인코딩된 데이터
};

/**
 * 예약 ID로 QR 코드를 생성합니다.
 *
 * @param bookingId 예약 ID
 * @returns QR 코드 이미지 (Base64) 및 데이터
 */
export async function generateQRCode(
  bookingId: string,
): Promise<ActionResult<QRCodeResult>> {
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
      return {
        ok: false,
        error: '예약을 찾을 수 없습니다.',
      };
    }

    // QR 코드 데이터 생성
    const qrData: QRCodeData = {
      bookingId: booking.id,
      userId: booking.userId,
      timestamp: Date.now(),
    };

    // QR 코드 이미지 생성 (Base64)
    const dataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 300,
    });

    return {
      ok: true,
      data: {
        dataUrl,
        qrData,
      },
    };
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'QR 코드 생성에 실패했습니다.',
    };
  }
}

/**
 * QR 코드 데이터를 검증하고 체크인을 처리합니다.
 * 관리자용 함수입니다.
 *
 * @param qrDataString QR 코드에서 스캔된 JSON 문자열
 * @returns 체크인 처리 결과
 */
export async function verifyAndCheckIn(
  qrDataString: string,
): Promise<ActionResult<{ bookingId: string; status: string }>> {
  try {
    // 관리자 권한 확인 (추후 구현 가능)
    // const session = await requireAuth();
    // if (!isAdmin(session.user.id)) {
    //   return { ok: false, error: '관리자 권한이 필요합니다.' };
    // }

    // QR 데이터 파싱
    let qrData: QRCodeData;
    try {
      qrData = JSON.parse(qrDataString);
    } catch {
      return {
        ok: false,
        error: '유효하지 않은 QR 코드입니다.',
      };
    }

    // 데이터 검증
    if (!qrData.bookingId || !qrData.userId || !qrData.timestamp) {
      return {
        ok: false,
        error: 'QR 코드 데이터가 불완전합니다.',
      };
    }

    // 타임스탬프 검증 (24시간 이내)
    const now = Date.now();
    const qrAge = now - qrData.timestamp;
    const MAX_QR_AGE = 24 * 60 * 60 * 1000; // 24시간

    if (qrAge > MAX_QR_AGE) {
      return {
        ok: false,
        error: 'QR 코드가 만료되었습니다. 새로 생성해주세요.',
      };
    }

    // 예약 조회
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, qrData.bookingId))
      .limit(1);

    if (!booking) {
      return {
        ok: false,
        error: '예약을 찾을 수 없습니다.',
      };
    }

    // 사용자 ID 검증
    if (booking.userId !== qrData.userId) {
      return {
        ok: false,
        error: '예약 정보가 일치하지 않습니다.',
      };
    }

    // 체크인 처리
    const checkInResult = await checkInBooking(qrData.bookingId);

    if (!checkInResult.ok) {
      return checkInResult;
    }

    return {
      ok: true,
      data: {
        bookingId: qrData.bookingId,
        status: checkInResult.data?.status || 'CHECKED_IN',
      },
    };
  } catch (error) {
    console.error('Failed to verify and check in:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '체크인 처리에 실패했습니다.',
    };
  }
}
