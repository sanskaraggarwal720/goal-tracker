'use client';
import { motion } from 'framer-motion';
import { useState } from 'react';

import { submitGoal } from '@/app/actions/goals';

export function GoalForm({ onSave, onCancel, currentTotalWeight = 0 }: { onSave: () => void, onCancel: () => void, currentTotalWeight?: number }) {
  const [weightage, setWeightage] = useState(10);
  const [uom, setUom] = useState('numeric_max');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalWeight = currentTotalWeight + weightage;
  const isPerfect = totalWeight === 100;
  const weightColor = isPerfect ? 'text-green-500' : totalWeight > 100 ? 'text-red-500' : 'text-orange-500';

  async function handleAction(formData: FormData) {
    setIsSubmitting(true);
    await submitGoal(formData);
    onSave();
  }

  return (
    <form action={handleAction} className="bg-[rgb(var(--card-bg))] flex flex-col max-h-[85vh]">
      <div className="p-6 border-b border-[rgb(var(--border))] flex justify-between items-center sticky top-0 bg-[rgb(var(--card-bg))] z-10">
        <div>
          <h2 className="text-2xl font-extrabold mb-1 text-[rgb(var(--text))]">Add new goal</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">FY 2025-26 • Weightage remaining: <span className="text-blue-500 font-bold">{Math.max(0, 100 - currentTotalWeight)}%</span></p>
        </div>
        <button onClick={onCancel} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-[#333] flex items-center justify-center text-gray-500 hover:text-[rgb(var(--text))] transition-colors">
          ✕
        </button>
      </div>

      <div className="p-6 overflow-y-auto flex-1 space-y-6">
        <div>
          <label className="block text-sm font-bold mb-2">Thrust area *</label>
          <select name="thrust" className="w-full bg-transparent dark:bg-[#252525] border border-[rgb(var(--border))] rounded-lg p-3 text-sm outline-none focus:border-blue-500 text-[rgb(var(--text))]">
            <option className="bg-white dark:bg-[#252525] text-black dark:text-white">Revenue growth</option>
            <option className="bg-white dark:bg-[#252525] text-black dark:text-white">Operations</option>
            <option className="bg-white dark:bg-[#252525] text-black dark:text-white">Technology</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Goal title *</label>
          <input name="title" type="text" defaultValue="Achieve NPS score of 75+" className="w-full bg-transparent border border-[rgb(var(--border))] rounded-lg p-3 text-sm outline-none focus:border-blue-500 text-[rgb(var(--text))]" />
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Description <span className="text-gray-500 font-normal">(optional)</span></label>
          <textarea name="description" className="w-full bg-transparent border border-[rgb(var(--border))] rounded-lg p-3 text-sm min-h-[80px] outline-none focus:border-blue-500 text-[rgb(var(--text))]">
Measure customer satisfaction quarterly via post-interaction NPS survey. Target overall score of 75 or above by end of FY.
          </textarea>
        </div>

        <div>
          <label className="block text-sm font-bold mb-2">Unit of measurement (UoM) *</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'numeric_min', label: 'Numeric (min)', sub: 'Higher actual = better • e.g. revenue' },
              { id: 'numeric_max', label: 'Numeric (max)', sub: 'Lower actual = better • e.g. TAT, cost' },
              { id: 'timeline', label: 'Timeline', sub: 'Date-based • complete before deadline' },
              { id: 'zero', label: 'Zero', sub: 'Zero actual = 100% • e.g. incidents' },
            ].map(item => (
              <button 
                type="button"
                key={item.id}
                onClick={() => setUom(item.id)}
                className={`text-left p-3 rounded-lg border transition-colors ${uom === item.id ? 'bg-[#EAF2FF] border-[#A8C5F5] dark:bg-[#1A263B] dark:border-[#3B66A8]' : 'bg-transparent border-[rgb(var(--border))] hover:bg-gray-50 dark:hover:bg-[#333]'}`}
              >
                <div className={`text-sm font-bold mb-1 ${uom === item.id ? 'text-[#2D66C2] dark:text-[#7DAAEE]' : ''}`}>{item.label}</div>
                <div className={`text-xs ${uom === item.id ? 'text-[#5B88D6] dark:text-[#A4C4F4]' : 'text-gray-500'}`}>{item.sub}</div>
              </button>
            ))}
          </div>
          <input type="hidden" name="uom" value={uom} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Target value *</label>
            <input name="target" type="text" defaultValue="75" className="w-full bg-transparent border border-[rgb(var(--border))] rounded-lg p-3 text-sm outline-none focus:border-blue-500 text-[rgb(var(--text))]" />
            <div className="text-xs text-gray-500 mt-2">NPS score out of 100</div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Weightage (%) *</label>
            <input name="weightage" type="number" value={weightage} onChange={e => setWeightage(Number(e.target.value))} className="w-full bg-transparent border border-[rgb(var(--border))] rounded-lg p-3 text-sm outline-none focus:border-blue-500 text-[rgb(var(--text))]" />
            <div className="text-xs text-gray-500 mt-2">Min 1% • max remaining {Math.max(0, 100 - currentTotalWeight)}%</div>
          </div>
        </div>

      </div>

      <div className="sticky bottom-0 bg-[rgb(var(--sidebar-bg))] border-t border-[rgb(var(--border))] p-6 z-10 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sm text-[rgb(var(--text))]">Total Weightage</div>
          <div className={`text-2xl font-extrabold ${weightColor}`}>{totalWeight}%</div>
        </div>
        <div className="h-2 w-full bg-gray-200 dark:bg-[#333] rounded-full overflow-hidden shadow-inner">
          <motion.div 
            animate={{ width: `${Math.min(totalWeight, 100)}%`, backgroundColor: isPerfect ? '#22c55e' : totalWeight > 100 ? '#ef4444' : '#3b82f6' }}
            className="h-full rounded-full" 
            transition={{ type: 'spring', bounce: 0.5 }}
          />
        </div>
        
        <div className="flex justify-end gap-3 mt-2">
          <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl border border-[rgb(var(--border))] font-bold text-sm hover:bg-gray-100 dark:hover:bg-[#333] transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={!isPerfect || isSubmitting} className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${isPerfect ? 'bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-lg shadow-green-500/20' : 'bg-gray-200 dark:bg-[#333] text-gray-400 cursor-not-allowed'}`}>
            {isSubmitting ? 'Saving...' : 'Save goal'}
          </button>
        </div>
      </div>
    </form>
  );
}
