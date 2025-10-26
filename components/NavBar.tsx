'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

export default function NavBar() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  const navigateLeaderboard = () => {
    router.push('/leaderboard');
  };

  const navigateDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <nav className='flex justify-center gap-6 text-neutral-300'>
      <span 
        onClick={navigateLeaderboard}
        className='hover:text-yellow-400 font-headline cursor-pointer'
      >
        Leaderboard&emsp;
      </span>
      <span 
        onClick={navigateDashboard}
        className='hover:text-yellow-400 font-headline cursor-pointer'
      >
        Dashboard&emsp;
      </span>
      <span 
        onClick={handleSignOut}
        className='hover:text-yellow-400 font-headline cursor-pointer'
      >
        Log Out
      </span>
    </nav>
  );
}
