import { NextResponse } from 'next/server';

export async function GET() {
  const teams = [
    {
      id: 1,
      name: 'HackSquad',
      members: [
        { name: 'Nate', clashWins: 12, clashLosses: 5, commits: 15 },
        { name: 'Ava', clashWins: 8, clashLosses: 10, commits: 22 },
        { name: 'Leo', clashWins: 15, clashLosses: 3, commits: 10 },
      ],
    },
  ];
  return NextResponse.json(teams);
}
