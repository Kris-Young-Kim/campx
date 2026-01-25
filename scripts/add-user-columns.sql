-- ============================================
-- users 테이블에 필요한 컬럼 추가 SQL
-- ============================================
-- Neon SQL Editor에 붙여넣어 실행하세요
-- ============================================

-- 1. pgvector 확장 활성화 (없으면)
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. 필요한 타입들 생성 (없으면)
DO $$ BEGIN
    CREATE TYPE "public"."booking_status" AS ENUM('PENDING', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "public"."node_type" AS ENUM('SITE', 'WC', 'STORE', 'ACTIVITY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. users 테이블에 컬럼 추가 (없으면)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "clerk_user_id" text;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "preference_vector" vector(3);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "health_condition" integer DEFAULT 5;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "has_pet" boolean DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "family_size" integer DEFAULT 1;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bio_data_json" jsonb;

-- 4. clerk_user_id에 unique 제약조건 추가 (없으면)
DO $$ BEGIN
    ALTER TABLE "users" ADD CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id");
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 완료
SELECT 'users 테이블 컬럼 추가 완료!' AS message;
