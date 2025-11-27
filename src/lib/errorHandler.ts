// src/lib/errorHandler.ts

// Custom application errors
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Mark as operational error (not a programming error)

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 403);
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

// Function to format error responses
export function formatErrorResponse(error: unknown): { error: string; status: number } {
  if (error instanceof AppError) {
    // Operational errors that we can safely show to the user
    return {
      error: error.message,
      status: error.statusCode
    };
  } else if (error instanceof Error) {
    // For other errors, we log them but don't expose internal details
    console.error('Unexpected error:', error);
    
    // Return generic message to avoid exposing internal details
    return {
      error: 'An unexpected error occurred',
      status: 500
    };
  } else {
    // For non-error objects, return generic error
    console.error('Unknown error type:', error);
    return {
      error: 'An unexpected error occurred',
      status: 500
    };
  }
}

// Function to handle errors in API routes while avoiding exposing sensitive information
export async function handleApiRouteError(
  fn: () => Promise<Response>,
  operationName: string = 'operation'
): Promise<Response> {
  try {
    return await fn();
  } catch (error) {
    console.error(`Error in ${operationName}:`, error);
    
    const errorResponse = formatErrorResponse(error);
    
    return Response.json(
      { error: errorResponse.error },
      { status: errorResponse.status }
    );
  }
}

// Function to sanitize error data before logging or returning
export function sanitizeErrorData(data: any): any {
  if (!data) return data;
  
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'cookie', 
    'authorization', 'session', 'credentials', 'email'
  ];
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeErrorData(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
  
  return data;
}

// Middleware-style error handler for Express-like applications
export function withErrorHandling<T extends Function>(fn: T): T {
  return ((async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Error in function:', fn.name, error);
      const errorResponse = formatErrorResponse(error);
      throw new AppError(errorResponse.error, errorResponse.status);
    }
  }) as unknown) as T;
}