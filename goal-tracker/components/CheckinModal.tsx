'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function CheckinModal({ isOpen, onClose, onSubmit, employeeName }: { isOpen: boolean, onClose: () => void, onSubmit: (comment: string) => void, employeeName: string }) {
  const [comment, setComment] = useState('');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="bg-[rgb(var(--card-bg))] p-6 rounded-xl shadow-xl max-w-md w-full pointer-events-auto border border-[rgb(var(--border))]"
            >
              <h3 className="text-lg font-bold mb-2">Q1 Check-in for {employeeName}</h3>
              <p className="text-sm text-gray-500 mb-4">Provide qualitative feedback on their progress this quarter.</p>
              
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Manager comments..."
                className="w-full border border-[rgb(var(--border))] rounded-lg p-3 text-sm h-32 mb-4 bg-transparent text-[rgb(var(--text))]"
              />
              
              <div className="flex justify-end gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={() => { onSubmit(comment); setComment(''); }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Save Check-in
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
