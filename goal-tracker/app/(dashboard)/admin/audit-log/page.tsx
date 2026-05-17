import { fetchAuditLogs } from '@/app/actions/goals';

export default async function AuditLogsPage() {
  const logs = await fetchAuditLogs();
  
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--text))]">System Audit Trail</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Review organizational data mutations and security events.</p>
      </div>

      <div className="bg-[rgb(var(--card-bg))] rounded-xl shadow-sm border border-[rgb(var(--border))] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[rgb(var(--sidebar-bg))] border-b border-[rgb(var(--border))] text-gray-500 dark:text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Goal Context</th>
              <th className="px-4 py-3">Field Changed</th>
              <th className="px-4 py-3">Before</th>
              <th className="px-4 py-3">After</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border))]">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-colors">
                <td className="px-4 py-4 text-gray-500">{new Date(log.changed_at).toLocaleString()}</td>
                <td className="px-4 py-4 font-medium text-[rgb(var(--text))]">
                  {log.users?.name} <span className="text-xs text-gray-400">({log.users?.role})</span>
                </td>
                <td className="px-4 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate" title={log.goals?.title}>
                  {log.goals?.title || '-'}
                </td>
                <td className="px-4 py-4 font-bold text-orange-500">{log.field}</td>
                <td className="px-4 py-4 text-red-500 line-through bg-red-50/50 dark:bg-red-900/10">{log.old_value || '-'}</td>
                <td className="px-4 py-4 text-green-600 dark:text-green-400 font-medium bg-green-50/50 dark:bg-green-900/10">{log.new_value || '-'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  No audit logs recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
