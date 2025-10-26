/* === GET ALL INFO ASSOCIATED WITH A USER'S CLASH ROYALE ACCOUNT === */

import { NextResponse } from 'next/server';
import { CLASH_API_BASE_URL } from '@/lib/constants';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/backend/user';

export async function GET(request : Request) {

    // get user id from url
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({error: 'Missing userId in parameters!'}, {status: 400});

    let clashId;
    try {
        await dbConnect();

        const user = await User.findOne({ _id: userId });

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

    // forward to clash api 
    const res = await fetch(`${CLASH_API_BASE_URL}/players/${encodeURIComponent(clashId)}`, {
        headers: { Authorization: `Bearer ${process.env.CLASH_API_TOKEN}`}
    });

    const data = await res.json();

    return NextResponse.json(data);
}