'use client';
import { useState, useTransition } from 'react';
import { updateEmployeeGoalsStatus } from '@/app/actions/goals';
import { motion, AnimatePresence } from 'framer-motion';

export function ApprovalsClient({ teamData, debug }: { teamData: any[], debug: any }) {
  const [activeId, setActiveId] = useState(teamData[0]?.id || null);
  const [comment, setComment] = useState('');
  const [isPending, startTransition] = useTransition();

  const activeEmployee = teamData.find(e => e.id === activeId);

  const handleAction = (status: 'approved' | 'rework') => {
    if (!activeId) return;
    startTransition(async () => {
      await updateEmployeeGoalsStatus(activeId, status, comment);
      setComment('');
      // Optimistically move to the next employee
      const nextEmployee = teamData.find(e => e.id !== activeId && e.status !== 'Approved');
      if (nextEmployee) setActiveId(nextEmployee.id);
    });
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text))] mb-1">Pending approvals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{teamData.length} employees awaiting review • FY 2025-26</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#FFF3E0] text-[#B05B1E] px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
            <span>🕒</span> {teamData.filter(e => e.status === 'Pending').length} pending
          </div>
          <button className="w-10 h-10 rounded-full bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#333] transition-colors">
            <span className="text-gray-500">•••</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left Sidebar - Team Submissions */}
        <div className="w-80 bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-[rgb(var(--border))] flex justify-between items-center bg-[rgb(var(--sidebar-bg))]">
            <h2 className="font-bold text-sm text-[rgb(var(--text))]">Team submissions</h2>
            <span className="text-sm text-gray-500 font-medium">{teamData.filter(e => e.status === 'Approved').length} / {teamData.length}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {teamData.map(member => {
              const isActive = activeId === member.id;
              const isApproved = member.status === 'Approved';
              
              return (
                <button
                  key={member.id}
                  onClick={() => setActiveId(member.id)}
                  className={`w-full text-left p-4 border-b border-[rgb(var(--border))] flex items-center gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer
                    ${isActive ? 'bg-gray-50 dark:bg-[#1E1E1E]' : ''}
                  `}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isApproved ? 'bg-gray-200 dark:bg-[#333] text-gray-500' : member.avatarBg}`}>
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[rgb(var(--text))] truncate">{member.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{member.goals} goals • {member.weightage}% weightage</div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-xs font-semibold ${isApproved ? 'bg-[#E2F5E2] text-[#2F6B2F]' : member.status === 'Needs Rework' ? 'bg-[#FFF3E0] text-[#B05B1E]' : 'bg-[#EAF2FF] text-[#2D66C2]'}`}>
                    {member.status}
                  </div>
                </button>
              );
            })}
            {teamData.length === 0 && (
              <div className="p-6 text-center text-gray-500 text-sm">
                No direct reports found.
                <div className="mt-4 p-2 bg-red-500/10 text-red-500 rounded text-xs text-left overflow-hidden">
                  <b>Debug Info:</b><br/>
                  Manager ID: {debug.managerId}<br/>
                  Raw Count: {debug.rawTeamCount}<br/>
                  Error: {debug.teamError || 'None'}<br/><br/>
                  <b>All Users in DB:</b><br/>
                  <pre>{JSON.stringify(debug.allUsers, null, 2)}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Area - Detail */}
        <div className="flex-1 bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl flex flex-col overflow-hidden">
          {activeEmployee ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-6 border-b border-[rgb(var(--border))] flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[rgb(var(--text))] mb-1">{activeEmployee.name}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activeEmployee.dept} • {activeEmployee.submitted}</p>
                </div>
                <div className="px-3 py-1 bg-[#FFF3E0] text-[#B05B1E] rounded-full text-xs font-semibold">
                  {activeEmployee.status}
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="flex justify-between items-center p-4 bg-[rgb(var(--sidebar-bg))] rounded-lg border border-[rgb(var(--border))]">
                  <span className="font-bold text-sm text-[rgb(var(--text))]">Total weightage</span>
                  <span className={`font-bold text-sm ${activeEmployee.weightage === 100 ? 'text-green-600 dark:text-[#4B8B4B]' : 'text-red-500'}`}>
                    {activeEmployee.weightage}% {activeEmployee.weightage === 100 ? '✓' : '⚠️'}
                  </span>
                </div>

                <div className="space-y-4">
                  {activeEmployee.goalsList?.map((goal: any) => (
                    <div key={goal.id} className="p-5 border border-[rgb(var(--border))] rounded-xl bg-transparent transition-colors hover:bg-gray-50 dark:hover:bg-[#1E1E1E]">
                      <h3 className="font-bold text-[rgb(var(--text))] mb-3 pr-20">{goal.title}</h3>
                      
                      <div className="flex items-center gap-3 text-xs font-medium text-gray-600 dark:text-gray-400 mb-5">
                        <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#1E1E1E] border border-[rgb(var(--border))]">{goal.thrust}</span>
                        <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-[#1E1E1E] border border-[rgb(var(--border))]">{goal.uom}</span>
                        <span>{goal.origWeight}%</span>
                        {goal.isShared && (
                          <span className="px-3 py-1 rounded-full bg-[#EAF2FF] dark:bg-[#1A263B] text-[#2D66C2] dark:text-[#7DAAEE] font-semibold border border-[rgb(var(--border))]">Shared</span>
                        )}
                      </div>

                      {goal.type === 'numeric' && (
                        <div className="flex items-center gap-4 text-sm mt-4 pt-4 border-t border-[rgb(var(--border))] border-dashed">
                          <span className="text-gray-500">Target</span>
                          <div className="flex items-center gap-2">
                            <input type="text" readOnly value={goal.target} className="w-16 bg-transparent border border-[rgb(var(--border))] rounded p-1.5 text-center outline-none focus:border-blue-500 text-[rgb(var(--text))]" />
                            <span className="text-gray-500 text-xs w-10 leading-tight">{goal.targetUnit}</span>
                          </div>
                          
                          <span className="text-gray-500 ml-4">Weight</span>
                          <div className="flex items-center gap-2">
                            <input type="text" readOnly value={goal.origWeight} className="w-16 bg-transparent border border-[rgb(var(--border))] rounded p-1.5 text-center outline-none focus:border-blue-500 text-[rgb(var(--text))]" />
                            <span className="text-gray-500 text-xs">%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  {(!activeEmployee.goalsList || activeEmployee.goalsList.length === 0) && (
                    <div className="text-center py-8 text-gray-500">No goals submitted yet.</div>
                  )}
                </div>

                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment for the employee (optional)..."
                  className="w-full bg-transparent border border-[rgb(var(--border))] rounded-xl p-4 text-sm outline-none focus:border-blue-500 min-h-[100px] text-[rgb(var(--text))]"
                />
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-[rgb(var(--border))] bg-[rgb(var(--sidebar-bg))] flex gap-3">
                <button 
                  onClick={() => handleAction('rework')}
                  disabled={isPending || activeEmployee.status === 'Approved'}
                  className="flex-1 py-3 rounded-xl border border-[rgb(var(--border))] text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>↩</span> {isPending ? 'Processing...' : 'Return for rework'}
                </button>
                <button 
                  onClick={() => handleAction('approved')}
                  disabled={isPending || activeEmployee.status === 'Approved'}
                  className="flex-1 py-3 rounded-xl bg-[rgb(var(--text))] text-[rgb(var(--bg))] text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>✓</span> {isPending ? 'Processing...' : 'Approve all goals'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <span className="text-4xl mb-4 opacity-20">📋</span>
              <p>Select an employee to review goals</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
