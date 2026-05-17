'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ROLES = [
  { id: 'employee', label: 'Employee',  color: '#185FA5', initials: 'AS', route: '/employee/goals', email: 'arjun@demo.com' },
  { id: 'manager',  label: 'Manager',   color: '#3B6D11', initials: 'RM', route: '/manager/approvals', email: 'rajesh@demo.com' },
  { id: 'admin',    label: 'Admin/HR',  color: '#7F77DD', initials: 'PS', route: '/admin/dashboard', email: 'priya@demo.com' },
];

export function DemoRoleSwitcher({ currentRole }: { currentRole: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const active = ROLES.find(r => r.id === currentRole) || ROLES[0];

  const switchTo = (role: typeof ROLES[number]) => {
    document.cookie = `demo_role=${role.id}; path=/`;
    document.cookie = `demo_user_email=${role.email}; path=/`;
    setOpen(false);
    window.location.href = role.route;
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
            <div style={{ margin: '6px 0', borderTop: '1px solid #f3f4f6' }} />
            <motion.button
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              onClick={() => {
                document.cookie = 'demo_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = 'demo_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                setOpen(false);
                window.location.href = '/';
              }}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                width: '100%', padding: '8px 10px', borderRadius: '8px',
                background: '#fee2e2', color: '#dc2626',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontSize: '13px', fontWeight: 600
              }}
              whileHover={{ background: '#fecaca' }}
              whileTap={{ scale: 0.97 }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#f8717120', color: '#dc2626',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px'
              }}>🚪</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Sign Out</div>
                <div style={{ fontSize: '11px', color: '#ef4444' }}>Return to login screen</div>
              </div>
            </motion.button>
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
