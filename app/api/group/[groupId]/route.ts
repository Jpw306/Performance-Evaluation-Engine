import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { Group } from '../../../../models/backend/group';
import { User } from '../../../../models/backend/user';
import dbConnect from '../../../../lib/mongodb';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { groupId: string } }
) {
  try {
    // Authenticate
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const githubUsername = (session.user as SessionUser).githubUsername;
    const accessToken = (session as { accessToken?: string })?.accessToken;

    if (!githubUsername)
      return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    if (!accessToken)
      return NextResponse.json({ error: 'GitHub access token not found in session' }, { status: 400 });

    const { groupId } = await params; // ✅ await needed in Next 14 dynamic routes
    if (!groupId)
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });

    // Connect DB and find group
    await dbConnect();
    const group = await Group.findById(groupId);
    if (!group)
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    // Permission check
    if (!group.people.includes(githubUsername))
      return NextResponse.json({ error: 'Access denied. You are not a member of this group.' }, { status: 403 });

    // --- Enrich each member ---
    const members = await Promise.all(
      group.people.map(async (username: string) => {
        const user = await User.findOne({ githubUsername: username });
        if (!user) return null;

        const member = {
          id: user._id,
          name: user.name || username,
          photoIcon: user.avatarUrl || user.image || '/avatars/default.png',
          githubUsername: username,
          commits: 0,
          winRate: 0,
        };

        // --- Get Clash Data ---
        try {
          const clashRes = await fetch(
            `${process.env.NEXTAUTH_URL}/api/get-player?userId=${user.clashRoyaleTag}`,
            { headers: { 'Content-Type': 'application/json' } }
          );
          if (clashRes.ok) {
            const clashData = await clashRes.json();
            const totalMatches =
              clashData.battleCount || clashData.wins + clashData.losses || 0;
            const winRate =
              totalMatches > 0
                ? (clashData.wins || 0) / totalMatches
                : 0;
            member.winRate = winRate;
          }
        } catch (err) {
          console.warn(`Failed to fetch Clash data for ${username}:`, err);
        }

        // --- Get Commit Data ---
        try {
          const commitRes = await fetch(
            `${process.env.NEXTAUTH_URL}/api/get-commits?author=${username}&repositoryUrl=${encodeURIComponent(
              group.repositoryUrl
            )}&token=${accessToken}`
          );
          if (commitRes.ok) {
            const commitData = await commitRes.json();
            member.commits = commitData.commitCount || 0;
          }
        } catch (err) {
          console.warn(`Failed to fetch commits for ${username}:`, err);
        }

        return member;
      })
    );

    return NextResponse.json({
      id: group._id,
      name: group.name,
      repositoryUrl: group.repositoryUrl,
      createdBy: group.createdBy,
      createdAt: group.createdAt,
      members: members.filter(Boolean),
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
