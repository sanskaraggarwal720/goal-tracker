import { fetchAdminDashboardStats } from '@/app/actions/goals';
import { AdminDashboardClient } from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const stats = await fetchAdminDashboardStats();
  return <AdminDashboardClient stats={stats} />;
}
