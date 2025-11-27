import { getDashboardData } from '@/lib/actions/dashboard';
import { getCurrentUserFromSession } from '@/lib/auth/session-utils'; // We'll create this helper
import DashboardClient from './DashboardClient';

const DashboardPage = async () => {
  let initialData = null;
  let error = null;

  try {
    // Get user context from the session
    const user = await getCurrentUserFromSession();
    // Now call the dashboard function with user context
    initialData = await getDashboardData(user);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    error = (error as Error).message;
  }

  // If there was an error and no data, provide empty default data instead of null
  if (!initialData && error) {
    initialData = {
      metrics: {
        totalProducts: 0,
        lowStockItems: 0,
        totalValue: 0,
        activeSuppliers: 0
      },
      recentActivity: [],
      inventoryDistribution: []
    };
  }

  return <DashboardClient initialData={initialData} />;
};

export default DashboardPage;