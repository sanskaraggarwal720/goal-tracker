-- ==============================================================================
-- AtomQuest Hackathon 1.0 - Seed Data for Goal Setting Portal
-- ==============================================================================

-- 0. PRE-REQUISITE: Drop the strict auth.users foreign key constraint for demo purposes.
-- This allows us to insert mock users without needing to create real auth accounts first.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 1. Create Users
INSERT INTO public.users (id, name, email, role, department) VALUES
('11111111-1111-1111-1111-111111111111', 'Priya Sharma', 'priya@demo.com', 'admin', 'HR'),
('22222222-2222-2222-2222-222222222222', 'Rajesh Mehta', 'rajesh@demo.com', 'manager', 'Sales'),
('33333333-3333-3333-3333-333333333333', 'Anjali Gupta', 'anjali@demo.com', 'manager', 'Operations'),
('44444444-4444-4444-4444-444444444444', 'Arjun Singh', 'arjun@demo.com', 'employee', 'Sales'),
('55555555-5555-5555-5555-555555555555', 'Neha Patel', 'neha@demo.com', 'employee', 'Sales'),
('66666666-6666-6666-6666-666666666666', 'Vikram Rao', 'vikram@demo.com', 'employee', 'Sales'),
('77777777-7777-7777-7777-777777777777', 'Shreya Desai', 'shreya@demo.com', 'employee', 'Operations'),
('88888888-8888-8888-8888-888888888888', 'Karan Joshi', 'karan@demo.com', 'employee', 'Operations');

-- Update Manager assignments
-- Assign Arjun, Neha, and Vikram to Rajesh (Sales)
UPDATE public.users 
SET manager_id = '22222222-2222-2222-2222-222222222222' 
WHERE id IN ('44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', '66666666-6666-6666-6666-666666666666');

-- Assign Shreya and Karan to Anjali (Operations)
UPDATE public.users 
SET manager_id = '33333333-3333-3333-3333-333333333333' 
WHERE id IN ('77777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888');


-- 2. Thrust Areas
INSERT INTO public.thrust_areas (id, name, created_by) VALUES
('aa000000-0000-0000-0000-000000000001', 'Revenue', '11111111-1111-1111-1111-111111111111'),
('aa000000-0000-0000-0000-000000000002', 'Operations', '11111111-1111-1111-1111-111111111111'),
('aa000000-0000-0000-0000-000000000003', 'Technology', '11111111-1111-1111-1111-111111111111'),
('aa000000-0000-0000-0000-000000000004', 'Customer', '11111111-1111-1111-1111-111111111111'),
('aa000000-0000-0000-0000-000000000005', 'Safety', '11111111-1111-1111-1111-111111111111');


-- 3. Goal Cycles
INSERT INTO public.goal_cycles (id, name, start_date, end_date, is_active, created_by) VALUES
('cc000000-0000-0000-0000-000000000001', 'FY 2025-26', '2025-04-01', '2026-03-31', TRUE, '11111111-1111-1111-1111-111111111111');


-- 4. Goals for Arjun Singh (Employee)
INSERT INTO public.goals (id, cycle_id, employee_id, thrust_area_id, title, description, uom, target, weightage, status) VALUES
('dd000000-0000-0000-0000-000000000001', 'cc000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'aa000000-0000-0000-0000-000000000001', 'Achieve monthly sales revenue of ₹50L', 'Increase regional sales output.', 'numeric_min', 50, 30, 'approved'),
('dd000000-0000-0000-0000-000000000002', 'cc000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'aa000000-0000-0000-0000-000000000002', 'Reduce customer onboarding TAT to 3 days', 'Streamline CRM pipeline.', 'numeric_max', 3, 25, 'approved'),
('dd000000-0000-0000-0000-000000000003', 'cc000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'aa000000-0000-0000-0000-000000000003', 'Complete CRM migration by Sep 30', 'Move all legacy accounts.', 'timeline', NULL, 20, 'approved'),
('dd000000-0000-0000-0000-000000000004', 'cc000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'aa000000-0000-0000-0000-000000000005', 'Zero safety incidents in the quarter', 'Strict compliance on site.', 'zero', 0, 15, 'approved'),
('dd000000-0000-0000-0000-000000000005', 'cc000000-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'aa000000-0000-0000-0000-000000000004', 'Achieve NPS score of 75+', 'Customer satisfaction scores.', 'numeric_min', 75, 10, 'approved');

-- Update dates for timeline goals
UPDATE public.goals SET target_date = '2025-09-30' WHERE id = 'dd000000-0000-0000-0000-000000000003';


-- 5. Achievements for Arjun (Q1 & Q2 demo)
INSERT INTO public.achievements (goal_id, quarter, actual, status) VALUES
-- Q1 Actuals
('dd000000-0000-0000-0000-000000000001', 'Q1', 48, 'on_track'),
('dd000000-0000-0000-0000-000000000002', 'Q1', 4.5, 'on_track'),
('dd000000-0000-0000-0000-000000000004', 'Q1', 0, 'completed'),
('dd000000-0000-0000-0000-000000000005', 'Q1', 65, 'not_started'),

-- Q2 Actuals
('dd000000-0000-0000-0000-000000000001', 'Q2', 52, 'completed'),
('dd000000-0000-0000-0000-000000000002', 'Q2', 3.5, 'on_track'),
('dd000000-0000-0000-0000-000000000004', 'Q2', 0, 'completed');

-- Timeline actuals
UPDATE public.achievements SET actual_date = '2025-09-15' WHERE goal_id = 'dd000000-0000-0000-0000-000000000003';


-- 6. Manager Check-ins (Rajesh Mehta checking Arjun Singh)
INSERT INTO public.checkins (goal_id, manager_id, quarter, comment) VALUES
('dd000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'Q1', 'Good momentum, keep pushing the pipeline.'),
('dd000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'Q1', 'TAT is still a bit high. Let us review the blockers next week.'),
('dd000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 'Q1', 'Excellent safety record.');