'use client';
import { useState, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckinModal } from '@/components/CheckinModal';
import { saveManagerCheckin } from '@/app/actions/goals';

export function ManagerCheckinsClient({ initialTeam, currentQuarter }: { initialTeam: any[], currentQuarter: string }) {
  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleCheckin = (comment: string) => {
    if (!selectedEmp?.firstGoalId) {
      alert("Employee has no approved goals to check in against yet.");
      setSelectedEmp(null);
      return;
    }
    
    startTransition(async () => {
      try {
        await saveManagerCheckin(selectedEmp.firstGoalId, currentQuarter, comment);
      } catch (e) {
        console.error(e);
      } finally {
        setSelectedEmp(null);
      }
    });
  };

  const quarterNames = {
    'Q1': 'Q1 (Jul - Sep)',
    'Q2': 'Q2 (Oct - Dec)',
    'Q3': 'Q3 (Jan - Mar)',
    'Q4': 'Q4 (Apr - Jun)',
  };
  const activeName = quarterNames[currentQuarter as keyof typeof quarterNames] || currentQuarter;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[rgb(var(--text))]">{activeName} Check-ins</h1>
        <p className="text-gray-500 mt-1">Record feedback for your direct reports.</p>
      </div>

      <motion.div variants={{ animate: { transition: { staggerChildren: 0.06 } } }} initial="initial" animate="animate" className="flex flex-col gap-4">
        {initialTeam.map(emp => (
          <motion.div
            key={emp.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ backgroundColor: 'var(--hover-bg, #f9fafb)', x: 2 }}
            className="p-4 bg-[rgb(var(--card-bg))] rounded-xl shadow-sm border border-[rgb(var(--border))] flex justify-between items-center transition-colors"
          >
            <div>
              <div className="font-semibold text-[rgb(var(--text))]">{emp.name}</div>
              <div className="text-xs text-gray-500">{emp.role}</div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">Avg Progress</div>
                <div className="font-semibold text-blue-600 dark:text-blue-400">{emp.progress}%</div>
              </div>
              
              <AnimatePresence mode="wait">
                {emp.checkinDone ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-[#1A2E1A] px-4 py-2 rounded-lg font-medium text-sm"
                  >
                    ✓ Completed
                  </motion.div>
                ) : (
                  <motion.button
                    key="action"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedEmp(emp)}
                    disabled={isPending && selectedEmp?.id === emp.id}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isPending && selectedEmp?.id === emp.id ? 'Saving...' : 'Start Check-in'}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
        {initialTeam.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No direct reports found.
          </div>
        )}
      </motion.div>

      <CheckinModal
        isOpen={!!selectedEmp}
        employeeName={selectedEmp?.name || ''}
        onClose={() => setSelectedEmp(null)}
        onSubmit={handleCheckin}
      />
    </div>
  );
}
