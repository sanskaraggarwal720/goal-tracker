'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveEscalation } from '@/app/actions/goals';

export function EscalationsClient({ initialEscalations }: { initialEscalations: any[] }) {
  const [escalations, setEscalations] = useState(initialEscalations);
  const [loading, setLoading] = useState<string | null>(null);

  const handleResolve = async (id: string) => {
    setLoading(id);
    await resolveEscalation(id);
    setEscalations(prev => prev.map(e => e.id === id ? { ...e, resolved_at: new Date().toISOString() } : e));
    setLoading(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between pb-4 border-b border-[rgb(var(--border))]">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Escalation Engine</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Automated SLA tracking and skip-level escalation alerts.</p>
        </div>
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900 px-4 py-2 rounded-xl text-sm font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          {escalations.filter(e => !e.resolved_at).length} Active Alerts
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {escalations.map((esc: any) => (
            <motion.div
              key={esc.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl p-6 transition-all shadow-sm ${
                esc.resolved_at 
                  ? 'bg-gray-50/50 dark:bg-[#151515] border-[rgb(var(--border))] opacity-60' 
                  : 'bg-[rgb(var(--card-bg))] border-red-500/30 dark:border-red-500/20 shadow-[0_4px_20px_rgba(239,68,68,0.05)]'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      esc.resolved_at ? 'bg-gray-200 dark:bg-gray-800 text-gray-500' : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400'
                    }`}>
                      {esc.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-400">Triggered: {new Date(esc.triggered_at).toLocaleString()}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[rgb(var(--text))] mt-2">{esc.goals?.title || 'System Goal Missing'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Assigned to: <span className="text-[rgb(var(--text))] font-bold">{esc.users?.name}</span> ({esc.users?.department})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {esc.resolved_at ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 px-4 py-2.5 rounded-xl border border-green-200 dark:border-green-900">
                      <span>✓ Resolved ({new Date(esc.resolved_at).toLocaleTimeString()})</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleResolve(esc.id)}
                      disabled={loading === esc.id}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-lg transition-all hover:shadow-red-500/25 active:scale-95 disabled:opacity-50"
                    >
                      {loading === esc.id ? 'Resolving...' : 'Mark Resolved'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          {escalations.length === 0 && (
            <div className="text-center py-16 text-gray-500 bg-[rgb(var(--card-bg))] rounded-2xl border border-[rgb(var(--border))]">
              No escalations or missed SLAs recorded in the system. Everything is perfectly on track!
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
