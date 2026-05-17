import { DemoRoleSwitcher } from '@/components/DemoRoleSwitcher';
import { Sidebar } from '@/components/Sidebar';
import { PageTransition } from '@/components/motion/PageTransition';
import { cookies } from 'next/headers';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const role = cookies().get('demo_role')?.value ?? 'employee';
  const email = cookies().get('demo_user_email')?.value ?? (role === 'admin' ? 'priya@demo.com' : role === 'manager' ? 'rajesh@demo.com' : 'arjun@demo.com');
  return (
    <div className="flex min-h-screen transition-colors">
      <Sidebar role={role} email={email} />
      <main className="flex-1 p-8 ml-64 overflow-x-hidden min-h-screen">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <DemoRoleSwitcher currentRole={role} />
    </div>
  );
}
