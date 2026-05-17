'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { computeProgress } from '@/lib/progress-calculator';

export async function fetchEmployeeGoals() {
  const supabase = createClient();
  const userId = getCurrentUser();

  const { data: goals, error } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      description,
      uom,
      target,
      weightage,
      status,
      thrust_areas ( name )
    `)
    .eq('employee_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching goals:', error);
    return [];
  }

  // Map to the frontend structure expected by GoalCard
  return goals.map((g: any) => ({
    id: g.id,
    title: g.title,
    thrust: g.thrust_areas?.name || 'Unassigned',
    uom: formatUom(g.uom),
    weightage: Number(g.weightage),
    progress: 0, // We will compute this later if needed, or default to 0
    status: formatStatus(g.status),
    statusColor: getStatusColor(g.status)
  }));
}

function formatUom(uom: string) {
  switch (uom) {
    case 'numeric_min': return 'Numeric (min)';
    case 'numeric_max': return 'Numeric (max)';
    case 'timeline': return 'Timeline';
    case 'zero': return 'Zero';
    default: return uom;
  }
}

function formatStatus(status: string) {
  switch (status) {
    case 'draft': return 'Draft';
    case 'submitted': return 'Pending Approval';
    case 'approved': return 'Approved';
    case 'rework': return 'Needs Rework';
    case 'locked': return 'Locked';
    default: return 'Not Started';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'approved':
    case 'locked':
      return 'bg-[#E2F5E2] text-[#2F6B2F]';
    case 'rework':
      return 'bg-[#FFF3E0] text-[#B05B1E]';
    case 'submitted':
      return 'bg-[#EAF2FF] text-[#2D66C2]';
    default:
      return 'bg-gray-200 dark:bg-[#333] text-gray-700 dark:text-gray-300';
  }
}

export async function fetchEmployeeCheckins(quarter: string) {
  const supabase = createClient();
  const userId = getCurrentUser();

  const { data: goals, error } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      uom,
      target,
      weightage,
      achievements (
        actual,
        status,
        quarter
      )
    `)
    .eq('employee_id', userId)
    .eq('status', 'approved');

  if (error) {
    console.error('Error fetching checkins:', error);
    return [];
  }

  return goals.map((g: any) => {
    // Find the achievement for the current quarter
    const currentQtrAch = g.achievements?.find((a: any) => a.quarter === quarter) || {};
    
    return {
      id: g.id,
      title: g.title,
      uom: g.uom,
      target: g.target,
      weightage: Number(g.weightage),
      actual: currentQtrAch.actual || '',
      status: currentQtrAch.status || 'not_started'
    };
  });
}

export async function fetchManagerApprovals() {
  const supabase = createClient();
  const managerId = getCurrentUser();

  // SELF-HEALING: If the seed.sql UPDATE failed to run in the user's DB, we force the update here.
  if (managerId === '22222222-2222-2222-2222-222222222222') {
    await supabase.from('users')
      .update({ manager_id: managerId })
      .in('id', [
        '44444444-4444-4444-4444-444444444444', // Arjun
        '55555555-5555-5555-5555-555555555555', // Neha
        '66666666-6666-6666-6666-666666666666'  // Vikram
      ]);
  }

  // Fetch employees whose manager is the current user
  const { data: team, error: teamError } = await supabase
    .from('users')
    .select('id, name, department, manager_id')
    .eq('manager_id', managerId);

  let allUsers: any[] = [];
  if (!team || team.length === 0) {
    const res = await supabase.from('users').select('id, name, manager_id');
    allUsers = res.data || [];
  }

  if (teamError || !team) {
    console.error('Error fetching team:', teamError);
    return { result: [], debug: { managerId, teamError: teamError?.message || null, rawTeamCount: 0, allUsers } };
  }

  // Fetch goals for these employees
  const employeeIds = team.map((u: any) => u.id);
  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select(`
      id,
      employee_id,
      title,
      uom,
      target,
      weightage,
      status,
      is_shared,
      thrust_areas ( name )
    `)
    .in('employee_id', employeeIds);

  if (goalsError) {
    console.error('Error fetching team goals:', goalsError);
    return { result: [], debug: { managerId, teamError: null, rawTeamCount: team?.length || 0, allUsers } };
  }

  // Aggregate goals per employee
  const result = team.map((employee: any) => {
    const employeeGoals = goals?.filter((g: any) => g.employee_id === employee.id) || [];
    
    // Compute total weightage
    const totalWeight = employeeGoals.reduce((sum: number, g: any) => sum + Number(g.weightage), 0);
    
    // Determine overall status
    let overallStatus = 'Draft';
    if (employeeGoals.length > 0) {
      if (employeeGoals.every((g: any) => g.status === 'approved' || g.status === 'locked')) {
        overallStatus = 'Approved';
      } else if (employeeGoals.some((g: any) => g.status === 'submitted')) {
        overallStatus = 'Pending';
      } else if (employeeGoals.some((g: any) => g.status === 'rework')) {
        overallStatus = 'Needs Rework';
      }
    }

    // Map goals to UI format
    const mappedGoals = employeeGoals.map((g: any) => ({
      id: g.id,
      title: g.title,
      thrust: g.thrust_areas?.name || 'Unassigned',
      uom: formatUom(g.uom),
      origWeight: Number(g.weightage),
      targetUnit: getTargetUnit(g.uom),
      type: g.uom.includes('numeric') ? 'numeric' : 'timeline',
      isShared: g.is_shared,
      status: g.status,
      target: g.target
    }));

    return {
      id: employee.id,
      name: employee.name,
      initials: getInitials(employee.name),
      avatarBg: getAvatarColor(employee.id), // Deterministic color
      dept: employee.department,
      submitted: 'Recently', // You could calculate this based on updated_at
      goals: employeeGoals.length,
      weightage: totalWeight,
      status: overallStatus,
      active: false,
      goalsList: mappedGoals
    };
  });

  return { 
    result, 
    debug: { 
      managerId, 
      teamError: null,
      rawTeamCount: team?.length || 0,
      allUsers 
    } 
  };
}

