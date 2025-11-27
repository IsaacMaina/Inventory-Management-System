// src/app/api/auth/callback/route.ts
import { NextRequest } from 'next/server';
import { verifyPassword, isPasswordCompromised } from '@/lib/auth/utils';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { validateLoginCredentials, validateAndSanitizeEmail } from '@/lib/validation';
import { authRateLimiter } from '@/lib/rateLimit';
import { formatErrorResponse, AuthenticationError, RateLimitError } from '@/lib/errorHandler';
import { users } from '../../../../../drizzle/schema';

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling to prevent JSON parsing issues
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return Response.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validate inputs exist
    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate inputs first
    validateLoginCredentials({ email, password });

    // Sanitize email
    let sanitizedEmail;
    try {
      sanitizedEmail = validateAndSanitizeEmail(email);
    } catch (validationError) {
      console.error('Email validation error:', validationError);
      return Response.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Rate limiting check based on IP address and email
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `${clientIP}_${sanitizedEmail}`;

    const rateLimitResult = authRateLimiter.checkAuthLimit(rateLimitKey);
    if (!rateLimitResult.allowed) {
      return Response.json(
        { error: rateLimitResult.message || 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Find user by email - wrap in try-catch to handle database connection issues
    let user;
    try {
      const result = await db.select().from(users).where(eq(users.email, sanitizedEmail)).limit(1);
      user = result[0] || null;
    } catch (dbError) {
      console.error('Database error during user lookup:', dbError);
      return Response.json(
        { error: 'Authentication service temporarily unavailable' },
        { status: 503 } // Service unavailable
      );
    }

    if (!user || !user.password || !user.isActive) {
      // Even if user doesn't exist, we still verify the password to prevent timing attacks
      try {
        await verifyPassword(password, '$2a$10$invalidhashforsecurity');
      } catch (timingError) {
        // Ignore errors during dummy password verification for timing attack prevention
        console.warn('Dummy password verification failed (expected for timing attack prevention):', timingError);
      }
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if password is compromised (optional security enhancement)
    if (isPasswordCompromised(password)) {
      return Response.json(
        { error: 'Password has been compromised. Please choose a different password.' },
        { status: 400 }
      );
    }

    // Verify password
    let passwordsMatch = false;
    try {
      passwordsMatch = await verifyPassword(password, user.password);
    } catch (verificationError) {
      console.error('Password verification error:', verificationError);
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!passwordsMatch) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    // In a real implementation, you might want to clear the rate limit counter for successful logins

    // Return user data without sensitive information
    return Response.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Authentication callback error:', error);
    try {
      const errorResponse = formatErrorResponse(error);
      return Response.json(
        { error: errorResponse.error },
        { status: errorResponse.status }
      );
    } catch (formatError) {
      // If the error formatter itself fails, return a generic error
      console.error('Error formatting error response:', formatError);
      return Response.json(
        { error: 'An unexpected error occurred during authentication' },
        { status: 500 }
      );
    }
  }
}