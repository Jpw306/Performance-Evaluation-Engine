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
import { sliceAndTransform, transformBattleLogs } from "@/lib/clash_api_helper_functions";

export async function GET(request: Request) {
    // get user id from url
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({error: 'Missing userId in parameters!'}, {status: 400});

    // get clash id from database
    const tempClashId = process.env.TEMP_CLASH_ID; // TODO: replace this with permanent solution
    if (!tempClashId) return NextResponse.json({error: 'Missing ClashID Tag!'}, {status: 400});

    // forward to clash api - get user battlelog
    const res = await fetch(`${CLASH_API_BASE_URL}/players/${encodeURIComponent(tempClashId)}/battlelog`, {
        headers: { Authorization: `Bearer ${process.env.CLASH_API_TOKEN}`}
    });

    const data = await res.json();

    const parsedData = transformBattleLogs(data, tempClashId);

    const totalMatches = parsedData.length;
    const wins = parsedData.reduce((count, match) => count + (match.matchOutcome === 'Win' ? 1: 0), 0);
    const winRate = totalMatches === 0 ? 0 : wins / totalMatches;

    return NextResponse.json({response: `Winrate: ${winRate} for ${totalMatches} matches`}, {status: 200});
} 