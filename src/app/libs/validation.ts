import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * Input validation utility using Zod
 * Provides type-safe validation for API endpoints
 */

// Common validation schemas
export const commonSchemas = {
  email: z.string().email('כתובת אימייל לא תקינה'),
  userId: z.string().min(1, 'מזהה משתמש נדרש'),
  subscriptionId: z.string().optional(),
  name: z.string().min(1, 'שם נדרש').max(100, 'שם ארוך מדי'),
  message: z.string().min(1, 'הודעה נדרשת').max(5000, 'הודעה ארוכה מדי'),
  url: z.string().url('כתובת URL לא תקינה').optional(),
}

// Admin-specific validation schemas
export const adminSchemas = {
  updateUser: z.object({
    userId: commonSchemas.userId,
    subscriptionId: commonSchemas.subscriptionId,
    name: commonSchemas.name.optional(),
    userEmail: commonSchemas.email.optional(),
    trialStartDate: z.string().optional(),
    cancellationDate: z.string().optional(),
  }),
  
  sendMessage: z.object({
    title: z.string().min(1, 'כותרת נדרשת').max(200, 'כותרת ארוכה מדי'),
    content: commonSchemas.message,
    link: commonSchemas.url,
    linkText: z.string().max(100, 'טקסט קישור ארוך מדי').optional(),
  }),
  
  deleteUser: z.object({
    userId: commonSchemas.userId,
  }),
}

// Authentication validation schemas
export const authSchemas = {
  login: z.object({
    email: commonSchemas.email,
    password: z.string().min(6, 'סיסמה חייבת להיות באורך של 6 תווים לפחות'),
  }),
  
  register: z.object({
    name: commonSchemas.name,
    email: commonSchemas.email,
    password: z.string().min(6, 'סיסמה חייבת להיות באורך של 6 תווים לפחות'),
    subscribeToNewsletter: z.boolean().optional(),
  }),
  
  resetPassword: z.object({
    email: commonSchemas.email,
  }),
}

/**
 * Validates request body against a Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: any) => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      
      return {
        success: false,
        error: NextResponse.json(
          { 
            error: 'נתונים לא תקינים',
            details: errorMessages,
            issues: error.issues
          },
          { status: 400 }
        )
      }
    }
    
    return {
      success: false,
      error: NextResponse.json(
        { error: 'שגיאה בעיבוד הנתונים' },
        { status: 400 }
      )
    }
  }
}

/**
 * Validates query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: NextResponse } {
  try {
    const url = new URL(request.url)
    const params = Object.fromEntries(url.searchParams.entries())
    const validatedData = schema.parse(params)
    
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: any) => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      
      return {
        success: false,
        error: NextResponse.json(
          { 
            error: 'פרמטרים לא תקינים',
            details: errorMessages
          },
          { status: 400 }
        )
      }
    }
    
    return {
      success: false,
      error: NextResponse.json(
        { error: 'שגיאה בעיבוד הפרמטרים' },
        { status: 400 }
      )
    }
  }
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}
