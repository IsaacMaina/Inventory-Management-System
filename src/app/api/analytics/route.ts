import { getAnalyticsData } from '@/lib/actions/analytics';
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

    // Check if user has permission to access analytics
    const hasPerm = await checkPermission(Permission.ANALYTICS_READ);
    if (!hasPerm) {
      return Response.json({ error: 'Access denied: Insufficient permissions to view analytics' }, { status: 403 });
    }

    const analyticsData = await getAnalyticsData();

    return Response.json(analyticsData);
  } catch (error) {
    console.error('Error fetching analytics data:', error);

    // Return empty data in case of error
    return Response.json({
      analyticsMetrics: [
        { title: 'Total Inventory Value', value: 'KES 0', change: '0%', icon: '💰' },
        { title: 'Stock Transactions Today', value: '0', change: '0%', icon: '📊' },
        { title: 'Low Stock Items', value: '0 Items', change: '0%', icon: '⚠️' },
        { title: 'Top Category', value: 'No data', change: '0%', icon: '🔝' },
      ],
      inventoryTrends: [],
      categoryDistribution: [],
      productPerformance: [],
      transactionHistory: []
    }, { status: 500 });
  }
}