'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoalForm } from '@/components/GoalForm';
import { GoalCard } from '@/components/GoalCard';

export function GoalDashboardClient({ initialGoals }: { initialGoals: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [goals, setGoals] = useState(initialGoals);

  const currentTotalWeight = goals.reduce((acc, goal) => acc + (goal.weightage || 0), 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-extrabold mb-2 text-[rgb(var(--text))] tracking-tight">Active Goals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">FY 2025-26 • Active quarter: <span className="font-bold text-[rgb(var(--text))]">Q1</span></p>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          disabled={currentTotalWeight >= 100}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg transition-all ${
            currentTotalWeight >= 100 
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed shadow-none' 
              : 'bg-[rgb(var(--text))] text-[rgb(var(--bg))] hover:shadow-xl'
          }`}
        >
          + Add Goal
        </motion.button>
      </div>

      <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-2xl p-5 mb-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full space-y-2">
          <div className="flex items-center justify-between text-sm font-bold">
            <span className="text-gray-500 dark:text-gray-400">Cycle Weightage Allocation</span>
            <span className={currentTotalWeight === 100 ? 'text-green-500 font-extrabold' : 'text-blue-500 font-extrabold'}>{currentTotalWeight}% / 100%</span>
          </div>
          <div className="h-2.5 w-full bg-gray-100 dark:bg-[#252525] rounded-full overflow-hidden shadow-inner">
            <motion.div 
              animate={{ width: `${Math.min(currentTotalWeight, 100)}%` }}
              className={`h-full rounded-full ${currentTotalWeight === 100 ? 'bg-green-500 shadow-[0_0_12px_#22c55e]' : currentTotalWeight > 100 ? 'bg-red-500' : 'bg-blue-500'}`}
              transition={{ type: 'spring', bounce: 0.4 }}
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          {currentTotalWeight === 100 ? (
            <div className="px-4 py-2 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-600 dark:text-green-400 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm">
              <span>✓ Allocation Perfect (100%)</span>
            </div>
          ) : (
            <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-bold">
              <span>{Math.max(0, 100 - currentTotalWeight)}% remaining to unlock submission</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal, i) => (
          <GoalCard key={goal.id} goal={goal} index={i} />
        ))}
        {goals.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-500">
            No active goals found. Create your first goal to get started!
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.95, rotateX: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: 100, scale: 0.95, rotateX: -20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 150 }}
              className="relative w-full max-w-2xl bg-[rgb(var(--bg))] rounded-3xl shadow-2xl overflow-hidden border border-[rgb(var(--border))] perspective-1000"
            >
              <GoalForm currentTotalWeight={currentTotalWeight} onSave={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
