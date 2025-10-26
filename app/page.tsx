'use client';

import React from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import NavBar from '@/components/NavBar';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  if (status === 'loading' || session) {
    return null;
  }

  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] text-clash-white p-8 font-text pt-[8vh]">
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-6xl w-full" style={{ display: 'flex', flexDirection: 'row', gap: '3rem', alignItems: 'center' }}>
            {/* ...existing code... */}
          </div>
        </div>
      </main>
    </>
  );
}