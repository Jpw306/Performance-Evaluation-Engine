
import { NextResponse } from 'next/server';
import { CLASH_API_BASE_URL } from '@/lib/constants';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models/backend/user';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
};

export async function GET(request : Request) {

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

    const res = await fetch(`${CLASH_API_BASE_URL}/players/${encodeURIComponent(clashId)}`, {
        headers: { Authorization: `Bearer ${process.env.CLASH_API_TOKEN}`}
    });

    const data = await res.json();

    return NextResponse.json(data);
}