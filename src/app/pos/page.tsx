import { getCurrentUserFromSession } from '@/lib/auth/session-utils';
import POSClient from './POSClient';
import { getProducts } from '@/actions/categoryActions';

const POSPage = async () => {
  let initialData = null;
  let error = null;

  try {
    // Get user context from the session
    const user = await getCurrentUserFromSession();
    initialData = await getProducts(user);
  } catch (error) {
    console.error('Error fetching POS data:', error);
    error = (error as Error).message;
  }

  // If there was an error and no data, provide empty default data instead of null
  if (!initialData && error) {
    initialData = [];
  }

  return <POSClient initialProducts={initialData} />;
};

export default POSPage;