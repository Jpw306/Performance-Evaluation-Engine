import React from 'react';
import MainLayout from '../../layouts/MainLayout';

type Props = { 
  params: Promise<{ teamId: string }>;
};

export default async function TeamPage({ params }: Props) {
  const { teamId } = await params;
  return (
    <MainLayout>
      <div className="flex items-center justify-center h-[calc(100vh-8vh)]">
        <h1 className="text-2xl font-headline text-clash-gold">Team {teamId}</h1>
      </div>
    </MainLayout>
  );
}

