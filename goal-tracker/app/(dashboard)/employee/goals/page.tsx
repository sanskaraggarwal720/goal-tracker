import { fetchEmployeeGoals } from '@/app/actions/goals';
import { GoalDashboardClient } from './GoalDashboardClient';

export default async function EmployeeGoalsPage() {
  const goals = await fetchEmployeeGoals();

  return <GoalDashboardClient initialGoals={goals} />;
}
