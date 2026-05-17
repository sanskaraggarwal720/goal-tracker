'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProgressRing } from './ProgressRing';
import { CountUp } from './CountUp';
import { computeProgress } from '@/lib/progress-calculator';

import { saveAchievement } from '@/app/actions/goals';

export function AchievementEntry({ goal, quarter }: { goal: any, quarter: string }) {
  const [actual, setActual] = useState(goal.actual || '');
  const [status, setStatus] = useState(goal.status || 'not_started');
  const [isSaving, setIsSaving] = useState(false);

  const progress = (actual !== '' && actual !== undefined) ? computeProgress(goal.uom, goal.target, uomToNumber(goal.uom, actual)) : 0;

  function uomToNumber(uom: string, val: string) {
    if (uom === 'timeline') return val;
    return Number(val);
  }

  const handleSave = async (newActual: string, newStatus: string) => {
    setIsSaving(true);
    try {
      await saveAchievement(goal.id, quarter, newActual === '' ? null : newActual, newStatus);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      layout
      className="p-4 bg-[rgb(var(--card-bg))] rounded-xl shadow-sm border border-[rgb(var(--border))] flex gap-6 items-center"
    >
      <div className="flex-1">
        <h3 className="font-semibold text-[rgb(var(--text))]">{goal.title}</h3>
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
          {goal.uom} • Target: {goal.target}
        </p>
        
        <div className="flex gap-4 items-center mt-4">
          <div className="flex-1 relative">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{quarter} Actual</label>
            <input 
              type={goal.uom === 'timeline' ? 'date' : 'number'} 
              value={actual} 
              onChange={e => setActual(e.target.value)}
              onBlur={() => handleSave(actual, status)}
              className="w-full border border-[rgb(var(--border))] rounded p-2 text-sm bg-transparent text-[rgb(var(--text))]" 
            />
            {isSaving && <div className="absolute right-3 top-8 text-xs text-blue-500 animate-pulse">Saving...</div>}
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select 
              value={status} 
              onChange={e => {
                setStatus(e.target.value);
                handleSave(actual, e.target.value);
              }}
              className="w-full border border-[rgb(var(--border))] rounded p-2 text-sm bg-transparent dark:bg-[#252525] text-[rgb(var(--text))]"
            >
              <option value="not_started">Not Started</option>
              <option value="on_track">On Track</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-[#1E1E1E] p-4 rounded-xl min-w-[120px]">
        <ProgressRing progress={progress} size={70} strokeWidth={6} />
        <div className="mt-2 text-xs font-medium text-gray-500">
          Score: <CountUp value={progress} />
        </div>
      </div>
    </motion.div>
  );
}
