'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function NavBar() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };
  const navigateHome = () => {
    signOut({ callbackUrl: '/home' });
  };
  const navigateLeaderboard = () => {
    signOut({ callbackUrl: '/leaderboard' });
  };
  const navigateDashboard = () => {
    signOut({ callbackUrl: '/dashboard' });
  };  

  return (
    <nav className='flex justify-center gap-6 text-neutral-300'>
      <span 
        onClick={navigateHome}
        className='hover:text-yellow-400 font-headline cursor-pointer'
      >
        Compass&emsp;
      </span>
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
