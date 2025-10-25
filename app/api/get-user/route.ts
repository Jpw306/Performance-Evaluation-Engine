/* === GET ALL INFO ASSOCIATED WITH A USER'S P.E.E. ACCOUNT === */

import { NextResponse } from 'next/server';

export async function GET(request : Request) {
     
    // get user id from params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({error: "Missing userId in parameters!"}, {status: 400});

    
}