// src/app/api/business-settings/route.ts

import { NextRequest } from 'next/server';
import { getBusinessSettings } from '@/actions/businessSettingsActions';
import { getCurrentUserFromSession } from '@/lib/auth/session-utils';

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUserFromSession();
    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get business settings for the user
    const businessSettings = await getBusinessSettings();

    return Response.json(businessSettings || {});
  } catch (error) {
    console.error('Error fetching business settings:', error);
    return Response.json(
      { error: 'Failed to fetch business settings' },
      { status: 500 }
    );
  }
}