import { NextRequest } from 'next/server'
import { getCSRFTokenHandler } from '@/app/libs/csrfProtection'

/**
 * CSRF Token endpoint
 * GET /api/csrf-token - Returns a CSRF token for the current session
 */
export async function GET(request: NextRequest) {
  return getCSRFTokenHandler(request)
}
