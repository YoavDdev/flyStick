import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply middleware to admin API routes
  if (pathname.startsWith('/api/admin/')) {
    try {
      // Check for legacy header-based auth first (for backward compatibility)
      const authHeader = request.headers.get('Authorization')
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // Legacy header-based auth - let it pass through
        // The individual endpoints will handle validation
        return NextResponse.next()
      }
      
      // Try JWT token authentication
      const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET || process.env.SECRET 
      })

      // Check if user is authenticated via JWT
      if (!token || !token.email) {
        return NextResponse.json(
          { error: "אין הרשאות מתאימות - נדרש להתחבר" },
          { status: 401 }
        )
      }

      // Add user email to headers for easy access in API routes
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-user-email', token.email as string)
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    } catch (error) {
      console.error('Middleware authentication error:', error)
      return NextResponse.json(
        { error: "שגיאת אימות" },
        { status: 500 }
      )
    }
  }

  // Allow all other requests to pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Apply to all admin API routes
    '/api/admin/:path*',
  ]
}
