import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { apiChangePassword, apiUpdateProfile } from '../services/api';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setProfileLoading(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const updatedUser = await apiUpdateProfile({ name, email });
      updateUser(updatedUser);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      if (err instanceof Error) {
        setProfileMessage({ type: 'error', text: err.message });
      } else {
        setProfileMessage({ type: 'error', text: 'An unknown error occurred.' });
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== passwordConfirmation) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });

    try {
      const response = await apiChangePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: passwordConfirmation,
      });
      setPasswordMessage({ type: 'success', text: response.message });
      setCurrentPassword('');
      setNewPassword('');
      setPasswordConfirmation('');
    } catch (err) {
      if (err instanceof Error) {
        setPasswordMessage({ type: 'error', text: err.message });
      } else {
        setPasswordMessage({ type: 'error', text: 'An unknown error occurred.' });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  const Message: React.FC<{ message: { type: string; text: string } }> = ({ message }) => {
    if (!message.text) return null;
    const isError = message.type === 'error';
    const classes = isError ? 'text-red-500' : 'text-green-500';
    return <p className={`text-sm mt-2 ${classes}`}>{message.text}</p>;
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Information Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Profile Information</h2>
          <form onSubmit={handleProfileSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
                required
              />
            </div>
            <div className="flex items-center justify-between">
                <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <Message message={profileMessage} />
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Change Password</h2>
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="current_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
              <input
                type="password"
                id="current_password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
              <input
                type="password"
                id="new_password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
              <input
                type="password"
                id="password_confirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-800 dark:text-gray-200"
                required
              />
            </div>
            <div className="flex items-center justify-between">
                <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
                <Message message={passwordMessage} />
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;