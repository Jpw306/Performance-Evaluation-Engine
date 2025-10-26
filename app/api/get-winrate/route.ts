/*
    GET Request
    Takes global userId as a parameter
    Fetches ClashID from Atlas
    Gets match history from all available matches
    Calculates win rate over that time
    Returns win rate as a number between 0 and 1
*/

import { NextResponse } from "next/server";
import { CLASH_API_BASE_URL } from "@/lib/constants";
import { transformBattleLogs } from "@/lib/clash_api_helper_functions";
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/backend/user';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
};

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user)
          return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    
    const githubUsername = (session.user as SessionUser).githubUsername;

    if (!githubUsername)
          return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    let clashId;
        try {
            await dbConnect();
    
            const user = await User.findOne({ githubUsername: githubUsername });
    
            if (!user) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                );
            }
    
            clashId = user.clashRoyaleTag;
        } catch (error) {
            console.error('Err fetching user:', error);
            return NextResponse.json(
                    { error: 'Internal server error' },
                    { status: 500 }
            );
        }
            
    if (!clashId) return NextResponse.json({error: 'Missing ClashID Tag!'}, {status: 400});

    // forward to clash api - get user battlelog
    const res = await fetch(`${CLASH_API_BASE_URL}/players/${encodeURIComponent(clashId)}/battlelog`, {
        headers: { Authorization: `Bearer ${process.env.CLASH_API_TOKEN}`}
    });

    const data = await res.json();

    const parsedData = transformBattleLogs(data, clashId);

    const totalMatches = parsedData.length;
    const wins = parsedData.reduce((count, match) => count + (match.matchOutcome === 'Win' ? 1: 0), 0);
    const winRate = totalMatches === 0 ? 0 : wins / totalMatches;

    return NextResponse.json({response: `Winrate: ${winRate} for ${totalMatches} matches`}, {status: 200});
} 