import { getReports } from '@/lib/actions/reports';
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { checkPermission } from '@/lib/auth/server';
import { Permission } from '@/lib/authorization';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user first
    const session = await auth();
    if (!session || !session.user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to access reports
    const hasPerm = await checkPermission(Permission.REPORTS_READ);
    if (!hasPerm) {
      return Response.json({ error: 'Access denied: Insufficient permissions to view reports' }, { status: 403 });
    }

    const reportsData = await getReports();

    return Response.json(reportsData);
  } catch (error) {
    console.error('Error fetching reports data:', error);

    // Return empty data in case of error
    return Response.json({
      reports: [],
      totalReports: 0
    }, { status: 500 });
  }
}