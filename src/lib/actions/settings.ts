'use server';

import { db } from '@/lib/db';
import { users, inventoryItems, suppliers, notifications, reports } from '../../../drizzle/schema';
import { eq, and, or } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth/server';
import { hash, compare } from 'bcryptjs';
import { z } from 'zod';
import { formatErrorResponse, ValidationError, AuthenticationError } from '@/lib/errorHandler';

// Schema for updating user profile
const UpdateProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name must not exceed 100 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must not exceed 255 characters')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email format is invalid'),
});

// Schema for changing password
const ChangePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'Please enter your current password'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "New passwords don't match",
  path: ["confirmNewPassword"],
});

export async function updateProfile(data: { name: string; email: string }, userContext: any) {
  try {
    // Validate input
    const validatedData = UpdateProfileSchema.parse(data);

    // Validate that user has an ID
    if (!userContext.id) {
      throw new ValidationError('User ID is not available. Please login again.');
    }

    // Basic permission check - users can update their own profile
    // In a real implementation, you might have additional checks
    // For now, just ensure user is authenticated

    // Update user profile in database
    const [updatedUser] = await db.update(users)
      .set({
        name: validatedData.name,
        email: validatedData.email,
      })
      .where(eq(users.id, userContext.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      });

    return {
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully',
    };
  } catch (error) {
    console.error('Error updating profile:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }

    // Note: Email uniqueness is handled at the database level (in schema)
    // Drizzle will throw a constraint violation error which will be caught by the SettingsClient component

    // Log the full error for debugging but don't expose internal details to the client
    const errorResponse = formatErrorResponse(error);
    return {
      success: false,
      error: errorResponse.error,
    };
  }
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}, userContext: any) {
  try {
    // Validate input
    const validatedData = ChangePasswordSchema.parse(data);

    // Validate that user has an ID
    if (!userContext.id) {
      throw new ValidationError('User ID is not available. Please login again.');
    }

    // Basic permission check - users can change their own password
    // In a real implementation, you might have additional checks
    // For now, just ensure user is authenticated

    // Fetch the user from database to get password hash
    const [dbUser] = await db.select({ password: users.password }).from(users).where(eq(users.id, userContext.id)).limit(1);

    if (!dbUser) {
      throw new ValidationError('User not found in database');
    }

    // Verify the current password matches the stored hash
    const isCurrentPasswordValid = await compare(validatedData.currentPassword, dbUser.password);

    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash the new password
    const hashedPassword = await hash(validatedData.newPassword, 12);

    // Update user password in database
    await db.update(users)
      .set({
        password: hashedPassword,
      })
      .where(eq(users.id, userContext.id));

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    console.error('Error changing password:', error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.issues[0]?.message || 'Validation error',
      };
    }

    // Log the full error for debugging but don't expose internal details to the client
    const errorResponse = formatErrorResponse(error);
    return {
      success: false,
      error: errorResponse.error,
    };
  }
}