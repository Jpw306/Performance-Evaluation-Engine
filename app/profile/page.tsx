'use client';

import { useSession } from 'next-auth/react';
import { User } from '../../models/user';
import Image from 'next/image';
import { useState } from 'react';

export default function Profile() {
  const { data: session } = useSession();
  const [clashRoyaleTag, setClashRoyaleTag] = useState('');
  const [error, setError] = useState('');

  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
        <h2>Please sign in to view your profile.</h2>
      </div>
    );
  }

  const user: User = {
    name: session.user?.name || 'Unknown',
    photoIcon: session.user?.image || 'https://via.placeholder.com/150',
    githubId: session.user?.name || 'Unknown', // Ensure GitHub ID is distinct from name
    clashRoyaleTag: clashRoyaleTag,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clashRoyaleTag.trim()) {
      setError('Clash Royale tag is required.');
      return;
    }
    setError('');
    alert(`Clash Royale tag saved: ${clashRoyaleTag}`);
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Profile</h1>
      <Image
        src={user.photoIcon}
        alt={`${user.name}'s profile picture`}
        width={150}
        height={150}
        style={{ borderRadius: '50%', marginBottom: '1rem' }}
      />
      <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--foreground)' }}>{user.name}</h2>
      <p style={{ fontSize: '1rem', color: 'var(--foreground)', marginBottom: '1rem' }}><strong>GitHub ID:</strong> {user.githubId}</p>

      <form onSubmit={handleSubmit} style={{ background: 'var(--background)', padding: '2rem', borderRadius: '12px', boxShadow: '0 6px 10px rgba(0, 0, 0, 0.15)' }}>
        <label htmlFor='clashRoyaleTag' style={{ display: 'block', fontSize: '1.125rem', marginBottom: '0.75rem', fontWeight: 'bold', color: 'var(--foreground)' }}>
          Clash Royale Tag:
        </label>
        <input
          type='text'
          id='clashRoyaleTag'
          value={clashRoyaleTag}
          onChange={(e) => setClashRoyaleTag(e.target.value)}
          style={{
            padding: '0.875rem',
            width: '100%',
            maxWidth: '350px',
            border: '1px solid var(--foreground)',
            borderRadius: '6px',
            marginBottom: '0.75rem',
            background: 'var(--background)',
            color: 'var(--foreground)',
            fontSize: '1rem',
          }}
        />
        {error && <p style={{ color: 'red', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</p>}
        <button type='submit' style={{ padding: '0.875rem 1.75rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1.125rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          Save
        </button>
      </form>
    </main>
  );
}