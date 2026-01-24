/**
 * @file actions.ts
 * @description 사용자 프로필 관련 Server Actions
 *
 * 이 파일은 사용자 프로필의 저장, 조회 기능을 제공하는 Server Actions를 포함합니다.
 *
 * 주요 기능:
 * 1. 현재 인증된 사용자의 프로필 조회
 * 2. 사용자 프로필 업데이트
 * 3. Clerk 사용자와 DB 사용자 동기화 (생성 또는 업데이트)
 *
 * 핵심 구현 로직:
 * - Clerk 인증을 통한 사용자 인증 상태 확인
 * - Drizzle ORM을 사용한 데이터베이스 쿼리
 * - 에러 처리 및 타입 안전성 보장
 *
 * @dependencies
 * - @clerk/nextjs/server: Clerk 인증
 * - drizzle-orm: 데이터베이스 ORM
 * - @/shared/lib/auth-server: 인증 유틸리티
 * - @/shared/api/db: 데이터베이스 연결
 * - @/entities/user: 사용자 스키마
 */

'use server';

import { eq } from 'drizzle-orm';
import { db } from '@/shared/api/db';
import { users } from '@/entities/user';
import { getSession, requireAuth } from '@/shared/lib/auth-server';
import type { ClerkAuthUser } from '@/shared/lib/auth-server';

/**
 * Server Action 결과 타입
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * 사용자 프로필 타입
 */
export type UserProfile = {
  id: string;
  clerkUserId: string;
  email: string | null;
  name: string | null;
  image: string | null;
  preferenceVector: number[] | null;
  healthCondition: number | null;
  hasPet: boolean | null;
  familySize: number | null;
  bioDataJson: Record<string, unknown> | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

/**
 * 프로필 업데이트 입력 타입
 */
export type UpdateUserProfileInput = {
  name?: string;
  email?: string;
  image?: string;
  preferenceVector?: number[];
  healthCondition?: number;
  hasPet?: boolean;
  familySize?: number;
  bioDataJson?: Record<string, unknown>;
};

/**
 * 현재 인증된 사용자의 프로필을 조회합니다.
 *
 * @returns 사용자 프로필 또는 null (인증되지 않은 경우)
 */
export async function getUserProfile(): Promise<ActionResult<UserProfile | null>> {
  try {
    const session = await getSession();

    if (!session) {
      return { ok: true, data: null };
    }

    const userProfile = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, session.user.id))
      .limit(1);

    if (userProfile.length === 0) {
      return { ok: true, data: null };
    }

    const profile = userProfile[0];

    return {
      ok: true,
      data: {
        id: profile.id,
        clerkUserId: profile.clerkUserId ?? '',
        email: profile.email ?? null,
        name: profile.name ?? null,
        image: profile.image ?? null,
        preferenceVector: profile.preferenceVector
          ? (profile.preferenceVector as unknown as number[])
          : null,
        healthCondition: profile.healthCondition ?? null,
        hasPet: profile.hasPet ?? null,
        familySize: profile.familySize ?? null,
        bioDataJson: profile.bioDataJson
          ? (profile.bioDataJson as Record<string, unknown>)
          : null,
        createdAt: profile.createdAt ?? null,
        updatedAt: profile.updatedAt ?? null,
      },
    };
  } catch (error) {
    console.error('Failed to get user profile:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '프로필 조회에 실패했습니다.',
    };
  }
}

/**
 * 현재 인증된 사용자의 프로필을 업데이트합니다.
 *
 * @param input 업데이트할 프로필 데이터
 * @returns 업데이트된 사용자 프로필
 */
