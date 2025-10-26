import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
}

interface GitHubEvent {
  type: string;
  payload?: {
    commits?: Array<{
      author: {
        name: string;
        email: string;
      };
    }>;
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    const githubUsername = user.githubUsername;
    const accessToken = (session as { accessToken?: string })?.accessToken;

    if (!githubUsername) {
      return NextResponse.json({ error: 'GitHub username not found' }, { status: 400 });
    }

    if (!accessToken) {
      return NextResponse.json({ error: 'GitHub access token not found' }, { status: 400 });
    }

    // Fetch user's public events to count commits
    const eventsResponse = await fetch(
      `https://api.github.com/users/${githubUsername}/events/public?per_page=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'performance-evaluation-engine',
        },
      }
    );

    if (!eventsResponse.ok) {
      console.error('GitHub API error:', eventsResponse.status, eventsResponse.statusText);
      return NextResponse.json(
        { error: 'Failed to fetch GitHub data' },
        { status: eventsResponse.status }
      );
    }

    const events: GitHubEvent[] = await eventsResponse.json();
    
    // Count commits from push events in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let recentCommits = 0;
    
    events.forEach(event => {
      if (event.type === 'PushEvent' && event.payload?.commits) {
        recentCommits += event.payload.commits.length;
      }
    });

    // Also try to get total public repositories count
    const userResponse = await fetch(
      `https://api.github.com/users/${githubUsername}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'performance-evaluation-engine',
        },
      }
    );

    let totalRepos = 0;
    if (userResponse.ok) {
      const userData = await userResponse.json();
      totalRepos = userData.public_repos || 0;
    }

    return NextResponse.json({
      username: githubUsername,
      commits: recentCommits,
      totalRepos: totalRepos,
      period: 'last 30 days'
    });

  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}