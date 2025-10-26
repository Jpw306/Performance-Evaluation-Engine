'use client';

import React, { JSX } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

import NavBar from '@/components/NavBar';

export default function TestPage(): JSX.Element {
        const { data: session } = useSession();

        return (
            <>
                <NavBar />
                <main className="min-h-screen bg-[url('/backgrounds/ClashBackground.png')] text-clash-white font-text pt-[8vh] flex flex-col items-center justify-center gap-12">
                    <h1 className="font-headline text-3xl text-clash-gold">Hello World</h1>
                    {session ? (
                        <>
                            <div>Signed in as {session.user?.email ?? session.user?.name}</div>
                            <button className="clash-button mt-4" onClick={() => signOut()}>Sign out</button>
                        </>
                    ) : (
                        <button className="clash-button mt-4" onClick={() => signIn('github')}>Sign in with GitHub</button>
                    )}
                </main>
            </>
        );
}