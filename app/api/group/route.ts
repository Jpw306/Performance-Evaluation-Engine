import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { Group } from '../../../models/backend/group';
import { User } from '../../../models/backend/user';
import dbConnect from '../../../lib/mongodb';

interface SessionUser {
  githubUsername?: string;
  name?: string;
  email?: string;
  image?: string;
};

export async function POST(request: NextRequest)
{
  try
  {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const githubUsername = (session.user as SessionUser).githubUsername;
    
    if (!githubUsername)
      return NextResponse.json({ error: 'GitHub username not found in session' }, { status: 400 });

    const body = await request.json();
    const { repositoryUrl } = body;

    if (!repositoryUrl)
      return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });

    let repo: string;
    try
    {
      const url = new URL(repositoryUrl);
      if (url.hostname !== 'github.com')
        return NextResponse.json({ error: 'Only GitHub repositories are supported' }, { status: 400 });

      repo = url.pathname.slice(1);
      if (repo.endsWith('.git'))
        repo = repo.slice(0, -4);
    } catch
    {
      return NextResponse.json({ error: 'Invalid repository URL' }, { status: 400 });
    }

    await dbConnect();

    const newGroup = new Group({
      people: [githubUsername],
      repo: repo,
      createdBy: githubUsername,
      createdAt: new Date()
    });

    const savedGroup = await newGroup.save();

    await User.findOneAndUpdate(
      { githubUsername: githubUsername },
      { $addToSet: { groups: savedGroup._id } },
      { upsert: false }
    );

    return NextResponse.json({
      id: savedGroup._id,
      people: savedGroup.people,
      repo: savedGroup.repo,
      createdBy: savedGroup.createdBy,
      createdAt: savedGroup.createdAt
    });

  } catch (error)
  {
    console.error('Error creating group:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
