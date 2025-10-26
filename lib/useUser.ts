import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export interface UserData {
    id: string;
    name: string;
    photoIcon: string;
    githubUsername: string;
    clashRoyaleTag: string;
}

interface ExtendedUser {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    githubUsername?: string;
}

export function useUser() {

    const { data: session } = useSession();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        const extendedUser = session?.user as ExtendedUser;
        if(extendedUser?.githubUsername)
            fetchUser(extendedUser.githubUsername);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

  const createUserFromSession = async () => {
    if (!session?.user)
        return;

    const extendedUser = session.user as ExtendedUser;

    try
    {
        const response = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                githubUsername: extendedUser.githubUsername,
                name: extendedUser.name,
                photoIcon: extendedUser.image,
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

    try {
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
    } catch {
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
  };
}