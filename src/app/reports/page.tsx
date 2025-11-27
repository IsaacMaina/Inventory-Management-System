import ReportsClient from './ReportsClient';
import { getReports } from '@/lib/actions/reports';
import { getCurrentUserFromSession } from '@/lib/auth/session-utils';

const ReportsPage = async () => {
  let initialData = null;
  let error = null;

  try {
    // Get user context from the session
    const user = await getCurrentUserFromSession();
    initialData = await getReports(user);
  } catch (error) {
    console.error('Error fetching reports data:', error);
    error = (error as Error).message;
  }

  // If there was an error and no data, provide empty default data instead of null
  if (!initialData && error) {
    initialData = {
      reports: [],
      totalReports: 0
    };
  }

  return <ReportsClient initialData={initialData} />;
};

export default ReportsPage;