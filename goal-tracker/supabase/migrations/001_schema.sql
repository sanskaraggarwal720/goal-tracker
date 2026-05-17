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
