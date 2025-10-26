'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';


export default function NavBar() {
  const router = useRouter();

  const mainNavItems = [
    { label: 'Leaderboard', onClick: () => router.push('/leaderboard') },
    { label: 'Dashboard', onClick: () => router.push('/dashboard') },
    { label: 'Deck Tutor', onClick: () => router.push('/deck_tutor') },
  ];

  return (
    <header className="w-full h-[12vh] clash-navbar">
      <nav
        aria-label="Main navigation"
        className="clash-nav-content"
      >
        <div className="clash-nav-group">
          {mainNavItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="nav-button"
              tabIndex={0}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="nav-button-red"
          tabIndex={0}
          type="button"
        >
          Log Out
        </button>
      </nav>
    </header>
  );
}
