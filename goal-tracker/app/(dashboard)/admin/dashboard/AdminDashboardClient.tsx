'use client';
import { motion } from 'framer-motion';
import { CountUp } from '@/components/CountUp';

export function AdminDashboardClient({ stats }: { stats: any }) {
  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col relative">
      {/* Floating Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between pb-6 pt-2 bg-[rgb(var(--bg))]/80 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-1">Command Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Organisation-wide analytics and live feeds</p>
        </div>
        <div className="flex gap-4">
          <div className="relative group">
            <input 
              type="text" 
              placeholder="Search across org..." 
              className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 text-[rgb(var(--text))] w-64 shadow-sm transition-all focus:ring-4 ring-blue-500/10"
            />
            <span className="absolute right-3 top-3 text-gray-400 group-focus-within:text-blue-500 transition-colors">🔍</span>
          </div>
          <select className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl px-4 py-2.5 text-sm font-bold text-[rgb(var(--text))] shadow-sm outline-none cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1E1E1E]">
            <option>FY 2025-26 (Active)</option>
            <option>FY 2024-25</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area (9 cols) */}
          <div className="col-span-12 xl:col-span-9 space-y-8">
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl p-5">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg completion</div>
                <div className="text-3xl font-bold text-[rgb(var(--text))]"><CountUp value={stats.avgCompletion} />%</div>
                <div className="text-xs mt-2 font-medium text-green-600 dark:text-[#4B8B4B]">Organisation average</div>
              </div>
              <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl p-5">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Goals on track</div>
                <div className="text-3xl font-bold text-[rgb(var(--text))]"><CountUp value={stats.goalsOnTrack} /></div>
                <div className="text-xs mt-2 font-medium text-green-600 dark:text-[#4B8B4B]">Current snapshot</div>
              </div>
              <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl p-5">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Check-ins done</div>
                <div className="text-3xl font-bold text-[rgb(var(--text))]"><CountUp value={stats.checkinsDone} /> <span className="text-sm text-gray-500 font-medium">/ <CountUp value={stats.totalEmployees * 2} /></span></div>
                <div className="text-xs mt-2 font-medium text-gray-500 dark:text-gray-400">Total volume</div>
              </div>
              <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl p-5">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Escalations open</div>
                <div className="text-3xl font-bold text-[rgb(var(--text))]"><CountUp value={stats.escalationsOpen} /></div>
                <div className="text-xs mt-2 font-medium text-green-600 dark:text-[#4B8B4B]">All clear</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Chart Card */}
              <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl p-6">
                <h2 className="text-sm font-bold text-[rgb(var(--text))] mb-6">Quarterly achievement trend</h2>
                
                <div className="relative">
                  <div className="flex items-end gap-2 h-40 border-b border-[rgb(var(--border))] pb-6">
                    {[
                      { q: 'Q1', target: 52, actual: 48 },
                      { q: 'Q2', target: 65, actual: 60 },
                      { q: 'Q3', target: 72, forecast: 10 },
                      { q: 'Q4', target: 80, forecast: 4 },
                    ].map((col, i) => (
                      <div key={i} className="flex flex-col items-center flex-1 h-full justify-end gap-1 relative group">
                        <div className="w-full max-w-[40px] rounded-t bg-blue-200 dark:bg-[#1A263B] relative" style={{ height: `${col.target}%` }}>
                          {col.actual !== undefined && (
                            <div className="absolute bottom-0 left-0 right-0 bg-[#4B8B4B] rounded-t" style={{ height: `${(col.actual / col.target) * 100}%` }} />
                          )}
                          {col.forecast !== undefined && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gray-300 dark:bg-gray-600 opacity-50 rounded-t" style={{ height: `${(col.forecast / col.target) * 100}%` }} />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-medium">{col.q}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-blue-200 dark:bg-[#1A263B]"></span>Target</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-[#4B8B4B]"></span>Actual</div>
                    <div className="flex items-center gap-2 text-xs text-gray-500"><span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 opacity-50"></span>Forecast</div>
                  </div>
                </div>
              </div>

              {/* Heatmap Card (3D Tiles) */}
              <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-2xl p-8 shadow-xl">
                <h2 className="text-lg font-bold text-[rgb(var(--text))] mb-8">Completion Heatmap — by dept & quarter</h2>
                
                <div className="grid grid-cols-[80px_repeat(4,1fr)] gap-3">
                  <div />
                  <div className="text-center text-xs text-gray-500 font-bold uppercase tracking-widest pb-2">Q1</div>
                  <div className="text-center text-xs text-gray-500 font-bold uppercase tracking-widest pb-2">Q2</div>
                  <div className="text-center text-xs text-gray-500 font-bold uppercase tracking-widest pb-2">Q3</div>
                  <div className="text-center text-xs text-gray-500 font-bold uppercase tracking-widest pb-2">Q4</div>

                  {/* Sales */}
                  <div className="flex items-center text-sm font-bold text-gray-500">Sales</div>
                  <div className="bg-[#1C3524] shadow-[inset_0_2px_15px_rgba(75,139,75,0.4),0_4px_6px_-1px_rgba(0,0,0,0.5)] border border-[#2F5234] rounded-lg p-3 text-center text-sm font-black text-[#85E085] transform hover:-translate-y-1 transition-transform cursor-pointer">82%</div>
                  <div className="bg-[#1C3524] shadow-[inset_0_2px_15px_rgba(75,139,75,0.2),0_4px_6px_-1px_rgba(0,0,0,0.5)] border border-[#2F5234] rounded-lg p-3 text-center text-sm font-black text-[#71AA46] transform hover:-translate-y-1 transition-transform cursor-pointer">68%</div>
                  <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-3 text-center text-sm font-black text-[#444] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">—</div>
                  <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-3 text-center text-sm font-black text-[#444] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">—</div>

                  {/* Ops */}
                  <div className="flex items-center text-sm font-bold text-gray-500 mt-2">Ops</div>
                  <div className="bg-[#1C3524] shadow-[inset_0_2px_15px_rgba(75,139,75,0.2),0_4px_6px_-1px_rgba(0,0,0,0.5)] border border-[#2F5234] rounded-lg p-3 text-center text-sm font-black text-[#71AA46] transform hover:-translate-y-1 transition-transform cursor-pointer mt-2">71%</div>
                  <div className="bg-[#2D2A1F] shadow-[inset_0_2px_15px_rgba(153,203,107,0.1),0_4px_6px_-1px_rgba(0,0,0,0.5)] border border-[#4A452F] rounded-lg p-3 text-center text-sm font-black text-[#BDE58A] transform hover:-translate-y-1 transition-transform cursor-pointer mt-2">55%</div>
                  <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-3 text-center text-sm font-black text-[#444] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] mt-2">—</div>
                  <div className="bg-[#1A1A1A] border border-[#333] rounded-lg p-3 text-center text-sm font-black text-[#444] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] mt-2">—</div>
                </div>
              </div>
            </div>

            <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl p-6">
              <h2 className="text-sm font-bold text-[rgb(var(--text))] mb-6">Individual progress — Snapshot</h2>
              
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                {stats.individualProgress.map((emp: any, i: number) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${emp.avatarBg}`}>
                      {emp.initials}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-xs text-[rgb(var(--text))]">{emp.name}</span>
                        <span className="font-semibold text-xs text-[rgb(var(--text))]">{emp.score}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-[#333] rounded-full overflow-hidden">
                        <div className={`h-full ${emp.color} rounded-full`} style={{ width: `${emp.score}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
                {stats.individualProgress.length === 0 && (
                  <div className="text-gray-500 col-span-2 py-4">No individual progress data found.</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Live Escalation Feed (Right sidebar, 3 cols) */}
          <div className="col-span-12 xl:col-span-3">
            <div className="sticky top-[100px] bg-[#0A0A0A] border border-[#222] rounded-2xl p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 to-orange-500" />
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-white text-sm tracking-wide">Live Feed</h2>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold text-green-500">System Normal</span>
                </div>
              </div>

              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-[#111] border border-[#222] p-4 rounded-xl"
                >
                  <div className="text-xs font-bold text-blue-400 mb-1">Goal Completed</div>
                  <div className="text-sm text-gray-300 font-medium">Arjun Singh (Sales)</div>
                  <div className="text-xs text-gray-500 mt-2">Just now</div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-[#111] border border-[#222] p-4 rounded-xl"
                >
                  <div className="text-xs font-bold text-blue-400 mb-1">Cycle Opened</div>
                  <div className="text-sm text-gray-300 font-medium">FY 25-26 Q2 Planning</div>
                  <div className="text-xs text-gray-500 mt-2">1 day ago</div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
