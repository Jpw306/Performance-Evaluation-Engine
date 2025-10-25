'use client';

import { useUser } from '../../lib/useUser';
import Image from 'next/image';
import { useState } from 'react';

export default function Profile() {
  const { user, loading, error, updateClashRoyaleTag, session } = useUser();
  const [clashRoyaleTag, setClashRoyaleTag] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');

  if (!session) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Please sign in to view your profile.</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Loading...</h2>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Error loading profile. Please try refreshing the page.</h2>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagToSave = clashRoyaleTag || (user?.clashRoyaleTag || '');
    
    if (!tagToSave.trim()) {
      setSubmitError('Clash Royale tag is required.');
      return;
    }
    
    setSubmitError('');
    setSuccess('');
    
    const updated = await updateClashRoyaleTag(tagToSave);
    if (updated) {
      setSuccess('Clash Royale tag updated successfully!');
    } else {
      setSubmitError('Failed to update Clash Royale tag.');
    }
  };

  return (
    <main className="p-8 max-w-lg mx-auto text-center bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col justify-center items-center">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">Profile</h1>
        <Image
          src={user.photoIcon || 'https://via.placeholder.com/150'}
          alt={`${user.name}'s profile picture`}
          width={150}
          height={150}
          className="rounded-full mb-6 mx-auto border-4 border-blue-500 shadow-lg"
        />
        <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{user.name}</h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
          <strong className="text-blue-600 dark:text-blue-400">GitHub Username:</strong> {user.githubUsername}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clashRoyaleTag" className="block text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              Clash Royale Tag:
            </label>
            <input
              type="text"
              id="clashRoyaleTag"
              value={clashRoyaleTag || (user?.clashRoyaleTag || '')}
              onChange={(e) => setClashRoyaleTag(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter your tag"
            />
          </div>
          {submitError && <p className="text-red-500 text-sm">{submitError}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200"
          >
            Save
          </button>
        </form>
      </div>
    </main>
  );
}