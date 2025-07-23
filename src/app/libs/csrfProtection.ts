import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]/route'
import crypto from 'crypto'

// Define session type to handle NextAuth session structure
interface SessionUser {
  user?: {
    email?: string | null
    name?: string | null
  }
}

// In-memory store for CSRF tokens (use Redis in production)
const csrfTokens = new Map<string, { token: string; expires: number }>()

/**
 * CSRF Protection utility
 * Generates and validates CSRF tokens for admin actions
 */

export interface CSRFTokenResult {
  token: string
  expires: number
}

/**
 * Generate a CSRF token for a user session
 */
export async function generateCSRFToken(request: NextRequest): Promise<CSRFTokenResult | null> {
  try {
    const session = await getServerSession(authOptions as any) as SessionUser
    
    if (!session?.user?.email) {
      return null
    }
    
    const token = crypto.randomBytes(32).toString('hex')
    const expires = Date.now() + (60 * 60 * 1000) // 1 hour
    
    csrfTokens.set(session.user.email, { token, expires })
    
    // Clean up expired tokens
    const now = Date.now()
    for (const [email, tokenData] of Array.from(csrfTokens.entries())) {
      if (now > tokenData.expires) {
        csrfTokens.delete(email)
      }
    }
    
    return { token, expires }
  } catch (error) {
    console.error('Error generating CSRF token:', error)
    return null
  }
}

/**
 * Validate CSRF token for admin actions
 */
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  try {
    const session = await getServerSession(authOptions as any) as SessionUser
    
    if (!session?.user?.email) {
      return false
    }
    
    const providedToken = request.headers.get('x-csrf-token') || 
                         request.headers.get('X-CSRF-Token')
    
    if (!providedToken) {
      return false
    }
    
    const storedTokenData = csrfTokens.get(session.user.email)
    
    if (!storedTokenData) {
      return false
    }
    
    // Check if token has expired
    if (Date.now() > storedTokenData.expires) {
      csrfTokens.delete(session.user.email)
      return false
    }
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(providedToken, 'hex') as unknown as Uint8Array,
      Buffer.from(storedTokenData.token, 'hex') as unknown as Uint8Array
    )
  } catch (error) {
    console.error('Error validating CSRF token:', error)
    return false
  }
}

/**
 * CSRF protection middleware for admin actions
 */
export function requireCSRFToken() {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    // Skip CSRF for GET requests (they should be safe)
    if (request.method === 'GET') {
      return null
    }
    
    const isValid = await validateCSRFToken(request)
    
    if (!isValid) {
      return NextResponse.json(
        { 
          error: 'אסימון CSRF לא תקין או חסר',
          code: 'CSRF_TOKEN_INVALID'
        },
        { status: 403 }
      )
    }
    
    return null // Allow request
  }
}

/**
 * API endpoint to get CSRF token
 */
export async function getCSRFTokenHandler(request: NextRequest): Promise<NextResponse> {
  const tokenResult = await generateCSRFToken(request)
  
  if (!tokenResult) {
    return NextResponse.json(
      { error: 'לא ניתן ליצור אסימון CSRF' },
      { status: 401 }
    )
  }
  
  return NextResponse.json({
    token: tokenResult.token,
    expires: tokenResult.expires
  })
}
