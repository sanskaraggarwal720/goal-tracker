import { DemoRoleSwitcher } from '@/components/DemoRoleSwitcher';
import { Sidebar } from '@/components/Sidebar';
import { PageTransition } from '@/components/motion/PageTransition';
import { cookies } from 'next/headers';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = cookies().get('demo_role')?.value ?? 'employee';
  return (
    <div className="flex min-h-screen transition-colors">
      <Sidebar role={role} />
      <main className="flex-1 p-8 ml-64 overflow-x-hidden min-h-screen">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <DemoRoleSwitcher currentRole={role} />
    </div>
  );
}
