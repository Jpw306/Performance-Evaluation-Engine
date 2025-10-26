'use client';

import { useUser } from '../../lib/useUser';
import Image from 'next/image';
import { useState } from 'react';

export default function Profile() {
  const { user, loading, error, session } = useUser();
  const [clashRoyaleTag, setClashRoyaleTag] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');

  if (!session) {
    return (
      <div className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center bg-no-repeat flex justify-center items-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-clash-blue/50">
          <h2 className="headline text-3xl font-bold text-clash-gold drop-shadow-lg text-center">
            🔐 PLEASE SIGN IN
          </h2>
          <p className="text-clash-light text-center mt-4">Access your profile to continue</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center bg-no-repeat flex justify-center items-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-clash-blue/50">
          <h2 className="headline text-3xl font-bold text-clash-gold drop-shadow-lg text-center animate-pulse">
            ⚡ LOADING...
          </h2>
          <div className="w-16 h-1 bg-gradient-to-r from-clash-blue to-clash-gold mx-auto rounded-full mt-4 animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center bg-no-repeat flex justify-center items-center">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 bg-gradient-to-b from-red-900/95 to-slate-800/95 backdrop-blur-sm rounded-3xl p-8 border-2 border-red-500/50">
          <h2 className="headline text-3xl font-bold text-red-400 drop-shadow-lg text-center">
            ⚠️ ERROR
          </h2>
          <p className="text-clash-light text-center mt-4">Failed to load profile. Please refresh the page.</p>
        </div>
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
    
    try {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          githubUsername: user.githubUsername,
          name: user.name,
          photoIcon: user.photoIcon,
          clashRoyaleTag: tagToSave.trim()
        }),
      });

      if (response.ok) {
        setSuccess('Clash Royale tag updated successfully!');
        setClashRoyaleTag(''); // Clear the input since it's now saved
      } else {
        const errorData = await response.json();
        setSubmitError(errorData.error || 'Failed to update Clash Royale tag.');
      }
    } catch (error) {
      console.error('Error updating Clash Royale tag:', error);
      setSubmitError('Failed to update Clash Royale tag.');
    }
  };

  return (
    <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] bg-cover bg-center bg-no-repeat flex flex-col justify-center items-center p-4">
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Main content card */}
      <div className="relative z-10 bg-gradient-to-b from-slate-900/95 to-slate-800/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-md border-2 border-clash-blue/50">
        {/* Header with glow effect */}
        <div className="text-center mb-8">
          <h1 className="headline text-5xl font-bold mb-2 text-clash-gold drop-shadow-lg">
            PROFILE
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-clash-blue to-clash-gold mx-auto rounded-full"></div>
        </div>

        {/* Profile picture with enhanced styling */}
        <div className="relative mb-6">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-clash-blue to-clash-gold p-1">
            <Image
              src={user.photoIcon || 'https://via.placeholder.com/150'}
              alt={`${user.name}'s profile picture`}
              width={120}
              height={120}
              className="w-full h-full rounded-full object-cover bg-slate-800"
            />
          </div>
          {/* Glow effect behind profile picture */}
          <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-clash-blue/20 blur-xl -z-10"></div>
        </div>

        {/* User info */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-3 text-clash-light drop-shadow-md">{user.name}</h2>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-clash-blue/30">
            <p className="text-lg text-clash-gray">
              <span className="text-clash-blue font-semibold">@{user.githubUsername}</span>
            </p>
          </div>
        </div>

        {/* Form section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="clashRoyaleTag" className="block text-xl font-bold mb-3 text-clash-gold drop-shadow-sm">
              ⚔️ CLASH ROYALE TAG
            </label>
            <div className="relative">
              <input
                type="text"
                id="clashRoyaleTag"
                value={clashRoyaleTag || (user?.clashRoyaleTag || '')}
                onChange={(e) => setClashRoyaleTag(e.target.value)}
                className="w-full p-4 border-2 border-clash-blue/50 rounded-xl bg-slate-900/80 text-clash-light text-lg font-semibold focus:outline-none focus:border-clash-gold focus:ring-2 focus:ring-clash-gold/50 transition-all duration-300 placeholder-clash-gray/60"
                placeholder="#YOURTAG"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-clash-blue/10 to-clash-gold/10 pointer-events-none"></div>
            </div>
          </div>
          
          {/* Error and success messages */}
          {submitError && (
            <div className="bg-red-900/80 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-300 text-sm font-semibold">{submitError}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-900/80 border border-green-500/50 rounded-lg p-3">
              <p className="text-green-300 text-sm font-semibold">{success}</p>
            </div>
          )}
          
          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-clash-blue via-clash-gold to-clash-blue hover:from-clash-gold hover:via-clash-blue hover:to-clash-gold text-white font-bold text-xl rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 border-2 border-clash-gold/50 relative overflow-hidden group"
          >
            <span className="relative z-10 drop-shadow-lg">⚡ SAVE PROFILE ⚡</span>
            <div className="absolute inset-0 bg-gradient-to-r from-clash-gold/20 to-clash-blue/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          </button>
        </form>
      </div>
    </main>
  );
}