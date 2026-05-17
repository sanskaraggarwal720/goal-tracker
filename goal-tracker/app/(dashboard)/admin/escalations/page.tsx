import { fetchEscalations } from '@/app/actions/goals';
import { EscalationsClient } from './EscalationsClient';

export default async function EscalationsPage() {
  const escalations = await fetchEscalations();
  return <EscalationsClient initialEscalations={escalations} />;
}
