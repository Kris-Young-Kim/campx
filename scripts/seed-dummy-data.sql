-- ============================================
-- CampX 더미 데이터 생성 SQL
-- ============================================
-- Neon SQL Editor에 붙여넣어 실행하세요
-- YOUR_CLERK_USER_ID를 실제 Clerk 사용자 ID로 변경하세요
-- ============================================

-- 1. User 프로필 생성
INSERT INTO users (
    id,
    email,
    name,
    clerk_user_id,
    preference_vector,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    'test-user-YOUR_CLERK_USER_ID@example.com',
    '테스트 사용자',
    'YOUR_CLERK_USER_ID',
    '[0.7,0.5,0.3]'::vector,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE clerk_user_id = 'YOUR_CLERK_USER_ID'
);

-- 2. Node들 생성 (10개)
INSERT INTO nodes (
    id,
    name,
    type,
    pos_x,
    pos_y,
    pos_z,
    attr_vector,
    description,
    created_at,
    updated_at
)
SELECT * FROM (VALUES
    (gen_random_uuid(), 'A구역 캠핑 사이트', 'SITE', 100.0, 100.0, 0.0, '[0.8,0.2,0.0]'::vector, '조용하고 평탄한 캠핑 사이트', NOW(), NOW()),
    (gen_random_uuid(), 'B구역 캠핑 사이트', 'SITE', 200.0, 150.0, 5.0, '[0.7,0.3,0.0]'::vector, '전망이 좋은 캠핑 사이트', NOW(), NOW()),
    (gen_random_uuid(), '중앙 화장실', 'WC', 150.0, 200.0, 0.0, '[0.1,0.1,0.8]'::vector, '깨끗하고 넓은 화장실', NOW(), NOW()),
    (gen_random_uuid(), '동쪽 화장실', 'WC', 300.0, 100.0, 0.0, '[0.1,0.1,0.8]'::vector, '새로 지어진 화장실', NOW(), NOW()),
    (gen_random_uuid(), '캠핑용품 매점', 'STORE', 180.0, 180.0, 0.0, '[0.2,0.3,0.5]'::vector, '캠핑 필수품 판매', NOW(), NOW()),
    (gen_random_uuid(), '편의점', 'STORE', 250.0, 250.0, 0.0, '[0.2,0.2,0.6]'::vector, '24시간 운영 편의점', NOW(), NOW()),
    (gen_random_uuid(), '모닥불 체험', 'ACTIVITY', 120.0, 120.0, 0.0, '[0.6,0.8,0.2]'::vector, '안전한 모닥불 체험', NOW(), NOW()),
    (gen_random_uuid(), '자연 관찰', 'ACTIVITY', 220.0, 220.0, 10.0, '[0.9,0.5,0.1]'::vector, '야생 동식물 관찰', NOW(), NOW()),
    (gen_random_uuid(), '등산로', 'ACTIVITY', 280.0, 300.0, 50.0, '[0.7,0.9,0.0]'::vector, '가벼운 등산 코스', NOW(), NOW()),
    (gen_random_uuid(), '낚시터', 'ACTIVITY', 100.0, 300.0, 0.0, '[0.8,0.6,0.2]'::vector, '조용한 낚시 공간', NOW(), NOW())
) AS v(id, name, type, pos_x, pos_y, pos_z, attr_vector, description, created_at, updated_at)
WHERE NOT EXISTS (SELECT 1 FROM nodes LIMIT 1);

-- 3. Booking 생성
WITH user_data AS (
    SELECT id FROM users WHERE clerk_user_id = 'YOUR_CLERK_USER_ID' LIMIT 1
),
booking_data AS (
    SELECT 
        gen_random_uuid() AS booking_id,
        (DATE_TRUNC('day', NOW()) + INTERVAL '14 hours') AS check_in,
        (DATE_TRUNC('day', NOW()) + INTERVAL '2 days 21 hours') AS check_out
)
INSERT INTO bookings (
    id,
    user_id,
    check_in,
    check_out,
    status,
    created_at,
    updated_at
)
SELECT 
    b.booking_id,
    u.id,
    b.check_in,
    b.check_out,
    'CONFIRMED',
    NOW(),
    NOW()
