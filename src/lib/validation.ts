import { z } from 'zod';

// Input validation schemas
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters'),
});

export const productSchema = z.object({
  name: z.string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be less than 255 characters'),
  description: z.string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
  price: z.number()
    .positive('Price must be a positive number'),
  quantity: z.number()
    .nonnegative('Quantity cannot be negative'),
  category: z.string()
    .min(1, 'Category is required')
    .max(100, 'Category must be less than 100 characters'),
});

// Sanitization functions
export function sanitizeString(input: string): string {
  // Remove potentially dangerous characters, trim whitespace
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '') // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframe tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove object tags
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, ''); // Remove embed tags
}

export function sanitizeHtml(input: string): string {
  // Basic HTML sanitization (in production, use a dedicated library like DOMPurify)
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

// Validate and sanitize email
export function validateAndSanitizeEmail(email: string): string {
  const trimmedEmail = email.trim().toLowerCase();
  if (!userSchema.shape.email.safeParse(trimmedEmail).success) {
    throw new Error('Invalid email format');
  }
  return trimmedEmail;
}

// Validate and sanitize password
export function validatePassword(password: string): boolean {
  return userSchema.shape.password.safeParse(password).success;
}

// Validate and sanitize user input
export function validateUserInput(input: {
  email: string;
  name: string;
  password: string;
}): void {
  const result = userSchema.safeParse(input);
  if (!result.success) {
    const errors = result.error.errors.map(err => err.message).join(', ');
    throw new Error(`Validation error: ${errors}`);
  }
}

// Validate and sanitize login credentials
export function validateLoginCredentials(credentials: {
  email: string;
  password: string;
}): void {
  const result = loginSchema.safeParse(credentials);
  if (!result.success) {
    const errors = result.error.errors.map(err => err.message).join(', ');
    throw new Error(`Validation error: ${errors}`);
  }
}

// Validate and sanitize product input
export function validateProductInput(input: {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  category: string;
}): void {
  const result = productSchema.safeParse(input);
  if (!result.success) {
    const errors = result.error.errors.map(err => err.message).join(', ');
    throw new Error(`Validation error: ${errors}`);
  }
}