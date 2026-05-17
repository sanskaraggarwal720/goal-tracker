'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function ApprovalCard({ goal, onApprove, onReject }: { goal: any, onApprove: () => void, onReject: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [target, setTarget] = useState(goal.target);
  const [weightage, setWeightage] = useState(goal.weightage);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01, y: -2 }}
      className="p-4 bg-[rgb(var(--card-bg))] rounded-xl shadow-sm border border-[rgb(var(--border))] flex flex-col gap-3"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="text-xs text-blue-600 font-semibold mb-1">{goal.employeeName}</div>
          <h3 className="font-semibold text-gray-800">{goal.title}</h3>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{goal.uom}</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className="text-xs text-gray-500 hover:text-gray-800 bg-gray-100 px-2 py-1 rounded"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Target/Weight'}
        </button>
      </div>

      <AnimatePresence>
        {isEditing ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex gap-4 overflow-hidden"
          >
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Target</label>
              <input type="text" value={target} onChange={e => setTarget(e.target.value)} className="w-full border border-[rgb(var(--border))] rounded p-1 text-sm bg-transparent text-[rgb(var(--text))]" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">Weightage (%)</label>
              <input type="number" value={weightage} onChange={e => setWeightage(e.target.value)} className="w-full border border-[rgb(var(--border))] rounded p-1 text-sm bg-transparent text-[rgb(var(--text))]" />
            </div>
          </motion.div>
        ) : (
          <div className="flex gap-4 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
            <div><span className="font-medium">Target:</span> {target}</div>
            <div><span className="font-medium">Weightage:</span> {weightage}%</div>
          </div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 mt-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onApprove}
          className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-green-700"
        >
          Approve
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReject}
          className="flex-1 bg-red-100 text-red-700 rounded-lg py-2 text-sm font-medium hover:bg-red-200"
        >
          Return for Rework
        </motion.button>
      </div>
    </motion.div>
  );
}
