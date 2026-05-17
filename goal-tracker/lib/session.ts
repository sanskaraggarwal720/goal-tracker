import { cookies } from 'next/headers';

export const DEMO_USERS = {
  employee: '44444444-4444-4444-4444-444444444444', // Arjun Singh
  manager: '22222222-2222-2222-2222-222222222222',  // Rajesh Mehta
  admin: '11111111-1111-1111-1111-111111111111'     // Priya Sharma
};

export function getCurrentUser() {
  const role = cookies().get('demo_role')?.value as keyof typeof DEMO_USERS | undefined;
  if (!role || !DEMO_USERS[role]) return DEMO_USERS.employee;
  return DEMO_USERS[role];
}
