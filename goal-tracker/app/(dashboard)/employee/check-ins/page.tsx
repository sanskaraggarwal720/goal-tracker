import { fetchEmployeeCheckins } from '@/app/actions/goals';
import { CheckinsClient } from './CheckinsClient';

import { getActiveQuarter } from '@/lib/progress-calculator';

export default async function EmployeeCheckinsPage() {
  const currentQuarter = getActiveQuarter() || 'Q2'; // Fallback to Q2 for demo if outside window
  const checkins = await fetchEmployeeCheckins(currentQuarter);

  return <CheckinsClient checkins={checkins} quarter={currentQuarter} />;
}
