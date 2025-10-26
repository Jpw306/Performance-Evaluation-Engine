import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import authOptions from '@/lib/auth';
import { Group } from '../../../../models/backend/group';
import { User } from '../../../../models/backend/user';
import dbConnect from '../../../../lib/mongodb';

export async function GET(request: Request) {
  try {
    // optional: can remove this if you want public leaderboard
    const session = await getServerSession(authOptions);
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const accessToken = (session as { accessToken?: string })?.accessToken;
    if (!accessToken)
      return NextResponse.json({ error: 'GitHub access token not found in session' }, { status: 400 });

    await dbConnect();
    const groups = await Group.find();

    if (!groups || groups.length === 0)
      return NextResponse.json({ leaderboard: [] });

    const leaderboard = await Promise.all(
      groups.map(async (group) => {
        try {
          // gather members
          const members = await Promise.all(
            group.people.map(async (username: string) => {
              const user = await User.findOne({ githubUsername: username });
              if (!user) return null;

              const member = {
                id: user._id,
                name: user.name || username,
                githubUsername: username,
                commits: 0,
                winRate: 0,
              };

              // --- Clash Royale stats ---
              try {
                if (user.clashRoyaleTag) {
                  const clashRes = await fetch(
                    `http://localhost:3000/api/get-player?userId=${encodeURIComponent(
                      user.clashRoyaleTag
                    )}`,
                    {
                      headers: {
                        'Content-Type': 'application/json',
                        Cookie: request.headers.get('Cookie') || '',
                      },
                    }
                  );
                  if (clashRes.ok) {
                    const clashData = await clashRes.json();
                    const wins = clashData.wins ?? clashData.stats?.wins ?? 0;
                    const losses = clashData.losses ?? clashData.stats?.losses ?? 0;
                    const total = wins + losses;
                    if (total > 0) member.winRate = parseFloat(((wins / total) * 100).toFixed(1));
                  }
                }
              } catch (err) {
                member.winRate = 0;
              }

              // --- GitHub commit stats ---
              try {
                if (group.repositoryUrl && group.repositoryUrl.trim()) {
                  const commitRes = await fetch(
                    `http://localhost:3000/api/get-commits?author=${encodeURIComponent(
                      username
                    )}&repositoryUrl=${encodeURIComponent(
                      group.repositoryUrl
                    )}&token=${encodeURIComponent(accessToken)}`
                  );
                  if (commitRes.ok) {
                    const commitData = await commitRes.json();
                    member.commits = commitData.commitCount || 0;
                  }
                }
              } catch (err) {
                member.commits = 0;
              }

              return member;
            })
          );

          const validMembers = members.filter(Boolean);
          if (validMembers.length === 0)
            return {
              id: group._id.toString(),
              name: group.name,
              avgCommits: 0,
              avgWinRate: 0,
              score: 0,
            };

          const avgCommits =
            validMembers.reduce((sum, m: any) => sum + m.commits, 0) / validMembers.length;

          const avgWinRate =
            validMembers.reduce((sum, m: any) => sum + m.winRate, 0) / validMembers.length;

          // Weight both evenly for now — can tweak as needed
          const score = avgCommits / 100 + avgWinRate;

          return {
            id: group._id.toString(),
            name: group.name,
            avgCommits: parseFloat(avgCommits.toFixed(1)),
            avgWinRate: parseFloat(avgWinRate.toFixed(1)),
            score: parseFloat(score.toFixed(2)),
          };
        } catch (error) {
          console.error('Error computing group:', error);
          return null;
        }
      })
    );

    const sorted = leaderboard
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score);

    return NextResponse.json({ leaderboard: sorted });
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
