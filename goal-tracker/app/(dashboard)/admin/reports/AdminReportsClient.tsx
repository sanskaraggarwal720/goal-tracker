'use client';

export function AdminReportsClient({ reports }: { reports: any[] }) {
  const handleExport = () => {
    const headers = ['Employee', 'Department', 'Goal', 'Target', 'Q1 Actual', 'Q2 Actual', 'Q3 Actual', 'Q4 Actual', 'Progress %'];
    const rows = reports.map(d => [d.emp, d.dept, d.goal, d.target, d.q1, d.q2, d.q3, d.q4, d.progress]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'achievement_report.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Achievement Reports</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Export organization-wide goal progress.</p>
        </div>
        <button onClick={handleExport} className="bg-[rgb(var(--text))] text-[rgb(var(--bg))] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
          <span className="text-lg">⬇</span> Export to CSV
        </button>
      </div>

      <div className="bg-[rgb(var(--card-bg))] rounded-xl shadow-sm border border-[rgb(var(--border))] overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[rgb(var(--sidebar-bg))] border-b border-[rgb(var(--border))] text-gray-500 dark:text-gray-400 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Employee</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Goal</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Q1</th>
              <th className="px-4 py-3">Q2</th>
              <th className="px-4 py-3">Q3</th>
              <th className="px-4 py-3">Q4</th>
              <th className="px-4 py-3">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgb(var(--border))]">
            {reports.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-colors">
                <td className="px-4 py-4 font-medium text-[rgb(var(--text))]">{row.emp}</td>
                <td className="px-4 py-4 text-gray-500 dark:text-gray-400">{row.dept}</td>
                <td className="px-4 py-4 text-[rgb(var(--text))] max-w-xs truncate font-medium" title={row.goal}>{row.goal}</td>
                <td className="px-4 py-4 text-gray-600 dark:text-gray-300 font-medium">{row.target}</td>
                <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{row.q1}</td>
                <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{row.q2}</td>
                <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{row.q3}</td>
                <td className="px-4 py-4 text-gray-600 dark:text-gray-300">{row.q4}</td>
                <td className="px-4 py-4 font-bold text-blue-600 dark:text-[#7DAAEE]">{row.progress}%</td>
              </tr>
            ))}
            {reports.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                  No approved goals found in the database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
