import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from './lib/auth'

const protectedRoutes = ['/dashboard', '/products', '/partners', '/deliveries', '/sales']
const publicRoutes = ['/login']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.includes(path)

  const cookie = request.cookies.get('session')?.value
  const session = cookie ? await decrypt(cookie) : null

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.nextUrl))
  }

  if (
    isPublicRoute &&
    session?.userId &&
    !request.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.nextUrl))
  }
  
  if (path === '/') {
      return NextResponse.redirect(new URL(session ? '/dashboard' : '/login', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
