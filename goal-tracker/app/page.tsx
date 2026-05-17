'use client';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function RoleCard({ title, desc, role, color, delay }: any) {
  const router = useRouter();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouseMove(event: any) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  function handleClick() {
    document.cookie = `demo_role=${role}; path=/`;
    if (role === 'employee') router.push('/employee/goals');
    if (role === 'manager') router.push('/manager/approvals');
    if (role === 'admin') router.push('/admin/dashboard');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: 'spring', stiffness: 100 }}
      style={{ perspective: 1000 }}
      className="flex-1"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`cursor-pointer h-full relative group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 transition-colors hover:bg-white/10 overflow-hidden shadow-2xl`}
      >
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${color}`} />
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-lg bg-gradient-to-br ${color} text-white`}>
          {role === 'employee' ? '👨‍💻' : role === 'manager' ? '👥' : '👑'}
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
        
        <div className={`absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r ${color} shadow-[0_0_15px_rgba(255,255,255,0.5)]`} />
      </motion.div>
    </motion.div>
  );
}

export default function Entrance() {
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ w: 1000, h: 800 });
  const [viewMode, setViewMode] = useState<'login' | 'demo'>('login');
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    setDimensions({ w: window.innerWidth, h: window.innerHeight });
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#050510]" />;

  return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500/10 blur-3xl mix-blend-screen"
            initial={{
              x: Math.random() * dimensions.w,
              y: Math.random() * dimensions.h,
            }}
            animate={{
              x: [Math.random() * dimensions.w, Math.random() * dimensions.w],
              y: [Math.random() * dimensions.h, Math.random() * dimensions.h],
            }}
            transition={{ duration: Math.random() * 20 + 20, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            style={{
              width: Math.random() * 400 + 200,
              height: Math.random() * 400 + 200,
            }}
          />
        ))}
      </div>

      <div className="z-10 w-full max-w-5xl mx-auto p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Subtle noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

          <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative z-10">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 mb-4 tracking-tight">AtomQuest</h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              {viewMode === 'demo' 
                ? "Select your persona to enter the Goal Tracking platform. Experience tailored workflows and intelligent insights designed for your role."
                : "Welcome to the future of Performance Management. Please login to continue."}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            {viewMode === 'demo' ? (
              <motion.div 
                key="demo"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex gap-6 text-left relative z-10"
              >
                <RoleCard 
                  title="Employee" 
                  desc="Set goals, log progress, and participate in check-ins. The core engine of growth."
                  role="employee" 
                  color="from-blue-500 to-cyan-400"
                  delay={0.1}
                />
                <RoleCard 
                  title="Manager" 
                  desc="Review submissions, provide feedback, and align team targets seamlessly."
                  role="manager" 
                  color="from-emerald-400 to-teal-500"
                  delay={0.2}
                />
                <RoleCard 
                  title="Admin" 
                  desc="Analyze organization-wide performance, spot trends, and manage cycles."
                  role="admin" 
                  color="from-purple-500 to-pink-500"
                  delay={0.3}
                />
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative z-10 max-w-md mx-auto bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8"
              >
                <form onSubmit={(e) => { 
                  e.preventDefault(); 
                  const form = e.currentTarget;
                  const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
                  const email = emailInput?.value || 'arjun@demo.com';
                  
                  let role = 'employee';
                  let route = '/employee/goals';
                  if (email.toLowerCase().includes('priya')) { role = 'admin'; route = '/admin/dashboard'; }
                  else if (email.toLowerCase().includes('rajesh') || email.toLowerCase().includes('anjali')) { role = 'manager'; route = '/manager/approvals'; }

                  document.cookie = `demo_user_email=${email}; path=/`;
                  document.cookie = `demo_role=${role}; path=/`;
                  window.location.href = route;
                }} className="flex flex-col gap-5 text-left">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Work Email</label>
                    <input type="email" placeholder="you@company.com" required className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Password</label>
                    <input type="password" placeholder="••••••••" required className="w-full bg-black/50 border border-white/10 rounded-xl p-3.5 text-white outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <button type="submit" className="w-full mt-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]">
                    Sign In
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative z-10 mt-12 pt-6 border-t border-white/10">
            <button 
              onClick={() => setViewMode(viewMode === 'login' ? 'demo' : 'login')}
              className="text-gray-400 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto group"
            >
              {viewMode === 'login' ? (
                <><span>Switch to Demo Personas</span><span className="group-hover:translate-x-1 transition-transform">→</span></>
              ) : (
                <><span className="group-hover:-translate-x-1 transition-transform">←</span><span>Back to Standard Login</span></>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
