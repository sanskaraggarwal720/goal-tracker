# AtomQuest Hackathon 1.0 — Implementation Plan
### Goal Setting & Tracking Portal

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack Decision](#2-tech-stack-decision)
3. [Database Schema](#3-database-schema)
4. [Project Structure](#4-project-structure)
5. [Phase-by-Phase Implementation](#5-phase-by-phase-implementation)
6. [Feature Checklist](#6-feature-checklist)
7. [Bonus Features Plan](#7-bonus-features-plan)
8. [Demo Data & Seeding Strategy](#8-demo-data--seeding-strategy)
9. [Architecture Diagram Notes](#9-architecture-diagram-notes)
10. [Submission Checklist](#10-submission-checklist)
11. [Risk & Mitigation](#11-risk--mitigation)

---

## 1. Project Overview

| Item | Detail |
|---|---|
| **Product** | Web-based Goal Setting & Tracking Portal |
| **Roles** | Employee, Manager (L1), Admin/HR |
| **Core Lifecycle** | Goal Creation → Manager Approval → Quarterly Check-ins → Reporting |
| **Must-Have Phases** | Phase 1 (Goal Creation & Approval) + Phase 2 (Achievement Tracking) |
| **Bonus Targets** | Analytics Module + Escalation Module |
| **Deliverables** | Live URL, GitHub repo, Architecture diagram, 3 role credentials |

---

## 2. Tech Stack Decision

### Chosen Stack

| Layer | Technology | Reason |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | Full-stack in one repo, fast routing, SSR |
| **Styling** | Tailwind CSS + Framer Motion | High-end animations, layout transitions, gesture support |
| **UI Primitives** | Radix UI (headless) | Accessible base components — no shadcn defaults, full custom styling |
| **Charts** | Recharts + Framer Motion | Animated chart entry, staggered bar reveals, smooth line draws |
| **Database** | Supabase (PostgreSQL) | Free tier, built-in auth, Row-Level Security |
| **Auth** | Supabase Auth | Email/password + role metadata |
| **Hosting** | Vercel | One-click deploy, free tier, global CDN |
| **Version Control** | GitHub | Required for submission |
| **Architecture Diagram** | Excalidraw / draw.io | Easy, clean, exportable to PDF |

### Cost Summary
> **Total infrastructure cost: ~$0/month** — all services run within free tiers for hackathon scale.

---

## 3. Database Schema

### 3.1 Tables

```sql
-- User profiles (linked to Supabase Auth)
CREATE TABLE users (
  id          UUID PRIMARY KEY REFERENCES auth.users,
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  role        TEXT CHECK (role IN ('employee', 'manager', 'admin')) NOT NULL,
  manager_id  UUID REFERENCES users(id),
  department  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Thrust Areas (configured by Admin)
CREATE TABLE thrust_areas (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_by  UUID REFERENCES users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Goal Cycles (configured by Admin)
CREATE TABLE goal_cycles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,          -- e.g. "FY 2025-26"
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  is_active   BOOLEAN DEFAULT TRUE,
  created_by  UUID REFERENCES users(id)
);

-- Goals
CREATE TABLE goals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID REFERENCES goal_cycles(id),
  employee_id     UUID REFERENCES users(id),
  thrust_area_id  UUID REFERENCES thrust_areas(id),
  title           TEXT NOT NULL,
  description     TEXT,
  uom             TEXT CHECK (uom IN ('numeric_min', 'numeric_max', 'timeline', 'zero')) NOT NULL,
  target          NUMERIC,
  target_date     DATE,              -- for timeline UoM
  weightage       NUMERIC NOT NULL,  -- must sum to 100 per employee per cycle
  status          TEXT CHECK (status IN ('draft', 'submitted', 'approved', 'rework', 'locked')) DEFAULT 'draft',
  is_shared       BOOLEAN DEFAULT FALSE,
  shared_by       UUID REFERENCES users(id),
  locked          BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Shared Goal Recipients
CREATE TABLE shared_goal_recipients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id       UUID REFERENCES goals(id),
  employee_id   UUID REFERENCES users(id),
  weightage     NUMERIC NOT NULL    -- recipient can only adjust weightage
);

-- Quarterly Achievements
CREATE TABLE achievements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id     UUID REFERENCES goals(id),
  quarter     TEXT CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  actual      NUMERIC,
  actual_date DATE,                  -- for timeline UoM
  status      TEXT CHECK (status IN ('not_started', 'on_track', 'completed')) DEFAULT 'not_started',
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (goal_id, quarter)
);

-- Manager Check-ins
CREATE TABLE checkins (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id     UUID REFERENCES goals(id),
  manager_id  UUID REFERENCES users(id),
  quarter     TEXT CHECK (quarter IN ('Q1', 'Q2', 'Q3', 'Q4')),
  comment     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id     UUID REFERENCES goals(id),
  changed_by  UUID REFERENCES users(id),
  field       TEXT NOT NULL,
  old_value   TEXT,
  new_value   TEXT,
  changed_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Escalations
CREATE TABLE escalations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL,    -- 'goal_not_submitted', 'approval_pending', 'checkin_pending'
  target_user_id  UUID REFERENCES users(id),
  goal_id         UUID REFERENCES goals(id),
  triggered_at    TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ,
  notified_level  INT DEFAULT 1     -- 1=employee, 2=manager, 3=HR
);
```

### 3.2 Key Validation Rules (Enforced in App Layer)

| Rule | Enforcement |
|---|---|
| Total weightage per employee per cycle = 100% | Frontend + API route validation |
| Minimum weightage per goal = 10% | Frontend + API validation |
| Maximum goals per employee = 8 | API validation before insert |
| Goals locked after manager approval | `locked = TRUE`, edit API returns 403 |
| Shared goal: title/target read-only for recipients | UI disable + API guard |

---

## 4. Project Structure

```
goal-tracker/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx               ← Role-aware sidebar
│   │   ├── employee/
│   │   │   ├── goals/page.tsx       ← Goal list + create
│   │   │   ├── goals/[id]/page.tsx  ← Goal detail + achievement entry
│   │   │   └── check-ins/page.tsx
│   │   ├── manager/
│   │   │   ├── team/page.tsx        ← Team goal dashboard
│   │   │   ├── approvals/page.tsx   ← Pending approvals queue
│   │   │   └── check-ins/page.tsx
│   │   └── admin/
│   │       ├── dashboard/page.tsx   ← Org-wide completion view
│   │       ├── cycles/page.tsx
│   │       ├── thrust-areas/page.tsx
│   │       ├── users/page.tsx
│   │       ├── reports/page.tsx     ← CSV export
│   │       ├── analytics/page.tsx   ← BONUS: Charts & heatmaps
│   │       ├── escalations/page.tsx ← BONUS: Escalation log
│   │       └── audit-log/page.tsx
├── components/
│   ├── ui/                          ← Radix UI headless + custom Tailwind styling (NO shadcn defaults)
│   ├── motion/                      ← Shared Framer Motion variants & wrappers
│   │   ├── PageTransition.tsx       ← Wraps every page in AnimatePresence layout
│   │   ├── StaggerList.tsx          ← Staggered children reveal (goal cards, table rows)
│   │   ├── CountUp.tsx              ← Animated number counter for metric cards
│   │   └── ProgressRing.tsx         ← SVG ring with motion path animation
│   ├── DemoRoleSwitcher.tsx         ← 🔴 MANDATORY — floating pill, always visible
│   ├── GoalForm.tsx
│   ├── GoalCard.tsx                 ← motion.div with whileHover lift + layout animation
│   ├── AchievementEntry.tsx
│   ├── ApprovalCard.tsx             ← AnimatePresence exit on approve/reject
│   ├── CheckinModal.tsx             ← Framer Motion modal (scale + opacity enter)
│   ├── ProgressBar.tsx              ← motion bar fill on mount (width: 0 → actual%)
│   └── charts/
│       ├── QoQTrendChart.tsx
│       ├── CompletionHeatmap.tsx
│       └── GoalDistributionChart.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── validations.ts               ← Weightage, goal count, UoM rules
│   ├── progress-calculator.ts       ← UoM score formulas
│   └── escalation-engine.ts        ← Rule evaluator
├── app/api/
│   ├── goals/route.ts
│   ├── goals/[id]/route.ts
│   ├── goals/[id]/approve/route.ts
│   ├── achievements/route.ts
│   ├── checkins/route.ts
│   ├── reports/export/route.ts      ← CSV generation
│   └── escalations/check/route.ts
├── middleware.ts                    ← Auth + role guard
└── supabase/
    ├── migrations/001_schema.sql
    └── seed.sql                     ← Demo data
```

---

## 5. Phase-by-Phase Implementation

### Phase 0 — Setup (Complete First)
**Time target: ~10% of total hackathon time**

- [ ] Create Next.js 14 project with TypeScript
- [ ] Install Tailwind CSS + Framer Motion + Radix UI primitives

```bash
npm install framer-motion @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tooltip
```

- [ ] Set up Supabase project, get API keys
- [ ] Run schema migrations (SQL from Section 3)
- [ ] Configure Supabase Auth (email/password)
- [ ] Set up middleware for auth + role-based route protection
- [ ] Deploy skeleton to Vercel (get live URL early)
- [ ] Create GitHub repo, push initial commit
- [ ] **Build `DemoRoleSwitcher` component — MANDATORY, build this first** (see Section 5.0.1 below)

### Phase 0.1 — Demo Role Switcher (Build This Before Anything Else) 🔴

> **Non-negotiable.** This is the single most important UI element for winning the demo. Judges will switch roles during your live walkthrough — make it effortless and visually stunning.

#### What it does
A persistent floating pill in the bottom-right corner of every page. One click switches the active role (Employee → Manager → Admin), instantly re-routes to that role's dashboard, swaps the sidebar nav, and transitions the entire UI with a Framer Motion layout animation. No login/logout. No page reload.

#### Implementation

```tsx
// components/DemoRoleSwitcher.tsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ROLES = [
  { id: 'employee', label: 'Employee',  color: '#185FA5', initials: 'AS', route: '/employee/goals' },
  { id: 'manager',  label: 'Manager',   color: '#3B6D11', initials: 'RM', route: '/manager/approvals' },
  { id: 'admin',    label: 'Admin/HR',  color: '#7F77DD', initials: 'PS', route: '/admin/dashboard' },
];

export function DemoRoleSwitcher({ currentRole }: { currentRole: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const active = ROLES.find(r => r.id === currentRole)!;

  const switchTo = (role: typeof ROLES[number]) => {
    document.cookie = `demo_role=${role.id}; path=/`;
    setOpen(false);
    router.push(role.route);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: '52px', right: 0,
              background: 'white', border: '0.5px solid #e5e7eb',
              borderRadius: '12px', padding: '6px', minWidth: '180px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)'
            }}
          >
            <div style={{ fontSize: '10px', color: '#9ca3af', padding: '4px 10px 6px', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>
              Switch role (demo)
            </div>
            {ROLES.map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => switchTo(role)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                  background: role.id === currentRole ? '#f3f4f6' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left'
                }}
                whileHover={{ background: '#f3f4f6' }}
                whileTap={{ scale: 0.97 }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: role.color + '20', color: role.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 600
                }}>{role.initials}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{role.label}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{role.route}</div>
                </div>
                {role.id === currentRole && (
                  <motion.div layoutId="active-dot" style={{
                    marginLeft: 'auto', width: 6, height: 6,
                    borderRadius: '50%', background: role.color
                  }} />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: active.color, color: 'white',
          border: 'none', borderRadius: '999px',
          padding: '8px 16px 8px 10px', cursor: 'pointer',
          fontSize: '13px', fontWeight: 500,
          boxShadow: `0 4px 14px ${active.color}55`
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700
        }}>{active.initials}</div>
        {active.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ display: 'inline-block', fontSize: '10px' }}>▲</motion.span>
      </motion.button>
    </div>
  );
}
```

#### Integration — add to root layout

```tsx
// app/(dashboard)/layout.tsx
import { DemoRoleSwitcher } from '@/components/DemoRoleSwitcher';
import { cookies } from 'next/headers';

export default function DashboardLayout({ children }) {
  const role = cookies().get('demo_role')?.value ?? 'employee';
  return (
    <div>
      <Sidebar role={role} />
      <main>{children}</main>
      <DemoRoleSwitcher currentRole={role} />   {/* ← always present */}
    </div>
  );
}
```

#### Switcher rules
- Visible on **every** page, every role — never hidden, never conditional
- Color of the pill matches the active role (blue = employee, green = manager, purple = admin)
- Animated `layoutId` dot tracks the active role inside the dropdown
- Role persists via a `demo_role` cookie — survives page reloads
- In production auth, gate behind `NODE_ENV === 'development'` || a `?demo=true` query param

---

### Phase 1 — Goal Creation & Approval (Must-Have)
**Time target: ~35% of total hackathon time**

#### 1.1 Employee — Goal Sheet

- [ ] Goal creation form with fields:
  - Thrust Area (Radix Select with animated dropdown)
  - Goal Title + Description
  - Unit of Measurement (UoM): `Numeric (Min)`, `Numeric (Max)`, `Timeline`, `Zero`
  - Target value (number or date, depends on UoM)
  - Weightage (%)
- [ ] **Framer Motion — UoM selector:** `motion.div` cards with `whileHover={{ scale: 1.02 }}` and `layoutId="uom-selected"` border that slides between options
- [ ] **Framer Motion — Weightage bar:** `motion.div` width animates from previous % to new % on every keystroke (`transition={{ type: 'spring', stiffness: 300, damping: 30 }}`)
- [ ] **Framer Motion — Validation flash:** bar turns red with `animate={{ backgroundColor: ['#ef4444', '#dc2626', '#fee2e2'] }}` when total ≠ 100%
- [ ] Validation on save:
  - Running total of weightage shown live (e.g. "Used: 70% / Remaining: 30%")
  - Block submit if total ≠ 100%
  - Block if any single goal < 10%
  - Block if goal count > 8
- [ ] **Framer Motion — Goal list:** `StaggerList` wrapper staggers each `GoalCard` in with `initial={{ opacity: 0, y: 16 }}` and `animate={{ opacity: 1, y: 0 }}` with 0.06s delay per card
- [ ] Submit for Approval button (sends all goals to manager)
- [ ] View locked goals (read-only after manager approval) — locked goals render with `opacity: 0.6` and a `motion.div` lock icon that scales in

#### 1.2 Manager — Approval Workflow

- [ ] Pending approvals queue — employee rows animate in with `StaggerList`
- [ ] Goal review view: see all goals for one employee
- [ ] **Framer Motion — Approve action:** on click, `ApprovalCard` plays `animate={{ x: 60, opacity: 0 }}` exit before being removed from list via `AnimatePresence`
- [ ] **Framer Motion — Return for rework:** card slides left `animate={{ x: -60, opacity: 0 }}` — directional exit signals rejection vs. approval
- [ ] **Framer Motion — Inline edit fields:** target/weightage inputs expand with `animate={{ height: 'auto' }}` on manager click (collapsed by default)
- [ ] Approve → all goals lock (`locked = TRUE`, status = `'approved'`)
- [ ] Manager cannot approve their own goals

#### 1.3 Admin — Shared Goals

- [ ] Push a departmental KPI goal to selected employees
- [ ] Shared goal: title and target are read-only for recipients — locked fields show `motion.div` shimmer overlay
- [ ] Recipients can adjust only their weightage
- [ ] Achievement entered by primary owner syncs to all linked sheets

---

### Phase 2 — Achievement Tracking & Check-ins (Must-Have)
**Time target: ~30% of total hackathon time**

#### 2.1 Progress Score Calculator

Implement `lib/progress-calculator.ts`:

```typescript
export function computeProgress(goal: Goal, actual: number | Date): number {
  switch (goal.uom) {
    case 'numeric_min':  // Higher is better (e.g., revenue)
      return Math.min((actual as number) / goal.target, 1) * 100;

    case 'numeric_max':  // Lower is better (e.g., TAT, cost)
      return Math.min(goal.target / (actual as number), 1) * 100;

    case 'timeline': {   // Date-based completion
      const deadline = new Date(goal.target_date!);
      const completion = actual as Date;
      return completion <= deadline ? 100 : 0;
    }

    case 'zero':         // Zero = 100% success
      return (actual as number) === 0 ? 100 : 0;
  }
}
```

#### 2.2 Employee — Achievement Entry

- [ ] Quarterly update interface (show active quarter based on current date)
- [ ] **Framer Motion — Progress ring:** `ProgressRing.tsx` SVG with `pathLength` animated from 0 to computed score on mount — judges will stare at this
- [ ] **Framer Motion — Score update:** when employee enters actual value, score number animates via `CountUp.tsx` (spring-interpolated from old → new value in ~600ms)
- [ ] Per-goal fields: Actual value + Status (Not Started / On Track / Completed)
- [ ] Progress score displayed automatically (computed, not editable)
- [ ] Lock entry outside active quarter windows (per schedule in BRD Section 2.3)
- [ ] **Framer Motion — Status badge:** badge color/label transitions with `AnimatePresence` when status changes

#### 2.3 Quarter Window Enforcement

```typescript
export function getActiveQuarter(): string | null {
  const month = new Date().getMonth() + 1; // 1-12
  if (month >= 7 && month <= 9)   return 'Q1';   // July-Sept
  if (month >= 10 && month <= 12) return 'Q2';   // Oct-Dec
  if (month >= 1 && month <= 3)   return 'Q3';   // Jan-Mar
  if (month >= 3 && month <= 5)   return 'Q4';   // Mar-May
  return null; // Outside all windows
}
```

#### 2.4 Manager — Check-in Module

- [ ] Team dashboard: list of all direct reports + their overall progress
- [ ] **Framer Motion — Employee rows:** `whileHover={{ backgroundColor: 'var(--hover-bg)', x: 2 }}` on each row — subtle but polished
- [ ] Per-employee view: Planned vs. Actual for each goal, all quarters
- [ ] **Framer Motion — Check-in modal:** `CheckinModal` enters with `scale: 0.96 → 1` and `opacity: 0 → 1`, backdrop fades in separately
- [ ] Add structured check-in comment per quarter (modal)
- [ ] Check-in marked complete once comment saved — row updates with `AnimatePresence` checkmark reveal
- [ ] Completion status visible on team dashboard

---

### Phase 3 — Reporting & Admin (Must-Have)
**Time target: ~15% of total hackathon time**

#### 3.1 Achievement Report (CSV Export)

- [ ] Admin page: filter by department / cycle / quarter
- [ ] Table: Employee | Goal | Target | Q1 Actual | Q2 Actual | Q3 Actual | Q4 Actual | Progress %
- [ ] Export to CSV (use `papaparse` or simple string builder)
- [ ] Export to Excel optional (use `xlsx` library)

#### 3.2 Completion Dashboard

- [ ] Real-time view: which employees have submitted goals, which have completed check-ins
- [ ] Filter by manager / department
- [ ] Summary stats: "X of Y employees have completed Q2 check-in"

#### 3.3 Audit Trail

- [ ] Every edit to a locked goal is logged: `who`, `field`, `old value`, `new value`, `timestamp`
- [ ] Admin-only audit log table, filterable by employee/goal/date

---

### Phase 4 — Polish, Framer Motion Pass & Demo Prep
**Time target: ~10% of total hackathon time**

This phase is a dedicated **animation quality pass** — not just demo prep.

#### 4.1 Global Animation Polish

- [ ] Wrap every page in `<PageTransition>` — consistent `opacity: 0→1` + `y: 8→0` on route change via `AnimatePresence` in root layout
- [ ] Audit every list — ensure `StaggerList` is applied to: goal cards, employee rows, check-in rows, escalation entries, analytics chart bars
- [ ] Audit every number — ensure `CountUp` animates: metric card values, progress %, overall score
- [ ] Audit every progress bar — ensure `ProgressBar` uses spring animation on mount, not CSS transition
- [ ] Add `whileHover` to every clickable card (`scale: 1.01`, `y: -1`) and every button (`scale: 0.97` on tap)
- [ ] Add `layoutId` transitions: sidebar active indicator slides between nav items; status badge morphs in-place when status changes

#### 4.2 Shared Motion Variants (create `lib/motion-variants.ts`)

```typescript
export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: 'easeOut' }
};

export const stagger = {
  animate: { transition: { staggerChildren: 0.06 } }
};

export const cardHover = {
  whileHover: { y: -2, scale: 1.01 },
  whileTap:   { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 25 }
};

export const springPop = {
  initial:  { scale: 0.85, opacity: 0 },
  animate:  { scale: 1, opacity: 1 },
  transition: { type: 'spring', stiffness: 500, damping: 28 }
};
```

#### 4.3 Demo Role Switcher — Final Checks 🔴

- [ ] Switcher is visible on **every single page** — do a full click-through of all routes and verify
- [ ] Pill color updates instantly when role switches (no flash of wrong color)
- [ ] Route redirect after switch lands on the correct role's default page
- [ ] Switcher does not overlap any important UI element (adjust `bottom`/`right` if needed)
- [ ] Test switching mid-flow: e.g. switch from Employee goal form → Manager approvals → back to Employee — all state is correct
- [ ] Add a subtle `⚡ Demo mode` label inside the switcher popup so judges understand it is intentional

#### 4.4 Standard Demo Prep

- [ ] Seed demo data (see Section 8)
- [ ] Finalize architecture diagram
- [ ] Record backup demo video (record ALL role switcher transitions — this is the highlight)
- [ ] Write README with setup instructions + login credentials

---

## 6. Feature Checklist

### Phase 0 — Setup ✅

| # | Feature | Status |
|---|---|---|
| 0.1 | **Demo Role Switcher — built and visible on all pages** 🔴 | ⬜ |
| 0.2 | Framer Motion installed and `motion-variants.ts` created | ⬜ |
| 0.3 | `PageTransition` wrapper on root layout | ⬜ |
| 0.4 | Radix UI headless primitives installed | ⬜ |

### Phase 1 — Must-Have ✅

| # | Feature | Status |
|---|---|---|
| 1.1 | Employee goal creation form | ⬜ |
| 1.2 | UoM selection (Numeric Min/Max, Timeline, Zero) | ⬜ |
| 1.3 | Weightage validation (=100%, min 10%, max 8 goals) | ⬜ |
| 1.4 | Submit goals for manager approval | ⬜ |
| 1.5 | Manager approval queue | ⬜ |
| 1.6 | Inline edit by manager (target/weightage) | ⬜ |
| 1.7 | Goal lock on approval | ⬜ |
| 1.8 | Return for rework flow | ⬜ |
| 1.9 | Shared Goals — admin push to multiple employees | ⬜ |
| 1.10 | Shared Goals — recipient adjusts weightage only | ⬜ |
| 1.11 | Shared Goals — achievement sync from primary owner | ⬜ |

### Phase 2 — Must-Have ✅

| # | Feature | Status |
|---|---|---|
| 2.1 | Quarterly achievement entry interface | ⬜ |
| 2.2 | Status selection per goal | ⬜ |
| 2.3 | Progress score computation (all 4 UoM formulas) | ⬜ |
| 2.4 | Quarter window enforcement | ⬜ |
| 2.5 | Manager team dashboard (Planned vs Actual) | ⬜ |
| 2.6 | Manager check-in comment module | ⬜ |

### Reporting — Must-Have ✅

| # | Feature | Status |
|---|---|---|
| 3.1 | Achievement Report — CSV export | ⬜ |
| 3.2 | Completion Dashboard (real-time) | ⬜ |
| 3.3 | Audit trail log | ⬜ |

---

## 7. Bonus Features Plan

### 7.1 Analytics Module (Priority 1)

**Why first:** Visually impressive, no external APIs, high demo impact.

Pages to build under `/admin/analytics`:

| Chart | Library | Animation |
|---|---|---|
| QoQ Achievement Trend (line chart) | Recharts `<LineChart>` | `motion` wrapper — bars grow from baseline on mount with `staggerChildren` |
| Org Completion Heatmap (dept × quarter grid) | CSS grid + Framer Motion | Each cell fades in with staggered delay; color transitions via `animate` on value change |
| Goal Distribution (bar: by Thrust Area, UoM, Status) | Recharts `<BarChart>` | Custom bar shape using Framer Motion `scaleY` from 0 → 1 |
| Manager Effectiveness (check-in completion %) | Recharts `<RadarChart>` | Polygon draws in via SVG `pathLength` animation |

**Implementation steps:**
- [ ] Create `/admin/analytics` page
- [ ] Build data-fetch API routes aggregating from `achievements` + `goals`
- [ ] Implement QoQ trend chart component
- [ ] Implement completion heatmap component
- [ ] Implement goal distribution bar chart
- [ ] Implement manager effectiveness chart

---

### 7.2 Escalation Module (Priority 2)

**Why second:** Engineering maturity signal, no external APIs, runs on a simple scheduler.

**Escalation Rules:**

| Trigger | Condition | Action |
|---|---|---|
| Goal not submitted | N days after cycle opens, employee has not submitted | Flag in `escalations` table, show alert to manager |
| Approval pending | N days after submission, manager has not approved | Escalate: alert to skip-level / Admin |
| Check-in not completed | N days after quarter window opens, check-in missing | Flag: alert to manager, then HR |

**Implementation steps:**
- [ ] Create `lib/escalation-engine.ts` — evaluates all rules against current DB state
- [ ] Create `/api/escalations/check` route — called on page load or by a scheduled trigger
- [ ] Admin escalation log page (`/admin/escalations`) — filterable table
- [ ] Show in-app banner alerts to relevant users
- [ ] (Optional) Configure N-day thresholds from Admin settings page

---

## 8. Demo Data & Seeding Strategy

> **Key insight:** Rich, realistic seed data is your #1 demo differentiator. Walk in with a populated portal that looks like a real company.

### Org Structure to Seed

```
Admin:    Priya Sharma (HR)
Manager:  Rajesh Mehta (Sales Lead)     → manages 3 employees
Manager:  Anjali Gupta (Ops Lead)       → manages 2 employees
Employee: Arjun Singh    (Sales)
Employee: Neha Patel     (Sales)
Employee: Vikram Rao     (Sales)
Employee: Shreya Desai   (Ops)
Employee: Karan Joshi    (Ops)
```

### Realistic Goal Examples

| Employee | Goal Title | UoM | Target | Weightage |
|---|---|---|---|---|
| Arjun Singh | Achieve Monthly Sales Revenue of ₹50L | Numeric (Min) | 50 | 30% |
| Arjun Singh | Reduce Customer Onboarding TAT to 3 days | Numeric (Max) | 3 | 25% |
| Arjun Singh | Complete CRM Migration by September 30 | Timeline | 30 Sep | 20% |
| Arjun Singh | Zero Safety Incidents in Q2 | Zero | 0 | 15% |
| Arjun Singh | Achieve NPS Score of 75+ | Numeric (Min) | 75 | 10% |

### Quarter Data to Pre-populate

- **Q1 data:** All employees have actuals entered, check-in comments from managers
- **Q2 data:** 50% of employees have actuals — shows "in progress" state
- **Q3/Q4:** Empty — shows upcoming quarters

### Seeding Command

Create `supabase/seed.sql` with `INSERT` statements for all users, goals, achievements, check-ins. Run it once on the Supabase dashboard after schema migration.

---

## 9. Architecture Diagram Notes

Create this in **Excalidraw** (excalidraw.com) and export as PDF.

### Diagram Components

```
[User Browser]
    │
    ▼
[Vercel CDN + Edge Network]
    │
    ▼
[Next.js 14 App]
    ├── App Router (React Server Components)
    ├── API Routes (/api/*)
    └── Middleware (Auth guard + Role routing)
    │
    ▼
[Supabase]
    ├── PostgreSQL Database
    ├── Supabase Auth (JWT)
    └── Row-Level Security Policies
```

### Annotations to Add

- **"$0/month"** label next to Vercel and Supabase
- **"Role-based access"** arrow from Auth to each user type
- **"RLS enforced"** label on the database
- **"CSV Export"** path from DB to browser for reports

---

## 10. Submission Checklist

### Before Demo Day

- [ ] Live URL is working (Vercel deployment)
- [ ] GitHub repo is public
- [ ] `README.md` includes: project description, setup steps, login credentials for all 3 roles
- [ ] Architecture diagram is exported as PDF
- [ ] All 3 role journeys tested end-to-end
- [ ] **Demo Role Switcher tested on every page — no exceptions** 🔴
- [ ] All Framer Motion animations tested on demo hardware (no jank)
- [ ] Backup video recording of full demo — **must include role switching transitions**
- [ ] Login credentials prepared on a printed/phone note

### Required Deliverables

| # | Deliverable | Status |
|---|---|---|
| 1 | Live hosted demo URL | ⬜ |
| 2 | GitHub repository link | ⬜ |
| 3 | Architecture diagram (PDF) | ⬜ |
| 4 | Login credentials for Employee, Manager, Admin | ⬜ |

### Demo Script (5-minute run)

> Open with the **Demo Role Switcher pill visible** — point it out immediately: *"You can switch roles at any time using this button."*

1. **Admin (90 sec):** Switch to Admin via pill → create cycle → push shared goal to team → view escalation log → view animated analytics dashboard (let the chart animations play)
2. **Employee (90 sec):** Switch to Employee via pill (judges see the transition) → create a goal → show live weightage bar animating → show UoM selector sliding → submit for approval
3. **Manager (60 sec):** Switch to Manager via pill → pending approvals queue → approve a goal (card slides out) → do Q1 check-in → log comment in modal
4. **Admin (30 sec):** Switch back to Admin via pill → export Achievement Report CSV → show audit log
5. **Close:** Point to the switcher again — *"Any judge can try any role right now."*

---

## 11. Risk & Mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| Weightage validation complex edge cases | Medium | Write unit tests for `validations.ts` early; test with 0%, 100%, and boundary values |
| Supabase free tier rate limit during demo | Low | Pre-load all data; avoid heavy queries during live demo |
| Shared goal sync logic breaks | Medium | Isolate sync logic in one function; test with 3+ recipients |
| Quarter window enforcement confuses judges | Low | Add a visual "Current Active Quarter: Q1" banner on all pages |
| Live demo network issues | Low | Record backup video; have screenshots ready |
| Running out of time before bonus features | High | Complete all Must-Have features first; only start bonus after Phase 3 is done |
| Deployment fails at last minute | Medium | Deploy to Vercel from Day 1; redeploy frequently; never deploy for first time on demo day |
| Framer Motion animation jank on low-end demo hardware | Low | Test on a mid-range laptop; add `reducedMotion` check via `useReducedMotion()` hook; disable heavy animations if needed |
| Demo Role Switcher missing from a page | Medium | Add switcher to root layout (not individual pages) — it renders once and is always present; verify on every route before demo |
| Role cookie not persisting after page reload | Low | Test cookie persistence; fallback to `localStorage` if Supabase middleware strips cookies unexpectedly |

---

## Quick Reference — Key Formulas

```
Numeric (Min) — Higher is better:   Score = (Actual ÷ Target) × 100
Numeric (Max) — Lower is better:    Score = (Target ÷ Actual) × 100
Timeline — Date completion:          Score = Completion ≤ Deadline ? 100 : 0
Zero — Zero = success:               Score = Actual === 0 ? 100 : 0
```

## Quick Reference — Core Framer Motion Patterns

```tsx
// Page enter (wrap every page)
<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

// Staggered list
<motion.ul variants={stagger} initial="initial" animate="animate">
  {items.map(i => <motion.li key={i.id} variants={fadeUp} />)}
</motion.ul>

// Card hover
<motion.div whileHover={{ y: -2, scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={{ type: 'spring', stiffness: 400 }}>

// AnimatePresence exit (approval cards, modals)
<AnimatePresence>
  {visible && <motion.div exit={{ opacity: 0, x: 60 }} />}
</AnimatePresence>

// Spring progress bar
<motion.div animate={{ width: `${score}%` }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} />

// Animated counter
const count = useMotionValue(0);
const rounded = useTransform(count, v => Math.round(v));
useEffect(() => animate(count, targetValue, { duration: 0.8, ease: 'easeOut' }), [targetValue]);
```

---

*Good luck — animate boldly, switch roles confidently, demo with conviction! 🚀*
