'use client';

import { useUser } from '../../lib/useUser';
import MainLayout from '../layouts/MainLayout';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Profile() {
  const { user, loading, error, session, updateClashRoyaleTag } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();
  
  // Use the user's existing tag as the default value
  const [clashRoyaleTag, setClashRoyaleTag] = useState('');

  // Redirect to root if not logged in (wait a bit for session to load)
  useEffect(() => {
    if (!loading && !session) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 1500); // Wait 1.5 seconds before redirecting
      
      return () => clearTimeout(timer);
    }
  }, [loading, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const tagToSubmit = clashRoyaleTag || user?.clashRoyaleTag || '';
    
    if (!tagToSubmit.trim()) {
      setSubmitError('Clash Royale tag is required.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const success = await updateClashRoyaleTag(tagToSubmit.trim());
    
    if (success) {
      // Redirect to dashboard on success
      router.push('/dashboard');
    } else {
      setSubmitError('Failed to update tag. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-clash-light font-clash text-lg bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center">
        Loading profile...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-clash-light font-clash text-lg bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-clash-gold mb-4">Error Loading Profile</h2>
          <p className="text-clash-light mb-4">{error || 'Failed to load user data'}</p>
          <button
            onClick={() => router.push('/')}
            className="clash-button"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center p-8 h-[calc(100vh-8vh)]">
        <div className="w-1/2 max-w-md">
        <div className="flex flex-col items-center mb-8">
          {/* User Avatar */}
          <div className="relative mb-4">
            <Image
              src={user.avatarUrl || '/avatars/ava.png'}
              alt={`${user.name}'s avatar`}
              width={100}
              height={100}
              className="rounded-full border-4 border-clash-gold shadow-lg"
            />
          </div>
          
          {/* User Name */}
          <h1 className="font-clash text-4xl uppercase tracking-tightest text-clash-gold mb-2 text-center">
            Welcome, {user.name}!
          </h1>
          
          <p className="text-clash-light text-center mb-8">
            Enter your Clash Royale tag to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <div>
            <label htmlFor="clashRoyaleTag" className="block text-clash-gold font-semibold mb-3 text-xl">
              Clash Royale Tag
            </label>
            <input
              type="text"
              id="clashRoyaleTag"
              value={clashRoyaleTag || user?.clashRoyaleTag || ''}
              onChange={(e) => setClashRoyaleTag(e.target.value)}
              className="w-full py-8 px-6 my-10 rounded-lg bg-clash-dark text-clash-light border-2 border-clash-blue focus:ring-2 focus:ring-clash-gold focus:outline-none placeholder-clash-gray text-xl"
              placeholder="#YourTag"
              disabled={isSubmitting}
            />
          </div>
          
          {submitError && (
            <p className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-500/30">
              {submitError}
            </p>
          )}
          
          <div className="pt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="clash-button w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Save Tag'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </MainLayout>
  );
}
