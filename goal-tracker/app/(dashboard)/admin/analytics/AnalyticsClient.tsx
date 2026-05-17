'use client';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

export function AnalyticsClient({ data }: { data: any }) {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-[rgb(var(--text))]">Advanced Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Deep dive into organizational performance metrics and goal distributions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* QoQ Achievement Trend (Line Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-lg font-bold text-[rgb(var(--text))] mb-6">QoQ Achievement Trend</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.qoqTrend}>
                <XAxis dataKey="quarter" stroke="#888888" />
                <YAxis stroke="#888888" domain={[0, 100]} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', color: '#fff', borderRadius: '10px' }} />
                <Legend />
                <Line type="monotone" dataKey="avgProgress" name="Average Progress %" stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Thrust Area Distribution (Bar Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-lg font-bold text-[rgb(var(--text))] mb-6">Goals by Thrust Area</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.thrustAreaDistribution}>
                <XAxis dataKey="name" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', color: '#fff', borderRadius: '10px' }} />
                <Legend />
                <Bar dataKey="count" name="Goal Count" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* UoM Distribution (Pie Chart) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-lg font-bold text-[rgb(var(--text))] mb-6">Unit of Measurement Breakdown</h2>
          <div className="h-80 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.uomDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="uom"
                  label={({ uom, count }) => `${uom} (${count})`}
                >
                  {data.uomDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#333', color: '#fff', borderRadius: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Department Heatmap */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[rgb(var(--card-bg))] border border-[rgb(var(--border))] rounded-2xl p-6 shadow-xl"
        >
          <h2 className="text-lg font-bold text-[rgb(var(--text))] mb-6">Department Average Achievement Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-100 dark:bg-[#1E1E1E] text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-3">Dept</th>
                  <th className="p-3 text-center">Q1</th>
                  <th className="p-3 text-center">Q2</th>
                  <th className="p-3 text-center">Q3</th>
                  <th className="p-3 text-center">Q4</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgb(var(--border))]">
                {data.departmentHeatmap.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[#1E1E1E]">
                    <td className="p-3 font-bold text-[rgb(var(--text))]">{row.department}</td>
                    {['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
                      const score = row[q];
                      const bg = score > 75 ? 'bg-green-500 text-white font-bold' : score > 40 ? 'bg-blue-500 text-white font-bold' : score > 0 ? 'bg-yellow-500 text-white font-bold' : 'bg-gray-100 dark:bg-[#222] text-gray-400';
                      return (
                        <td key={q} className="p-2 text-center">
                          <div className={`p-2 rounded-lg text-xs ${bg}`}>
                            {score > 0 ? `${score}%` : '—'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
