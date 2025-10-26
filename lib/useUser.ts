/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { UserLogin } from '@/models/user';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function useUser() {

    const { data: session } = useSession();
    const [user, setUser] = useState<UserLogin | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const accessToken = (session as any)?.accessToken;

    const fetchUser = async () => {
        setLoading(true);
        setError(null);
    
        try {
            const response = await fetch('/api/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    githubUsername: (session!.user as any).githubUsername,
                    name: session!.user!.name,
                    avatarUrl: session!.user!.image,
                })
            });
        
            if (response.ok)
                setUser(await response.json());
            else if (response.status === 404)
                await createUserFromSession();
            else
                setError('Failed to fetch user data');

        } catch {
            setError('Error fetching user data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const githubUsername = (session?.user as any)?.githubUsername;
        if(githubUsername)
            fetchUser();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

  const createUserFromSession = async () => {

    if (!session?.user)
        return;

    try
    {
        const response = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                githubUsername: (session.user as any).githubUsername,
                name: session.user.name,
                avatarUrl: session.user.image,
            }),
        });

        if (response.ok)
            setUser(await response.json());
        else
            setError('Failed to create user');
    } catch
    {
      setError('Error creating user');
    }
  };

  const updateClashRoyaleTag = async (newTag: string) => {
    if (!user)
        return false;

    try
    {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubUsername: user.githubUsername,
          name: user.name,
          avatarUrl: user.avatarUrl,
          clashRoyaleTag: newTag,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);

        return true;
      }
    } catch
    {
      setError('Error updating Clash Royale tag');
    }
    return false;
  };

  return {
    user,
    loading,
    error,
    updateClashRoyaleTag,
    refetchUser: fetchUser,
    session,
    accessToken,
  };
};