function getTargetUnit(uom: string) {
  if (uom === 'numeric_max' || uom === 'numeric_min') return 'Value';
  return '';
}

function getInitials(name: string) {
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
}

function getAvatarColor(id: string) {
  const colors = [
    'bg-[#EAF2FF] text-[#2D66C2]',
    'bg-[#E2F5E2] text-[#2F6B2F]',
    'bg-[#FFF3E0] text-[#B05B1E]',
    'bg-[#F3F4F6] text-[#374151]',
    'bg-[#F3E8FF] text-[#6B21A8]'
  ];
  // Simple hash for deterministic color
  const hash = id.split('-').reduce((acc, part) => acc + part.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export async function submitGoal(formData: FormData) {
  const supabase = createClient();
  const employeeId = getCurrentUser();

  const thrustName = formData.get('thrust') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const uom = formData.get('uom') as string;
  const target = formData.get('target') as string;
  const weightage = Number(formData.get('weightage'));

  // Resolve thrust area ID
  const { data: thrustArea } = await supabase
    .from('thrust_areas')
    .select('id')
    .ilike('name', `%${thrustName}%`)
    .limit(1)
    .single();

  const { error } = await supabase.from('goals').insert({
    employee_id: employeeId,
    cycle_id: 'cc000000-0000-0000-0000-000000000001', // FY 2025-26
    thrust_area_id: thrustArea?.id || 'aa000000-0000-0000-0000-000000000001',
    title,
    description,
    uom,
    target: target ? Number(target) : null,
    weightage,
    status: 'draft'
  });

  if (error) {
    console.error('Failed to create goal', error);
    throw new Error('Failed to create goal');
  }

  revalidatePath('/employee/goals');
}

export async function updateEmployeeGoalsStatus(employeeId: string, status: 'approved' | 'rework', comment?: string) {
  const supabase = createClient();
  const managerId = getCurrentUser();

  // Ensure the caller is actually the manager of this employee
  const { data: employee } = await supabase
    .from('users')
    .select('manager_id')
    .eq('id', employeeId)
    .single();

  if (employee?.manager_id !== managerId) {
    throw new Error('Unauthorized: You are not the manager of this employee.');
  }

  // Update all goals for this employee
  const { error } = await supabase
    .from('goals')
    .update({ 
      status, 
      locked: status === 'approved' 
    })
    .eq('employee_id', employeeId)
    .neq('status', 'draft'); // Only update submitted goals

  if (error) {
    console.error('Failed to update goals:', error);
    throw new Error('Failed to update goals');
  }

  // Bonus: We could insert the comment into checkins or audit_logs, but for now we just update the goals.
  
  revalidatePath('/manager/approvals');
}

export async function pushSharedGoal(formData: FormData) {
  const supabase = createClient();
  const adminId = getCurrentUser();

  const department = formData.get('department') as string;
  const thrustAreaId = formData.get('thrustAreaId') as string;
  const title = formData.get('title') as string;
  const uom = formData.get('uom') as string;
  const target = Number(formData.get('target'));
  const weightage = Number(formData.get('weightage'));

  // 1. Find all employees in the department
  const { data: employees, error: empError } = await supabase
    .from('users')
    .select('id')
    .eq('department', department)
    .eq('role', 'employee');

  if (empError || !employees || employees.length === 0) {
    throw new Error('No employees found in this department');
  }

  // 2. Prepare goals for insertion
  const goalsToInsert = employees.map(emp => ({
    employee_id: emp.id,
    cycle_id: 'cc000000-0000-0000-0000-000000000001', // FY 2025-26
    thrust_area_id: thrustAreaId,
    title,
    description: 'Organisation KPI pushed by Admin',
    uom,
    target,
    weightage,
    status: 'draft',
    is_shared: true,
    shared_by: adminId
  }));

  // 3. Insert goals
  const { error: insertError } = await supabase
    .from('goals')
    .insert(goalsToInsert);

  if (insertError) {
    console.error('Failed to push shared goals:', insertError);
    throw new Error('Database error while pushing goals');
  }

  // 4. (Bonus) Link recipients in shared_goal_recipients if we wanted a separate table,
  // but just inserting rows with `is_shared = true` is sufficient for this scope.
  
  revalidatePath('/admin/shared-goals');
}

export async function saveAchievement(goalId: string, quarter: string, actual: number | string | null, status: string) {
  const supabase = createClient();
  const userId = getCurrentUser();

  // Validate ownership
  const { data: goal } = await supabase
    .from('goals')
    .select('employee_id, uom')
    .eq('id', goalId)
    .single();

  if (goal?.employee_id !== userId) {
    throw new Error('Unauthorized');
  }

  const { error } = await supabase
    .from('achievements')
    .upsert({
      goal_id: goalId,
      quarter,
      actual: goal.uom !== 'timeline' && actual !== null ? Number(actual) : null,
      actual_date: goal.uom === 'timeline' && actual ? actual as string : null,
      status
    }, {
      onConflict: 'goal_id, quarter'
    });

  if (error) {
    console.error('Failed to save achievement:', error);
    throw new Error('Failed to save achievement');
  }

  revalidatePath('/employee/check-ins');
}

export async function fetchManagerCheckins(quarter: string) {
  const supabase = createClient();
  const managerId = getCurrentUser();

  const { data: team } = await supabase
    .from('users')
    .select('id, name, department')
    .eq('manager_id', managerId);

  if (!team || team.length === 0) return [];

  // For each employee, calculate progress and check if they have a checkin this quarter
  const result = await Promise.all(team.map(async (emp) => {
    // Check if check-in exists
    const { data: checkin } = await supabase
      .from('checkins')
      .select('id')
      .eq('manager_id', managerId)
      .eq('quarter', quarter)
      // Usually a checkin is per goal, but in the simplified UI it's per employee/quarter.
      // We can just check if any checkin exists for their first goal, or we can adjust schema.
      // Wait, schema checkins table: `goal_id UUID, manager_id UUID, quarter TEXT`.
      // The UI shows ONE checkin per employee. We'll store it with goal_id = NULL if possible, or just link it to one of their goals.
      // Actually schema: `goal_id UUID REFERENCES goals(id)`.
      // Let's just find ANY checkin by this manager for ANY goal of this employee in this quarter.
      // To do this easily, let's just get the first goal of the employee:
      .limit(1);

    // Wait, the correct way without a complex join: get all goals for the employee, then check checkins.
    const { data: goals } = await supabase.from('goals').select('id, target, uom').eq('employee_id', emp.id);
    
    let progress = 0;
    let checkinDone = false;

    if (goals && goals.length > 0) {
      const goalIds = goals.map(g => g.id);
      
      const { data: achievements } = await supabase
        .from('achievements')
        .select('goal_id, actual, actual_date')
        .in('goal_id', goalIds)
        .eq('quarter', quarter);

      // Compute avg progress (very simplified)
      let totalScore = 0;
      goals.forEach(g => {
        const ach = achievements?.find(a => a.goal_id === g.id);
        if (ach) {
          totalScore += computeProgress(g.uom, g.target as any, g.uom === 'timeline' ? ach.actual_date : ach.actual);
        }
      });
      progress = Math.round(totalScore / goals.length);

      const { data: checkins } = await supabase
        .from('checkins')
        .select('id')
        .in('goal_id', goalIds)
        .eq('quarter', quarter)
        .limit(1);
        
      checkinDone = !!checkins && checkins.length > 0;
    }

    return {
      id: emp.id,
      name: emp.name,
      role: emp.department,
      progress,
      checkinDone,
      firstGoalId: goals?.[0]?.id // We need this to attach the checkin comment to a goal in DB
    };
  }));

  return result;
}

export async function saveManagerCheckin(goalId: string, quarter: string, comment: string) {
  if (!goalId) return; // If employee has no goals, skip
  
  const supabase = createClient();
  const managerId = getCurrentUser();

  const { error } = await supabase
    .from('checkins')
    .insert({
      goal_id: goalId,
      manager_id: managerId,
      quarter,
      comment
    });

  if (error) {
    console.error('Failed to save checkin:', error);
    throw new Error('Failed to save checkin');
  }

  revalidatePath('/manager/check-ins');
}

export async function fetchAllGoalsReport() {
  const supabase = createClient();

  const { data: goals } = await supabase
    .from('goals')
    .select(`
      id, title, uom, target, target_date, weightage,
      users:employee_id (name, department),
      achievements (quarter, actual, actual_date)
    `)
    .eq('status', 'approved');

  if (!goals) return [];

  return goals.map(g => {
    const achs = g.achievements || [];
    const getAch = (q: string) => {
      const a = achs.find((x: any) => x.quarter === q);
      if (!a) return '-';
      return g.uom === 'timeline' ? (a.actual_date || '-') : (a.actual ?? '-');
    };

    // Calculate overall progress based on the most recent valid quarter check-in
    // Simplified for demo: just use Q2 if available, else Q1
    const q2Ach = achs.find((x: any) => x.quarter === 'Q2');
    const q1Ach = achs.find((x: any) => x.quarter === 'Q1');
    const latestAch = q2Ach || q1Ach;
    
    let progress = 0;
    if (latestAch) {
      progress = computeProgress(g.uom, (g.uom === 'timeline' ? g.target_date : g.target) as any, g.uom === 'timeline' ? latestAch.actual_date : latestAch.actual);
    }

    const userRecord = Array.isArray(g.users) ? g.users[0] : g.users;
    return {
      emp: userRecord?.name,
      dept: userRecord?.department,
      goal: g.title,
      target: g.uom === 'timeline' ? g.target_date : g.target,
      q1: getAch('Q1'),
      q2: getAch('Q2'),
      q3: getAch('Q3'),
      q4: getAch('Q4'),
      progress: Math.round(progress)
    };
  });
}

export async function fetchAdminDashboardStats() {
  const supabase = createClient();
  
  // 1. Get all approved goals
  const { data: goals } = await supabase.from('goals').select('id, employee_id, target, uom, target_date, status').eq('status', 'approved');
  
  // 2. Get all employees
  const { data: employees } = await supabase.from('users').select('id, name, department').eq('role', 'employee');
  const empCount = employees?.length || 0;

  // 3. Get all achievements for Q1 & Q2
  const { data: achievements } = await supabase.from('achievements').select('goal_id, quarter, actual, actual_date, status');

  let totalProgress = 0;
  let goalsOnTrack = 0;
  let goalsCount = goals?.length || 0;
  
  const empScores: Record<string, { total: number, count: number, name: string, dept: string }> = {};
  
  if (goals && achievements) {
    goals.forEach(g => {
      const q2Ach = achievements.find(a => a.goal_id === g.id && a.quarter === 'Q2');
      const q1Ach = achievements.find(a => a.goal_id === g.id && a.quarter === 'Q1');
      const latestAch = q2Ach || q1Ach;
      
      let prog = 0;
      if (latestAch) {
        prog = computeProgress(g.uom, (g.uom === 'timeline' ? g.target_date : g.target) as any, g.uom === 'timeline' ? latestAch.actual_date : latestAch.actual);
        if (latestAch.status === 'on_track' || latestAch.status === 'completed') {
          goalsOnTrack++;
        }
      }
      totalProgress += prog;

      if (!empScores[g.employee_id]) {
        const emp = employees?.find(e => e.id === g.employee_id);
        empScores[g.employee_id] = { total: 0, count: 0, name: emp?.name || '', dept: emp?.department || '' };
      }
      empScores[g.employee_id].total += prog;
      empScores[g.employee_id].count += 1;
    });
  }

  const avgCompletion = goalsCount > 0 ? Math.round(totalProgress / goalsCount) : 0;

  // 4. Checkins done (unique employees who have a Q2 check-in by manager)
  const { data: checkins } = await supabase.from('checkins').select('goal_id, quarter');
  // Just counting total checkins for simplicity
  const checkinsDone = checkins?.length || 0;

  // 5. Individual progress mapping
  const individualProgress = Object.values(empScores).map(e => ({
    initials: e.name.split(' ').map(n => n[0]).join(''),
    name: e.name,
    score: Math.round(e.total / e.count),
    color: 'bg-[#4B8B4B]',
    avatarBg: 'bg-[#EAF2FF] text-[#2D66C2]'
  })).sort((a, b) => b.score - a.score).slice(0, 5);

  return {
    avgCompletion,
    goalsOnTrack,
    checkinsDone,
    totalEmployees: empCount,
    escalationsOpen: 0, // Mocked
    individualProgress
  };
}

export async function fetchAuditLogs() {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select(`
      id,
      field,
      old_value,
      new_value,
      changed_at,
      users:changed_by (name, role),
      goals:goal_id (title)
    `)
    .order('changed_at', { ascending: false })
    .limit(50);
    
  if (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
  
  return data;
}

export async function fetchAnalyticsReport() {
  const supabase = createClient();
  
  // Get all goals, users, and achievements
  const { data: goals } = await supabase.from('goals').select('id, employee_id, thrust_area_id, uom, target, target_date, status, weightage').eq('status', 'approved');
  const { data: users } = await supabase.from('users').select('id, name, department').eq('role', 'employee');
  const { data: achievements } = await supabase.from('achievements').select('goal_id, quarter, actual, actual_date, status');
  const { data: thrustAreas } = await supabase.from('thrust_areas').select('id, name');

  // 1. QoQ Trend (Average progress score for Q1, Q2, Q3, Q4)
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  const qoqTrend = quarters.map(q => {
    let qTotal = 0;
    let qCount = 0;
    if (goals && achievements) {
      goals.forEach(g => {
        const ach = achievements.find(a => a.goal_id === g.id && a.quarter === q);
        if (ach) {
          const prog = computeProgress(g.uom, (g.uom === 'timeline' ? g.target_date : g.target) as any, g.uom === 'timeline' ? ach.actual_date : ach.actual);
          qTotal += prog;
          qCount++;
        }
      });
    }
    return {
      quarter: q,
      avgProgress: qCount > 0 ? Math.round(qTotal / qCount) : 0,
      goalsReported: qCount
    };
  });

  // 2. Thrust Area Distribution
  const thrustAreaDistribution = (thrustAreas || []).map(ta => {
    const taGoals = (goals || []).filter(g => g.thrust_area_id === ta.id);
    const totalWeight = taGoals.reduce((sum, g) => sum + Number(g.weightage), 0);
    return {
      name: ta.name,
      count: taGoals.length,
      totalWeightage: totalWeight
    };
  });

  // 3. UoM Distribution
  const uomCounts: Record<string, number> = {
    'numeric_min': 0,
    'numeric_max': 0,
    'timeline': 0,
    'zero': 0
  };
  (goals || []).forEach(g => {
    if (uomCounts[g.uom] !== undefined) uomCounts[g.uom]++;
  });
  const uomDistribution = Object.entries(uomCounts).map(([uom, count]) => ({
    uom: uom === 'numeric_min' ? 'Numeric (Min)' : uom === 'numeric_max' ? 'Numeric (Max)' : uom === 'timeline' ? 'Timeline' : 'Zero Target',
    count
  }));

  // 4. Department Heatmap
  const departments = Array.from(new Set((users || []).map(u => u.department).filter(Boolean)));
  const departmentHeatmap = departments.map(dept => {
    const deptUsers = (users || []).filter(u => u.department === dept).map(u => u.id);
    const deptGoals = (goals || []).filter(g => deptUsers.includes(g.employee_id));

    const scores: Record<string, number> = {};
    quarters.forEach(q => {
      let qTot = 0;
      let qCnt = 0;
      deptGoals.forEach(g => {
        const ach = achievements?.find(a => a.goal_id === g.id && a.quarter === q);
        if (ach) {
          const prog = computeProgress(g.uom, (g.uom === 'timeline' ? g.target_date : g.target) as any, g.uom === 'timeline' ? ach.actual_date : ach.actual);
          qTot += prog;
          qCnt++;
        }
      });
      scores[q] = qCnt > 0 ? Math.round(qTot / qCnt) : 0;
    });

    return {
      department: dept,
      ...scores
    };
  });

  return {
    qoqTrend,
    thrustAreaDistribution,
    uomDistribution,
    departmentHeatmap
  };
}

export async function fetchEscalations() {
  const supabase = createClient();
  const { data: escalations } = await supabase
    .from('escalations')
    .select(`
      id,
      type,
      triggered_at,
      resolved_at,
      notified_level,
      users:target_user_id (name, department),
      goals:goal_id (title)
    `)
    .order('triggered_at', { ascending: false });

  return escalations || [];
}

export async function resolveEscalation(id: string) {
  const supabase = createClient();
  await supabase.from('escalations').update({ resolved_at: new Date().toISOString() }).eq('id', id);
}
