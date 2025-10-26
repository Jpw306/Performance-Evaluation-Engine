'use client';

import { useUser } from '../../lib/useUser';
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
      <div className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
        <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-clash-blue/50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-clash-gold mb-4"></div>
            <h2 className="text-xl font-bold text-clash-light">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center">
        <div className="bg-gradient-to-b from-red-900/95 to-slate-800/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-red-500/50">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">Error Loading Profile</h2>
            <p className="text-clash-light mb-4">{error || 'Failed to load user data'}</p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-gradient-to-r from-clash-blue to-clash-gold text-white font-bold rounded-lg hover:scale-105 transform transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 w-full max-w-md border border-clash-blue/50">
        <div className="flex flex-col items-center mb-6">
          {/* User Avatar */}
          <div className="relative mb-4">
            <Image
              src={user.photoIcon || '/avatars/ava.png'}
              alt={`${user.name}'s avatar`}
              width={100}
              height={100}
              className="rounded-full border-4 border-clash-gold shadow-lg"
            />
          </div>
          
          {/* User Name */}
          <h1 className="text-2xl font-bold text-clash-light mb-2">
            Welcome, {user.name}!
          </h1>
          
          <p className="text-clash-gold text-sm text-center">
            Enter your Clash Royale tag to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clashRoyaleTag" className="block text-clash-gold font-semibold mb-2">
              Clash Royale Tag
            </label>
            <input
              type="text"
              id="clashRoyaleTag"
              value={clashRoyaleTag || user?.clashRoyaleTag || ''}
              onChange={(e) => setClashRoyaleTag(e.target.value)}
              className="w-full p-3 rounded-lg bg-slate-800 text-clash-light border border-clash-blue focus:ring-2 focus:ring-clash-gold focus:outline-none placeholder-slate-400"
              placeholder="#YourTag"
              disabled={isSubmitting}
            />
          </div>
          
          {submitError && (
            <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded-lg border border-red-500/30">
              {submitError}
            </p>
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-clash-blue to-clash-gold text-white font-bold rounded-lg hover:scale-105 transform transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isSubmitting ? 'Updating...' : 'Save Clash Royale Tag'}
          </button>
        </form>
      </div>
    </div>
  );
}
