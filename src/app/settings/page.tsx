import SettingsClient from './SettingsClient';
import { getCurrentUserFromSession } from '@/lib/auth/session-utils';

const SettingsPage = async () => {
  let initialUserData = null;
  let error = null;

  try {
    const user = await getCurrentUserFromSession();
    initialUserData = {
      name: user.name,
      email: user.email,
    };
  } catch (err) {
    console.error('Error fetching user data:', err);
    error = err instanceof Error ? err.message : 'Failed to load user data';
  }

  return <SettingsClient initialUserData={initialUserData} error={error} />;
};

export default SettingsPage;