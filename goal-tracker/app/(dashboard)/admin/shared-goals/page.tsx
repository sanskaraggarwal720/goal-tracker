'use client';
import { useState } from 'react';
import { pushSharedGoal } from '@/app/actions/goals';

export default function SharedGoalsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    const formData = new FormData(e.currentTarget);
    try {
      await pushSharedGoal(formData);
      setSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-[rgb(var(--text))] mb-2">Push Shared Goal</h1>
      <p className="text-gray-500 mb-8">Deploy a departmental KPI to all employees in a specific department.</p>

      <div className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[rgb(var(--text))]">Department Target</label>
              <select name="department" className="w-full bg-transparent border border-[rgb(var(--border))] rounded-lg p-3 outline-none focus:border-blue-500 text-[rgb(var(--text))]">
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="HR">HR</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[rgb(var(--text))]">Thrust Area</label>
              <select name="thrustAreaId" className="w-full bg-transparent border border-[rgb(var(--border))] rounded-lg p-3 outline-none focus:border-blue-500 text-[rgb(var(--text))]">
                {/* Normally we'd fetch this from DB, but hardcoding IDs from seed for demo */}
                <option value="aa000000-0000-0000-0000-000000000001">Revenue</option>
                <option value="aa000000-0000-0000-0000-000000000002">Operations</option>
                <option value="aa000000-0000-0000-0000-000000000004">Customer</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[rgb(var(--text))]">Goal Title</label>
            <input required type="text" name="title" placeholder="e.g. Q2 Department Revenue Target" className="w-full bg-transparent border border-[rgb(var(--border))] rounded-lg p-3 outline-none focus:border-blue-500 text-[rgb(var(--text))]" />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-[rgb(var(--text))]">Unit of Measurement</label>
              <select name="uom" className="w-full bg-transparent border border-[rgb(var(--border))] rounded-lg p-3 outline-none focus:border-blue-500 text-[rgb(var(--text))]">
                <option value="numeric_min">Numeric (Min)</option>
                <option value="numeric_max">Numeric (Max)</option>
                <option value="zero">Zero Incidents</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[rgb(var(--text))]">Target Value</label>
              <input required type="number" name="target" placeholder="100" className="w-full bg-transparent border border-[rgb(var(--border))] rounded-lg p-3 outline-none focus:border-blue-500 text-[rgb(var(--text))]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[rgb(var(--text))]">Default Weightage (%)</label>
              <input required type="number" name="weightage" defaultValue={10} min={1} max={100} className="w-full bg-transparent border border-[rgb(var(--border))] rounded-lg p-3 outline-none focus:border-blue-500 text-[rgb(var(--text))]" />
            </div>
          </div>

          <div className="pt-4 border-t border-[rgb(var(--border))]">
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
            {success && <div className="text-green-500 text-sm mb-4">Successfully pushed shared goals to the department!</div>}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Deploying Goals...' : 'Push Goal to Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
