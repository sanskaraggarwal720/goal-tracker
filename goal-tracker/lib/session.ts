import { cookies } from 'next/headers';

export const DEMO_USERS = {
  employee: '44444444-4444-4444-4444-444444444444', // Arjun Singh (default)
  manager: '22222222-2222-2222-2222-222222222222',  // Rajesh Mehta (default)
  admin: '11111111-1111-1111-1111-111111111111'     // Priya Sharma (default)
};

export const EMAIL_USER_MAP: Record<string, string> = {
  'priya@demo.com': '11111111-1111-1111-1111-111111111111',
  'rajesh@demo.com': '22222222-2222-2222-2222-222222222222',
  'anjali@demo.com': '33333333-3333-3333-3333-333333333333',
  'arjun@demo.com': '44444444-4444-4444-4444-444444444444',
  'neha@demo.com': '55555555-5555-5555-5555-555555555555',
  'vikram@demo.com': '66666666-6666-6666-6666-666666666666',
  'shreya@demo.com': '77777777-7777-7777-7777-777777777777',
  'karan@demo.com': '88888888-8888-8888-8888-888888888888'
};

export function getCurrentUser() {
  const emailCookie = cookies().get('demo_user_email')?.value;
  if (emailCookie && EMAIL_USER_MAP[emailCookie.toLowerCase()]) {
    return EMAIL_USER_MAP[emailCookie.toLowerCase()];
  }

  const role = cookies().get('demo_role')?.value as keyof typeof DEMO_USERS | undefined;
  if (!role || !DEMO_USERS[role]) return DEMO_USERS.employee;
  return DEMO_USERS[role];
}
