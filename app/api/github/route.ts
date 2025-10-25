import { NextResponse } from 'next/server';

export async function GET() {
  const data = {
    username: "devnate",
    commits: 43,
    commitRate: 0.78,
  };
  return NextResponse.json(data);
}
