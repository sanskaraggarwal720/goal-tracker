import { fetchAllGoalsReport } from '@/app/actions/goals';
import { AdminReportsClient } from './AdminReportsClient';

export default async function AdminReportsPage() {
  const reports = await fetchAllGoalsReport();
  return <AdminReportsClient reports={reports} />;
}
