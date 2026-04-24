import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public access to landing page
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Get session token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // Allow next-auth requests to pass
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/_next') || pathname.startsWith('/favicon.ico')) {
    return NextResponse.next()
  }

  const user = token ? {
    id: token.id as string,
    email: token.email as string,
    role: token.role as string
  } : null


  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Check for authenticated user role
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Allow admin and employee roles to access the general admin area
    if (user.role !== 'admin' && user.role !== 'employee') {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Restrict specific pages to admin ONLY
    const adminOnlyPaths = ['/admin/users', '/admin/settings', '/admin/employees']
    const isRestrictedArea = adminOnlyPaths.some(path => pathname.startsWith(path))
    if (isRestrictedArea && user.role !== 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Protect delivery routes
  if (pathname.startsWith('/staff/delivery') || pathname.startsWith('/delivery')) {
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    if (user.role !== 'delivery') {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  // Allow users to access auth pages regardless of authentication status,
  // let the page itself handle navigation if needed.

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

