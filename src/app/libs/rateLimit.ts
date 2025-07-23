import { NextRequest, NextResponse } from 'next/server'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  message?: string // Custom error message
}

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a dedicated rate limiting service
 */
export function rateLimit(config: RateLimitConfig) {
  return (request: NextRequest): NextResponse | null => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const key = `${ip}:${request.nextUrl.pathname}`
    const now = Date.now()
    
    // Clean up expired entries
    const entries = Array.from(requestCounts.entries())
    for (const [k, v] of entries) {
      if (now > v.resetTime) {
        requestCounts.delete(k)
      }
    }
    
    const current = requestCounts.get(key)
    
    if (!current) {
      // First request from this IP for this endpoint
      requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Allow request
    }
    
    if (now > current.resetTime) {
      // Window has expired, reset
      requestCounts.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return null // Allow request
    }
    
    if (current.count >= config.maxRequests) {
      // Rate limit exceeded
      return NextResponse.json(
        { 
          error: config.message || 'יותר מדי בקשות. נסה שוב מאוחר יותר.',
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((current.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': Math.max(0, config.maxRequests - current.count).toString(),
            'X-RateLimit-Reset': Math.ceil(current.resetTime / 1000).toString()
          }
        }
      )
    }
    
    // Increment counter
    current.count++
    return null // Allow request
  }
}

// Predefined rate limit configurations
export const rateLimitConfigs = {
  // Very strict for admin actions
  adminActions: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute
    message: 'יותר מדי פעולות מנהל. נסה שוב בעוד דקה.'
  },
  
  // Moderate for authentication
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'יותר מדי ניסיונות התחברות. נסה שוב בעוד 15 דקות.'
  },
  
  // Lenient for general API calls
  general: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    message: 'יותר מדי בקשות. נסה שוב בעוד דקה.'
  },
  
  // Very strict for PayPal operations
  paypal: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3, // 3 requests per 5 minutes
    message: 'יותר מדי פעולות PayPal. נסה שוב בעוד 5 דקות.'
  }
}
