import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import prisma from './prismadb'

// Define session type to handle NextAuth session structure
interface SessionUser {
  user?: {
    email?: string | null
    name?: string | null
  }
}

export interface AdminAuthResult {
  isAuthenticated: boolean
  isAdmin: boolean
  user?: {
    id: string
    email: string
    subscriptionId: string | null
  }
  error?: string
}

/**
 * Unified admin authentication and authorization helper
 * Use this instead of manual checks in admin endpoints
 */
export async function verifyAdminAccess(request: NextRequest): Promise<AdminAuthResult> {
  try {
    // Check for legacy header-based auth first (for backward compatibility)
    const authHeader = request.headers.get('Authorization')
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Use legacy authentication method
      return await verifyAdminAccessLegacy(request)
    }
    
    // Try to get session (preferred method for new implementations)
    const session = await getServerSession(authOptions as any) as SessionUser
    
    let userEmail: string | null = null
    
    if (session?.user?.email) {
      userEmail = session.user.email
    } else {
      // Fallback: check if middleware added user email to headers
      userEmail = request.headers.get('x-user-email')
    }
    
    if (!userEmail) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        error: "לא מחובר למערכת"
      }
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      select: {
        id: true,
        email: true,
        subscriptionId: true
      }
    })

    if (!user) {
      return {
        isAuthenticated: true,
        isAdmin: false,
        error: "משתמש לא נמצא"
      }
    }

    // Check admin privileges
    const isAdmin = user.subscriptionId === "Admin"

    if (!isAdmin) {
      return {
        isAuthenticated: true,
        isAdmin: false,
        user: {
          id: user.id,
          email: user.email,
          subscriptionId: user.subscriptionId
        },
        error: "אין הרשאות מנהל"
      }
    }

    return {
      isAuthenticated: true,
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email,
        subscriptionId: user.subscriptionId
      }
    }

  } catch (error) {
    console.error('Admin auth verification error:', error)
    return {
      isAuthenticated: false,
      isAdmin: false,
      error: "שגיאת שרת פנימית"
    }
  }
}

/**
 * Legacy support for header-based auth (gradually migrate away from this)
 */
export async function verifyAdminAccessLegacy(request: NextRequest): Promise<AdminAuthResult> {
  try {
    const authHeader = request.headers.get("Authorization")
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        error: "אין הרשאות מתאימות"
      }
    }

    const email = authHeader.split(" ")[1]
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        subscriptionId: true
      }
    })

    if (!user || user.subscriptionId !== "Admin") {
      return {
        isAuthenticated: false,
        isAdmin: false,
        error: "אין הרשאות מתאימות"
      }
    }

    return {
      isAuthenticated: true,
      isAdmin: true,
      user: {
        id: user.id,
        email: user.email,
        subscriptionId: user.subscriptionId
      }
    }

  } catch (error) {
    console.error('Legacy admin auth error:', error)
    return {
      isAuthenticated: false,
      isAdmin: false,
      error: "שגיאת שרת פנימית"
    }
  }
}
