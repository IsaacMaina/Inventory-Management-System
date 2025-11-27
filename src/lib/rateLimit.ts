// src/lib/rateLimit.ts
// Simple in-memory rate limiter for demo purposes
// In production, use Redis or a database for distributed rate limiting

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  message?: string;
}

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) { // 15 minutes, 100 requests
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!store[key] || store[key].resetTime < windowStart) {
      // New window, reset the counter
      store[key] = {
        count: 1,
        resetTime: now + this.windowMs
      };
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime: store[key].resetTime
      };
    }

    // Check if we're under the limit
    if (store[key].count < this.maxRequests) {
      store[key].count++;
      return {
        allowed: true,
        remaining: this.maxRequests - store[key].count,
        resetTime: store[key].resetTime
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: store[key].resetTime,
      message: 'Rate limit exceeded. Please try again later.'
    };
  }

  // Specific rate limiter for authentication attempts
  checkAuthLimit(identifier: string): RateLimitResult {
    // Use a stricter limit for auth attempts (e.g., 5 attempts per 15 minutes)
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxAttempts = 5;
    const windowStart = now - windowMs;

    const authKey = `auth_${identifier}`;
    
    if (!store[authKey] || store[authKey].resetTime < windowStart) {
      // New window, reset the counter
      store[authKey] = {
        count: 1,
        resetTime: now + windowMs
      };
      return {
        allowed: true,
        remaining: maxAttempts - 1,
        resetTime: store[authKey].resetTime
      };
    }

    // Check if we're under the limit
    if (store[authKey].count < maxAttempts) {
      store[authKey].count++;
      return {
        allowed: true,
        remaining: maxAttempts - store[authKey].count,
        resetTime: store[authKey].resetTime
      };
    }

    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: store[authKey].resetTime,
      message: 'Too many authentication attempts. Please try again later.'
    };
  }
}

// Create a default rate limiter instance
export const defaultRateLimiter = new RateLimiter();

// Specific instance for authentication
export const authRateLimiter = new RateLimiter(15 * 60 * 1000, 5); // 15 minutes, 5 attempts