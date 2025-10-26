/* eslint-disable @typescript-eslint/no-explicit-any */

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export interface UserData {
    id: string;
    name: string;
    photoIcon: string;
    githubUsername: string;
    clashRoyaleTag: string;
    groups: string[]; // Array of group IDs
    pendingInvitations: string[]; // Array of invitation IDs
};

export function useUser() {

    const { data: session } = useSession();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const accessToken = (session as any)?.accessToken;

    const fetchUser = async (githubUsername: string) => {
        setLoading(true);
        setError(null);
    
        try {
            const response = await fetch(`/api/user?githubUsername=${githubUsername}`);
        
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
            fetchUser(githubUsername);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

  const createUserFromSession = async () => {

    if (!session?.user)
        return;

    const githubUsername = (session.user as any).githubUsername;

    try
    {
        const response = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                githubUsername: githubUsername,
                name: session.user.name,
                photoIcon: session.user.image,
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
          photoIcon: user.photoIcon,
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
    session,
    accessToken,
  };
};