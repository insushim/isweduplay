import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/auth/error']
  const isPublicRoute = publicRoutes.some((route) => nextUrl.pathname === route)

  // API routes that should be accessible
  const isApiRoute = nextUrl.pathname.startsWith('/api')
  const isAuthRoute = nextUrl.pathname.startsWith('/api/auth')

  // Game join route (allow guests)
  const isGameJoinRoute = nextUrl.pathname.startsWith('/game/join')

  // Static files
  const isStaticFile =
    nextUrl.pathname.startsWith('/_next') ||
    nextUrl.pathname.includes('/favicon') ||
    nextUrl.pathname.includes('/images')

  // Allow static files and API routes
  if (isStaticFile || isAuthRoute) {
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute || isGameJoinRoute) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated and trying to access protected route
  if (!isLoggedIn && !isApiRoute) {
    const loginUrl = new URL('/login', nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For API routes, return 401 if not authenticated
  if (!isLoggedIn && isApiRoute) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
