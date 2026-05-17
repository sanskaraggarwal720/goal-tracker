'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ROLES = [
  { id: 'employee', label: 'Employee',  color: '#185FA5', initials: 'AS', route: '/employee/goals' },
  { id: 'manager',  label: 'Manager',   color: '#3B6D11', initials: 'RM', route: '/manager/approvals' },
  { id: 'admin',    label: 'Admin/HR',  color: '#7F77DD', initials: 'PS', route: '/admin/dashboard' },
];

export function DemoRoleSwitcher({ currentRole }: { currentRole: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const active = ROLES.find(r => r.id === currentRole) || ROLES[0];

  const switchTo = (role: typeof ROLES[number]) => {
    document.cookie = `demo_role=${role.id}; path=/`;
    setOpen(false);
    router.push(role.route);
    router.refresh(); // Forces Next.js to re-fetch Server Components (including layout.tsx) so the sidebar updates
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 999 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute', bottom: '52px', right: 0,
              background: 'white', border: '0.5px solid #e5e7eb',
              borderRadius: '12px', padding: '6px', minWidth: '180px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.10)'
            }}
          >
            <div style={{ fontSize: '10px', color: '#9ca3af', padding: '4px 10px 6px', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>
              Switch role (demo) ⚡
            </div>
            {ROLES.map((role, i) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => switchTo(role)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                  background: role.id === currentRole ? '#f3f4f6' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left', color: 'black'
                }}
                whileHover={{ background: '#f3f4f6' }}
                whileTap={{ scale: 0.97 }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: role.color + '20', color: role.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 600
                }}>{role.initials}</div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>{role.label}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>{role.route}</div>
                </div>
                {role.id === currentRole && (
                  <motion.div layoutId="active-dot" style={{
                    marginLeft: 'auto', width: 6, height: 6,
                    borderRadius: '50%', background: role.color
                  }} />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: active.color, color: 'white',
          border: 'none', borderRadius: '999px',
          padding: '8px 16px 8px 10px', cursor: 'pointer',
          fontSize: '13px', fontWeight: 500,
          boxShadow: `0 4px 14px ${active.color}55`
        }}
      >
        <div style={{
          width: 24, height: 24, borderRadius: '50%',
          background: 'rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', fontWeight: 700
        }}>{active.initials}</div>
        {active.label}
        <motion.span animate={{ rotate: open ? 180 : 0 }} style={{ display: 'inline-block', fontSize: '10px' }}>▲</motion.span>
      </motion.button>
    </div>
  );
}
