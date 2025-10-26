'use client';

import React from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  // Don't render anything if loading or if user is logged in (redirecting)
  if (status === 'loading' || session) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] text-clash-white p-8 font-text">
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-6xl w-full" style={{ display: 'flex', flexDirection: 'row', gap: '3rem', alignItems: 'center' }}>
          
          {/* Left Side - Login Section (Smaller) */}
          <div style={{ width: '40%' }} className="text-center space-y-6">
            <div className="space-y-2">
              <div className="text-4xl font-headline text-supercell-yellow">
                🏆 Battle Arena 🏆
              </div>
              <div className="text-lg text-clash-white/80">
                Ready to prove your worth?
              </div>
            </div>
            <div>
              <button 
                onClick={() => signIn('github')}
                className="clash-button"
              >
                Enter with GitHub
              </button>
            </div>
          </div>

          {/* Right Side - App Explanation (Larger) */}
          <div style={{ width: '60%' }} className="space-y-6 text-clash-white/90">
            <div>
              <h3 className="text-2xl font-headline text-supercell-blue mb-4">
                What is Battle Arena?
              </h3>
              <p className="text-lg leading-relaxed">
                The ultimate performance evaluation engine that combines your coding prowess with your Clash Royale mastery! 
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💻</span>
                <div>
                  <h4 className="font-headline text-supercell-yellow">Track Your Code</h4>
                  <p>Monitor GitHub commits and showcase your development skills</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">⚔️</span>
                <div>
                  <h4 className="font-headline text-supercell-yellow">Battle Stats</h4>
                  <p>Connect your Clash Royale tag and display your win rate</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <h4 className="font-headline text-supercell-yellow">Compete & Rank</h4>
                  <p>Rise through leaderboards based on your combined performance</p>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}