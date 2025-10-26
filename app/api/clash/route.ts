import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    username: 'PlayerOne',
    trophies: 5200,
    winRate: 0.65,
    matchesPlayed: 200,
  };
  return NextResponse.json(data);
}
