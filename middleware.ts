import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * ELITE PLATFORM MIDDLEWARE
 * Implements strict access control, maintenance routing,
 * and production security hardening.
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ASSET OPTIMIZATION: Bypass middleware for static assets
  const isStatic = pathname.includes('.') || pathname.startsWith('/_next') || pathname.startsWith('/images');
  if (isStatic) return NextResponse.next();

  // 2. MAINTENANCE MODE: Global Traffic Interceptor
  if (process.env.MAINTENANCE_MODE === 'true' && pathname !== '/maintenance') {
    if (pathname.startsWith('/api')) {
      return new NextResponse(JSON.stringify({ error: 'Service Unavailable', code: 'MAINTENANCE' }), {
        status: 503, headers: { 'content-type': 'application/json' }
      });
    }
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  // 3. SESSION IDENTIFICATION
  const adminToken = request.cookies.get('admin_session_token')?.value;
  const studentEmail = request.cookies.get('student_email')?.value;
  const pendingAdminId = request.cookies.get('pending_admin_id')?.value;

  // 4. ACCESS PROTECTION LOGIC

  // A. STUDENT ACCESS CONTROL
  const isStudentRoute = pathname.startsWith('/student');
  const isPublicAuthRoute = pathname === '/login' || pathname === '/register' || pathname === '/forgot-password';

  if (studentEmail && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/student/dashboard', request.url));
  }

  if (isStudentRoute && !studentEmail) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // B. ADMIN ACCESS CONTROL
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Allow login and verification pages
    if (pathname === '/admin/login') {
      if (adminToken) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      return NextResponse.next();
    }

    if (pathname === '/admin/verify') {
      if (adminToken) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (!pendingAdminId) return NextResponse.redirect(new URL('/admin/login', request.url));
      return NextResponse.next();
    }

    // Require token for all other admin routes
    if (!adminToken) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 5. SECURITY HEADERS INJECTION
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/student/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/student/:path*'
  ],
};
