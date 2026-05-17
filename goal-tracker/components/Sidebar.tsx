'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ThemeToggle } from './ThemeToggle';

const LINKS = {
  employee: [
    { label: 'My goals', href: '/employee/goals', icon: '◫' },
    { label: 'Progress', href: '/employee/check-ins', icon: '📊' },
    { label: 'Check-ins', href: '/employee/check-ins-alt', icon: '📅' },
    { label: 'Reports', href: '/employee/reports', icon: '📄' },
    { label: 'Settings', href: '/employee/settings', icon: '⚙️' },
  ],
  manager: [
    { label: 'Approvals', href: '/manager/approvals', icon: '📝' },
    { label: 'Check-ins', href: '/manager/check-ins', icon: '👥' },
  ],
  admin: [
    { label: 'Analytics', href: '/admin/dashboard', icon: '📈' },
    { label: 'Shared Goals', href: '/admin/shared-goals', icon: '🔗' },
    { label: 'Reports', href: '/admin/reports', icon: '📄' },
    { label: 'Cycles', href: '/admin/cycles', icon: '🔄' },
  ]
};

const USER_PROFILES = {
  employee: { name: 'Arjun Singh', roleLabel: 'Employee', initials: 'AS', color: 'bg-[#A8A1F9] text-[#1E1E1E]' },
  manager: { name: 'Rajesh Mehta', roleLabel: 'Manager', initials: 'RM', color: 'bg-[#4ade80] text-[#14532d]' },
  admin: { name: 'Priya Sharma', roleLabel: 'Admin', initials: 'PS', color: 'bg-[#c084fc] text-[#4c1d95]' }
};

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const links = LINKS[role as keyof typeof LINKS] || LINKS.employee;

  return (
    <aside className="w-64 bg-[rgb(var(--sidebar-bg))] border-r border-[rgb(var(--border))] fixed h-full flex flex-col transition-colors z-20">
      <div className="p-6 pb-2">
        <h1 className="font-bold text-xl text-[rgb(var(--text))]">AtomQuest</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">Goal Tracker</p>
      </div>

      <nav className="flex-1 px-3 py-6 flex flex-col gap-1">
        {links.map(link => {
          const isActive = pathname.startsWith(link.href) || (link.href === '/employee/goals' && pathname === '/employee/goals');
          return (
            <Link key={link.href} href={link.href} className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-[rgb(var(--text))]' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-[#333]'}`}>
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-gray-100 dark:bg-[#333] rounded-lg -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="text-lg opacity-70">{link.icon}</span>
              <span className="relative z-10">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[rgb(var(--border))]">
        <ThemeToggle />
      </div>

      <div className="p-4 m-3 mt-0 rounded-xl bg-gray-100 dark:bg-[#333] flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${USER_PROFILES[role as keyof typeof USER_PROFILES]?.color || USER_PROFILES.employee.color}`}>
          {USER_PROFILES[role as keyof typeof USER_PROFILES]?.initials || USER_PROFILES.employee.initials}
        </div>
        <div>
          <div className="text-sm font-bold text-[rgb(var(--text))]">
            {USER_PROFILES[role as keyof typeof USER_PROFILES]?.name || USER_PROFILES.employee.name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {USER_PROFILES[role as keyof typeof USER_PROFILES]?.roleLabel || USER_PROFILES.employee.roleLabel}
          </div>
        </div>
      </div>
    </aside>
  );
}
