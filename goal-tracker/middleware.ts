import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const role = request.cookies.get('demo_role')?.value ?? 'employee';
  
  // Very basic role guard for demo
  if (request.nextUrl.pathname.startsWith('/employee') && role !== 'employee') {
    return NextResponse.redirect(new URL('/employee/goals', request.url))
  }
  if (request.nextUrl.pathname.startsWith('/manager') && role !== 'manager') {
    return NextResponse.redirect(new URL('/manager/approvals', request.url))
  }
  if (request.nextUrl.pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/employee/:path*',
    '/manager/:path*',
    '/admin/:path*'
  ],
}
