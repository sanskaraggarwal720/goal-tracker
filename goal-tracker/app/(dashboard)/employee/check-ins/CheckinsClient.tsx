'use client';
import { motion } from 'framer-motion';
import { AchievementEntry } from '@/components/AchievementEntry';

export function CheckinsClient({ checkins, quarter }: { checkins: any[], quarter: string }) {
  
  const quarterNames = {
    'Q1': 'Q1 (Jul - Sep)',
    'Q2': 'Q2 (Oct - Dec)',
    'Q3': 'Q3 (Jan - Mar)',
    'Q4': 'Q4 (Apr - Jun)',
  };
  const activeName = quarterNames[quarter as keyof typeof quarterNames] || quarter;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--text))]">Quarterly Check-ins</h1>
        <p className="text-gray-500 mt-1">Enter your progress for the current quarter.</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-4 rounded-xl mb-6 font-medium text-sm">
        Active Quarter: {activeName}
      </div>

      <motion.div variants={{ animate: { transition: { staggerChildren: 0.1 } } }} initial="initial" animate="animate" className="flex flex-col gap-4">
        {checkins.map(goal => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AchievementEntry goal={goal} quarter={quarter} />
          </motion.div>
        ))}
        {checkins.length === 0 && (
          <div className="text-center py-12 text-gray-500 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
            No approved goals found to check in against.
          </div>
        )}
      </motion.div>
    </div>
  );
}
