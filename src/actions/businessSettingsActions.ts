// src/actions/businessSettingsActions.ts

'use server';

import { db } from '@/lib/db';
import { businessSettings } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUserFromSession } from '@/lib/auth/session-utils';
import { z } from 'zod';

const BusinessSettingsSchema = z.object({
  businessName: z.string().optional(),
  mpesaPaybill: z.string().optional(),
  mpesaTill: z.string().optional(),
  mpesaSendNumber: z.string().optional(),
  mpesaPochiNumber: z.string().optional(),
});

export type BusinessSettingsInput = z.infer<typeof BusinessSettingsSchema>;

export async function saveBusinessSettings(input: BusinessSettingsInput) {
  try {
    // Validate input
    const validatedInput = BusinessSettingsSchema.parse(input);

    // Get current user
    const user = await getCurrentUserFromSession();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if business settings already exist for this user
    const existingSettings = await db
      .select()
      .from(businessSettings)
      .where(eq(businessSettings.userId, user.id));

    let result;
    if (existingSettings.length > 0) {
      // Update existing settings
      result = await db
        .update(businessSettings)
        .set({
          businessName: validatedInput.businessName,
          mpesaPaybill: validatedInput.mpesaPaybill,
          mpesaTill: validatedInput.mpesaTill,
          mpesaSendNumber: validatedInput.mpesaSendNumber,
          mpesaPochiNumber: validatedInput.mpesaPochiNumber,
          updatedAt: new Date(),
        })
        .where(eq(businessSettings.userId, user.id))
        .returning();
    } else {
      // Create new settings
      result = await db
        .insert(businessSettings)
        .values({
          businessName: validatedInput.businessName,
          mpesaPaybill: validatedInput.mpesaPaybill,
          mpesaTill: validatedInput.mpesaTill,
          mpesaSendNumber: validatedInput.mpesaSendNumber,
          mpesaPochiNumber: validatedInput.mpesaPochiNumber,
          userId: user.id,
        })
        .returning();
    }

    return {
      success: true,
      message: 'Business settings saved successfully',
      data: result[0],
    };
  } catch (error) {
    console.error('Error saving business settings:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save business settings',
    };
  }
}

export async function getBusinessSettings() {
  try {
    // Get current user
    const user = await getCurrentUserFromSession();
    
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get business settings for this user
    const settings = await db
      .select()
      .from(businessSettings)
      .where(eq(businessSettings.userId, user.id))
      .limit(1);

    return settings[0] || null;
  } catch (error) {
    console.error('Error fetching business settings:', error);
    throw error;
  }
}