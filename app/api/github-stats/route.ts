import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

interface SessionUser {
  githubUsername?: string;
  [key: string]: unknown;
}

interface RepoCommitCount {
  repo: string;
  commits: number;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const user = session.user as SessionUser;
    const githubUsername = user.githubUsername;
    const accessToken = (session as { accessToken?: string })?.accessToken;

    if (!githubUsername)
      return NextResponse.json({ error: 'GitHub username not found' }, { status: 400 });

    if (!accessToken)
      return NextResponse.json({ error: 'GitHub access token not found' }, { status: 400 });

    // Get user's repositories first
    const reposResponse = await fetch(
      'https://api.github.com/user/repos?per_page=100&sort=updated&type=all',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'performance-evaluation-engine',
        },
      }
    );

    if (!reposResponse.ok) {
      console.error('GitHub repos API error:', reposResponse.status, reposResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch GitHub repositories' },
        { status: reposResponse.status }
      );
    }

    const repos = await reposResponse.json();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const since = thirtyDaysAgo.toISOString();

    let totalCommits = 0;
    const repoCommitCounts: RepoCommitCount[] = [];

    const reposToCheck = repos.slice(0, 10);

    for (const repo of reposToCheck) {
      try {
        const commitsResponse = await fetch(
          `https://api.github.com/repos/${repo.full_name}/commits?author=${githubUsername}&since=${since}&per_page=100`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/vnd.github+json',
              'User-Agent': 'performance-evaluation-engine',
            },
          }
        );

        if (commitsResponse.ok) {
          const commits = await commitsResponse.json();
          const commitCount = commits.length;
          totalCommits += commitCount;
          
          if (commitCount > 0) {
            repoCommitCounts.push({
              repo: repo.name,
              commits: commitCount
            });
          }
          
        }
      } catch (error) {
        console.error(`Error fetching commits for ${repo.name}:`, error);
      }
    }

    return NextResponse.json({
      username: githubUsername,
      commits: totalCommits,
      totalRepos: repos.length,
      period: 'last 30 days',
      repoBreakdown: repoCommitCounts
    });

  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}