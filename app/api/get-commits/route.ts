import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

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

const getCommitCount = async (author: string, repositoryUrl: string, token: string) => {
  const commits: Commit[] = await fetchCommits(repositoryUrl, token);

  let commitCount = 0;

  commits.forEach(commit => {
    const commitAuthor = commit.author?.login;
    if (commitAuthor == author)
      commitCount++;
  });

  return commitCount;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const author = searchParams.get('author');
    const session = await getServerSession(authOptions);
    const repositoryUrl = searchParams.get('repositoryUrl');
    const token = searchParams.get('token');

    if (!author || !repositoryUrl || !token) {
      return NextResponse.json({ error: 'Missing author, repository URL, or token' }, { status: 400 });
    }

    const commitCounts = await getCommitCount(author, repositoryUrl, token);
    return NextResponse.json({ commitCount: commitCounts });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}