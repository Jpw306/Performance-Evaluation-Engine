import { NextRequest, NextResponse } from 'next/server';
import { Group } from '../../../models/group';

interface Commit {
  author?: {
    login?: string;
  };
}

const fetchCommits = async (repo: string, token: string) => {

  const url = `https://api.github.com/repos/${repo}/commits`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
  };

  const response = await fetch(url, { headers });
  if (!response.ok)
    throw new Error(`Failed to fetch commits: ${response.statusText}`);

  return response.json();
};

const getCommitsByGroup = async (group: Group, token: string) => {

    const commits: Commit[] = await fetchCommits(group.repositoryUrl, token);

    const commitCounts: Record<string, number> = {};
    group.people.forEach(person => commitCounts[person] = 0);

    commits.forEach(commit => {
        const author = commit.author?.login;
        if (author && commitCounts[author] !== undefined)
            commitCounts[author]++;
    });

  return commitCounts;
};

export async function POST(request: NextRequest)
{
  try
  {
    const body = await request.json();
    const { group, token } = body;

    if (!group || !token)
      return NextResponse.json({ error: 'Missing group or token' }, { status: 400 });

    const commitCounts = await getCommitsByGroup(group, token);
    return NextResponse.json(commitCounts);
  } catch (error)
  {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
