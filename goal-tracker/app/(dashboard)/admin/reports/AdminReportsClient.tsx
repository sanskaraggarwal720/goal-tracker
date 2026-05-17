'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import React from 'react';

export function AdminReportsClient({ reports }: { reports: any[] }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const groupedReports = useMemo(() => {
    return reports.reduce((acc: any, curr: any) => {
      if (!acc[curr.emp]) acc[curr.emp] = [];
      acc[curr.emp].push(curr);
      return acc;
    }, {});
  }, [reports]);
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
            {Object.entries(groupedReports).map(([empName, employeeGoals]: [string, any]) => {
              const isExpanded = expanded[empName];
              
              // Calculate average progress for the employee
              const avgProgress = Math.round(employeeGoals.reduce((sum: number, g: any) => sum + g.progress, 0) / employeeGoals.length);

              return (
                <React.Fragment key={empName}>
                  <tr 
                    onClick={() => setExpanded(prev => ({ ...prev, [empName]: !prev[empName] }))}
                    className="hover:bg-gray-50 dark:hover:bg-[#1E1E1E] transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-4 font-bold text-[rgb(var(--text))] flex items-center gap-3">
                      <span className="text-gray-400 group-hover:text-blue-500 transition-colors w-4 inline-block text-center">
                        {isExpanded ? '▼' : '▶'}
                      </span>
                      {empName}
                    </td>
                    <td className="px-4 py-4 text-gray-500 dark:text-gray-400 font-medium">{employeeGoals[0].dept}</td>
                    <td className="px-4 py-4 text-gray-500 text-sm">
                      {employeeGoals.length} goal{employeeGoals.length !== 1 ? 's' : ''}
                    </td>
                    <td className="px-4 py-4 text-gray-400">—</td>
                    <td className="px-4 py-4 text-gray-400">—</td>
                    <td className="px-4 py-4 text-gray-400">—</td>
                    <td className="px-4 py-4 text-gray-400">—</td>
                    <td className="px-4 py-4 text-gray-400">—</td>
                    <td className="px-4 py-4 font-bold text-blue-600 dark:text-[#7DAAEE]">{avgProgress}% avg</td>
                  </tr>

                  <AnimatePresence>
                    {isExpanded && employeeGoals.map((row: any, i: number) => (
                      <motion.tr 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        key={`${empName}-${i}`} 
                        className="bg-gray-50/50 dark:bg-[#161616] transition-colors"
                      >
                        <td className="px-4 py-3 pl-12 border-l-2 border-blue-500/30 text-gray-400 text-sm">↳</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-400"></td>
                        <td className="px-4 py-3 text-[rgb(var(--text))] max-w-xs truncate font-medium text-sm" title={row.goal}>{row.goal}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 font-medium text-sm">{row.target}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{row.q1}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{row.q2}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{row.q3}</td>
                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300 text-sm">{row.q4}</td>
                        <td className="px-4 py-3 font-bold text-blue-600/80 dark:text-[#7DAAEE]/80 text-sm">{row.progress}%</td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
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
