import AnalyticsClient from './AnalyticsClient';
import { getAnalyticsData } from '@/lib/actions/analytics';
import { getCurrentUserFromSession } from '@/lib/auth/session-utils';

const AnalyticsPage = async () => {
  let initialData = null;

  try {
    // Get user context from the session
    const user = await getCurrentUserFromSession();
    initialData = await getAnalyticsData(user);
  } catch (error) {
    console.error('Error fetching analytics data:', error);
  }

  return <AnalyticsClient initialData={initialData} />;
};

export default AnalyticsPage;