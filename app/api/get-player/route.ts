/* === GET ALL INFO ASSOCIATED WITH A USER'S CLASH ROYALE ACCOUNT === */

import { NextResponse } from 'next/server';
import { CLASH_API_BASE_URL } from '@/lib/constants';

export async function GET(request : Request) {

    // get user id from url
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({error: "Missing userId in parameters!"}, {status: 400});

    // get clash id from database
    const tempClashId = process.env.TEMP_CLASH_ID; // TODO: replace this with permanent solution
    if (!tempClashId) return NextResponse.json({error: "Missing ClashID Tag!"}, {status: 400});

    // forward to clash api 
    const res = await fetch(`${CLASH_API_BASE_URL}/players/${encodeURIComponent(tempClashId)}`, {
        headers: { Authorization: `Bearer ${process.env.CLASH_API_TOKEN}`}
    });

    const data = await res.json();

    return NextResponse.json(data);
}