### 2. `DIR.md`
Next.js 16 App Router 구조에 맞춘 프로젝트 디렉토리 트리입니다. AI에게 파일 위치를 알려줄 때 유용합니다.

```markdown
# Project Directory Structure

## Overview
This project follows the **Next.js 16 App Router** convention.
- **Frontend:** React, Tailwind CSS, Shadcn UI, Framer Motion
- **3D:** React Three Fiber (R3F), Drei
- **Backend:** Next.js Server Actions
- **Database:** Neon (PostgreSQL), Drizzle ORM (optional) or Raw SQL

## File Tree

```
campx-mvp/
├── .env.local                  # Environment variables (Clerk keys, DB URL)
├── middleware.ts               # Clerk authentication middleware
├── components.json             # Shadcn UI configuration
├── next.config.mjs             # Next.js configuration
├── package.json
├── README.md
├── MERMAID.md
│
├── app/                        # App Router Root
│   ├── layout.tsx              # Root Layout (ClerkProvider, Fonts)
│   ├── page.tsx                # Landing Page (v0 generated)
│   ├── globals.css             # Tailwind imports
│   │
│   ├── (auth)/                 # Auth Routes (Clerk)
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   │
│   ├── (main)/                 # Protected Routes
│   │   ├── dashboard/          # Main Dashboard
│   │   │   ├── page.tsx
│   │   │   ├── _components/    # Dashboard specific components
│   │   │   │   ├── timeline-view.tsx
│   │   │   │   └── map-view-3d.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── onboarding/         # User Survey Page
│   │   │   └── page.tsx
│   │   │
│   │   └── admin/              # Owner Page (QR Scan)
│   │       └── page.tsx
│   │
│   └── api/                    # API Routes (if needed, mostly Server Actions)
│       └── webhooks/
│           └── clerk/route.ts  # Clerk Webhook for DB Sync
│
├── components/                 # Shared Components
│   ├── ui/                     # Shadcn UI Components (Button, Card, etc.)
│   ├── 3d/                     # R3F Components
│   │   ├── CampingScene.tsx
│   │   ├── Pins.tsx
│   │   └── CameraController.tsx
│   └── layout/                 # Header, Footer, Sidebar
│
├── lib/                        # Utilities & Logic
│   ├── db.ts                   # Database connection (Neon)
│   ├── utils.ts                # Tailwind merge helper
│   ├── ai-logic.ts             # Cosine similarity & Fatigue calc logic
│   └── actions/                # Server Actions
│       ├── user-actions.ts     # Sync User, Save Survey
│       ├── schedule-actions.ts # Generate Timeline
│       └── booking-actions.ts  # QR Check-in
│
├── db/                         # Database Resources
│   └── schema.sql              # The SQL script for Neon
│
└── public/                     # Static Assets
    ├── models/                 # 3D Models (.glb, .gltf)
    ├── maps/                   # Drone/Satellite Images
    └── icons/                  # Custom Icons