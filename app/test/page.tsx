'use client';

import React, { JSX } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function TestPage(): JSX.Element {
    const { data: session } = useSession();

    return (
        <main
            style={{
                display: 'flex',
                minHeight: '100vh',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'system-ui, -apple-system, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial',
                flexDirection: 'column',
                gap: 12,
            }}
        >
            <h1>Hello World</h1>
            {session ? (
                <>
                    <div>Signed in as {session.user?.email ?? session.user?.name}</div>
                    <button onClick={() => signOut()}>Sign out</button>
                </>
            ) : (
                <button onClick={() => signIn('github')}>Sign in with GitHub</button>
            )}
        </main>
    );
}