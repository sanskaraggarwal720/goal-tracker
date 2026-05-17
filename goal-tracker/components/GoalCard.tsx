'use client';
import { motion } from 'framer-motion';
import { ProgressRing } from './ProgressRing';
import { CountUp } from './CountUp';

export function GoalCard({ goal, index }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -6, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' }}
      className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-2xl p-6 relative group transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-extrabold text-xl text-[rgb(var(--text))] leading-tight pr-6">{goal.title}</h3>
        <div className="shrink-0 relative">
          <ProgressRing progress={goal.weightage} size={50} strokeWidth={4} />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[rgb(var(--text))]">
            {goal.weightage}%
          </div>
          {/* Glowing ring underlay for weightage */}
          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full z-[-1]" />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-6">
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${goal.statusColor}`}>{goal.status}</span>
        <span className="px-2.5 py-1 rounded-md bg-gray-100 dark:bg-[#1E1E1E] text-gray-600 dark:text-gray-400 text-xs font-semibold border border-[rgb(var(--border))]">{goal.thrust}</span>
      </div>

      <div className="flex justify-between text-sm mb-2">
        <span className="text-gray-500 font-medium">Q1 Progress</span>
        <span className="font-bold text-[rgb(var(--text))]">{goal.progress > 0 ? `${goal.progress}%` : '—'}</span>
      </div>
      
      <div className="h-2 w-full bg-gray-100 dark:bg-[#1A1A1A] rounded-full overflow-hidden shadow-inner">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${goal.progress}%` }}
          transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
          className={`h-full rounded-full ${goal.progress === 100 ? 'bg-[#4B8B4B]' : goal.progress > 50 ? 'bg-[#4B8B4B]' : goal.progress > 0 ? 'bg-[#D17D31]' : 'bg-transparent'}`} 
        />
      </div>
    </motion.div>
  );
}