export async function updateUserProfile(
  input: UpdateUserProfileInput,
): Promise<ActionResult<UserProfile>> {
  try {
    const session = await requireAuth();

    // 업데이트할 데이터 준비
    const updateData: Partial<typeof users.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.email !== undefined) {
      updateData.email = input.email;
    }
    if (input.image !== undefined) {
      updateData.image = input.image;
    }
    if (input.preferenceVector !== undefined) {
      // pgvector 타입으로 변환 (Drizzle이 자동 처리하지만 명시적으로 처리)
      updateData.preferenceVector = input.preferenceVector as unknown as typeof users.$inferInsert.preferenceVector;
    }
    if (input.healthCondition !== undefined) {
      updateData.healthCondition = input.healthCondition;
    }
    if (input.hasPet !== undefined) {
      updateData.hasPet = input.hasPet;
    }
    if (input.familySize !== undefined) {
      updateData.familySize = input.familySize;
    }
    if (input.bioDataJson !== undefined) {
      updateData.bioDataJson = input.bioDataJson as typeof users.$inferInsert.bioDataJson;
    }

    // 사용자 프로필 업데이트
    const updatedProfiles = await db
      .update(users)
      .set(updateData)
      .where(eq(users.clerkUserId, session.user.id))
      .returning();

    if (updatedProfiles.length === 0) {
      return {
        ok: false,
        error: '프로필을 찾을 수 없습니다. 먼저 프로필을 생성해주세요.',
      };
    }

    const profile = updatedProfiles[0];

    return {
      ok: true,
      data: {
        id: profile.id,
        clerkUserId: profile.clerkUserId ?? '',
        email: profile.email ?? null,
        name: profile.name ?? null,
        image: profile.image ?? null,
        preferenceVector: profile.preferenceVector
          ? (profile.preferenceVector as unknown as number[])
          : null,
        healthCondition: profile.healthCondition ?? null,
        hasPet: profile.hasPet ?? null,
        familySize: profile.familySize ?? null,
        bioDataJson: profile.bioDataJson
          ? (profile.bioDataJson as Record<string, unknown>)
          : null,
        createdAt: profile.createdAt ?? null,
        updatedAt: profile.updatedAt ?? null,
      },
    };
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '프로필 업데이트에 실패했습니다.',
    };
  }
}

/**
 * Clerk 사용자 정보를 기반으로 DB 사용자 프로필을 생성하거나 업데이트합니다.
 * Clerk 인증 후 자동으로 호출되어 사용자 프로필을 동기화하는 데 사용됩니다.
 *
 * @param clerkUser Clerk 사용자 정보 (선택사항, 제공되지 않으면 현재 세션에서 가져옴)
 * @returns 생성 또는 업데이트된 사용자 프로필
 */
export async function createOrUpdateUserProfile(
  clerkUser?: ClerkAuthUser,
): Promise<ActionResult<UserProfile>> {
  try {
    const session = clerkUser
      ? { user: clerkUser }
      : await requireAuth();

    // 기존 프로필 확인
    const existingProfile = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, session.user.id))
      .limit(1);

    let result;

    if (existingProfile.length > 0) {
      // 기존 프로필 업데이트
      const updated = await db
        .update(users)
        .set({
          email: session.user.email || '',
          name: session.user.name ?? undefined,
          image: session.user.image ?? undefined,
          updatedAt: new Date(),
        })
        .where(eq(users.clerkUserId, session.user.id))
        .returning();

      result = updated[0];
    } else {
      // 새 프로필 생성 (id는 명시적으로 생성)
      const created = await db
        .insert(users)
        .values({
          id: crypto.randomUUID(),
          clerkUserId: session.user.id,
          email: session.user.email || '',
          name: session.user.name ?? undefined,
          image: session.user.image ?? undefined,
          updatedAt: new Date(),
        })
        .returning();

      result = created[0];
    }

    return {
      ok: true,
      data: {
        id: result.id,
        clerkUserId: result.clerkUserId ?? '',
        email: result.email ?? null,
        name: result.name ?? null,
        image: result.image ?? null,
        preferenceVector: result.preferenceVector
          ? (result.preferenceVector as unknown as number[])
          : null,
        healthCondition: result.healthCondition ?? null,
        hasPet: result.hasPet ?? null,
        familySize: result.familySize ?? null,
        bioDataJson: result.bioDataJson
          ? (result.bioDataJson as Record<string, unknown>)
          : null,
        createdAt: result.createdAt ?? null,
        updatedAt: result.updatedAt ?? null,
      },
    };
  } catch (error) {
    console.error('Failed to create or update user profile:', error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : '프로필 생성/업데이트에 실패했습니다.',
    };
  }
}
