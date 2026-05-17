import { fetchAnalyticsReport } from '@/app/actions/goals';
import { AnalyticsClient } from './AnalyticsClient';

export default async function AnalyticsPage() {
  const data = await fetchAnalyticsReport();
  return <AnalyticsClient data={data} />;
}
