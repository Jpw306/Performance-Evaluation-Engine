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
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const githubUsername = (session.user as SessionUser).githubUsername;
    const accessToken = (session as { accessToken?: string })?.accessToken;

    if (!githubUsername)
      return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    if (!accessToken)
      return NextResponse.json({ error: 'GitHub access token not found in session' }, { status: 400 });

    const { groupId } = await params;
    if (!groupId)
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });

    await dbConnect();
    const group = await Group.findById(groupId);
    if (!group)
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });

    if (!group.people.includes(githubUsername))
      return NextResponse.json({ error: 'Access denied. You are not a member of this group.' }, { status: 403 });

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

        try {
          if (user.clashRoyaleTag && user.clashRoyaleTag.trim()) {
            const clashRes = await fetch(
              `http://localhost:3000/api/get-player?userId=${encodeURIComponent(user.clashRoyaleTag)}`,
              { 
                headers: { 
                  'Content-Type': 'application/json',
                  'Cookie': request.headers.get('Cookie') || ''
                } 
              }
            );
            if (clashRes.ok) {
              const clashData = await clashRes.json();
              
              member.winRate = 0;
              
              if (typeof clashData.wins === 'number' && typeof clashData.losses === 'number') {
                const totalMatches = clashData.wins + clashData.losses;
                if (totalMatches > 0) {
                  member.winRate = parseFloat(((clashData.wins / totalMatches) * 100).toFixed(1));
                }
              }
              else if (typeof clashData.battleCount === 'number' && typeof clashData.wins === 'number') {
                if (clashData.battleCount > 0) {
                  member.winRate = parseFloat(((clashData.wins / clashData.battleCount) * 100).toFixed(1));
                }
              }
              else if (clashData.stats) {
                if (clashData.stats.wins && clashData.stats.losses) {
                  const totalMatches = clashData.stats.wins + clashData.stats.losses;
                  if (totalMatches > 0) {
                    member.winRate = parseFloat(((clashData.stats.wins / totalMatches) * 100).toFixed(1));
                  }
                }
              }
              else {
              }
              
            } else {
              member.winRate = 0;
            }
          } else {
            member.winRate = 0;
          }
        } catch (err) {
          member.winRate = 0;
        }

        try {
          if (group.repositoryUrl && group.repositoryUrl.trim()) {
            const commitRes = await fetch(
              `http://localhost:3000/api/get-commits?author=${encodeURIComponent(username)}&repositoryUrl=${encodeURIComponent(
                group.repositoryUrl
              )}&token=${encodeURIComponent(accessToken)}`
            );
            if (commitRes.ok) {
              const commitData = await commitRes.json();
              member.commits = commitData.commitCount || 0;
            } else {
              member.commits = 0;
            }
          } else {
            member.commits = 0;
          }
        } catch (err) {
          member.commits = 0;
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
