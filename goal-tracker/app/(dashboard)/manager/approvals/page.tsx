import { fetchManagerApprovals } from '@/app/actions/goals';
import { ApprovalsClient } from './ApprovalsClient';

export default async function ManagerApprovalsPage() {
  const { result: teamData, debug } = await fetchManagerApprovals();

  return <ApprovalsClient teamData={teamData} debug={debug} />;
}
