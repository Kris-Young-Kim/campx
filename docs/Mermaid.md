### 1. `MERMAID.md`
시스템 아키텍처, 데이터베이스 설계, 사용자 흐름을 시각화한 문서입니다.

```markdown
# CampX System Visualizations

## 1. Database Schema (ERD)
CampX uses PostgreSQL on Neon with `pgvector` for AI matching.

```mermaid
erDiagram
    %% User & Auth
    USERS {
        UUID id PK "gen_random_uuid()"
        VARCHAR clerk_user_id UK "Clerk Auth ID"
        VARCHAR email
        VARCHAR name
        VECTOR preference_vector "AI Profile [Nature, Activity, Rest]"
        BOOLEAN has_pet
        INTEGER family_size
        JSONB bio_data_json
        TIMESTAMPTZ created_at
    }

    %% Master Data (Facilities)
    NODES {
        UUID id PK
        VARCHAR name
        VARCHAR type "SITE, WC, STORE, ACTIVITY"
        DECIMAL pos_x "3D Coord"
        DECIMAL pos_y "3D Coord"
        DECIMAL pos_z "Elevation (for fatigue calc)"
        VECTOR attr_vector "Node Profile"
        TEXT description
    }

    %% Transactions
    BOOKINGS {
        UUID id PK
        UUID user_id FK
        DATE check_in
        DATE check_out
        VARCHAR status "BOOKED, CHECKED_IN, COMPLETED"
    }

    SCHEDULES {
        UUID id PK
        UUID booking_id FK
        DECIMAL total_fatigue_score "AI Prediction"
        BOOLEAN is_active
    }

    SCHEDULE_ITEMS {
        UUID id PK
        UUID schedule_id FK
        UUID node_id FK
        INTEGER sequence_order
        TIMESTAMP start_time
        TIMESTAMP end_time
        VARCHAR activity_name
    }

    ACTIVITY_LOGS {
        UUID id PK
        UUID user_id FK
        UUID node_id FK
        VARCHAR action_type
        INTEGER satisfaction_score
    }

    USERS ||--o{ BOOKINGS : "makes"
    USERS ||--o{ ACTIVITY_LOGS : "generates"
    BOOKINGS ||--o{ SCHEDULES : "has"
    SCHEDULES ||--o{ SCHEDULE_ITEMS : "contains"
    NODES ||--o{ SCHEDULE_ITEMS : "location_of"
    NODES ||--o{ ACTIVITY_LOGS : "target_of"
```

## 2. System Architecture
Next.js 16 Monolith with Server Actions.

```mermaid
graph TD
    Client[Client Browser]
    
    subgraph "Next.js 16 (App Router)"
        Auth[Clerk Middleware]
        UI[React Components]
        Three[R3F Canvas (3D Map)]
        Action[Server Actions]
    end
    
    subgraph "Data Layer (Neon)"
        DB[(PostgreSQL)]
        Vector[pgvector Extension]
    end
    
    Client -->|Request| Auth
    Auth -->|Verified| UI
    UI -->|Render 3D| Three
    UI -->|Data Fetch / Mutate| Action
    Action -->|SQL Query| DB
    Action -->|Vector Similarity| Vector
```

## 3. User Journey (AI Scheduling)

```mermaid
sequenceDiagram
    actor User
    participant App as Next.js App
    participant AI as AI Logic (Server Action)
    participant DB as Neon DB

    User->>App: Login (Clerk)
    App->>User: Show Survey (Condition, Companion)
    User->>App: Submit Survey Data
    
    App->>AI: Request Schedule Generation
    AI->>DB: Fetch User Vector & Node Vectors
    DB-->>AI: Return Vectors
    
    AI->>AI: Calculate Cosine Similarity
    AI->>AI: Apply Fatigue Logic (Elevation/Distance)
    AI->>DB: Save Schedule & Items
    
    App->>User: Display Timeline & 3D Map
    User->>App: Click "Start Schedule"
    App->>DB: Update Booking Status