import { fetchManagerCheckins } from '@/app/actions/goals';
import { getActiveQuarter } from '@/lib/progress-calculator';
import { ManagerCheckinsClient } from './ManagerCheckinsClient';

export default async function ManagerCheckinsPage() {
  const currentQuarter = getActiveQuarter() || 'Q2'; // Fallback to Q2
  const team = await fetchManagerCheckins(currentQuarter);

  return <ManagerCheckinsClient initialTeam={team} currentQuarter={currentQuarter} />;
}
