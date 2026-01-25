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

import { eq, sql as drizzleSql } from 'drizzle-orm';
import { db, sql } from '@/shared/api/db';
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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:77',message:'getUserProfile entry',data:{hasDb:!!db,hasSql:!!sql,hasDatabaseUrl:!!process.env.DATABASE_URL},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    const session = await getSession();

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:80',message:'Session retrieved',data:{hasSession:!!session,userId:session?.user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

    if (!session) {
      return { ok: true, data: null };
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:88',message:'Before query execution',data:{clerkUserId:session.user.id,queryType:'select from users where clerk_user_id'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

    // Check if clerk_user_id column exists
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:92',message:'Checking column existence',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const columnCheck = await sql<{ exists: boolean }>`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users' 
          AND column_name = 'clerk_user_id'
        ) as exists
      `;
      const columnExists = columnCheck[0]?.exists ?? false;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:101',message:'Column existence check result',data:{columnExists,columnCheckResult:columnCheck[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (checkError) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:104',message:'Column check failed',data:{error:checkError instanceof Error?checkError.message:String(checkError),stack:checkError instanceof Error?checkError.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }

    const userProfile = await db
      .select()
      .from(users)
      .where(eq(users.clerkUserId, session.user.id))
      .limit(1);

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:110',message:'Query executed successfully',data:{resultCount:userProfile.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:118',message:'Query error caught',data:{errorMessage:error instanceof Error?error.message:String(error),errorName:error instanceof Error?error.name:typeof error,errorStack:error instanceof Error?error.stack:undefined,errorString:String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:153',message:'preferenceVector before conversion',data:{preferenceVector:input.preferenceVector,type:typeof input.preferenceVector,isArray:Array.isArray(input.preferenceVector)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // pgvector 타입으로 변환 - Drizzle customType의 toDriver가 자동으로 호출됨
      // 배열을 그대로 전달하면 customType의 toDriver가 JSON.stringify로 변환
      updateData.preferenceVector = input.preferenceVector as unknown as typeof users.$inferInsert.preferenceVector;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:158',message:'preferenceVector after conversion',data:{preferenceVector:updateData.preferenceVector,type:typeof updateData.preferenceVector},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    }
    // 컬럼 존재 여부 확인 (health_condition, has_pet, family_size)
    // 컬럼이 없으면 해당 필드를 업데이트하지 않음
    try {
      const columnCheck = await sql<{ exists: boolean }>`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users' 
          AND column_name = 'health_condition'
        ) as exists
      `;
      const hasHealthCondition = columnCheck[0]?.exists ?? false;

      if (hasHealthCondition) {
        if (input.healthCondition !== undefined) {
          updateData.healthCondition = input.healthCondition;
        }
        if (input.hasPet !== undefined) {
          updateData.hasPet = input.hasPet;
        }
        if (input.familySize !== undefined) {
          updateData.familySize = input.familySize;
        }
      }
      // 컬럼이 없으면 해당 필드들을 무시하고 계속 진행
    } catch (checkError) {
      // 컬럼 확인 실패 시 해당 필드들을 제외하고 계속 진행
      console.warn('Failed to check column existence, skipping health_condition, has_pet, family_size:', checkError);
    }
    if (input.bioDataJson !== undefined) {
      updateData.bioDataJson = input.bioDataJson as typeof users.$inferInsert.bioDataJson;
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:171',message:'Before DB update',data:{updateData:JSON.stringify(updateData),hasPreferenceVector:input.preferenceVector!==undefined,clerkUserId:session.user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // preference_vector가 있으면 별도로 처리 (Neon HTTP에서 customType이 제대로 작동하지 않을 수 있음)
    let updatedProfiles;
    if (input.preferenceVector !== undefined) {
      // preference_vector를 제외한 나머지 필드 업데이트
      const { preferenceVector: _, ...restUpdateData } = updateData;
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:185',message:'restUpdateData prepared',data:{restUpdateData:JSON.stringify(restUpdateData),keys:Object.keys(restUpdateData)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      if (Object.keys(restUpdateData).length > 0) {
        try {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:190',message:'Updating rest fields',data:{fieldCount:Object.keys(restUpdateData).length},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          await db
            .update(users)
            .set(restUpdateData)
            .where(eq(users.clerkUserId, session.user.id));
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:197',message:'Rest fields updated successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
        } catch (restError) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:200',message:'Rest fields update failed',data:{error:restError instanceof Error?restError.message:String(restError)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
          // #endregion
          throw restError;
        }
      }
      // preference_vector는 SQL로 직접 업데이트
      const vectorString = JSON.stringify(input.preferenceVector);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:206',message:'Updating preference_vector with SQL',data:{vectorString:vectorString},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      try {
        await sql`
          UPDATE users 
          SET preference_vector = ${vectorString}::vector(3) 
          WHERE clerk_user_id = ${session.user.id}
        `;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:212',message:'preference_vector updated successfully',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      } catch (vectorError) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:216',message:'preference_vector update failed',data:{error:vectorError instanceof Error?vectorError.message:String(vectorError)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        throw vectorError;
      }
      // 업데이트된 프로필 조회
      updatedProfiles = await db
        .select()
        .from(users)
        .where(eq(users.clerkUserId, session.user.id))
        .limit(1);
    } else {
      // preference_vector가 없으면 일반 업데이트
      updatedProfiles = await db
        .update(users)
        .set(updateData)
        .where(eq(users.clerkUserId, session.user.id))
        .returning();
    }
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:195',message:'After DB update',data:{updatedCount:updatedProfiles.length,hasError:false},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion

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
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/c7abc132-a08b-470e-b9be-70c6a8a0ef9e',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'actions.ts:207',message:'DB update error',data:{error:error instanceof Error?error.message:String(error),stack:error instanceof Error?error.stack:undefined},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
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
