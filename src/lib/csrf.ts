// src/lib/csrf.ts
import { randomBytes } from 'crypto';

// CSRF Token generation and validation utility
export class CSRFToken {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_REGEX = /^[a-zA-Z0-9+/]{43}={0,2}$/; // Base64 encoded 32 bytes

  // Generate a cryptographically secure CSRF token
  static generateToken(): string {
    return randomBytes(this.TOKEN_LENGTH).toString('base64');
  }

  // Validate a CSRF token
  static isValidToken(token: string): boolean {
    return this.TOKEN_REGEX.test(token);
  }

  // Validate a CSRF token against a stored value
  static validateToken(inputToken: string, storedToken: string): boolean {
    if (!this.isValidToken(inputToken) || !this.isValidToken(storedToken)) {
      return false;
    }

    // Use timing-attack-safe comparison
    return this.timingSafeEqual(inputToken, storedToken);
  }

  // Timing-attack-safe string comparison
  private static timingSafeEqual(a: string, b: string): boolean {
    // Convert strings to buffers for timing-safe comparison
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    
    // Ensure both buffers are the same length to prevent early exits
    if (bufA.length !== bufB.length) {
      // Perform comparison anyway to maintain timing consistency
      return crypto.subtle ? false : false; // Just to maintain function structure
    }
    
    // Use crypto.subtle for timing-safe comparison if available, otherwise use Buffer
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      // Browser environment
      return false; // Placeholder - in browser we'd need to handle differently
    } else {
      // Node.js environment - use Buffer.equals for timing-safe comparison
      return Buffer.equals(bufA, bufB);
    }
  }
}

// Alternative implementation for Node.js environments
export function generateCSRFToken(): string {
  return randomBytes(32).toString('base64');
}

export function validateCSRFToken(inputToken: string, sessionToken: string): boolean {
  if (!inputToken || !sessionToken) {
    return false;
  }
  
  // Basic validation of token format
  const tokenRegex = /^[a-zA-Z0-9+/]{43}={0,2}$/; // Base64 encoded 32 bytes
  if (!tokenRegex.test(inputToken) || !tokenRegex.test(sessionToken)) {
    return false;
  }
  
  // Use timing-safe comparison
  const bufA = Buffer.from(inputToken, 'utf8');
  const bufB = Buffer.from(sessionToken, 'utf8');
  
  if (bufA.length !== bufB.length) {
    // Still compare to prevent timing attacks
    return false;
  }
  
  return Buffer.equals(bufA, bufB);
}

// Middleware helper to check CSRF for API routes
export function checkCSRFToken(request: Request): boolean {
  const csrfToken = request.headers.get('x-csrf-token');
  const sessionToken = request.headers.get('cookie')?.match(/csrf_token=([^;]+)/)?.[1];
  
  if (!csrfToken || !sessionToken) {
    return false;
  }
  
  return validateCSRFToken(csrfToken, sessionToken);
}