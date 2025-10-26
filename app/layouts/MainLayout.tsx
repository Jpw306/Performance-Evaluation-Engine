'use client';

import NavBar from '@/components/NavBar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] text-clash-white font-text">
      <div className="min-h-screen bg-gradient-to-b from-clash-dark/95 to-clash-black/95">
        <NavBar />
        <main className="w-full mt-4">
          {children}
        </main>
      </div>
    </div>
  );
}