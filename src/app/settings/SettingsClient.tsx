'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BaseLayout from '@/components/layout/BaseLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FadeIn, SlideIn } from '@/components/animations/FramerAnimations';
import { updateProfile, changePassword } from '@/lib/actions/settings';
import toast from 'react-hot-toast';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Session } from 'next-auth';

interface SettingsClientProps {
  initialUserData: {
    name: string | null;
    email: string;
  } | null;
  error?: string | null;
}

const SettingsClient = ({ initialUserData, error }: SettingsClientProps) => {
  const { data: session, update: updateSession } = useSession();

  // State for user profile
  const [profile, setProfile] = useState({
    name: initialUserData?.name || '',
    email: initialUserData?.email || '',
  });

  // State for validation errors
  const [profileErrors, setProfileErrors] = useState({
    name: '',
    email: '',
  });

  // State for password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  // State for password errors
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  
  // State for form submission loading
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  // Update form values when initial data or session changes
  useEffect(() => {
    if (session?.user) {
      setProfile({
        name: session.user.name || '',
        email: session.user.email || '',
      });
    } else if (initialUserData) {
      setProfile({
        name: initialUserData.name || '',
        email: initialUserData.email,
      });
    }
  }, [initialUserData, session]);

  // Handle profile update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation first
    const validationErrors = validateProfile(profile);
    if (Object.keys(validationErrors).length > 0) {
      setProfileErrors(validationErrors as { name: string; email: string });
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setProfileLoading(true);
    setProfileErrors({ name: '', email: '' }); // Clear errors on submit

    try {
      // Get the user ID from the session
      const userId = session?.user?.id;
      if (!userId) {
        toast.error('User session not available');
        return;
      }

      const result = await updateProfile({
        name: profile.name,
        email: profile.email,
      }, { id: userId });

      if (result.success) {
        toast.success(result.message || 'Profile updated successfully');

        // Call updateSession without parameters to refetch the session from server
        // This will fetch the updated user data from the database
        await updateSession();

        // Update the local state to reflect the changes immediately
        setProfile({
          name: result.user.name || '',
          email: result.user.email,
        });
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation first
    const validationErrors = validatePassword(passwordData);
    if (Object.keys(validationErrors).length > 0) {
      setPasswordErrors(validationErrors as {
        currentPassword: string;
        newPassword: string;
        confirmNewPassword: string
      });
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setPasswordLoading(true);
    setPasswordErrors({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: ''
    }); // Clear errors on submit

    try {
      // Get the user ID from the session
      const userId = session?.user?.id;
      if (!userId) {
        toast.error('User session not available');
        return;
      }

      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmNewPassword,
      }, { id: userId });

      if (result.success) {
        toast.success(result.message || 'Password changed successfully');
        // Reset form
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    } catch (err) {
      console.error('Error changing password:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Validation functions
  const validateProfile = (data: { name: string; email: string }) => {
    const errors: { name?: string; email?: string } = {};

    if (data.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    } else if (!/^[a-zA-Z\s]+$/.test(data.name)) {
      errors.name = 'Name can only contain letters and spaces';
    } else if (data.name.length > 100) {
      errors.name = 'Name must not exceed 100 characters';
    }

    if (!data.email) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (data.email.length > 255) {
      errors.email = 'Email must not exceed 255 characters';
    }

    return errors;
  };

  const validatePassword = (data: {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
  }) => {
    const errors: {
      currentPassword?: string;
      newPassword?: string;
      confirmNewPassword?: string;
    } = {};

    if (!data.currentPassword) {
      errors.currentPassword = 'Please enter your current password';
    }

    if (data.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long';
    } else if (data.newPassword.length > 128) {
      errors.newPassword = 'Password must not exceed 128 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.newPassword)) {
      errors.newPassword = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    if (data.newPassword !== data.confirmNewPassword) {
      errors.confirmNewPassword = "New passwords don't match";
    }

    return errors;
  };

  // Handle input changes for profile
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (profileErrors[name as keyof typeof profileErrors]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle input changes for password
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (passwordErrors[name as keyof typeof passwordErrors]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  if (error) {
    return (
      <BaseLayout>
        <div className="p-4 md:p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-red-500">{error}</p>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout>
      <div className="space-y-6">
        <FadeIn>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage your account and application settings</p>
          </div>
        </FadeIn>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Settings */}
          <SlideIn direction="up">
            <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleProfileSubmit}>
                  <div>
                    <label className="block text-sm font-medium mb-2">Username</label>
                    <input
                      type="text"
                      name="name"
                      className={`w-full p-2 rounded bg-gray-700 border ${
                        profileErrors.name ? 'border-red-500' : 'border-gray-600'
                      } focus:border-blue-500 focus:outline-none`}
                      value={profile.name}
                      onChange={handleProfileChange}
                    />
                    {profileErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      className={`w-full p-2 rounded bg-gray-700 border ${
                        profileErrors.email ? 'border-red-500' : 'border-gray-600'
                      } focus:border-blue-500 focus:outline-none`}
                      value={profile.email}
                      onChange={handleProfileChange}
                    />
                    {profileErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{profileErrors.email}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="mt-4 px-4 py-2 rounded-md text-sm font-medium bg-gray-500 cursor-not-allowed"
                    disabled
                  >
                    Save Changes
                  </button>
                </form>
              </CardContent>
            </Card>
          </SlideIn>

          {/* Password Settings */}
          <SlideIn direction="up">
            <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Password Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handlePasswordSubmit}>
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        className={`w-full p-2 rounded bg-gray-700 border ${
                          passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-600'
                        } focus:border-blue-500 focus:outline-none pr-10`}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {passwordErrors.currentPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        className={`w-full p-2 rounded bg-gray-700 border ${
                          passwordErrors.newPassword ? 'border-red-500' : 'border-gray-600'
                        } focus:border-blue-500 focus:outline-none pr-10`}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmNewPassword ? "text" : "password"}
                        name="confirmNewPassword"
                        className={`w-full p-2 rounded bg-gray-700 border ${
                          passwordErrors.confirmNewPassword ? 'border-red-500' : 'border-gray-600'
                        } focus:border-blue-500 focus:outline-none pr-10`}
                        value={passwordData.confirmNewPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      >
                        {showConfirmNewPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {passwordErrors.confirmNewPassword && (
                      <p className="text-red-500 text-sm mt-1">{passwordErrors.confirmNewPassword}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="mt-4 px-4 py-2 rounded-md text-sm font-medium bg-gray-500 cursor-not-allowed"
                    disabled
                  >
                    Change Password
                  </button>
                </form>
              </CardContent>
            </Card>
          </SlideIn>

          {/* General Settings */}
          <SlideIn direction="up" className="md:col-span-2">
            <Card className="glass border-gray-700 bg-gray-800/30 backdrop-blur-md">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>Email Notifications</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                      onChange={(e) => {
                        // In a real app, you would update user preferences in the database
                        toast.success(`Email notifications ${e.target.checked ? 'enabled' : 'disabled'}`);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span>Low Stock Alerts</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      defaultChecked
                      onChange={(e) => {
                        // In a real app, you would update user preferences in the database
                        toast.success(`Low stock alerts ${e.target.checked ? 'enabled' : 'disabled'}`);
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors"
                  onClick={() => toast.success('General settings saved successfully')}
                >
                  Save Settings
                </button>
              </CardContent>
            </Card>
          </SlideIn>
        </div>
      </div>
    </BaseLayout>
  );
};

export default SettingsClient;