FROM user_data u
CROSS JOIN booking_data b;

-- 4. Schedule 생성
WITH booking_data AS (
    SELECT id FROM bookings 
    WHERE user_id = (SELECT id FROM users WHERE clerk_user_id = 'YOUR_CLERK_USER_ID' LIMIT 1)
    ORDER BY created_at DESC 
    LIMIT 1
)
INSERT INTO schedules (
    id,
    booking_id,
    total_fatigue_score,
    is_active,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid(),
    b.id,
    45.5,
    true,
    NOW(),
    NOW()
FROM booking_data b;

-- 5. ScheduleItem들 생성 (8개)
WITH 
schedule_data AS (
    SELECT s.id AS schedule_id, b.check_in, b.check_out
    FROM schedules s
    INNER JOIN bookings b ON s.booking_id = b.id
    WHERE b.user_id = (SELECT id FROM users WHERE clerk_user_id = 'YOUR_CLERK_USER_ID' LIMIT 1)
    AND s.is_active = true
    ORDER BY s.created_at DESC
    LIMIT 1
),
site_nodes AS (
    SELECT id AS node_id FROM nodes WHERE type = 'SITE' ORDER BY created_at LIMIT 2
),
other_nodes AS (
    SELECT id AS node_id, type, name FROM nodes WHERE type != 'SITE' ORDER BY created_at LIMIT 6
),
time_data AS (
    SELECT 
        schedule_id,
        check_in,
        check_out,
        (check_out - check_in) / 8 AS time_per_item
    FROM schedule_data
),
items AS (
    -- 첫 번째 항목 (SITE)
    SELECT 
        gen_random_uuid() AS id,
        t.schedule_id,
        (SELECT node_id FROM site_nodes ORDER BY 1 LIMIT 1) AS node_id,
        1 AS sequence_order,
        t.check_in AS start_time,
        t.check_in + t.time_per_item AS end_time,
        '캠핑 사이트 도착 및 텐트 설치' AS activity_name
    FROM time_data t
    
    UNION ALL
    
    -- 중간 항목들 (2-7)
    SELECT 
        gen_random_uuid(),
        t.schedule_id,
        n.node_id,
        ROW_NUMBER() OVER (ORDER BY n.node_id) + 1,
        t.check_in + (t.time_per_item * ROW_NUMBER() OVER (ORDER BY n.node_id)),
        t.check_in + (t.time_per_item * (ROW_NUMBER() OVER (ORDER BY n.node_id) + 1)),
        CASE 
            WHEN n.type = 'WC' THEN '화장실 이용'
            WHEN n.type = 'STORE' THEN n.name || ' 방문'
            WHEN n.type = 'ACTIVITY' THEN n.name || ' 체험'
            ELSE n.name
        END
    FROM time_data t
    CROSS JOIN other_nodes n
    
    UNION ALL
    
    -- 마지막 항목 (SITE)
    SELECT 
        gen_random_uuid(),
        t.schedule_id,
        COALESCE(
            (SELECT node_id FROM site_nodes ORDER BY 1 LIMIT 1 OFFSET 1),
            (SELECT node_id FROM site_nodes ORDER BY 1 LIMIT 1)
        ),
        8,
        t.check_in + (t.time_per_item * 7),
        t.check_out,
        '캠핑 사이트 복귀 및 휴식'
    FROM time_data t
)
INSERT INTO schedule_items (
    id,
    schedule_id,
    node_id,
    sequence_order,
    start_time,
    end_time,
    activity_name,
    created_at,
    updated_at
)
SELECT 
    id,
    schedule_id,
    node_id,
    sequence_order,
    start_time,
    end_time,
    activity_name,
    NOW(),
    NOW()
FROM items
ORDER BY sequence_order;

-- 완료
SELECT '더미 데이터 생성 완료!' AS message;
