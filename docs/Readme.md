### 3. `README.md`
프로젝트의 대문입니다. 개발자(본인)와 협업자, 혹은 미래의 유지보수 담당자가 가장 먼저 읽어야 할 문서입니다.

```markdown
# CampX MVP ⛺

> **AI-based Personalized Camping Experience Solution**
>
> "Don't just book a spot, Design your rest."

CampX is a DX (Digital Transformation) solution for campsites that provides **AI-curated schedules** based on user bio-rhythms and a **3D interactive map** for a seamless non-face-to-face experience.

![Status](https://img.shields.io/badge/Status-MVP_Development-green)
![Stack](https://img.shields.io/badge/Stack-Next.js_16_%7C_Neon_%7C_Clerk-blue)

## ✨ Key Features

1.  **AI Bio-Rhythm Scheduler**: Generates a personalized timeline based on fatigue level, companions, and preferences using Vector Similarity Search (`pgvector`).
2.  **3D Interactive Map**: Visualize the campsite, your tent location, and recommended spots using React Three Fiber.
3.  **Smart Check-in**: QR-code based non-face-to-face check-in system for operational efficiency.

## 🛠️ Tech Stack

*   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
*   **Database**: [Neon (Serverless Postgres)](https://neon.tech/) + `pgvector`
*   **Auth**: [Clerk](https://clerk.com/)
*   **Styling**: Tailwind CSS + [Shadcn UI](https://ui.shadcn.com/)
*   **3D**: React Three Fiber (R3F) + Drei
*   **Deployment**: Vercel

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js 18+
*   Neon Database Project created
*   Clerk Application created

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/your-username/campx-mvp.git
cd campx-mvp

# Install dependencies
npm install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Neon Database
DATABASE_URL=postgres://user:password@ep-xyz.aws.neon.tech/neondb?sslmode=require

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Run the SQL script located in `db/schema.sql` in your Neon Console SQL Editor.
This will:
*   Enable `vector` extension.
*   Create tables (`users`, `nodes`, `bookings`, `schedules`...).
*   Set up triggers and indexes.

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📂 Documentation

*   **[MERMAID.md](./MERMAID.md)**: Database Schema (ERD), System Architecture, and User Flows.
*   **[DIR.md](./DIR.md)**: Project directory structure and file explanations.

## 🤝 Contributing

This is an MVP project developed with **"Vibe Coding"** strategy (Fast, AI-Assisted).
Focus on **Functionality** over Form.

---
*Created by a 20-year veteran developer.*